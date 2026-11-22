import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role, SessionUser } from "@/lib/types";
import { dashboardPath } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/**
 * Server-side dashboard guard. The API re-reads the user from MongoDB, so a
 * stale client session cannot keep access after a role change or a block.
 */
export async function requireRole(role: Role): Promise<SessionUser> {
  const cookieHeader = (await cookies()).toString();
  let response: Response | null = null;

  try {
    response = await fetch(`${API_URL}/me/me`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
  } catch {
    response = null;
  }

  if (!response) redirect("/sign-in");
  if (response.status === 403) redirect("/blocked");
  if (!response.ok) redirect("/sign-in");

  const user = (await response.json()) as SessionUser;
  if (user.isBlocked) redirect("/blocked");
  if (user.role !== role) redirect(dashboardPath(user.role));

  return user;
}
