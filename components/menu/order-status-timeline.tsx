import { Check, CheckCircle2, Clock, CookingPot, PackageCheck, X } from "lucide-react";
import type { OrderStatus } from "@/lib/types";

const progressSteps: { key: OrderStatus; label: string; description: string }[] = [
  { key: "pending", label: "Pending", description: "Order placed and waiting for the vendor" },
  { key: "accepted", label: "Accepted", description: "Vendor accepted your order" },
  { key: "preparing", label: "Preparing", description: "Your pizza is being prepared" },
  { key: "ready", label: "Ready", description: "Your order is ready for handover" },
  { key: "completed", label: "Completed", description: "Your order has been completed" },
];

const failureSteps: { key: OrderStatus; label: string; description: string }[] = [
  { key: "cancelled", label: "Cancelled", description: "This order was cancelled" },
];

/** Older orders used these values before the canonical statuses were introduced. */
const legacyStatusMap: Partial<Record<OrderStatus, OrderStatus>> = {
  out_for_delivery: "ready",
  delivered: "completed",
  rejected: "cancelled",
};

function currentStatus(status: OrderStatus): OrderStatus {
  return legacyStatusMap[status] || status;
}

function stepIcon(status: OrderStatus) {
  if (status === "pending") return Clock;
  if (status === "accepted") return Check;
  if (status === "preparing") return CookingPot;
  if (status === "ready") return PackageCheck;
  if (status === "completed") return CheckCircle2;
  return X;
}

export function OrderStatusTimeline({ status }: { status: OrderStatus }) {
  const normalized = currentStatus(status);
  const failed = failureSteps.some((step) => step.key === normalized);
  const activeIndex = progressSteps.findIndex((step) => step.key === normalized);

  const steps = failed
    ? [...progressSteps, ...failureSteps]
    : progressSteps;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step, index) => {
          const Icon = stepIcon(step.key);
          const isActive = index === (failed ? steps.length - 1 : activeIndex);
          const isDone = !failed && index < activeIndex;
          const isFailure = failed && step.key === normalized;
          return (
            <div
              key={step.key}
              className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${
                isFailure
                  ? "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20"
                  : isActive
                    ? "border-red-200 bg-red-50/70 dark:border-red-900/50 dark:bg-red-950/10"
                    : isDone
                      ? "border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/10"
                      : "border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900"
              }`}
            >
              <span
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  isFailure
                    ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300"
                    : isActive || isDone
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{step.label}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
