"use client";

import { BookOpen, Bot, ChevronDown, MessageSquare, Plus, ShieldCheck, Sparkles, Trash2, Workflow } from "lucide-react";
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
  onOpenCaseStudy: () => void;
};

function BrandIntro({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "flex min-w-0 items-center gap-3" : ""}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
        <Bot size={20} aria-hidden="true" />
      </div>
      <div className={compact ? "min-w-0" : "mt-3"}>
        <p className={`${compact ? "truncate tracking-[0.12em]" : "tracking-[0.2em]"} text-xs uppercase text-slate-500`}>
          AI Builder Workbench
        </p>
        <h1 className="mt-1 truncate text-xl font-semibold tracking-normal text-white sm:text-2xl xl:text-2xl">ConsultIQ</h1>
        {compact ? null : (
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Turn messy internal workflow problems into governed agentic capability prototypes.
          </p>
        )}
      </div>
    </div>
  );
}

function NewSessionButton({ mode, onNewChat }: Pick<SidebarProps, "mode" | "onNewChat">) {
  return (
    <button
      type="button"
      onClick={() => onNewChat(mode)}
      className="flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white px-4 py-2.5 text-sm font-medium text-ink-950 hover:bg-slate-200"
    >
      <Plus size={16} aria-hidden="true" />
      New Session
    </button>
  );
}

function ModeSwitch({ mode, onSwitchMode }: Pick<SidebarProps, "mode" | "onSwitchMode">) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-md border border-white/10 bg-ink-950 p-1">
      <button
        type="button"
        onClick={() => onSwitchMode("workflow")}
        className={`flex min-h-10 items-center justify-center gap-2 rounded px-3 py-2 text-sm transition-colors ${
          mode === "workflow" ? "bg-white text-ink-950" : "text-slate-300 hover:bg-white/10"
        }`}
      >
        <Workflow size={15} aria-hidden="true" />
        Run Workflow
      </button>
      <button
        type="button"
        onClick={() => onSwitchMode("assistant")}
        className={`flex min-h-10 items-center justify-center gap-2 rounded px-3 py-2 text-sm transition-colors ${
          mode === "assistant" ? "bg-white text-ink-950" : "text-slate-300 hover:bg-white/10"
        }`}
      >
        <MessageSquare size={15} aria-hidden="true" />
        Ask
      </button>
    </div>
  );
}

function UtilityActions({
  onOpenGovernance,
  onOpenCaseStudy
}: Pick<SidebarProps, "onOpenGovernance" | "onOpenCaseStudy">) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
      <button
        type="button"
        onClick={onOpenGovernance}
        className="flex w-full items-start gap-3 rounded-md border border-slate-500/40 bg-ink-850 px-4 py-3 text-left text-sm text-slate-200 hover:bg-white/10"
      >
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-200" aria-hidden="true" />
        <span className="min-w-0">
          AI Governance
          <span className="block text-xs text-slate-500">Model, data, tools, and review boundaries</span>
        </span>
      </button>

      <button
        type="button"
        onClick={onOpenCaseStudy}
        className="flex w-full items-start gap-3 rounded-md border border-sky-300/25 bg-sky-300/[0.06] px-4 py-3 text-left text-sm text-slate-200 hover:bg-sky-300/10"
      >
        <BookOpen size={18} className="mt-0.5 shrink-0 text-sky-200" aria-hidden="true" />
        <span className="min-w-0">
          Case Study
          <span className="block text-xs text-slate-500">Problem, architecture, evals, and production path</span>
        </span>
      </button>
    </div>
  );
}

function PromptList({ prompts, onSendPrompt }: Pick<SidebarProps, "prompts" | "onSendPrompt">) {
  return (
    <section>
      <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">Demo Paths</p>
      <div className="grid max-h-52 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 xl:max-h-none xl:grid-cols-1 xl:overflow-visible xl:pr-0">
        {prompts.map((prompt) => (
          <button
            type="button"
            key={prompt}
            onClick={() => onSendPrompt(prompt)}
            className="group flex min-h-12 w-full items-start gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-sm leading-5 text-slate-300 hover:bg-white/10"
          >
            <Sparkles size={14} className="mt-1 shrink-0 text-slate-500 group-hover:text-slate-300" aria-hidden="true" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ConversationHistory({
  conversations,
  activeId,
  onClearConversations,
  onSelectConversation,
  onDeleteConversation
}: Pick<SidebarProps, "conversations" | "activeId" | "onClearConversations" | "onSelectConversation" | "onDeleteConversation">) {
  return (
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
      <div className="max-h-52 space-y-2 overflow-auto pr-1 xl:max-h-64">
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
  );
}

function SidebarControls(props: SidebarProps) {
  return (
    <>
      <NewSessionButton mode={props.mode} onNewChat={props.onNewChat} />
      <ModeSwitch mode={props.mode} onSwitchMode={props.onSwitchMode} />
      <UtilityActions onOpenGovernance={props.onOpenGovernance} onOpenCaseStudy={props.onOpenCaseStudy} />
      <PromptList prompts={props.prompts} onSendPrompt={props.onSendPrompt} />
      <ConversationHistory
        conversations={props.conversations}
        activeId={props.activeId}
        onClearConversations={props.onClearConversations}
        onSelectConversation={props.onSelectConversation}
        onDeleteConversation={props.onDeleteConversation}
      />
    </>
  );
}

export default function Sidebar(props: SidebarProps) {
  const {
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
    onOpenGovernance,
    onOpenCaseStudy
  } = props;

  return (
    <>
      <aside className="sticky top-0 z-30 border-b border-white/10 bg-ink-900/95 backdrop-blur xl:hidden">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
            <BrandIntro compact />
            <span className="inline-flex shrink-0 items-center gap-2 rounded-md border border-white/10 px-2.5 py-1.5 text-xs text-slate-300">
              Menu
              <ChevronDown size={14} className="text-slate-500 transition group-open:rotate-180" aria-hidden="true" />
            </span>
          </summary>
          <div className="space-y-4 border-t border-white/10 px-4 pb-4 pt-3">
            <SidebarControls {...props} />
          </div>
        </details>
      </aside>

      <aside className="hidden w-80 shrink-0 border-r border-white/10 bg-ink-900 xl:block xl:h-screen xl:overflow-y-auto">
        <div className="space-y-5 p-4">
          <BrandIntro />
          <SidebarControls
            mode={mode}
            conversations={conversations}
            activeId={activeId}
            prompts={prompts}
            onNewChat={onNewChat}
            onSwitchMode={onSwitchMode}
            onSelectConversation={onSelectConversation}
            onDeleteConversation={onDeleteConversation}
            onClearConversations={onClearConversations}
            onSendPrompt={onSendPrompt}
            onOpenGovernance={onOpenGovernance}
            onOpenCaseStudy={onOpenCaseStudy}
          />
        </div>
      </aside>
    </>
  );
}
