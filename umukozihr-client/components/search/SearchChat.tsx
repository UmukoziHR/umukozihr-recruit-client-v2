"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, User, ExternalLink } from "lucide-react";
import Markdown from "react-markdown";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { CandidateResult } from "@/lib/types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface SearchChatProps {
  onSearch: (prompt: string, history?: Array<{role: string; content: string}>) => void;
  isSearching: boolean;
  candidates: CandidateResult[];
  step: string;
  message: string;
  progress: number;
  searchId?: string | null;
}

const AMBERLYN_AVATAR = "/amberlyn.png";

const WELCOME_MSG: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi, I'm Amberlyn, your recruiting assistant! Describe the role you're looking to fill -- for example: \"Senior React developer with 5+ years experience in Nairobi\" or \"Marketing manager with B2B SaaS experience.\"",
  timestamp: new Date(),
};

export function SearchChat({
  onSearch,
  isSearching,
  candidates,
  step,
  message,
  progress,
  searchId,
}: SearchChatProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MSG]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load conversation history from backend on mount/resume
  useEffect(() => {
    if (historyLoaded) return;
    const sid = searchId || (typeof window !== "undefined" ? localStorage.getItem("last_search_id") : null);
    if (!sid) { setHistoryLoaded(true); return; }
    (async () => {
      try {
        const chatSessionId = typeof window !== "undefined" ? localStorage.getItem("chat_session_id") : null;
        const data = await api.getConversation(sid, chatSessionId);
        const hist = (data.messages || []);
        if (hist.length > 0) {
          const restored: ChatMessage[] = [WELCOME_MSG];
          hist.forEach((m, i) => {
            restored.push({
              id: `history-${i}`,
              role: m.role as "user" | "assistant",
              content: m.content,
              timestamp: new Date(),
            });
          });
          setMessages(restored);
        }
      } catch { /* no history yet, keep welcome */ }
      setHistoryLoaded(true);
    })();
  }, [searchId, historyLoaded]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, message]);

  // Show assistant messages for results, clarifications, and errors
  const lastHandledRef = useRef("");
  useEffect(() => {
    if (isSearching) return;
    const key = `${step}:${message}:${candidates.length}`;
    if (key === lastHandledRef.current) return;
    lastHandledRef.current = key;

    if (candidates.length > 0 && step === "complete") {
      setMessages((prev) => [...prev, { id: `result-${Date.now()}`, role: "assistant" as const, content: `I found ${candidates.length} candidate${candidates.length !== 1 ? "s" : ""} matching your criteria. Click "View Results" above to see them.`, timestamp: new Date() }]);
    } else if ((step === "clarification" || step === "clarify") && message) {
      setMessages((prev) => [...prev, { id: `clarify-${Date.now()}`, role: "assistant" as const, content: message, timestamp: new Date() }]);
    } else if (step === "error" && message) {
      setMessages((prev) => [...prev, { id: `error-${Date.now()}`, role: "assistant" as const, content: `Something went wrong: ${message}`, timestamp: new Date() }]);
    }
  }, [isSearching, candidates, step, message]);

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
    // Call onSearch AFTER state update, outside the setter
    setTimeout(() => onSearch(trimmed), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--color-surface-elevated)", borderRight: "1px solid var(--color-border)" }}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3 max-w-[85%]",
              msg.role === "user" ? "ml-auto flex-row-reverse" : ""
            )}
          >
            {msg.role === "user" ? (
              <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-[hsl(20,100%,55%)] text-white">
                <User className="h-4 w-4" />
              </div>
            ) : (
              <img src={AMBERLYN_AVATAR} alt="Amberlyn" className="flex-shrink-0 h-8 w-8 rounded-full object-cover" />
            )}
            <div
              className={cn(
                "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user" ? "rounded-br-md" : "rounded-bl-md"
              )}
              style={msg.role === "user"
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

        {/* Typing indicator while Amberlyn thinks */}
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

        {/* Search progress indicator (only when actual search is running) */}
        {isSearching && (
          <div className="flex gap-3">
            <img src={AMBERLYN_AVATAR} alt="Amberlyn" className="shrink-0 h-8 w-8 rounded-full object-cover" />
            <div className="rounded-2xl rounded-bl-md px-4 py-3 text-sm w-full max-w-[280px] sm:max-w-[340px]" style={{ background: "var(--color-surface-secondary)", color: "var(--color-text)", border: "1px solid var(--color-border)" }}>
              <div className="flex items-center gap-2 mb-2.5">
                <Loader2 className="h-4 w-4 animate-spin text-[hsl(20,100%,55%)]" />
                <span className="font-medium">{message || "Searching..."}</span>
              </div>
              {/* Compact inline progress steps */}
              {(() => {
                const steps = ["Analyzing", "Searching", "Enriching", "Scoring", "Willingness", "Complete"];
                const stepIdx = steps.findIndex(s => step?.toLowerCase().startsWith(s.toLowerCase()));
                const activeIdx = stepIdx >= 0 ? stepIdx : 0;
                return (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {steps.map((s, i) => (
                        <div key={s} className="flex-1 h-1.5 rounded-full transition-all" style={{
                          background: i < activeIdx ? "hsl(160, 60%, 45%)" : i === activeIdx ? "hsl(20, 100%, 55%)" : "var(--color-border)"
                        }} />
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

        {/* Results preview */}
        {!isSearching && candidates.length > 0 && (
          <div className="mx-auto max-w-sm sm:max-w-md">
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Top candidates found:
              </p>
              <div className="space-y-2 mb-4">
                {candidates.slice(0, 3).map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-white border border-gray-100 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {c.full_name || c.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {c.title || c.current_title || "No title"}
                      </p>
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
                href="/results"
                className="flex items-center justify-center gap-2 rounded-lg bg-[hsl(20,100%,55%)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[hsl(20,100%,48%)] transition-colors"
              >
                View All Results
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
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
            className={cn(
              "flex-1 resize-none rounded-xl px-4 py-3 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-[hsl(20,100%,55%)]/20",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "min-h-[44px] max-h-[120px]"
            )}
            style={{ fieldSizing: "content", background: "var(--color-surface-secondary)", border: "1px solid var(--color-border)", color: "var(--color-text)" } as React.CSSProperties}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isSearching || step === "thinking"}
            className="shrink-0 rounded-xl p-3 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: input.trim() && !isSearching && step !== "thinking" ? "var(--color-brand-orange)" : "var(--color-surface-secondary)", color: input.trim() && !isSearching && step !== "thinking" ? "#fff" : "var(--color-text-muted)" }}
          >
            {isSearching ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
