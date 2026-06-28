"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { Database, X } from "lucide-react";
import complianceRules from "@/data/compliance-rules.json";
import evalCases from "@/data/eval-cases.json";
import knowledgeBase from "@/data/knowledge-base.json";
import projects from "@/data/projects.json";
import weeklyUpdateSources from "@/data/weekly-update-sources.json";
import workflowPatterns from "@/data/workflow-patterns.json";

type SourceDataModalProps = {
  open: boolean;
  onClose: () => void;
};

const sourceDataBundle = {
  weekly_update_sources: weeklyUpdateSources,
  project_register: projects,
  knowledge_base: knowledgeBase,
  compliance_rules: complianceRules,
  workflow_patterns: workflowPatterns,
  eval_cases: evalCases
};

export default function SourceDataModal({ open, onClose }: SourceDataModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const rawSourceData = useMemo(() => JSON.stringify(sourceDataBundle, null, 2), []);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus();
    }
  }, [open]);

  const handleFocusTrap = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !panelRef.current) return;

    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else if (document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 px-3 py-3 sm:items-center sm:px-4 sm:py-6"
      onClick={onClose}
      onKeyDown={handleFocusTrap}
    >
      <div
        ref={panelRef}
        className="flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-md border border-white/10 bg-ink-900 shadow-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Source data"
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-4 sm:items-center sm:px-5">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Prototype source bundle</p>
            <h2 className="mt-1 flex items-center gap-2 text-lg font-semibold tracking-normal text-white">
              <Database size={18} className="text-emerald-200" aria-hidden="true" />
              Raw source data
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded border border-white/10 p-2 text-slate-200 hover:bg-white/10"
            aria-label="Close source data"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="border-b border-white/10 px-4 py-3 text-sm text-slate-300 sm:px-5">
          All fake sample data available to the local tool layer, shown as a raw dump.
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-black/30 p-3 sm:p-4">
          <pre className="min-w-full whitespace-pre-wrap break-words rounded-md border border-white/10 bg-ink-950/90 p-4 font-mono text-[11px] leading-5 text-slate-200 sm:text-xs">
            {rawSourceData}
          </pre>
        </div>
      </div>
    </div>
  );
}
