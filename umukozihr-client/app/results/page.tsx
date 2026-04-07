"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { CandidateCard } from "@/components/results/CandidateCard";
import { CandidateListItem } from "@/components/results/CandidateListItem";
import ResultsChat from "@/components/results/ResultsChat";
import {
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Clock,
  Users,
  Zap,
  Loader2,
  MessageCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchResponse, CandidateResult } from "@/lib/types";

type ViewMode = "grid" | "list";
type SortField = "match_score" | "willingness_score" | "total_score";

export default function ResultsPageWrapper() { return <AppShell><Suspense><ResultsPage /></Suspense></AppShell>; }
function ResultsPage() {
  const searchParams = useSearchParams();
  const searchId = searchParams.get("id") || searchParams.get("search");

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortField>("total_score");
  const [sortAsc, setSortAsc] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [hideUnlikely, setHideUnlikely] = useState(true);
  const [searchData, setSearchData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeSearchId, setActiveSearchId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        // Priority: URL param > localStorage > latest from API
        let sid = searchId;
        if (!sid && typeof window !== "undefined") {
          sid = localStorage.getItem("last_search_id") || "";
        }
        if (sid) {
          const data = await api.getSearch(sid);
          setSearchData(data);
          setActiveSearchId(sid);
        } else {
          const searches = await api.listSearches();
          if (searches.length > 0) {
            const latest = await api.getSearch(searches[0].id);
            setSearchData(latest);
            setActiveSearchId(searches[0].id);
          }
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load results");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [searchId]);

  const candidates = searchData?.candidates ?? [];

  const filtered = useMemo(() => {
    let result = [...candidates];

    // "Recommended" = 70%+ match score. "Show All" = no filter.
    if (hideUnlikely) {
      result = result.filter((c) => (c.match_score ?? 0) >= 0.70);
    }

    // Text filter
    if (filterText.trim()) {
      const q = filterText.toLowerCase();
      result = result.filter(
        (c) =>
          (c.full_name ?? c.name ?? "").toLowerCase().includes(q) ||
          (c.current_title ?? c.title ?? "").toLowerCase().includes(q) ||
          (c.current_company ?? "").toLowerCase().includes(q) ||
          (c.location ?? "").toLowerCase().includes(q) ||
          (c.skills ?? []).some((s: string) => s.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortBy] as number ?? 0;
      const bVal = (b as Record<string, unknown>)[sortBy] as number ?? 0;
      return sortAsc ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [candidates, filterText, sortBy, sortAsc, hideUnlikely]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(20,100%,55%)]" />
          <p className="text-sm text-gray-500">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700 max-w-md text-center">
          {error}
        </div>
      </div>
    );
  }

  if (!searchData || candidates.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            No results yet
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Run a search to find candidates.
          </p>
          <a
            href="/search"
            className="inline-flex items-center gap-2 rounded-lg bg-[hsl(20,100%,55%)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[hsl(20,100%,48%)] transition-colors"
          >
            <Search className="h-4 w-4" />
            New Search
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search summary */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Search Results
        </h1>
        <div className="flex flex-wrap gap-3">
          <SummaryBadge
            icon={Users}
            label="Candidates"
            value={candidates.length.toString()}
          />
          {searchData.execution_time_ms && (
            <SummaryBadge
              icon={Clock}
              label="Time"
              value={`${(searchData.execution_time_ms / 1000).toFixed(1)}s`}
            />
          )}
          {searchData.credits_used != null && (
            <SummaryBadge
              icon={Zap}
              label="Credits"
              value={searchData.credits_used.toString()}
            />
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        {/* Filter */}
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter by name, skills, location..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-[hsl(20,100%,55%)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(20,100%,55%)]/20"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Recommended / Show All segmented control */}
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 text-xs font-medium">
            <button
              onClick={() => setHideUnlikely(true)}
              className={cn(
                "rounded-md px-3 py-1.5 transition-all",
                hideUnlikely
                  ? "bg-white text-[hsl(180,50%,23%)] shadow-sm border border-gray-200"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              ⭐ Recommended ({candidates.filter(c => (c.match_score ?? 0) >= 0.70).length})
            </button>
            <button
              onClick={() => setHideUnlikely(false)}
              className={cn(
                "rounded-md px-3 py-1.5 transition-all",
                !hideUnlikely
                  ? "bg-white text-gray-800 shadow-sm border border-gray-200"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              Show All ({candidates.length})
            </button>
          </div>
          {/* Sort */}
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="h-4 w-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortField)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[hsl(20,100%,55%)] focus:outline-none focus:ring-2 focus:ring-[hsl(20,100%,55%)]/20"
            >
              <option value="total_score">Total Score</option>
              <option value="match_score">Match Score</option>
              <option value="willingness_score">Willingness</option>
            </select>
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className={cn(
                "rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 transition-colors",
                sortAsc && "text-[hsl(20,100%,55%)]"
              )}
              title={sortAsc ? "Sort ascending" : "Sort descending"}
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>

          {/* View toggle */}
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "rounded-md p-2 transition-all",
                viewMode === "grid"
                  ? "bg-[hsl(20,100%,55%)] text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-md p-2 transition-all",
                viewMode === "list"
                  ? "bg-[hsl(20,100%,55%)] text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      {filterText && (
        <p className="text-sm text-gray-500 mb-4">
          Showing {filtered.length} of {candidates.length} candidates
        </p>
      )}

      {/* Results */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((candidate, i) => (
            <CandidateCard key={candidate.id ?? i} candidate={candidate} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((candidate, i) => (
            <CandidateListItem key={candidate.id ?? i} candidate={candidate} />
          ))}
        </div>
      )}

      {/* Empty filter state */}
      {filtered.length === 0 && filterText && (
        <div className="text-center py-12">
          <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            No candidates match &quot;{filterText}&quot;
          </p>
        </div>
      )}

      {/* Chat toggle FAB */}
      {activeSearchId && !chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white shadow-lg hover:shadow-xl transition-all"
          style={{ background: "var(--color-brand-teal)" }}
        >
          <MessageCircle className="h-5 w-5" />
          Chat with Amberlyn
        </button>
      )}

      {/* Chat slide-over panel */}
      {chatOpen && activeSearchId && (
        <div className="fixed bottom-0 right-0 z-50 w-full sm:w-[420px] h-[70vh] sm:h-[600px] sm:bottom-4 sm:right-4 rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
          <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ background: "var(--color-brand-teal)", color: "#fff" }}>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold text-sm">Chat with Amberlyn</span>
            </div>
            <button onClick={() => setChatOpen(false)} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <ResultsChat searchId={activeSearchId} />
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryBadge({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
      <Icon className="h-4 w-4 text-[hsl(180,50%,23%)]" />
      <span className="text-gray-500">{label}:</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}
