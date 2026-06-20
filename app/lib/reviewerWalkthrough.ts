import type { ToolEvent } from "./types";

export const REVIEWER_WALKTHROUGH_SECONDS = 90;
export const REVIEWER_STAGE_SECONDS = 15;

export const reviewerStages = [
  { id: "problem", shortLabel: "Problem", title: "Start with the operating problem", description: "Establish the manual work and the outcome this capability must improve." },
  { id: "evidence", shortLabel: "Evidence", title: "Inspect the source boundary", description: "See exactly which fake artifacts and project facts the workflow is allowed to use." },
  { id: "orchestration", shortLabel: "Execution", title: "Follow the bounded execution", description: "Trace the tools, arguments, and deterministic workflow steps instead of trusting hidden reasoning." },
  { id: "output", shortLabel: "Output", title: "Review the generated deliverable", description: "Examine the client-update draft produced from the source packet." },
  { id: "governance", shortLabel: "Controls", title: "Stop at the review gate", description: "Confirm that risk movement and client-facing controls prevent autonomous release." },
  { id: "handoff", shortLabel: "Decision", title: "Decide whether this should advance", description: "End with accountable ownership, a measurable outcome, handoff conditions, and known gaps." }
] as const;

export type ReviewerRisk = { id?: string; severity?: string; trend?: string; risk?: string; owner?: string; mitigation?: string };
export type ReviewerWorkflow = {
  found?: boolean;
  project?: { name?: string; client?: string; phase?: string; risk_level?: string; owner?: string; next_milestone?: string };
  reporting_period?: string;
  execution_steps?: string[];
  source_artifacts?: {
    meeting_notes?: Array<{ date?: string; source?: string; note?: string }>;
    project_notes?: string[];
    risk_log?: ReviewerRisk[];
    decisions_needed?: string[];
    stakeholder_updates?: string[];
  };
  detected_risks?: { total?: number; increasing?: ReviewerRisk[]; requires_escalation?: boolean };
  compliance_check?: { verdict?: string; reasoning?: string; escalation?: string };
  drafted_update?: string;
  approval_status?: { status?: string; required_reviewer?: string; reason?: string };
  accountability?: { business_owner?: string; technical_owner?: string; required_reviewer?: string; success_metric?: string; handoff_condition?: string };
  value_summary?: { before?: string; after?: string; estimated_time_saved?: string; risk_reduction?: string };
};

export type ReviewerWalkthroughData = {
  workflow: ReviewerWorkflow;
  toolEvents: ToolEvent[];
  sourceCount: number;
  sourceGroups: Array<{ label: string; count: number }>;
  readinessSignals: Array<{ label: string; passed: boolean }>;
  readinessScore: number;
};

export const reviewerProductionGaps = [
  "Replace fake JSON files with approved enterprise systems of record.",
  "Add authentication, role-based access, and persistent audit logging.",
  "Store reviewer decisions before enabling any client-facing send action.",
  "Run versioned workflow evals as a required CI deployment gate."
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function buildReviewerWalkthrough(toolEvents: ToolEvent[]): ReviewerWalkthroughData | null {
  const workflowEvent = toolEvents.find((event) => event.name === "run_weekly_update_workflow" && isRecord(event.result));
  if (!workflowEvent) return null;
  const workflow = workflowEvent.result as ReviewerWorkflow;
  if (!workflow.found) return null;

  const sources = workflow.source_artifacts ?? {};
  const sourceGroups = [
    { label: "Meeting notes", count: sources.meeting_notes?.length ?? 0 },
    { label: "Project notes", count: sources.project_notes?.length ?? 0 },
    { label: "Risk records", count: sources.risk_log?.length ?? 0 },
    { label: "Decisions", count: sources.decisions_needed?.length ?? 0 },
    { label: "Stakeholder updates", count: sources.stakeholder_updates?.length ?? 0 }
  ];
  const sourceCount = sourceGroups.reduce((total, group) => total + group.count, 0);
  const readinessSignals = [
    { label: "Source packet present", passed: sourceCount > 0 },
    { label: "Project facts retrieved", passed: Boolean(workflow.project?.name) },
    { label: "Risk movement detected", passed: typeof workflow.detected_risks?.total === "number" },
    { label: "Compliance checked", passed: Boolean(workflow.compliance_check?.verdict) },
    { label: "Draft generated", passed: Boolean(workflow.drafted_update) },
    { label: "Review gate enforced", passed: workflow.approval_status?.status === "human review required" }
  ];
  const passedSignals = readinessSignals.filter((signal) => signal.passed).length;
  return { workflow, toolEvents, sourceCount, sourceGroups, readinessSignals, readinessScore: Math.round((passedSignals / readinessSignals.length) * 100) };
}

export function reviewerStageIndexForElapsed(elapsedSeconds: number) {
  const bounded = Math.max(0, Math.min(elapsedSeconds, REVIEWER_WALKTHROUGH_SECONDS));
  return Math.min(reviewerStages.length - 1, Math.floor(bounded / REVIEWER_STAGE_SECONDS));
}

export function reviewerElapsedForStage(stageIndex: number) {
  return Math.max(0, Math.min(stageIndex, reviewerStages.length - 1)) * REVIEWER_STAGE_SECONDS;
}

export function formatReviewerTime(totalSeconds: number) {
  const bounded = Math.max(0, Math.min(Math.floor(totalSeconds), REVIEWER_WALKTHROUGH_SECONDS));
  return `${String(Math.floor(bounded / 60)).padStart(2, "0")}:${String(bounded % 60).padStart(2, "0")}`;
}
