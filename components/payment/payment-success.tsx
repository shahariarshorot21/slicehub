"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { formatPrice } from "@/lib/utils";

type SessionDetails = { paymentStatus: string; status: string; amountTotal: number | null };

export function PaymentSuccess() {
  const params = useSearchParams();
  const sessionId = params.get("session_id") || "";
  const { data, loading, error } = useApi<SessionDetails>(sessionId ? `/payments/session?session_id=${encodeURIComponent(sessionId)}` : null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF9F5] px-4 dark:bg-slate-950">
      <div className="w-full max-w-lg rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-xl dark:border-white/10 dark:bg-slate-900">
        <CheckCircle2 className="mx-auto size-16 text-emerald-500" />
        <h1 className="mt-5 text-3xl font-black text-gray-900 dark:text-white">Payment received!</h1>
        <p className="mt-3 text-sm text-gray-500">
          Your Premium subscription is being activated. This happens only after Stripe confirms the payment.
        </p>

        {loading && (
          <p className="mt-5 flex items-center justify-center gap-2 text-sm text-gray-400">
            <Loader2 className="size-4 animate-spin" /> Verifying payment...
          </p>
        )}

        {!loading && error && (
          <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
            {error} <Link href="/sign-in" className="font-bold underline">Sign in</Link> to verify your payment.
          </p>
        )}
        {!loading && data && (
          <div className="mt-6 rounded-2xl bg-orange-50 p-4 text-left text-sm dark:bg-white/5">
            <div className="flex justify-between py-1"><span className="text-gray-500">Payment status</span><span className="font-bold capitalize text-emerald-600">{data.paymentStatus}</span></div>
            {data.amountTotal != null && <div className="flex justify-between py-1"><span className="text-gray-500">Amount</span><span className="font-bold">{formatPrice(data.amountTotal / 100)}</span></div>}
            <div className="flex justify-between py-1"><span className="text-gray-500">Session</span><span className="font-mono text-xs">{sessionId.slice(0, 20)}...</span></div>
          </div>
        )}

        <div className="mt-7 flex flex-col gap-2 sm:flex-row">
          <Link href="/vendor/subscription" className="flex-1 rounded-xl bg-[#E5484D] py-3 text-sm font-bold text-white">View subscription</Link>
          <Link href="/vendor" className="flex-1 rounded-xl border border-orange-200 py-3 text-sm font-bold text-gray-700 dark:text-gray-200">Back to dashboard</Link>
        </div>
      </div>
    </main>
  );
}
