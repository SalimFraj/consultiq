import { Braces, BriefcaseBusiness, Database, MessageSquare, Workflow } from "lucide-react";
import type { ChatMode } from "@/lib/types";

type ChatHeaderProps = {
  mode: ChatMode;
  messageCount: number;
  toolCallCount: number;
  toolCallLimit: number;
};

export default function ChatHeader({ mode, messageCount, toolCallCount, toolCallLimit }: ChatHeaderProps) {
  return (
    <header className="border-b border-white/10 bg-ink-900/90 px-3 py-3 sm:px-4 lg:px-6 lg:py-4">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-xs text-emerald-100">
              {mode === "workflow" ? <Workflow size={13} aria-hidden="true" /> : <MessageSquare size={13} aria-hidden="true" />}
              {mode === "workflow" ? "Run Workflow" : "Ask ConsultIQ"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400">
              <Database size={13} aria-hidden="true" />
              Northstar sample packet
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400">
              <BriefcaseBusiness size={13} aria-hidden="true" />
              Business to software bridge
            </span>
          </div>
          <h2 className="max-w-full break-words text-lg font-semibold tracking-normal text-white sm:text-xl">
            {mode === "workflow" ? "Execute the governed reporting workflow" : "Inspect policy, project state, compliance, or drafts"}
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center md:min-w-64">
          <div className="rounded-md border border-white/10 px-2 py-2 sm:px-3">
            <p className="text-sm font-semibold text-white">{messageCount}</p>
            <p className="text-[11px] text-slate-500">Messages</p>
          </div>
          <div className="rounded-md border border-white/10 px-2 py-2 sm:px-3">
            <p className="inline-flex items-center justify-center gap-1 text-sm font-semibold text-white">
              <Braces size={13} aria-hidden="true" />
              {toolCallCount}
            </p>
            <p className="text-[11px] text-slate-500">
              <span className="sm:hidden">Tools</span>
              <span className="hidden sm:inline">Tool calls</span>
            </p>
          </div>
          <div className="rounded-md border border-white/10 px-2 py-2 sm:px-3">
            <p className="text-sm font-semibold text-white">{toolCallLimit}</p>
            <p className="text-[11px] text-slate-500">
              <span className="sm:hidden">Cap</span>
              <span className="hidden sm:inline">Call cap</span>
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
