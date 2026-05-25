"use client";

import { FormEvent, KeyboardEvent } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import type { ChatMode } from "@/lib/types";

type ComposerFormProps = {
  input: string;
  mode: ChatMode;
  loading: boolean;
  firstPrompt: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
};

export default function ComposerForm({ input, mode, loading, firstPrompt, onInputChange, onSubmit }: ComposerFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-white/10 bg-ink-900 px-4 py-4 lg:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 md:flex-row">
        <textarea
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === "workflow"
              ? "Describe a messy internal workflow problem..."
              : "Ask about policy, projects, compliance, or a document draft..."
          }
          rows={3}
          className="min-h-24 flex-1 resize-none rounded-md border border-white/10 bg-ink-950 px-4 py-3 text-sm leading-6 text-white placeholder:text-slate-500 transition-colors focus:border-emerald-300/30"
        />
        <div className="flex gap-2 md:flex-col">
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-ink-950 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 md:flex-none md:self-stretch transition-opacity"
          >
            <ArrowUp size={16} aria-hidden="true" />
            Send
          </button>
          <button
            type="button"
            onClick={() => onInputChange(firstPrompt)}
            className="inline-flex items-center justify-center rounded-md border border-white/10 px-3 py-3 text-sm text-slate-300 hover:bg-white/10 transition-colors"
            aria-label="Load example prompt"
            title="Load example prompt"
          >
            <Sparkles size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </form>
  );
}
