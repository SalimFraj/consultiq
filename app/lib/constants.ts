/** Shared constants used across the agent loop, Groq fallback, and eval harness. */

export const WORKFLOW_SECTIONS = [
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
] as const;

export type WorkflowSection = (typeof WORKFLOW_SECTIONS)[number];

export const MODEL = "gemini-2.5-flash";
export const MAX_TOOL_CALLS = 5;
