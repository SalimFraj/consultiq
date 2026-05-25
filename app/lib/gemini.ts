import { Content, GoogleGenAI, Type } from "@google/genai";
import { MAX_TOOL_CALLS, MODEL, WORKFLOW_SECTIONS } from "./constants";
import { GROQ_MODEL, synthesizeWithGroq } from "./groq";
import { createDeterministicToolPlan, firstToolResult } from "./toolPlan";
import { runTool, toolLabels, type ToolName } from "./tools";
import type { ChatApiResponse, ChatMode, ClientMessage, ToolEvent } from "./types";


const functionDeclarations: Array<Record<string, unknown>> = [
  {
    name: "search_knowledge_base",
    description:
      "Searches the approved local knowledge base for internal enterprise policy, governance, delivery, security, expense, billing, and onboarding guidance.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: "The natural-language query to search for in the local knowledge base."
        }
      },
      required: ["query"]
    }
  },
  {
    name: "get_project_status",
    description:
      "Retrieves fake but realistic project status data from the local project register. Accepts a project ID or project name.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        project_id: {
          type: Type.STRING,
          description: "The project ID or project name, such as PRJ-2847 or Project Northstar."
        }
      },
      required: ["project_id"]
    }
  },
  {
    name: "check_compliance",
    description:
      "Checks a described action against deterministic local compliance rules and returns allowed, review required, or not allowed with rule rationale.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        action: {
          type: Type.STRING,
          description: "The proposed action to assess for compliance."
        }
      },
      required: ["action"]
    }
  },
  {
    name: "generate_document",
    description:
      "Generates a structured markdown document draft such as a status update, risk summary, meeting agenda, client brief, or AI Lab prototype brief.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        type: {
          type: Type.STRING,
          description: "The document type to generate."
        },
        context: {
          type: Type.STRING,
          description: "The relevant context, retrieved facts, and instructions for the document."
        }
      },
      required: ["type", "context"]
    }
  },
  {
    name: "design_agentic_workflow",
    description:
      "Designs a governed agentic workflow proposal from a messy business problem using local workflow patterns and AI Lab intake structure.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        problem: {
          type: Type.STRING,
          description: "The messy internal business problem or process pain point to redesign."
        }
      },
      required: ["problem"]
    }
  }
];

function systemInstruction(mode: ChatMode) {
  const base = `You are ConsultIQ, an enterprise AI Builder Workbench for a consulting firm AI Lab.
You help internal teams turn messy operational problems into governed, reusable agentic capabilities.
Use tools for factual project, policy, compliance, document, and workflow-pattern information.
Do not make up project data, compliance verdicts, policies, owners, or dates. Cite the tool names and source titles or rule IDs when material facts come from tools.
Compliance verdicts are deterministic tool outputs. You may explain them, but you must not override or soften them.
Flag uncertainty clearly when local tools do not contain enough information.
All content is fake portfolio-demo data and must not imply access to a real firm, real clients, or proprietary systems.
Keep answers structured, professional, and implementation-oriented.`;

  if (mode === "workflow") {
    return `${base}
For Workflow Builder Mode, you are producing an AI Lab prototype brief, not a partial answer.
Always start the final answer with "# AI Lab Prototype Brief".
Always include every section in this exact order:
${WORKFLOW_SECTIONS.map((section) => `- ${section}`).join("\n")}
For messy workflow-design requests, call design_agentic_workflow and check_compliance before finalizing. Use generate_document when the user asks for a brief, draft, or prototype artifact.
If the brief references internal guidelines, delivery expectations, communication policy, production readiness, or knowledge-base guidance, call search_knowledge_base before finalizing.
Do not cite a tool that was not actually called in the current response.
Do not paste the raw generate_document tool result as "Context", "Working Draft", or "Review Status"; use it only as a document contract/scaffold.
Do not start at compliance or omit current-state/proposed workflow sections.`;
  }

  return base;
}

function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.length / 4));
}

function toGeminiContents(messages: ClientMessage[]) {
  return messages.slice(-20).map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }]
  }));
}

