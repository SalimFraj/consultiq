"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import type { ChatMode } from "@/lib/types";

type ComposerFormProps = {
  input: string;
  mode: ChatMode;
  loading: boolean;
  firstPrompt: string;
  focusToken: number;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
};

export default function ComposerForm({ input, mode, loading, firstPrompt, focusToken, onInputChange, onSubmit }: ComposerFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (focusToken > 0) textareaRef.current?.focus();
  }, [focusToken]);

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
    <form
      onSubmit={handleSubmit}
      className="sticky bottom-0 z-20 border-t border-white/10 bg-ink-900/95 px-3 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur sm:px-4 lg:px-6 lg:py-4"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 md:flex-row">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === "workflow"
              ? "Run or design a governed workflow..."
              : "Ask about policy, projects, compliance, or a document draft..."
          }
          rows={2}
          className="min-h-20 max-h-40 flex-1 resize-none rounded-md border border-white/10 bg-ink-950 px-4 py-3 text-sm leading-6 text-white placeholder:text-slate-500 transition-colors focus:border-emerald-300/30 md:min-h-24"
        />
        <div className="flex gap-2 md:flex-col">
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-ink-950 transition-opacity hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 md:flex-none md:self-stretch"
          >
            <ArrowUp size={16} aria-hidden="true" />
            Send
          </button>
          <button
            type="button"
            onClick={() => onInputChange(firstPrompt)}
            className="inline-flex min-h-12 w-12 items-center justify-center rounded-md border border-white/10 px-3 py-3 text-sm text-slate-300 transition-colors hover:bg-white/10"
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
