"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import type { Role } from "@/lib/types";
import { dashboardPath } from "@/lib/utils";

/** Client-side guard; every protected API also verifies the role on the server. */
export function useRoleGuard(allowed: Role[]) {
  const router = useRouter();
  const auth = useAuth();

  const allowedKey = allowed.join(",");

  useEffect(() => {
    if (auth.isPending) return;
    if (!auth.isAuthenticated) {
      router.replace("/sign-in");
      return;
    }
    if (!auth.role || !allowed.includes(auth.role)) {
      router.replace(dashboardPath(auth.role));
      return;
    }
    if (auth.isBlocked) {
      router.replace("/blocked");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isPending, auth.isAuthenticated, auth.role, auth.isBlocked, router, allowedKey]);

  return auth;
}