function extractText(response: unknown): string {
  const candidate = response as {
    text?: string;
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  if (candidate.text) return candidate.text;
  return (
    candidate.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join("\n") ?? ""
  );
}

function extractFunctionCalls(response: unknown): Array<{ name: string; args: Record<string, unknown> }> {
  const candidate = response as {
    functionCalls?: Array<{ name?: string; args?: Record<string, unknown> }>;
    candidates?: Array<{ content?: { parts?: Array<{ functionCall?: { name?: string; args?: Record<string, unknown> } }> } }>;
  };

  const directCalls =
    candidate.functionCalls
      ?.filter((call): call is { name: string; args: Record<string, unknown> } => Boolean(call.name))
      .map((call) => ({ name: call.name, args: call.args ?? {} })) ?? [];

  if (directCalls.length > 0) return directCalls;

  return (
    candidate.candidates?.[0]?.content?.parts
      ?.map((part) => part.functionCall)
      .filter((call): call is { name: string; args?: Record<string, unknown> } => Boolean(call?.name))
      .map((call) => ({ name: call.name, args: call.args ?? {} })) ?? []
  );
}

function detectFlags(message: string, toolEvents: ToolEvent[]) {
  const lower = message.toLowerCase();
  const resultText = JSON.stringify(toolEvents.map((event) => event.result)).toLowerCase();
  return {
    uncertainty: lower.includes("uncertain") || lower.includes("not enough information") || lower.includes("no exact"),
    complianceWarning:
      lower.includes("compliance") ||
      resultText.includes("review required") ||
      resultText.includes("not allowed"),
    humanReviewRequired:
      lower.includes("human review") ||
      lower.includes("review required") ||
      resultText.includes("review required") ||
      resultText.includes("not allowed")
  };
}

function missingWorkflowSections(message: string) {
  const lower = message.toLowerCase();
  return WORKFLOW_SECTIONS.filter((section) => !lower.includes(section.toLowerCase()));
}

function needsWorkflowRewrite(mode: ChatMode, message: string) {
  if (mode !== "workflow") return false;
  if (!message.toLowerCase().includes("ai lab prototype brief")) return true;
  return missingWorkflowSections(message).length > 0;
}

function sanitizeUncalledToolCitations(message: string, toolEvents: ToolEvent[]) {
  const usedTools = new Set(toolEvents.map((event) => event.name));
  const toolNames = [
    "search_knowledge_base",
    "get_project_status",
    "check_compliance",
    "generate_document",
    "design_agentic_workflow"
  ];

  return toolNames.reduce((current, toolName) => {
    if (usedTools.has(toolName)) return current;
    return current
      .replace(new RegExp(`\\s*\\(Source:\\s*\`?${toolName}\`?[^)]*\\)`, "gi"), "")
      .replace(new RegExp(`Source:\\s*\`?${toolName}\`?`, "gi"), "Recommended capability")
      .replace(new RegExp(`\`${toolName}\``, "g"), toolName.replaceAll("_", " "));
  }, message);
}

function complianceResult(toolEvents: ToolEvent[]) {
  return toolEvents.find((event) => event.name === "check_compliance")?.result as
    | { verdict?: string; reasoning?: string; escalation?: string }
    | undefined;
}

function enforceComplianceVerdict(message: string, toolEvents: ToolEvent[]) {
  const compliance = complianceResult(toolEvents);
  if (!compliance?.verdict) return message;

  const assessment = `## Compliance/Risk Assessment
Verdict: ${compliance.verdict}.

${compliance.reasoning ?? "The deterministic compliance tool returned this verdict from local static rules."}

Escalation: ${compliance.escalation ?? "Route to the relevant owner before proceeding when review is required."}`;

  if (/## Compliance\/Risk Assessment[\s\S]*?(?=\n## |$)/.test(message)) {
    return message.replace(/## Compliance\/Risk Assessment[\s\S]*?(?=\n## |$)/, assessment);
  }

  return `${message.trim()}

${assessment}`;
}

function isQuotaError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("Quota exceeded") ||
    message.includes("429") ||
    message.toLowerCase().includes("rate limit")
  );
}

