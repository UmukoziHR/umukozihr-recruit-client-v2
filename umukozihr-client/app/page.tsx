"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (api.isAuthenticated) {
      router.replace("/search");
    } else {
      router.replace("/auth");
    }
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "var(--color-brand-orange)", borderTopColor: "transparent" }}
        />
        <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
          Loading...
        </p>
      </div>
    </div>
  );
}
