import type { ToolEvent } from "@/lib/types";
import { CheckCircle2, ChevronDown, ClipboardCheck, Database, FileText, Loader2, ShieldCheck, Wrench } from "lucide-react";

type ToolCallIndicatorProps = {
  events: ToolEvent[];
  loading?: boolean;
  mode?: "assistant" | "workflow";
};

const workflowLoadingSteps = [
  { icon: Database, label: "Read sources", detail: "Project notes and risk logs" },
  { icon: Wrench, label: "Run tools", detail: "Bounded local functions" },
  { icon: ShieldCheck, label: "Check gate", detail: "Client-facing review rules" },
  { icon: FileText, label: "Draft output", detail: "Approval-ready brief" }
];

const assistantLoadingSteps = [
  { icon: Database, label: "Read request", detail: "Intent and context" },
  { icon: Wrench, label: "Select tools", detail: "Approved local sources" },
  { icon: ShieldCheck, label: "Preserve rules", detail: "Compliance boundary" },
  { icon: ClipboardCheck, label: "Compose answer", detail: "Grounded response" }
];

export default function ToolCallIndicator({ events, loading, mode = "assistant" }: ToolCallIndicatorProps) {
  if (!loading && events.length === 0) return null;
  const loadingSteps = mode === "workflow" ? workflowLoadingSteps : assistantLoadingSteps;

  if (!loading) {
    return (
      <details className="group mt-3 rounded-md border border-white/10 bg-ink-950/55">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-sm text-slate-200">
          <span className="inline-flex min-w-0 items-center gap-2">
            <Wrench size={14} className="shrink-0 text-slate-400" aria-hidden="true" />
            <span className="font-medium">Tool trace</span>
            <span className="text-xs text-slate-500">{events.length} calls</span>
          </span>
          <ChevronDown size={15} className="shrink-0 text-slate-500 transition group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="space-y-2 border-t border-white/10 p-3">
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
      </details>
    );
  }

  return (
    <div className="animate-fade-in space-y-3 rounded-md border border-white/10 bg-ink-950/70 p-3">
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
        <div className="rounded-md border border-emerald-300/20 bg-emerald-300/[0.04] p-3">
          <div className="h-2 w-full overflow-hidden rounded bg-white/10">
            <div className="animate-workflow-progress h-2 rounded bg-gradient-to-r from-emerald-300 via-sky-300 to-amber-200" />
          </div>
          <ol className="mt-4 grid gap-2 sm:grid-cols-4">
            {loadingSteps.map(({ icon: Icon, label, detail }, index) => (
              <li
                key={label}
                className="animate-fade-in-up rounded border border-white/10 bg-ink-950/65 p-3"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="flex items-start gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-white/10 bg-white/[0.04]">
                    <Icon size={14} className={index === 0 ? "text-emerald-200" : index === 1 ? "text-sky-200" : index === 2 ? "text-amber-200" : "text-slate-300"} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-slate-100">{label}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-slate-500">{detail}</span>
                  </span>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-3 flex items-center gap-2 rounded border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300">
            <Loader2 size={14} className="shrink-0 animate-spin text-emerald-200" aria-hidden="true" />
            <span>
              {mode === "workflow"
                ? "Running the governed workflow path with local tools and review checks."
                : "Preparing a grounded answer with the same governance boundary."}
            </span>
          </div>
        </div>
      ) : null}

    </div>
  );
}
