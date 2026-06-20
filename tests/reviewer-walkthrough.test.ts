import { describe, expect, it } from "vitest";
import { createDeterministicToolPlan } from "@/lib/toolPlan";
import {
  buildReviewerWalkthrough,
  formatReviewerTime,
  reviewerElapsedForStage,
  reviewerStageIndexForElapsed,
  reviewerStages,
  REVIEWER_WALKTHROUGH_SECONDS
} from "@/lib/reviewerWalkthrough";

describe("reviewer walkthrough", () => {
  it("maps the full 90-second run across six 15-second chapters", () => {
    expect(reviewerStages).toHaveLength(6);
    expect(reviewerStageIndexForElapsed(0)).toBe(0);
    expect(reviewerStageIndexForElapsed(14)).toBe(0);
    expect(reviewerStageIndexForElapsed(15)).toBe(1);
    expect(reviewerStageIndexForElapsed(74)).toBe(4);
    expect(reviewerStageIndexForElapsed(75)).toBe(5);
    expect(reviewerStageIndexForElapsed(REVIEWER_WALKTHROUGH_SECONDS)).toBe(5);
    expect(reviewerElapsedForStage(5)).toBe(75);
    expect(formatReviewerTime(REVIEWER_WALKTHROUGH_SECONDS)).toBe("01:30");
  });

  it("builds every reviewer chapter from the actual workflow result", () => {
    const plan = createDeterministicToolPlan("Run a 90-second reviewer path for ConsultIQ.", "workflow");
    const walkthrough = buildReviewerWalkthrough(plan.toolEvents);

    expect(walkthrough).not.toBeNull();
    expect(walkthrough?.workflow.project?.name).toBe("Project Northstar");
    expect(walkthrough?.toolEvents.map((event) => event.name)).toEqual([
      "get_project_status",
      "run_weekly_update_workflow",
      "check_compliance"
    ]);
    expect(walkthrough?.sourceCount).toBeGreaterThan(0);
    expect(walkthrough?.readinessScore).toBe(100);
    expect(walkthrough?.workflow.drafted_update).toContain("Weekly Client Update");
    expect(walkthrough?.workflow.approval_status?.status).toBe("human review required");
    expect(walkthrough?.workflow.accountability?.success_metric).toContain("60-90 minutes");
  });

  it("refuses to construct a guided review without structured workflow evidence", () => {
    expect(buildReviewerWalkthrough([])).toBeNull();
  });
});
