"use client";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DashboardData {
  user: {
    full_name: string;
    email: string;
    subscription_tier: string;
    credit_balance: number;
    is_verified: boolean;
  };
  recentSearches: Array<{
    id: string;
    prompt: string;
    total_approved: number;
    created_at: string;
    status: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/auth");
      return;
    }

    Promise.all([
      fetch("/api/backend/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
      fetch("/api/backend/search/?per_page=5", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .catch(() => ({ searches: [] })),
    ])
      .then(([user, searches]) => {
        setData({ user, recentSearches: searches.searches || [] });
      })
      .catch(() => router.push("/auth"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading || !data) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div
            className="animate-spin h-10 w-10 rounded-full"
            style={{
              border: "4px solid var(--color-border)",
              borderTopColor: "var(--color-brand-orange)",
            }}
          />
        </div>
      </AppShell>
    );
  }

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = data.user.full_name?.split(" ")[0] || "there";

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-1"
            style={{ color: "var(--color-text)" }}
          >
            {greeting}, {firstName}
          </h1>
          <p style={{ color: "var(--color-text-muted)" }}>
            Here&apos;s your recruiting dashboard
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Credits Card */}
          <div
            className="p-6 relative overflow-hidden"
            style={{
              background: "var(--color-surface-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10"
              style={{
                background: "var(--color-brand-orange)",
                transform: "translate(30%, -30%)",
              }}
            />
            <p
              className="text-sm font-medium mb-2"
              style={{ color: "var(--color-text-muted)" }}
            >
              Credits Available
            </p>
            <p
              className="text-4xl font-bold mb-1"
              style={{ color: "var(--color-brand-orange)" }}
            >
              {data.user.credit_balance}
            </p>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              <span
                className="inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                style={{
                  background: "var(--color-brand-orange)",
                  color: "var(--color-text-inverse)",
                }}
              >
                {data.user.subscription_tier}
              </span>{" "}
              plan
            </p>
          </div>

          {/* Searches Card */}
          <div
            className="p-6"
            style={{
              background: "var(--color-surface-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <p
              className="text-sm font-medium mb-2"
              style={{ color: "var(--color-text-muted)" }}
            >
              Recent Searches
            </p>
            <p
              className="text-4xl font-bold mb-1"
              style={{ color: "var(--color-text)" }}
            >
              {data.recentSearches.length}
            </p>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              in the last period
            </p>
          </div>

          {/* Account Status Card */}
          <div
            className="p-6"
            style={{
              background: "var(--color-surface-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <p
              className="text-sm font-medium mb-2"
              style={{ color: "var(--color-text-muted)" }}
            >
              Account Status
            </p>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{
                  background: data.user.is_verified ? "#22c55e" : "#eab308",
                }}
              />
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--color-text)" }}
              >
                {data.user.is_verified ? "Verified" : "Unverified"}
              </p>
            </div>
            <p
              className="text-sm truncate"
              style={{ color: "var(--color-text-muted)" }}
            >
              {data.user.email}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
            style={{
              background: "var(--color-brand-orange)",
              color: "var(--color-text-inverse)",
              boxShadow: "var(--shadow-sm)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                "var(--color-brand-orange-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--color-brand-orange)")
            }
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
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            New Search
          </Link>
          <Link
            href="/results"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
            style={{
              background: "var(--color-surface-elevated)",
              color: "var(--color-text)",
              border: "1px solid var(--color-border)",
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            View Results
          </Link>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
            style={{
              background: "var(--color-surface-elevated)",
              color: "var(--color-text)",
              border: "1px solid var(--color-border)",
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
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Settings
          </Link>
        </div>

        {/* Recent Searches */}
        <div
          className="p-6"
          style={{
            background: "var(--color-surface-elevated)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--color-text)" }}
            >
              Recent Searches
            </h2>
            {data.recentSearches.length > 0 && (
              <Link
                href="/results"
                className="text-sm font-medium transition-colors"
                style={{ color: "var(--color-brand-orange)" }}
              >
                View all
              </Link>
            )}
          </div>

          {data.recentSearches.length === 0 ? (
            <div className="text-center py-12">
              <div
                className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: "var(--color-surface-secondary)" }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-text-muted)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <p
                className="font-medium mb-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                No searches yet
              </p>
              <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
                Run your first AI-powered candidate search
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-1 text-sm font-semibold"
                style={{ color: "var(--color-brand-orange)" }}
              >
                Start your first search
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {data.recentSearches.map((s) => (
                <Link
                  key={s.id}
                  href={`/results?search=${s.id}`}
                  className="flex items-center justify-between p-4 rounded-xl transition-all"
                  style={{
                    border: "1px solid transparent",
                    borderRadius: "var(--radius-md)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "var(--color-surface-secondary)";
                    e.currentTarget.style.borderColor = "var(--color-border)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                >
                  <div className="min-w-0 flex-1 mr-4">
                    <p
                      className="font-medium truncate"
                      style={{ color: "var(--color-text)" }}
                    >
                      {s.prompt?.slice(0, 80) || "Manual search"}
                      {(s.prompt?.length || 0) > 80 ? "..." : ""}
                    </p>
                    <p
                      className="text-sm mt-0.5"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {new Date(s.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      &middot; {s.total_approved} candidate
                      {s.total_approved !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <span
                    className="text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap"
                    style={{
                      background:
                        s.status === "completed"
                          ? "rgba(34,197,94,0.1)"
                          : "rgba(234,179,8,0.1)",
                      color:
                        s.status === "completed" ? "#16a34a" : "#ca8a04",
                    }}
                  >
                    {s.status === "completed" ? "Completed" : s.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
