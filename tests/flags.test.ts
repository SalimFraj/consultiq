import { describe, expect, it } from "vitest";
import { detectFlags } from "../app/lib/gemini";
import type { ToolEvent } from "../app/lib/types";

function toolEvent(result: unknown): ToolEvent {
  return {
    id: "tool_test",
    name: "check_compliance",
    label: "Compliance Triage",
    args: {},
    result,
    status: "completed",
    durationMs: 1
  };
}

describe("response flag detection", () => {
  it("does not treat capability-list greetings as review-gated compliance answers", () => {
    const message =
      "Hello! I can help with searching the knowledge base, getting project status, checking compliance, and generating document drafts.";

    expect(detectFlags(message, [])).toEqual({
      uncertainty: false,
      complianceWarning: false,
      humanReviewRequired: false
    });
  });

  it("flags deterministic compliance verdicts from tool results", () => {
    expect(detectFlags("The policy result is available.", [toolEvent({ verdict: "review required" })])).toMatchObject({
      complianceWarning: true,
      humanReviewRequired: true
    });
  });

  it("flags explicit uncertainty without requiring a review gate", () => {
    expect(detectFlags("I do not have enough information to answer that.", [])).toEqual({
      uncertainty: true,
      complianceWarning: false,
      humanReviewRequired: false
    });
  });
});
