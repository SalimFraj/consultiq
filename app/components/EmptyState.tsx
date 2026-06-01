import { FileText, FlaskConical, MessageSquare, ShieldCheck, Workflow } from "lucide-react";
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
};

export default function EmptyState({ onRunWorkflow }: EmptyStateProps) {
  return (
    <>
      <div className="animate-fade-in overflow-hidden rounded-md border border-white/10 bg-ink-850">
        <div className="grid gap-0 md:grid-cols-[1.25fr_0.75fr]">
          <div className="p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">First Run</p>
            <h3 className="mt-2 text-xl font-semibold tracking-normal text-white sm:text-2xl">
              Run the weekly reporting workflow.
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              The strongest demo path executes the process end to end: read fake notes and risks, pull project facts, draft the update, and stop at a human review gate.
            </p>
            <button
              type="button"
              onClick={onRunWorkflow}
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-emerald-300/30 bg-emerald-300/15 px-4 py-2 text-sm font-medium text-emerald-50 hover:bg-emerald-300/25 sm:w-auto"
            >
              <Workflow size={16} aria-hidden="true" />
              Run weekly update workflow
            </button>
          </div>
          <div className="border-t border-white/10 bg-white/[0.03] p-4 sm:p-5 md:border-l md:border-t-0">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Portfolio Signal</p>
            <div className="mt-3 grid gap-3 text-sm text-slate-300 sm:grid-cols-3 md:block md:space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-200" aria-hidden="true" />
                Governed by local rules
              </div>
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-sky-200" aria-hidden="true" />
                Produces review-ready briefs
              </div>
              <div className="flex items-center gap-2">
                <FlaskConical size={16} className="text-amber-200" aria-hidden="true" />
                Includes eval visibility
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
