"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInValues = z.infer<typeof signInSchema>;

interface SignInFormProps {
  onForgotPassword: () => void;
}

export function SignInForm({ onForgotPassword }: SignInFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema as any),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: SignInValues) => {
    setIsLoading(true);
    try {
      await login({ email: data.email, password: data.password });
      toast.success("Welcome back!");
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.message ||
        "Invalid email or password";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Email */}
      <div className="space-y-1.5">
        <label
          htmlFor="signin-email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            id="signin-email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            className={cn(
              "w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm transition-colors",
              "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[hsl(20,100%,55%)]/30 focus:border-[hsl(20,100%,55%)]",
              errors.email ? "border-red-400" : "border-gray-300"
            )}
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label
          htmlFor="signin-password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            id="signin-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            className={cn(
              "w-full rounded-lg border bg-white py-2.5 pl-10 pr-10 text-sm transition-colors",
              "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[hsl(20,100%,55%)]/30 focus:border-[hsl(20,100%,55%)]",
              errors.password ? "border-red-400" : "border-gray-300"
            )}
            {...register("password")}
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
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* Forgot password */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-[hsl(180,50%,23%)] hover:text-[hsl(180,50%,30%)] font-medium transition-colors"
        >
          Forgot password?
        </button>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className={cn(
          "w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-all",
          "bg-[hsl(20,100%,55%)] hover:bg-[hsl(20,100%,48%)] active:scale-[0.98]",
          "disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100",
          "focus:outline-none focus:ring-2 focus:ring-[hsl(20,100%,55%)]/50 focus:ring-offset-2"
        )}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in...
          </span>
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  );
}