function demoResponse(messages: ClientMessage[], mode: ChatMode, startedAt: number): ChatApiResponse {
  const prompt = messages[messages.length - 1]?.content ?? "";
  const plan = createDeterministicToolPlan(prompt, mode);
  const toolEvents = plan.toolEvents;
  let message = "";

  if (plan.scenario === "workflow") {
    message = `# AI Lab Prototype Brief

## Problem Summary
Engagement teams spend too much time preparing weekly client updates from scattered notes, status trackers, and risk logs. The opportunity is to convert that manual reporting cycle into a governed AI-assisted workflow that drafts updates, surfaces risks, and routes client-facing content for human approval.

## Current-State Workflow
1. Consultants collect accomplishments, blockers, decisions, and risk updates from fragmented sources.
2. A project lead reconciles inconsistent notes into a weekly status narrative.
3. The draft is reviewed by the engagement owner, often after avoidable rework.
4. Client-ready language is finalized manually and sent through the normal communication path.

## Pain Points and Bottlenecks
1. Manual synthesis consumes delivery time every week.
2. Risk changes can be missed when logs and notes are not reconciled.
3. Status language varies by author, making updates less consistent.
4. Review happens late instead of being designed into the workflow.

## Proposed Agentic Workflow
Use a supervised Engagement Status Reporting Agent that gathers approved project inputs, summarizes accomplishments and blockers, flags risk movement, checks communication and confidentiality rules, drafts the update, and routes it to the engagement owner for approval.

## Required Tools/Data Sources
1. Local knowledge search
2. Project status lookup
3. Compliance rule checker
4. Markdown document generator
5. Approved project notes and risk log inputs

## Human-in-the-Loop Approval Points
1. Engagement-owner review before client-facing use
2. Risk escalation decision when high-severity items are detected
3. Compliance review when confidential data, client financials, or external sharing is involved

## Autonomy Level
Supervised draft and recommendation. The agent should not send messages or alter records directly.

## Compliance/Risk Assessment
Review required. Client-facing AI-assisted deliverables require engagement-owner approval, and automations with access to restricted data sources require role-based access, audit logging, and a rollback path.

## MVP Prototype Scope
Build a single-engagement prototype that ingests fake status notes and a fake risk log, generates a weekly update draft, displays tool usage, flags review requirements, and records an approval-ready markdown output.

## Evaluation Checklist
1. Calls workflow, knowledge, compliance, and document tools for the right reasons
2. Uses only provided project facts and fake local data
3. Flags risks and review requirements clearly
4. Preserves deterministic compliance verdicts
5. Produces a complete prototype brief with no missing sections

## Production-Readiness Checklist
1. Tool contracts
2. Access controls
3. Logging and monitoring
4. Evals
5. Human escalation path
6. Prompt and tool-version tracking
7. Data retention and incident response owner`;
  } else if (plan.scenario === "project_status") {
    const projectResult = firstToolResult<{
      found?: boolean;
      requested_project?: string;
      available_projects?: Array<{ id: string; name: string; client: string }>;
      project?: {
        name?: string;
        client?: string;
        phase?: string;
        risk_level?: string;
        owner?: string;
        next_milestone?: string;
      };
    }>(plan, "get_project_status");

    if (projectResult?.found && projectResult.project) {
      const project = projectResult.project;
      message = `# ${project.name ?? "Project"} Status

${project.name ?? "The requested project"} is active for ${project.client ?? "the listed client"}. The local project register reports ${project.risk_level ?? "unknown"} risk, owned by ${project.owner ?? "the listed owner"}, with the next milestone: ${project.next_milestone ?? "not available"}.

## Status Format
Using the local Project Status Template, a client-ready update should include accomplishments, current phase, schedule health, risks and mitigations, decisions required, next milestone, and owner actions.

Human review is required before sending this as a client-facing status update.`;
    } else {
      const options =
        projectResult?.available_projects?.map((project) => `- ${project.name} (${project.id}) for ${project.client}`).join("\n") ??
        "- No local project options were available.";
      message = `# Project Lookup

I could not find an exact local project match for "${projectResult?.requested_project ?? prompt}". The prototype should not invent project status, owners, dates, or risks when the project register does not contain the requested engagement.

## Available Local Projects
${options}

## Review Status
Ask the project owner to confirm the correct project ID before drafting a client-facing update.`;
    }
  } else if (plan.scenario === "compliance") {
    const compliance = firstToolResult<{ verdict?: string; reasoning?: string; escalation?: string }>(
      plan,
      "check_compliance"
    );
    message = `# Compliance Assessment

Verdict: ${compliance?.verdict ?? "review required"}.

${compliance?.reasoning ?? "The deterministic compliance rules require review when the data class, tool approval status, or external sharing path is unclear."}

Escalation: ${compliance?.escalation ?? "Route to the engagement owner and relevant risk/compliance reviewer before proceeding."}`;
  } else if (plan.scenario === "document") {
    message = `# Risk Summary Draft

## Executive View
The engagement should be framed around delivery risk, data/control risk, stakeholder adoption risk, and client communication risk.

## Key Risks
- Delivery risk: milestones may slip if blockers and decision owners are not visible.
- Data/control risk: sensitive client data requires approved handling and review before external use.
- Adoption risk: process changes need named owners and a clear cadence.

## Recommended Mitigations
- Maintain a weekly risk log with owner, severity, trend, mitigation, and decision required.
- Route client-facing language through the engagement owner.
- Use approved knowledge and project sources before drafting.

## Review Status
Human review required before client-facing use.`;
  } else if (plan.scenario === "expense") {
    message = `# Expense Policy Answer

The local Expense and Client Entertainment Policy says client entertainment up to CAD 150 per attendee may be approved by engagement managers when the business purpose is documented. CAD 150-300 per attendee requires partner approval. Above CAD 300 per attendee requires compliance review.

Public-sector clients, alcohol-heavy events, gifts, and unusual entertainment require additional review.`;
  } else {
    message = `# Knowledge Base Answer

ConsultIQ is running in demo mode because \`GEMINI_API_KEY\` is not configured. Based on local fake policy data, approved AI tools may be used for drafting, summarization, workflow analysis, and internal ideation, but real client confidential data requires approved controls and human review.`;
  }

  return {
    message,
    toolEvents,
    metadata: {
      model: `${MODEL} (demo mode)`,
      latencyMs: Date.now() - startedAt,
      toolsUsed: toolEvents.map((event) => event.name),
      estimatedInputTokens: estimateTokens(messages.map((item) => item.content).join("\n")),
      estimatedOutputTokens: estimateTokens(message),
      demoMode: true
    },
    flags: detectFlags(message, toolEvents)
  };
}

