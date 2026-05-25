import Groq from "groq-sdk";
import { WORKFLOW_SECTIONS } from "./constants";
import type { ChatMode, ClientMessage, ToolEvent } from "./types";

export const GROQ_MODEL = "llama-3.3-70b-versatile";

function latestUserPrompt(messages: ClientMessage[]) {
  return [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
}

function systemPrompt(mode: ChatMode) {
  const base = `You are ConsultIQ, an enterprise AI Builder Workbench for a consulting firm AI Lab.
You are being used as a synthesis fallback after local deterministic tools have already run.
Use only the provided tool results. Do not invent project facts, policies, rule IDs, owners, or dates.
Compliance verdicts are deterministic. Explain them but do not override them. If a mandatory compliance verdict is provided, use that exact verdict phrase and do not combine it with a different verdict.
Do not mention provider fallback, quota, Gemini, or Groq in the final answer.
Cite only tools present in the provided tool results.`;

  if (mode === "workflow") {
    return `${base}
Write a complete AI Lab prototype brief. Start with "# AI Lab Prototype Brief".
Include every section in this exact order:
${WORKFLOW_SECTIONS.map((section) => `- ${section}`).join("\n")}
Keep it concise, practical, and portfolio-ready.`;
  }

  return `${base}
Write a concise professional answer with source/tool references where relevant.`;
}

export async function synthesizeWithGroq(messages: ClientMessage[], mode: ChatMode, toolEvents: ToolEvent[]) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const client = new Groq({ apiKey });
  const prompt = latestUserPrompt(messages);
  const complianceResult = toolEvents.find((event) => event.name === "check_compliance")?.result as
    | { verdict?: string; reasoning?: string; escalation?: string }
    | undefined;
  const verdictInstruction = complianceResult?.verdict
    ? `Mandatory compliance verdict: ${complianceResult.verdict}. Use this exact verdict phrase in the Compliance/Risk Assessment section. Do not write "allowed" if this verdict is "review required" or "not allowed".`
    : "";

  const completion = await client.chat.completions.create({
    model: process.env.GROQ_MODEL || GROQ_MODEL,
    temperature: 0.2,
    max_tokens: 1800,
    messages: [
      {
        role: "system",
        content: systemPrompt(mode)
      },
      {
        role: "user",
        content: `${verdictInstruction}

${JSON.stringify(
          {
            user_prompt: prompt,
            mode,
            local_tool_results: toolEvents.map((event) => ({
              tool: event.name,
              arguments: event.args,
              result: event.result
            }))
          },
          null,
          2
        )}`
      }
    ]
  });

  return completion.choices[0]?.message?.content ?? null;
}
