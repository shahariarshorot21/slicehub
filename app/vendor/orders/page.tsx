"use client";

import Link from "next/link";
import { CalendarDays, Mail, MapPin, MessageSquare, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { apiFetch } from "@/lib/api";
import type { Order, OrderStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { orderStatusLabel, orderStatusTone } from "@/lib/order-status";
import { orderLineCustomization, orderLineUnitPrice, orderLines, orderTotal } from "@/lib/order-lines";
import { formatDate, formatPrice } from "@/lib/utils";
import Image from "next/image";

const fallbackImage =
  "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=200&q=80";

type Action = { status: OrderStatus; label: string };

const nextActions: Partial<Record<OrderStatus, Action>> = {
  accepted: { status: "preparing", label: "Start preparing" },
  preparing: { status: "ready", label: "Mark ready" },
  ready: { status: "completed", label: "Mark completed" },
  out_for_delivery: { status: "delivered", label: "Mark delivered" },
};

function getLocalOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("slicehub_demo_orders") || "[]");
  } catch {
    return [];
  }
}

function updateLocalOrderStatus(orderId: string, status: OrderStatus) {
  if (typeof window === "undefined") return;
  const current = getLocalOrders();
  const updated = current.map((o) => (o._id === orderId ? { ...o, status } : o));
  localStorage.setItem("slicehub_demo_orders", JSON.stringify(updated));
  window.dispatchEvent(new Event("slicehub-orders-updated"));
}

export default function VendorOrdersPage() {
  const { data: apiOrders, loading } = useApi<Order[]>("/orders/vendor");
  const [localOrders, setLocalOrders] = useState<Order[]>([]);

  useEffect(() => {
    setLocalOrders(getLocalOrders());
    const handleSync = () => setLocalOrders(getLocalOrders());
    window.addEventListener("slicehub-orders-updated", handleSync);
    return () => window.removeEventListener("slicehub-orders-updated", handleSync);
  }, []);

  const data = (() => {
    const combined = [...(apiOrders || []), ...localOrders];
    const map = new Map<string, Order>();
    combined.forEach((o) => {
      if (o && o._id) map.set(o._id, o);
    });
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  })();

  const update = async (order: Order, status: OrderStatus) => {
    try {
      if (order._id.startsWith("demo-")) {
        updateLocalOrderStatus(order._id, status);
        toast.success(`Order marked as ${orderStatusLabel(status)}`);
        return;
      }
      const result = await apiFetch<{ message: string }>(`/orders/vendor/${order._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success(result.message);
    } catch {
      updateLocalOrderStatus(order._id, status);
      toast.success(`Order marked as ${orderStatusLabel(status)}`);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-black text-gray-900 dark:text-white">Customer orders</h2>
      <p className="mt-1 text-sm text-gray-500">
        Only orders for your restaurant are shown. Pending orders can be accepted or cancelled once.
      </p>

      {loading && data.length === 0 && <LoadingState label="Loading orders..." />}
      {!loading && data.length === 0 && (
        <div className="mt-6">
          <EmptyState title="No orders yet" message="Incoming customer orders will show up here." />
        </div>
      )}

      <div className="mt-6 space-y-4">
        {data.map((order) => {
          const lines = orderLines(order);
          const total = orderTotal(order);
          const nextAction = nextActions[order.status];
          return (
            <div key={order._id} className="rounded-2xl border border-orange-100 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {lines.map((line) => line.nameSnapshot || line.menuItem?.itemName).join(", ") || "Pizza order"}
                  </p>
                  <p className="mt-1 font-mono text-xs text-gray-400">{order._id}</p>
                  <p className="mt-1 text-xs text-gray-400">Ordered {formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-[#E5484D]">{formatPrice(total)}</span>
                  <Badge tone={orderStatusTone(order.status)}>{orderStatusLabel(order.status)}</Badge>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {lines.map((line, index) => (
                  <div key={`${line.itemId}-${index}`} className="flex items-center gap-3 rounded-xl bg-orange-50/60 p-2 dark:bg-white/5">
                    <Image
                      src={line.menuItem?.images?.[0] || fallbackImage}
                      alt=""
                      className="size-12 rounded-lg bg-orange-100 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                        {line.nameSnapshot || line.menuItem?.itemName || "Pizza"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {[line.menuItem?.category || "Menu item", orderLineCustomization(line), `${formatPrice(orderLineUnitPrice(line))} each`]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">× {line.quantity}</span>
                    <span className="w-20 text-right text-sm font-black text-[#E5484D]">
                      {formatPrice(orderLineUnitPrice(line) * line.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 text-sm text-gray-600 sm:grid-cols-2 dark:text-gray-300">
                <p className="flex items-start gap-2">
                  <User className="mt-0.5 size-4 shrink-0 text-[#E5484D]" />
                  {order.contactName || order.customer?.name || "SliceHub customer"}
                </p>
                <p className="flex items-start gap-2">
                  <Mail className="mt-0.5 size-4 shrink-0 text-[#E5484D]" />
                  {order.customer?.email || "Email not provided"}
                </p>
                <p className="flex items-start gap-2">
                  <Phone className="mt-0.5 size-4 shrink-0 text-[#E5484D]" />
                  {order.contactPhone || "Contact not provided"}
                </p>
                <p className="flex items-start gap-2">
                  <CalendarDays className="mt-0.5 size-4 shrink-0 text-[#E5484D]" />
                  Delivery: {formatDate(order.deliveryDate)}
                </p>
                <p className="flex items-start gap-2 sm:col-span-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-[#E5484D]" />
                  {order.deliveryAddress}
                </p>
                {order.message && (
                  <p className="flex items-start gap-2 sm:col-span-2">
                    <MessageSquare className="mt-0.5 size-4 shrink-0 text-[#E5484D]" />
                    {order.message}
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Link
                  href={`/vendor/orders/${order._id}`}
                  className="rounded-xl border border-orange-200 px-4 py-2 text-xs font-bold text-gray-700 transition hover:bg-orange-50 dark:text-gray-200 dark:hover:bg-white/10"
                >
                  View details
                </Link>
                {order.status === "pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() => update(order, "accepted")}
                      className="rounded-xl bg-[#E5484D] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#d43b40]"
                    >
                      Accept Order
                    </button>
                    <button
                      type="button"
                      onClick={() => update(order, "cancelled")}
                      className="rounded-xl border border-red-200 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      Reject Order
                    </button>
                  </>
                )}
                {nextAction && (
                  <button
                    type="button"
                    onClick={() => update(order, nextAction.status)}
                    className="rounded-xl border border-orange-200 px-4 py-2 text-xs font-bold text-gray-700 transition hover:bg-orange-50 dark:text-gray-200 dark:hover:bg-white/10"
                  >
                    {nextAction.label}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}