async function providerFallbackResponse(messages: ClientMessage[], mode: ChatMode, startedAt: number): Promise<ChatApiResponse> {
  const deterministicResponse = demoResponse(messages, mode, startedAt);
  const toolEvents = deterministicResponse.toolEvents;

  try {
    const groqMessage = await synthesizeWithGroq(messages, mode, toolEvents);
    if (groqMessage) {
      const finalMessage = enforceComplianceVerdict(
        sanitizeUncalledToolCitations(groqMessage, toolEvents),
        toolEvents
      );
      return {
        message: finalMessage,
        toolEvents,
        metadata: {
          model: `groq:${process.env.GROQ_MODEL || GROQ_MODEL} (Gemini fallback)`,
          latencyMs: Date.now() - startedAt,
          toolsUsed: toolEvents.map((event) => event.name),
          estimatedInputTokens: deterministicResponse.metadata.estimatedInputTokens,
          estimatedOutputTokens: Math.max(1, Math.ceil(finalMessage.length / 4)),
          demoMode: false
        },
        flags: detectFlags(finalMessage, toolEvents)
      };
    }
  } catch {
    // Fall through to deterministic fallback.
  }

  return {
    ...deterministicResponse,
    metadata: {
      ...deterministicResponse.metadata,
      model: `${MODEL} (deterministic fallback)`,
      demoMode: true
    },
    flags: {
      ...deterministicResponse.flags,
      uncertainty: true
    }
  };
}

