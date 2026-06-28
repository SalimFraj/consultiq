"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const sourceDataSections = [
  {
    id: "business",
    label: "Business Data",
    description: "Messy intake, project records, risk logs, decisions, and stakeholder updates used by the workflow.",
    data: {
      weekly_update_sources: weeklyUpdateSources,
      project_register: projects
    }
  },
  {
    id: "policy",
    label: "Policy Data",
    description: "Knowledge-base documents and standards the assistant can retrieve before drafting or answering.",
    data: {
      knowledge_base: knowledgeBase
    }
  },
  {
    id: "rules",
    label: "Rules",
    description: "Compliance guardrails and workflow patterns that constrain how the AI should behave.",
    data: {
      compliance_rules: complianceRules,
      workflow_patterns: workflowPatterns
    }
  },
  {
    id: "evals",
    label: "Evals",
    description: "Test prompts, expected tool usage, and expected behavior used to validate the prototype.",
    data: {
      eval_cases: evalCases
    }
  }
] as const;

type SourceDataSectionId = (typeof sourceDataSections)[number]["id"];

export default function SourceDataModal({ open, onClose }: SourceDataModalProps) {
  const [activeSectionId, setActiveSectionId] = useState<SourceDataSectionId>("business");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const activeSection = sourceDataSections.find((section) => section.id === activeSectionId) ?? sourceDataSections[0];
  const rawSourceData = useMemo(() => JSON.stringify(activeSection.data, null, 2), [activeSection]);

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
          This includes fake business inputs, policy docs, compliance rules, and eval cases used by the local AI workflow.
        </div>

        <div className="border-b border-white/10 px-4 py-3 sm:px-5">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Source data sections">
            {sourceDataSections.map((section) => {
              const selected = section.id === activeSection.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveSectionId(section.id)}
                  className={`rounded-md border px-3 py-2 text-xs font-medium transition ${
                    selected
                      ? "border-emerald-300/35 bg-emerald-300/15 text-emerald-100"
                      : "border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {section.label}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">{activeSection.description}</p>
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
