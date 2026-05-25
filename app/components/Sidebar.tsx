"use client";

import { Bot, MessageSquare, Plus, ShieldCheck, Sparkles, Trash2, Workflow } from "lucide-react";
import type { ChatMode } from "@/lib/types";

type Conversation = {
  id: string;
  title: string;
  mode: ChatMode;
  messages: Array<{ id: string }>;
};

type SidebarProps = {
  mode: ChatMode;
  conversations: Conversation[];
  activeId: string;
  prompts: string[];
  onNewChat: (mode: ChatMode) => void;
  onSwitchMode: (mode: ChatMode) => void;
  onSelectConversation: (id: string, mode: ChatMode) => void;
  onDeleteConversation: (id: string) => void;
  onClearConversations: () => void;
  onSendPrompt: (prompt: string) => void;
  onOpenGovernance: () => void;
};

export default function Sidebar({
  mode,
  conversations,
  activeId,
  prompts,
  onNewChat,
  onSwitchMode,
  onSelectConversation,
  onDeleteConversation,
  onClearConversations,
  onSendPrompt,
  onOpenGovernance
}: SidebarProps) {
  return (
    <aside className="w-full border-b border-white/10 bg-ink-900 lg:min-h-screen lg:w-80 lg:border-b-0 lg:border-r">
      <div className="space-y-5 p-4">
        <div>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md border border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
            <Bot size={20} aria-hidden="true" />
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">AI Builder Workbench</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal text-white">ConsultIQ</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Turn messy internal workflow problems into governed agentic capability prototypes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNewChat(mode)}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white px-4 py-2.5 text-sm font-medium text-ink-950 hover:bg-slate-200"
        >
          <Plus size={16} aria-hidden="true" />
          New Chat
        </button>

        <div className="grid grid-cols-2 gap-2 rounded-md border border-white/10 bg-ink-950 p-1">
          <button
            type="button"
            onClick={() => onSwitchMode("workflow")}
            className={`flex items-center justify-center gap-2 rounded px-3 py-2 text-sm transition-colors ${mode === "workflow" ? "bg-white text-ink-950" : "text-slate-300 hover:bg-white/10"}`}
          >
            <Workflow size={15} aria-hidden="true" />
            Workflow
          </button>
          <button
            type="button"
            onClick={() => onSwitchMode("assistant")}
            className={`flex items-center justify-center gap-2 rounded px-3 py-2 text-sm transition-colors ${mode === "assistant" ? "bg-white text-ink-950" : "text-slate-300 hover:bg-white/10"}`}
          >
            <MessageSquare size={15} aria-hidden="true" />
            Assistant
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenGovernance}
          className="flex w-full items-start gap-3 rounded-md border border-slate-500/40 bg-ink-850 px-4 py-3 text-left text-sm text-slate-200 hover:bg-white/10"
        >
          <ShieldCheck size={18} className="mt-0.5 text-emerald-200" aria-hidden="true" />
          <span>
            AI Governance
            <span className="block text-xs text-slate-500">Model, data, tools, and review boundaries</span>
          </span>
        </button>

        <section>
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">Demo Prompts</p>
          <div className="space-y-2">
            {prompts.map((prompt) => (
              <button
                type="button"
                key={prompt}
                onClick={() => onSendPrompt(prompt)}
                className="group flex w-full items-start gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-sm leading-5 text-slate-300 hover:bg-white/10"
              >
                <Sparkles size={14} className="mt-1 shrink-0 text-slate-500 group-hover:text-slate-300" aria-hidden="true" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Conversation History</p>
            {conversations.length > 1 || conversations.some((conversation) => conversation.messages.length > 0) ? (
              <button
                type="button"
                onClick={onClearConversations}
                className="text-xs text-slate-500 underline-offset-2 hover:text-slate-200 hover:underline"
              >
                Clear all
              </button>
            ) : null}
          </div>
          <div className="max-h-64 space-y-2 overflow-auto pr-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                  conversation.id === activeId
                    ? "border-slate-300/40 bg-white/10 text-white"
                    : "border-white/10 bg-transparent text-slate-400 hover:bg-white/[0.05]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectConversation(conversation.id, conversation.mode)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="block truncate">{conversation.title}</span>
                  <span className="text-xs capitalize text-slate-500">
                    {conversation.mode} · {conversation.messages.length} messages
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteConversation(conversation.id)}
                  className="rounded p-1 text-slate-500 opacity-100 hover:bg-white/10 hover:text-slate-200 sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label={`Delete ${conversation.title}`}
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}
