"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Store, UserRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { FieldError } from "@/components/auth/field-error";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  PASSWORD_HINT,
  PASSWORD_MIN_LENGTH,
  getAuthErrorMessage,
  validateConfirmPassword,
  validateEmail,
  validateName,
  validatePassword,
} from "@/lib/auth-validation";
import { authClient, getSessionUser, normalizeAuthResult } from "@/lib/auth-client";
import type { SessionUser } from "@/lib/types";
import { cn, dashboardPath } from "@/lib/utils";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

type AccountType = "customer" | "vendor" | "admin";

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("customer");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isAdminEmail = email.trim().toLowerCase() === "mdshahariarhossenshorot21@gmail.com";

  const clearFieldError = (field: keyof FieldErrors) => {
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};

    const nameError = validateName(name);
    if (nameError) next.name = nameError;

    const emailError = validateEmail(email);
    if (emailError) next.email = emailError;

    const passwordError = validatePassword(password);
    if (passwordError) next.password = passwordError;

    const confirmError = validateConfirmPassword(password, confirmPassword);
    if (confirmError) next.confirmPassword = confirmError;

    setErrors(next);
    setFormError(Object.keys(next).length > 0 ? "Please fix the highlighted fields." : null);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setFormError(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const finalAccountType = normalizedEmail === "mdshahariarhossenshorot21@gmail.com" ? "admin" : accountType;

      const { data, error } = normalizeAuthResult<{ user?: SessionUser }>(
        await authClient.signUp.email({
          name: name.trim(),
          email: normalizedEmail,
          password,
          accountType: finalAccountType,
        })
      );

      if (error) {
        const message = getAuthErrorMessage(error, "Could not create account");
        setFormError(message);
        if (/(already|exist|duplicate|another email)/i.test(message)) {
          setErrors((current) => ({ ...current, email: message }));
        }
        toast.error(message);
        return;
      }

      const user = (await getSessionUser()) ?? data?.user ?? null;
      if (!user) {
        const message = "Account created, but we couldn't start your session. Please sign in.";
        setFormError(message);
        toast.error(message);
        return;
      }

      if (user.isBlocked) {
        router.replace("/blocked");
        return;
      }

      toast.success(`Welcome to SliceHub, ${user.name.split(" ")[0]}!`);
      router.replace(dashboardPath(normalizedEmail === "mdshahariarhossenshorot21@gmail.com" ? "admin" : user.role));
      router.refresh();
    } catch (caught) {
      const message = getAuthErrorMessage(caught, "Could not create account. Please try again.");
      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFF9F5] px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-3xl border border-orange-100 bg-white p-8 shadow-xl dark:border-white/10 dark:bg-slate-900">
        <div className="text-center">
          <Link href="/" className="text-3xl font-black text-[#E5484D]">SliceHub</Link>
          <h1 className="mt-4 text-2xl font-black text-gray-900 dark:text-white">Create your account</h1>
          <p className="mt-1 text-sm text-gray-500">Choose your account type and get started with SliceHub.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
          {formError && (
            <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
              {formError}
            </p>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Email address</label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "signup-email-error" : undefined}
              onChange={(event) => {
                setEmail(event.target.value);
                clearFieldError("email");
              }}
              placeholder="you@example.com"
            />
            <FieldError id="signup-email-error">{errors.email}</FieldError>
          </div>

          {!isAdminEmail ? (
            <fieldset>
              <legend className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200">Account type</legend>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  aria-pressed={accountType === "customer"}
                  onClick={() => setAccountType("customer")}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl border px-3 py-4 text-center transition",
                    accountType === "customer"
                      ? "border-[#E5484D] bg-orange-50 ring-2 ring-[#E5484D]/20 dark:bg-[#E5484D]/10"
                      : "border-orange-100 bg-white hover:border-orange-200 hover:bg-orange-50/60 dark:border-white/10 dark:bg-slate-900 dark:hover:bg-white/5"
                  )}
                >
                  <span className={cn(
                    "flex size-9 items-center justify-center rounded-xl transition",
                    accountType === "customer"
                      ? "bg-[#E5484D] text-white"
                      : "bg-orange-100 text-[#E5484D] dark:bg-white/10"
                  )}>
                    <UserRound className="size-5" />
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">Customer</span>
                  <span className="text-[11px] leading-snug text-gray-500 dark:text-gray-400">Create a Customer Account</span>
                </button>

                <button
                  type="button"
                  aria-pressed={accountType === "vendor"}
                  onClick={() => setAccountType("vendor")}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl border px-3 py-4 text-center transition",
                    accountType === "vendor"
                      ? "border-[#E5484D] bg-orange-50 ring-2 ring-[#E5484D]/20 dark:bg-[#E5484D]/10"
                      : "border-orange-100 bg-white hover:border-orange-200 hover:bg-orange-50/60 dark:border-white/10 dark:bg-slate-900 dark:hover:bg-white/5"
                  )}
                >
                  <span className={cn(
                    "flex size-9 items-center justify-center rounded-xl transition",
                    accountType === "vendor"
                      ? "bg-[#E5484D] text-white"
                      : "bg-orange-100 text-[#E5484D] dark:bg-white/10"
                  )}>
                    <Store className="size-5" />
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">Vendor</span>
                  <span className="text-[11px] leading-snug text-gray-500 dark:text-gray-400">Create a Vendor Account</span>
                </button>
              </div>
            </fieldset>
          ) : (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center dark:bg-red-500/10 dark:border-red-500/20">
              <div className="flex items-center justify-center gap-2 text-sm font-black text-[#E5484D]">
                <ShieldCheck className="size-5" /> Administrator Access Detected
              </div>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                You are registering with the global master admin email. Standard role selectors are hidden.
              </p>
            </div>
          )}

          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Full name</label>
            <Input
              id="name"
              required
              autoComplete="name"
              value={name}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "signup-name-error" : undefined}
              onChange={(event) => {
                setName(event.target.value);
                clearFieldError("name");
              }}
              placeholder="John Doe"
            />
            <FieldError id="signup-name-error">{errors.name}</FieldError>
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Password</label>
            <PasswordInput
              id="password"
              required
              autoComplete="new-password"
              minLength={PASSWORD_MIN_LENGTH}
              value={password}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "signup-password-error" : "signup-password-hint"}
              onChange={(event) => {
                setPassword(event.target.value);
                clearFieldError("password");
              }}
              placeholder="At least 8 characters"
            />
            {errors.password ? (
              <FieldError id="signup-password-error">{errors.password}</FieldError>
            ) : (
              <p id="signup-password-hint" className="mt-1.5 text-[11px] text-gray-400 dark:text-gray-500">{PASSWORD_HINT}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Confirm password</label>
            <PasswordInput
              id="confirm-password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? "signup-confirm-error" : undefined}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                clearFieldError("confirmPassword");
              }}
              placeholder="Re-enter your password"
            />
            <FieldError id="signup-confirm-error">{errors.confirmPassword}</FieldError>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#E5484D] py-3 text-sm font-bold text-white transition hover:bg-[#d43b40] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {loading ? "Creating account..." : isAdminEmail ? "Create Master Admin Account" : "Create account"}
          </button>
        </form>

        {!isAdminEmail && (
          <>
            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
              <span className="text-xs font-medium text-gray-400">or</span>
              <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
            </div>

            <GoogleSignInButton label="Sign up with Google" />
          </>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-bold text-[#E5484D] hover:underline">Sign in</Link>
        </p>
        <p className="mt-2 text-center text-[11px] text-gray-400">Admin access is assigned securely by SliceHub.</p>
      </div>
    </div>
  );
}