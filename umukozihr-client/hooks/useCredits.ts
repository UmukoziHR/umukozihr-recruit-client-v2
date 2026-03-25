"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { CreditBalance } from "@/lib/types";

export interface UseCreditsReturn {
  credits: CreditBalance | null;
  balance: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useCredits(): UseCreditsReturn {
  const [credits, setCredits] = useState<CreditBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!api.isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      // Don't reset credits to null while loading - keep previous value visible
      setLoading(true);
      const balance = await api.getCreditBalance();
      setCredits(balance);
      setError(null);
    } catch (err: unknown) {
      // Don't clear credits on error - keep showing last known value
      setError((err as { detail?: string })?.detail || "Failed to load credits");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Don't show 0 while loading - show null (renders as "--" in UI)
  return { credits, balance: credits?.balance ?? (loading ? -1 : 0), loading, error, refresh };
}
