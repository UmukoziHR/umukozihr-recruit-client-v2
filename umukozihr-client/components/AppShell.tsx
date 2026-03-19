"use client";
import { Navbar } from "@/components/Navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-surface-secondary)" }}>
      <Navbar />
      <main className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 py-6 lg:py-8">{children}</main>
    </div>
  );
}
