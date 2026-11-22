import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF9F5] px-4 dark:bg-slate-950">
      <div className="w-full max-w-lg rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-xl dark:border-white/10 dark:bg-slate-900">
        <XCircle className="mx-auto size-16 text-amber-500" />
        <h1 className="mt-5 text-3xl font-black text-gray-900 dark:text-white">Checkout cancelled</h1>
        <p className="mt-3 text-sm text-gray-500">
          No charge was made. Your vendor account is still on its current plan — you can try again whenever you like.
        </p>
        <div className="mt-7 flex flex-col gap-2 sm:flex-row">
          <Link href="/vendor/subscription" className="flex-1 rounded-xl bg-[#E5484D] py-3 text-sm font-bold text-white">Back to subscription</Link>
          <Link href="/" className="flex-1 rounded-xl border border-orange-200 py-3 text-sm font-bold text-gray-700 dark:text-gray-200">Go home</Link>
        </div>
      </div>
    </main>
  );
}
