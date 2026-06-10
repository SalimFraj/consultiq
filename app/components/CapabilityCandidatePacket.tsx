"use client";

import { useState } from "react";
import type { ToolEvent } from "@/lib/types";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clipboard,
  ClipboardList,
  Download,
  FlaskConical,
  GitBranch,
  PackageCheck,
  ShieldCheck
} from "lucide-react";

type CapabilityCandidatePacketProps = {
  toolEvents: ToolEvent[];
};

type WeeklyUpdateWorkflowResult = {
  found?: boolean;
  project?: {
    name?: string;
    client?: string;
    phase?: string;
    risk_level?: string;
    owner?: string;
    next_milestone?: string;
  };
  reporting_period?: string;
  execution_steps?: string[];
  source_artifacts?: {
    meeting_notes?: unknown[];
    project_notes?: unknown[];
    risk_log?: unknown[];
    decisions_needed?: unknown[];
    stakeholder_updates?: unknown[];
  };
  detected_risks?: {
    total?: number;
    increasing?: unknown[];
    requires_escalation?: boolean;
  };
  compliance_check?: {
    verdict?: string;
    reasoning?: string;
    escalation?: string;
  };
  drafted_update?: string;
  approval_status?: {
    status?: string;
    required_reviewer?: string;
    reason?: string;
  };
  value_summary?: {
    before?: string;
    after?: string;
    estimated_time_saved?: string;
    risk_reduction?: string;
  };
};

function findWeeklyWorkflow(toolEvents: ToolEvent[]) {
  return toolEvents.find((event) => event.name === "run_weekly_update_workflow")?.result as
    | WeeklyUpdateWorkflowResult
    | undefined;
}

function readinessSignals(workflow: WeeklyUpdateWorkflowResult) {
  return [
    { label: "Source packet present", passed: Boolean(workflow.source_artifacts?.meeting_notes?.length) },
    { label: "Project facts retrieved", passed: Boolean(workflow.project?.name) },
    { label: "Risk movement detected", passed: typeof workflow.detected_risks?.total === "number" },
    { label: "Compliance checked", passed: Boolean(workflow.compliance_check?.verdict) },
    { label: "Draft generated", passed: Boolean(workflow.drafted_update) },
    { label: "Review gate enforced", passed: workflow.approval_status?.status === "human review required" }
  ];
}

function formattedToolName(name: string) {
  return name.replaceAll("_", " ");
}

function buildCandidatePacketMarkdown({
  workflow,
  readinessScore,
  passedSignals,
  totalSignals,
  sourceCount,
  toolsUsed,
  knownGaps
}: {
  workflow: WeeklyUpdateWorkflowResult;
  readinessScore: number;
  passedSignals: number;
  totalSignals: number;
  sourceCount: number;
  toolsUsed: string[];
  knownGaps: string[];
}) {
  return `# Capability Candidate Packet: Engagement Status Reporting Agent

## Candidate Summary
- Business problem: Weekly client updates are assembled from scattered notes, project status, and risk logs.
- Project: ${workflow.project?.name ?? "Project Northstar"}
- Client: ${workflow.project?.client ?? "Demo client"}
- Reporting period: ${workflow.reporting_period ?? "Sample reporting period"}
- Prototype readiness: ${readinessScore}/100 (${passedSignals}/${totalSignals} signals demonstrated)
- Source artifacts reviewed: ${sourceCount}
- Risk posture: ${workflow.project?.risk_level ?? "review"}

## Before
${workflow.value_summary?.before ?? "Manual reporting workflow."}

## After
${workflow.value_summary?.after ?? "Governed AI-assisted reporting workflow."}

## Governance Snapshot
- Compliance verdict: ${workflow.compliance_check?.verdict ?? "review required"}
- Approval status: ${workflow.approval_status?.status ?? "human review required"}
- Required reviewer: ${workflow.approval_status?.required_reviewer ?? "engagement owner"}
- Eval coverage: 10/10 deterministic portfolio evals passing; eval_010 validates source artifacts, draft output, and review gate.
- Tools used: ${toolsUsed.map((tool) => formattedToolName(tool)).join(", ")}

## Audit Trace Timeline
${workflow.execution_steps?.map((step, index) => `${index + 1}. ${step}`).join("\n") ?? "1. Workflow trace unavailable."}

## Known Production Gaps
${knownGaps.map((gap) => `- ${gap}`).join("\n")}

## Next Build Recommendation
Advance as an internal MVP candidate only after access control, logging, approval storage, approved data connectors, and CI eval gates are added.
`;
}

