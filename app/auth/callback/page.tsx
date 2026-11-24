"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/hooks/use-auth";
import { LoadingState } from "@/components/ui/states";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intent = searchParams.get("as") === "admin" ? "admin" : "portal";
  const handled = useRef(false);
  const { isPending, isAuthenticated, isBlocked, redirectPath, role } = useAuth();

  useEffect(() => {
    if (isPending || handled.current) return;
    if (!isAuthenticated) {
      router.replace(intent === "admin" ? "/sign-in?as=admin" : "/sign-in");
      return;
    }

    const allowed =
      intent === "admin"
        ? role === "admin"
        : role === "customer" || role === "vendor";

    if (!allowed) {
      handled.current = true;
      void (async () => {
        await authClient.signOut().catch(() => undefined);
        const message =
          role === "admin"
            ? "Admin accounts must sign in through the Admin Login page."
            : "This account cannot sign in through the Admin Login page. Please use the correct login page.";
        toast.error(message);
        router.replace(intent === "admin" ? "/sign-in?as=admin" : "/sign-in?error=admin-portal");
      })();
      return;
    }

    router.replace(isBlocked ? "/blocked" : redirectPath);
  }, [isPending, isAuthenticated, isBlocked, redirectPath, role, intent, router]);

  return <LoadingState label="Signing you in..." />;
}

export default function AuthCallbackPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Suspense fallback={<LoadingState label="Signing you in..." />}>
        <AuthCallbackContent />
      </Suspense>
    </main>
  );
}
