"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ChevronDown, Loader2, LogOut, Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRoleGuard } from "@/hooks/use-role-guard";
import type { Role } from "@/lib/types";
import { authClient, normalizeAuthResult } from "@/lib/auth-client";
import { getAuthErrorMessage } from "@/lib/auth-validation";
import { cn } from "@/lib/utils";
import { LoadingState } from "@/components/ui/states";

export type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

export function DashboardShell({
  role,
  title,
  nav,
  children,
}: {
  role: Role;
  title: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const auth = useRoleGuard([role]);
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  if (auth.isPending) {
    return <main className="flex min-h-screen items-center justify-center"><LoadingState label="Checking your session..." /></main>;
  }
  if (!auth.isAuthenticated || auth.role !== role || auth.isBlocked) return null;

  const signOut = async () => {
    if (signingOut) return;
    setSigningOut(true);

    try {
      const { error } = normalizeAuthResult(await authClient.signOut());
      if (error) throw new Error(error.message || "Could not sign out");

      toast.success("Signed out successfully");
      router.replace("/");
      router.refresh();
    } catch (caught) {
      toast.error(getAuthErrorMessage(caught, "Could not sign out. Please try again."));
    } finally {
      setSigningOut(false);
    }
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center gap-2 border-b border-orange-100 px-6 dark:border-white/10">
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#E5484D] text-lg text-white">🍕</span>
        <span className="text-xl font-black text-gray-900 dark:text-white">SliceHub</span>
      </div>

      <div className="px-4 py-6">
        <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">{role} workspace</p>
        <nav className="mt-3 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = href === `/${role}` ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                  active
                    ? "bg-[#E5484D] text-white shadow"
                    : "text-gray-600 hover:bg-orange-50 hover:text-[#E5484D] dark:text-gray-300 dark:hover:bg-white/10"
                )}
              >
                <Icon className="size-4" /> {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-orange-100 p-4 dark:border-white/10">
        <Link
          href="/"
          className="mb-2 block rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-orange-50 dark:text-gray-300 dark:hover:bg-white/10"
        >
          ← Back to website
        </Link>
        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-red-500/10"
        >
          {signingOut ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
          {signingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFFBF7] dark:bg-slate-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-orange-100 bg-white lg:block dark:border-white/10 dark:bg-slate-900">
        {sidebar}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl dark:bg-slate-900">{sidebar}</aside>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="absolute left-68 top-4 rounded-full bg-white p-2 dark:bg-slate-900"
          >
            <X className="size-5" />
          </button>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-orange-100 bg-white/90 px-4 backdrop-blur sm:px-8 dark:border-white/10 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="rounded-xl p-2 text-gray-600 hover:bg-orange-50 lg:hidden dark:text-gray-200"
            >
              <Menu className="size-5" />
            </button>
            <div>
              <h1 className="text-lg font-black text-gray-900 sm:text-xl dark:text-white">{title}</h1>
              <p className="text-xs capitalize text-gray-400">Signed in as {auth.user?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="rounded-full p-2 text-gray-500 hover:bg-orange-50 dark:text-gray-200 dark:hover:bg-white/10"
            >
              {resolvedTheme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
            {role === "admin" ? (
              <div className="relative">
                <button
                  type="button"
                  aria-label="Open profile menu"
                  aria-expanded={profileOpen}
                  onClick={() => setProfileOpen((open) => !open)}
                  className="flex items-center gap-1 rounded-full p-0.5 hover:bg-orange-50 dark:hover:bg-white/10"
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-[#E5484D] text-sm font-bold text-white">
                    {auth.user?.name?.charAt(0).toUpperCase() || "S"}
                  </span>
                  <ChevronDown className="size-4 text-gray-400" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl border border-orange-100 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-slate-900">
                    <div className="px-3 py-2">
                      <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{auth.user?.name}</p>
                      <p className="truncate text-xs text-gray-400">{auth.user?.email}</p>
                    </div>
                    <Link
                      href="/admin/profile"
                      onClick={() => setProfileOpen(false)}
                      className="block rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-orange-50 dark:text-gray-300 dark:hover:bg-white/10"
                    >
                      Profile settings
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        void signOut();
                      }}
                      disabled={signingOut}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60 dark:hover:bg-red-500/10"
                    >
                      <LogOut className="size-4" />
                      {signingOut ? "Signing out..." : "Sign out"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <span className="flex size-9 items-center justify-center rounded-full bg-[#E5484D] text-sm font-bold text-white">
                {auth.user?.name?.charAt(0).toUpperCase() || "S"}
              </span>
            )}
          </div>
        </header>

        <main
          className={cn(
            "mx-auto px-4 py-8 sm:px-8",
            role === "admin" ? "w-full max-w-none" : "max-w-6xl"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
