"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Bot,
  Command,
  FlaskConical,
  MessageSquare,
  PackageCheck,
  Plus,
  ShieldCheck,
  Trash2,
  Workflow,
  X
} from "lucide-react";
import { capabilities } from "@/lib/capabilities";
import { MAX_TOOL_CALLS } from "@/lib/constants";
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
        <h1 className="mt-1 truncate text-xl font-semibold tracking-normal text-white sm:text-2xl">ConsultIQ</h1>
        {compact ? null : (
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Bridge software execution and business workflow design through governed AI prototypes.
          </p>
        )}
      </div>
    </div>
  );
}

type ActionCallback = () => void;

function NewSessionButton({ mode, onNewChat, onAfterAction }: Pick<SidebarProps, "mode" | "onNewChat"> & { onAfterAction?: ActionCallback }) {
  return (
    <button
      type="button"
      onClick={() => {
        onNewChat(mode);
        onAfterAction?.();
      }}
      className="flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white px-4 py-2.5 text-sm font-medium text-ink-950 hover:bg-slate-200"
    >
      <Plus size={16} aria-hidden="true" />
      New Session
    </button>
  );
}

function ModeSwitch({ mode, onSwitchMode, onAfterAction }: Pick<SidebarProps, "mode" | "onSwitchMode"> & { onAfterAction?: ActionCallback }) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-md border border-white/10 bg-ink-950 p-1">
      <button
        type="button"
        onClick={() => {
          onSwitchMode("workflow");
          onAfterAction?.();
        }}
        className={`flex min-h-10 items-center justify-center gap-2 rounded px-3 py-2 text-sm transition-colors ${
          mode === "workflow" ? "bg-white text-ink-950" : "text-slate-300 hover:bg-white/10"
        }`}
      >
        <Workflow size={15} aria-hidden="true" />
        Run Workflow
      </button>
      <button
        type="button"
        onClick={() => {
          onSwitchMode("assistant");
          onAfterAction?.();
        }}
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
  onOpenCaseStudy,
  onAfterAction
}: Pick<SidebarProps, "onOpenGovernance" | "onOpenCaseStudy"> & { onAfterAction?: ActionCallback }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
      <button
        type="button"
        onClick={() => {
          onOpenGovernance();
          onAfterAction?.();
        }}
        className="flex w-full items-start gap-3 rounded-md border border-slate-500/40 bg-ink-850 px-4 py-3 text-left text-sm text-slate-200 hover:bg-white/10"
      >
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-200" aria-hidden="true" />
        <span className="min-w-0">
          AI Governance
          <span className="block text-xs text-slate-500">Compliance rules, data boundaries, and human review</span>
        </span>
      </button>

      <button
        type="button"
        onClick={() => {
          onOpenCaseStudy();
          onAfterAction?.();
        }}
        className="flex w-full items-start gap-3 rounded-md border border-sky-300/25 bg-sky-300/[0.06] px-4 py-3 text-left text-sm text-slate-200 hover:bg-sky-300/10"
      >
        <BookOpen size={18} className="mt-0.5 shrink-0 text-sky-200" aria-hidden="true" />
        <span className="min-w-0">
          Case Study
          <span className="block text-xs text-slate-500">Business problem, system design, evals, and rollout path</span>
        </span>
      </button>
    </div>
  );
}

function CompactCapabilitySummary() {
  return (
    <section className="hidden rounded-md border border-emerald-300/20 bg-emerald-300/[0.06] p-3 lg:block xl:hidden">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-emerald-300/20 bg-ink-950 text-emerald-100">
          <PackageCheck size={15} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/70">Capability Factory</p>
          <h2 className="mt-1 text-sm font-semibold text-white">Workbench signal stays visible</h2>
          <p className="mt-1 text-xs leading-5 text-emerald-50/75">
            Bounded tools, call cap, and eval coverage are summarized here until the full panel has room.
          </p>
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded border border-white/10 bg-ink-950/45 px-2 py-2">
          <dt className="text-[11px] leading-4 text-slate-500">Tools</dt>
          <dd className="mt-1 text-lg font-semibold text-white">{capabilities.length}</dd>
        </div>
        <div className="rounded border border-white/10 bg-ink-950/45 px-2 py-2">
          <dt className="text-[11px] leading-4 text-slate-500">Cap</dt>
          <dd className="mt-1 text-lg font-semibold text-white">{MAX_TOOL_CALLS}</dd>
        </div>
        <div className="rounded border border-white/10 bg-ink-950/45 px-2 py-2">
          <dt className="text-[11px] leading-4 text-slate-500">Evals</dt>
          <dd className="mt-1 inline-flex items-center gap-1 text-lg font-semibold text-white">
            <FlaskConical size={14} className="text-amber-200" aria-hidden="true" />
            10
          </dd>
        </div>
      </dl>
    </section>
  );
}

