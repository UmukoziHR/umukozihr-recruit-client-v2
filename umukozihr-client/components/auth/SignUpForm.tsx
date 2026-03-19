"use client";

import { useState } from "react";
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
  User,
  Building2,
  Briefcase,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const signUpSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  company: z.string().min(1, "Company name is required"),
  job_title: z.string().min(1, "Job title is required"),
});

type SignUpValues = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
  onVerificationNeeded: (email: string) => void;
}

export function SignUpForm({ onVerificationNeeded }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema as any),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      company: "",
      job_title: "",
    },
  });

  const onSubmit = async (data: SignUpValues) => {
    setIsLoading(true);
    try {
      await api.register(data);
      toast.success("Account created! Please verify your email.");
      onVerificationNeeded(data.email);
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.message ||
        "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    {
      id: "full_name",
      label: "Full Name",
      type: "text",
      placeholder: "Jane Doe",
      icon: User,
      autoComplete: "name",
    },
    {
      id: "email",
      label: "Email",
      type: "email",
      placeholder: "you@company.com",
      icon: Mail,
      autoComplete: "email",
    },
    {
      id: "company",
      label: "Company",
      type: "text",
      placeholder: "Acme Inc.",
      icon: Building2,
      autoComplete: "organization",
    },
    {
      id: "job_title",
      label: "Job Title",
      type: "text",
      placeholder: "Head of Talent",
      icon: Briefcase,
      autoComplete: "organization-title",
    },
  ] as const;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {fields.map((field) => {
        const Icon = field.icon;
        const error = errors[field.id as keyof SignUpValues];
        return (
          <div key={field.id} className="space-y-1.5">
            <label
              htmlFor={`signup-${field.id}`}
              className="block text-sm font-medium text-gray-700"
            >
              {field.label}
            </label>
            <div className="relative">
              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id={`signup-${field.id}`}
                type={field.type}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                className={cn(
                  "w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm transition-colors",
                  "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[hsl(20,100%,55%)]/30 focus:border-[hsl(20,100%,55%)]",
                  error ? "border-red-400" : "border-gray-300"
                )}
                {...(register(field.id as keyof SignUpValues) as any)}
              />
            </div>
            {error && (
              <p className="text-xs text-red-500">{error.message}</p>
            )}
          </div>
        );
      })}

      {/* Password field */}
      <div className="space-y-1.5">
        <label
          htmlFor="signup-password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Min 8 chars, 1 uppercase, 1 number"
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

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className={cn(
          "w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-all mt-2",
          "bg-[hsl(20,100%,55%)] hover:bg-[hsl(20,100%,48%)] active:scale-[0.98]",
          "disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100",
          "focus:outline-none focus:ring-2 focus:ring-[hsl(20,100%,55%)]/50 focus:ring-offset-2"
        )}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating account...
          </span>
        ) : (
          "Create Account"
        )}
      </button>
    </form>
  );
}
