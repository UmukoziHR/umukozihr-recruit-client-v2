import type {
  TokenResponse,
  LoginRequest,
  RegisterRequest,
  OtpVerifyRequest,
  PasswordResetConfirm,
  User,
  UserUpdate,
  CreditBalance,
  CreditHistory,
  SearchPromptRequest,
  SearchManualRequest,
  SearchResponse,
  SubscribeRequest,
  SubscriptionResponse,
  AdminStats,
  AdminUser,
  AdminCreditGrant,
  ApiError,
} from "./types";

// Use the Next.js proxy to avoid CORS issues
const BASE_URL = typeof window !== "undefined" ? "/api/backend" : (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000") + "/api/v1";

class ApiClient {
  private accessToken: string | null = null;
  private refreshTokenValue: string | null = null;
  private refreshPromise: Promise<void> | null = null;

  // ── Token management ──

  constructor() {
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("access_token");
      this.refreshTokenValue = localStorage.getItem("refresh_token");
    }
  }

  get isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshTokenValue = refresh;
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      document.cookie = `has_token=1; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshTokenValue = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      document.cookie = "has_token=; path=/; max-age=0";
    }
  }

  // ── Core fetch ──

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (res.status === 401 && this.refreshTokenValue && path !== "/auth/refresh") {
      await this.doRefresh();
      headers["Authorization"] = `Bearer ${this.accessToken}`;
      const retry = await fetch(`${BASE_URL}${path}`, { ...options, headers });
      if (!retry.ok) throw await this.parseError(retry);
      return retry.status === 204 ? (undefined as T) : retry.json();
    }

    if (!res.ok) throw await this.parseError(res);
    return res.status === 204 ? (undefined as T) : res.json();
  }

  private async parseError(res: Response): Promise<ApiError> {
    try {
      const body = await res.json();
      return { detail: body.detail || body.message || "Request failed" };
    } catch {
      return { detail: res.statusText || "Request failed" };
    }
  }

  private async doRefresh(): Promise<void> {
    if (this.refreshPromise) return this.refreshPromise;
    this.refreshPromise = (async () => {
      try {
        const tokens = await this.request<TokenResponse>("/auth/refresh", {
          method: "POST",
          body: JSON.stringify({ refresh_token: this.refreshTokenValue }),
        });
        this.setTokens(tokens.access_token, tokens.refresh_token);
      } catch {
        this.clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/auth";
        }
      } finally {
        this.refreshPromise = null;
      }
    })();
    return this.refreshPromise;
  }

  // ── Auth ──

  async login(data: LoginRequest): Promise<TokenResponse> {
    const tokens = await this.request<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    this.setTokens(tokens.access_token, tokens.refresh_token);
    return tokens;
  }

  async register(data: RegisterRequest): Promise<{ message: string }> {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async verifyOtp(data: OtpVerifyRequest): Promise<TokenResponse> {
    const tokens = await this.request<TokenResponse>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(data),
    });
    this.setTokens(tokens.access_token, tokens.refresh_token);
    return tokens;
  }

  async resendOtp(email: string): Promise<{ message: string }> {
    return this.request("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(data: PasswordResetConfirm): Promise<{ message: string }> {
    return this.request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async refreshToken(): Promise<TokenResponse> {
    const tokens = await this.request<TokenResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: this.refreshTokenValue }),
    });
    this.setTokens(tokens.access_token, tokens.refresh_token);
    return tokens;
  }

  async logout(): Promise<void> {
    try {
      await this.request("/auth/logout", { method: "POST" });
    } finally {
      this.clearTokens();
    }
  }

  // ── User ──

  async getMe(): Promise<User> {
    return this.request("/users/me");
  }

  async updateMe(data: UserUpdate): Promise<User> {
    return this.request("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return this.request("/users/me/password", {
      method: "PUT",
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  }

  // ── Credits ──

  async getCreditBalance(): Promise<CreditBalance> {
    return this.request("/credits/balance");
  }

  async getCreditHistory(page = 1, pageSize = 20): Promise<CreditHistory> {
    return this.request(`/credits/history?page=${page}&page_size=${pageSize}`);
  }

  // ── Search ──

  async searchByPrompt(data: SearchPromptRequest): Promise<SearchResponse> {
    return this.request("/search/prompt", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async searchManual(data: SearchManualRequest): Promise<SearchResponse> {
    return this.request("/search/manual", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async answerClarification(searchId: string, answers: Record<string, string>): Promise<SearchResponse> {
    return this.request(`/search/${searchId}/clarify`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
  }

  async getSearch(id: string): Promise<SearchResponse> {
    return this.request(`/search/${id}`);
  }

  async listSearches(page = 1, pageSize = 20): Promise<SearchResponse[]> {
    const res = await this.request<{ searches: SearchResponse[]; total: number } | SearchResponse[]>(
      `/search?page=${page}&per_page=${pageSize}`
    );
    return Array.isArray(res) ? res : res.searches;
  }

  async chatOnResults(searchId: string, message: string): Promise<{ message: string }> {
    return this.request(`/search/${searchId}/chat`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  }

  async getConversation(searchId: string): Promise<{ messages: Array<{ role: string; content: string }> }> {
    return this.request(`/search/${searchId}/conversation`);
  }

  getStreamUrl(searchId: string): string {
    return `${BASE_URL}/search/${searchId}/stream`;
  }

  getStreamHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }
    return headers;
  }

  get token(): string | null {
    return this.accessToken;
  }

  // ── Subscription ──

  async subscribe(data: SubscribeRequest): Promise<SubscriptionResponse> {
    return this.request("/subscription/subscribe", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getSubscription(): Promise<SubscriptionResponse> {
    return this.request("/subscription");
  }

  // ── Admin ──

  async adminGetStats(): Promise<AdminStats> {
    return this.request("/admin/stats");
  }

  async adminListUsers(page = 1, pageSize = 20): Promise<{ users: AdminUser[]; total: number }> {
    return this.request(`/admin/users?page=${page}&page_size=${pageSize}`);
  }

  async adminGrantCredits(userId: string, data: AdminCreditGrant): Promise<{ message: string }> {
    return this.request(`/admin/users/${userId}/credits`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async adminResetPassword(userId: string): Promise<{ message: string }> {
    return this.request(`/admin/users/${userId}/reset-password`, {
      method: "POST",
    });
  }

  async adminToggleActive(userId: string): Promise<{ message: string }> {
    return this.request(`/admin/users/${userId}/toggle-active`, {
      method: "POST",
    });
  }
}

export const api = new ApiClient();
