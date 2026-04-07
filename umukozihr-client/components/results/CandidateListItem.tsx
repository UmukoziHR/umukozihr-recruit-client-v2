"use client";

import Link from "next/link";
import {
  MapPin,
  Briefcase,
  Building2,
  Eye,
  Sparkles,
} from "lucide-react";
import { cn, formatScore } from "@/lib/utils";
import type { CandidateResult } from "@/lib/types";

interface CandidateListItemProps {
  candidate: CandidateResult;
}

function getWillingnessColor(c: CandidateResult) {
  const l = c.willingness_likelihood || "";
  if (l.includes("likely") && !l.includes("unlikely")) return { bg: "bg-green-100", text: "text-green-700", label: "Likely" };
  if (l.includes("possible")) return { bg: "bg-yellow-100", text: "text-yellow-700", label: "Possible" };
  if (l.includes("unlikely")) return { bg: "bg-red-100", text: "text-red-700", label: "Unlikely" };
  const s = c.willingness_score;
  if (s == null) return { bg: "bg-gray-100", text: "text-gray-500", label: "Unknown" };
  if (s >= 14) return { bg: "bg-green-100", text: "text-green-700", label: "Likely" };
  if (s >= 8) return { bg: "bg-yellow-100", text: "text-yellow-700", label: "Possible" };
  return { bg: "bg-red-100", text: "text-red-700", label: "Unlikely" };
}

export function CandidateListItem({ candidate }: CandidateListItemProps) {
  const c = candidate;
  const matchPct = Math.round((c.match_score ?? c.score ?? 0) * 100);
  const willingness = getWillingnessColor(c);
  const willingnessPct = Math.round(((c.willingness_score ?? 0) / 20) * 100);
  // total_score is already 0-100 from the API (match*60 + willingness*40)
  const totalPct = Math.round(c.total_score ?? 0);
  const skills = (c.skills ?? []).slice(0, 4);
  const isOpenToWork = c.is_open_to_work ?? false;

  return (
    <div className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all">
      {/* Score */}
      <div className="flex-shrink-0 text-center">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold",
            matchPct >= 70
              ? "bg-green-100 text-green-700"
              : matchPct >= 50
              ? "bg-orange-100 text-[hsl(20,100%,45%)]"
              : "bg-yellow-100 text-yellow-700"
          )}
        >
          {matchPct}%
        </div>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {c.full_name || c.name || "Unknown Candidate"}
          </h3>
          {isOpenToWork && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white flex-shrink-0">
              <Sparkles className="h-2.5 w-2.5" />
              Open
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-500">
          {(c.title || c.current_title) && (
            <span className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {c.title || c.current_title}
            </span>
          )}
          {(c.company || c.current_company) && (
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {c.company || c.current_company}
            </span>
          )}
          {c.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {c.location}
            </span>
          )}
        </div>
      </div>

      {/* Skills */}
      <div className="hidden md:flex flex-wrap gap-1.5 max-w-[200px] flex-shrink-0">
        {skills.map((skill: string) => (
          <span
            key={skill}
            className="rounded-full bg-[hsl(180,50%,23%)]/8 px-2 py-0.5 text-[10px] font-medium text-[hsl(180,50%,23%)]"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Scores */}
      <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
        <div className="text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">
            Willingness
          </p>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold mt-0.5",
              willingness.bg,
              willingness.text
            )}
          >
            {willingnessPct}%
          </span>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">
            Total
          </p>
          <p className="text-sm font-bold text-gray-900 mt-0.5">{totalPct}%</p>
        </div>
      </div>

      {/* Action */}
      <div className="flex-shrink-0">
        <Link
          href={`/candidates/${c.id ?? ""}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-[hsl(20,100%,55%)] hover:text-white transition-colors"
        >
          <Eye className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">View</span>
        </Link>
      </div>
    </div>
  );
}
