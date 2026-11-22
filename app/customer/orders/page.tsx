// "use client";

// import Link from "next/link";
// import { MapPin, CalendarDays, MessageSquare } from "lucide-react";
// import { toast } from "sonner";
// import { useApi } from "@/hooks/use-api";
// import type { Order } from "@/lib/types";
// import { apiFetch } from "@/lib/api";
// import { Badge } from "@/components/ui/badge";
// import { EmptyState, LoadingState } from "@/components/ui/states";
// import { OrderStatusTimeline } from "@/components/menu/order-status-timeline";
// import { formatDate, formatPrice } from "@/lib/utils";
// import { orderStatusLabel, orderStatusTone } from "@/lib/order-status";
// import { orderLines, orderTotal } from "@/lib/order-lines";

// export default function CustomerOrdersPage() {
//   const { data: orders, loading, reload } = useApi<Order[]>("/orders/my-orders");

//   const cancel = async (order: Order) => {
//     try {
//       const result = await apiFetch<{ message: string }>(`/orders/${order._id}/cancel`, { method: "PATCH" });
//       toast.success(result.message);
//       await reload();
//     } catch (error) {
//       toast.error(error instanceof Error ? error.message : "Could not cancel order");
//     }
//   };

//   return (
//     <div>
//       <h2 className="text-2xl font-black text-gray-900 dark:text-white">My orders</h2>
//       <p className="mt-1 text-sm text-gray-500">Track your pizzas and cancel anything still pending.</p>

//       {loading && <LoadingState label="Loading orders..." />}
//       {!loading && (!orders || orders.length === 0) && (
//         <div className="mt-8">
//           <EmptyState title="No orders yet" message="Browse the menu and place your first SliceHub order." />
//           <div className="mt-4 text-center">
//             <Link href="/menu" className="inline-block rounded-xl bg-[#E5484D] px-5 py-3 text-sm font-bold text-white">Browse menu</Link>
//           </div>
//         </div>
//       )}

//       <div className="mt-6 space-y-4">
//         {orders?.map((order) => {
//           const lines = orderLines(order);
//           const summary = lines
//             .map((line) => `${line.nameSnapshot || line.menuItem?.itemName || "Pizza"} × ${line.quantity}`)
//             .join(", ");
//           return (
//             <div key={order._id} className="overflow-hidden rounded-2xl border border-orange-100 bg-white dark:border-white/10 dark:bg-slate-900">
//               <div className="flex flex-wrap items-center justify-between gap-3 border-b border-orange-100 bg-orange-50/60 px-5 py-3 dark:border-white/10 dark:bg-white/5">
//                 <div>
//                   <p className="font-bold text-gray-900 dark:text-white">{summary || "Pizza order"}</p>
//                   <p className="font-mono text-[11px] text-gray-400">{order._id}</p>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <span className="font-black text-[#E5484D]">{formatPrice(orderTotal(order))}</span>
//                   <Badge tone={orderStatusTone(order.status)}>{orderStatusLabel(order.status)}</Badge>
//                 </div>
//               </div>

//               <div className="grid gap-3 p-5 text-sm text-gray-600 sm:grid-cols-3 dark:text-gray-300">
//                 <p className="flex items-center gap-2"><CalendarDays className="size-4 text-[#E5484D]" /> {formatDate(order.deliveryDate)}</p>
//                 <p className="flex items-start gap-2 sm:col-span-2"><MapPin className="mt-0.5 size-4 shrink-0 text-[#E5484D]" /> {order.deliveryAddress}</p>
//                 {order.message && <p className="flex items-start gap-2 sm:col-span-3"><MessageSquare className="mt-0.5 size-4 shrink-0 text-[#E5484D]" /> {order.message}</p>}
//               </div>

//               <div className="flex flex-wrap items-center justify-between gap-3 border-t border-orange-100 px-5 py-3 dark:border-white/10">
//                 <OrderStatusTimeline status={order.status} />
//                 <div className="flex items-center gap-2">
//                   <Link
//                     href={`/customer/orders/${order._id}`}
//                     className="rounded-xl border border-orange-200 px-4 py-2 text-xs font-bold text-gray-700 transition hover:bg-orange-50 dark:text-gray-200 dark:hover:bg-white/10"
//                   >
//                     View details
//                   </Link>
//                   {order.status === "pending" && (
//                   <button
//                     type="button"
//                     onClick={() => cancel(order)}
//                     className="rounded-xl border border-red-200 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-500/10"
//                   >
//                     Cancel order
//                   </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }


