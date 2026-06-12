"use client";

import { useEffect, useRef, useCallback } from "react";
import { CheckCircle2, ClipboardList, FlaskConical, GitBranch, PackageCheck, ShieldCheck, Workflow, X } from "lucide-react";

type CaseStudyModalProps = {
  open: boolean;
  onClose: () => void;
};

const caseStudySections = [
  {
    icon: Workflow,
    title: "Problem",
    body:
      "Engagement teams spend recurring time assembling weekly client updates from scattered notes, project status, decisions, and risk logs. The work is repeatable, quality-sensitive, and review-heavy."
  },
  {
    icon: GitBranch,
    title: "Why Workflow-First",
    body:
      "The prototype starts with the operating model, not the model provider. It defines source artifacts, tool boundaries, decision points, and human approval before treating the LLM as a synthesis layer."
  },
  {
    icon: PackageCheck,
    title: "Architecture",
    body:
      "A Next.js App Router UI calls a guarded API route. The agent loop can use Gemini function calling, Groq synthesis fallback, or deterministic local fallback, while local tools remain the source of record."
  },
  {
    icon: ClipboardList,
    title: "Ownership Model",
    body:
      "The workflow names a business owner, technical owner, required reviewer, success metric, and handoff condition before the capability is treated as more than a prototype."
  },
  {
    icon: CheckCircle2,
    title: "Business Outcome",
    body:
      "The demo frames value in operational terms: a 60-90 minute reporting task becomes a review-ready draft path with source traceability, risk visibility, and accountable human approval."
  },
  {
    icon: ShieldCheck,
    title: "Governance Choices",
    body:
      "Compliance verdicts are deterministic, client-facing drafts stop at a review gate, all data is fake, tool traces are visible, and provider failures degrade without hiding the control boundary."
  },
  {
    icon: FlaskConical,
    title: "Eval Strategy",
    body:
      "The eval harness checks deterministic tool routing, compliance preservation, unknown-project guardrails, workflow structure, and the weekly workflow runner's source, draft, and review-gate outputs."
  },
  {
    icon: PackageCheck,
    title: "Production Path",
    body:
      "A production version would replace JSON files with approved systems, add auth and role-based access, persist approvals and audit logs, track prompt/tool versions, and run eval gates in CI."
  }
];

export default function CaseStudyModal({ open, onClose }: CaseStudyModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) closeButtonRef.current?.focus();
  }, [open]);

  const handleFocusTrap = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !panelRef.current) return;

    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-3 py-3 sm:items-center sm:px-4 sm:py-6"
      onClick={onClose}
      onKeyDown={handleFocusTrap}
    >
      <div
        ref={panelRef}
        className="max-h-[92dvh] w-full max-w-3xl overflow-auto rounded-md border border-white/10 bg-ink-900 shadow-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="ConsultIQ case study"
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Case Study</p>
            <h2 className="text-base font-semibold tracking-normal text-white sm:text-lg">From workflow pain to capability candidate</h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded border border-white/10 p-2 text-slate-200 hover:bg-white/10"
            aria-label="Close case study modal"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 px-4 py-5 sm:px-5">
          <p className="text-sm leading-6 text-slate-300">
            ConsultIQ is a compact AI Builder portfolio artifact. It demonstrates how I would identify a repeatable
            internal workflow, build a governed prototype, expose traceability and evals, and package the result as a
            reusable capability candidate.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {caseStudySections.map(({ icon: Icon, title, body }) => (
              <section key={title} className="rounded-md border border-white/10 bg-white/[0.03] p-4">
                <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                  <Icon size={15} className="text-emerald-200" aria-hidden="true" />
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