export async function runAgent(messages: ClientMessage[], mode: ChatMode): Promise<ChatApiResponse> {
  const startedAt = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return providerFallbackResponse(messages, mode, startedAt);
  }

  const ai = new GoogleGenAI({ apiKey });
  const contents: Content[] = toGeminiContents(messages) as Content[];
  const toolEvents: ToolEvent[] = [];
  let finalMessage = "";

  try {
    for (let turn = 0; turn < MAX_TOOL_CALLS; turn += 1) {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction: systemInstruction(mode),
        temperature: 0.25,
        maxOutputTokens: 1800,
        tools: [
          {
            functionDeclarations: functionDeclarations as Array<Record<string, unknown>>
          }
        ]
      }
    });

    const functionCalls = extractFunctionCalls(response);
    if (functionCalls.length === 0) {
      finalMessage = extractText(response);
      break;
    }

    const modelContent = (response as { candidates?: Array<{ content?: Content }> }).candidates?.[0]?.content;
    if (modelContent) contents.push(modelContent);

    for (const call of functionCalls) {
      if (toolEvents.length >= MAX_TOOL_CALLS) break;
      const toolStartedAt = Date.now();
      const result = runTool(call.name, call.args);
      const name = call.name as ToolName;
      toolEvents.push({
        id: `${call.name}-${toolEvents.length}`,
        name: call.name,
        label: toolLabels[name] ?? `Calling ${call.name}`,
        args: call.args,
        result,
        status: "completed",
        durationMs: Date.now() - toolStartedAt
      });
      contents.push({
        role: "user",
        parts: [
          {
            functionResponse: {
              name: call.name,
              response: { result } as Record<string, unknown>
            }
          }
        ]
      } as Content);
    }
    }

    if (!finalMessage) {
    contents.push({
      role: "user",
      parts: [
        {
          text: "The maximum tool-call limit has been reached. Produce the final answer using only retrieved tool results. Clearly flag any gaps or uncertainty."
        }
      ]
    } as Content);
    const finalResponse = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction: systemInstruction(mode),
        temperature: 0.2,
        maxOutputTokens: 1800
      }
    });
      finalMessage = extractText(finalResponse);
    }

    if (needsWorkflowRewrite(mode, finalMessage)) {
    const missingSections = missingWorkflowSections(finalMessage);
    contents.push({
      role: "user",
      parts: [
        {
          text: `Rewrite the final answer as a complete AI Lab Prototype Brief. Start with "# AI Lab Prototype Brief" and include every required section in this exact order: ${WORKFLOW_SECTIONS.join(", ")}. Do not omit the front-half workflow design sections. Missing sections from the previous draft: ${missingSections.join(", ") || "unknown"}. Use only retrieved tool results. Cite only tools that were actually called. Do not include separate "Context", "Working Draft", or "Review Status" sections from the generate_document scaffold. Clearly flag uncertainty.`
        }
      ]
    } as Content);

    const rewriteResponse = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction: systemInstruction(mode),
        temperature: 0.15,
        maxOutputTokens: 2400
      }
    });
      finalMessage = extractText(rewriteResponse);
    }
  } catch (error) {
    if (isQuotaError(error)) {
      const fallback = await providerFallbackResponse(messages, mode, startedAt);
      fallback.metadata.providerError = "quota_limited";
      return fallback;
    }
    // Surface non-quota provider errors so reviewers see observability thinking.
    // The response still works via fallback, but raw provider exception text is not exposed.
    const fallback = await providerFallbackResponse(messages, mode, startedAt);
    fallback.metadata.providerError = "provider_error";
    return fallback;
  }

  finalMessage = enforceComplianceVerdict(sanitizeUncalledToolCitations(finalMessage, toolEvents), toolEvents);
  const inputText = messages.map((message) => message.content).join("\n");
  return {
    message: finalMessage,
    toolEvents,
    metadata: {
      model: MODEL,
      latencyMs: Date.now() - startedAt,
      toolsUsed: Array.from(new Set(toolEvents.map((event) => event.name))),
      estimatedInputTokens: estimateTokens(inputText),
      estimatedOutputTokens: estimateTokens(finalMessage),
      demoMode: false
    },
    flags: detectFlags(finalMessage, toolEvents)
  };
}