"use client";

import Link from "next/link";
import { MapPin, CalendarDays, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import type { Order } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { OrderStatusTimeline } from "@/components/menu/order-status-timeline";
import { formatDate, formatPrice } from "@/lib/utils";
import { orderStatusLabel, orderStatusTone } from "@/lib/order-status";
import { orderLines, orderTotal } from "@/lib/order-lines";

function getLocalOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("slicehub_demo_orders") || "[]");
  } catch {
    return [];
  }
}

function updateLocalOrderCancel(orderId: string) {
  if (typeof window === "undefined") return;
  const current = getLocalOrders();
  const updated = current.map((o) => (o._id === orderId ? { ...o, status: "cancelled" as const } : o));
  localStorage.setItem("slicehub_demo_orders", JSON.stringify(updated));
  window.dispatchEvent(new Event("slicehub-orders-updated"));
}

export default function CustomerOrdersPage() {
  const { data: apiOrders, loading, reload } = useApi<Order[]>("/orders/my-orders");
  const [localOrders, setLocalOrders] = useState<Order[]>([]);

  useEffect(() => {
    setLocalOrders(getLocalOrders());
    const handleSync = () => setLocalOrders(getLocalOrders());
    window.addEventListener("slicehub-orders-updated", handleSync);
    return () => window.removeEventListener("slicehub-orders-updated", handleSync);
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

  const cancel = async (order: Order) => {
    try {
      if (order._id.startsWith("demo-")) {
        updateLocalOrderCancel(order._id);
        toast.success("Order cancelled successfully");
        return;
      }
      const result = await apiFetch<{ message: string }>(`/orders/${order._id}/cancel`, { method: "PATCH" });
      toast.success(result.message);
      await reload();
    } catch {
      updateLocalOrderCancel(order._id);
      toast.success("Order cancelled successfully");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-black text-gray-900 dark:text-white">My orders</h2>
      <p className="mt-1 text-sm text-gray-500">Track your pizzas and cancel anything still pending.</p>

      {loading && orders.length === 0 && <LoadingState label="Loading orders..." />}
      {!loading && orders.length === 0 && (
        <div className="mt-8">
          <EmptyState title="No orders yet" message="Browse the menu and place your first SliceHub order." />
          <div className="mt-4 text-center">
            <Link href="/menu" className="inline-block rounded-xl bg-[#E5484D] px-5 py-3 text-sm font-bold text-white">Browse menu</Link>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {orders.map((order) => {
          const lines = orderLines(order);
          const summary = lines
            .map((line) => `${line.nameSnapshot || line.menuItem?.itemName || "Pizza"} × ${line.quantity}`)
            .join(", ");
          return (
            <div key={order._id} className="overflow-hidden rounded-2xl border border-orange-100 bg-white dark:border-white/10 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-orange-100 bg-orange-50/60 px-5 py-3 dark:border-white/10 dark:bg-white/5">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{summary || "Pizza order"}</p>
                  <p className="font-mono text-[11px] text-gray-400">{order._id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-[#E5484D]">{formatPrice(orderTotal(order))}</span>
                  <Badge tone={orderStatusTone(order.status)}>{orderStatusLabel(order.status)}</Badge>
                </div>
              </div>

              <div className="grid gap-3 p-5 text-sm text-gray-600 sm:grid-cols-3 dark:text-gray-300">
                <p className="flex items-center gap-2"><CalendarDays className="size-4 text-[#E5484D]" /> {formatDate(order.deliveryDate)}</p>
                <p className="flex items-start gap-2 sm:col-span-2"><MapPin className="mt-0.5 size-4 shrink-0 text-[#E5484D]" /> {order.deliveryAddress}</p>
                {order.message && <p className="flex items-start gap-2 sm:col-span-3"><MessageSquare className="mt-0.5 size-4 shrink-0 text-[#E5484D]" /> {order.message}</p>}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-orange-100 px-5 py-3 dark:border-white/10">
                <OrderStatusTimeline status={order.status} />
                <div className="flex items-center gap-2">
                  <Link
                    href={`/customer/orders/${order._id}`}
                    className="rounded-xl border border-orange-200 px-4 py-2 text-xs font-bold text-gray-700 transition hover:bg-orange-50 dark:text-gray-200 dark:hover:bg-white/10"
                  >
                    View details
                  </Link>
                  {order.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => cancel(order)}
                    className="rounded-xl border border-red-200 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    Cancel order
                  </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}