"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export default function BlockedPage() {
  const router = useRouter();

  const signOut = async () => {
    await authClient.signOut();
    toast.success("Signed out");
    router.push("/");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF9F5] px-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-10 text-center shadow-xl dark:border-white/10 dark:bg-slate-900">
        <ShieldAlert className="mx-auto size-16 text-[#E5484D]" />
        <h1 className="mt-5 text-2xl font-black text-gray-900 dark:text-white">Account blocked</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Your SliceHub account has been blocked by an administrator. Please contact support if you believe this
          is a mistake.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={signOut}
            className="rounded-xl bg-[#E5484D] py-3 text-sm font-bold text-white transition hover:bg-[#d43b40]"
          >
            Sign out
          </button>
          <Link href="/" className="rounded-xl border border-orange-200 py-3 text-sm font-bold text-gray-700 dark:text-gray-200">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
