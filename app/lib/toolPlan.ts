import { runTool, toolLabels, type ToolName } from "./tools";
import type { ChatMode, ToolEvent } from "./types";

export type DeterministicScenario =
  | "workflow"
  | "weekly_update"
  | "project_status"
  | "compliance"
  | "document"
  | "expense"
  | "knowledge";

export type DeterministicToolPlan = {
  scenario: DeterministicScenario;
  prompt: string;
  toolEvents: ToolEvent[];
};

function pushTool(
  toolEvents: ToolEvent[],
  name: ToolName,
  args: Record<string, unknown>,
  result: unknown,
  durationMs = 1
) {
  toolEvents.push({
    id: `${name}-${toolEvents.length}`,
    name,
    label: toolLabels[name],
    args,
    result,
    status: "completed",
    durationMs
  });
}

function extractProjectReference(lower: string) {
  if (lower.includes("northstar")) return "Project Northstar";
  if (lower.includes("atlas")) return "Atlas Migration";
  if (lower.includes("meridian")) return "Project Meridian";

  const projectAfter = lower.match(/project\s+([a-z0-9][a-z0-9\s-]*?)(?:[?.!,]|$)/);
  if (projectAfter?.[1]) return projectAfter[1].trim();

  const projectBefore = lower.match(/([a-z0-9][a-z0-9\s-]*?)\s+project(?:[?.!,]|$)/);
  if (projectBefore?.[1]) return projectBefore[1].trim();

  return "";
}

function documentTypeForPrompt(lower: string) {
  if (lower.includes("agenda")) return "meeting agenda";
  if (lower.includes("risk")) return "risk summary";
  if (lower.includes("status")) return "status update";
  return "brief";
}

export function createDeterministicToolPlan(prompt: string, mode: ChatMode = "assistant"): DeterministicToolPlan {
  const lower = prompt.toLowerCase();
  const toolEvents: ToolEvent[] = [];

  if (
    lower.includes("run weekly update workflow") ||
    lower.includes("weekly update workflow") ||
    lower.includes("90-second reviewer path") ||
    lower.includes("sample notes and risk log")
  ) {
    const projectArgs = { project_id: extractProjectReference(lower) || "Project Northstar" };
    const workflowArgs = { project_id: projectArgs.project_id };
    const complianceArgs = {
      action: `Draft a weekly client update for ${projectArgs.project_id} using project notes and risk logs.`
    };

    pushTool(toolEvents, "get_project_status", projectArgs, runTool("get_project_status", projectArgs));
    pushTool(toolEvents, "run_weekly_update_workflow", workflowArgs, runTool("run_weekly_update_workflow", workflowArgs));
    pushTool(toolEvents, "check_compliance", complianceArgs, runTool("check_compliance", complianceArgs));

    return { scenario: "weekly_update", prompt, toolEvents };
  }

  if (
    mode === "workflow" ||
    lower.includes("workflow") ||
    lower.includes("prototype brief") ||
    lower.includes("automating") ||
    lower.includes("status reporting")
  ) {
    const workflowArgs = { problem: prompt };
    const knowledgeArgs = {
      query: "AI Lab prototype intake client communication production readiness engagement delivery"
    };
    const complianceArgs = { action: prompt };
    const documentArgs = { type: "AI Lab prototype brief", context: prompt };

    pushTool(toolEvents, "design_agentic_workflow", workflowArgs, runTool("design_agentic_workflow", workflowArgs));
    pushTool(toolEvents, "search_knowledge_base", knowledgeArgs, runTool("search_knowledge_base", knowledgeArgs));
    pushTool(toolEvents, "check_compliance", complianceArgs, runTool("check_compliance", complianceArgs));
    pushTool(toolEvents, "generate_document", documentArgs, runTool("generate_document", documentArgs));

    return { scenario: "workflow", prompt, toolEvents };
  }

  if (lower.includes("northstar") || lower.includes("project")) {
    const projectArgs = { project_id: extractProjectReference(lower) };
    const templateArgs = { query: "project status template" };

    pushTool(toolEvents, "get_project_status", projectArgs, runTool("get_project_status", projectArgs));
    pushTool(toolEvents, "search_knowledge_base", templateArgs, runTool("search_knowledge_base", templateArgs));

    if (lower.includes("draft") || lower.includes("brief") || lower.includes("agenda") || lower.includes("status update")) {
      const documentArgs = { type: documentTypeForPrompt(lower), context: prompt };
      pushTool(toolEvents, "generate_document", documentArgs, runTool("generate_document", documentArgs));
    }

    return { scenario: "project_status", prompt, toolEvents };
  }

  if (
    lower.includes("compliant") ||
    lower.includes("financial data") ||
    lower.includes("third-party") ||
    lower.includes("credentials") ||
    lower.includes("credential") ||
    lower.includes("unapproved")
  ) {
    const complianceArgs = { action: prompt };
    pushTool(toolEvents, "check_compliance", complianceArgs, runTool("check_compliance", complianceArgs));
    return { scenario: "compliance", prompt, toolEvents };
  }

  if (lower.includes("risk summary") || lower.includes("draft") || lower.includes("agenda")) {
    const knowledgeArgs = {
      query: "engagement delivery risk project status template client communication"
    };
    const documentArgs = { type: documentTypeForPrompt(lower), context: prompt };

    pushTool(toolEvents, "search_knowledge_base", knowledgeArgs, runTool("search_knowledge_base", knowledgeArgs));
    pushTool(toolEvents, "generate_document", documentArgs, runTool("generate_document", documentArgs));
    return { scenario: "document", prompt, toolEvents };
  }

  if (lower.includes("expense") || lower.includes("entertainment")) {
    const knowledgeArgs = { query: prompt };
    pushTool(toolEvents, "search_knowledge_base", knowledgeArgs, runTool("search_knowledge_base", knowledgeArgs));
    return { scenario: "expense", prompt, toolEvents };
  }

  const knowledgeArgs = { query: prompt };
  pushTool(toolEvents, "search_knowledge_base", knowledgeArgs, runTool("search_knowledge_base", knowledgeArgs));
  return { scenario: "knowledge", prompt, toolEvents };
}

export function firstToolResult<T>(plan: DeterministicToolPlan, name: ToolName) {
  return plan.toolEvents.find((event) => event.name === name)?.result as T | undefined;
}
