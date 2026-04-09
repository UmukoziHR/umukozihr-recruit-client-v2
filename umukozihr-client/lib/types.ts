// === Auth ===
export interface LoginRequest { email: string; password: string }
export interface RegisterRequest { email: string; password: string; full_name: string; company?: string; job_title?: string }
export interface TokenResponse { access_token: string; refresh_token: string; token_type: string; expires_in: number }
export interface OtpVerifyRequest { email: string; code: string }
export interface PasswordResetConfirm { email: string; code: string; new_password: string }

// === User ===
export interface User {
  id: string; email: string; full_name: string; company: string; job_title: string;
  company_profile: CompanyProfile | null; account_type: "company" | "agency";
  is_active: boolean; is_verified: boolean; is_admin: boolean;
  subscription_tier: string; credit_balance: number; created_at: string; updated_at: string;
}
export interface UserUpdate { full_name?: string; company?: string; job_title?: string; company_profile?: CompanyProfile; account_type?: string }
export interface CompanyProfile {
  company_name?: string; industry?: string; stage?: string; team_size?: number;
  compensation_philosophy?: string; remote_policy?: string; mission?: string; website?: string;
}

// === Credits ===
export interface CreditBalance { balance: number; total_earned: number; total_spent: number }
export interface CreditTransaction { id: string; action: string; amount: number; balance_after: number; description: string; created_at: string }
export interface CreditHistory { transactions: CreditTransaction[]; total: number }

// === Search ===
export interface SearchPromptRequest { prompt: string; use_deep_research?: boolean; session_id?: string; history?: Array<{role: string; content: string}> }
export interface SearchManualRequest {
  job_titles: string[]; skills?: string[]; locations: string[];
  experience_years_min?: number; experience_years_max?: number;
  education_levels?: string[]; industry?: string[]; use_deep_research?: boolean;
}

export interface CandidateResult {
  [key: string]: unknown;
  id: string; rank: number; full_name: string; headline: string; linkedin_url: string;
  location: string; current_title: string; current_company: string;
  skills: string[]; experience: Record<string, unknown>[]; education: Record<string, unknown>[];
  match_score: number; title_score: number; skills_score: number; experience_score: number; location_score: number;
  willingness_score: number | null; willingness_likelihood: string | null;
  willingness_reasoning: string[] | null; willingness_red_flags: string[] | null; willingness_green_flags: string[] | null;
  matched_skills: string[]; missing_skills: string[];
  scoring_explanation: string; is_open_to_work: boolean; has_founder_experience: boolean;
  photo_url?: string | null;
  emails?: string[]; phones?: string[]; websites?: string[];
  total_score?: number; name?: string; title?: string; company?: string; score?: number;
  experiences?: Record<string, unknown>[]; green_flags?: string[]; red_flags?: string[];
  willingness_reasons?: string[]; profile_url?: string; avatar_url?: string;
  match_reasons?: string[]; summary?: string;
}

export interface SearchResponse {
  id: string; status: string; prompt?: string; criteria?: Record<string, unknown>;
  requirements?: Record<string, unknown>; total_found: number; total_approved: number;
  credits_used: number; execution_time_ms?: number;
  candidates: CandidateResult[]; created_at: string; completed_at?: string;
  search_time?: number; session_id?: string;
}

export interface ClarificationResponse { needs_clarification: boolean; missing_fields: string[]; message: string }
export interface SearchListResponse { searches: SearchResponse[]; total: number }

// === SSE Events ===
export interface SSEProgressEvent { step: string; progress: number; message: string }
export interface SSECompleteEvent {
  search_id: string; total_found: number; total_approved: number;
  execution_time_ms: number; credits_used: number;
  candidates: Array<{
    rank: number; full_name: string; headline: string; linkedin_url: string;
    location: string; current_title: string; current_company: string; skills: string[];
    match_score: number; total_score: number; willingness_score: number | null;
    willingness_likelihood: string | null; is_open_to_work: boolean;
  }>;
}

// === Subscription ===
export interface SubscribeRequest { plan: string }
export interface SubscriptionResponse { id: string; tier: string; status: string; price_cents: number; currency: string; start_date: string; paid_until?: string; is_auto_renew: boolean }

// === Admin ===
export interface AdminStats {
  total_users: number; active_users: number; verified_users: number;
  total_searches: number; searches_today: number; searches_this_week: number; searches_this_month: number;
  total_revenue_cents: number; total_credits_issued: number; total_credits_consumed: number;
  plans_breakdown: Record<string, number>;
}
export interface AdminUser {
  id: string; email: string; full_name: string; company: string;
  is_active: boolean; is_verified: boolean; is_admin: boolean;
  subscription_tier: string; credit_balance: number; total_searches: number;
  created_at: string; last_search_at?: string;
}
export interface AdminCreditGrant { amount: number; reason: string }

export interface ApiError { detail: string }

// === Email Drafting ===
export interface EmailDraft { subject: string; body: string }
export interface EmailDraftResponse { formal: EmailDraft; casual: EmailDraft }

// === Chat Conversations ===
export interface ChatConversation {
  id: string; title: string; created_at: string; updated_at: string;
  session_id?: string | null; search_id?: string | null; last_message?: string;
}
export interface ChatMessageItem { role: string; content: string; created_at: string }
export interface ChatConversationDetail {
  conversation_id: string; title: string; messages: ChatMessageItem[];
  session_id?: string | null; search_id?: string | null;
}
