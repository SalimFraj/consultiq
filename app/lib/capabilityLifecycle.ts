export type CapabilityLifecycleStatus = "demonstrated" | "review-gated" | "production-candidate";

export type CapabilityLifecycleStage = {
  stage: "intake" | "prototype" | "eval" | "review" | "production";
  label: string;
  description: string;
  evidence: string;
  productionSignal: string;
  status: CapabilityLifecycleStatus;
};

export const capabilityLifecycle: CapabilityLifecycleStage[] = [
  {
    stage: "intake",
    label: "Intake",
    description: "Capture the messy internal workflow problem and the decision boundary.",
    evidence: "Demo prompts start from weekly reporting pain, scattered notes, and risk logs.",
    productionSignal: "Problem, user, data source, and success metric are explicit before tooling.",
    status: "demonstrated"
  },
  {
    stage: "prototype",
    label: "Prototype",
    description: "Execute a bounded agentic workflow against fake enterprise source artifacts.",
    evidence: "The weekly update runner reads notes, project facts, risk logs, and compliance rules.",
    productionSignal: "Tool contracts, source artifacts, generated draft, and review gate are visible.",
    status: "demonstrated"
  },
  {
    stage: "eval",
    label: "Eval",
    description: "Validate routing, guardrails, and workflow outputs with deterministic checks.",
    evidence: "The eval harness runs 10 portfolio regression cases against the local tool layer.",
    productionSignal: "Failures would surface before the pattern is reused for another build.",
    status: "demonstrated"
  },
  {
    stage: "review",
    label: "Review Gate",
    description: "Stop sensitive or client-facing outputs before they become operational actions.",
    evidence: "Compliance warnings and human-review flags appear on generated outputs.",
    productionSignal: "Engagement-owner and risk/compliance review remain mandatory when required.",
    status: "review-gated"
  },
  {
    stage: "production",
    label: "Production Candidate",
    description: "Package reusable tools, evals, and governance signals for the next internal build.",
    evidence: "Capability metadata lists reusable tools with production signals.",
    productionSignal: "Static data can be replaced with approved connectors, auth, logging, and CI gates.",
    status: "production-candidate"
  }
];
