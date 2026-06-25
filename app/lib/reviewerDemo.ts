import { createDeterministicToolPlan } from "./toolPlan";
import type { AssistantMetadata, ToolEvent } from "./types";
import { buildReviewerWalkthrough, type ReviewerWalkthroughData } from "./reviewerWalkthrough";

export type EvidenceRecord = { id: string; type: "meeting note" | "project note" | "risk" | "decision" | "stakeholder update"; title: string; excerpt: string };
export type ClaimLineage = { id: string; claim: string; sourceIds: string[]; rationale: string };
export type ReadinessItem = { label: string; detail: string };
export type ReviewerDemoPayload = ReviewerWalkthroughData & {
  runId: string;
  generatedAt: string;
  evidence: EvidenceRecord[];
  lineage: ClaimLineage[];
  readiness: { demonstrated: ReadinessItem[]; simulated: ReadinessItem[]; requiredForProduction: ReadinessItem[] };
  recommendation: { decision: string; reason: string; nextStep: string };
};
export type ReviewerDecisionValue = "approve_internal_mvp" | "request_changes" | "reject";
export type ReviewerDecisionRecord = { id: string; runId: string; decision: ReviewerDecisionValue; label: string; reviewer: string; note: string; timestamp: string };
export type ReviewerDemoResponse = {
  message: string;
  toolEvents: ToolEvent[];
  metadata: AssistantMetadata;
  flags: { uncertainty: boolean; complianceWarning: boolean; humanReviewRequired: boolean };
  review: ReviewerDemoPayload;
};

export const REVIEWER_DEMO_PROMPT = "Run the weekly update workflow for Project Northstar using the sample notes and risk log.";

export const reviewerTakeaways = [
  "A credible AI build starts with a measurable operating problem, not a model demo.",
  "Reviewers can see the complete data boundary and verify that missing facts are not invented.",
  "Every action is represented by an observable, bounded tool call and an audit step.",
  "Generated claims remain inspectable because each one links back to source evidence.",
  "The system drafts, but deterministic policy and a named human reviewer control release.",
  "The prototype can advance only with a named owner, measurable value, and explicit production work."
] as const;

const decisionLabels: Record<ReviewerDecisionValue, string> = {
  approve_internal_mvp: "Approve for internal MVP",
  request_changes: "Request changes",
  reject: "Do not advance"
};

function buildEvidence(data: ReviewerWalkthroughData): EvidenceRecord[] {
  const sources = data.workflow.source_artifacts ?? {};
  return [
    ...(sources.meeting_notes ?? []).map((note, index) => ({ id: `MN-${String(index + 1).padStart(2, "0")}`, type: "meeting note" as const, title: note.source ?? `Meeting note ${index + 1}`, excerpt: note.note ?? "" })),
    ...(sources.project_notes ?? []).map((note, index) => ({ id: `PN-${String(index + 1).padStart(2, "0")}`, type: "project note" as const, title: `Project note ${index + 1}`, excerpt: note })),
    ...(sources.risk_log ?? []).map((risk, index) => ({ id: risk.id ?? `R-${String(index + 1).padStart(2, "0")}`, type: "risk" as const, title: `${risk.severity ?? "Unrated"} risk - ${risk.trend ?? "unknown trend"}`, excerpt: risk.risk ?? "" })),
    ...(sources.decisions_needed ?? []).map((decision, index) => ({ id: `D-${String(index + 1).padStart(2, "0")}`, type: "decision" as const, title: `Decision ${index + 1}`, excerpt: decision })),
    ...(sources.stakeholder_updates ?? []).map((update, index) => ({ id: `SU-${String(index + 1).padStart(2, "0")}`, type: "stakeholder update" as const, title: `Stakeholder update ${index + 1}`, excerpt: update }))
  ];
}

