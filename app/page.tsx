"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CaseStudyModal from "./components/CaseStudyModal";
import CapabilityPanel from "./components/CapabilityPanel";
import ChatHeader from "./components/ChatHeader";
import ChatMessage, { type UIMessage } from "./components/ChatMessage";
import ComposerForm from "./components/ComposerForm";
import EmptyState from "./components/EmptyState";
import GovernanceModal from "./components/GovernanceModal";
import RecruiterReviewInvite from "./components/RecruiterReviewInvite";
import ReviewerWalkthrough from "./components/ReviewerWalkthrough";
import Sidebar from "./components/Sidebar";
import ToolCallIndicator from "./components/ToolCallIndicator";
import { MAX_TOOL_CALLS } from "./lib/constants";
import type { ReviewerDemoPayload, ReviewerDemoResponse } from "./lib/reviewerDemo";
import type { ChatApiResponse, ChatMode } from "./lib/types";

type Conversation = {
  id: string;
  title: string;
  mode: ChatMode;
  messages: UIMessage[];
  updatedAt: string;
};

const STORAGE_KEY = "consultiq.conversations.v1";

const assistantPrompts = [
  "What is our policy on using AI tools with client data?",
  "Give me a status update on Project Northstar.",
  "Draft a risk summary for a client migration engagement.",
  "Is it compliant to share a client's financial data with a third-party vendor for analysis?"
];

const workflowPrompts = [
  "Run the weekly update workflow for Project Northstar using the sample notes and risk log.",
  "Run a 90-second reviewer path for ConsultIQ: show the messy source artifacts, bounded tool calls, generated weekly update, compliance gate, capability candidate packet, accountable owner, success metric, and production gaps.",
  "Create an AI Lab prototype brief for a Gemini Enterprise adoption readiness workflow that captures use case intake, data sensitivity, accountable owner, adoption risk, measurable outcome, human review, and rollout recommendation.",
  "Our teams spend too much time preparing weekly client updates from scattered notes and risk logs. Design an agentic workflow to improve this.",
  "Create an AI Lab prototype brief for automating internal engagement status reporting."
];

function newId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function createConversation(mode: ChatMode = "workflow"): Conversation {
  return {
    id: newId("chat"),
    title: "New workbench session",
    mode,
    messages: [],
    updatedAt: new Date().toISOString()
  };
}

