"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type Step = "email" | "code" | "success";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const resetSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

interface ForgotPasswordProps {
  onBack: () => void;
}

export function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- Step 1: Email form ---
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema as any),
    defaultValues: { email: "" },
  });

  const handleEmailSubmit = async (data: z.infer<typeof emailSchema>) => {
    setIsLoading(true);
    try {
      await api.forgotPassword(data.email);
      setEmail(data.email);
      setStep("code");
      toast.success("Reset code sent to your email");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail ||
          error?.message ||
          "Failed to send reset code"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step 2: Code + new password ---
  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema as any),
    defaultValues: { code: "", password: "" },
  });

  const handleResetSubmit = async (data: z.infer<typeof resetSchema>) => {
    setIsLoading(true);
    try {
      await api.resetPassword({ email, code: data.code, new_password: data.password });
      setStep("success");
      toast.success("Password reset successfully!");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail ||
          error?.message ||
          "Failed to reset password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step 1: Email ---
  if (step === "email") {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </button>

        <div className="space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(20,100%,55%)]/10">
            <KeyRound className="h-6 w-6 text-[hsl(20,100%,55%)]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Reset your password
          </h3>
          <p className="text-sm text-gray-500">
            Enter your email and we'll send you a reset code.
          </p>
        </div>

        <form
          onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label
              htmlFor="reset-email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className={cn(
                  "w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm transition-colors",
                  "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[hsl(20,100%,55%)]/30 focus:border-[hsl(20,100%,55%)]",
                  emailForm.formState.errors.email
                    ? "border-red-400"
                    : "border-gray-300"
                )}
                {...emailForm.register("email")}
              />
            </div>
            {emailForm.formState.errors.email && (
              <p className="text-xs text-red-500">
                {emailForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-all",
              "bg-[hsl(20,100%,55%)] hover:bg-[hsl(20,100%,48%)] active:scale-[0.98]",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "focus:outline-none focus:ring-2 focus:ring-[hsl(20,100%,55%)]/50 focus:ring-offset-2"
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending code...
              </span>
            ) : (
              "Send Reset Code"
            )}
          </button>
        </form>
      </div>
    );
  }

  // --- Step 2: Code + new password ---
  if (step === "code") {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => setStep("email")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Change email
        </button>

        <div className="space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(180,50%,23%)]/10">
            <KeyRound className="h-6 w-6 text-[hsl(180,50%,23%)]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Enter reset code
          </h3>
          <p className="text-sm text-gray-500">
            We sent a code to{" "}
            <span className="font-medium text-gray-700">{email}</span>
          </p>
        </div>

        <form
          onSubmit={resetForm.handleSubmit(handleResetSubmit)}
          className="space-y-4"
        >
          {/* Code */}
          <div className="space-y-1.5">
            <label
              htmlFor="reset-code"
              className="block text-sm font-medium text-gray-700"
            >
              Reset Code
            </label>
            <input
              id="reset-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              className={cn(
                "w-full rounded-lg border bg-white py-2.5 px-4 text-sm tracking-[0.3em] text-center font-semibold transition-colors",
                "placeholder:text-gray-400 placeholder:tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-[hsl(20,100%,55%)]/30 focus:border-[hsl(20,100%,55%)]",
                resetForm.formState.errors.code
                  ? "border-red-400"
                  : "border-gray-300"
              )}
              {...resetForm.register("code")}
            />
            {resetForm.formState.errors.code && (
              <p className="text-xs text-red-500">
                {resetForm.formState.errors.code.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="reset-password"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="reset-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                className={cn(
                  "w-full rounded-lg border bg-white py-2.5 pl-10 pr-10 text-sm transition-colors",
                  "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[hsl(20,100%,55%)]/30 focus:border-[hsl(20,100%,55%)]",
                  resetForm.formState.errors.password
                    ? "border-red-400"
                    : "border-gray-300"
                )}
                {...resetForm.register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {resetForm.formState.errors.password && (
              <p className="text-xs text-red-500">
                {resetForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-all",
              "bg-[hsl(20,100%,55%)] hover:bg-[hsl(20,100%,48%)] active:scale-[0.98]",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "focus:outline-none focus:ring-2 focus:ring-[hsl(20,100%,55%)]/50 focus:ring-offset-2"
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Resetting...
              </span>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>
    );
  }

  // --- Step 3: Success ---
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-7 w-7 text-green-600" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">
          Password reset complete
        </h3>
        <p className="text-sm text-gray-500">
          Your password has been updated. You can now sign in with your new
          password.
        </p>
      </div>

      <button
        type="button"
        onClick={onBack}
        className={cn(
          "w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-all",
          "bg-[hsl(20,100%,55%)] hover:bg-[hsl(20,100%,48%)] active:scale-[0.98]",
          "focus:outline-none focus:ring-2 focus:ring-[hsl(20,100%,55%)]/50 focus:ring-offset-2"
        )}
      >
        Back to Sign In
      </button>
    </div>
  );
}
