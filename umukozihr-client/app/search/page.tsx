"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { useSSESearch } from "@/hooks/useSSESearch";
import { SearchChat } from "@/components/search/SearchChat";
import { ManualForm } from "@/components/search/ManualForm";
import { WorkflowProgress } from "@/components/search/WorkflowProgress";
import {
  MessageSquare,
  SlidersHorizontal,
  Sparkles,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type SearchMode = "chat" | "manual";

export default function SearchPage() {
  const [mode, setMode] = useState<SearchMode>("chat");
  const [deepResearch, setDeepResearch] = useState(false);
  const [tipDismissed, setTipDismissed] = useState(false);
  const { user } = useAuth();
  const { balance, refresh } = useCredits();
  const hasCompanyProfile = !!(user?.company_profile && (user.company_profile as any)?.company_name);
  const {
    startSearch,
    step,
    progress,
    message,
    candidates,
    error,
    isSearching,
    searchId,
    reset,
  } = useSSESearch();

  const creditCost = deepResearch ? 3 : 1;
  const searchComplete = step === "complete" && candidates.length > 0;

  // Auto-redirect to results after search completes (3 second delay)
  useEffect(() => {
    if (searchComplete && searchId) {
      const timer = setTimeout(() => {
        window.location.href = `/results?search=${searchId}`;
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [searchComplete, searchId]);

  return (
    <AppShell>
      <div className="flex flex-col" style={{ height: "calc(100vh - 60px)" }}>
        {/* ── Header (compact single line) ── */}
        <header
          className="shrink-0 px-6 py-2"
          style={{
            borderBottom: "1px solid var(--color-border)",
            background: "var(--color-surface)",
          }}
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Left: Title */}
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-bold tracking-tight" style={{ color: "var(--color-text)" }}>Search</h1>
              {/* Mode toggle inline */}
              <div className="inline-flex rounded-full p-0.5" style={{ background: "var(--color-surface-secondary)" }}>
                <button onClick={() => setMode("chat")} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all" style={{ background: mode === "chat" ? "var(--color-surface-elevated)" : "transparent", color: mode === "chat" ? "var(--color-text)" : "var(--color-text-muted)", boxShadow: mode === "chat" ? "var(--shadow-sm)" : "none" }}>
                  <MessageSquare className="h-3.5 w-3.5" /> Chat
                </button>
                <button onClick={() => setMode("manual")} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all" style={{ background: mode === "manual" ? "var(--color-surface-elevated)" : "transparent", color: mode === "manual" ? "var(--color-text)" : "var(--color-text-muted)", boxShadow: mode === "manual" ? "var(--shadow-sm)" : "none" }}>
                  <SlidersHorizontal className="h-3.5 w-3.5" /> Manual
                </button>
              </div>
            </div>

            {/* Right: Credits + Deep Research */}
            <div className="flex items-center gap-3">
              {/* Credit cost badge */}
              <div
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm"
                style={{
                  background: "var(--color-surface-secondary)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <Zap
                  className="h-4 w-4"
                  style={{ color: "var(--color-brand-orange)" }}
                />
                <span style={{ color: "var(--color-text-secondary)" }}>
                  Cost:{" "}
                  <strong style={{ color: "var(--color-text)" }}>
                    {creditCost} credit{creditCost > 1 ? "s" : ""}
                  </strong>
                </span>
                <span
                  className="mx-1"
                  style={{ color: "var(--color-border)" }}
                >
                  |
                </span>
                <span style={{ color: "var(--color-text-secondary)" }}>
                  Balance:{" "}
                  <strong style={{ color: "var(--color-brand-teal)" }}>
                    {balance ?? "--"}
                  </strong>
                </span>
              </div>

              {/* Deep Research toggle */}
              <button
                onClick={() => setDeepResearch(!deepResearch)}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all"
                style={{
                  border: deepResearch
                    ? "1.5px solid var(--color-brand-orange)"
                    : "1px solid var(--color-border)",
                  background: deepResearch
                    ? "color-mix(in srgb, var(--color-brand-orange) 8%, transparent)"
                    : "var(--color-surface)",
                  color: deepResearch
                    ? "var(--color-brand-orange)"
                    : "var(--color-text-secondary)",
                }}
              >
                <Sparkles
                  className="h-4 w-4"
                  style={{
                    color: deepResearch
                      ? "var(--color-brand-orange)"
                      : "var(--color-text-muted)",
                  }}
                />
                Deep Research
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{
                    background: deepResearch
                      ? "var(--color-brand-orange)"
                      : "var(--color-surface-secondary)",
                    color: deepResearch
                      ? "#fff"
                      : "var(--color-text-muted)",
                  }}
                >
                  3x
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* ── Company Profile Tip ── */}
        {!hasCompanyProfile && !tipDismissed && (
          <div className="shrink-0 px-6 py-3" style={{ background: "linear-gradient(90deg, rgba(255,107,53,0.06), rgba(30,90,90,0.06))", borderBottom: "1px solid var(--color-border)" }}>
            <div className="max-w-6xl mx-auto flex items-center gap-3">
              <div className="flex items-center justify-center h-8 w-8 rounded-full shrink-0" style={{ background: "var(--color-brand-orange)", color: "#fff" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
              </div>
              <p className="text-sm flex-1" style={{ color: "var(--color-text-secondary)" }}>
                <strong style={{ color: "var(--color-text)" }}>Complete your company profile</strong> to get accurate willingness-to-join predictions. The AI uses your company details to assess if candidates would actually accept your offer.{" "}
                <Link href="/settings?tab=company" className="font-semibold underline" style={{ color: "var(--color-brand-orange)" }}>Set up now</Link>
              </p>
              <button onClick={() => setTipDismissed(true)} className="shrink-0 p-1 rounded hover:opacity-70" style={{ color: "var(--color-text-muted)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* Search complete: results link bar */}
        {searchComplete && searchId && (
          <div className="shrink-0 px-6 py-2 flex justify-center" style={{ borderBottom: "1px solid var(--color-border)", background: "color-mix(in srgb, var(--color-brand-teal) 8%, var(--color-surface))" }}>
            <Link href={`/results?id=${searchId}`} className="flex items-center gap-2 rounded-full px-5 py-1.5 text-sm font-semibold transition-all" style={{ background: "var(--color-brand-teal)", color: "#fff" }}>
              <CheckCircle2 className="h-4 w-4" /> View {candidates.length} Results <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* ── Workflow Progress (persistent once search starts) ── */}
        {(isSearching || step === "complete" || step === "error") && (
          <div
            className="shrink-0 px-6 py-4"
            style={{
              background:
                "linear-gradient(to right, color-mix(in srgb, var(--color-brand-teal) 6%, transparent), color-mix(in srgb, var(--color-brand-orange) 6%, transparent))",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <div className="max-w-6xl mx-auto">
              <WorkflowProgress
                currentStep={step}
                progress={progress}
                message={message}
              />
            </div>
          </div>
        )}

        {/* ── Error Banner ── */}
        {error && (
          <div
            className="shrink-0 px-6 py-3"
            style={{
              background: "color-mix(in srgb, #ef4444 8%, transparent)",
              borderBottom: "1px solid color-mix(in srgb, #ef4444 25%, transparent)",
            }}
          >
            <div className="max-w-6xl mx-auto flex items-center gap-3 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" style={{ color: "#ef4444" }} />
              <span style={{ color: "#dc2626" }}>{error}</span>
              <button
                onClick={reset}
                className="ml-auto text-xs font-medium underline"
                style={{ color: "#dc2626" }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* ── Search Complete Summary (inline banner) ── */}
        {searchComplete && !isSearching && (
          <div
            className="shrink-0 px-6 py-4"
            style={{
              background:
                "color-mix(in srgb, var(--color-brand-teal) 6%, transparent)",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center h-8 w-8 rounded-full"
                  style={{
                    background: "var(--color-brand-teal)",
                  }}
                >
                  <CheckCircle2 className="h-4 w-4" style={{ color: "#fff" }} />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-text)" }}
                  >
                    Search complete
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Found {candidates.length} qualified candidate
                    {candidates.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    reset();
                    refresh();
                  }}
                  className="rounded-full px-4 py-2 text-sm font-medium transition-all"
                  style={{
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  New Search
                </button>
                {searchId && (
                  <Link
                    href={`/results/${searchId}`}
                    className="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all"
                    style={{
                      background: "var(--color-brand-orange)",
                      color: "#fff",
                    }}
                  >
                    View Results
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Main Content Area ── */}
        <main className="flex-1 min-h-0 overflow-hidden">
          {mode === "chat" ? (
            <div className="h-full w-full max-w-4xl mx-auto">
              <SearchChat
                onSearch={(prompt, history) => startSearch(prompt, deepResearch, history)}
                isSearching={isSearching}
                candidates={candidates}
                step={step}
                message={message}
                searchId={searchId}
              />
            </div>
          ) : (
            <div className="h-full max-w-6xl mx-auto overflow-y-auto px-6 py-6">
              <ManualForm
                onSearch={(data: any) => startSearch(data, deepResearch)}
                isSearching={isSearching}
                deepResearch={deepResearch}
              />
            </div>
          )}
        </main>
      </div>
    </AppShell>
  );
}
