import { DashboardGuard } from "@/components/dashboard/dashboard-guard";
import { requireRole } from "@/lib/server-auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("admin");
  return <DashboardGuard role="admin">{children}</DashboardGuard>;
}
