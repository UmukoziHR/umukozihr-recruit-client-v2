"use client";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const PLANS = [
  {
    key: "starter",
    name: "Starter",
    price: 0,
    credits: 40,
    period: "",
    features: [
      "40 credits (one-time)",
      "Standard search",
      "LinkedIn enrichment",
      "Willingness scoring",
      "Basic candidate profiles",
    ],
    popular: false,
  },
  {
    key: "growth",
    name: "Growth",
    price: 29,
    credits: 200,
    period: "/month",
    features: [
      "200 credits/month",
      "Deep research search",
      "Priority enrichment",
      "Full willingness analysis",
      "Email support",
      "Detailed candidate reports",
    ],
    popular: true,
  },
  {
    key: "scale",
    name: "Scale",
    price: 99,
    credits: 1000,
    period: "/month",
    features: [
      "1,000 credits/month",
      "Everything in Growth",
      "Bulk searches",
      "API access",
      "Dedicated support",
      "Custom integrations",
      "Priority processing",
    ],
    popular: false,
  },
];

export default function PaymentPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const router = useRouter();

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

  const subscribe = async (plan: string) => {
    if (plan === "starter") return;
    setSubscribing(plan);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("/api/backend/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else if (data.tier) {
        toast.success(
          `Subscribed to ${plan}! ${data.credits_added} credits added.`
        );
        router.push("/dashboard");
      } else {
        toast.error(data.detail || "Subscription failed");
      }
    } catch {
      toast.error("Something went wrong");
    }
    setSubscribing(null);
  };

  if (loading) {
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

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{
              background: "rgba(255,107,53,0.08)",
              color: "var(--color-brand-orange)",
              border: "1px solid rgba(255,107,53,0.2)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            PRICING
          </div>
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3"
            style={{ color: "var(--color-text)" }}
          >
            Choose Your Plan
          </h1>
          <p
            className="max-w-lg mx-auto text-base"
            style={{ color: "var(--color-text-muted)" }}
          >
            Get more credits to power your AI-driven recruiting. Every search
            finds and scores real candidates from across the web.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => {
            const isCurrent = user?.subscription_tier === plan.key;
            const isPopular = plan.popular;

            return (
              <div
                key={plan.key}
                className="relative flex flex-col"
                style={{
                  background: "var(--color-surface-elevated)",
                  border: isPopular
                    ? "2px solid var(--color-brand-orange)"
                    : "1px solid var(--color-border)",
                  borderRadius: "var(--radius-xl)",
                  boxShadow: isPopular ? "var(--shadow-lg)" : "var(--shadow-sm)",
                  padding: isPopular ? "24px 16px" : "20px 16px",
                  transform: isPopular ? "scale(1.04)" : "none",
                  zIndex: isPopular ? 1 : 0,
                }}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div
                    className="absolute left-1/2 flex items-center gap-1 px-4 py-1.5 text-xs font-bold rounded-full whitespace-nowrap"
                    style={{
                      top: "-14px",
                      transform: "translateX(-50%)",
                      background: "var(--color-brand-orange)",
                      color: "var(--color-text-inverse)",
                      boxShadow: "0 4px 12px rgba(255,107,53,0.3)",
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      stroke="none"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    MOST POPULAR
                  </div>
                )}

                {/* Plan Name */}
                <h3
                  className="text-lg font-bold mb-4"
                  style={{ color: "var(--color-text)" }}
                >
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="mb-1">
                  <span
                    className="text-4xl font-extrabold"
                    style={{ color: "var(--color-text)" }}
                  >
                    ${plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className="text-base ml-1"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>

                {/* Credits Highlight */}
                <p
                  className="text-sm font-semibold mb-6"
                  style={{ color: "var(--color-brand-orange)" }}
                >
                  {plan.credits.toLocaleString()} credits
                  {plan.price > 0 ? "/month" : ""}
                </p>

                {/* Divider */}
                <div
                  className="h-px w-full mb-6"
                  style={{ background: "var(--color-border)" }}
                />

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-3 text-sm"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0 mt-0.5"
                        style={{ stroke: "#22c55e" }}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => subscribe(plan.key)}
                  disabled={
                    isCurrent ||
                    subscribing === plan.key ||
                    plan.key === "starter"
                  }
                  className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all disabled:cursor-default"
                  style={{
                    background: isCurrent
                      ? "var(--color-surface-secondary)"
                      : isPopular
                        ? "var(--color-brand-orange)"
                        : "var(--color-surface-secondary)",
                    color: isCurrent
                      ? "var(--color-text-muted)"
                      : isPopular
                        ? "var(--color-text-inverse)"
                        : "var(--color-text)",
                    border: isCurrent
                      ? "1px solid var(--color-border)"
                      : isPopular
                        ? "1px solid var(--color-brand-orange)"
                        : "1px solid var(--color-border)",
                    opacity:
                      isCurrent || subscribing === plan.key ? 0.6 : 1,
                    boxShadow: isPopular && !isCurrent
                      ? "0 4px 12px rgba(255,107,53,0.25)"
                      : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent && plan.key !== "starter") {
                      if (isPopular) {
                        e.currentTarget.style.background =
                          "var(--color-brand-orange-hover)";
                      } else {
                        e.currentTarget.style.background =
                          "var(--color-brand-orange)";
                        e.currentTarget.style.color =
                          "var(--color-text-inverse)";
                        e.currentTarget.style.borderColor =
                          "var(--color-brand-orange)";
                      }
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent && plan.key !== "starter") {
                      if (isPopular) {
                        e.currentTarget.style.background =
                          "var(--color-brand-orange)";
                      } else {
                        e.currentTarget.style.background =
                          "var(--color-surface-secondary)";
                        e.currentTarget.style.color = "var(--color-text)";
                        e.currentTarget.style.borderColor =
                          "var(--color-border)";
                      }
                    }
                  }}
                >
                  {isCurrent
                    ? "Current Plan"
                    : subscribing === plan.key
                      ? "Processing..."
                      : plan.key === "starter"
                        ? "Free Forever"
                        : "Subscribe"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <p
          className="text-center text-sm mt-8"
          style={{ color: "var(--color-text-muted)" }}
        >
          All plans include access to AI-powered candidate search. Payments
          processed securely via Paystack.
        </p>
      </div>
    </AppShell>
  );
}
