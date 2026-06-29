"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  GitBranch,
  FlaskConical,
  PackageCheck,
  Play,
  ShieldCheck,
  Workflow,
  Wrench
} from "lucide-react";
import { capabilities } from "@/lib/capabilities";
import { capabilityLifecycle, type CapabilityLifecycleStage, type CapabilityLifecycleStatus } from "@/lib/capabilityLifecycle";
import { MAX_TOOL_CALLS } from "@/lib/constants";
import type { EvalSuiteResponse } from "@/lib/types";

const lifecycleIcons: Record<CapabilityLifecycleStage["stage"], typeof ClipboardList> = {
  intake: ClipboardList,
  prototype: Workflow,
  eval: FlaskConical,
  review: ShieldCheck,
  production: PackageCheck
};

const statusLabels: Record<CapabilityLifecycleStatus, string> = {
  demonstrated: "Demonstrated",
  "review-gated": "Review gated",
  "production-candidate": "Production candidate"
};

const statusClasses: Record<CapabilityLifecycleStatus, string> = {
  demonstrated: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
  "review-gated": "border-amber-300/20 bg-amber-300/10 text-amber-100",
  "production-candidate": "border-sky-300/20 bg-sky-300/10 text-sky-100"
};

const nextBuildItems = [
  "Connector layer for approved systems of record",
  "Role-based access and reviewer permissions",
  "Persistent audit log for prompts, tools, outputs, and approvals",
  "CI eval gates with prompt and tool-version tracking",
  "Workflow template library for repeatable AI Lab builds",
  "Adoption dashboard for owner, metric, usage, risk, and handoff status"
];

type CapabilityPanelContentProps = {
  suite: EvalSuiteResponse | null;
  loading: boolean;
  onRunEvals: () => void;
};

