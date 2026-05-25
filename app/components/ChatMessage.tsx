import DocumentPreview from "./DocumentPreview";
import ToolCallIndicator from "./ToolCallIndicator";
import type { AssistantMetadata, ToolEvent } from "@/lib/types";
import { AlertTriangle, Bot, CheckCircle2, UserRound } from "lucide-react";

export type UIMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolEvents?: ToolEvent[];
  metadata?: AssistantMetadata;
  flags?: {
    uncertainty: boolean;
    complianceWarning: boolean;
    humanReviewRequired: boolean;
  };
};

type ChatMessageProps = {
  message: UIMessage;
};

export default function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";
  const isFallback = Boolean(
    message.metadata?.model.includes("fallback") || message.metadata?.model.startsWith("groq:")
  );
  const tokenEstimate =
    message.metadata?.estimatedOutputTokens ?? Math.max(1, Math.ceil(message.content.length / 4));
  const shouldRenderDocument = isAssistant && /(^|\n)#\s/.test(message.content);

  return (
    <article className={`flex ${isAssistant ? "justify-start" : "justify-end"} ${isAssistant ? "animate-slide-in-left" : "animate-slide-in-right"}`}>
      <div className={`w-full max-w-3xl rounded-md border px-4 py-4 ${isAssistant ? "border-white/10 bg-ink-850" : "border-slate-500/30 bg-slate-800"}`}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            {isAssistant ? <Bot size={14} aria-hidden="true" /> : <UserRound size={14} aria-hidden="true" />}
            {isAssistant ? "ConsultIQ" : "You"}
          </p>
          <span className="text-xs text-slate-500">~{tokenEstimate} tokens</span>
        </div>

        {message.flags?.humanReviewRequired || message.flags?.complianceWarning || message.flags?.uncertainty ? (
          <div className="mb-3 rounded-md border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-sm text-amber-50">
            <div className="flex gap-2">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-200" aria-hidden="true" />
              <div>
                <p className="font-medium">Review gate active</p>
                <p className="mt-1 text-amber-100/85">
                  {isFallback
                    ? message.metadata?.model.startsWith("groq:")
                      ? "Gemini was unavailable or quota-limited, so ConsultIQ used local deterministic tools with Groq for final synthesis."
                      : "Live provider quota was reached, so ConsultIQ used the deterministic local fallback with the same fake static tools."
                    : message.flags?.uncertainty
                    ? "This response used a fallback or contains uncertainty. Confirm with the relevant process owner before acting."
                    : "Human review is required before using this output for client-facing, production, or sensitive decisions."}
                </p>
                {message.flags?.complianceWarning ? (
                  <p className="mt-1 inline-flex items-center gap-1.5 text-amber-100/85">
                    <CheckCircle2 size={14} className="text-emerald-200" aria-hidden="true" />
                    Compliance result should follow the deterministic rule output.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {shouldRenderDocument ? (
          <DocumentPreview content={message.content} />
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">{message.content}</p>
        )}

        {isAssistant ? <ToolCallIndicator events={message.toolEvents ?? []} /> : null}

        {message.metadata ? (
          <footer className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-white/10 pt-3 text-xs text-slate-500">
            <span>Model: {message.metadata.model}</span>
            <span>Latency: {message.metadata.latencyMs}ms</span>
            <span>Tools: {message.metadata.toolsUsed.length > 0 ? message.metadata.toolsUsed.join(", ") : "none"}</span>
            {message.metadata.providerError ? (
              <span className="text-amber-300/70">Provider: {message.metadata.providerError}</span>
            ) : null}
          </footer>
        ) : null}
      </div>
    </article>
  );
}
