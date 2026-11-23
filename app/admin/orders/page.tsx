"use client"

import { useState } from "react"
import Link from "next/link"
import { CalendarDays, MapPin, Search, User } from "lucide-react"
import { useApi } from "@/hooks/use-api"
import type { Order, OrderStatus } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { EmptyState, LoadingState } from "@/components/ui/states"
import { orderStatusLabel, orderStatusTone } from "@/lib/order-status"
import { formatDate, formatPrice } from "@/lib/utils"

const statuses: OrderStatus[] = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "completed",
  "cancelled",
  "out_for_delivery",
  "delivered",
  "rejected",
]

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const query = `/admin/orders${search || status ? `?${new URLSearchParams({ ...(search ? { search } : {}), ...(status ? { status } : {}) }).toString()}` : ""}`
  const { data, loading, error } = useApi<Order[]>(query, [query])

  return (
    <div>
      <h2 className="text-2xl font-black text-gray-900 dark:text-white">
        All orders
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Review every order placed across SliceHub.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-[2fr_1fr]">
        <label className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search address, contact name or phone..."
            className="pl-10"
          />
        </label>
        <Select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">All statuses</option>
          {statuses.map((item) => (
            <option key={item} value={item}>
              {orderStatusLabel(item)}
            </option>
          ))}
        </Select>
      </div>

      {loading && <LoadingState label="Loading orders..." />}
      {!loading && (error || !data?.length) && (
        <div className="mt-8">
          <EmptyState
            title="No orders found"
            message={error || "Try a different search or status filter."}
          />
        </div>
      )}

      <div className="mt-6 space-y-4">
        {data?.map((order) => {
          const total = order.totalAmount ?? order.item?.price ?? 0
          return (
            <div
              key={order._id}
              className="rounded-2xl border border-orange-100 bg-white p-5 dark:border-white/10 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {order.items?.map((line) => line.nameSnapshot).join(", ") ||
                      order.item?.itemName ||
                      "Pizza order"}
                  </p>
                  <p className="mt-1 font-mono text-xs text-gray-400">
                    {order._id}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-[#E5484D]">
                    {formatPrice(total)}
                  </span>
                  <Badge tone={orderStatusTone(order.status)}>
                    {orderStatusLabel(order.status)}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-gray-600 sm:grid-cols-2 dark:text-gray-300">
                <p className="flex items-start gap-2">
                  <User className="mt-0.5 size-4 shrink-0 text-[#E5484D]" />
                  {order.customer?.name ||
                    order.contactName ||
                    "SliceHub customer"}
                </p>
                <p className="flex items-start gap-2">
                  <CalendarDays className="mt-0.5 size-4 shrink-0 text-[#E5484D]" />
                  {formatDate(order.deliveryDate)}
                </p>
                <p className="flex items-start gap-2 sm:col-span-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-[#E5484D]" />
                  {order.deliveryAddress}
                </p>
              </div>

              <div className="mt-4">
                <Link
                  href={`/admin/orders/${order._id}`}
                  className="inline-flex rounded-xl bg-[#E5484D] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#d43b40]"
                >
                  View details
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
