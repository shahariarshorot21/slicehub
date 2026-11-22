import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  tone?: "red" | "green" | "amber" | "gray" | "blue";
};

const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  red: "bg-red-50 text-red-700 border-red-200",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  gray: "bg-gray-100 text-gray-700 border-gray-200",
  blue: "bg-sky-50 text-sky-700 border-sky-200",
};

export function Badge({ children, className, tone = "gray" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
