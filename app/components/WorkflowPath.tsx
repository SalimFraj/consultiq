import type { LucideIcon } from "lucide-react";
import { CheckCircle2, CircleDashed } from "lucide-react";

export type WorkflowPathStep = {
  icon: LucideIcon;
  label: string;
  description: string;
  status?: "complete" | "active" | "pending";
};

type WorkflowPathProps = {
  steps: WorkflowPathStep[];
  compact?: boolean;
};

const statusClasses: Record<NonNullable<WorkflowPathStep["status"]>, string> = {
  complete: "border-emerald-300/35 bg-emerald-300/15 text-emerald-50",
  active: "border-sky-300/35 bg-sky-300/15 text-sky-50",
  pending: "border-white/10 bg-white/[0.03] text-slate-300"
};

export default function WorkflowPath({ steps, compact = false }: WorkflowPathProps) {
  return (
    <div className="rounded-md border border-white/10 bg-ink-950/45 p-3">
      <ol className={`relative grid gap-3 ${compact ? "sm:grid-cols-5" : "sm:grid-cols-2 lg:grid-cols-5"}`}>
        {steps.map((step, index) => {
          const Icon = step.icon;
          const status = step.status ?? "pending";
          const isLast = index === steps.length - 1;

          return (
            <li key={`${step.label}-${index}`} className="relative">
              {!isLast ? (
                <span
                  className="absolute left-4 top-8 h-[calc(100%+0.75rem)] w-px bg-gradient-to-b from-emerald-300/40 to-white/10 sm:left-11 sm:right-3 sm:top-7 sm:h-px sm:w-auto"
                  aria-hidden="true"
                />
              ) : null}
              <div className={`relative z-10 h-full rounded-md border p-3 ${statusClasses[status]}`}>
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-white/10 bg-ink-950/70">
                    {status === "complete" ? (
                      <CheckCircle2 size={15} className="text-emerald-200" aria-hidden="true" />
                    ) : status === "active" ? (
                      <Icon size={15} className="text-sky-200" aria-hidden="true" />
                    ) : (
                      <CircleDashed size={15} className="text-slate-400" aria-hidden="true" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block break-words text-sm font-semibold text-white">{step.label}</span>
                    <span className="mt-1 block break-words text-xs leading-5 text-slate-400">{step.description}</span>
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
