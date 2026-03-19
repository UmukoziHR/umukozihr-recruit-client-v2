"use client";
import { useState, useEffect, useRef, useCallback } from "react";

import { api } from "@/lib/api";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

export default function ResultsChat({ searchId }: { searchId: string }) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load conversation history on mount
  useEffect(() => {
    if (!searchId || historyLoaded) return;
    (async () => {
      try {
        const data = await api.getConversation(searchId);
        const hist = (data.messages || []).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));
        // Add intro message if no results chat yet
        const hasResultsChat = hist.some((m) => m.content.includes("candidates"));
        if (!hasResultsChat) {
          hist.push({
            role: "assistant",
            content: "Hi, it's Amberlyn! Your search results are ready. Ask me anything about the candidates - why someone was ranked higher, their strengths, how they compare, or whether they'd be a good fit for your role.",
          });
        }
        setMessages(hist);
        setHistoryLoaded(true);
      } catch {
        setMessages([{
          role: "assistant",
          content: "Hi, I'm Amberlyn! I'm ready to discuss these search results with you. Ask me anything about the candidates!",
        }]);
        setHistoryLoaded(true);
      }
    })();
  }, [searchId, historyLoaded]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await api.chatOnResults(searchId, text);
      setMessages((prev) => [...prev, { role: "assistant", content: res.message }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't process that. Please try again." }]);
    }
    setLoading(false);
  }, [input, loading, searchId]);

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--color-surface)" }}>
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <img src="/amberlyn.png" alt="Amberlyn" className="shrink-0 w-8 h-8 rounded-full object-cover mr-2 mt-1" />
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "rounded-br-md" : "rounded-bl-md"}`}
              style={{
                background: m.role === "user" ? "var(--color-brand-orange)" : "var(--color-surface-elevated)",
                color: m.role === "user" ? "#fff" : "var(--color-text)",
                border: m.role === "assistant" ? "1px solid var(--color-border)" : "none",
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <img src="/amberlyn.png" alt="Amberlyn" className="shrink-0 w-8 h-8 rounded-full object-cover mr-2" />
            <div className="rounded-2xl rounded-bl-md px-4 py-3" style={{ background: "var(--color-surface-elevated)", border: "1px solid var(--color-border)" }}>
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--color-brand-orange)", animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--color-brand-orange)", animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--color-brand-orange)", animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 p-3" style={{ borderTop: "1px solid var(--color-border)" }}>
        <div className="flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask about rankings, candidates, willingness..."
            rows={1}
            className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{ background: "var(--color-surface-secondary)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
            style={{ background: "var(--color-brand-orange)", color: "#fff" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
