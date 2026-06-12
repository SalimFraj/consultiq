import complianceRules from "@/data/compliance-rules.json";
import knowledgeBase from "@/data/knowledge-base.json";
import projects from "@/data/projects.json";
import weeklyUpdateSources from "@/data/weekly-update-sources.json";
import workflowPatterns from "@/data/workflow-patterns.json";
import type { ComplianceVerdict } from "./types";

type KnowledgeDocument = (typeof knowledgeBase.documents)[number];
type Project = (typeof projects.projects)[number];
type ComplianceRule = (typeof complianceRules.rules)[number];
type WorkflowPattern = (typeof workflowPatterns.patterns)[number];
type WeeklyUpdateEngagement = (typeof weeklyUpdateSources.engagements)[number];
type ProjectSummary = Pick<Project, "id" | "name" | "client">;
type ProjectStatusResult =
  | {
      found: true;
      project: Project;
    }
  | {
      found: false;
      requested_project: string;
      available_projects: ProjectSummary[];
    };

export type ToolName =
  | "search_knowledge_base"
  | "get_project_status"
  | "check_compliance"
  | "generate_document"
  | "design_agentic_workflow"
  | "run_weekly_update_workflow";

export const toolLabels: Record<ToolName, string> = {
  search_knowledge_base: "Searching knowledge base",
  get_project_status: "Retrieving project status",
  check_compliance: "Checking compliance",
  generate_document: "Generating document",
  design_agentic_workflow: "Designing agentic workflow",
  run_weekly_update_workflow: "Running weekly update workflow"
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

export function getProjectStatus(projectId: string): ProjectStatusResult {
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
      "accountable owner and success metric",
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
        "Accountable Owner and Success Metric",
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

function findWeeklyUpdateEngagement(projectId: string) {
  const normalized = projectId.toLowerCase().trim();
  return weeklyUpdateSources.engagements.find((engagement: WeeklyUpdateEngagement) => {
    return (
      engagement.project_id.toLowerCase() === normalized ||
      engagement.project_name.toLowerCase() === normalized ||
      engagement.project_name.toLowerCase().includes(normalized) ||
      normalized.includes(engagement.project_name.toLowerCase())
    );
  });
}

type WeeklyUpdateWorkflowResult =
  | {
      found: true;
      project: Project;
      reporting_period: string;
      execution_steps: string[];
      source_artifacts: WeeklyUpdateEngagement["source_artifacts"];
      detected_risks: {
        total: number;
        increasing: WeeklyUpdateEngagement["source_artifacts"]["risk_log"];
        requires_escalation: boolean;
      };
      compliance_check: ReturnType<typeof checkCompliance>;
      drafted_update: string;
      approval_status: {
        status: "human review required";
        required_reviewer: string;
        reason: string;
      };
      accountability: {
        business_owner: string;
        technical_owner: string;
        required_reviewer: string;
        success_metric: string;
        handoff_condition: string;
      };
      value_summary: {
        before: string;
        after: string;
        estimated_time_saved: string;
        risk_reduction: string;
      };
    }
  | {
      found: false;
      requested_project: string;
      reason: string;
      available_projects?: ProjectSummary[];
      project?: Project;
    };

export function runWeeklyUpdateWorkflow(projectId = "Project Northstar"): WeeklyUpdateWorkflowResult {
  const projectStatus = getProjectStatus(projectId);
  if (!projectStatus.found) {
    return {
      found: false,
      requested_project: projectId,
      reason: "No matching project was found in the local project register. The workflow runner will not invent project facts.",
      available_projects: projectStatus.available_projects
    };
  }

  const project = projectStatus.project;
  const engagement = findWeeklyUpdateEngagement(project.id) ?? findWeeklyUpdateEngagement(project.name);
  if (!engagement) {
    return {
      found: false,
      requested_project: projectId,
      project,
      reason: "The project exists, but no sample notes or risk log packet is available for this workflow demo."
    };
  }

  const sources = engagement.source_artifacts;
  const increasingRisks = sources.risk_log.filter((risk) => risk.trend === "increasing");
  const compliance = checkCompliance(
    `Draft a weekly client update for ${project.name} using project notes, risk logs, and project status.`
  );

  const draftedUpdate = `# Weekly Client Update - ${project.name}

## Reporting Period
${engagement.reporting_period}

## Overall Status
${project.name} remains in ${project.phase} with ${project.risk_level} delivery risk. The team completed the first pass of the future-state onboarding workflow map and prepared the architecture review packet for ${project.next_milestone}.

## Completed This Week
- Integration mapping for onboarding exceptions is 80% complete.
- Draft exception categories were approved by the client operations lead.
- Future-state onboarding workflow map is ready for review.

## Risks And Watch Items
${sources.risk_log
  .map((risk) => `- ${risk.id} (${risk.severity}, ${risk.trend}): ${risk.risk} Mitigation: ${risk.mitigation}`)
  .join("\n")}

## Decisions Needed
${sources.decisions_needed.map((decision) => `- ${decision}`).join("\n")}

## Next Milestone
${project.next_milestone}

## Review Gate
This draft must be reviewed by ${project.owner} before it is used as a client-facing update.`;

  return {
    found: true,
    project,
    reporting_period: engagement.reporting_period,
    execution_steps: [
      "Read meeting notes, project notes, risk log, decisions, and stakeholder updates from the sample source packet.",
      "Retrieved project phase, risk level, owner, and next milestone from the local project register.",
      "Detected increasing and stable risks from the risk log.",
      "Checked client-facing communication against deterministic compliance rules.",
      "Drafted a weekly update and held it for engagement-owner approval."
    ],
    source_artifacts: sources,
    detected_risks: {
      total: sources.risk_log.length,
      increasing: increasingRisks,
      requires_escalation: increasingRisks.length > 0
    },
    compliance_check: compliance,
    drafted_update: draftedUpdate,
    approval_status: {
      status: "human review required",
      required_reviewer: project.owner,
      reason: "Client-facing AI-assisted deliverables require engagement-owner review before external use."
    },
    accountability: {
      business_owner: project.owner,
      technical_owner: "AI Lab prototype owner",
      required_reviewer: project.owner,
      success_metric: "Cut weekly reporting prep from 60-90 minutes to a reviewed draft in under 15 minutes while preserving risk escalation and source traceability.",
      handoff_condition:
        "Only hand off after the business owner confirms the workflow, the reviewer approves the output boundary, and evals pass against source, draft, and review-gate checks."
    },
    value_summary: {
      before: "A project lead manually reads scattered notes and risk logs, reconciles project facts, writes the update, and remembers review requirements.",
      after: "The workflow collects the fake source packet, pulls project facts, detects risk movement, drafts the update, and stops at a review gate.",
      estimated_time_saved: "Reduces a 60-90 minute weekly drafting task to a review-ready first draft in minutes.",
      risk_reduction: "Makes increasing risks and required decisions explicit before the update leaves the team."
    }
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
    case "run_weekly_update_workflow":
      return runWeeklyUpdateWorkflow(String(args.project_id ?? args.projectId ?? "Project Northstar"));
    default:
      return {
        error: `Unknown tool: ${name}`
      };
  }
}
