import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role, SessionUser } from "@/lib/types";
import { dashboardPath } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";


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


  if (role === "admin") {
    let adminResponse: Response | null = null;
    try {
      adminResponse = await fetch(`${API_URL}/admin/session`, {
        headers: { cookie: cookieHeader },
        cache: "no-store",
      });
    } catch {
      adminResponse = null;
    }
    if (!adminResponse?.ok) redirect("/sign-in");
  }

  return user;
}
