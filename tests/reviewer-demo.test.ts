import { describe, expect, it } from "vitest";
import { POST } from "@/api/reviewer-demo/route";
import { createReviewerDecision, createReviewerDemo, reviewerTakeaways } from "@/lib/reviewerDemo";

describe("reviewer demo contract", () => {
  it("returns a complete, internally consistent evidence packet", () => {
    const response = createReviewerDemo();
    const evidenceIds = new Set(response.review.evidence.map((record) => record.id));

    expect(response.review.workflow.project?.name).toBe("Project Northstar");
    expect(response.review.lineage.length).toBeGreaterThan(0);
    expect(response.review.lineage.flatMap((claim) => claim.sourceIds)).toSatisfy(
      (sourceIds: string[]) => sourceIds.every((sourceId) => evidenceIds.has(sourceId))
    );
    expect(response.review.readiness.demonstrated.length).toBeGreaterThan(0);
    expect(response.review.readiness.simulated.length).toBeGreaterThan(0);
    expect(response.review.readiness.requiredForProduction.length).toBeGreaterThan(0);
    expect(response.review.recommendation.decision).toContain("internal MVP");
    expect(response.flags.humanReviewRequired).toBe(true);
    expect(response.flags.complianceWarning).toBe(true);
    expect(response.metadata.model).toBe("reviewer-demo: deterministic workflow");
    expect(reviewerTakeaways).toHaveLength(6);
  });

  it("creates explicit simulated audit decisions for the current run", () => {
    const runId = "review_test";
    const decision = createReviewerDecision(runId, "request_changes", "Add identity controls.");

    expect(decision.runId).toBe(runId);
    expect(decision.decision).toBe("request_changes");
    expect(decision.label).toBe("Request changes");
    expect(decision.reviewer).toContain("simulated");
    expect(decision.note).toBe("Add identity controls.");
    expect(Number.isNaN(Date.parse(decision.timestamp))).toBe(false);
  });

  it("serves the reviewer packet through a no-store API route", async () => {
    const response = await POST();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(payload.review.lineage.length).toBeGreaterThan(0);
    expect(payload.toolEvents.map((event: { name: string }) => event.name)).toEqual([
      "get_project_status",
      "run_weekly_update_workflow",
      "check_compliance"
    ]);
  });
});
