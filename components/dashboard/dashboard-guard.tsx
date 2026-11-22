"use client";

import { DashboardShell, type NavItem } from "@/components/dashboard/dashboard-shell";
import { adminNav, customerNav, vendorNav } from "@/components/dashboard/nav";
import type { Role } from "@/lib/types";

const navByRole: Record<Role, { title: string; nav: NavItem[] }> = {
  customer: { title: "Customer Dashboard", nav: customerNav },
  vendor: { title: "Vendor Dashboard", nav: vendorNav },
  admin: { title: "Admin Dashboard", nav: adminNav },
};

/** Client boundary for the dashboard shell; the server layout already verified the role. */
export function DashboardGuard({ role, children }: { role: Role; children: React.ReactNode }) {
  const config = navByRole[role];
  return (
    <DashboardShell role={role} title={config.title} nav={config.nav}>
      {children}
    </DashboardShell>
  );
}
