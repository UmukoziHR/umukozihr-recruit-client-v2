"use client";

import { useEffect, useState } from "react";
import { Brain, Search, UserCheck, BarChart3, Heart, CheckCircle2, Loader2 } from "lucide-react";

const STEPS = [
  { key: "analyzing", label: "Analyzing your requirements", icon: Brain },
  { key: "searching", label: "Searching for candidates", icon: Search },
  { key: "enriching", label: "Enriching LinkedIn profiles", icon: UserCheck },
  { key: "scoring", label: "Scoring candidate fit", icon: BarChart3 },
  { key: "willingness", label: "Evaluating willingness to join", icon: Heart },
  { key: "complete", label: "Search complete!", icon: CheckCircle2 },
] as const;

interface WorkflowProgressProps {
  currentStep: string;
  progress: number;
  message: string;
}

export function WorkflowProgress({ currentStep, progress, message }: WorkflowProgressProps) {
  const currentIdx = STEPS.findIndex((s) => s.key === currentStep);
  const activeIdx = currentIdx >= 0 ? currentIdx : 0;
  const pct = Math.round(progress <= 1 ? progress * 100 : progress);
  const [prevIdx, setPrevIdx] = useState(activeIdx);
  const [sliding, setSliding] = useState(false);

  useEffect(() => {
    if (activeIdx !== prevIdx) {
      setSliding(true);
      const t = setTimeout(() => { setPrevIdx(activeIdx); setSliding(false); }, 400);
      return () => clearTimeout(t);
    }
  }, [activeIdx, prevIdx]);

  const ActiveIcon = STEPS[activeIdx]?.icon || Brain;
  const isComplete = currentStep === "complete";

  return (
    <div className="rounded-xl p-4 overflow-hidden" style={{ background: "var(--color-surface-elevated)", border: "1px solid var(--color-border)" }}>
      {/* Step dots */}
      <div className="flex items-center gap-1.5 mb-3">
        {STEPS.map((_, i) => (
          <div key={i} className="h-2 w-2 rounded-full transition-all duration-500" style={{
            background: i < activeIdx ? "hsl(160, 60%, 45%)" : i === activeIdx ? (isComplete ? "hsl(160, 60%, 45%)" : "hsl(20, 100%, 55%)") : "var(--color-border)",
            transform: i === activeIdx ? "scale(1.4)" : "scale(1)",
          }} />
        ))}
        <span className="ml-auto text-xs font-semibold" style={{ color: isComplete ? "hsl(160, 60%, 45%)" : "var(--color-brand-orange)" }}>{pct}%</span>
      </div>

      {/* Rolling step display */}
      <div className="relative h-14 overflow-hidden">
        <div className="absolute inset-0 flex items-center gap-3 transition-all duration-400 ease-out" style={{
          transform: sliding ? "translateY(-100%)" : "translateY(0)",
          opacity: sliding ? 0 : 1,
        }}>
          <div className="flex items-center justify-center h-11 w-11 rounded-xl shrink-0 transition-all" style={{
            background: isComplete ? "hsl(160, 60%, 45%)" : "hsl(20, 100%, 55%)",
          }}>
            {isComplete ? (
              <CheckCircle2 className="h-5 w-5 text-white" />
            ) : (
              <ActiveIcon className="h-5 w-5 text-white animate-pulse" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text)" }}>
              {STEPS[activeIdx]?.label}
            </p>
            <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>
              {message || "Processing..."}
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full mt-2" style={{ background: "var(--color-border)" }}>
        <div className="h-full rounded-full transition-all duration-700 ease-out" style={{
          width: `${Math.min(pct, 100)}%`,
          background: isComplete ? "hsl(160, 60%, 45%)" : "linear-gradient(90deg, hsl(20, 100%, 55%), hsl(20, 100%, 65%))",
        }} />
      </div>
    </div>
  );
}
