export { cn } from "cn";

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

export function dashboardPath(role?: string): string {
  if (role === "vendor") return "/vendor";
  if (role === "admin") return "/admin";
  return "/customer";
}

export function isPremiumUser(
  user?: { subscriptionPlan?: "free" | "premium" | null; subscriptionExpiresAt?: string | Date | null } | null
): boolean {
  if (user?.subscriptionPlan !== "premium") return false;
  if (!user.subscriptionExpiresAt) return true;
  const expiry = new Date(user.subscriptionExpiresAt);
  return !Number.isNaN(expiry.getTime()) && expiry.getTime() > Date.now();
}
