"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import type { CandidateResult, SearchManualRequest } from "@/lib/types";

type SSEEventType =
  | "progress"
  | "candidates_found"
  | "enriching"
  | "scoring"
  | "complete"
  | "error"
  | "clarification";

interface SSESearchState {
  isConnected: boolean;
  isSearching: boolean;
  step: string;
  progress: number;
  message: string;
  candidates: CandidateResult[];
  totalFound: number;
  error: string | null;
  searchId: string | null;
  clarificationQuestions: string[] | null;
}

export interface UseSSESearchReturn extends SSESearchState {
  startStream: (searchId: string) => void;
  startSearch: (input: string | SearchManualRequest, deepResearch?: boolean, history?: Array<{role: string; content: string}>) => Promise<void>;
  stopStream: () => void;
  reset: () => void;
}

const initialState: SSESearchState = {
  isConnected: false,
  isSearching: false,
  step: "",
  progress: 0,
  message: "",
  candidates: [],
  totalFound: 0,
  error: null,
  searchId: null,
  clarificationQuestions: null,
};

export function useSSESearch(): UseSSESearchReturn {
  const [state, setState] = useState<SSESearchState>(() => {
    // Restore active search from localStorage on mount (survives refresh/crash)
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("active_search");
      if (saved) {
        try {
          const { searchId, step } = JSON.parse(saved);
          if (searchId && step !== "complete" && step !== "error") {
            return { ...initialState, searchId, isSearching: true, step: "searching", progress: 0.3, message: "Resuming search..." };
          }
        } catch {}
      }
    }
    return initialState;
  });
  const eventSourceRef = useRef<EventSource | null>(null);

  // Resume polling for an active search on mount
  useEffect(() => {
    if (state.searchId && state.isSearching && state.step === "searching" && state.message === "Resuming search...") {
      resumePoll(state.searchId);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist active search to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (state.searchId && state.isSearching) {
      localStorage.setItem("active_search", JSON.stringify({ searchId: state.searchId, step: state.step }));
    } else if (state.step === "complete" || state.step === "error" || !state.isSearching) {
      localStorage.removeItem("active_search");
      // Store last completed search for results page
      if (state.searchId && state.step === "complete") {
        localStorage.setItem("last_search_id", state.searchId);
      }
    }
  }, [state.searchId, state.isSearching, state.step]);

  const resumePoll = async (searchId: string) => {
    // Resume polling for a search that was running when page closed
    for (let i = 0; i < 180; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      try {
        const status = await api.getSearch(searchId);
        if (status.status === "completed") {
          setState((s) => ({
            ...s, isSearching: false, step: "complete", progress: 1.0,
            message: `Found ${status.candidates?.length || 0} candidates`,
            candidates: status.candidates || [], totalFound: status.total_found || 0, searchId,
          }));
          return;
        }
        if (status.status === "failed") {
          setState((s) => ({ ...s, isSearching: false, error: "Search failed", step: "error" }));
          return;
        }
        const getStage = (poll: number) => {
          if (poll < 3) return { step: "searching", progress: 0.15 + poll * 0.05, msg: "Searching for candidates..." };
          if (poll < 6) return { step: "enriching", progress: 0.3 + (poll - 3) * 0.05, msg: "Enriching profiles from LinkedIn..." };
          if (poll < 14) return { step: "scoring", progress: 0.57 + (poll - 10) * 0.03, msg: "Scoring candidates..." };
          if (poll < 22) return { step: "willingness", progress: 0.77 + (poll - 18) * 0.02, msg: "Evaluating willingness to join..." };
          return { step: "willingness", progress: Math.min(0.89 + (poll - 26) * 0.005, 0.95), msg: "Finalizing rankings..." };
        };
        const stage = getStage(i);
        setState((s) => ({ ...s, step: stage.step, progress: stage.progress, message: stage.msg }));
      } catch {}
    }
  };

  const stopStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setState((s) => ({ ...s, isConnected: false, isSearching: false }));
  }, []);

  const startStream = useCallback(
    (searchId: string) => {
      stopStream();
      setState({ ...initialState, isConnected: true, isSearching: true, searchId });

      const url = `${api.getStreamUrl(searchId)}?token=${api.token || ""}`;
      const es = new EventSource(url);
      eventSourceRef.current = es;

      const handleEvent = (type: SSEEventType, data: Record<string, unknown>) => {
        setState((prev) => {
          switch (type) {
            case "progress":
              return {
                ...prev,
                step: (data.step as string) || prev.step,
                progress: (data.progress as number) ?? prev.progress,
                message: (data.message as string) || prev.message,
              };
            case "candidates_found":
              return {
                ...prev,
                totalFound: (data.total_found as number) ?? prev.totalFound,
                message: (data.message as string) || `Found ${data.total_found} candidates`,
              };
            case "enriching":
              return {
                ...prev,
                step: "enriching",
                progress: (data.progress as number) ?? prev.progress,
                message: (data.message as string) || "Enriching profiles...",
              };
            case "scoring":
              return {
                ...prev,
                step: "scoring",
                progress: (data.progress as number) ?? prev.progress,
                message: (data.message as string) || "Scoring candidates...",
              };
            case "complete":
              return {
                ...prev,
                step: "complete",
                progress: 100,
                message: "Search complete",
                candidates: (data.candidates as CandidateResult[]) || prev.candidates,
                isConnected: false,
                isSearching: false,
              };
            case "clarification":
              return {
                ...prev,
                step: "clarification",
                clarificationQuestions: (data.questions as string[]) || null,
                message: "Need more information",
                isConnected: false,
                isSearching: false,
              };
            case "error":
              return {
                ...prev,
                error: (data.error as string) || "Search failed",
                isConnected: false,
                isSearching: false,
              };
            default:
              return prev;
          }
        });
      };

      // Listen to named events
      const eventTypes: SSEEventType[] = [
        "progress",
        "candidates_found",
        "enriching",
        "scoring",
        "complete",
        "error",
        "clarification",
      ];

      for (const type of eventTypes) {
        es.addEventListener(type, (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            handleEvent(type, data);
            if (type === "complete" || type === "error") {
              es.close();
              eventSourceRef.current = null;
            }
          } catch {
            /* ignore parse errors */
          }
        });
      }

      // Fallback: generic message handler
      es.onmessage = (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type) {
            handleEvent(data.type as SSEEventType, data.data || data);
          }
        } catch {
          /* ignore */
        }
      };

      es.onerror = () => {
        setState((prev) => ({
          ...prev,
          isConnected: false,
          isSearching: false,
          error: prev.step === "complete" ? null : "Connection lost",
        }));
        es.close();
        eventSourceRef.current = null;
      };
    },
    [stopStream]
  );

  // Chat-first search: send prompt -> get instant response (clarification or search started) -> poll for results
  const startSearch = useCallback(
    async (input: string | SearchManualRequest, deepResearch = false, history?: Array<{role: string; content: string}>) => {
      setState((s) => ({ ...s, isSearching: false, error: null, step: "thinking", progress: 0, message: "" }));
      try {
        let res: any;
        // Generate session_id for thread isolation (persist in localStorage)
        let sessionId = typeof window !== "undefined" ? localStorage.getItem("chat_session_id") : null;
        if (!sessionId) {
          sessionId = `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          if (typeof window !== "undefined") localStorage.setItem("chat_session_id", sessionId);
        }
        if (typeof input === "string") {
          res = await api.searchByPrompt({ prompt: input, use_deep_research: deepResearch, session_id: sessionId, history: history || [] });
          if (typeof window !== "undefined" && res?.session_id) {
            localStorage.setItem("chat_session_id", res.session_id);
          }
        } else {
          res = await api.searchManual({ ...input, use_deep_research: deepResearch });
        }

        // Chat agent says we need clarification
        if (res.needs_clarification) {
          setState((s) => ({ ...s, isSearching: false, step: "clarification", message: res.message || "Could you provide more details?", clarificationQuestions: res.missing_fields }));
          return;
        }

        // Search launched in background - poll for results
        const searchId = res.id;
        if (!searchId) {
          setState((s) => ({ ...s, isSearching: false, error: "No search ID returned", step: "error" }));
          return;
        }

        setState((s) => ({ ...s, isSearching: true, searchId, step: "searching", progress: 0.15, message: res.message || "Searching for candidates..." }));

        // Poll every 5 seconds for up to 15 minutes
        for (let i = 0; i < 180; i++) {
          await new Promise((r) => setTimeout(r, 5000));
          try {
            const status = await api.getSearch(searchId);
            if (status.status === "completed") {
              setState((s) => ({
                ...s, isSearching: false, step: "complete", progress: 1.0,
                message: `Found ${status.candidates?.length || status.total_approved || 0} candidates`,
                candidates: status.candidates || [], totalFound: status.total_found || 0, searchId,
              }));
              return;
            }
            if (status.status === "failed") {
              setState((s) => ({ ...s, isSearching: false, error: "Search failed. Please try again.", step: "error" }));
              return;
            }
            // Still running - simulate realistic progress through workflow stages
            // Map poll count to realistic workflow stages (search takes 1-3 min)
            const getStage = (poll: number) => {
              if (poll < 3)  return { step: "searching", progress: 0.15 + poll * 0.05, msg: "Searching for candidates across the web..." };
              if (poll < 6)  return { step: "enriching", progress: 0.3 + (poll - 3) * 0.05, msg: "Enriching profiles from LinkedIn..." };
              if (poll < 10) return { step: "enriching", progress: 0.45 + (poll - 6) * 0.03, msg: "Scraping LinkedIn profiles for detailed data..." };
              if (poll < 14) return { step: "scoring", progress: 0.57 + (poll - 10) * 0.03, msg: "Scoring candidates against your requirements..." };
              if (poll < 18) return { step: "scoring", progress: 0.69 + (poll - 14) * 0.02, msg: "AI is evaluating each candidate's fit..." };
              if (poll < 22) return { step: "willingness", progress: 0.77 + (poll - 18) * 0.02, msg: "Evaluating candidates' willingness to join your company..." };
              if (poll < 26) return { step: "willingness", progress: 0.85 + (poll - 22) * 0.01, msg: "Analyzing career stage, compensation fit, and culture match..." };
              return { step: "willingness", progress: Math.min(0.89 + (poll - 26) * 0.005, 0.95), msg: "Almost done, finalizing candidate rankings..." };
            };
            const stage = getStage(i);
            setState((s) => ({ ...s, step: stage.step, progress: stage.progress, message: stage.msg }));
          } catch {
            // Poll error - keep waiting
          }
        }

        // Timeout
        setState((s) => ({ ...s, isSearching: false, step: "complete", progress: 1.0, message: "Search is taking longer than expected. Check back on the Results page.", searchId }));
      } catch (err: unknown) {
        const raw = (err as any)?.detail || (err as any)?.message || "Something went wrong";
        const msg = typeof raw === "string" ? raw : JSON.stringify(raw);
        setState((s) => ({ ...s, isSearching: false, error: msg, step: "error" }));
      }
    },
    []
  );

  const reset = useCallback(() => {
    stopStream();
    setState(initialState);
    // Clear session so next search gets a fresh thread
    if (typeof window !== "undefined") localStorage.removeItem("chat_session_id");
  }, [stopStream]);

  return { ...state, startStream, startSearch, stopStream, reset };
}
