
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  ChevronDown,
  Loader2,
  LogOut,
  Moon,
  Sun,
  UserRound,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { authClient, normalizeAuthResult } from "@/lib/auth-client"
import { getAuthErrorMessage } from "@/lib/auth-validation"
import { useAuth } from "@/hooks/use-auth"
import { dashboardPath, cn } from "@/lib/utils"
import Image from "next/image"

const links = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Browse Menu" },
]

const ADMIN_EMAIL = "mdshahariarhossenshorot21@gmail.com";

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const { user, isAuthenticated, refetch } = useAuth()

  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const effectiveRole =
    user?.email?.trim().toLowerCase() === ADMIN_EMAIL
      ? "admin"
      : user?.role;

  const dashboardHref =
    user?.email?.trim().toLowerCase() === ADMIN_EMAIL
      ? "/admin"
      : dashboardPath(effectiveRole, user?.email);

  const handleSignOut = async () => {
    if (signingOut) return

    setSigningOut(true)

    try {
      const { error } = normalizeAuthResult(
        await authClient.signOut()
      )

      if (error) {
        throw new Error(error.message || "Could not sign out")
      }

      setOpen(false)
      await refetch()

      toast.success("Signed out successfully")

      router.replace("/")
      router.refresh()
    } catch (caught) {
      toast.error(
        getAuthErrorMessage(
          caught,
          "Could not sign out. Please try again."
        )
      )
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-orange-100 bg-[#FFFBF7]/95 backdrop-blur dark:border-white/10 dark:bg-slate-950/90">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center overflow-hidden rounded-xl bg-[#E5484D] shadow-md">
            <Image
              src="/logo.png.jpg"
              alt="SliceHub Logo"
              width={40}
              height={40}
              priority
              className="size-full rounded-xl object-contain"
            />
          </span>

          <span className="flex flex-col">
            <span className="text-2xl leading-none font-extrabold tracking-tight">
              <span className="text-gray-900 dark:text-white">
                Slice
              </span>
              <span className="text-[#C9473D]">
                Hub
              </span>
            </span>

            <span className="mt-1 text-[8px] font-semibold tracking-[2px] text-gray-500">
              LOCAL PIZZA BIG LOVE.
            </span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition hover:text-[#E5484D]",
                pathname === link.href
                  ? "text-[#E5484D]"
                  : "text-gray-600 dark:text-gray-300"
              )}
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated && (
            <Link
              href={dashboardHref}
              className="text-sm font-medium text-gray-600 transition hover:text-[#E5484D] dark:text-gray-300"
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2">

          {/* Theme Toggle */}
          <button
            type="button"
            aria-label="Toggle color theme"
            onClick={() =>
              setTheme(
                resolvedTheme === "dark" ? "light" : "dark"
              )
            }
            className="rounded-full p-2.5 text-gray-600 transition hover:bg-orange-100 dark:text-gray-200 dark:hover:bg-white/10"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="size-5" />
            ) : (
              <Moon className="size-5" />
            )}
          </button>

          {/* Authenticated User */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="flex items-center gap-2 rounded-full bg-orange-100/70 py-1.5 pr-3 pl-1.5 transition hover:bg-orange-100 dark:bg-white/10"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-[#E5484D] text-xs font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase() || "S"}
                </span>

                <span className="hidden max-w-28 truncate text-sm font-semibold text-gray-800 sm:block dark:text-white">
                  {user?.name}
                </span>

                <ChevronDown className="size-4 text-gray-500" />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-orange-100 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-slate-900">
                  <div className="border-b border-orange-100 px-3 py-2 dark:border-white/10">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {user?.name}
                    </p>

                    <p className="truncate text-xs text-gray-500">
                      {user?.email}
                    </p>

                    <p className="mt-1 text-[10px] font-bold tracking-wide text-[#E5484D] uppercase">
                      currently logged as: {effectiveRole}
                    </p>
                  </div>

                  <Link
                    href={dashboardHref}
                    onClick={() => setOpen(false)}
                    className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 dark:text-gray-200 dark:hover:bg-white/10"
                  >
                    <UserRound className="size-4" />
                    My Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-red-500/10"
                  >
                    {signingOut ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <LogOut className="size-4" />
                    )}

                    {signingOut
                      ? "Signing out..."
                      : "Sign out"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Guest User */
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-[#E5484D] hover:bg-orange-50 sm:block dark:hover:bg-white/10"
              >
                Sign in
              </Link>

              <Link
                href="/sign-up"
                className="rounded-xl bg-[#E5484D] px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#d43b40]"
              >
                Join SliceHub
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
