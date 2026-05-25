import { describe, expect, it } from "vitest";
import { runEvalSuite } from "../app/lib/evals";

describe("portfolio eval suite", () => {
  it("passes deterministic tool-plan regression cases with detailed checks", () => {
    const suite = runEvalSuite();

    expect(suite.totalCount).toBeGreaterThanOrEqual(8);
    expect(suite.passCount).toBe(suite.totalCount);
    expect(suite.results.every((result) => result.checks && result.checks.length > 0)).toBe(true);
  });

  it("includes a not-allowed compliance scenario", () => {
    const suite = runEvalSuite();
    const credentialCase = suite.results.find((result) => result.id === "eval_005");

    expect(credentialCase?.observedTools).toContain("check_compliance");
    expect(credentialCase?.checks?.some((check) => check.check === "compliance_verdict:not allowed")).toBe(true);
  });

  it("guards against inventing unknown project facts", () => {
    const suite = runEvalSuite();
    const unknownProjectCase = suite.results.find((result) => result.id === "eval_009");

    expect(unknownProjectCase?.passed).toBe(true);
    expect(unknownProjectCase?.checks?.some((check) => check.check === "project_not_found_guardrail")).toBe(true);
  });
});
