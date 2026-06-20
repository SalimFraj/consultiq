"use client";

import { useMemo, useState } from "react";
import type { ReviewerDecisionRecord, ReviewerDecisionValue, ReviewerDemoPayload } from "@/lib/reviewerDemo";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Eye,
  GitBranch,
  RotateCcw,
  ShieldCheck,
  UserRound,
  Wrench
} from "lucide-react";
import DocumentPreview from "./DocumentPreview";

type ReviewerStageContentProps = {
  stageIndex: number;
  data: ReviewerDemoPayload;
  decisions: ReviewerDecisionRecord[];
  onDecision: (decision: ReviewerDecisionValue) => void;
};

function ProblemStage({ data }: { data: ReviewerDemoPayload }) {
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

function EvidenceStage({ data }: { data: ReviewerDemoPayload }) {
  const { workflow, sourceCount, sourceGroups } = data;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">Bounded source packet</p>
          <p className="mt-1 text-3xl font-semibold text-white">{sourceCount} artifacts</p>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-400">
          All content is fake local demo data. The runner does not browse, infer missing project facts, or access external systems.
        </p>
      </div>
      <div className="grid gap-px overflow-hidden rounded-md border border-white/10 bg-white/10 sm:grid-cols-5">
        {sourceGroups.map((group) => (
          <div key={group.label} className="bg-ink-900 p-3">
            <p className="text-xl font-semibold text-white">{group.count}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{group.label}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {data.evidence.slice(0, 6).map((record) => (
          <article key={record.id} className="border-t border-white/10 pt-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-sky-200">{record.id}</p>
              <p className="text-xs capitalize text-slate-500">{record.type}</p>
            </div>
            <h4 className="mt-1 text-sm font-medium text-white">{record.title}</h4>
            <p className="mt-1 text-xs leading-5 text-slate-400">{record.excerpt}</p>
          </article>
        ))}
      </div>
      <p className="text-xs text-slate-500">
        Project: {workflow.project?.name}. Reporting period: {workflow.reporting_period}.
      </p>
    </div>
  );
}

function ExecutionStage({ data }: { data: ReviewerDemoPayload }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <section>
        <p className="text-sm text-slate-400">Observed tool calls</p>
        <div className="mt-3 divide-y divide-white/10 border-y border-white/10">
          {data.toolEvents.map((event, index) => (
            <div key={event.id} className="flex items-center gap-3 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
                <Wrench size={14} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{event.name.replaceAll("_", " ")}</p>
                <p className="mt-0.5 text-xs text-slate-500">Call {index + 1} of {data.toolEvents.length} - {event.status}</p>
              </div>
              <span className="text-xs text-slate-500">{event.durationMs}ms</span>
            </div>
          ))}
        </div>
      </section>
      <section>
        <p className="text-sm text-slate-400">Audit trace</p>
        <ol className="mt-3 space-y-3">
          {data.workflow.execution_steps?.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm leading-6 text-slate-300">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 text-xs text-slate-400">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function OutputStage({ data }: { data: ReviewerDemoPayload }) {
  const [selectedClaimId, setSelectedClaimId] = useState(data.lineage[0]?.id ?? "");
  const selectedClaim = data.lineage.find((claim) => claim.id === selectedClaimId) ?? data.lineage[0];
  const evidenceById = useMemo(() => new Map(data.evidence.map((record) => [record.id, record])), [data.evidence]);
  const selectedEvidence = selectedClaim?.sourceIds.flatMap((id) => {
    const record = evidenceById.get(id);
    return record ? [record] : [];
  }) ?? [];

  return (
    <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="max-h-[48vh] overflow-y-auto">
        <DocumentPreview content={data.workflow.drafted_update ?? "No draft was returned."} label="Generated weekly update" />
      </div>
      <section>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-medium text-white"><Eye size={15} className="text-sky-200" />Claim lineage</p>
            <p className="mt-1 text-xs text-slate-500">Select a material claim to inspect its source evidence.</p>
          </div>
          <span className="text-xs text-slate-500">{data.lineage.length} traced</span>
        </div>
        <div className="mt-3 max-h-44 space-y-1 overflow-y-auto border-y border-white/10 py-2">
          {data.lineage.map((claim) => (
            <button
              key={claim.id}
              type="button"
              onClick={() => setSelectedClaimId(claim.id)}
              aria-pressed={claim.id === selectedClaim?.id}
              className={`w-full rounded px-3 py-2 text-left text-xs leading-5 transition-colors ${claim.id === selectedClaim?.id ? "bg-sky-300/10 text-sky-50" : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"}`}
            >
              {claim.claim}
              <span className="mt-1 block text-[11px] text-slate-500">{claim.sourceIds.join(" + ")}</span>
            </button>
          ))}
        </div>
        {selectedClaim ? (
          <div className="mt-4 rounded-md border border-sky-300/20 bg-sky-300/[0.05] p-3" aria-live="polite">
            <p className="text-xs leading-5 text-sky-50">{selectedClaim.rationale}</p>
            <div className="mt-3 space-y-2">
              {selectedEvidence.map((record) => (
                <div key={record.id} className="border-t border-sky-300/15 pt-2">
                  <p className="text-xs font-medium text-sky-200">{record.id} - {record.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">{record.excerpt}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function GovernanceStage({ data }: { data: ReviewerDemoPayload }) {
  const { workflow } = data;
  const risks = workflow.source_artifacts?.risk_log ?? [];
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-md border border-amber-300/25 bg-amber-300/[0.06] p-4">
        <ShieldCheck size={20} className="text-amber-200" aria-hidden="true" />
        <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-amber-100/70">Deterministic verdict</p>
        <h3 className="mt-1 text-xl font-semibold capitalize text-amber-50">{workflow.compliance_check?.verdict}</h3>
        <p className="mt-3 text-sm leading-6 text-amber-50/80">{workflow.compliance_check?.reasoning}</p>
        <div className="mt-4 border-t border-amber-300/20 pt-3">
          <p className="text-xs text-amber-100/70">Required reviewer</p>
          <p className="mt-1 text-sm font-medium text-white">{workflow.approval_status?.required_reviewer}</p>
          <p className="mt-2 text-xs leading-5 text-slate-400">{workflow.approval_status?.reason}</p>
        </div>
      </section>
      <section>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-white">Risks surfaced before approval</h3>
          <span className="text-xs text-amber-200">{workflow.detected_risks?.increasing?.length ?? 0} increasing</span>
        </div>
        <div className="mt-3 divide-y divide-white/10 border-y border-white/10">
          {risks.map((risk) => (
            <div key={risk.id} className="py-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className={risk.trend === "increasing" ? "text-amber-200" : "text-slate-500"} aria-hidden="true" />
                <p className="text-sm font-medium text-white">{risk.id} - {risk.severity}</p>
                <span className="text-xs text-slate-500">{risk.trend}</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-400">{risk.risk}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const decisionOptions: Array<{ value: ReviewerDecisionValue; label: string; icon: typeof CheckCircle2; className: string }> = [
  { value: "approve_internal_mvp", label: "Approve internal MVP", icon: CheckCircle2, className: "border-emerald-300/30 bg-emerald-300/10 text-emerald-50 hover:bg-emerald-300/20" },
  { value: "request_changes", label: "Request changes", icon: RotateCcw, className: "border-amber-300/30 bg-amber-300/10 text-amber-50 hover:bg-amber-300/20" },
  { value: "reject", label: "Do not advance", icon: Ban, className: "border-rose-300/30 bg-rose-300/10 text-rose-50 hover:bg-rose-300/20" }
];

function ReadinessLane({ title, tone, items }: { title: string; tone: string; items: ReviewerDemoPayload["readiness"]["demonstrated"] }) {
  return (
    <section className="border-t border-white/10 pt-3">
      <p className={`text-xs font-medium uppercase tracking-[0.14em] ${tone}`}>{title}</p>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li key={item.label}>
            <p className="text-sm font-medium text-white">{item.label}</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">{item.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function HandoffStage({ data, decisions, onDecision }: { data: ReviewerDemoPayload; decisions: ReviewerDecisionRecord[]; onDecision: (decision: ReviewerDecisionValue) => void }) {
  const latestDecision = decisions[0];
  return (
    <div className="space-y-6">
      <section className="grid gap-4 border-b border-white/10 pb-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-200">Recommendation</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{data.recommendation.decision}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{data.recommendation.reason}</p>
        </div>
        <div className="rounded-md border border-sky-300/20 bg-sky-300/[0.05] p-4">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-sky-200">Next controlled step</p>
          <p className="mt-2 text-sm leading-6 text-slate-200">{data.recommendation.nextStep}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <UserRound size={14} aria-hidden="true" />
            Owner: {data.workflow.accountability?.business_owner}
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <ReadinessLane title="Demonstrated now" tone="text-emerald-200" items={data.readiness.demonstrated} />
        <ReadinessLane title="Simulated here" tone="text-sky-200" items={data.readiness.simulated} />
        <ReadinessLane title="Required for production" tone="text-amber-200" items={data.readiness.requiredForProduction} />
      </div>

      <section className="rounded-md border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-medium text-white"><GitBranch size={15} className="text-sky-200" />Record a simulated review decision</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">This writes to local browser storage only. It never sends or approves a real deliverable.</p>
          </div>
          {latestDecision ? <span className="rounded border border-white/10 px-2 py-1 text-xs text-slate-300">Latest: {latestDecision.label}</span> : null}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {decisionOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button key={option.value} type="button" onClick={() => onDecision(option.value)} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded border px-3 text-xs font-medium ${option.className}`}>
                <Icon size={15} aria-hidden="true" />
                {option.label}
              </button>
            );
          })}
        </div>
        {decisions.length > 0 ? (
          <ol className="mt-4 space-y-2 border-t border-white/10 pt-3" aria-label="Simulated decision audit trail">
            {decisions.map((decision) => (
              <li key={decision.id} className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-200">{decision.label}</span>
                <span className="text-slate-500">{new Date(decision.timestamp).toLocaleString()} - {decision.reviewer}</span>
              </li>
            ))}
          </ol>
        ) : null}
      </section>
    </div>
  );
}

export default function ReviewerStageContent({ stageIndex, data, decisions, onDecision }: ReviewerStageContentProps) {
  if (stageIndex === 0) return <ProblemStage data={data} />;
  if (stageIndex === 1) return <EvidenceStage data={data} />;
  if (stageIndex === 2) return <ExecutionStage data={data} />;
  if (stageIndex === 3) return <OutputStage data={data} />;
  if (stageIndex === 4) return <GovernanceStage data={data} />;
  return <HandoffStage data={data} decisions={decisions} onDecision={onDecision} />;
}
