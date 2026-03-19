"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface VerificationFormProps {
  email: string;
  onBack: () => void;
}

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export function VerificationForm({ email, onBack }: VerificationFormProps) {
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { login } = useAuth();

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const submitCode = useCallback(
    async (code: string) => {
      if (code.length !== CODE_LENGTH) return;
      setIsVerifying(true);
      try {
        await api.verifyOtp({ email, code });
        toast.success("Email verified successfully!");
        // Small delay before login so the user sees the success
        setTimeout(async () => {
          try {
            // The backend should have activated the account; redirect will
            // happen via useAuth's login flow or the parent page.
            window.location.href = "/search";
          } catch {
            // If auto-login fails, just let the user sign in manually
            toast.info("Please sign in with your credentials.");
            onBack();
          }
        }, 600);
      } catch (error: any) {
        const message =
          error?.response?.data?.detail ||
          error?.message ||
          "Invalid verification code";
        toast.error(message);
        // Clear inputs on failure
        setDigits(Array(CODE_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      } finally {
        setIsVerifying(false);
      }
    },
    [email, login, onBack]
  );

  const handleChange = (index: number, value: string) => {
    // Only accept digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are filled
    const fullCode = newDigits.join("");
    if (fullCode.length === CODE_LENGTH) {
      submitCode(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;

    const newDigits = Array(CODE_LENGTH).fill("");
    pasted.split("").forEach((char, i) => {
      newDigits[i] = char;
    });
    setDigits(newDigits);

    // Focus the next empty input or last input
    const nextEmpty = newDigits.findIndex((d) => !d);
    inputRefs.current[nextEmpty === -1 ? CODE_LENGTH - 1 : nextEmpty]?.focus();

    if (pasted.length === CODE_LENGTH) {
      submitCode(pasted);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setIsResending(true);
    try {
      await api.resendOtp(email);
      toast.success("Verification code resent!");
      setCooldown(RESEND_COOLDOWN);
    } catch (error: any) {
      toast.error(error?.message || "Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(180,50%,23%)]/10">
          <ShieldCheck className="h-7 w-7 text-[hsl(180,50%,23%)]" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">
          Check your email
        </h3>
        <p className="text-sm text-gray-500">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-gray-700">{email}</span>
        </p>
      </div>

      {/* OTP Inputs */}
      <div className="flex justify-center gap-2.5">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            disabled={isVerifying}
            className={cn(
              "h-12 w-11 rounded-lg border text-center text-lg font-semibold transition-all",
              "focus:outline-none focus:ring-2 focus:ring-[hsl(20,100%,55%)]/30 focus:border-[hsl(20,100%,55%)]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              digit ? "border-[hsl(20,100%,55%)] bg-orange-50" : "border-gray-300 bg-white"
            )}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>

      {isVerifying && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Verifying...
        </div>
      )}

      {/* Resend */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          className={cn(
            "text-sm font-medium transition-colors",
            cooldown > 0
              ? "text-gray-400 cursor-not-allowed"
              : "text-[hsl(180,50%,23%)] hover:text-[hsl(180,50%,30%)] cursor-pointer"
          )}
        >
          {isResending
            ? "Sending..."
            : cooldown > 0
              ? `Resend code in ${cooldown}s`
              : "Resend code"}
        </button>

        <div>
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
}
