"use client";

import { useState } from "react";
import { CheckCircle2, ClipboardCheck, FlaskConical, PackageCheck, Play, Wrench } from "lucide-react";
import { capabilities } from "@/lib/evals";
import type { EvalSuiteResponse } from "@/lib/types";

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
    <aside className="w-full border-t border-white/10 bg-ink-900 xl:w-96 xl:border-l xl:border-t-0">
      <div className="space-y-5 p-4">
        <section className="rounded-md border border-white/10 bg-ink-950/50 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Capability Factory</p>
          <h2 className="mt-1 inline-flex items-center gap-2 text-lg font-semibold tracking-normal text-white">
            <PackageCheck size={18} className="text-emerald-200" aria-hidden="true" />
            Reusable agent components
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Each tool is framed as a reusable capability with a production signal, not a one-off chatbot feature.
          </p>
        </section>

        <section className="grid grid-cols-2 gap-2">
          <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
            <p className="text-2xl font-semibold tracking-normal text-white">5</p>
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

        <section>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Capabilities</p>
            <span className="text-xs text-slate-500">Reusable</span>
          </div>
          <div className="space-y-2">
            {capabilities.map((capability) => (
              <details key={capability.tool} className="rounded-md border border-white/10 bg-white/[0.03]">
                <summary className="cursor-pointer list-none px-3 py-2">
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-100">
                    <Wrench size={14} className="text-slate-400" aria-hidden="true" />
                    {capability.name}
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
