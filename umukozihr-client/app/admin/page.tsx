"use client";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Users, Search, CreditCard, TrendingUp, Shield, RotateCcw, Coins, ToggleLeft } from "lucide-react";

interface Stats {
  total_users: number; active_users: number; verified_users: number; total_searches: number;
  searches_today: number; searches_this_week: number; searches_this_month: number;
  total_revenue_cents: number; total_credits_issued: number; total_credits_consumed: number;
  plans_breakdown: Record<string, number>;
}
interface AdminUser {
  id: string; email: string; full_name: string; company: string; is_active: boolean;
  is_verified: boolean; is_admin: boolean; subscription_tier: string; credit_balance: number;
  total_searches: number; created_at: string;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<"overview" | "users">("overview");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("access_token")}`, "Content-Type": "application/json" });

  const load = async () => {
    try {
      const [s, u] = await Promise.all([
        fetch("/api/backend/admin/stats", { headers: headers() }).then(r => { if (r.status === 403) throw new Error("forbidden"); return r.json(); }),
        fetch(`/api/backend/admin/users?page=${page}&search=${search}`, { headers: headers() }).then(r => r.json()),
      ]);
      setStats(s); setUsers(u.users || []); setUsersTotal(u.total || 0);
    } catch (e: any) {
      if (e.message === "forbidden") { toast.error("Admin access required"); router.push("/dashboard"); }
    }
    setLoading(false);
  };

  useEffect(() => { if (!localStorage.getItem("access_token")) { router.push("/auth"); return; } load(); }, [page, search]);

  const grantCredits = async (userId: string) => {
    const amount = prompt("Credits to grant:"); const reason = prompt("Reason:");
    if (!amount || !reason) return;
    const res = await fetch(`/api/backend/admin/users/${userId}/credits`, { method: "POST", headers: headers(), body: JSON.stringify({ amount: parseInt(amount), reason }) });
    if (res.ok) { toast.success("Credits granted"); load(); } else toast.error("Failed");
  };
  const resetPassword = async (userId: string) => {
    if (!confirm("Reset password?")) return;
    const res = await fetch(`/api/backend/admin/users/${userId}/reset-password`, { method: "POST", headers: headers() });
    if (res.ok) { const d = await res.json(); toast.success(`Temp: ${d.temporary_password}`); } else toast.error("Failed");
  };
  const toggleActive = async (userId: string) => {
    const res = await fetch(`/api/backend/admin/users/${userId}/toggle-active`, { method: "POST", headers: headers() });
    if (res.ok) { toast.success("Toggled"); load(); } else toast.error("Failed");
  };

  const Spinner = () => <div className="flex items-center justify-center min-h-[60vh]"><div className="h-8 w-8 animate-spin rounded-full" style={{ border: "3px solid var(--color-border)", borderTopColor: "var(--color-brand-orange)" }} /></div>;

  if (loading) return <AppShell><Spinner /></AppShell>;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: "var(--color-brand-teal)", color: "#fff" }}><Shield className="w-5 h-5" /></div>
          <div><h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>Admin Dashboard</h1><p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Platform analytics and user management</p></div>
        </div>

        <div className="flex gap-2">
          {(["overview", "users"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all capitalize" style={{ background: tab === t ? "var(--color-brand-orange)" : "var(--color-surface-elevated)", color: tab === t ? "#fff" : "var(--color-text-secondary)", border: tab === t ? "none" : "1px solid var(--color-border)" }}>{t === "users" ? `Users (${usersTotal})` : t}</button>
          ))}
        </div>

        {tab === "overview" && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Users", value: stats.total_users, icon: Users, accent: "var(--color-brand-teal)" },
                { label: "Searches Today", value: stats.searches_today, icon: Search, accent: "var(--color-brand-orange)" },
                { label: "This Month", value: stats.searches_this_month, icon: TrendingUp, accent: "#10b981" },
                { label: "Revenue", value: `$${(stats.total_revenue_cents / 100).toFixed(0)}`, icon: CreditCard, accent: "#8b5cf6" },
                { label: "Active Users", value: stats.active_users, icon: Users, accent: "#3b82f6" },
                { label: "All Searches", value: stats.total_searches, icon: Search, accent: "#f59e0b" },
                { label: "Credits Issued", value: stats.total_credits_issued, icon: Coins, accent: "#10b981" },
                { label: "Credits Used", value: stats.total_credits_consumed, icon: Coins, accent: "#ef4444" },
              ].map(s => (
                <div key={s.label} className="p-5 rounded-xl transition-all" style={{ background: "var(--color-surface-elevated)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                  <div className="flex items-center justify-between mb-3"><span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>{s.label}</span><s.icon className="w-4 h-4" style={{ color: s.accent }} /></div>
                  <p className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>{s.value}</p>
                </div>
              ))}
            </div>
            {stats.plans_breakdown && Object.keys(stats.plans_breakdown).length > 0 && (
              <div className="p-6 rounded-xl" style={{ background: "var(--color-surface-elevated)", border: "1px solid var(--color-border)" }}>
                <h3 className="font-semibold mb-4" style={{ color: "var(--color-text)" }}>Plans</h3>
                <div className="flex gap-8">{Object.entries(stats.plans_breakdown).map(([plan, count]) => (
                  <div key={plan} className="text-center"><p className="text-3xl font-bold" style={{ color: "var(--color-brand-orange)" }}>{count as number}</p><p className="text-sm capitalize" style={{ color: "var(--color-text-muted)" }}>{plan}</p></div>
                ))}</div>
              </div>
            )}
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-4">
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search users..." className="w-full h-11 px-4 rounded-lg text-sm outline-none transition-all" style={{ background: "var(--color-surface-elevated)", border: "1px solid var(--color-border)", color: "var(--color-text)" }} />
            <div className="rounded-xl overflow-hidden" style={{ background: "var(--color-surface-elevated)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
              <table className="w-full text-sm">
                <thead><tr style={{ borderBottom: "2px solid var(--color-border)" }}>
                  {["User", "Plan", "Credits", "Searches", "Status", "Actions"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>{h}</th>)}
                </tr></thead>
                <tbody>{users.map(u => (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--color-border-light)" }}>
                    <td className="px-4 py-3"><p className="font-medium" style={{ color: "var(--color-text)" }}>{u.full_name}</p><p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{u.email}</p></td>
                    <td className="px-4 py-3 capitalize" style={{ color: "var(--color-text-secondary)" }}>{u.subscription_tier}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: "var(--color-brand-orange)" }}>{u.credit_balance}</td>
                    <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>{u.total_searches}</td>
                    <td className="px-4 py-3"><span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: u.is_active ? "#dcfce7" : "#fee2e2", color: u.is_active ? "#166534" : "#991b1b" }}>{u.is_active ? "Active" : "Inactive"}</span></td>
                    <td className="px-4 py-3"><div className="flex gap-1.5">
                      <button onClick={() => grantCredits(u.id)} className="p-1.5 rounded-md hover:opacity-70" style={{ color: "var(--color-brand-orange)" }}><Coins className="w-4 h-4" /></button>
                      <button onClick={() => resetPassword(u.id)} className="p-1.5 rounded-md hover:opacity-70" style={{ color: "var(--color-text-muted)" }}><RotateCcw className="w-4 h-4" /></button>
                      <button onClick={() => toggleActive(u.id)} className="p-1.5 rounded-md hover:opacity-70" style={{ color: "var(--color-text-muted)" }}><ToggleLeft className="w-4 h-4" /></button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>{usersTotal} total</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40" style={{ background: "var(--color-surface-elevated)", border: "1px solid var(--color-border)" }}>Prev</button>
                <span className="px-3 py-2 text-sm" style={{ color: "var(--color-text-muted)" }}>Page {page}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={users.length < 20} className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40" style={{ background: "var(--color-surface-elevated)", border: "1px solid var(--color-border)" }}>Next</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
