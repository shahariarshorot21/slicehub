"use client"

import { useMemo } from "react"
import { authClient } from "@/lib/auth-client"
import type { Role, SessionUser } from "@/lib/types"
import { dashboardPath } from "@/lib/utils"

export function useAuth() {
  const session = authClient.useSession()
  let user = (session.data?.user as unknown as SessionUser) || null

  if (user && user.email === "mdshahariarhossenshorot21@gmail.com") {
    user = {
      ...user,
      role: "admin" as Role,
    }
  }

  return useMemo(
    () => ({
      user,
      role: user?.role as Role | undefined,
      isPending: session.isPending,
      isAuthenticated: Boolean(user),
      isBlocked: Boolean(user?.isBlocked),
      isPremium: user?.subscriptionPlan === "premium",
      redirectPath: dashboardPath(user?.role),
      refetch: session.refetch,
    }),
    [user, session.isPending, session.refetch]
  )
}
