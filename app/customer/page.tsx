"use client";

import Link from "next/link";
import { CheckCircle2, Clock3, Heart, ShoppingBag, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import type { Order, OrderStatus, Pizza } from "@/lib/types";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { Badge } from "@/components/ui/badge";
import { OrderStatusTimeline } from "@/components/menu/order-status-timeline";
import { orderStatusLabel, orderStatusTone } from "@/lib/order-status";
import { orderLines, orderTotal } from "@/lib/order-lines";
import { formatDate, formatPrice } from "@/lib/utils";

const activeStatuses: OrderStatus[] = ["pending", "accepted", "preparing", "ready", "out_for_delivery"];
const completedStatuses: OrderStatus[] = ["completed", "delivered"];
const cancelledStatuses: OrderStatus[] = ["cancelled", "rejected"];

function getLocalOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("slicehub_demo_orders") || "[]");
  } catch {
    return [];
  }
}

function getLocalFavorites(): Pizza[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("slicehub_demo_favorites") || "[]");
  } catch {
    return [];
  }
}

export default function CustomerOverview() {
  const { data: apiOrders, loading: ordersLoading } = useApi<Order[]>("/orders/my-orders");
  const { data: apiFavorites, loading: favLoading } = useApi<Pizza[]>("/me/favorites");

  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  const [localFavorites, setLocalFavorites] = useState<Pizza[]>([]);

  useEffect(() => {
    setLocalOrders(getLocalOrders());
    setLocalFavorites(getLocalFavorites());

    const handleSync = () => {
      setLocalOrders(getLocalOrders());
      setLocalFavorites(getLocalFavorites());
    };

    window.addEventListener("slicehub-orders-updated", handleSync);
    window.addEventListener("slicehub-favorites-updated", handleSync);
    return () => {
      window.removeEventListener("slicehub-orders-updated", handleSync);
      window.removeEventListener("slicehub-favorites-updated", handleSync);
    };
  }, []);

  const orders = (() => {
    const combined = [...(apiOrders || []), ...localOrders];
    const map = new Map<string, Order>();
    combined.forEach((o) => {
      if (o && o._id) map.set(o._id, o);
    });
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  })();

  const favorites = (() => {
    const combined = [...(apiFavorites || []), ...localFavorites];
    const map = new Map<string, Pizza>();
    combined.forEach((p) => {
      if (p && p._id) map.set(p._id, p);
    });
    return Array.from(map.values());
  })();

  const pending = orders.filter((order) => activeStatuses.includes(order.status)).length;
  const completed = orders.filter((order) => completedStatuses.includes(order.status)).length;
  const cancelled = orders.filter((order) => cancelledStatuses.includes(order.status)).length;

  const loading = ordersLoading && favLoading && orders.length === 0 && favorites.length === 0;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-[#E5484D] to-[#F97316] p-8 text-white shadow-lg">
        <h2 className="text-2xl font-black sm:text-3xl">Good to see you! 👋</h2>
        <p className="mt-2 text-sm text-white/80">Ready for another slice? Explore the menu and place your next order.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#E5484D] transition hover:bg-orange-50"
          >
            Browse pizzas
          </Link>
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
          >
            View cart
          </Link>
        </div>
      </div>

      {loading && <LoadingState label="Loading your dashboard..." />}

      {!loading && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Total orders" value={orders.length} icon={ShoppingBag} />
            <StatCard label="Pending" value={pending} icon={Clock3} tone="amber" />
            <StatCard label="Completed" value={completed} icon={CheckCircle2} tone="green" />
            <StatCard label="Cancelled" value={cancelled} icon={XCircle} tone="red" />
            <StatCard label="Favourites" value={favorites.length} icon={Heart} tone="blue" />
          </div>

          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Recent orders</h3>
              <Link href="/customer/orders" className="text-sm font-bold text-[#E5484D] hover:underline">Order history</Link>
            </div>
            <div className="mt-4 space-y-3">
              {orders.length === 0 && <EmptyState title="No orders yet" message="Your pizza orders will appear here." />}
              {orders.slice(0, 3).map((order) => {
                const lines = orderLines(order);
                const total = orderTotal(order);
                const summary = lines
                  .map((line) => `${line.nameSnapshot || line.menuItem?.itemName || "Pizza"} × ${line.quantity}`)
                  .join(", ");
                return (
                  <div key={order._id} className="rounded-2xl border border-orange-100 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {summary || "Pizza order"}
                        </p>
                        <p className="text-xs text-gray-400">Placed {formatDate(order.createdAt)} · Delivery {formatDate(order.deliveryDate)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#E5484D]">{formatPrice(total)}</span>
                        <Badge tone={orderStatusTone(order.status)}>{orderStatusLabel(order.status)}</Badge>
                      </div>
                    </div>
                    <OrderStatusTimeline status={order.status} />
                    <div className="mt-3 text-right">
                      <Link href={`/customer/orders/${order._id}`} className="text-xs font-bold text-[#E5484D] hover:underline">
                        View order details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}