"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const dashboardPrefixes = ["/customer", "/vendor", "/admin"];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const isDashboard = dashboardPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isDashboard) return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