function EvalMetricsPanel({ suite }: { suite: EvalSuiteResponse | null }) {
  const configuredCount = suite?.totalCount ?? 11;

  if (!suite) {
    return (
      <section className="signal-card rounded-md border border-white/10 bg-ink-950/50 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Eval Readiness</p>
            <h3 className="mt-1 text-sm font-semibold text-white">Governance checks configured</h3>
          </div>
          <span className="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400">Not run</span>
        </div>

        <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Configured suite</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">Tool routing, governance, and review-gate coverage.</p>
            </div>
            <p className="text-lg font-semibold text-white">{configuredCount}</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] leading-4 text-slate-300">
            <span className="rounded border border-emerald-300/15 bg-emerald-300/10 px-2 py-1">Routing</span>
            <span className="rounded border border-sky-300/15 bg-sky-300/10 px-2 py-1">Governance</span>
            <span className="rounded border border-amber-300/15 bg-amber-300/10 px-2 py-1">Review gate</span>
          </div>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500">Run the eval harness below to turn readiness into pass rate and review queue.</p>
      </section>
    );
  }

  const passCount = suite.passCount;
  const totalCount = suite.totalCount;
  const reviewCount = suite.totalCount - suite.passCount;
  const passRate = Math.round((suite.passCount / Math.max(1, suite.totalCount)) * 100);

  const metrics = [
    {
      label: "Pass rate",
      value: `${passRate}%`,
      detail: `${passCount}/${totalCount} checks passed`,
      tone: "emerald",
      progress: passRate
    },
    {
      label: "Needs review",
      value: reviewCount,
      detail: "Checks needing attention",
      tone: "amber",
      progress: Math.round((reviewCount / Math.max(1, totalCount)) * 100)
    },
    {
      label: "Checks run",
      value: totalCount,
      detail: "Tool routing and governance coverage",
      tone: "sky",
      progress: 100
    }
  ];

  return (
    <section className="signal-card rounded-md border border-white/10 bg-ink-950/50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Eval Results</p>
          <h3 className="mt-1 text-sm font-semibold text-white">Regression signal</h3>
        </div>
        <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400">Current run</span>
      </div>
      <div className="grid gap-2">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-md border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{metric.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">{metric.detail}</p>
              </div>
              <p className="text-lg font-semibold text-white">{metric.value}</p>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded bg-white/10">
              <div
                className={`h-full rounded ${
                  metric.tone === "emerald" ? "bg-emerald-300" : metric.tone === "amber" ? "bg-amber-300" : "bg-sky-300"
                }`}
                style={{ width: `${Math.max(4, metric.progress)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CapabilityPanelContent({ suite, loading, onRunEvals }: CapabilityPanelContentProps) {
  return (
    <div className="space-y-4 p-4">
      <section className="signal-card signal-card-emerald rounded-md border border-white/10 bg-ink-950/50 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Evidence Rail</p>
        <h2 className="mt-1 inline-flex items-center gap-2 text-base font-semibold tracking-normal text-white">
          <PackageCheck size={18} className="shrink-0 text-emerald-200" aria-hidden="true" />
          Implementation signals stay visible
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Tool inventory, eval coverage, lifecycle stage, and production gaps stay one click away while the demo runs.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-2">
        <div className="signal-card rounded-md border border-white/10 bg-white/[0.03] p-3">
          <p className="text-2xl font-semibold tracking-normal text-white">{capabilities.length}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">bounded software tools</p>
        </div>
        <div className="signal-card rounded-md border border-white/10 bg-white/[0.03] p-3">
          <p className="text-2xl font-semibold tracking-normal text-white">{MAX_TOOL_CALLS}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">tool-call cap</p>
        </div>
        <div className="signal-card rounded-md border border-white/10 bg-white/[0.03] p-3">
          <p className="text-2xl font-semibold tracking-normal text-white">0</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">client records stored</p>
        </div>
        <div className="signal-card rounded-md border border-white/10 bg-white/[0.03] p-3">
          <p className="text-2xl font-semibold tracking-normal text-white">{suite ? `${suite.passCount}/${suite.totalCount}` : "11"}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">eval cases</p>
        </div>
      </section>

      <details className="signal-card group rounded-md border border-white/10 bg-white/[0.03]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3">
          <span>
            <span className="block text-xs uppercase tracking-[0.18em] text-slate-500">Lifecycle</span>
            <span className="mt-1 block text-sm font-medium text-slate-100">Factory path</span>
          </span>
          <ChevronDown size={15} className="shrink-0 text-slate-500 transition group-open:rotate-180" aria-hidden="true" />
        </summary>
        <ol className="space-y-2 border-t border-white/10 p-3">
          {capabilityLifecycle.map((item, index) => {
            const Icon = lifecycleIcons[item.stage];
            return (
              <li key={item.stage} className="rounded-md border border-white/10 bg-ink-950/50 p-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-white/10 bg-ink-950 text-slate-300">
                    <Icon size={15} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-slate-100">
                        {index + 1}. {item.label}
                      </p>
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] ${statusClasses[item.status]}`}>
                        {statusLabels[item.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{item.description}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </details>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Capabilities</p>
          <span className="text-xs text-slate-500">Reusable</span>
        </div>
        <div className="space-y-2">
          {capabilities.map((capability) => (
            <details key={capability.tool} className="group rounded-md border border-white/10 bg-white/[0.03]">
              <summary className="cursor-pointer list-none px-3 py-2">
                <span className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-100">
                    <Wrench size={14} className="shrink-0 text-slate-400" aria-hidden="true" />
                    <span className="truncate">{capability.name}</span>
                  </span>
                  <ChevronDown size={14} className="shrink-0 text-slate-500 transition group-open:rotate-180" aria-hidden="true" />
                </span>
                <span className="break-all text-xs text-slate-500">{capability.tool}</span>
              </summary>
              <div className="border-t border-white/10 px-3 py-3 text-sm leading-6 text-slate-400">
                <p>{capability.purpose}</p>
                <p className="mt-2 text-xs text-slate-500">Production signal: {capability.productionSignal}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <EvalMetricsPanel suite={suite} />

      <details className="signal-card signal-card-amber group rounded-md border border-white/10 bg-ink-950/50">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
          <span>
            <span className="block text-xs uppercase tracking-[0.18em] text-slate-500">Eval Harness</span>
            <span className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-white">
              <FlaskConical size={16} className="shrink-0 text-amber-200" aria-hidden="true" />
              {suite ? `${suite.passCount}/${suite.totalCount} evals passed` : "Portfolio regression checks"}
            </span>
          </span>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              onRunEvals();
            }}
            disabled={loading}
            className="inline-flex min-h-9 items-center gap-2 rounded border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10 disabled:opacity-50"
          >
            <Play size={12} aria-hidden="true" />
            {loading ? "Running" : "Run"}
          </button>
        </summary>

        {suite ? (
          <div className="space-y-2 border-t border-white/10 p-4">
            {suite.results.map((result) => (
              <details key={result.id} className="rounded border border-white/10 bg-white/[0.03]">
                <summary className="cursor-pointer list-none px-3 py-2 text-sm text-slate-200">
                  <span className={`inline-flex items-center gap-1.5 ${result.passed ? "text-emerald-200" : "text-amber-200"}`}>
                    {result.passed ? <CheckCircle2 size={14} aria-hidden="true" /> : <ClipboardCheck size={14} aria-hidden="true" />}
                    {result.passed ? "Pass" : "Review"}
                  </span>
                  <span className="ml-2 break-all">{result.id}</span>
                </summary>
                <div className="space-y-2 border-t border-white/10 px-3 py-3 text-xs leading-5 text-slate-400">
                  <p>{result.prompt}</p>
                  <p>Expected: {result.expectedTools.join(", ")}</p>
                  <p>Observed: {result.observedTools.join(", ") || "none"}</p>
                  <p>{result.notes}</p>
                  {result.checks && result.checks.length > 0 ? (
                    <ul className="space-y-1">
                      {result.checks.map((check) => (
                        <li key={check.check} className={check.passed ? "text-emerald-200/80" : "text-amber-200/90"}>
                          {check.passed ? "Pass" : "Review"}: {check.detail}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </details>
            ))}
          </div>
        ) : (
          <p className="border-t border-white/10 px-4 py-3 text-sm leading-6 text-slate-400">
            Run the suite to show expected tool routing, compliance preservation, and workflow-builder coverage.
          </p>
        )}
      </details>

      <details className="signal-card group rounded-md border border-white/10 bg-ink-950/50">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
          <span>
            <span className="block text-xs uppercase tracking-[0.18em] text-slate-500">Next Build</span>
            <span className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-white">
              <GitBranch size={16} className="shrink-0 text-sky-200" aria-hidden="true" />
              Production path
            </span>
          </span>
          <ChevronDown size={15} className="shrink-0 text-slate-500 transition group-open:rotate-180" aria-hidden="true" />
        </summary>
        <ul className="space-y-2 border-t border-white/10 px-4 py-3 text-xs leading-5 text-slate-400">
          {nextBuildItems.map((item) => (
            <li key={item} className="flex gap-2">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-sky-200" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

export default function CapabilityPanel() {
  const [suite, setSuite] = useState<EvalSuiteResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const runEvals = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/evals");
      const data = (await response.json()) as EvalSuiteResponse;
      setSuite(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <aside className="border-t border-white/10 bg-ink-900 lg:hidden">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
            <span>
              <span className="block text-xs uppercase tracking-[0.18em] text-slate-500">Capability Factory</span>
              <span className="mt-1 block text-sm font-medium text-slate-100">
                {suite ? `${suite.passCount}/${suite.totalCount} evals passing` : `${capabilities.length} bounded tools`}
              </span>
            </span>
            <ChevronDown size={16} className="shrink-0 text-slate-500 transition group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="border-t border-white/10">
            <CapabilityPanelContent suite={suite} loading={loading} onRunEvals={() => void runEvals()} />
          </div>
        </details>
      </aside>

      <aside className="hidden w-80 shrink-0 border-l border-white/10 bg-ink-900 xl:block xl:h-screen xl:overflow-y-auto">
        <CapabilityPanelContent suite={suite} loading={loading} onRunEvals={() => void runEvals()} />
      </aside>
    </>
  );
}