function PromptList({ prompts, onSendPrompt, onAfterAction }: Pick<SidebarProps, "prompts" | "onSendPrompt"> & { onAfterAction?: ActionCallback }) {
  return (
    <section>
      <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">Operator Scenarios</p>
      <div className="grid max-h-52 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:max-h-none lg:grid-cols-1 lg:overflow-visible lg:pr-0">
        {prompts.map((prompt) => (
          <button
            type="button"
            key={prompt}
            onClick={() => {
              onSendPrompt(prompt);
              onAfterAction?.();
            }}
            className="group flex min-h-12 w-full items-start gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-sm leading-5 text-slate-300 hover:bg-white/10"
          >
            <Workflow size={14} className="mt-1 shrink-0 text-slate-500 group-hover:text-slate-300" aria-hidden="true" />
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
  onDeleteConversation,
  onAfterAction
}: Pick<SidebarProps, "conversations" | "activeId" | "onClearConversations" | "onSelectConversation" | "onDeleteConversation"> & {
  onAfterAction?: ActionCallback;
}) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Session History</p>
        {conversations.length > 1 || conversations.some((conversation) => conversation.messages.length > 0) ? (
          <button
            type="button"
            onClick={() => {
              onClearConversations();
              onAfterAction?.();
            }}
            className="text-xs text-slate-500 underline-offset-2 hover:text-slate-200 hover:underline"
          >
            Clear all
          </button>
        ) : null}
      </div>
      <div className="max-h-52 space-y-2 overflow-auto pr-1 lg:max-h-64">
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
              onClick={() => {
                onSelectConversation(conversation.id, conversation.mode);
                onAfterAction?.();
              }}
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

function SidebarControls(props: SidebarProps & { onAfterAction?: ActionCallback }) {
  return (
    <>
      <NewSessionButton mode={props.mode} onNewChat={props.onNewChat} onAfterAction={props.onAfterAction} />
      <ModeSwitch mode={props.mode} onSwitchMode={props.onSwitchMode} onAfterAction={props.onAfterAction} />
      <UtilityActions
        onOpenGovernance={props.onOpenGovernance}
        onOpenCaseStudy={props.onOpenCaseStudy}
        onAfterAction={props.onAfterAction}
      />
      <CompactCapabilitySummary />
      <PromptList prompts={props.prompts} onSendPrompt={props.onSendPrompt} onAfterAction={props.onAfterAction} />
      <ConversationHistory
        conversations={props.conversations}
        activeId={props.activeId}
        onClearConversations={props.onClearConversations}
        onSelectConversation={props.onSelectConversation}
        onDeleteConversation={props.onDeleteConversation}
        onAfterAction={props.onAfterAction}
      />
    </>
  );
}

function MobileCommandDrawer(props: SidebarProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <aside className="sticky top-0 z-30 border-b border-white/10 bg-ink-900/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <BrandIntro compact />
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs text-slate-200 hover:bg-white/10"
            aria-haspopup="dialog"
            aria-expanded={open}
          >
            <Command size={14} aria-hidden="true" />
            Menu
          </button>
        </div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Workbench command drawer">
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-black/60"
            onClick={() => setOpen(false)}
            aria-label="Close command drawer"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[86dvh] overflow-y-auto rounded-t-md border border-white/10 bg-ink-900 shadow-panel">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-ink-900/95 px-4 py-3 backdrop-blur">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Command Center</p>
                <h2 className="text-base font-semibold tracking-normal text-white">Workbench actions</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-9 items-center gap-2 rounded border border-white/10 px-3 py-2 text-xs text-slate-200 hover:bg-white/10"
                aria-label="Close command drawer"
                title="Close command drawer"
              >
                <X size={16} aria-hidden="true" />
                Close
              </button>
            </div>
            <div className="space-y-4 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
              <div className="rounded-md border border-emerald-300/20 bg-emerald-300/[0.06] p-3">
                <p className="text-sm font-medium text-emerald-50">
                  {props.mode === "workflow" ? "Workflow mode active" : "Assistant mode active"}
                </p>
                <p className="mt-1 text-xs leading-5 text-emerald-50/70">
                  Launch a demo path, switch modes, inspect governance, or resume a prior session.
                </p>
              </div>
              <SidebarControls {...props} onAfterAction={() => setOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}
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
      <MobileCommandDrawer {...props} />

      <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-ink-900 lg:block lg:h-screen lg:overflow-y-auto xl:w-80">
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
