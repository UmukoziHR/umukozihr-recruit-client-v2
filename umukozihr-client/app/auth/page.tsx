"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { VerificationForm } from "@/components/auth/VerificationForm";
import { ForgotPassword } from "@/components/auth/ForgotPassword";
import { cn } from "@/lib/utils";

type View = "signin" | "signup" | "verification" | "forgot";

export default function AuthPage() {
  const [view, setView] = useState<View>("signin");
  const [verificationEmail, setVerificationEmail] = useState("");
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !isLoading) {
      router.replace("/search");
    }
  }, [user, isLoading, router]);

  const activeTab = view === "signin" || view === "forgot" ? "signin" : "signup";

  const handleVerificationNeeded = (email: string) => {
    setVerificationEmail(email);
    setView("verification");
  };

  const handleBackToSignIn = () => {
    setView("signin");
  };

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "var(--color-surface-secondary)" }}
      >
        <div
          className="h-8 w-8 animate-spin rounded-full"
          style={{
            border: "4px solid var(--color-border-light)",
            borderTopColor: "var(--color-brand-orange)",
          }}
        />
      </div>
    );
  }

  if (user) return null;

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "var(--color-surface-secondary)" }}
    >
      <Toaster position="top-center" richColors closeButton />

      {/* Left branding panel -- hidden on mobile */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden items-center justify-center"
        style={{ background: "var(--color-brand-teal)" }}
      >
        {/* Decorative circles */}
        <div
          className="absolute rounded-full"
          style={{
            top: "-96px",
            left: "-96px",
            height: "384px",
            width: "384px",
            background: "rgba(255,255,255,0.05)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            bottom: "-128px",
            right: "-128px",
            height: "500px",
            width: "500px",
            background: "rgba(255,255,255,0.05)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: "33%",
            right: "25%",
            height: "192px",
            width: "192px",
            background: "rgba(255,255,255,0.04)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            bottom: "20%",
            left: "10%",
            height: "120px",
            width: "120px",
            background: "rgba(255,255,255,0.03)",
          }}
        />

        <div className="relative z-10 max-w-md px-8 text-center">
          {/* Logo icon */}
          <div className="mb-8 flex justify-center">
            <img
              src="/umukozi-icon.png"
              alt="UmukoziHR"
              className="rounded-full object-contain"
              style={{
                height: "80px",
                width: "80px",
                background: "rgba(255,255,255,0.95)",
                padding: "8px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              }}
            />
          </div>

          <h1
            className="text-3xl font-bold mb-3"
            style={{ color: "var(--color-text-inverse)" }}
          >
            UmukoziHR Recruit
          </h1>
          <p
            className="text-lg leading-relaxed"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            AI-powered talent sourcing that finds the best candidates for your
            roles across the web.
          </p>

          {/* Stats row */}
          <div
            className="mt-10 grid grid-cols-3 gap-6"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: "32px",
            }}
          >
            {[
              { value: "10x", label: "Faster sourcing" },
              { value: "95%", label: "Match accuracy" },
              { value: "50+", label: "Data sources" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{ color: "var(--color-brand-orange)" }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-xs mt-1"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right auth forms panel */}
      <div className="flex w-full lg:w-1/2 xl:w-[45%] items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-[440px]">
          {/* Mobile logo -- visible only on small screens */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <img
              src="/umukozi-icon.png"
              alt="UmukoziHR"
              className="rounded-full object-contain"
              style={{ height: "44px", width: "44px", background: "var(--color-surface-elevated)", padding: "4px" }}
            />
            <span
              className="text-xl font-bold"
              style={{ color: "var(--color-text)" }}
            >
              UmukoziHR
            </span>
          </div>

          {/* Auth card */}
          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{
              background: "var(--color-surface-elevated)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            {/* Tab switcher -- only for signin / signup views */}
            {(view === "signin" || view === "signup") && (
              <div className="mb-6">
                <div
                  className="flex p-1"
                  style={{
                    borderRadius: "var(--radius-md)",
                    background: "var(--color-surface-secondary)",
                  }}
                >
                  {(["signin", "signup"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setView(tab)}
                      className="flex-1 py-2.5 text-sm font-medium transition-all"
                      style={{
                        borderRadius: "var(--radius-sm)",
                        background:
                          activeTab === tab
                            ? "var(--color-surface-elevated)"
                            : "transparent",
                        color:
                          activeTab === tab
                            ? "var(--color-text)"
                            : "var(--color-text-muted)",
                        boxShadow:
                          activeTab === tab ? "var(--shadow-sm)" : "none",
                      }}
                    >
                      {tab === "signin" ? "Sign In" : "Sign Up"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form views */}
            {view === "signin" && (
              <SignInForm onForgotPassword={() => setView("forgot")} />
            )}

            {view === "signup" && (
              <SignUpForm onVerificationNeeded={handleVerificationNeeded} />
            )}

            {view === "verification" && (
              <VerificationForm
                email={verificationEmail}
                onBack={handleBackToSignIn}
              />
            )}

            {view === "forgot" && (
              <ForgotPassword onBack={handleBackToSignIn} />
            )}
          </div>

          {/* Legal footer */}
          <p
            className="mt-6 text-center text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            By continuing, you agree to our{" "}
            <a href="/legal/terms" target="_blank" rel="noopener noreferrer" className="underline font-medium" style={{ color: "var(--color-brand-orange)" }}>Terms of Service</a>{" "}and{" "}
            <a href="/legal/privacy" target="_blank" rel="noopener noreferrer" className="underline font-medium" style={{ color: "var(--color-brand-orange)" }}>Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
