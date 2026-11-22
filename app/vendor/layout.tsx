import { DashboardGuard } from "@/components/dashboard/dashboard-guard";
import { requireRole } from "@/lib/server-auth";

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  await requireRole("vendor");
  return <DashboardGuard role="vendor">{children}</DashboardGuard>;
}
