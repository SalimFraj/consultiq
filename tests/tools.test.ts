import { describe, expect, it } from "vitest";
import { checkCompliance, designAgenticWorkflow, searchKnowledgeBase } from "../app/lib/tools";

describe("local tool layer", () => {
  it("requires review for client financial data shared with a vendor", () => {
    const result = checkCompliance("Share a client's financial data with a third-party vendor for analysis");

    expect(result.verdict).toBe("review required");
    expect(result.matched_rules.some((rule) => rule.id === "rule_001")).toBe(true);
  });

  it("blocks raw credentials in unapproved services", () => {
    const result = checkCompliance("Upload raw client credentials to an unapproved automation service");

    expect(result.verdict).toBe("not allowed");
    expect(result.matched_rules.some((rule) => rule.id === "rule_006")).toBe(true);
  });

  it("retrieves relevant AI policy guidance", () => {
    const result = searchKnowledgeBase("policy on using AI tools with client data");

    expect(result.documents.length).toBeGreaterThan(0);
    expect(result.documents.map((document) => document.title).join(" ")).toMatch(/AI|Client|Confidentiality/i);
  });

  it("returns safe fallback documents when no knowledge result matches", () => {
    const result = searchKnowledgeBase("quantum banana procurement orbit");

    expect(result.count).toBe(0);
    expect(result.documents.length).toBeGreaterThan(0);
  });

  it("designs a workflow with required sections and human gates", () => {
    const result = designAgenticWorkflow("Manually reconcile weekly risk logs across disconnected tools");

    expect(result.required_sections).toContain("proposed agentic workflow");
    expect(result.recommended_pattern).toBeTruthy();
    expect(result.recommended_autonomy_level).toBeTruthy();
    expect(result.default_human_gates.length).toBeGreaterThan(0);
  });
});
