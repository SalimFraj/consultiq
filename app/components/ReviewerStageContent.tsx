import type { ReviewerWalkthroughData } from "@/lib/reviewerWalkthrough";
import { reviewerProductionGaps } from "@/lib/reviewerWalkthrough";
import { AlertTriangle, CheckCircle2, Database, FileText, ShieldCheck, UserRound, Wrench } from "lucide-react";
import DocumentPreview from "./DocumentPreview";

type ReviewerStageContentProps = {
  stageIndex: number;
  data: ReviewerWalkthroughData;
};

function ProblemStage({ data }: { data: ReviewerWalkthroughData }) {
  const { workflow } = data;
  return (
    <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
      <div>
        <p className="text-sm leading-6 text-slate-400">Business workflow</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">Weekly engagement status reporting</h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{workflow.value_summary?.before}</p>
        <div className="mt-5 border-l-2 border-emerald-300/60 pl-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-200">Target outcome</p>
          <p className="mt-2 text-sm leading-6 text-emerald-50/90">{workflow.value_summary?.after}</p>
        </div>
      </div>
      <dl className="grid content-start gap-px overflow-hidden rounded-md border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-1">
        {[
          ["Current effort", "60-90 minutes"],
          ["Target", "Reviewed draft under 15 minutes"],
          ["Project", workflow.project?.name ?? "Project Northstar"],
          ["Accountable owner", workflow.accountability?.business_owner ?? workflow.project?.owner]
        ].map(([label, value]) => (
          <div key={label} className="bg-ink-900 px-4 py-3">
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm font-medium text-white">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function EvidenceStage({ data }: { data: ReviewerWalkthroughData }) {
  const { workflow, sourceCount, sourceGroups } = data;
  const sources = workflow.source_artifacts ?? {};
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">Bounded source packet</p>
          <p className="mt-1 text-3xl font-semibold text-white">{sourceCount} artifacts</p>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-400">All content is fake local demo data. The workflow does not browse, infer missing project facts, or access external systems.</p>
      </div>
      <div className="grid gap-px overflow-hidden rounded-md border border-white/10 bg-white/10 sm:grid-cols-5">
        {sourceGroups.map((group) => (
          <div key={group.label} className="bg-ink-900 p-3">
            <p className="text-xl font-semibold text-white">{group.count}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{group.label}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="border-t border-white/10 pt-3">
          <h4 className="inline-flex items-center gap-2 text-sm font-medium text-white"><Database size={15} className="text-sky-200" />Source sample</h4>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
            {sources.meeting_notes?.slice(0, 2).map((note) => <li key={`${note.date}-${note.source}`}><span className="text-slate-500">{note.source}:</span> {note.note}</li>)}
          </ul>
        </section>
        <section className="border-t border-white/10 pt-3">
          <h4 className="text-sm font-medium text-white">Retrieved project facts</h4>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div><dt className="text-xs text-slate-500">Phase</dt><dd className="mt-1 text-slate-200">{workflow.project?.phase}</dd></div>
            <div><dt className="text-xs text-slate-500">Risk</dt><dd className="mt-1 text-slate-200">{workflow.project?.risk_level}</dd></div>
            <div><dt className="text-xs text-slate-500">Owner</dt><dd className="mt-1 text-slate-200">{workflow.project?.owner}</dd></div>
            <div><dt className="text-xs text-slate-500">Milestone</dt><dd className="mt-1 text-slate-200">{workflow.project?.next_milestone}</dd></div>
          </dl>
        </section>
      </div>
    </div>
  );
}

function ExecutionStage({ data }: { data: ReviewerWalkthroughData }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <section>
        <p className="text-sm text-slate-400">Observed tool calls</p>
        <div className="mt-3 divide-y divide-white/10 border-y border-white/10">
          {data.toolEvents.map((event, index) => (
            <div key={event.id} className="flex items-center gap-3 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-emerald-300/20 bg-emerald-300/10 text-emerald-100"><Wrench size={14} /></span>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-white">{event.name.replaceAll("_", " ")}</p><p className="mt-0.5 text-xs text-slate-500">Call {index + 1} of {data.toolEvents.length} · {event.status}</p></div>
              <span className="text-xs text-slate-500">{event.durationMs}ms</span>
            </div>
          ))}
        </div>
      </section>
      <section>
        <p className="text-sm text-slate-400">Audit trace</p>
        <ol className="mt-3 space-y-3">
          {data.workflow.execution_steps?.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm leading-6 text-slate-300"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 text-xs text-slate-400">{index + 1}</span><span>{step}</span></li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function OutputStage({ data }: { data: ReviewerWalkthroughData }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
      <div className="max-h-[46vh] overflow-y-auto">
        <DocumentPreview content={data.workflow.drafted_update ?? "No draft was returned."} label="Generated weekly update" />
      </div>
      <aside className="border-l border-white/10 pl-4">
        <FileText size={18} className="text-sky-200" />
        <p className="mt-3 text-sm font-medium text-white">Generated, not released</p>
        <p className="mt-2 text-xs leading-5 text-slate-400">The draft is grounded in the displayed packet and remains inside the workbench until the named reviewer approves it.</p>
      </aside>
    </div>
  );
}

function GovernanceStage({ data }: { data: ReviewerWalkthroughData }) {
  const { workflow } = data;
  const risks = workflow.source_artifacts?.risk_log ?? [];
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-md border border-amber-300/25 bg-amber-300/[0.06] p-4">
        <ShieldCheck size={20} className="text-amber-200" />
        <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-amber-100/70">Deterministic verdict</p>
        <h3 className="mt-1 text-xl font-semibold capitalize text-amber-50">{workflow.compliance_check?.verdict}</h3>
        <p className="mt-3 text-sm leading-6 text-amber-50/80">{workflow.compliance_check?.reasoning}</p>
        <div className="mt-4 border-t border-amber-300/20 pt-3"><p className="text-xs text-amber-100/70">Required reviewer</p><p className="mt-1 text-sm font-medium text-white">{workflow.approval_status?.required_reviewer}</p><p className="mt-2 text-xs leading-5 text-slate-400">{workflow.approval_status?.reason}</p></div>
      </section>
      <section>
        <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-medium text-white">Risks surfaced before approval</h3><span className="text-xs text-amber-200">{workflow.detected_risks?.increasing?.length ?? 0} increasing</span></div>
        <div className="mt-3 divide-y divide-white/10 border-y border-white/10">
          {risks.map((risk) => (
            <div key={risk.id} className="py-3"><div className="flex items-center gap-2"><AlertTriangle size={14} className={risk.trend === "increasing" ? "text-amber-200" : "text-slate-500"} /><p className="text-sm font-medium text-white">{risk.id} · {risk.severity}</p><span className="text-xs text-slate-500">{risk.trend}</span></div><p className="mt-2 text-xs leading-5 text-slate-400">{risk.risk}</p></div>
          ))}
        </div>
      </section>
    </div>
  );
}

function HandoffStage({ data }: { data: ReviewerWalkthroughData }) {
  const { workflow } = data;
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
      <section>
        <div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-md border border-emerald-300/25 bg-emerald-300/10 text-emerald-100"><span className="text-lg font-semibold">{data.readinessScore}</span></span><div><p className="text-sm font-medium text-white">Prototype evidence complete</p><p className="mt-1 text-xs text-slate-500">{data.readinessSignals.filter((signal) => signal.passed).length}/{data.readinessSignals.length} reviewer signals demonstrated</p></div></div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">{data.readinessSignals.map((signal) => <li key={signal.label} className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle2 size={15} className={signal.passed ? "text-emerald-200" : "text-slate-600"} />{signal.label}</li>)}</ul>
        <div className="mt-5 border-t border-white/10 pt-4"><p className="inline-flex items-center gap-2 text-sm font-medium text-white"><UserRound size={15} className="text-sky-200" />Accountability</p><dl className="mt-3 grid gap-3 sm:grid-cols-3"><div><dt className="text-xs text-slate-500">Business</dt><dd className="mt-1 text-sm text-slate-200">{workflow.accountability?.business_owner}</dd></div><div><dt className="text-xs text-slate-500">Technical</dt><dd className="mt-1 text-sm text-slate-200">{workflow.accountability?.technical_owner}</dd></div><div><dt className="text-xs text-slate-500">Reviewer</dt><dd className="mt-1 text-sm text-slate-200">{workflow.accountability?.required_reviewer}</dd></div></dl></div>
      </section>
      <section className="space-y-4">
        <div><p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-200">Success metric</p><p className="mt-2 text-sm leading-6 text-slate-300">{workflow.accountability?.success_metric}</p></div>
        <div><p className="text-xs font-medium uppercase tracking-[0.16em] text-sky-200">Handoff condition</p><p className="mt-2 text-sm leading-6 text-slate-300">{workflow.accountability?.handoff_condition}</p></div>
        <div><p className="text-xs font-medium uppercase tracking-[0.16em] text-amber-200">Before production</p><ul className="mt-2 space-y-1 text-xs leading-5 text-slate-400">{reviewerProductionGaps.map((gap) => <li key={gap}>- {gap}</li>)}</ul></div>
      </section>
    </div>
  );
}

export default function ReviewerStageContent({ stageIndex, data }: ReviewerStageContentProps) {
  if (stageIndex === 0) return <ProblemStage data={data} />;
  if (stageIndex === 1) return <EvidenceStage data={data} />;
  if (stageIndex === 2) return <ExecutionStage data={data} />;
  if (stageIndex === 3) return <OutputStage data={data} />;
  if (stageIndex === 4) return <GovernanceStage data={data} />;
  return <HandoffStage data={data} />;
}
