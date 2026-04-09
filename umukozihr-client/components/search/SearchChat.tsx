"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, User, ExternalLink, History, Plus, Search as SearchIcon, X } from "lucide-react";
import Markdown from "react-markdown";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { CandidateResult, ChatConversation, ChatConversationDetail } from "@/lib/types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface SearchChatProps {
  onSearch: (prompt: string, history?: Array<{ role: string; content: string }>) => void;
  isSearching: boolean;
  candidates: CandidateResult[];
  step: string;
  message: string;
  progress: number;
  searchId?: string | null;
  onNewSession?: () => void;
}

const AMBERLYN_AVATAR = "/amberlyn.png";
const SESSION_KEY = "chat_session_id";
const SEARCH_KEY = "last_search_id";
const LEGACY_PREFIX = "legacy-";

const WELCOME_MSG: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi, I'm Amberlyn, your recruiting assistant! Describe the role you're looking to fill -- for example: \"Senior React developer with 5+ years experience in Nairobi\" or \"Marketing manager with B2B SaaS experience.\"",
  timestamp: new Date(),
};

function formatSessionTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toUiMessages(messages: Array<{ role: string; content: string }>): ChatMessage[] {
  if (!messages.length) return [WELCOME_MSG];
  return messages.map((msg, index) => ({
    id: `msg-${index}-${msg.role}`,
    role: msg.role === "user" ? "user" : "assistant",
    content: msg.content,
    timestamp: new Date(),
  }));
}

