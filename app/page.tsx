"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CapabilityPanel from "./components/CapabilityPanel";
import ChatHeader from "./components/ChatHeader";
import ChatMessage, { type UIMessage } from "./components/ChatMessage";
import ComposerForm from "./components/ComposerForm";
import EmptyState from "./components/EmptyState";
import GovernanceModal from "./components/GovernanceModal";
import Sidebar from "./components/Sidebar";
import ToolCallIndicator from "./components/ToolCallIndicator";
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
  const bottomRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeId, loading]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId),
    [activeId, conversations]
  );

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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([replacement]));
  };

  const sendMessage = async (overridePrompt?: string) => {
    const prompt = (overridePrompt ?? input).trim();
    if (!prompt || loading || !activeConversation) return;

    const userMessage: UIMessage = {
      id: newId("msg"),
      role: "user",
      content: prompt
    };

    const nextMessages = [...activeConversation.messages, userMessage];
    updateActiveConversation((conversation) => ({
      ...conversation,
      title: conversation.messages.length === 0 ? titleFromPrompt(prompt) : conversation.title,
      mode,
      messages: nextMessages,
      updatedAt: new Date().toISOString()
    }));
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          mode,
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content
          }))
        })
      });

      if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error.error ?? "The chat request failed.");
      }

      const data = (await response.json()) as ChatApiResponse;
      const assistantMessage: UIMessage = {
        id: newId("msg"),
        role: "assistant",
        content: data.message,
        toolEvents: data.toolEvents,
        metadata: data.metadata,
        flags: data.flags
      };

      updateActiveConversation((conversation) => ({
        ...conversation,
        messages: [...conversation.messages, assistantMessage],
        updatedAt: new Date().toISOString()
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const assistantMessage: UIMessage = {
        id: newId("msg"),
        role: "assistant",
        content: `I could not complete the request.\n\n${message}`,
        flags: {
          uncertainty: true,
          complianceWarning: false,
          humanReviewRequired: false
        }
      };
      updateActiveConversation((conversation) => ({
        ...conversation,
        messages: [...conversation.messages, assistantMessage],
        updatedAt: new Date().toISOString()
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-ink-950 text-white">
      <GovernanceModal open={governanceOpen} onClose={() => setGovernanceOpen(false)} />
      <div className="flex min-h-screen flex-col lg:flex-row">
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
          onSendPrompt={(prompt) => void sendMessage(prompt)}
          onOpenGovernance={() => setGovernanceOpen(true)}
        />

        <section className="flex min-h-[70vh] flex-1 flex-col">
          <ChatHeader mode={mode} messageCount={messageCount} toolCallCount={toolCallCount} />

          <div className="flex-1 overflow-y-auto px-4 py-5 lg:px-6">
            <div className="mx-auto max-w-5xl space-y-4">
              {activeConversation?.messages.length === 0 ? (
                <EmptyState onRunWorkflow={() => void sendMessage(workflowPrompts[0])} />
              ) : null}

              {activeConversation?.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
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
            onInputChange={setInput}
            onSubmit={() => void sendMessage()}
          />
        </section>
        <CapabilityPanel />
      </div>
    </main>
  );
}
