import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { apiFetch } from "@/lib/api";
import type { SessionUser } from "@/lib/types";

export const authClient = createAuthClient({
  baseURL: process.env.BASE_URL || "https://slicehub-rosy.vercel.app",
  plugins: [
    inferAdditionalFields({
      user: {
        accountType: { type: "string", required: false, input: true, returned: false },
      },
    }),
  ],
  fetchOptions: {
    credentials: "include",
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;


export function signInWithGoogle() {
  return authClient.signIn.social({
    provider: "google",
    callbackURL: `${window.location.origin}/auth/callback`,
    errorCallbackURL: `${window.location.origin}/sign-in`,
  });
}


type AuthResponse = {
  data?: unknown;
  error?: { message?: string } | string | null;
  message?: string;
  user?: unknown;
};

const asAuthResponse = (value: unknown): AuthResponse | null =>
  typeof value === "object" && value !== null ? (value as AuthResponse) : null;


export function normalizeAuthResult<T>(result: unknown): { data: T | null; error: { message?: string } | null } {
  const response = asAuthResponse(result);
  if (!response) return { data: null, error: { message: "No response from server" } };

  const error = response.error || (response.message && !response.user ? response : null);
  const data = response.data !== undefined ? response.data : response;
  const message = typeof error === "string" ? error : error?.message || String(error);

  return {
    data: error ? null : (data as T),
    error: error ? { message } : null,
  };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  // The Express API re-reads the user from MongoDB, so its role, blocked state
  // and subscription fields are authoritative over a cached Better Auth session.
  try {
    const user = await apiFetch<SessionUser>("/me/me");
    if (user?.id) return user;
  } catch {
    // Fall through to the session snapshot only when the API is unreachable.
  }

  const result = await authClient.getSession();
  const response = asAuthResponse(result);
  const session = asAuthResponse(response?.data !== undefined ? response.data : response);
  return (session?.user as SessionUser) || null;
}
