import {
  FlaskConical,
  MessageSquare,
  PlayCircle,
  ShieldCheck,
  Workflow
} from "lucide-react";
import type { WorkflowPathStep } from "./WorkflowPath";

const workbenchSteps: WorkflowPathStep[] = [
  {
    icon: MessageSquare,
    label: "Read Sources",
    description: "Load fake project notes, meeting notes, decisions, and risk logs."
  },
  {
    icon: Workflow,
    label: "Run Process",
    description: "Pull project status, detect risks, and assemble the weekly update."
  },
  {
    icon: ShieldCheck,
    label: "Review Gate",
    description: "Flag client-facing approval requirements before anything is used."
  },
  {
    icon: FlaskConical,
    label: "Output",
    description: "Produce an approval-ready update plus traceable evidence."
  }
];

type EmptyStateProps = {
  onRunWorkflow: () => void;
  onRunGuidedDemo: () => void;
};

export default function EmptyState({ onRunWorkflow, onRunGuidedDemo }: EmptyStateProps) {
  return (
    <div className="animate-fade-in overflow-hidden rounded-md border border-white/10 bg-ink-850">
      <div className="grid gap-0 md:grid-cols-[1.25fr_0.75fr]">
        <div className="p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Northstar Runbook</p>
          <h3 className="mt-2 text-xl font-semibold tracking-normal text-white sm:text-2xl">
            Turn scattered project evidence into a governed update.
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            This path starts with a real consulting operating problem: meeting notes, project facts, risk logs, and client-facing review rules are spread across different sources.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onRunGuidedDemo}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-emerald-200/40 bg-emerald-300 px-4 py-2 text-sm font-semibold text-ink-950 shadow-[0_10px_30px_rgba(110,231,183,0.18)] hover:bg-emerald-200 sm:w-auto"
            >
              <PlayCircle size={17} aria-hidden="true" />
              Start guided recruiter review
            </button>
            <button
              type="button"
              onClick={onRunWorkflow}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/[0.06] sm:w-auto"
            >
              <Workflow size={16} aria-hidden="true" />
              Run workflow yourself
            </button>
          </div>
        </div>
        <div className="border-t border-white/10 bg-white/[0.03] p-4 sm:p-5 md:border-l md:border-t-0">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Workflow Path</p>
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400">4 governed steps</span>
          </div>
          <ol className="mt-4 space-y-3">
            {workbenchSteps.map((step, index) => {
              const Icon = step.icon;
              const active = index === 0;

              return (
                <li key={step.label} className="relative flex gap-3">
                  {index < workbenchSteps.length - 1 ? (
                    <span className="absolute bottom-0 left-4 top-9 w-px bg-gradient-to-b from-emerald-300/35 to-white/10" aria-hidden="true" />
                  ) : null}
                  <span
                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded border ${
                      active
                        ? "border-sky-300/35 bg-sky-300/15 text-sky-100"
                        : "border-white/10 bg-ink-950/70 text-slate-300"
                    }`}
                  >
                    <Icon size={15} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1 rounded-md border border-white/10 bg-ink-950/45 px-3 py-2">
                    <span className="block text-sm font-semibold text-white">{step.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-400">{step.description}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
