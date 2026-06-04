"use client";

import type { ToolEvent } from "@/lib/types";
import { AlertTriangle, CheckCircle2, ClipboardCheck, Database, FileText, ShieldCheck, Workflow, Wrench } from "lucide-react";
import DocumentPreview from "./DocumentPreview";
import WorkflowPath from "./WorkflowPath";

type ProjectFacts = {
  name?: string;
  client?: string;
  phase?: string;
  risk_level?: string;
  owner?: string;
  next_milestone?: string;
};

type RiskItem = {
  id?: string;
  severity?: string;
  trend?: string;
  risk?: string;
  owner?: string;
  mitigation?: string;
};

type NoteItem = {
  date?: string;
  source?: string;
  note?: string;
};

type SourceArtifacts = {
  meeting_notes?: NoteItem[];
  project_notes?: string[];
  risk_log?: RiskItem[];
  decisions_needed?: string[];
  stakeholder_updates?: string[];
};

type WorkflowResult = {
  found?: boolean;
  project?: ProjectFacts;
  reporting_period?: string;
  execution_steps?: string[];
  source_artifacts?: SourceArtifacts;
  detected_risks?: {
    total?: number;
    increasing?: RiskItem[];
    requires_escalation?: boolean;
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

type WorkflowRunCardProps = {
  event: ToolEvent;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getWeeklyWorkflowEvent(events: ToolEvent[]): ToolEvent | undefined {
  return events.find((event) => event.name === "run_weekly_update_workflow" && isRecord(event.result));
}

function getWorkflowResult(event: ToolEvent): WorkflowResult | null {
  return isRecord(event.result) ? (event.result as WorkflowResult) : null;
}

function hasItems<T>(items: T[] | undefined): items is T[] {
  return Array.isArray(items) && items.length > 0;
}

const defaultSteps = [
  "Read fake project notes",
  "Read fake risk log",
  "Pull project status",
  "Detect new risks",
  "Draft weekly update",
  "Flag client-facing review required",
  "Produce final update for approval"
];

export default function WorkflowRunCard({ event }: WorkflowRunCardProps) {
  const workflow = getWorkflowResult(event);

  if (!workflow?.found) {
    return (
      <div className="rounded-md border border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-50">
        <div className="flex gap-2">
          <AlertTriangle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">Workflow could not run</p>
            <p className="mt-1 text-amber-100/85">
              {workflow?.found === false
                ? "The local project register or sample source packet did not contain enough data to run the workflow."
                : "The workflow tool did not return a structured result."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const sources = workflow.source_artifacts ?? {};
  const steps = hasItems(workflow.execution_steps) ? workflow.execution_steps : defaultSteps;
  const risks = sources.risk_log ?? [];
  const increasingRisks = workflow.detected_risks?.increasing ?? risks.filter((risk) => risk.trend === "increasing");

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-md border border-emerald-300/20 bg-emerald-300/[0.06]">
        <div className="border-b border-emerald-300/15 px-4 py-3">
          <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-emerald-100">
            <Workflow size={14} aria-hidden="true" />
            Workflow Run
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-normal text-white sm:text-xl">
            Weekly update workflow executed for {workflow.project?.name ?? "Project Northstar"}
          </h3>
          <p className="mt-1 text-sm leading-6 text-emerald-50/80">
            {workflow.reporting_period ? `${workflow.reporting_period}. ` : ""}
            The runner turns scattered notes, risk logs, and project facts into a controlled draft an engagement owner can review.
          </p>
        </div>

        <div className="grid gap-3 p-4 md:grid-cols-2">
          <div className="rounded-md border border-white/10 bg-ink-950/55 p-3">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Before</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {workflow.value_summary?.before ?? "Manual synthesis from notes, trackers, risk logs, and review requirements."}
            </p>
          </div>
          <div className="rounded-md border border-emerald-300/20 bg-emerald-300/10 p-3">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-100">After</p>
            <p className="mt-2 text-sm leading-6 text-emerald-50/90">
              {workflow.value_summary?.after ?? "The workflow collects evidence, drafts the update, and stops at human approval."}
            </p>
          </div>
        </div>

        <div className="grid gap-3 border-t border-emerald-300/15 p-4 sm:grid-cols-3">
          <div>
            <p className="text-2xl font-semibold tracking-normal text-white">
              {workflow.value_summary?.estimated_time_saved ? "60-90m" : "Minutes"}
            </p>
            <p className="mt-1 text-xs leading-5 text-emerald-50/70">
              {workflow.value_summary?.estimated_time_saved ?? "Review-ready draft from local fake inputs."}
            </p>
          </div>
          <div>
            <p className="text-2xl font-semibold tracking-normal text-white">{workflow.detected_risks?.total ?? risks.length}</p>
            <p className="mt-1 text-xs leading-5 text-emerald-50/70">risks surfaced from the fake risk log</p>
          </div>
          <div>
            <p className="text-2xl font-semibold tracking-normal text-white">
              {workflow.approval_status?.status ?? "review required"}
            </p>
            <p className="mt-1 text-xs leading-5 text-emerald-50/70">approval gate before client-facing use</p>
          </div>
        </div>
      </div>

      <WorkflowPath
        compact
        steps={[
          {
            icon: Database,
            label: "Sources",
            description: "Notes, risks, and project facts read",
            status: "complete"
          },
          {
            icon: Wrench,
            label: "Tools",
            description: `${event.durationMs}ms bounded workflow run`,
            status: "complete"
          },
          {
            icon: AlertTriangle,
            label: "Risks",
            description: `${workflow.detected_risks?.total ?? risks.length} surfaced for review`,
            status: increasingRisks.length > 0 ? "active" : "complete"
          },
          {
            icon: ShieldCheck,
            label: "Gate",
            description: workflow.approval_status?.status ?? "Human review required",
            status: "active"
          },
          {
            icon: FileText,
            label: "Draft",
            description: workflow.drafted_update ? "Final update generated" : "Draft pending",
            status: workflow.drafted_update ? "complete" : "pending"
          }
        ]}
      />

      <div className="rounded-md border border-white/10 bg-ink-950/60 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            <CheckCircle2 size={14} aria-hidden="true" />
            Execution Timeline
          </p>
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400">{steps.length} steps</span>
        </div>
        <ol className="grid gap-3 sm:grid-cols-2">
          {steps.map((step, index) => (
            <li key={`${step}-${index}`} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-300/10 text-xs font-semibold text-emerald-100">
                {index + 1}
              </span>
              <p className="text-sm leading-6 text-slate-300">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <details open className="rounded-md border border-white/10 bg-white/[0.03]">
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-100">
              Source artifacts read
            </summary>
            <div className="space-y-4 border-t border-white/10 px-4 py-3">
              {hasItems(sources.meeting_notes) ? (
                <section>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Meeting Notes</p>
                  <div className="mt-2 space-y-2">
                    {sources.meeting_notes.map((note) => (
                      <div key={`${note.date}-${note.source}`} className="rounded border border-white/10 bg-ink-950/45 p-3">
                        <p className="text-xs text-slate-500">
                          {note.date} · {note.source}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-300">{note.note}</p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {hasItems(sources.project_notes) ? (
                <section>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Project Notes</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-300">
                    {sources.project_notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {hasItems(sources.decisions_needed) ? (
                <section>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Decisions Needed</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-300">
                    {sources.decisions_needed.map((decision) => (
                      <li key={decision}>{decision}</li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          </details>

          <div className="rounded-md border border-amber-300/20 bg-amber-300/[0.06] p-4">
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-amber-100">
              <AlertTriangle size={14} aria-hidden="true" />
              Risks Detected
            </p>
            <div className="mt-3 space-y-3">
              {risks.map((risk) => (
                <div key={risk.id} className="rounded border border-white/10 bg-ink-950/45 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-white">{risk.id}</span>
                    <span className="rounded-full border border-amber-300/20 px-2 py-0.5 text-xs text-amber-100">
                      {risk.severity} · {risk.trend}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{risk.risk}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-400">Owner: {risk.owner}. Mitigation: {risk.mitigation}</p>
                </div>
              ))}
            </div>
            {increasingRisks.length > 0 ? (
              <p className="mt-3 text-sm leading-6 text-amber-50">
                {increasingRisks.length} increasing risk must be visible before the update is approved.
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-md border border-white/10 bg-ink-950/60 p-4">
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              <FileText size={14} aria-hidden="true" />
              Project Facts Pulled
            </p>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                ["Client", workflow.project?.client],
                ["Phase", workflow.project?.phase],
                ["Risk level", workflow.project?.risk_level],
                ["Owner", workflow.project?.owner],
                ["Next milestone", workflow.project?.next_milestone]
              ].map(([label, value]) => (
                <div key={label} className="rounded border border-white/10 bg-white/[0.03] p-3">
                  <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</dt>
                  <dd className="mt-1 text-sm text-slate-200">{value ?? "Not available"}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-md border border-amber-300/30 bg-amber-300/10 p-4">
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-amber-100">
              <ShieldCheck size={14} aria-hidden="true" />
              Review Gate
            </p>
            <p className="mt-2 text-lg font-semibold tracking-normal text-white">
              {workflow.approval_status?.status ?? "Human review required"}
            </p>
            <p className="mt-1 text-sm leading-6 text-amber-50/85">
              Reviewer: {workflow.approval_status?.required_reviewer ?? workflow.project?.owner ?? "Engagement owner"}.
              {workflow.approval_status?.reason ? ` ${workflow.approval_status.reason}` : ""}
            </p>
          </div>
        </div>
      </div>

      {workflow.drafted_update ? (
        <DocumentPreview content={workflow.drafted_update} label="Final Update Draft" />
      ) : (
        <div className="rounded-md border border-white/10 bg-ink-950/60 p-4 text-sm text-slate-300">
          <ClipboardCheck size={16} className="mb-2 text-slate-400" aria-hidden="true" />
          The workflow completed, but no draft update was returned.
        </div>
      )}
    </section>
  );
}
