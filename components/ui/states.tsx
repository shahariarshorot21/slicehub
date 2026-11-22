import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-40 w-full items-center justify-center gap-2 text-sm text-gray-500">
      <Loader2 className="size-5 animate-spin text-orange-500" />
      {label}
    </div>
  );
}

export function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-3xl border border-dashed border-orange-200 bg-orange-50/50 p-8 text-center">
      <span className="text-3xl">🍕</span>
      <h3 className="mt-3 font-semibold text-gray-800 dark:text-white">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-gray-500">{message}</p>}
    </div>
  );
}
