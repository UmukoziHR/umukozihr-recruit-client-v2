"use client";

import Link from "next/link";
import { MapPin, Briefcase, Building2, Eye, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CandidateResult } from "@/lib/types";

function getWillingness(c: CandidateResult) {
  const l = c.willingness_likelihood || "";
  if (l.includes("very_likely") || l === "likely") return { bg: "bg-green-100", text: "text-green-700", label: "Likely" };
  if (l.includes("possible")) return { bg: "bg-yellow-100", text: "text-yellow-700", label: "Possible" };
  if (l.includes("unlikely")) return { bg: "bg-red-100", text: "text-red-700", label: "Unlikely" };
  const s = c.willingness_score;
  if (s == null) return { bg: "bg-gray-100", text: "text-gray-500", label: "Unknown" };
  if (s >= 14) return { bg: "bg-green-100", text: "text-green-700", label: "Likely" };
  if (s >= 8) return { bg: "bg-yellow-100", text: "text-yellow-700", label: "Possible" };
  return { bg: "bg-red-100", text: "text-red-700", label: "Unlikely" };
}

export function CandidateCard({ candidate }: { candidate: CandidateResult }) {
  const c = candidate;
  const name = c.full_name || c.name || "Unknown";
  const matchPct = Math.round((c.match_score ?? c.score ?? 0) * 100);
  const willingness = getWillingness(c);
  const skills = (c.skills ?? []).slice(0, 3);
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="group relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all">
      {c.is_open_to_work && (
        <div className="absolute -top-2 -right-2 z-10">
          <span className="inline-flex items-center gap-1 rounded-full bg-green-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
            <Sparkles className="h-3 w-3" /> Open to Work
          </span>
        </div>
      )}

      {/* Photo + Info */}
      <div className="flex items-start gap-3 mb-4">
        <div className="relative shrink-0">
          {c.photo_url ? (
            <img src={c.photo_url} alt={name} className="h-14 w-14 rounded-xl object-cover border border-gray-200" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-xl text-white text-lg font-bold" style={{ background: "linear-gradient(135deg, hsl(180,50%,23%), hsl(180,50%,33%))" }}>
              {initials}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 flex items-center justify-center h-7 w-7 rounded-full bg-white border-2 text-[10px] font-bold" style={{ borderColor: matchPct >= 70 ? "#16a34a" : matchPct >= 50 ? "#ea580c" : "#eab308", color: matchPct >= 70 ? "#16a34a" : matchPct >= 50 ? "#ea580c" : "#eab308" }}>
            {matchPct}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{name}</h3>
          {(c.current_title || c.title) && (
            <p className="flex items-center gap-1 text-xs text-gray-500 truncate mt-0.5">
              <Briefcase className="h-3 w-3 shrink-0" /> {c.current_title || c.title}
            </p>
          )}
          {(c.current_company || c.company) && (
            <p className="flex items-center gap-1 text-xs text-gray-500 truncate mt-0.5">
              <Building2 className="h-3 w-3 shrink-0" /> {c.current_company || c.company}
            </p>
          )}
          {c.location && typeof c.location === "string" && (
            <p className="flex items-center gap-1 text-xs text-gray-500 truncate mt-0.5">
              <MapPin className="h-3 w-3 shrink-0" /> {c.location}
            </p>
          )}
        </div>
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {skills.map((skill: string) => (
            <span key={skill} className="rounded-full px-2.5 py-0.5 text-[11px] font-medium" style={{ background: "rgba(30,90,90,0.08)", color: "hsl(180,50%,23%)" }}>
              {skill}
            </span>
          ))}
          {(c.skills ?? []).length > 3 && (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-500">
              +{(c.skills ?? []).length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold", willingness.bg, willingness.text)}>
          {willingness.label}
        </span>
        <Link href={`/candidates/${c.id ?? ""}`} className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-[hsl(20,100%,55%)] hover:text-white transition-colors">
          <Eye className="h-3.5 w-3.5" /> View Profile
        </Link>
      </div>
    </div>
  );
}
