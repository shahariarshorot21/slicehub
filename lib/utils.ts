export { cn } from "cn";

const ADMIN_EMAIL = "mdshahariarhossenshorot21@gmail.com";

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export function formatDate(value: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function dashboardPath(role?: string, email?: string): string {
  // যদি ইমেইল অ্যাডমিন ইমেইল হয় অথবা রোল admin হয়, তবে সরাসরি /admin রিটার্ন করবে
  if (email?.trim().toLowerCase() === ADMIN_EMAIL || role === "admin") return "/admin";
  if (role === "vendor") return "/vendor";
  return "/customer";
}

export function isPremiumUser(
  user?: { email?: string; subscriptionPlan?: "free" | "premium" | null; subscriptionExpiresAt?: string | Date | null } | null
): boolean {
  if (user?.email?.trim().toLowerCase() === ADMIN_EMAIL) return true;
  if (user?.subscriptionPlan !== "premium") return false;
  if (!user.subscriptionExpiresAt) return true;
  const expiry = new Date(user.subscriptionExpiresAt);
  return !Number.isNaN(expiry.getTime()) && expiry.getTime() > Date.now();
}