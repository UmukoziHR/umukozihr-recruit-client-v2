"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { createElement } from "react";
import { api } from "@/lib/api";
import type { User, LoginRequest, RegisterRequest, OtpVerifyRequest } from "@/lib/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<{ message: string }>;
  verifyOtp: (data: OtpVerifyRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    if (!api.isAuthenticated) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api.getMe();
      setUser(me);
      setError(null);
    } catch {
      setUser(null);
      api.clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount, try to fetch user if token cookie exists
  useEffect(() => {
    const hasCookie =
      typeof document !== "undefined" &&
      document.cookie.includes("has_token=1");
    if (!hasCookie) {
      setLoading(false);
      return;
    }
    // If we have a cookie but no in-memory token, we can't recover without refresh token
    // The user will need to re-login
    if (!api.isAuthenticated) {
      setLoading(false);
      return;
    }
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (data: LoginRequest) => {
    setError(null);
    try {
      await api.login(data);
      const me = await api.getMe();
      setUser(me);
    } catch (err: unknown) {
      const msg = (err as { detail?: string })?.detail || "Login failed";
      setError(msg);
      throw err;
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    setError(null);
    try {
      return await api.register(data);
    } catch (err: unknown) {
      const msg = (err as { detail?: string })?.detail || "Registration failed";
      setError(msg);
      throw err;
    }
  }, []);

  const verifyOtp = useCallback(async (data: OtpVerifyRequest) => {
    setError(null);
    try {
      await api.verifyOtp(data);
      const me = await api.getMe();
      setUser(me);
    } catch (err: unknown) {
      const msg = (err as { detail?: string })?.detail || "Verification failed";
      setError(msg);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/auth";
    }
  }, []);

  return createElement(
    AuthContext.Provider,
    { value: { user, loading, isLoading: loading, error, login, register, verifyOtp, logout, refreshUser } },
    children
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
