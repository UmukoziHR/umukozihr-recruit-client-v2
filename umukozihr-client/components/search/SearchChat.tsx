"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, User, Bot, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
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
}

export function SearchChat({
  onSearch,
  isSearching,
  candidates,
  step,
  message,
}: SearchChatProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I can help you find candidates. Describe the role you're looking to fill -- for example: \"Senior React developer with 5+ years experience in Nairobi\" or \"Marketing manager with B2B SaaS experience.\"",
      timestamp: new Date(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
    if (!trimmed || isSearching) return;

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
    <div className="flex flex-col h-full rounded-xl border border-gray-200 bg-white">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3 max-w-[85%]",
              msg.role === "user" ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div
              className={cn(
                "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
                msg.role === "user"
                  ? "bg-[hsl(20,100%,55%)] text-white"
                  : "bg-[hsl(180,50%,23%)] text-white"
              )}
            >
              {msg.role === "user" ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </div>
            <div
              className={cn(
                "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-[hsl(20,100%,55%)] text-white rounded-br-md"
                  : "bg-gray-100 text-gray-800 rounded-bl-md"
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing / progress indicator */}
        {isSearching && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-[hsl(180,50%,23%)] text-white">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-[hsl(20,100%,55%)]" />
                <span>{message || "Searching..."}</span>
              </div>
            </div>
          </div>
        )}

        {/* Results preview */}
        {!isSearching && candidates.length > 0 && (
          <div className="mx-auto max-w-md">
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
                        {c.name || "Unknown"}
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
      <div className="flex-shrink-0 border-t border-gray-200 p-4">
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the candidate you're looking for..."
            disabled={isSearching}
            rows={1}
            className={cn(
              "flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm",
              "placeholder:text-gray-400 focus:border-[hsl(20,100%,55%)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(20,100%,55%)]/20",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "min-h-[44px] max-h-[120px]"
            )}
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isSearching}
            className={cn(
              "flex-shrink-0 rounded-xl p-3 transition-all",
              input.trim() && !isSearching
                ? "bg-[hsl(20,100%,55%)] text-white hover:bg-[hsl(20,100%,48%)] shadow-sm"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
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
