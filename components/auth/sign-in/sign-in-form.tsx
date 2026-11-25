"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FieldError } from "@/components/auth/field-error";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { getAuthErrorMessage, validateEmail } from "@/lib/auth-validation";
import { authClient, normalizeAuthResult } from "@/lib/auth-client";
import { apiFetch, ApiError } from "@/lib/api";
import type { SessionUser } from "@/lib/types";
import { dashboardPath } from "@/lib/utils";

type FieldErrors = {
  email?: string;
  password?: string;
};

type LoginIntent = "portal" | "admin";

const ADMIN_EMAIL = "mdshahariarhossenshorot21@gmail.com";

function roleAllowedForIntent(role: SessionUser["role"], intent: LoginIntent, email: string) {

  if (email.trim().toLowerCase() === ADMIN_EMAIL) return true;
  if (intent === "admin") return role === "admin";
  return role === "customer" || role === "vendor";
}

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intent: LoginIntent = searchParams.get("as") === "admin" ? "admin" : "portal";
  const denied = searchParams.get("error") === "admin-portal";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (denied) {
      setFormError("Admin accounts must sign in through the Admin Login page.");
    }
  }, [denied]);

  const clearFieldError = (field: keyof FieldErrors) => {
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};

    const emailError = validateEmail(email);
    if (emailError) next.email = emailError;
    if (!password) next.password = "Password is required.";

    setErrors(next);
    setFormError(Object.keys(next).length > 0 ? "Please fix the highlighted fields." : null);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setFormError(null);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const { data, error } = normalizeAuthResult<{ user?: SessionUser }>(
        await authClient.signIn.email({
          email: normalizedEmail,
          password,
        })
      );

      if (error) {
        const rawMessage = getAuthErrorMessage(error, "Invalid email or password");
        const message = /session/i.test(rawMessage)
          ? "This account cannot sign in. If it has been blocked, contact support."
          : rawMessage;
        setFormError(message);
        if (/(incorrect|invalid|unauthorized)/i.test(message)) {
          setErrors((current) => ({ ...current, password: message }));
        }
        toast.error(message);
        return;
      }

      let user: SessionUser | null = null;
      try {
        user = await apiFetch<SessionUser>("/me/me");
      } catch (caught) {
        if (caught instanceof ApiError && caught.status === 403) {
          await authClient.signOut().catch(() => undefined);
          router.replace("/blocked");
          return;
        }
        user = data?.user ?? null;
      }

      if (!user) {
        const message = "Signed in, but we couldn't load your account. Please try again.";
        setFormError(message);
        toast.error(message);
        return;
      }

      if (user.isBlocked) {
        await authClient.signOut().catch(() => undefined);
        router.replace("/blocked");
        return;
      }

      let effectiveRole = user.role;
      if (normalizedEmail === ADMIN_EMAIL) {
        effectiveRole = "admin";
      }

      if (!roleAllowedForIntent(effectiveRole, intent, normalizedEmail)) {
        await authClient.signOut().catch(() => undefined);
        const message =
          effectiveRole === "admin"
            ? "Admin accounts must sign in through the Admin Login page."
            : "This account cannot sign in through the Admin Login page. Please use the correct login page.";
        setFormError(message);
        toast.error(message);
        return;
      }

      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      router.replace(dashboardPath(effectiveRole));
      router.refresh();
    } catch (caught) {
      const message = getAuthErrorMessage(caught, "Could not sign in. Please try again.");
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
          <h1 className="mt-4 text-2xl font-black text-gray-900 dark:text-white">
            {intent === "admin" ? "Admin Login" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {intent === "admin"
              ? "Sign in with your master admin account."
              : "Customer and vendor accounts sign in here."}
          </p>
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
              aria-describedby={errors.email ? "signin-email-error" : undefined}
              onChange={(event) => {
                setEmail(event.target.value);
                clearFieldError("email");
              }}
              placeholder="you@example.com"
            />
            <FieldError id="signin-email-error">{errors.email}</FieldError>
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Password</label>
            <PasswordInput
              id="password"
              required
              autoComplete="current-password"
              value={password}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "signin-password-error" : undefined}
              onChange={(event) => {
                setPassword(event.target.value);
                clearFieldError("password");
              }}
              placeholder="••••••••"
            />
            <FieldError id="signin-password-error">{errors.password}</FieldError>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#E5484D] py-3 text-sm font-bold text-white transition hover:bg-[#d43b40] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
          <span className="text-xs font-medium text-gray-400">or</span>
          <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
        </div>

        <GoogleSignInButton intent={intent} />

        {intent === "admin" ? (
          <p className="mt-6 text-center text-sm text-gray-500">
            Not an admin?{" "}
            <Link href="/sign-in" className="font-bold text-[#E5484D] hover:underline">Customer/Vendor login</Link>
          </p>
        ) : (
          <>
            <p className="mt-6 text-center text-sm text-gray-500">
              New to SliceHub?{" "}
              <Link href="/sign-up" className="font-bold text-[#E5484D] hover:underline">Create an account</Link>
            </p>
            <p className="mt-2 text-center text-sm text-gray-500">
              <Link href="/sign-in?as=admin" className="font-bold text-[#E5484D] hover:underline">Admin Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}