"use client";

import { useState, useCallback } from "react";
import {
  Briefcase,
  GraduationCap,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Search,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ManualFormData {
  job_title: string;
  skills: string[];
  experience_min: number;
  experience_max: number;
  education: string;
  country: string;
  city: string;
  industry: string;
}

interface ManualFormProps {
  onSearch: (data: ManualFormData | string) => void;
  isSearching: boolean;
  deepResearch: boolean;
}

const STEPS = [
  { label: "Role", icon: Briefcase },
  { label: "Experience", icon: GraduationCap },
  { label: "Location", icon: MapPin },
  { label: "Review", icon: CheckCircle2 },
];

const EDUCATION_OPTIONS = [
  "Any",
  "High School",
  "Associate's",
  "Bachelor's",
  "Master's",
  "PhD / Doctorate",
];

export function ManualForm({
  onSearch,
  isSearching,
  deepResearch,
}: ManualFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [skillInput, setSkillInput] = useState("");
  const [form, setForm] = useState<ManualFormData>({
    job_title: "",
    skills: [],
    experience_min: 0,
    experience_max: 10,
    education: "Any",
    country: "",
    city: "",
    industry: "",
  });

  const updateField = useCallback(
    <K extends keyof ManualFormData>(key: K, value: ManualFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !form.skills.includes(skill)) {
      updateField("skills", [...form.skills, skill]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    updateField(
      "skills",
      form.skills.filter((s) => s !== skill)
    );
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
    if (e.key === "Backspace" && !skillInput && form.skills.length > 0) {
      removeSkill(form.skills[form.skills.length - 1]);
    }
  };

  const canProceed =
    currentStep === 0 ? form.job_title.trim().length > 0 : true;

  const handleSubmit = () => {
    if (!form.job_title.trim()) return;
    onSearch(form);
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-gray-200 bg-white">
      {/* Step progress bar */}
      <div className="flex-shrink-0 border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === currentStep;
            const isComplete = i < currentStep;
            return (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && (
                  <div
                    className={cn(
                      "hidden sm:block h-px w-8 lg:w-16 mx-1",
                      isComplete ? "bg-[hsl(20,100%,55%)]" : "bg-gray-200"
                    )}
                  />
                )}
                <button
                  onClick={() => i < currentStep && setCurrentStep(i)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-[hsl(20,100%,55%)]/10 text-[hsl(20,100%,45%)]"
                      : isComplete
                      ? "text-[hsl(180,50%,23%)] cursor-pointer hover:bg-gray-50"
                      : "text-gray-400"
                  )}
                  disabled={i > currentStep}
                >
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                      isActive
                        ? "bg-[hsl(20,100%,55%)] text-white"
                        : isComplete
                        ? "bg-[hsl(180,50%,23%)] text-white"
                        : "bg-gray-200 text-gray-500"
                    )}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[hsl(20,100%,55%)] to-[hsl(20,100%,65%)] transition-all duration-500"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Form content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Step 1: Role & Skills */}
        {currentStep === 0 && (
          <div className="max-w-lg mx-auto space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                What role are you hiring for?
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Enter the job title and key skills for the position.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.job_title}
                onChange={(e) => updateField("job_title", e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-[hsl(20,100%,55%)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(20,100%,55%)]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Skills
              </label>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-[hsl(20,100%,55%)] focus-within:bg-white focus-within:ring-2 focus-within:ring-[hsl(20,100%,55%)]/20">
                <div className="flex flex-wrap gap-2 mb-1">
                  {form.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 rounded-full bg-[hsl(180,50%,23%)]/10 px-3 py-1 text-xs font-medium text-[hsl(180,50%,23%)]"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-[hsl(180,50%,23%)]/20"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  onBlur={addSkill}
                  placeholder={
                    form.skills.length === 0
                      ? "Type a skill and press Enter..."
                      : "Add more..."
                  }
                  className="w-full bg-transparent py-1 text-sm placeholder:text-gray-400 focus:outline-none"
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Press Enter or comma to add a skill
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Experience & Education */}
        {currentStep === 1 && (
          <div className="max-w-lg mx-auto space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Experience & Education
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Set the experience range and education requirements.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Years of Experience
              </label>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500">Minimum</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {form.experience_min} year
                      {form.experience_min !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    value={form.experience_min}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateField("experience_min", val);
                      if (val > form.experience_max) {
                        updateField("experience_max", val);
                      }
                    }}
                    className="w-full accent-[hsl(20,100%,55%)]"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500">Maximum</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {form.experience_max}
                      {form.experience_max === 20 ? "+" : ""} year
                      {form.experience_max !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    value={form.experience_max}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateField("experience_max", val);
                      if (val < form.experience_min) {
                        updateField("experience_min", val);
                      }
                    }}
                    className="w-full accent-[hsl(20,100%,55%)]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Education Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {EDUCATION_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => updateField("education", option)}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 text-sm font-medium transition-all",
                      form.education === option
                        ? "border-[hsl(20,100%,55%)] bg-[hsl(20,100%,55%)]/10 text-[hsl(20,100%,45%)]"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Location & Industry */}
        {currentStep === 2 && (
          <div className="max-w-lg mx-auto space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Location & Industry
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Narrow down your search by location and industry.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  placeholder="e.g. Kenya"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-[hsl(20,100%,55%)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(20,100%,55%)]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="e.g. Nairobi"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-[hsl(20,100%,55%)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(20,100%,55%)]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Industry
              </label>
              <input
                type="text"
                value={form.industry}
                onChange={(e) => updateField("industry", e.target.value)}
                placeholder="e.g. Financial Technology"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-[hsl(20,100%,55%)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(20,100%,55%)]/20"
              />
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 3 && (
          <div className="max-w-lg mx-auto space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Review Your Search
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Confirm the details below before starting your search.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 divide-y divide-gray-100">
              <ReviewRow label="Job Title" value={form.job_title} />
              <ReviewRow
                label="Skills"
                value={
                  form.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {form.skills.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-[hsl(180,50%,23%)]/10 px-2.5 py-0.5 text-xs font-medium text-[hsl(180,50%,23%)]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    "Any"
                  )
                }
              />
              <ReviewRow
                label="Experience"
                value={`${form.experience_min} - ${form.experience_max}${form.experience_max === 20 ? "+" : ""} years`}
              />
              <ReviewRow label="Education" value={form.education} />
              <ReviewRow
                label="Location"
                value={
                  [form.city, form.country].filter(Boolean).join(", ") || "Any"
                }
              />
              <ReviewRow label="Industry" value={form.industry || "Any"} />
              <ReviewRow
                label="Deep Research"
                value={
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      deepResearch
                        ? "bg-[hsl(20,100%,55%)]/10 text-[hsl(20,100%,45%)]"
                        : "bg-gray-100 text-gray-500"
                    )}
                  >
                    <Sparkles className="h-3 w-3" />
                    {deepResearch ? "Enabled" : "Disabled"}
                  </span>
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer buttons */}
      <div className="flex-shrink-0 border-t border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            disabled={currentStep === 0}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
              currentStep === 0
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          {currentStep < 3 ? (
            <button
              onClick={() => setCurrentStep((s) => Math.min(3, s + 1))}
              disabled={!canProceed}
              className={cn(
                "flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all",
                canProceed
                  ? "bg-[hsl(20,100%,55%)] text-white hover:bg-[hsl(20,100%,48%)] shadow-sm"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSearching}
              className={cn(
                "flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all",
                isSearching
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-[hsl(20,100%,55%)] text-white hover:bg-[hsl(20,100%,48%)] shadow-sm"
              )}
            >
              <Search className="h-4 w-4" />
              Start Search
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between px-4 py-3">
      <span className="text-sm text-gray-500 flex-shrink-0 mr-4">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">
        {value || "Any"}
      </span>
    </div>
  );
}
