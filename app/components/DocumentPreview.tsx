"use client";

import { useState } from "react";
import { Clipboard } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type DocumentPreviewProps = {
  content: string;
  label?: string;
  defaultOpen?: boolean;
};

export default function DocumentPreview({ content, label = "Generated Brief", defaultOpen = true }: DocumentPreviewProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("error");
      window.setTimeout(() => setCopyState("idle"), 2200);
    }
  };

  const contentBlock = (
    <div className="min-w-0 px-3 py-4 sm:px-4">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
          h1: ({ children }) => (
            <h1 className="mb-3 mt-2 text-xl font-semibold tracking-normal text-white sm:text-2xl">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2 mt-5 text-base font-semibold tracking-normal text-slate-100">{children}</h2>
          ),
          h3: ({ children }) => <h3 className="mb-1 mt-4 text-sm font-semibold text-slate-100">{children}</h3>,
          p: ({ children }) => <p className="my-2 break-words text-sm leading-6 text-slate-300">{children}</p>,
          ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-300">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-300">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
          code: ({ children }) => (
            <code className="rounded bg-white/10 px-1 py-0.5 text-[0.85em] text-slate-100">{children}</code>
          ),
          pre: ({ children }) => (
            <pre className="my-3 overflow-auto rounded-md border border-white/10 bg-black/30 p-3 text-xs leading-5 text-slate-200">
              {children}
            </pre>
          ),
          a: ({ children, href }) => (
            <a href={href} className="text-sky-200 underline underline-offset-2" target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto">
              <table className="min-w-[520px] w-full border-collapse text-left text-xs text-slate-300">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="border border-white/10 bg-white/[0.04] px-2 py-1 font-semibold text-white">{children}</th>,
          td: ({ children }) => <td className="border border-white/10 px-2 py-1 align-top">{children}</td>
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
  );

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-3 sm:px-4">
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <button
        type="button"
        onClick={copy}
        className="inline-flex min-h-9 items-center gap-2 rounded border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10"
        aria-live="polite"
      >
        <Clipboard size={13} aria-hidden="true" />
        {copyState === "copied" ? "Copied" : copyState === "error" ? "Copy failed" : "Copy"}
      </button>
    </div>
  );

  if (!defaultOpen) {
    return (
      <details className="group min-w-0 rounded-md border border-white/10 bg-ink-950/60">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3 sm:px-4">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{label}</span>
          <span className="text-xs text-slate-500 group-open:hidden">Open</span>
          <span className="hidden text-xs text-slate-500 group-open:inline">Close</span>
        </summary>
        <div className="border-t border-white/10">
          <div className="flex justify-end px-3 pt-3 sm:px-4">
            <button
              type="button"
              onClick={copy}
              className="inline-flex min-h-9 items-center gap-2 rounded border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10"
              aria-live="polite"
            >
              <Clipboard size={13} aria-hidden="true" />
              {copyState === "copied" ? "Copied" : copyState === "error" ? "Copy failed" : "Copy"}
            </button>
          </div>
          {contentBlock}
        </div>
      </details>
    );
  }

  return (
    <div className="min-w-0 rounded-md border border-white/10 bg-ink-950/60">
      {header}
      {contentBlock}
    </div>
  );
}
