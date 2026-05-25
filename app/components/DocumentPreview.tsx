"use client";

import { Clipboard } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type DocumentPreviewProps = {
  content: string;
};

export default function DocumentPreview({ content }: DocumentPreviewProps) {
  const copy = async () => {
    await navigator.clipboard.writeText(content);
  };

  return (
    <div className="rounded-md border border-white/10 bg-ink-950/60">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Generated Brief</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-2 rounded border border-white/10 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10"
        >
          <Clipboard size={13} aria-hidden="true" />
          Copy
        </button>
      </div>
      <div className="px-4 py-4">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
          h1: ({ children }) => (
            <h1 className="mb-3 mt-2 text-2xl font-semibold tracking-normal text-white">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2 mt-5 text-base font-semibold tracking-normal text-slate-100">{children}</h2>
          ),
          h3: ({ children }) => <h3 className="mb-1 mt-4 text-sm font-semibold text-slate-100">{children}</h3>,
          p: ({ children }) => <p className="my-2 text-sm leading-6 text-slate-300">{children}</p>,
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
              <table className="w-full border-collapse text-left text-xs text-slate-300">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="border border-white/10 bg-white/[0.04] px-2 py-1 font-semibold text-white">{children}</th>,
          td: ({ children }) => <td className="border border-white/10 px-2 py-1 align-top">{children}</td>
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
