"use client";

import { useState } from "react";
import { Building2, Users } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface AccountTypeSelectorProps {
  onComplete: () => void;
}

export function AccountTypeSelector({ onComplete }: AccountTypeSelectorProps) {
  const [selected, setSelected] = useState<"company" | "agency" | null>(null);
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.updateMe({ account_type: selected });
      toast.success(selected === "agency" ? "Agency mode activated!" : "Account set up!");
      onComplete();
    } catch {
      toast.error("Failed to save. Please try again.");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-lg mx-4 rounded-2xl p-8" style={{ background: "var(--color-surface-elevated)", border: "1px solid var(--color-border)" }}>
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
          How are you using UmukoziHR?
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
          This helps our AI assistant personalize your experience.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Company option */}
          <button
            onClick={() => setSelected("company")}
            className="rounded-xl p-5 text-left transition-all"
            style={{
              border: selected === "company" ? "2px solid var(--color-brand-orange)" : "1px solid var(--color-border)",
              background: selected === "company" ? "color-mix(in srgb, var(--color-brand-orange) 6%, var(--color-surface-elevated))" : "var(--color-surface)",
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--color-brand-teal) 15%, transparent)" }}>
                <Building2 className="h-5 w-5" style={{ color: "var(--color-brand-teal)" }} />
              </div>
              <span className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                Hiring for my company
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              I'm an in-house recruiter or hiring manager looking to fill roles at my own company.
            </p>
          </button>

          {/* Agency option */}
          <button
            onClick={() => setSelected("agency")}
            className="rounded-xl p-5 text-left transition-all"
            style={{
              border: selected === "agency" ? "2px solid var(--color-brand-orange)" : "1px solid var(--color-border)",
              background: selected === "agency" ? "color-mix(in srgb, var(--color-brand-orange) 6%, var(--color-surface-elevated))" : "var(--color-surface)",
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--color-brand-orange) 15%, transparent)" }}>
                <Users className="h-5 w-5" style={{ color: "var(--color-brand-orange)" }} />
              </div>
              <span className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                Recruiting agency
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              I recruit on behalf of multiple client companies across different industries.
            </p>
          </button>
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected || saving}
          className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-all disabled:opacity-40"
          style={{ background: "var(--color-brand-orange)" }}
        >
          {saving ? "Setting up..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
