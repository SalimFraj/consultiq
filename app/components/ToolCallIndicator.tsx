import type { ToolEvent } from "@/lib/types";
import { CheckCircle2, ChevronDown, Loader2, Wrench } from "lucide-react";

type ToolCallIndicatorProps = {
  events: ToolEvent[];
  loading?: boolean;
  mode?: "assistant" | "workflow";
};

export default function ToolCallIndicator({ events, loading, mode = "assistant" }: ToolCallIndicatorProps) {
  if (!loading && events.length === 0) return null;

  return (
    <div className="animate-fade-in space-y-2 rounded-md border border-white/10 bg-ink-950/70 p-3">
      <div className="flex items-center justify-between">
        <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          <Wrench size={13} aria-hidden="true" />
          Tool Activity
        </p>
        {loading ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <Loader2 size={13} className="animate-spin" aria-hidden="true" />
            Running
          </span>
        ) : (
          <span className="text-xs text-slate-400">{events.length} calls</span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-2 w-full overflow-hidden rounded bg-white/10">
            <div className="h-2 w-1/3 animate-pulse rounded bg-slate-400" />
          </div>
          <div className="space-y-2">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-4 w-2/3" />
          </div>
          <p className="text-sm text-slate-300">
            {mode === "workflow"
              ? "Designing the workflow, selecting tools, and checking governance boundaries..."
              : "Reading the request, selecting approved tools, and preparing a grounded answer..."}
          </p>
        </div>
      ) : null}

      <div className="space-y-2">
        {events.map((event) => (
          <details key={event.id} className="group rounded border border-white/10 bg-white/[0.03]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-sm text-slate-200">
              <span className="inline-flex min-w-0 items-center gap-2">
                <CheckCircle2 size={15} className="shrink-0 text-emerald-200" aria-hidden="true" />
                <span className="truncate font-medium">{event.label}</span>
                <span className="shrink-0 text-xs text-slate-500">{event.durationMs}ms</span>
              </span>
              <ChevronDown size={15} className="shrink-0 text-slate-500 transition group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="border-t border-white/10 px-3 py-2">
              <p className="mb-1 text-xs uppercase tracking-[0.16em] text-slate-500">Arguments</p>
              <pre className="mb-3 max-h-40 overflow-auto rounded bg-black/20 p-2 text-xs text-slate-300">
                {JSON.stringify(event.args, null, 2)}
              </pre>
              <p className="mb-1 text-xs uppercase tracking-[0.16em] text-slate-500">Result</p>
              <pre className="max-h-64 overflow-auto rounded bg-black/20 p-2 text-xs text-slate-300">
                {JSON.stringify(event.result, null, 2)}
              </pre>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
