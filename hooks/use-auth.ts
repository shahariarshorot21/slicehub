"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { apiFetch, ApiError } from "@/lib/api";
import type { Role, SessionUser } from "@/lib/types";
import { dashboardPath } from "@/lib/utils";

type BlockState = { id: string; blocked: boolean };


export function useAuth() {
  const session = authClient.useSession();
  const { refetch: refetchSession } = session;
  const [serverUser, setServerUser] = useState<SessionUser | null>(null);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [blockState, setBlockState] = useState<BlockState | null>(null);

  const sessionUser = (session.data?.user as unknown as SessionUser) || null;
  const sessionUserId = sessionUser?.id || null;

  useEffect(() => {
    let cancelled = false;

    if (session.isPending || !sessionUserId) return;

    apiFetch<SessionUser>("/me/me")
      .then((user) => {
        if (cancelled || !user?.id) return;
        setServerUser(user);
        setBlockState({ id: sessionUserId, blocked: false });
      })
      .catch((error: unknown) => {

        if (!cancelled && error instanceof ApiError && error.status === 403) {
          setBlockState({ id: sessionUserId, blocked: true });
        }
      })
      .finally(() => {
        if (!cancelled) setLoadedFor(sessionUserId);
      });

    return () => {
      cancelled = true;
    };
  }, [session.isPending, sessionUserId]);

  const refetch = useCallback(async () => {
    await refetchSession();
    if (!sessionUserId) return;
    try {
      const user = await apiFetch<SessionUser>("/me/me");
      setServerUser(user);
      setBlockState({ id: sessionUserId, blocked: false });
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        setBlockState({ id: sessionUserId, blocked: true });
      }
    }
  }, [refetchSession, sessionUserId]);

  const freshUser = serverUser?.id === sessionUserId ? serverUser : null;
  const blockedByApi = blockState?.id === sessionUserId && blockState.blocked;
  const user = useMemo(() => {
    if (!sessionUserId) return sessionUser;
    if (blockedByApi && sessionUser) return { ...sessionUser, isBlocked: true };
    return freshUser || sessionUser;
  }, [sessionUserId, sessionUser, blockedByApi, freshUser]);
  const serverPending = Boolean(sessionUserId) && loadedFor !== sessionUserId;

  return useMemo(
    () => ({
      user,
      role: user?.role as Role | undefined,
      isPending: session.isPending || serverPending,
      isAuthenticated: Boolean(user),
      isBlocked: Boolean(user?.isBlocked),
      isPremium: user?.subscriptionPlan === "premium",
      redirectPath: dashboardPath(user?.role),
      refetch,
    }),
    [user, session.isPending, serverPending, refetch]
  );
}