function buildLineage(): ClaimLineage[] {
  return [
    { id: "claim-progress", claim: "Integration mapping for onboarding exceptions is 80% complete.", sourceIds: ["MN-01"], rationale: "The progress statement is copied from the architecture standup note." },
    { id: "claim-approval", claim: "Draft exception categories were approved by the client operations lead.", sourceIds: ["MN-02"], rationale: "The client working-session note records the approval and remaining ownership question." },
    { id: "claim-access-risk", claim: "Data-access delay threatens architecture review validation time.", sourceIds: ["MN-03", "R-17"], rationale: "The delivery sync records the delay and the risk log defines impact, owner, and mitigation." },
    { id: "claim-ownership-risk", claim: "Exception ownership remains unclear for branch operations users.", sourceIds: ["MN-02", "R-21", "D-02"], rationale: "The concern appears in meeting notes, the risk register, and the decision queue." },
    { id: "claim-data-boundary", claim: "The prototype must not use real client PII.", sourceIds: ["PN-04"], rationale: "The project note defines the prototype data boundary explicitly." },
    { id: "claim-review-gate", claim: "The update requires engagement-owner review before client use.", sourceIds: ["PN-03"], rationale: "The project note defines the client-facing approval requirement used by the deterministic gate." }
  ];
}

export function createReviewerDecision(runId: string, decision: ReviewerDecisionValue, note = "Decision recorded in the local portfolio simulation."): ReviewerDecisionRecord {
  return {
    id: `decision_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    runId,
    decision,
    label: decisionLabels[decision],
    reviewer: "Portfolio reviewer (simulated)",
    note,
    timestamp: new Date().toISOString()
  };
}

export function createReviewerDemo(): ReviewerDemoResponse {
  const prompt = REVIEWER_DEMO_PROMPT;
  const plan = createDeterministicToolPlan(prompt, "workflow");
  const walkthrough = buildReviewerWalkthrough(plan.toolEvents);
  if (!walkthrough) throw new Error("The reviewer demo could not assemble structured workflow evidence.");

  const review: ReviewerDemoPayload = {
    ...walkthrough,
    runId: `review_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    generatedAt: new Date().toISOString(),
    evidence: buildEvidence(walkthrough),
    lineage: buildLineage(),
    readiness: {
      demonstrated: [
        { label: "Bounded workflow execution", detail: "Three observable tool calls operate on an explicit fake source packet." },
        { label: "Evidence-grounded draft", detail: "Material claims map back to named notes, risks, or decisions." },
        { label: "Human release gate", detail: "Client-facing use stops at a named engagement-owner review." },
        { label: "Regression evidence", detail: "Deterministic tests cover routing, source use, output, and governance." }
      ],
      simulated: [
        { label: "Enterprise source systems", detail: "Local JSON stands in for approved project, document, and risk systems." },
        { label: "Reviewer identity", detail: "The portfolio demo uses a clearly marked simulated reviewer." },
        { label: "Approval storage", detail: "Decisions persist in this browser only and do not trigger an external action." }
      ],
      requiredForProduction: [
        { label: "SSO and role-based access", detail: "Authenticate users and enforce project-level permissions." },
        { label: "Approved connectors", detail: "Replace local fixtures with governed systems of record." },
        { label: "Durable audit and monitoring", detail: "Persist source versions, decisions, failures, and telemetry." },
        { label: "Versioned deployment gates", detail: "Require evals across prompt, model, tool, and policy versions in CI." }
      ]
    },
    recommendation: {
      decision: "Advance conditionally to an internal MVP",
      reason: "The prototype demonstrates measurable value, traceable evidence, bounded execution, and a human review gate.",
      nextStep: "Add identity, approved connectors, durable approvals, and versioned operational evals before a production pilot."
    }
  };

  return {
    message: "# Reviewer Evidence Packet\n\nStarting prompt: Run the weekly update workflow for Project Northstar using the sample notes and risk log.\n\nThe local deterministic workflow executed the Northstar source packet, produced traceable evidence, generated a governed draft, and stopped at a human review gate.",
    toolEvents: plan.toolEvents,
    metadata: {
      model: "reviewer-demo: deterministic workflow",
      latencyMs: plan.toolEvents.reduce((total, event) => total + event.durationMs, 0),
      toolsUsed: plan.toolEvents.map((event) => event.name),
      estimatedInputTokens: 0,
      estimatedOutputTokens: 0,
      demoMode: true
    },
    flags: { uncertainty: false, complianceWarning: true, humanReviewRequired: true },
    review
  };
}
