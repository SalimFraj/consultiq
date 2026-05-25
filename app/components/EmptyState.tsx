import { FileText, FlaskConical, MessageSquare, ShieldCheck, Workflow } from "lucide-react";

const workbenchSteps = [
  {
    icon: MessageSquare,
    step: "1",
    title: "Intake",
    description: "Capture the operational problem, target users, and measurable pain."
  },
  {
    icon: Workflow,
    step: "2",
    title: "Workflow",
    description: "Map handoffs, candidate tools, autonomy level, and decision boundaries."
  },
  {
    icon: ShieldCheck,
    step: "3",
    title: "Governance",
    description: "Check data, policy, compliance, and human-review requirements."
  },
  {
    icon: FlaskConical,
    step: "4",
    title: "Prototype",
    description: "Produce MVP scope, eval checks, and production-readiness criteria."
  }
];

export default function EmptyState() {
  return (
    <>
      <div className="animate-fade-in overflow-hidden rounded-md border border-white/10 bg-ink-850">
        <div className="grid gap-0 md:grid-cols-[1.25fr_0.75fr]">
          <div className="p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">First Run</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-normal text-white">
              Start from the business problem, not the model.
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              The strongest demo path is Workflow Builder Mode: describe an internal operational pain and let ConsultIQ map the workflow, call local tools, check governance, and produce a prototype brief.
            </p>
          </div>
          <div className="border-t border-white/10 bg-white/[0.03] p-5 md:border-l md:border-t-0">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Portfolio Signal</p>
            <div className="mt-3 space-y-3 text-sm text-slate-300">
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

      <div className="grid gap-3 md:grid-cols-4">
        {workbenchSteps.map(({ icon: Icon, step, title, description }, index) => (
          <div
            key={step}
            className="animate-fade-in-up rounded-md border border-white/10 bg-white/[0.03] p-3"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Step {step}</p>
              <Icon size={16} className="text-slate-400" aria-hidden="true" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-white">{title}</h3>
            <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
          </div>
        ))}
      </div>
    </>
  );
}
