"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";
import type { SearchResponse } from "@/lib/types";
import { Clock, Users, Zap, Search, ChevronRight, MessageCircle, Loader2 } from "lucide-react";

export default function HistoryPageWrapper() { return <AppShell><HistoryPage /></AppShell>; }

function HistoryPage() {
  const [searches, setSearches] = useState<SearchResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await api.listSearches(page, 20);
        setSearches(data);
      } catch { /* empty */ }
      setLoading(false);
    })();
  }, [page]);

  const statusColor = (s: string) => {
    if (s === "completed") return { bg: "rgba(16,185,129,0.1)", text: "#059669" };
    if (s === "running") return { bg: "rgba(245,158,11,0.1)", text: "#d97706" };
    return { bg: "rgba(239,68,68,0.1)", text: "#dc2626" };
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>Search History</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>All your past searches and conversations</p>
        </div>
        <Link href="/search" className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors" style={{ background: "var(--color-brand-orange)" }}>
          <Search className="h-4 w-4" /> New Search
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--color-brand-orange)" }} />
        </div>
      ) : searches.length === 0 ? (
        <div className="text-center py-20">
          <Clock className="h-12 w-12 mx-auto mb-3" style={{ color: "var(--color-text-muted)" }} />
          <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--color-text)" }}>No searches yet</h2>
          <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>Start your first search to see it here.</p>
          <Link href="/search" className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white" style={{ background: "var(--color-brand-orange)" }}>
            <Search className="h-4 w-4" /> Start Searching
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {searches.map((s) => {
            const sc = statusColor(s.status);
            const date = s.created_at ? new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
            return (
              <div key={s.id} className="rounded-xl p-4 transition-all hover:shadow-md" style={{ background: "var(--color-surface-elevated)", border: "1px solid var(--color-border)" }}>
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.text }}>
                        {s.status}
                      </span>
                      <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{date}</span>
                    </div>
                    <p className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>
                      {s.prompt || "Manual search"}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      {s.total_approved > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                          <Users className="h-3.5 w-3.5" /> {s.total_approved} candidates
                        </span>
                      )}
                      {s.execution_time_ms && (
                        <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                          <Clock className="h-3.5 w-3.5" /> {(s.execution_time_ms / 1000).toFixed(0)}s
                        </span>
                      )}
                      {s.credits_used > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                          <Zap className="h-3.5 w-3.5" /> {s.credits_used} credit{s.credits_used > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {s.status === "completed" && s.total_approved > 0 && (
                      <Link href={`/results?id=${s.id}`} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors" style={{ background: "var(--color-surface-secondary)", color: "var(--color-text)", border: "1px solid var(--color-border)" }}>
                        View Results <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                    <Link href={`/results?id=${s.id}`} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-white transition-colors" style={{ background: "var(--color-brand-teal)" }}>
                      <MessageCircle className="h-3.5 w-3.5" /> Chat
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-40 transition-colors" style={{ border: "1px solid var(--color-border)", color: "var(--color-text)" }}>Previous</button>
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Page {page}</span>
            <button onClick={() => setPage(page + 1)} disabled={searches.length < 20} className="rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-40 transition-colors" style={{ border: "1px solid var(--color-border)", color: "var(--color-text)" }}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
