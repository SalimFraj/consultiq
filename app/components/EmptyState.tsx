import {
  CheckCircle2,
  Database,
  FileText,
  FlaskConical,
  MessageSquare,
  PlayCircle,
  ShieldCheck,
  Workflow
} from "lucide-react";
import WorkflowPath, { type WorkflowPathStep } from "./WorkflowPath";

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
    <>
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
            <div className="mt-4 grid gap-2 rounded-md border border-sky-300/20 bg-sky-300/[0.05] p-3 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Before</p>
                <p className="mt-1 text-slate-300">60-90 minutes assembling weekly updates by hand.</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">After</p>
                <p className="mt-1 text-slate-300">Review-ready draft with source trace and risk movement.</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Control</p>
                <p className="mt-1 text-slate-300">Accountable owner and human review before handoff.</p>
              </div>
            </div>
            <div className="mt-4 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300">
              <span className="text-slate-100">Flow:</span> source packet {"->"} bounded tools {"->"} review gate {"->"} draft packet.
            </div>
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
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Run Schematic</p>
            <div className="mt-4 rounded-md border border-white/10 bg-ink-950/55 p-3">
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3">
                <div className="flex h-9 w-9 items-center justify-center rounded border border-sky-300/25 bg-sky-300/10 text-sky-100">
                  <Database size={16} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">Source packet</p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">Notes, decisions, risks</p>
                </div>
                <div className="justify-self-center h-7 w-px bg-white/10" aria-hidden="true" />
                <div className="flex items-center">
                  <div className="h-px flex-1 bg-gradient-to-r from-sky-300/45 to-emerald-300/25" aria-hidden="true" />
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded border border-emerald-300/25 bg-emerald-300/10 text-emerald-100">
                  <Workflow size={16} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">Bounded tools</p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">5-call cap, local artifacts</p>
                </div>
                <div className="justify-self-center h-7 w-px bg-white/10" aria-hidden="true" />
                <div className="flex items-center">
                  <div className="h-px flex-1 bg-gradient-to-r from-emerald-300/45 to-amber-300/25" aria-hidden="true" />
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded border border-amber-300/25 bg-amber-300/10 text-amber-100">
                  <ShieldCheck size={16} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">Review gate</p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">Client-facing approval</p>
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded border border-white/10 bg-ink-950/45 px-2 py-2">
                <CheckCircle2 size={14} className="text-emerald-200" aria-hidden="true" />
                <p className="mt-1 text-[11px] leading-4 text-slate-400">Rules pass</p>
              </div>
              <div className="rounded border border-white/10 bg-ink-950/45 px-2 py-2">
                <FileText size={14} className="text-sky-200" aria-hidden="true" />
                <p className="mt-1 text-[11px] leading-4 text-slate-400">Draft ready</p>
              </div>
              <div className="rounded border border-white/10 bg-ink-950/45 px-2 py-2">
                <FlaskConical size={14} className="text-amber-200" aria-hidden="true" />
                <p className="mt-1 text-[11px] leading-4 text-slate-400">Evals visible</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="animate-fade-in-up">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Workflow Path</p>
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400">4 governed steps</span>
        </div>
        <WorkflowPath
          steps={workbenchSteps.map((step, index) => ({
            ...step,
            status: index === 0 ? "active" : "pending"
          }))}
        />
      </div>
    </>
  );
}
