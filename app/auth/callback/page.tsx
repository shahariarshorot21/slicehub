"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { LoadingState } from "@/components/ui/states";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { isPending, isAuthenticated, isBlocked, redirectPath } = useAuth();

  useEffect(() => {
    if (isPending) return;
    if (!isAuthenticated) {
      router.replace("/sign-in");
      return;
    }
    router.replace(isBlocked ? "/blocked" : redirectPath);
  }, [isPending, isAuthenticated, isBlocked, redirectPath, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <LoadingState label="Signing you in..." />
    </main>
  );
}
