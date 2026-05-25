"use client";

import { useEffect, useRef, useCallback } from "react";
import { Database, LockKeyhole, ShieldCheck, X } from "lucide-react";

type GovernanceModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function GovernanceModal({ open, onClose }: GovernanceModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Auto-focus the close button when modal opens
  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus();
    }
  }, [open]);

  // Focus trap: keep Tab cycling inside the modal panel
  const handleFocusTrap = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    []
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
      onClick={onClose}
      onKeyDown={handleFocusTrap}
    >
      {/* stopPropagation prevents backdrop click from closing when clicking inside */}
      <div
        ref={panelRef}
        className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-md border border-white/10 bg-ink-900 shadow-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="AI Governance"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Responsible AI</p>
            <h2 className="text-lg font-semibold tracking-normal text-white">AI Governance</h2>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} className="rounded border border-white/10 p-2 text-slate-200 hover:bg-white/10" aria-label="Close governance modal">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-5 px-5 py-5 text-sm leading-6 text-slate-300">
          <section>
            <h3 className="mb-1 inline-flex items-center gap-2 font-semibold text-white">
              <ShieldCheck size={16} className="text-emerald-200" aria-hidden="true" />
              Model and Runtime
            </h3>
            <p>ConsultIQ uses Gemini 2.5 Flash through the Gemini Developer API when `GEMINI_API_KEY` is configured. If Gemini is unavailable or quota-limited, the app can use Groq for final synthesis when `GROQ_API_KEY` is configured. Without either provider, it runs deterministic local fallback mode.</p>
          </section>
          <section>
            <h3 className="mb-1 inline-flex items-center gap-2 font-semibold text-white">
              <Database size={16} className="text-sky-200" aria-hidden="true" />
              Tool Boundaries
            </h3>
            <p>The agent can only call local static tools for knowledge search, project lookup, compliance checks, document drafting, and workflow design. Groq fallback is synthesis-only; it does not execute tools or change compliance verdicts. The app does not use web search, databases, email, calendars, or real enterprise systems.</p>
          </section>
          <section>
            <h3 className="mb-1 inline-flex items-center gap-2 font-semibold text-white">
              <LockKeyhole size={16} className="text-amber-200" aria-hidden="true" />
              Data Handling
            </h3>
            <p>All business data in this prototype is fake. Chat history is stored in browser localStorage. The server sends the latest conversation context and selected local tool outputs to Gemini to produce an answer.</p>
          </section>
          <section>
            <h3 className="mb-1 font-semibold text-white">PII and Confidentiality</h3>
            <p>No real client data, PII, credentials, or confidential information should be entered. Compliance verdicts come from deterministic local rules and require human review when risk is unclear.</p>
          </section>
          <section>
            <h3 className="mb-1 font-semibold text-white">Free Tier Note</h3>
            <p>Gemini and Groq free-tier usage are subject to provider quota and rate limits. This demo is designed for portfolio evaluation, not production workload volume.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
