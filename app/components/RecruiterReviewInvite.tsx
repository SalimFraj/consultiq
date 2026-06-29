"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, Clock3, Eye, FastForward, GitBranch, ShieldCheck, TerminalSquare, X } from "lucide-react";

type RecruiterReviewInviteProps = {
  open: boolean;
  onStart: () => void;
  onSkipToOutcome: () => void;
  onExplore: () => void;
  onClose: () => void;
};

export default function RecruiterReviewInvite({ open, onStart, onSkipToOutcome, onExplore, onClose }: RecruiterReviewInviteProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="recruiter-review-title"
        className="w-full max-w-2xl overflow-hidden rounded-md border border-sky-300/20 bg-ink-900 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-sky-200">
              <Clock3 size={14} aria-hidden="true" />
              90-second product review
            </p>
            <h2 id="recruiter-review-title" className="mt-2 text-2xl font-semibold text-white">
              See how ConsultIQ thinks and builds.
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
            aria-label="Close recruiter review invitation"
          >
            <X size={17} />
          </button>
        </div>

        <div className="px-5 py-5">
          <p className="text-sm leading-6 text-slate-300">
            A local demo workflow turns fake Project Northstar notes and risks into a reviewed weekly update, with source tracing, bounded tools, and a human approval gate.
          </p>
          <div className="mt-4 rounded-md border border-sky-300/20 bg-sky-300/[0.05] p-3">
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-sky-100">
              <TerminalSquare size={14} aria-hidden="true" />
              Starting prompt
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              Run the weekly update workflow for Project Northstar using the sample notes and risk log.
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Demo data only. The tool layer, evidence tracing, deterministic policy checks, review gate, and eval signals are implemented; enterprise connectors, auth, and durable approval storage are simulated.
            </p>
          </div>
          <div className="mt-5 divide-y divide-white/10 border-y border-white/10">
            {[
              [Eye, "Trace the evidence", "Open generated claims and inspect the exact notes, risks, and decisions behind them."],
              [ShieldCheck, "Make the review decision", "Approve, request changes, or stop the simulated capability and create an audit entry."],
              [GitBranch, "Separate prototype from production", "See what works now, what is simulated, and what must exist before a pilot."]
            ].map(([Icon, title, detail]) => {
              const ItemIcon = Icon as typeof Eye;
              return (
                <div key={String(title)} className="flex gap-3 py-3">
                  <ItemIcon size={17} className="mt-0.5 shrink-0 text-emerald-200" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-white">{String(title)}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{String(detail)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-white/10 bg-ink-950/55 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={onExplore} className="min-h-11 px-3 text-sm text-slate-400 hover:text-white">
            Explore the workbench
          </button>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onSkipToOutcome}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-white/15 px-4 text-sm text-slate-200 hover:bg-white/10"
            >
              <FastForward size={15} aria-hidden="true" />
              Skip to outcome
            </button>
            <button
              type="button"
              onClick={onStart}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-emerald-300 px-5 text-sm font-semibold text-ink-950 hover:bg-emerald-200"
            >
              Start guided review
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
