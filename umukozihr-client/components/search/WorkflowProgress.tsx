"use client";

import {
  Brain,
  Search,
  UserCheck,
  BarChart3,
  Heart,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const WORKFLOW_STEPS = [
  { key: "analyzing", label: "Analyzing", icon: Brain },
  { key: "searching", label: "Searching", icon: Search },
  { key: "enriching", label: "Enriching", icon: UserCheck },
  { key: "scoring", label: "Scoring", icon: BarChart3 },
  { key: "willingness", label: "Willingness", icon: Heart },
  { key: "complete", label: "Complete", icon: CheckCircle2 },
] as const;

type StepKey = (typeof WORKFLOW_STEPS)[number]["key"];

interface WorkflowProgressProps {
  currentStep: string;
  progress: number;
  message: string;
}

export function WorkflowProgress({
  currentStep,
  progress,
  message,
}: WorkflowProgressProps) {
  const currentIndex = WORKFLOW_STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
      {/* Steps row */}
      <div className="flex items-center justify-between mb-4">
        {WORKFLOW_STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = step.key === currentStep;
          const isComplete = i < currentIndex || currentStep === "complete";
          const isPending = i > currentIndex && currentStep !== "complete";

          return (
            <div key={step.key} className="flex items-center">
              {i > 0 && (
                <div
                  className={cn(
                    "hidden sm:block h-px w-4 md:w-8 lg:w-12 mx-1",
                    isComplete
                      ? "bg-[hsl(180,50%,23%)]"
                      : isActive
                      ? "bg-[hsl(20,100%,55%)]"
                      : "bg-gray-200"
                  )}
                />
              )}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full transition-all",
                    isComplete
                      ? "bg-[hsl(180,50%,23%)] text-white"
                      : isActive
                      ? "bg-[hsl(20,100%,55%)] text-white shadow-md shadow-[hsl(20,100%,55%)]/25"
                      : "bg-gray-100 text-gray-400"
                  )}
                >
                  {isComplete && currentStep !== "complete" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isActive && currentStep !== "complete" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] sm:text-xs font-medium",
                    isComplete
                      ? "text-[hsl(180,50%,23%)]"
                      : isActive
                      ? "text-[hsl(20,100%,55%)]"
                      : "text-gray-400"
                  )}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-gray-100 mb-2">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            currentStep === "complete"
              ? "bg-[hsl(180,50%,23%)]"
              : "bg-gradient-to-r from-[hsl(20,100%,55%)] to-[hsl(20,100%,65%)]"
          )}
          style={{ width: `${Math.min(progress <= 1 ? progress * 100 : progress, 100)}%` }}
        />
      </div>

      {/* Status message */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">{message}</p>
        <span className="text-xs font-medium text-gray-400">
          {Math.round(progress <= 1 ? progress * 100 : progress)}%
        </span>
      </div>
    </div>
  );
}
