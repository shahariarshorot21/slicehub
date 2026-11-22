import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-orange-100 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900",
        className
      )}
    >
      {children}
    </div>
  );
}
