import type { CapabilityDefinition } from "./types";

export const capabilities: CapabilityDefinition[] = [
  {
    name: "Workflow Runner",
    tool: "run_weekly_update_workflow",
    purpose:
      "Executes the sample weekly reporting workflow from fake notes, risk logs, project facts, and compliance rules.",
    productionSignal: "Source artifacts, generated draft, detected risks, and review gate are returned in one traceable run."
  },
  {
    name: "Knowledge Retrieval",
    tool: "search_knowledge_base",
    purpose: "Grounds answers in approved internal policy, delivery, security, and governance documents.",
    productionSignal: "Source citation, freshness checks, and owner escalation for stale guidance."
  },
  {
    name: "Project Context",
    tool: "get_project_status",
    purpose: "Retrieves controlled project facts before generating status updates or risk summaries.",
    productionSignal: "No invented status, phase, owner, client, or milestone data."
  },
  {
    name: "Compliance Triage",
    tool: "check_compliance",
    purpose: "Returns deterministic allowed, review required, or not allowed verdicts from local rules.",
    productionSignal: "Model explains the verdict but cannot override the rule engine."
  },
  {
    name: "Workflow Design",
    tool: "design_agentic_workflow",
    purpose: "Maps messy process pain into a reusable agentic workflow pattern with human gates.",
    productionSignal: "Autonomy level, approval gates, and evaluation criteria are explicit."
  },
  {
    name: "Document Drafting",
    tool: "generate_document",
    purpose: "Produces structured markdown briefs, agendas, status updates, and risk summaries.",
    productionSignal: "Drafts remain review-gated before client-facing or production use."
  }
];