export default function CapabilityCandidatePacket({ toolEvents }: CapabilityCandidatePacketProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const workflow = findWeeklyWorkflow(toolEvents);
  if (!workflow?.found) return null;

  const signals = readinessSignals(workflow);
  const passedSignals = signals.filter((signal) => signal.passed).length;
  const readinessScore = Math.round((passedSignals / signals.length) * 100);
  const toolsUsed = Array.from(new Set(toolEvents.map((event) => event.name)));
  const sourceCount =
    (workflow.source_artifacts?.meeting_notes?.length ?? 0) +
    (workflow.source_artifacts?.project_notes?.length ?? 0) +
    (workflow.source_artifacts?.risk_log?.length ?? 0) +
    (workflow.source_artifacts?.decisions_needed?.length ?? 0) +
    (workflow.source_artifacts?.stakeholder_updates?.length ?? 0);

  const knownGaps = [
    "Replace fake JSON files with approved enterprise systems of record.",
    "Add auth, role-based access, and persistent audit logging.",
    "Add approval workflow storage before any client-facing send action.",
    "Promote evals into CI with prompt and tool-version tracking."
  ];
  const markdown = buildCandidatePacketMarkdown({
    workflow,
    readinessScore,
    passedSignals,
    totalSignals: signals.length,
    sourceCount,
    toolsUsed,
    knownGaps
  });

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("error");
      window.setTimeout(() => setCopyState("idle"), 2200);
    }
  };

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "consultiq-capability-candidate-packet.md";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="mt-4 rounded-md border border-emerald-300/20 bg-emerald-300/[0.04]">
      <div className="border-b border-emerald-300/20 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-100/80">
          Capability Candidate Packet
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h3 className="inline-flex items-center gap-2 text-base font-semibold tracking-normal text-white">
            <PackageCheck size={17} className="text-emerald-200" aria-hidden="true" />
            Engagement Status Reporting Agent
          </h3>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2 py-0.5 text-xs text-emerald-100">
            <FlaskConical size={12} aria-hidden="true" />
            Eval coverage: 10/10 passing
          </span>
          <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-0.5 text-xs text-amber-100">
            Human review required
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void copyMarkdown()}
            className="inline-flex items-center gap-2 rounded border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10"
            aria-live="polite"
          >
            {copyState === "copied" ? <Check size={13} aria-hidden="true" /> : <Clipboard size={13} aria-hidden="true" />}
            {copyState === "copied" ? "Copied" : copyState === "error" ? "Copy failed" : "Copy markdown"}
          </button>
          <button
            type="button"
            onClick={downloadMarkdown}
            className="inline-flex items-center gap-2 rounded border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10"
          >
            <Download size={13} aria-hidden="true" />
            Download packet
          </button>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4">
        <div className="grid gap-2 md:grid-cols-3">
          <div className="rounded border border-white/10 bg-ink-950/60 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Prototype readiness</p>
            <p className="mt-1 text-2xl font-semibold text-white">{readinessScore}/100</p>
            <p className="text-xs text-slate-500">
              {passedSignals}/{signals.length} signals demonstrated
            </p>
          </div>
          <div className="rounded border border-white/10 bg-ink-950/60 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Source artifacts</p>
            <p className="mt-1 text-2xl font-semibold text-white">{sourceCount}</p>
            <p className="text-xs text-slate-500">notes, risks, decisions, updates</p>
          </div>
          <div className="rounded border border-white/10 bg-ink-950/60 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Risk posture</p>
            <p className="mt-1 text-2xl font-semibold capitalize text-white">{workflow.project?.risk_level ?? "review"}</p>
            <p className="text-xs text-slate-500">
              {workflow.detected_risks?.increasing?.length ?? 0} increasing risks detected
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded border border-white/10 bg-ink-950/50 p-3">
            <h4 className="inline-flex items-center gap-2 text-sm font-semibold text-white">
              <ClipboardList size={15} className="text-sky-200" aria-hidden="true" />
              Candidate Summary
            </h4>
            <dl className="mt-3 space-y-2 text-xs leading-5">
              <div>
                <dt className="text-slate-500">Business problem</dt>
                <dd className="text-slate-300">
                  Weekly client updates are assembled from scattered notes, project status, and risk logs.
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Before</dt>
                <dd className="text-slate-300">{workflow.value_summary?.before}</dd>
              </div>
              <div>
                <dt className="text-slate-500">After</dt>
                <dd className="text-slate-300">{workflow.value_summary?.after}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Next recommendation</dt>
                <dd className="text-slate-300">
                  Advance as an internal MVP candidate only after access control, logging, approval storage, and CI
                  eval gates are added.
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded border border-white/10 bg-ink-950/50 p-3">
            <h4 className="inline-flex items-center gap-2 text-sm font-semibold text-white">
              <ShieldCheck size={15} className="text-emerald-200" aria-hidden="true" />
              Governance Snapshot
            </h4>
            <div className="mt-3 space-y-2 text-xs leading-5 text-slate-300">
              <p>
                <span className="text-slate-500">Compliance:</span>{" "}
                {workflow.compliance_check?.verdict ?? "review required"}
              </p>
              <p>
                <span className="text-slate-500">Approval:</span> {workflow.approval_status?.status} by{" "}
                {workflow.approval_status?.required_reviewer ?? "engagement owner"}
              </p>
              <p>
                <span className="text-slate-500">Eval coverage:</span> eval_010 validates source artifacts, draft
                output, and review gate; the full suite checks 10 deterministic scenarios.
              </p>
              <p>
                <span className="text-slate-500">Tools used:</span>{" "}
                {toolsUsed.map((tool) => formattedToolName(tool)).join(", ")}
              </p>
            </div>
            <ul className="mt-3 space-y-1 text-xs leading-5 text-slate-400">
              {signals.map((signal) => (
                <li key={signal.label} className="flex gap-2">
                  <CheckCircle2
                    size={14}
                    className={signal.passed ? "mt-0.5 shrink-0 text-emerald-200" : "mt-0.5 shrink-0 text-slate-600"}
                    aria-hidden="true"
                  />
                  {signal.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded border border-white/10 bg-ink-950/50 p-3">
          <h4 className="inline-flex items-center gap-2 text-sm font-semibold text-white">
            <GitBranch size={15} className="text-amber-200" aria-hidden="true" />
            Audit Trace Timeline
          </h4>
          <ol className="mt-3 space-y-2">
            {workflow.execution_steps?.map((step, index) => (
              <li key={step} className="flex gap-3 text-xs leading-5 text-slate-300">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[11px] text-slate-400">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded border border-amber-300/20 bg-amber-300/[0.05] p-3">
          <h4 className="inline-flex items-center gap-2 text-sm font-semibold text-amber-50">
            <AlertTriangle size={15} className="text-amber-200" aria-hidden="true" />
            Known Production Gaps
          </h4>
          <ul className="mt-2 space-y-1 text-xs leading-5 text-amber-100/85">
            {knownGaps.map((gap) => (
              <li key={gap}>- {gap}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
