import complianceRules from "@/data/compliance-rules.json";
import knowledgeBase from "@/data/knowledge-base.json";
import projects from "@/data/projects.json";
import workflowPatterns from "@/data/workflow-patterns.json";
import type { ComplianceVerdict } from "./types";

type KnowledgeDocument = (typeof knowledgeBase.documents)[number];
type Project = (typeof projects.projects)[number];
type ComplianceRule = (typeof complianceRules.rules)[number];
type WorkflowPattern = (typeof workflowPatterns.patterns)[number];

export type ToolName =
  | "search_knowledge_base"
  | "get_project_status"
  | "check_compliance"
  | "generate_document"
  | "design_agentic_workflow";

export const toolLabels: Record<ToolName, string> = {
  search_knowledge_base: "Searching knowledge base",
  get_project_status: "Retrieving project status",
  check_compliance: "Checking compliance",
  generate_document: "Generating document",
  design_agentic_workflow: "Designing agentic workflow"
};

const stopWords = new Set([
  "the",
  "and",
  "for",
  "with",
  "our",
  "that",
  "this",
  "from",
  "what",
  "how",
  "can",
  "into",
  "are",
  "you",
  "use",
  "using",
  "about",
  "client",
  "clients"
]);

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 1 && !stopWords.has(word));
}

function scoreText(queryTokens: string[], text: string): number {
  const haystack = text.toLowerCase();
  return queryTokens.reduce((score, token) => {
    if (haystack.includes(token)) return score + 3;
    const fuzzyHit = haystack
      .split(/\s+/)
      .some((word) => word.startsWith(token.slice(0, Math.min(token.length, 5))));
    return fuzzyHit ? score + 1 : score;
  }, 0);
}

export function searchKnowledgeBase(query: string) {
  const tokens = tokenize(query);
  const ranked = knowledgeBase.documents
    .map((document: KnowledgeDocument) => {
      const titleScore = scoreText(tokens, document.title) * 2;
      const contentScore = scoreText(tokens, document.content);
      const categoryScore = scoreText(tokens, document.category);
      return {
        ...document,
        relevance_score: titleScore + contentScore + categoryScore
      };
    })
    .filter((document) => document.relevance_score > 0)
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, 5);

  return {
    query,
    count: ranked.length,
    documents: ranked.length > 0 ? ranked : knowledgeBase.documents.slice(0, 3)
  };
}

export function getProjectStatus(projectId: string) {
  const normalized = projectId.toLowerCase().trim();
  const project = projects.projects.find((item: Project) => {
    return (
      item.id.toLowerCase() === normalized ||
      item.name.toLowerCase() === normalized ||
      item.name.toLowerCase().includes(normalized) ||
      normalized.includes(item.name.toLowerCase())
    );
  });

  if (!project) {
    return {
      found: false,
      requested_project: projectId,
      available_projects: projects.projects.map((item) => ({
        id: item.id,
        name: item.name,
        client: item.client
      }))
    };
  }

  return {
    found: true,
    project
  };
}

export function checkCompliance(action: string) {
  const tokens = tokenize(action);
  const normalizedAction = action.toLowerCase();
  const matches = complianceRules.rules
    .map((rule: ComplianceRule) => {
      const keywordScore = rule.verdict_keywords.reduce((score, keyword) => {
        const normalizedKeyword = keyword.toLowerCase();
        const pluralKeyword = normalizedKeyword.endsWith("s") ? normalizedKeyword : `${normalizedKeyword}s`;
        return normalizedAction.includes(normalizedKeyword) || normalizedAction.includes(pluralKeyword)
          ? score + 4
          : score;
      }, 0);
      const textScore = scoreText(tokens, `${rule.category} ${rule.rule}`);
      return {
        ...rule,
        match_score: keywordScore + textScore
      };
    })
    .filter((rule) => rule.match_score > 0)
    .sort((a, b) => {
      const verdictRank: Record<ComplianceVerdict, number> = {
        "not allowed": 3,
        "review required": 2,
        allowed: 1
      };
      if (b.match_score !== a.match_score) return b.match_score - a.match_score;
      return verdictRank[b.default_verdict as ComplianceVerdict] - verdictRank[a.default_verdict as ComplianceVerdict];
    });

  const primaryRule = matches[0];
  const verdict: ComplianceVerdict = primaryRule
    ? (primaryRule.default_verdict as ComplianceVerdict)
    : "review required";

  return {
    action,
    verdict,
    reasoning: primaryRule
      ? primaryRule.rule
      : "No exact static rule matched. Enterprise policy requires human review when the data class, tool approval status, or external sharing path is unclear.",
    matched_rules: matches.slice(0, 3).map((rule) => ({
      id: rule.id,
      category: rule.category,
      verdict: rule.default_verdict,
      severity: rule.severity,
      rule: rule.rule,
      match_score: rule.match_score
    })),
    escalation: verdict === "allowed" ? "No escalation required for the described low-risk action." : "Route to the engagement owner and relevant risk/compliance reviewer before proceeding."
  };
}

