import type { OrderStatus } from "@/lib/types";

type Tone = "red" | "green" | "amber" | "gray" | "blue";

export function orderStatusTone(status: OrderStatus): Tone {
  if (status === "accepted" || status === "ready" || status === "completed" || status === "delivered") return "green";
  if (status === "pending" || status === "preparing" || status === "out_for_delivery") return "amber";
  if (status === "cancelled" || status === "rejected") return "red";
  return "gray";
}

export function orderStatusLabel(status: OrderStatus): string {
  const labels: Partial<Record<OrderStatus, string>> = {
    out_for_delivery: "Ready",
    delivered: "Completed",
    rejected: "Cancelled",
  };
  return labels[status] || status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
