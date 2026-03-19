"use client";
import { Navbar } from "@/components/Navbar";

export function AppShell({ children, flush }: { children: React.ReactNode; flush?: boolean }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "var(--color-surface-secondary)" }}>
      <Navbar />
      {flush ? (
        <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
      ) : (
        <main className="flex-1 min-h-0 overflow-y-auto mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8 py-6 lg:py-8">{children}</main>
      )}
    </div>
  );
}
