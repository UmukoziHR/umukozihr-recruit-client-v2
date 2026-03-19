"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";

const TABS = ["account", "company", "billing", "security", "appearance"] as const;
type Tab = (typeof TABS)[number];

const TAB_ICONS: Record<Tab, string> = {
  account: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
  company: "M3 21h18M3 7v14M21 7v14M6 11h.01M6 15h.01M10 11h.01M10 15h.01M14 11h.01M14 15h.01M18 11h.01M18 15h.01M6 7V3h12v4",
  billing: "M21 4H3v16h18V4zM1 10h22",
  security: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  appearance: "M12 3v1m0 16v1m-8-9H3m18 0h-1m-2.636-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "44px",
  padding: "0 14px",
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-sm)",
  color: "var(--color-text)",
  fontSize: "14px",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

const inputFocusRing = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = "var(--color-brand-orange)";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,107,53,0.15)";
};

const inputBlurRing = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = "var(--color-border)";
  e.currentTarget.style.boxShadow = "none";
};

export default function SettingsWrapper() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div
              className="animate-spin h-10 w-10 rounded-full"
              style={{
                border: "4px solid var(--color-border)",
                borderTopColor: "var(--color-brand-orange)",
              }}
            />
          </div>
        }
      >
        <SettingsPage />
      </Suspense>
    </AppShell>
  );
}

