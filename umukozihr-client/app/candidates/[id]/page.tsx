"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Building2,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  GraduationCap,
  Calendar,
  Star,
  Target,
  Globe,
  Award,
} from "lucide-react";
import { cn, formatScore } from "@/lib/utils";
import type { CandidateResult } from "@/lib/types";

function getWillingnessColor(score: number | undefined | null) {
  // Score is 0-20 scale
  if (score == null)
    return { bg: "bg-gray-100", text: "text-gray-500", label: "Unknown", border: "border-gray-200" };
  if (score >= 14)
    return { bg: "bg-green-50", text: "text-green-700", label: "Likely Open", border: "border-green-200" };
  if (score >= 8)
    return { bg: "bg-yellow-50", text: "text-yellow-700", label: "Possibly Open", border: "border-yellow-200" };
  return { bg: "bg-red-50", text: "text-red-700", label: "Unlikely", border: "border-red-200" };
}

export default function CandidateDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [candidate, setCandidate] = useState<CandidateResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api.getCandidate(id);
        setCandidate(data);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to load candidate"
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(20,100%,55%)]" />
          <p className="text-sm text-gray-500">Loading candidate...</p>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            {error ?? "Candidate not found"}
          </h2>
          <Link
            href="/results"
            className="inline-flex items-center gap-2 text-sm text-[hsl(20,100%,55%)] hover:underline mt-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Results
          </Link>
        </div>
      </div>
    );
  }

  const c = candidate;
  const willingness = getWillingnessColor(c.willingness_score);
  const matchedSkills = c.matched_skills ?? [];
  const missingSkills = c.missing_skills ?? [];
  const allSkills = c.skills ?? [];
  const experience = c.experience ?? [];
  const education = c.education ?? [];
  const willingnessReasons = c.willingness_reasoning ?? [];
  const greenFlags = c.willingness_green_flags ?? c.green_flags ?? [];
  const redFlags = c.willingness_red_flags ?? c.red_flags ?? [];

  const scoreBreakdown = [
    {
      label: "Overall Match",
      value: c.match_score ?? c.total_score ?? 0,
      icon: Target,
      color: "text-[hsl(20,100%,55%)]",
    },
    {
      label: "Title Match",
      value: c.title_score ?? 0,
      icon: Briefcase,
      color: "text-blue-600",
    },
    {
      label: "Skills Match",
      value: c.skills_score ?? 0,
      icon: Star,
      color: "text-purple-600",
    },
    {
      label: "Experience",
      value: c.experience_score ?? 0,
      icon: Calendar,
      color: "text-teal-600",
    },
    {
      label: "Location",
      value: c.location_score ?? 0,
      icon: Globe,
      color: "text-green-600",
    },
  ];

  return (
    <AppShell>
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        href="/results"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Results
      </Link>

      {/* Hero section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            {c.photo_url ? (
              <img src={c.photo_url} alt={c.full_name || ""} className="h-20 w-20 rounded-2xl object-cover border border-gray-200" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl text-white text-2xl font-bold" style={{ background: "linear-gradient(135deg, hsl(180,50%,23%), hsl(180,50%,33%))" }}>
                {(c.full_name ?? "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
            )}
            {c.is_open_to_work && (
              <div className="absolute -bottom-1 -right-1 rounded-full bg-green-500 p-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {c.full_name || "Unknown Candidate"}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                  {(c.current_title) && (
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      {c.current_title}
                    </span>
                  )}
                  {(c.current_company) && (
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      {c.current_company}
                    </span>
                  )}
                  {c.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {c.location}
                    </span>
                  )}
                </div>
              </div>

              {/* LinkedIn link */}
              {c.linkedin_url && (
                <a
                  href={c.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  LinkedIn
                </a>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              {c.is_open_to_work && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Open to Work
                </span>
              )}
              {c.has_founder_experience && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                  <Award className="h-3 w-3" />
                  Founder Experience
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
        {scoreBreakdown.map((score) => {
          const Icon = score.icon;
          const pct = Math.round(score.value * 100);
          return (
            <div
              key={score.label}
              className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm"
            >
              <Icon className={cn("h-5 w-5 mx-auto mb-2", score.color)} />
              <p className="text-2xl font-bold text-gray-900">{pct}%</p>
              <p className="text-xs text-gray-500 mt-0.5">{score.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Willingness section */}
        <div
          className={cn(
            "rounded-xl border p-5 shadow-sm",
            willingness.border,
            willingness.bg
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Willingness to Move
            </h2>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold",
                willingness.text,
                willingness.bg === "bg-green-50"
                  ? "bg-green-200/50"
                  : willingness.bg === "bg-yellow-50"
                  ? "bg-yellow-200/50"
                  : willingness.bg === "bg-red-50"
                  ? "bg-red-200/50"
                  : "bg-gray-200/50"
              )}
            >
              {Math.round(((c.willingness_score ?? 0) / 20) * 100)}% -{" "}
              {c.willingness_likelihood || willingness.label}
            </span>
          </div>

          {/* Reasoning */}
          {willingnessReasons.length > 0 && (
            <div className="space-y-2 mb-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assessment
              </p>
              <ul className="space-y-1.5">
                {willingnessReasons.map((reason: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Flags */}
          <div className="grid grid-cols-1 gap-3">
            {greenFlags.length > 0 && (
              <div>
                <p className="text-xs font-medium text-green-700 mb-1.5">
                  Positive Signals
                </p>
                <div className="space-y-1">
                  {greenFlags.map((flag: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-xs text-green-800"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                      {flag}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {redFlags.length > 0 && (
              <div>
                <p className="text-xs font-medium text-red-700 mb-1.5">
                  Concerns
                </p>
                <div className="space-y-1">
                  {redFlags.map((flag: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-xs text-red-800"
                    >
                      <XCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                      {flag}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Skills section */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Skills</h2>

          {matchedSkills.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Matched
              </p>
              <div className="flex flex-wrap gap-2">
                {matchedSkills.map((skill: string) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {missingSkills.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Missing
              </p>
              <div className="flex flex-wrap gap-2">
                {missingSkills.map((skill: string) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
                  >
                    <XCircle className="h-3 w-3" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Additional skills */}
          {allSkills.length > 0 &&
            matchedSkills.length === 0 &&
            missingSkills.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {allSkills.map((skill: string) => (
                  <span
                    key={skill}
                    className="rounded-full bg-[hsl(180,50%,23%)]/10 px-3 py-1 text-xs font-medium text-[hsl(180,50%,23%)]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

          {allSkills.length === 0 &&
            matchedSkills.length === 0 &&
            missingSkills.length === 0 && (
              <p className="text-sm text-gray-400">No skills data available</p>
            )}
        </div>
      </div>

      {/* Experience timeline */}
      {Array.isArray(experience) && experience.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Experience
          </h2>
          <div className="relative pl-6 space-y-5">
            {/* Timeline line */}
            <div className="absolute left-[9px] top-2 bottom-2 w-px bg-gray-200" />

            {experience.map((exp: Record<string, unknown>, i: number) => (
              <div key={i} className="relative">
                {/* Timeline dot */}
                <div
                  className={cn(
                    "absolute -left-6 top-1.5 h-[9px] w-[9px] rounded-full border-2 border-white",
                    i === 0
                      ? "bg-[hsl(20,100%,55%)]"
                      : "bg-gray-300"
                  )}
                />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {(exp.title as string) ?? (exp.position as string) ?? "Role"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {(exp.company as string) ?? (exp.company_name as string) ?? ""}
                  </p>
                  {((exp.start_date as string) || (exp.duration as string)) && (
                    <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                      <Calendar className="h-3 w-3" />
                      {(exp.start_date as string) ?? ""}
                      {(exp.end_date as string)
                        ? ` - ${exp.end_date as string}`
                        : (exp.duration as string)
                        ? ` (${exp.duration as string})`
                        : ""}
                    </p>
                  )}
                  {(exp.description as string) && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {exp.description as string}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {Array.isArray(education) && education.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Education
          </h2>
          <div className="space-y-4">
            {education.map((edu: Record<string, unknown>, i: number) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg bg-gray-50 p-3"
              >
                <GraduationCap className="h-5 w-5 text-[hsl(180,50%,23%)] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {(edu.degree as string) ?? (edu.field_of_study as string) ?? "Degree"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {(edu.school as string) ?? (edu.institution as string) ?? ""}
                  </p>
                  {((edu.start_year as string) || (edu.year as string)) && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {(edu.start_year as string) ?? (edu.year as string) ?? ""}
                      {(edu.end_year as string) ? ` - ${edu.end_year as string}` : ""}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </AppShell>
  );
}