export function designAgenticWorkflow(problem: string) {
  const tokens = tokenize(problem);
  const rankedPatterns = workflowPatterns.patterns
    .map((pattern: WorkflowPattern) => ({
      ...pattern,
      relevance_score:
        scoreText(tokens, pattern.name) +
        scoreText(tokens, pattern.best_for.join(" ")) +
        scoreText(tokens, pattern.steps.join(" "))
    }))
    .sort((a, b) => b.relevance_score - a.relevance_score);

  const primary = rankedPatterns[0];

  return {
    problem,
    recommended_pattern: primary,
    supporting_patterns: rankedPatterns.slice(1, 3).map((pattern) => ({
      id: pattern.id,
      name: pattern.name,
      best_for: pattern.best_for
    })),
    required_sections: [
      "problem summary",
      "current-state workflow",
      "pain points and bottlenecks",
      "proposed agentic workflow",
      "required tools and data sources",
      "human-in-the-loop approval points",
      "autonomy level",
      "compliance and risk assessment",
      "MVP prototype scope",
      "evaluation checklist",
      "production-readiness checklist"
    ],
    recommended_autonomy_level: problem.toLowerCase().includes("client") ? "human-approved draft and recommendation" : "supervised internal automation",
    default_human_gates: primary.human_gates
  };
}

export function generateDocument(type: string, context: string) {
  const normalizedType = type.toLowerCase();
  if (normalizedType.includes("prototype") || normalizedType.includes("brief")) {
    return {
      type,
      document_contract: "AI Lab Prototype Brief",
      required_sections: [
        "Problem Summary",
        "Current-State Workflow",
        "Pain Points and Bottlenecks",
        "Proposed Agentic Workflow",
        "Required Tools/Data Sources",
        "Human-in-the-Loop Approval Points",
        "Autonomy Level",
        "Compliance/Risk Assessment",
        "MVP Prototype Scope",
        "Evaluation Checklist",
        "Production-Readiness Checklist"
      ],
      formatting_rules: [
        "Start with # AI Lab Prototype Brief",
        "Do not include a separate Context section",
        "Do not append a generic Working Draft section",
        "Use concise bullets under each required section",
        "Cite only tools that were actually called"
      ],
      context,
      review_required: true
    };
  }

  const title =
    normalizedType.includes("risk")
      ? "Risk Summary"
      : normalizedType.includes("agenda")
          ? "Meeting Agenda"
          : normalizedType.includes("status")
            ? "Status Update"
            : "Client Brief";

  const markdown = `# ${title}

## Context
${context}

## Working Draft
- Objective: Clarify the business outcome and the decision the audience needs to make.
- Current state: Summarize the workflow, handoffs, known constraints, and available data.
- Proposed AI support: Use approved tools to retrieve facts, draft analysis, and route sensitive decisions for human review.
- Governance controls: Confirm data classification, source traceability, human approval, and compliance review where needed.
- Next steps: Validate with the process owner, run eval cases, and define the production owner before rollout.

## Review Status
Human review required before client-facing or production use.`;

  return {
    type,
    markdown,
    review_required: true
  };
}

export function runTool(name: string, args: Record<string, unknown>) {
  switch (name as ToolName) {
    case "search_knowledge_base":
      return searchKnowledgeBase(String(args.query ?? ""));
    case "get_project_status":
      return getProjectStatus(String(args.project_id ?? args.projectId ?? ""));
    case "check_compliance":
      return checkCompliance(String(args.action ?? ""));
    case "generate_document":
      return generateDocument(String(args.type ?? "brief"), String(args.context ?? ""));
    case "design_agentic_workflow":
      return designAgenticWorkflow(String(args.problem ?? ""));
    default:
      return {
        error: `Unknown tool: ${name}`
      };
  }
}