function SettingsPage() {
  const [tab, setTab] = useState<Tab>("account");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const t = params.get("tab");
    if (t && TABS.includes(t as Tab)) setTab(t as Tab);
  }, [params]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/auth");
      return;
    }
    fetch("/api/backend/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setUser)
      .catch(() => router.push("/auth"))
      .finally(() => setLoading(false));
  }, [router]);

  const save = async (body: any) => {
    const token = localStorage.getItem("access_token");
    const res = await fetch("/api/backend/users/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setUser(await res.json());
      toast.success("Settings saved");
    } else {
      toast.error("Failed to save");
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="animate-spin h-10 w-10 rounded-full"
          style={{
            border: "4px solid var(--color-border)",
            borderTopColor: "var(--color-brand-orange)",
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold mb-1"
          style={{ color: "var(--color-text)" }}
        >
          Settings
        </h1>
        <p style={{ color: "var(--color-text-muted)" }}>
          Manage your account, company profile, and preferences
        </p>
      </div>

      {/* Tab Pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl capitalize whitespace-nowrap text-sm font-semibold transition-all"
            style={{
              background:
                tab === t ? "var(--color-brand-orange)" : "var(--color-surface-elevated)",
              color: tab === t ? "var(--color-text-inverse)" : "var(--color-text-secondary)",
              border:
                tab === t
                  ? "1px solid var(--color-brand-orange)"
                  : "1px solid var(--color-border)",
              boxShadow: tab === t ? "var(--shadow-sm)" : "none",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={TAB_ICONS[t]} />
              {t === "account" && <circle cx="9" cy="7" r="4" />}
            </svg>
            {t}
          </button>
        ))}
      </div>

      {/* Content Panel */}
      <div
        className="p-8"
        style={{
          background: "var(--color-surface-elevated)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {tab === "account" && <AccountTab user={user} onSave={save} />}
        {tab === "company" && <CompanyTab user={user} onSave={save} />}
        {tab === "billing" && <BillingTab user={user} />}
        {tab === "security" && <SecurityTab />}
        {tab === "appearance" && <AppearanceTab />}
      </div>
    </div>
  );
}

/* ─── Account Tab ──────────────────────────────────────────────── */
function AccountTab({
  user,
  onSave,
}: {
  user: any;
  onSave: (b: any) => void;
}) {
  const [form, setForm] = useState({
    full_name: user.full_name || "",
    company: user.company || "",
    job_title: user.job_title || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-xl font-semibold mb-1"
          style={{ color: "var(--color-text)" }}
        >
          Account Information
        </h2>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Update your personal details
        </p>
      </div>

      <div
        className="h-px w-full"
        style={{ background: "var(--color-border)" }}
      />

      <div className="space-y-5">
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Full Name
          </label>
          <input
            value={form.full_name}
            onChange={(e) =>
              setForm((f) => ({ ...f, full_name: e.target.value }))
            }
            style={inputStyle}
            onFocus={inputFocusRing}
            onBlur={inputBlurRing}
            placeholder="Your full name"
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Company
          </label>
          <input
            value={form.company}
            onChange={(e) =>
              setForm((f) => ({ ...f, company: e.target.value }))
            }
            style={inputStyle}
            onFocus={inputFocusRing}
            onBlur={inputBlurRing}
            placeholder="Company name"
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Job Title
          </label>
          <input
            value={form.job_title}
            onChange={(e) =>
              setForm((f) => ({ ...f, job_title: e.target.value }))
            }
            style={inputStyle}
            onFocus={inputFocusRing}
            onBlur={inputBlurRing}
            placeholder="e.g. Head of Talent"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] disabled:opacity-50"
        style={{
          background: "var(--color-brand-orange)",
          color: "var(--color-text-inverse)",
          boxShadow: "var(--shadow-sm)",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--color-brand-orange-hover)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "var(--color-brand-orange)")
        }
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}

/* ─── Company Tab ──────────────────────────────────────────────── */
function CompanyTab({
  user,
  onSave,
}: {
  user: any;
  onSave: (b: any) => void;
}) {
  const cp = user.company_profile || {};
  const [form, setForm] = useState({
    company_name: cp.company_name || "",
    industry: cp.industry || "",
    stage: cp.stage || "",
    team_size: cp.team_size || 0,
    compensation_philosophy: cp.compensation_philosophy || "",
    remote_policy: cp.remote_policy || "",
    mission: cp.mission || "",
    website: cp.website || "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await onSave({ company_profile: form });
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-xl font-semibold mb-1"
          style={{ color: "var(--color-text)" }}
        >
          Company Profile
        </h2>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          This information is used by the AI to assess candidate willingness to
          join your company.
        </p>
      </div>

      <div
        className="flex items-start gap-3 p-4 rounded-xl"
        style={{
          background: "rgba(255,107,53,0.06)",
          border: "1px solid rgba(255,107,53,0.15)",
          borderRadius: "var(--radius-md)",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-brand-orange)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-0.5 shrink-0"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          A complete company profile helps the AI better evaluate whether
          candidates would be a good cultural and career fit for your team.
        </p>
      </div>

      <div
        className="h-px w-full"
        style={{ background: "var(--color-border)" }}
      />

      <div className="space-y-5">
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Company Name
          </label>
          <input
            value={form.company_name}
            onChange={(e) => set("company_name", e.target.value)}
            style={inputStyle}
            onFocus={inputFocusRing}
            onBlur={inputBlurRing}
            placeholder="Your company name"
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Industry
          </label>
          <input
            value={form.industry}
            onChange={(e) => set("industry", e.target.value)}
            style={inputStyle}
            onFocus={inputFocusRing}
            onBlur={inputBlurRing}
            placeholder="e.g. Fintech, Healthcare, SaaS"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Stage
            </label>
            <select
              value={form.stage}
              onChange={(e) => set("stage", e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
              onFocus={inputFocusRing as any}
              onBlur={inputBlurRing as any}
            >
              <option value="">Select stage...</option>
              <option value="pre-seed">Pre-Seed</option>
              <option value="seed">Seed</option>
              <option value="series_a">Series A</option>
              <option value="series_b">Series B</option>
              <option value="series_c">Series C</option>
              <option value="growth">Growth</option>
              <option value="public">Public</option>
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Team Size
            </label>
            <input
              type="number"
              value={form.team_size || ""}
              onChange={(e) => set("team_size", parseInt(e.target.value) || 0)}
              style={inputStyle}
              onFocus={inputFocusRing}
              onBlur={inputBlurRing}
              placeholder="Number of employees"
            />
          </div>
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Remote Policy
          </label>
          <select
            value={form.remote_policy}
            onChange={(e) => set("remote_policy", e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}
            onFocus={inputFocusRing as any}
            onBlur={inputBlurRing as any}
          >
            <option value="">Select policy...</option>
            <option value="remote_first">Remote First</option>
            <option value="hybrid">Hybrid</option>
            <option value="office_only">Office Only</option>
          </select>
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Mission / Company Bio
          </label>
          <textarea
            rows={4}
            value={form.mission}
            onChange={(e) => set("mission", e.target.value)}
            placeholder="Describe your company in a few sentences. This helps the AI assess candidate fit."
            style={{
              ...inputStyle,
              height: "auto",
              padding: "12px 14px",
              resize: "none" as const,
            }}
            onFocus={inputFocusRing as any}
            onBlur={inputBlurRing as any}
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Website
          </label>
          <input
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
            style={inputStyle}
            onFocus={inputFocusRing}
            onBlur={inputBlurRing}
            placeholder="https://yourcompany.com"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] disabled:opacity-50"
        style={{
          background: "var(--color-brand-orange)",
          color: "var(--color-text-inverse)",
          boxShadow: "var(--shadow-sm)",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--color-brand-orange-hover)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "var(--color-brand-orange)")
        }
      >
        {saving ? "Saving..." : "Save Company Profile"}
      </button>
    </div>
  );
}

/* ─── Billing Tab ──────────────────────────────────────────────── */
function BillingTab({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-xl font-semibold mb-1"
          style={{ color: "var(--color-text)" }}
        >
          Billing & Subscription
        </h2>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Manage your plan and credit balance
        </p>
      </div>

      <div
        className="h-px w-full"
        style={{ background: "var(--color-border)" }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          className="p-5"
          style={{
            background: "var(--color-surface-secondary)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <p
            className="text-sm font-medium mb-2"
            style={{ color: "var(--color-text-muted)" }}
          >
            Current Plan
          </p>
          <p
            className="text-2xl font-bold capitalize"
            style={{ color: "var(--color-text)" }}
          >
            {user.subscription_tier}
          </p>
        </div>
        <div
          className="p-5"
          style={{
            background: "var(--color-surface-secondary)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <p
            className="text-sm font-medium mb-2"
            style={{ color: "var(--color-text-muted)" }}
          >
            Credit Balance
          </p>
          <p
            className="text-2xl font-bold"
            style={{ color: "var(--color-brand-orange)" }}
          >
            {user.credit_balance}
          </p>
        </div>
      </div>

      <a
        href="/payment"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
        style={{
          background: "var(--color-brand-teal)",
          color: "var(--color-text-inverse)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
        Upgrade Plan
      </a>
    </div>
  );
}

/* ─── Security Tab ─────────────────────────────────────────────── */
function SecurityTab() {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (form.new_password !== form.confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (form.new_password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSaving(true);
    const token = localStorage.getItem("access_token");
    const res = await fetch("/api/backend/users/me/password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        current_password: form.current_password,
        new_password: form.new_password,
      }),
    });
    if (res.ok) {
      toast.success("Password changed successfully");
      setForm({ current_password: "", new_password: "", confirm: "" });
    } else {
      const d = await res.json();
      toast.error(d.detail || "Failed to change password");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-xl font-semibold mb-1"
          style={{ color: "var(--color-text)" }}
        >
          Change Password
        </h2>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Update your password to keep your account secure
        </p>
      </div>

      <div
        className="h-px w-full"
        style={{ background: "var(--color-border)" }}
      />

      <div className="space-y-5 max-w-md">
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Current Password
          </label>
          <input
            type="password"
            value={form.current_password}
            onChange={(e) =>
              setForm((f) => ({ ...f, current_password: e.target.value }))
            }
            style={inputStyle}
            onFocus={inputFocusRing}
            onBlur={inputBlurRing}
            placeholder="Enter current password"
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            New Password
          </label>
          <input
            type="password"
            value={form.new_password}
            onChange={(e) =>
              setForm((f) => ({ ...f, new_password: e.target.value }))
            }
            style={inputStyle}
            onFocus={inputFocusRing}
            onBlur={inputBlurRing}
            placeholder="At least 8 characters"
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Confirm New Password
          </label>
          <input
            type="password"
            value={form.confirm}
            onChange={(e) =>
              setForm((f) => ({ ...f, confirm: e.target.value }))
            }
            style={inputStyle}
            onFocus={inputFocusRing}
            onBlur={inputBlurRing}
            placeholder="Re-enter new password"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] disabled:opacity-50"
        style={{
          background: "var(--color-brand-orange)",
          color: "var(--color-text-inverse)",
          boxShadow: "var(--shadow-sm)",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--color-brand-orange-hover)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "var(--color-brand-orange)")
        }
      >
        {saving ? "Changing..." : "Change Password"}
      </button>
    </div>
  );
}

/* ─── Appearance Tab ───────────────────────────────────────────── */
function AppearanceTab() {
  const [theme, setTheme] = useState("system");

  useEffect(() => {
    setTheme(localStorage.getItem("theme") || "system");
  }, []);

  const apply = (t: string) => {
    setTheme(t);
    localStorage.setItem("theme", t);
    document.documentElement.classList.toggle(
      "dark",
      t === "dark" ||
        (t === "system" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  };

  const themeOptions = [
    {
      key: "light",
      label: "Light",
      icon: "M12 3v1m0 16v1m-8-9H3m18 0h-1m-2.636-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z",
    },
    {
      key: "dark",
      label: "Dark",
      icon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
    },
    {
      key: "system",
      label: "System",
      icon: "M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-xl font-semibold mb-1"
          style={{ color: "var(--color-text)" }}
        >
          Appearance
        </h2>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Choose how UmukoziHR looks for you
        </p>
      </div>

      <div
        className="h-px w-full"
        style={{ background: "var(--color-border)" }}
      />

      <div className="grid grid-cols-3 gap-4 max-w-lg">
        {themeOptions.map((t) => (
          <button
            key={t.key}
            onClick={() => apply(t.key)}
            className="flex flex-col items-center gap-3 p-5 rounded-xl transition-all"
            style={{
              background:
                theme === t.key
                  ? "var(--color-brand-orange)"
                  : "var(--color-surface-secondary)",
              color:
                theme === t.key
                  ? "var(--color-text-inverse)"
                  : "var(--color-text-secondary)",
              border:
                theme === t.key
                  ? "2px solid var(--color-brand-orange)"
                  : "2px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={t.icon} />
            </svg>
            <span className="text-sm font-semibold capitalize">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
