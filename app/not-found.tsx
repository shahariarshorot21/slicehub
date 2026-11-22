import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#FFFBF7] px-4 dark:bg-slate-950">
      <div className="text-center">
        <p className="text-8xl">🍕</p>
        <h1 className="mt-4 text-4xl font-black text-gray-900 dark:text-white">404 — Slice not found</h1>
        <p className="mt-3 text-sm text-gray-500">
          The page you were looking for has been eaten. Let&apos;s get you back to something delicious.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-xl bg-[#E5484D] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#d43b40]">
            Back to home
          </Link>
          <Link href="/menu" className="rounded-xl border border-orange-200 px-5 py-3 text-sm font-bold text-gray-700 dark:text-gray-200">
            Browse menu
          </Link>
        </div>
      </div>
    </main>
  );
}
