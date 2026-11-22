"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, MessageSquare, Phone, User } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import type { Order } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { OrderStatusTimeline } from "@/components/menu/order-status-timeline";
import { orderStatusLabel, orderStatusTone } from "@/lib/order-status";
import { orderLineCustomization, orderLineTotal, orderLineUnitPrice, orderLines, orderTotal } from "@/lib/order-lines";
import { formatDate, formatPrice } from "@/lib/utils";

export default function CustomerOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: order, loading, error } = useApi<Order>(params?.id ? `/orders/${params.id}` : null);

  if (loading) return <LoadingState label="Loading order details..." />;
  if (error || !order) {
    return (
      <div>
        <EmptyState title="Order not found" message={error || "This order is no longer available."} />
        <div className="mt-5 text-center">
          <Link href="/customer/orders" className="inline-flex items-center gap-2 rounded-xl bg-[#E5484D] px-5 py-3 text-sm font-bold text-white">
            <ArrowLeft className="size-4" /> Back to orders
          </Link>
        </div>
      </div>
    );
  }

  const lines = orderLines(order);

  return (
    <div className="space-y-6">
      <Link href="/customer/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#E5484D]">
        <ArrowLeft className="size-4" /> Back to orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Order details</h2>
          <p className="mt-1 font-mono text-xs text-gray-400">{order._id}</p>
        </div>
        <Badge tone={orderStatusTone(order.status)}>{orderStatusLabel(order.status)}</Badge>
      </div>

      <div className="rounded-2xl border border-orange-100 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
        <h3 className="font-black text-gray-900 dark:text-white">Items</h3>
        <div className="mt-4 space-y-3">
          {lines.map((line, index) => (
            <div key={`${line.itemId}-${index}`} className="flex flex-wrap items-center justify-between gap-3 border-b border-orange-100 pb-3 last:border-0 last:pb-0 dark:border-white/10">
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{line.nameSnapshot || line.menuItem?.itemName || "Pizza"}</p>
                <p className="text-xs text-gray-400">
                  {[
                    `Quantity: ${line.quantity}`,
                    orderLineCustomization(line),
                    `${formatPrice(orderLineUnitPrice(line))} each`,
                  ].filter(Boolean).join(" · ")}
                </p>
              </div>
              <p className="font-bold text-[#E5484D]">{formatPrice(orderLineTotal(line))}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-orange-100 pt-4 dark:border-white/10">
          <span className="text-sm text-gray-500">Total</span>
          <span className="text-xl font-black text-[#E5484D]">{formatPrice(orderTotal(order))}</span>
        </div>
        <OrderStatusTimeline status={order.status} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-orange-100 bg-white p-6 text-sm text-gray-600 dark:border-white/10 dark:bg-slate-900 dark:text-gray-300">
          <h3 className="font-black text-gray-900 dark:text-white">Delivery</h3>
          <p className="flex items-start gap-2"><CalendarDays className="mt-0.5 size-4 shrink-0 text-[#E5484D]" /> {formatDate(order.deliveryDate)}</p>
          <p className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-[#E5484D]" /> {order.deliveryAddress}</p>
          {order.message && <p className="flex items-start gap-2"><MessageSquare className="mt-0.5 size-4 shrink-0 text-[#E5484D]" /> {order.message}</p>}
        </div>
        <div className="space-y-3 rounded-2xl border border-orange-100 bg-white p-6 text-sm text-gray-600 dark:border-white/10 dark:bg-slate-900 dark:text-gray-300">
          <h3 className="font-black text-gray-900 dark:text-white">Contact</h3>
          <p className="flex items-center gap-2"><User className="size-4 text-[#E5484D]" /> {order.contactName || order.customer?.name || "SliceHub customer"}</p>
          <p className="flex items-center gap-2"><Phone className="size-4 text-[#E5484D]" /> {order.contactPhone || "Not provided"}</p>
          <p className="text-xs text-gray-400">Placed {formatDate(order.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}
