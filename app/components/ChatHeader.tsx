import { Database, MessageSquare, Workflow } from "lucide-react";
import type { ChatMode } from "@/lib/types";

type ChatHeaderProps = {
  mode: ChatMode;
  messageCount: number;
  toolCallCount: number;
};

export default function ChatHeader({ mode, messageCount, toolCallCount }: ChatHeaderProps) {
  return (
    <header className="border-b border-white/10 bg-ink-900/90 px-4 py-4 lg:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-xs text-emerald-100">
              {mode === "workflow" ? <Workflow size={13} aria-hidden="true" /> : <MessageSquare size={13} aria-hidden="true" />}
              {mode === "workflow" ? "Run Workflow" : "Ask ConsultIQ"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400">
              <Database size={13} aria-hidden="true" />
              Local static data
            </span>
          </div>
          <h2 className="text-xl font-semibold tracking-normal text-white">
            {mode === "workflow" ? "Execute a governed reporting workflow" : "Ask about policy, projects, compliance, or drafts"}
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md border border-white/10 px-3 py-2">
            <p className="text-sm font-semibold text-white">{messageCount}</p>
            <p className="text-[11px] text-slate-500">Messages</p>
          </div>
          <div className="rounded-md border border-white/10 px-3 py-2">
            <p className="text-sm font-semibold text-white">{toolCallCount}</p>
            <p className="text-[11px] text-slate-500">Tool calls</p>
          </div>
          <div className="rounded-md border border-white/10 px-3 py-2">
            <p className="text-sm font-semibold text-white">5</p>
            <p className="text-[11px] text-slate-500">Call cap</p>
          </div>
        </div>
      </div>
    </header>
  );
}
