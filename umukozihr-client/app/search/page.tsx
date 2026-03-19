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
  Coins,
  Info,
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
    startSearch, step, progress, message, candidates, error,
    isSearching, searchId, reset,
  } = useSSESearch();

  const creditCost = deepResearch ? 3 : 1;
  const searchComplete = step === "complete" && candidates.length > 0;

  // No auto-redirect - let the user click "View Results" naturally in chat

  return (
    <AppShell flush>
      <div className="flex h-full">
          {/* LEFT: Chat (75%) */}
          <main className="min-h-0 overflow-hidden" style={{ flex: "3" }}>
            {mode === "chat" ? (
              <SearchChat
                onSearch={(prompt, history) => startSearch(prompt, deepResearch, history)}
                isSearching={isSearching}
                candidates={candidates}
                step={step}
                message={message}
                searchId={searchId}
              />
            ) : (
              <div className="h-full overflow-y-auto px-6 py-6 max-w-3xl">
                <ManualForm
                  onSearch={(data: any) => startSearch(data, deepResearch)}
                  isSearching={isSearching}
                  deepResearch={deepResearch}
                />
              </div>
            )}
          </main>

          {/* RIGHT: Sidebar (25%) */}
          <aside className="shrink-0 hidden lg:flex flex-col gap-3 p-4 overflow-y-auto" style={{ width: "280px", borderLeft: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
            {/* Mode toggle */}
            <div className="inline-flex rounded-full p-0.5 self-stretch" style={{ background: "var(--color-surface-secondary)" }}>
              <button onClick={() => setMode("chat")} className="flex-1 flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all" style={{ background: mode === "chat" ? "var(--color-surface-elevated)" : "transparent", color: mode === "chat" ? "var(--color-text)" : "var(--color-text-muted)", boxShadow: mode === "chat" ? "var(--shadow-sm)" : "none" }}>
                <MessageSquare className="h-3 w-3" /> Chat
              </button>
              <button onClick={() => setMode("manual")} className="flex-1 flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all" style={{ background: mode === "manual" ? "var(--color-surface-elevated)" : "transparent", color: mode === "manual" ? "var(--color-text)" : "var(--color-text-muted)", boxShadow: mode === "manual" ? "var(--shadow-sm)" : "none" }}>
                <SlidersHorizontal className="h-3 w-3" /> Manual
              </button>
            </div>

            {/* Credits */}
            <div className="rounded-xl p-4" style={{ background: "var(--color-surface-elevated)", border: "1px solid var(--color-border)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Coins className="h-4 w-4" style={{ color: "var(--color-brand-orange)" }} />
                <span className="text-xs font-semibold" style={{ color: "var(--color-text)" }}>Credits</span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold" style={{ color: "var(--color-brand-teal)" }}>{balance ?? "--"}</span>
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>remaining</span>
              </div>
              <div className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                <Zap className="h-3 w-3" style={{ color: "var(--color-brand-orange)" }} />
                Search costs <strong className="mx-0.5">{creditCost}</strong> credit{creditCost > 1 ? "s" : ""}
              </div>
            </div>

            {/* Deep Research */}
            <button
              onClick={() => setDeepResearch(!deepResearch)}
              className="rounded-xl p-4 text-left transition-all"
              style={{
                border: deepResearch ? "1.5px solid var(--color-brand-orange)" : "1px solid var(--color-border)",
                background: deepResearch ? "color-mix(in srgb, var(--color-brand-orange) 6%, var(--color-surface-elevated))" : "var(--color-surface-elevated)",
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" style={{ color: deepResearch ? "var(--color-brand-orange)" : "var(--color-text-muted)" }} />
                  <span className="text-xs font-semibold" style={{ color: "var(--color-text)" }}>Deep Research</span>
                </div>
                <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: deepResearch ? "var(--color-brand-orange)" : "var(--color-surface-secondary)", color: deepResearch ? "#fff" : "var(--color-text-muted)" }}>3x</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                {deepResearch ? "Enabled: thorough multi-step search" : "Deeper search across more sources"}
              </p>
            </button>

            {/* Workflow Progress */}
            {(isSearching || step === "complete" || step === "error") && (
              <div className="rounded-xl p-4" style={{ background: "var(--color-surface-elevated)", border: "1px solid var(--color-border)" }}>
                <WorkflowProgress currentStep={step} progress={progress} message={message} />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-xl p-3 text-xs" style={{ background: "color-mix(in srgb, #ef4444 8%, var(--color-surface-elevated))", border: "1px solid color-mix(in srgb, #ef4444 25%, transparent)", color: "#dc2626" }}>
                <div className="flex items-center gap-2 mb-1"><AlertCircle className="h-3.5 w-3.5" /><span className="font-semibold">Error</span></div>
                <p>{error}</p>
                <button onClick={reset} className="mt-2 text-xs font-medium underline">Dismiss</button>
              </div>
            )}

            {/* Search complete */}
            {searchComplete && searchId && (
              <div className="rounded-xl p-4" style={{ background: "color-mix(in srgb, var(--color-brand-teal) 8%, var(--color-surface-elevated))", border: "1px solid var(--color-border)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4" style={{ color: "var(--color-brand-teal)" }} />
                  <span className="text-xs font-semibold" style={{ color: "var(--color-text)" }}>Search Complete</span>
                </div>
                <p className="text-xs mb-3" style={{ color: "var(--color-text-secondary)" }}>Found {candidates.length} candidate{candidates.length !== 1 ? "s" : ""}</p>
                <Link href={`/results?id=${searchId}`} className="flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white" style={{ background: "var(--color-brand-orange)" }}>
                  View Results <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <button onClick={() => { reset(); refresh(); }} className="w-full mt-2 rounded-lg px-4 py-2 text-xs font-medium" style={{ border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}>New Search</button>
              </div>
            )}

            {/* Company Tip */}
            {!hasCompanyProfile && !tipDismissed && (
              <div className="rounded-xl p-3" style={{ background: "color-mix(in srgb, var(--color-brand-orange) 6%, var(--color-surface-elevated))", border: "1px solid var(--color-border)" }}>
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--color-brand-orange)" }} />
                  <div className="flex-1">
                    <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                      <strong style={{ color: "var(--color-text)" }}>Set up your company profile</strong> for accurate willingness scores.
                    </p>
                    <Link href="/settings?tab=company" className="text-xs font-semibold underline mt-1 inline-block" style={{ color: "var(--color-brand-orange)" }}>Set up now</Link>
                  </div>
                  <button onClick={() => setTipDismissed(true)} className="shrink-0 p-0.5 rounded hover:opacity-70" style={{ color: "var(--color-text-muted)" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>
            )}
          </aside>
      </div>
    </AppShell>
  );
}