function titleFromPrompt(prompt: string) {
  return prompt.length > 42 ? `${prompt.slice(0, 42)}...` : prompt;
}

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [mode, setMode] = useState<ChatMode>("workflow");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [governanceOpen, setGovernanceOpen] = useState(false);
  const [caseStudyOpen, setCaseStudyOpen] = useState(false);
  const [recruiterInviteOpen, setRecruiterInviteOpen] = useState(false);
  const [reviewerWalkthrough, setReviewerWalkthrough] = useState<{
    open: boolean;
    loading: boolean;
    demo?: ReviewerDemoPayload;
    error?: string;
    startAtOutcome?: boolean;
  }>({ open: false, loading: false });
  const [composerFocusToken, setComposerFocusToken] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const hasHydratedRef = useRef(false);
  const shouldAutoScrollRef = useRef(false);
  const recruiterEntryHandledRef = useRef(false);
  const runReviewerDemoRef = useRef<(options?: { startAtOutcome?: boolean }) => Promise<void>>(async () => {});

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Conversation[];
        if (parsed.length > 0) {
          setConversations(parsed);
          setActiveId(parsed[0].id);
          setMode(parsed[0].mode);
          return;
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    const initial = createConversation("workflow");
    setConversations([initial]);
    setActiveId(initial.id);
  }, []);

  useEffect(() => {
    if (conversations.length > 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    }
  }, [conversations]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId),
    [activeId, conversations]
  );

  useEffect(() => {
    if (!activeConversation) return;

    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      requestAnimationFrame(() => {
        scrollAreaRef.current?.scrollTo({ top: 0 });
        window.scrollTo({ top: 0 });
      });
      return;
    }

    if (!shouldAutoScrollRef.current) return;

    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    if (!loading) shouldAutoScrollRef.current = false;
  }, [activeConversation, loading]);

  const prompts = mode === "workflow" ? workflowPrompts : assistantPrompts;
  const messageCount = activeConversation?.messages.length ?? 0;
  const toolCallCount =
    activeConversation?.messages.reduce((count, message) => count + (message.toolEvents?.length ?? 0), 0) ?? 0;

  const updateActiveConversation = (updater: (conversation: Conversation) => Conversation) => {
    setConversations((current) =>
      current.map((conversation) => (conversation.id === activeId ? updater(conversation) : conversation))
    );
  };

  const startNewChat = (nextMode: ChatMode = mode) => {
    const conversation = createConversation(nextMode);
    setConversations((current) => [conversation, ...current]);
    setActiveId(conversation.id);
    setMode(nextMode);
    setInput("");
    setComposerFocusToken((token) => token + 1);
    requestAnimationFrame(() => {
      scrollAreaRef.current?.scrollTo({ top: 0 });
      window.scrollTo({ top: 0 });
    });
  };

  const switchMode = (nextMode: ChatMode) => {
    setMode(nextMode);
    updateActiveConversation((conversation) => ({
      ...conversation,
      mode: nextMode,
      updatedAt: new Date().toISOString()
    }));
  };

  const deleteConversation = (id: string) => {
    setConversations((current) => {
      const remaining = current.filter((conversation) => conversation.id !== id);
      if (remaining.length === 0) {
        const replacement = createConversation(mode);
        setActiveId(replacement.id);
        setMode(replacement.mode);
        return [replacement];
      }

      if (id === activeId) {
        setActiveId(remaining[0].id);
        setMode(remaining[0].mode);
      }

      return remaining;
    });
  };

  const clearConversations = () => {
    const replacement = createConversation(mode);
    setConversations([replacement]);
    setActiveId(replacement.id);
    setMode(replacement.mode);
    setInput("");
    setComposerFocusToken((token) => token + 1);
    requestAnimationFrame(() => {
      scrollAreaRef.current?.scrollTo({ top: 0 });
      window.scrollTo({ top: 0 });
    });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([replacement]));
  };

  const sendMessage = async (overridePrompt?: string) => {
    const prompt = (overridePrompt ?? input).trim();
    if (!prompt || loading || !activeConversation) return;

    const userMessage: UIMessage = { id: newId("msg"), role: "user", content: prompt };
    const nextMessages = [...activeConversation.messages, userMessage];
    updateActiveConversation((conversation) => ({
      ...conversation,
      title: conversation.messages.length === 0 ? titleFromPrompt(prompt) : conversation.title,
      mode,
      messages: nextMessages,
      updatedAt: new Date().toISOString()
    }));
    setInput("");
    shouldAutoScrollRef.current = true;
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, messages: nextMessages.map((message) => ({ role: message.role, content: message.content })) })
      });
      if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error.error ?? "The chat request failed.");
      }
      const data = (await response.json()) as ChatApiResponse;
      const assistantMessage: UIMessage = { id: newId("msg"), role: "assistant", content: data.message, toolEvents: data.toolEvents, metadata: data.metadata, flags: data.flags };
      updateActiveConversation((conversation) => ({ ...conversation, messages: [...conversation.messages, assistantMessage], updatedAt: new Date().toISOString() }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      updateActiveConversation((conversation) => ({
        ...conversation,
        messages: [...conversation.messages, { id: newId("msg"), role: "assistant", content: "I could not complete the request.\n\n" + message, flags: { uncertainty: true, complianceWarning: false, humanReviewRequired: false } }],
        updatedAt: new Date().toISOString()
      }));
    } finally {
      setLoading(false);
    }
  };

  const runReviewerDemo = async (options: { startAtOutcome?: boolean } = {}) => {
    if (loading || !activeConversation) return;
    const startAtOutcome = options.startAtOutcome ?? false;
    const userMessage: UIMessage = { id: newId("msg"), role: "user", content: "Run the structured 90-second recruiter review for ConsultIQ." };

    window.sessionStorage.setItem("consultiq.recruiter-invite.v1", "seen");
    setRecruiterInviteOpen(false);
    setReviewerWalkthrough({ open: true, loading: true, startAtOutcome });
    updateActiveConversation((conversation) => ({
      ...conversation,
      title: conversation.messages.length === 0 ? "90-second recruiter review" : conversation.title,
      mode: "workflow",
      messages: [...conversation.messages, userMessage],
      updatedAt: new Date().toISOString()
    }));
    setMode("workflow");
    shouldAutoScrollRef.current = true;
    setLoading(true);

    try {
      const response = await fetch("/api/reviewer-demo", { method: "POST" });
      if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error.error ?? "The reviewer demo request failed.");
      }
      const data = (await response.json()) as ReviewerDemoResponse;
      const assistantMessage: UIMessage = {
        id: newId("msg"),
        role: "assistant",
        content: data.message,
        toolEvents: data.toolEvents,
        metadata: data.metadata,
        flags: data.flags,
        guidedReview: true,
        reviewerDemo: data.review
      };
      updateActiveConversation((conversation) => ({ ...conversation, messages: [...conversation.messages, assistantMessage], updatedAt: new Date().toISOString() }));
      setReviewerWalkthrough({ open: true, loading: false, demo: data.review, startAtOutcome });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setReviewerWalkthrough({ open: true, loading: false, error: message, startAtOutcome: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runReviewerDemoRef.current = runReviewerDemo;
  });

  useEffect(() => {
    if (!activeConversation || recruiterEntryHandledRef.current) return;
    recruiterEntryHandledRef.current = true;
    const directReview = window.location.pathname === "/review" || new URLSearchParams(window.location.search).get("review") === "1";
    if (directReview) {
      void runReviewerDemoRef.current();
      return;
    }
    if (window.sessionStorage.getItem("consultiq.recruiter-invite.v1")) return;
    const timer = window.setTimeout(() => setRecruiterInviteOpen(true), 450);
    return () => window.clearTimeout(timer);
  }, [activeConversation]);

  return (
    <main className="min-h-[100dvh] bg-ink-950 text-white">
      <GovernanceModal open={governanceOpen} onClose={() => setGovernanceOpen(false)} />
      <CaseStudyModal open={caseStudyOpen} onClose={() => setCaseStudyOpen(false)} />
      <RecruiterReviewInvite
        open={recruiterInviteOpen}
        onStart={() => void runReviewerDemo()}
        onSkipToOutcome={() => void runReviewerDemo({ startAtOutcome: true })}
        onExplore={() => {
          window.sessionStorage.setItem("consultiq.recruiter-invite.v1", "seen");
          setRecruiterInviteOpen(false);
        }}
        onClose={() => {
          window.sessionStorage.setItem("consultiq.recruiter-invite.v1", "seen");
          setRecruiterInviteOpen(false);
        }}
      />
      <ReviewerWalkthrough
        open={reviewerWalkthrough.open}
        loading={reviewerWalkthrough.loading}
        demo={reviewerWalkthrough.demo}
        error={reviewerWalkthrough.error}
        startAtOutcome={reviewerWalkthrough.startAtOutcome}
        onClose={() => setReviewerWalkthrough((current) => ({ ...current, open: false }))}
        onRetry={() => void runReviewerDemo()}
        onOpenEvidence={() => {
          setReviewerWalkthrough((current) => ({ ...current, open: false }));
          requestAnimationFrame(() => {
            const evidenceCards = document.querySelectorAll('[data-reviewer-evidence="true"]');
            const latestEvidence = evidenceCards[evidenceCards.length - 1];
            latestEvidence?.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        }}
      />
      <div className="flex min-h-[100dvh] flex-col lg:h-screen lg:min-h-0 lg:overflow-hidden lg:flex-row">
        <Sidebar
          mode={mode}
          conversations={conversations}
          activeId={activeId}
          prompts={prompts}
          onNewChat={startNewChat}
          onSwitchMode={switchMode}
          onSelectConversation={(id, conversationMode) => {
            setActiveId(id);
            setMode(conversationMode);
          }}
          onDeleteConversation={deleteConversation}
          onClearConversations={clearConversations}
          onSendPrompt={(prompt) =>
            prompt === workflowPrompts[1] ? void runReviewerDemo() : void sendMessage(prompt)
          }
          onOpenGovernance={() => setGovernanceOpen(true)}
          onOpenCaseStudy={() => setCaseStudyOpen(true)}
        />

        <section className="flex min-h-[calc(100dvh-73px)] flex-1 flex-col lg:h-screen lg:min-h-0">
          <ChatHeader
            mode={mode}
            messageCount={messageCount}
            toolCallCount={toolCallCount}
            toolCallLimit={MAX_TOOL_CALLS}
          />

          <div ref={scrollAreaRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-4 lg:px-6 lg:py-5">
            <div className="mx-auto max-w-5xl space-y-4">
              {activeConversation?.messages.length === 0 ? (
                <EmptyState
                  onRunWorkflow={() => void sendMessage(workflowPrompts[0])}
                  onRunGuidedDemo={() => void runReviewerDemo()}
                />
              ) : null}

              {activeConversation?.messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onReplayReviewer={message.reviewerDemo ? () => setReviewerWalkthrough({ open: true, loading: false, demo: message.reviewerDemo }) : undefined}
                />
              ))}

              {loading ? <ToolCallIndicator events={[]} loading mode={mode} /> : null}
              <div ref={bottomRef} />
            </div>
          </div>

          <ComposerForm
            input={input}
            mode={mode}
            loading={loading}
            firstPrompt={prompts[0] ?? ""}
            focusToken={composerFocusToken}
            onInputChange={setInput}
            onSubmit={() => void sendMessage()}
          />
        </section>
        <CapabilityPanel />
      </div>
    </main>
  );
}
