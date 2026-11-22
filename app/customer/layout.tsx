import { DashboardGuard } from "@/components/dashboard/dashboard-guard";
import { requireRole } from "@/lib/server-auth";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  await requireRole("customer");
  return <DashboardGuard role="customer">{children}</DashboardGuard>;
}
