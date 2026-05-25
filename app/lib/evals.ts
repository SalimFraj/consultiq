import evalCases from "@/data/eval-cases.json";
import { createDeterministicToolPlan } from "./toolPlan";
import type { CapabilityDefinition, EvalResult, EvalSuiteResponse, ToolEvent } from "./types";

export const capabilities: CapabilityDefinition[] = [
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

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function validateToolRouting(
  expectedTools: string[],
  observedTools: string[]
): Array<{ check: string; passed: boolean; detail: string }> {
  const observedSet = new Set(observedTools);
  const checks: Array<{ check: string; passed: boolean; detail: string }> = [];

  for (const tool of expectedTools) {
    const found = observedSet.has(tool);
    checks.push({
      check: `tool_called:${tool}`,
      passed: found,
      detail: found
        ? `${tool} was called as expected.`
        : `${tool} was expected but not called. Observed: [${observedTools.join(", ")}].`
    });
  }

  return checks;
}

function validateComplianceVerdict(
  toolEvents: ToolEvent[],
  expectedBehavior: string
): Array<{ check: string; passed: boolean; detail: string }> {
  const checks: Array<{ check: string; passed: boolean; detail: string }> = [];
  const complianceEvent = toolEvents.find((e) => e.name === "check_compliance");
  if (!complianceEvent) return checks;

  const result = complianceEvent.result as { verdict?: string } | undefined;
  if (!result?.verdict) {
    checks.push({
      check: "compliance_verdict_present",
      passed: false,
      detail: "check_compliance was called but returned no verdict."
    });
    return checks;
  }

  const lowerBehavior = expectedBehavior.toLowerCase();
  let expectedVerdict: string | null = null;
  if (lowerBehavior.includes("not allowed")) expectedVerdict = "not allowed";
  else if (lowerBehavior.includes("review required")) expectedVerdict = "review required";
  else if (lowerBehavior.includes("allowed")) expectedVerdict = "allowed";

  if (expectedVerdict) {
    const verdictMatch = result.verdict.toLowerCase() === expectedVerdict;
    checks.push({
      check: `compliance_verdict:${expectedVerdict}`,
      passed: verdictMatch,
      detail: verdictMatch
        ? `Verdict "${result.verdict}" matches expected "${expectedVerdict}".`
        : `Verdict "${result.verdict}" does not match expected "${expectedVerdict}".`
    });
  }

  return checks;
}

function validateWorkflowSections(
  toolEvents: ToolEvent[]
): Array<{ check: string; passed: boolean; detail: string }> {
  const checks: Array<{ check: string; passed: boolean; detail: string }> = [];
  const workflowEvent = toolEvents.find((e) => e.name === "design_agentic_workflow");
  if (!workflowEvent) return checks;

  const result = workflowEvent.result as { required_sections?: string[]; recommended_pattern?: unknown } | undefined;

  // Check that required_sections exist in the workflow output
  if (result?.required_sections && Array.isArray(result.required_sections)) {
    const hasSections = result.required_sections.length > 0;
    checks.push({
      check: "workflow_required_sections",
      passed: hasSections,
      detail: hasSections
        ? `Workflow output includes ${result.required_sections.length} required sections.`
        : "Workflow output has an empty required_sections array."
    });
  } else {
    checks.push({
      check: "workflow_required_sections",
      passed: false,
      detail: "Workflow output is missing the required_sections field."
    });
  }

  // Check that a recommended_pattern was returned
  if (result?.recommended_pattern) {
    checks.push({
      check: "workflow_recommended_pattern",
      passed: true,
      detail: "Workflow output includes a recommended pattern."
    });
  } else {
    checks.push({
      check: "workflow_recommended_pattern",
      passed: false,
      detail: "Workflow output is missing a recommended pattern."
    });
  }

  return checks;
}

function validateProjectLookup(
  toolEvents: ToolEvent[],
  expectedBehavior: string
): Array<{ check: string; passed: boolean; detail: string }> {
  const checks: Array<{ check: string; passed: boolean; detail: string }> = [];
  if (!expectedBehavior.toLowerCase().includes("no exact project")) return checks;

  const projectEvent = toolEvents.find((event) => event.name === "get_project_status");
  const result = projectEvent?.result as { found?: boolean } | undefined;
  const projectWasNotFound = result?.found === false;
  checks.push({
    check: "project_not_found_guardrail",
    passed: projectWasNotFound,
    detail: projectWasNotFound
      ? "Unknown project prompt returned found=false instead of invented project facts."
      : "Unknown project prompt did not return the expected found=false guardrail."
  });

  return checks;
}

function validateWeeklyUpdateWorkflow(
  toolEvents: ToolEvent[],
  expectedBehavior: string
): Array<{ check: string; passed: boolean; detail: string }> {
  const checks: Array<{ check: string; passed: boolean; detail: string }> = [];
  if (!expectedBehavior.toLowerCase().includes("execute the sample workflow")) return checks;

  const workflowEvent = toolEvents.find((event) => event.name === "run_weekly_update_workflow");
  const result = workflowEvent?.result as
    | {
        found?: boolean;
        source_artifacts?: { meeting_notes?: unknown[]; risk_log?: unknown[] };
        drafted_update?: string;
        approval_status?: { status?: string };
      }
    | undefined;

  checks.push({
    check: "weekly_update_sources_present",
    passed: Boolean(result?.source_artifacts?.meeting_notes?.length && result.source_artifacts.risk_log?.length),
    detail: "Workflow output should include meeting notes and risk log source artifacts."
  });
  checks.push({
    check: "weekly_update_draft_present",
    passed: Boolean(result?.drafted_update?.includes("Weekly Client Update")),
    detail: "Workflow output should include a generated weekly client update draft."
  });
  checks.push({
    check: "weekly_update_review_gate",
    passed: result?.approval_status?.status === "human review required",
    detail: "Workflow output should stop at a human review gate before client-facing use."
  });

  return checks;
}

// ---------------------------------------------------------------------------
// Main eval runner
// ---------------------------------------------------------------------------

export function runEvalSuite(): EvalSuiteResponse {
  const results: EvalResult[] = evalCases.cases.map((testCase) => {
    const toolEvents = createDeterministicToolPlan(testCase.prompt).toolEvents;
    const observedTools = Array.from(new Set(toolEvents.map((e) => e.name)));

    // Collect all checks
    const checks: Array<{ check: string; passed: boolean; detail: string }> = [];

    // 1. Tool routing checks
    checks.push(...validateToolRouting(testCase.expected_tools, observedTools));

    // 2. Compliance verdict checks (when applicable)
    checks.push(...validateComplianceVerdict(toolEvents, testCase.expected_behavior));

    // 3. Workflow section checks (when applicable)
    checks.push(...validateWorkflowSections(toolEvents));

    // 4. Unknown project guardrail checks (when applicable)
    checks.push(...validateProjectLookup(toolEvents, testCase.expected_behavior));

    // 5. Executed workflow checks (when applicable)
    checks.push(...validateWeeklyUpdateWorkflow(toolEvents, testCase.expected_behavior));

    const allChecksPassed = checks.length > 0 && checks.every((c) => c.passed);
    const failedChecks = checks.filter((c) => !c.passed);

    return {
      id: testCase.id,
      prompt: testCase.prompt,
      expectedTools: testCase.expected_tools,
      observedTools,
      passed: allChecksPassed,
      expectedBehavior: testCase.expected_behavior,
      notes: allChecksPassed
        ? `All ${checks.length} checks passed against real tool outputs.`
        : `${failedChecks.length} of ${checks.length} checks failed: ${failedChecks.map((c) => c.check).join(", ")}.`,
      checks
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    passCount: results.filter((result) => result.passed).length,
    totalCount: results.length,
    results
  };
}
