"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  FlaskConical,
  PackageCheck,
  Play,
  ShieldCheck,
  Workflow,
  Wrench
} from "lucide-react";
import { capabilities } from "@/lib/capabilities";
import { capabilityLifecycle, type CapabilityLifecycleStage, type CapabilityLifecycleStatus } from "@/lib/capabilityLifecycle";
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
    <aside className="w-full border-t border-white/10 bg-ink-900 xl:h-screen xl:w-80 xl:overflow-y-auto xl:border-l xl:border-t-0">
      <div className="space-y-4 p-4">
        <section className="rounded-md border border-white/10 bg-ink-950/50 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">AI Lab Capability Factory</p>
          <h2 className="mt-1 inline-flex items-center gap-2 text-base font-semibold tracking-normal text-white">
            <PackageCheck size={18} className="text-emerald-200" aria-hidden="true" />
            Reusable workflow capability
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Compact proof that the workflow runner has bounded tools, evals, and a review gate.
          </p>
        </section>

        <section className="grid grid-cols-2 gap-2">
          <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
            <p className="text-2xl font-semibold tracking-normal text-white">{capabilities.length}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">bounded tools</p>
          </div>
          <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
            <p className="text-2xl font-semibold tracking-normal text-white">5</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">tool-call cap</p>
          </div>
          <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
            <p className="text-2xl font-semibold tracking-normal text-white">0</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">server records stored</p>
          </div>
          <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
            <p className="text-2xl font-semibold tracking-normal text-white">{suite ? `${suite.passCount}/${suite.totalCount}` : "10"}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">eval cases</p>
          </div>
        </section>

        <details className="group rounded-md border border-white/10 bg-white/[0.03]">
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
                  <span className="text-xs text-slate-500">{capability.tool}</span>
                </summary>
                <div className="border-t border-white/10 px-3 py-3 text-sm leading-6 text-slate-400">
                  <p>{capability.purpose}</p>
                  <p className="mt-2 text-xs text-slate-500">Production signal: {capability.productionSignal}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-white/10 bg-ink-950/50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Eval Harness</p>
              <h3 className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-white">
                <FlaskConical size={16} className="text-amber-200" aria-hidden="true" />
                Portfolio regression checks
              </h3>
            </div>
            <button
              type="button"
              onClick={() => void runEvals()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10 disabled:opacity-50"
            >
              <Play size={12} aria-hidden="true" />
              {loading ? "Running" : "Run"}
            </button>
          </div>

          {suite ? (
            <div className="mt-4 space-y-2">
              <div className="rounded border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300">
                Passed {suite.passCount} of {suite.totalCount} evals
              </div>
              {suite.results.map((result) => (
                <details key={result.id} className="rounded border border-white/10 bg-white/[0.03]">
                  <summary className="cursor-pointer list-none px-3 py-2 text-sm text-slate-200">
                    <span className={`inline-flex items-center gap-1.5 ${result.passed ? "text-emerald-200" : "text-amber-200"}`}>
                      {result.passed ? <CheckCircle2 size={14} aria-hidden="true" /> : <ClipboardCheck size={14} aria-hidden="true" />}
                      {result.passed ? "Pass" : "Review"}
                    </span>
                    <span className="ml-2">{result.id}</span>
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
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Run the suite to show expected tool routing, compliance preservation, and workflow-builder coverage.
            </p>
          )}
        </section>
      </div>
    </aside>
  );
}
