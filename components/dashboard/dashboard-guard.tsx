"use client";

import { DashboardShell, type NavItem } from "@/components/dashboard/dashboard-shell";
import { adminNav, customerNav, vendorNav } from "@/components/dashboard/nav";
import { useAuth } from "@/hooks/use-auth";
import type { Role } from "@/lib/types";

const ADMIN_EMAIL = "mdshahariarhossenshorot21@gmail.com";

const navByRole: Record<Role, { title: string; nav: NavItem[] }> = {
  customer: { title: "Customer Dashboard", nav: customerNav },
  vendor: { title: "Vendor Dashboard", nav: vendorNav },
  admin: { title: "Admin Dashboard", nav: adminNav },
};

export function DashboardGuard({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user } = useAuth();

  const effectiveRole: Role =
    user?.email?.trim().toLowerCase() === ADMIN_EMAIL ? "admin" : role;

  const config = navByRole[effectiveRole];

  return (
    <DashboardShell role={effectiveRole} title={config.title} nav={config.nav}>
      {children}
    </DashboardShell>
  );
}