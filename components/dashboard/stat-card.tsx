import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "red",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "red" | "amber" | "green" | "blue";
}) {
  const tones = {
    red: "bg-[#FFE7DE] text-[#E5484D]",
    amber: "bg-amber-100 text-amber-700",
    green: "bg-emerald-100 text-emerald-700",
    blue: "bg-sky-100 text-sky-700",
  } as const;

  return (
    <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{label}</p>
          <p className="mt-2 text-2xl font-black text-gray-900 dark:text-white">{value}</p>
        </div>
        <span className={`flex size-10 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}