export function SearchChat({
  onSearch,
  isSearching,
  candidates,
  step,
  message,
  progress,
  searchId,
  onNewSession,
}: SearchChatProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MSG]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatConversation[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeSearchId, setActiveSearchId] = useState<string | null>(searchId ?? null);
  const [activeTitle, setActiveTitle] = useState("New session");
  const [isStartingNewSession, setIsStartingNewSession] = useState(false);
  const [isOpeningSessions, setIsOpeningSessions] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastHandledRef = useRef("");

  const loadSessionList = useCallback(async () => {
    try {
      setSessionsLoading(true);
      const data = await api.listConversations();
      setSessions(data.conversations || []);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  const loadActiveConversation = useCallback(async (nextSearchId: string | null, nextSessionId: string | null) => {
    if (!nextSearchId) {
      setMessages([WELCOME_MSG]);
      setHistoryLoaded(true);
      return;
    }

    try {
      const data = await api.getConversation(nextSearchId, nextSessionId);
      const history = data.messages || [];
      setMessages(toUiMessages(history));
    } catch {
      setMessages([WELCOME_MSG]);
    } finally {
      setHistoryLoaded(true);
    }
  }, []);

  useEffect(() => {
    const storedSessionId = typeof window !== "undefined" ? localStorage.getItem(SESSION_KEY) : null;
    const storedSearchId = typeof window !== "undefined" ? localStorage.getItem(SEARCH_KEY) : null;
    setActiveSessionId(storedSessionId);
    setActiveSearchId(searchId || storedSearchId);
  }, [searchId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (searchId) {
      localStorage.setItem(SEARCH_KEY, searchId);
      setActiveSearchId(searchId);
    }
  }, [searchId]);

  useEffect(() => {
    if (historyLoaded) return;
    void loadActiveConversation(activeSearchId, activeSessionId);
  }, [activeSearchId, activeSessionId, historyLoaded, loadActiveConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, message]);

  useEffect(() => {
    if (isSearching) return;
    const key = `${step}:${message}:${candidates.length}`;
    if (key === lastHandledRef.current) return;
    lastHandledRef.current = key;

    if (candidates.length > 0 && step === "complete") {
      setMessages((prev) => [
        ...prev,
        {
          id: `result-${Date.now()}`,
          role: "assistant",
          content: `I found ${candidates.length} candidate${candidates.length !== 1 ? "s" : ""} matching your criteria. You can open the results page or continue refining this session here.`,
          timestamp: new Date(),
        },
      ]);
    } else if ((step === "clarification" || step === "clarify") && message) {
      setMessages((prev) => [...prev, { id: `clarify-${Date.now()}`, role: "assistant", content: message, timestamp: new Date() }]);
    } else if (step === "error" && message) {
      setMessages((prev) => [...prev, { id: `error-${Date.now()}`, role: "assistant", content: `Something went wrong: ${message}`, timestamp: new Date() }]);
    }
  }, [isSearching, candidates, step, message]);

  const openSessions = useCallback(() => {
    setIsOpeningSessions(true);
    setSessionsOpen(true);
    void loadSessionList().finally(() => setIsOpeningSessions(false));
  }, [loadSessionList]);

  const handleSelectConversation = useCallback(async (conversation: ChatConversation) => {
    setSelectedConversationId(conversation.id);
    try {
      const detail: ChatConversationDetail = await api.getChatHistory(conversation.id);
      const nextSessionId = detail.session_id || conversation.session_id || `${LEGACY_PREFIX}${conversation.id}`;
      const nextSearchId = detail.search_id || conversation.search_id || null;

      if (typeof window !== "undefined") {
        if (nextSessionId) localStorage.setItem(SESSION_KEY, nextSessionId);
        else localStorage.removeItem(SESSION_KEY);

        if (nextSearchId) localStorage.setItem(SEARCH_KEY, nextSearchId);
        else localStorage.removeItem(SEARCH_KEY);
      }

      setActiveSessionId(nextSessionId);
      setActiveSearchId(nextSearchId);
      setActiveTitle(detail.title || conversation.title || "Session");
      setMessages(toUiMessages(detail.messages || []));
      setHistoryLoaded(true);
      setSessionsOpen(false);
    } catch {
      setSessionsOpen(false);
    } finally {
      setSelectedConversationId(null);
    }
  }, []);

  const handleNewSession = useCallback(() => {
    setIsStartingNewSession(true);
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SEARCH_KEY);
    }
    setActiveSessionId(null);
    setActiveSearchId(null);
    setActiveTitle("New session");
    setMessages([WELCOME_MSG]);
    setHistoryLoaded(true);
    lastHandledRef.current = "";
    onNewSession?.();
    inputRef.current?.focus();
    window.setTimeout(() => setIsStartingNewSession(false), 250);
  }, [onNewSession]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isSearching || step === "thinking") return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setHistoryLoaded(true);
    const history = messages
      .filter((msg) => msg.id !== WELCOME_MSG.id)
      .map((msg) => ({ role: msg.role, content: msg.content }));
    setTimeout(() => onSearch(trimmed, history), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative flex h-full flex-col" style={{ background: "var(--color-surface-elevated)", borderRight: "1px solid var(--color-border)" }}>
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3" style={{ borderColor: "var(--color-border)" }}>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--color-text-muted)" }}>
            Recruiting Chat
          </p>
          <p className="truncate text-sm font-medium" style={{ color: "var(--color-text)" }}>
            {activeTitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNewSession}
            disabled={isStartingNewSession}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all hover:-translate-y-0.5 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            style={{
              background: isStartingNewSession ? "color-mix(in srgb, var(--color-brand-orange) 12%, var(--color-surface-secondary))" : "var(--color-surface-secondary)",
              color: isStartingNewSession ? "var(--color-brand-orange)" : "var(--color-text)",
              transform: isStartingNewSession ? "scale(0.98)" : "scale(1)",
            }}
          >
            {isStartingNewSession ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            {isStartingNewSession ? "Resetting..." : "New Session"}
          </button>
          <button
            onClick={openSessions}
            disabled={isOpeningSessions}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all hover:-translate-y-0.5 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            style={{
              background: isOpeningSessions ? "color-mix(in srgb, var(--color-brand-orange) 18%, transparent)" : "color-mix(in srgb, var(--color-brand-orange) 10%, transparent)",
              color: "var(--color-brand-orange)",
              transform: isOpeningSessions ? "scale(0.98)" : "scale(1)",
            }}
          >
            {isOpeningSessions ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <History className="h-3.5 w-3.5" />}
            {isOpeningSessions ? "Opening..." : "All Sessions"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex gap-3 max-w-[85%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}
          >
            {msg.role === "user" ? (
              <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-[hsl(20,100%,55%)] text-white">
                <User className="h-4 w-4" />
              </div>
            ) : (
              <img src={AMBERLYN_AVATAR} alt="Amberlyn" className="flex-shrink-0 h-8 w-8 rounded-full object-cover" />
            )}
            <div
              className={cn("rounded-2xl px-4 py-3 text-sm leading-relaxed", msg.role === "user" ? "rounded-br-md" : "rounded-bl-md")}
              style={
                msg.role === "user"
                  ? { background: "var(--color-brand-orange)", color: "#fff" }
                  : { background: "var(--color-surface-secondary)", color: "var(--color-text)", border: "1px solid var(--color-border)" }
              }
            >
              <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>ul]:m-0 [&>ul]:pl-4 [&>ol]:m-0 [&>ol]:pl-4 [&_strong]:font-semibold">
                <Markdown>{msg.content}</Markdown>
              </div>
            </div>
          </div>
        ))}

        {step === "thinking" && (
          <div className="flex gap-3">
            <img src={AMBERLYN_AVATAR} alt="Amberlyn" className="shrink-0 h-8 w-8 rounded-full object-cover" />
            <div className="rounded-2xl rounded-bl-md px-4 py-3" style={{ background: "var(--color-surface-secondary)", border: "1px solid var(--color-border)" }}>
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--color-text-muted)", animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--color-text-muted)", animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--color-text-muted)", animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {isSearching && (
          <div className="flex gap-3">
            <img src={AMBERLYN_AVATAR} alt="Amberlyn" className="shrink-0 h-8 w-8 rounded-full object-cover" />
            <div className="rounded-2xl rounded-bl-md px-4 py-3 text-sm w-full max-w-[280px] sm:max-w-[340px]" style={{ background: "var(--color-surface-secondary)", color: "var(--color-text)", border: "1px solid var(--color-border)" }}>
              <div className="flex items-center gap-2 mb-2.5">
                <Loader2 className="h-4 w-4 animate-spin text-[hsl(20,100%,55%)]" />
                <span className="font-medium">{message || "Searching..."}</span>
              </div>
              {(() => {
                const steps = ["Analyzing", "Searching", "Enriching", "Scoring", "Willingness", "Complete"];
                const stepIdx = steps.findIndex((s) => step?.toLowerCase().startsWith(s.toLowerCase()));
                const activeIdx = stepIdx >= 0 ? stepIdx : 0;
                return (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {steps.map((s, i) => (
                        <div
                          key={s}
                          className="flex-1 h-1.5 rounded-full transition-all"
                          style={{
                            background: i < activeIdx ? "hsl(160, 60%, 45%)" : i === activeIdx ? "hsl(20, 100%, 55%)" : "var(--color-border)",
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>{steps[activeIdx]}</span>
                      <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>{Math.round((progress || 0) * 100)}%</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {!isSearching && candidates.length > 0 && activeSearchId && (
          <div className="mx-auto max-w-sm sm:max-w-md">
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Top candidates found:</p>
              <div className="space-y-2 mb-4">
                {candidates.slice(0, 3).map((c, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-white border border-gray-100 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.full_name || c.name || "Unknown"}</p>
                      <p className="text-xs text-gray-500 truncate">{c.title || c.current_title || "No title"}</p>
                    </div>
                    <div className="flex-shrink-0 ml-3">
                      <span className="inline-flex items-center rounded-full bg-[hsl(180,50%,23%)]/10 px-2 py-0.5 text-xs font-semibold text-[hsl(180,50%,23%)]">
                        {Math.round((c.match_score ?? c.total_score ?? 0) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <a
                href={`/results?id=${activeSearchId}`}
                className="flex items-center justify-center gap-2 rounded-lg bg-[hsl(20,100%,55%)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[hsl(20,100%,48%)] transition-colors"
              >
                View Session Results
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 p-4" style={{ borderTop: "1px solid var(--color-border)" }}>
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the candidate you're looking for..."
            disabled={isSearching || step === "thinking"}
            rows={1}
            className="min-h-[48px] flex-1 resize-none rounded-2xl px-4 py-3 text-sm outline-none"
            style={{ background: "var(--color-surface-secondary)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isSearching || step === "thinking"}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white transition-all disabled:opacity-50"
            style={{ background: "var(--color-brand-orange)" }}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {sessionsOpen && (
        <>
          <button
            type="button"
            aria-label="Close sessions"
            onClick={() => setSessionsOpen(false)}
            className="absolute inset-0 bg-black/30"
          />
          <aside
            className="absolute inset-y-0 right-0 z-10 flex w-full max-w-md flex-col border-l shadow-2xl"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--color-border)" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>All Sessions</p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Pick a session to reopen the conversation inside search.</p>
              </div>
              <button onClick={() => setSessionsOpen(false)} className="rounded-lg p-2" style={{ color: "var(--color-text-secondary)" }}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {sessionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--color-brand-orange)" }} />
                </div>
              ) : sessions.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center" style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>
                  <SearchIcon className="mx-auto mb-2 h-5 w-5" />
                  No saved sessions yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => {
                    const isActive = !!session.session_id && session.session_id === activeSessionId;
                    const isSelecting = selectedConversationId === session.id;
                    return (
                      <button
                        key={session.id}
                        onClick={() => void handleSelectConversation(session)}
                        disabled={isSelecting}
                        className="w-full cursor-pointer rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                        style={{
                          borderColor: isSelecting || isActive ? "var(--color-brand-orange)" : "var(--color-border)",
                          background: isSelecting
                            ? "color-mix(in srgb, var(--color-brand-orange) 14%, var(--color-surface-elevated))"
                            : isActive
                              ? "color-mix(in srgb, var(--color-brand-orange) 8%, var(--color-surface-elevated))"
                              : "var(--color-surface-elevated)",
                          transform: isSelecting ? "scale(0.99)" : "scale(1)",
                          opacity: isSelecting ? 0.92 : 1,
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                              {session.title || "Untitled session"}
                            </p>
                            <p className="mt-1 text-[11px] font-medium" style={{ color: "var(--color-text-muted)" }}>
                              {formatSessionTime(session.updated_at)}
                            </p>
                            <p className="mt-1 line-clamp-2 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                              {isSelecting ? "Opening this session..." : (session.last_message || "Open to continue this conversation.")}
                            </p>
                          </div>
                          {isSelecting ? (
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin" style={{ color: "var(--color-brand-orange)" }} />
                          ) : session.search_id ? (
                            <span className="rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide" style={{ background: "color-mix(in srgb, var(--color-brand-teal) 12%, transparent)", color: "var(--color-brand-teal)" }}>
                              Results
                            </span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
