"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Crown,
  ListChecks,
  Package,
  RefreshCw,
  ShoppingBag,
  UserCheck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { orderStatusLabel, orderStatusTone } from "@/lib/order-status";
import type { Order, OrderStatus, Role, Transaction } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";

type CountRow = { _id: string; count: number };
type RecentUser = { _id: string; name: string; email: string; role: Role; createdAt: string };
type RecentMenuItem = {
  _id: string;
  itemName: string;
  status: string;
  vendorName?: string;
  restaurantName?: string;
  createdAt: string;
};

type Overview = {
  totalUsers: number;
  totalCustomers: number;
  totalVendors: number;
  totalAdmins: number;
  totalMenuItems: number;
  pendingMenuItems: number;
  approvedMenuItems: number;
  rejectedMenuItems: number;
  totalOrders: number;
  totalTransactions: number;
  revenue: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  pendingPayments: number;
  ordersByStatus: CountRow[];
  menuItemsByStatus: CountRow[];
  transactionsByStatus: CountRow[];
  recentUsers: RecentUser[];
  recentMenuItems: RecentMenuItem[];
  recentOrders: Order[];
  recentTransactions: Transaction[];
};

const chartColors = ["#E5484D", "#F97316", "#2A1512", "#0EA5E9"];

function transactionLabel(status: string) {
  if (status === "completed") return "Successful";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function transactionTone(status: string) {
  if (status === "completed") return "green" as const;
  if (status === "failed" || status === "refunded") return "red" as const;
  return "amber" as const;
}

function statusRows(rows: CountRow[] | undefined, labels?: Record<string, string>) {
  return (rows || []).map((row) => ({
    name: labels?.[row._id] || row._id.charAt(0).toUpperCase() + row._id.slice(1),
    value: row.count,
  }));
}

export default function AdminOverview() {
  const { data, loading, error, reload } = useApi<Overview>("/admin/overview");
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const usersData = [
    { name: "Customers", value: data?.totalCustomers || 0 },
    { name: "Vendors", value: data?.totalVendors || 0 },
    { name: "Admins", value: data?.totalAdmins || 0 },
  ];
  const menuStatusData = statusRows(data?.menuItemsByStatus);
  const transactionStatusData = statusRows(data?.transactionsByStatus, {
    completed: "Successful",
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#2A1512] to-[#E5484D] p-8 text-white">
        <div>
          <h2 className="text-2xl font-black sm:text-3xl">Platform overview</h2>
          <p className="mt-2 text-sm text-white/75">
            A live snapshot of users, menu moderation and subscription payments.
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing || loading}
          className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/25 disabled:opacity-60"
        >
          <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh stats"}
        </button>
      </div>

      {loading && <LoadingState label="Loading statistics..." />}
      {!loading && error && <EmptyState title="Could not load statistics" message={error} />}

      {!loading && data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Total registered users" value={data.totalUsers} icon={Users} />
            <StatCard label="Total vendors" value={data.totalVendors} icon={UserCheck} tone="amber" />
            <StatCard label="Total customers" value={data.totalCustomers} icon={UserPlus} tone="blue" />
            <StatCard label="Total pizzas" value={data.totalMenuItems} icon={Package} tone="blue" />
            <StatCard label="Pending pizzas" value={data.pendingMenuItems} icon={ListChecks} tone="red" />
            <StatCard label="Approved pizzas" value={data.approvedMenuItems} icon={CheckCircle2} tone="green" />
            <StatCard label="Rejected pizzas" value={data.rejectedMenuItems} icon={XCircle} tone="red" />
            <StatCard label="Total transactions" value={data.totalTransactions} icon={CreditCard} tone="green" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total orders" value={data.totalOrders} icon={ShoppingBag} tone="green" />
            <StatCard label="Revenue collected" value={formatPrice(data.revenue)} icon={CircleDollarSign} tone="amber" />
            <StatCard label="Active subscriptions" value={data.activeSubscriptions} icon={Crown} tone="blue" />
            <StatCard label="Expired subscriptions" value={data.expiredSubscriptions} icon={CalendarClock} tone="red" />
            <StatCard label="Pending payments" value={data.pendingPayments} icon={Clock3} tone="amber" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <ChartCard title="User distribution">
              <PieChart>
                <Pie
                  data={usersData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {usersData.map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
              <div className="mt-2 grid gap-1 text-xs">
                {usersData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-500">
                      <span className="size-2 rounded-full" style={{ background: chartColors[index] }} />
                      {entry.name}
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">{entry.value}</span>
                  </div>
                ))}
              </div>
            </ChartCard>

            <ChartCard title="Menu item status">
              <PieChart>
                <Pie
                  data={menuStatusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {menuStatusData.map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
              {!menuStatusData.length && <p className="mt-2 text-center text-xs text-gray-400">No menu items yet</p>}
            </ChartCard>

            <ChartCard title="Transaction overview">
              <BarChart data={transactionStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1e8e2" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#E5484D" radius={[6, 6, 0, 0]} />
              </BarChart>
              {!transactionStatusData.length && (
                <p className="mt-2 text-center text-xs text-gray-400">No transactions yet</p>
              )}
            </ChartCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <ActivityCard
              title="Recent registrations"
              href="/admin/users"
              linkLabel="Manage users"
              emptyTitle="No users yet"
            >
              {data.recentUsers?.map((user) => (
                <ActivityRow
                  key={user._id}
                  title={user.name}
                  subtitle={`${user.email} · ${user.role}`}
                  date={user.createdAt}
                />
              ))}
            </ActivityCard>

            <ActivityCard
              title="Submitted menu items"
              href="/admin/menu?status=pending"
              linkLabel="Review menu"
              emptyTitle="No menu items yet"
            >
              {data.recentMenuItems?.map((item) => (
                <ActivityRow
                  key={item._id}
                  title={item.itemName}
                  subtitle={`${item.restaurantName || item.vendorName || "Vendor"} · ${item.status}`}
                  date={item.createdAt}
                />
              ))}
            </ActivityCard>

            <ActivityCard
              title="Recent transactions"
              href="/admin/transactions"
              linkLabel="View transactions"
              emptyTitle="No transactions yet"
            >
              {data.recentTransactions?.map((transaction) => (
                <ActivityRow
                  key={transaction._id}
                  title={transaction.vendor?.name || "Unknown vendor"}
                  subtitle={`${transactionLabel(transaction.status)} · ${formatPrice(transaction.amount / 100)}`}
                  date={transaction.createdAt}
                  tone={transactionTone(transaction.status)}
                />
              ))}
            </ActivityCard>
          </div>

          <section className="rounded-2xl border border-orange-100 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Recent orders</h3>
              <Link href="/admin/orders" className="text-sm font-bold text-[#E5484D] hover:underline">
                View all
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {!data.recentOrders?.length && (
                <EmptyState title="No orders yet" message="Customer orders will appear here." />
              )}
              {data.recentOrders?.map((order) => (
                <div
                  key={order._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-orange-100 p-3 dark:border-white/10"
                >
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {order.items?.map((line) => line.nameSnapshot).join(", ") ||
                        order.item?.itemName ||
                        "Pizza order"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {order.customer?.name || "Customer"} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#E5484D]">
                      {formatPrice(order.totalAmount ?? order.item?.price ?? 0)}
                    </span>
                    <Badge tone={orderStatusTone(order.status)}>{orderStatusLabel(order.status as OrderStatus)}</Badge>
                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="text-xs font-bold text-[#E5484D] hover:underline"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin/users" className="rounded-xl bg-[#E5484D] px-5 py-2.5 text-sm font-bold text-white">
              Manage users
            </Link>
            <Link
              href="/admin/menu?status=pending"
              className="rounded-xl border border-orange-200 px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200"
            >
              Review pending items
            </Link>
            <Link
              href="/admin/subscriptions"
              className="rounded-xl border border-orange-200 px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200"
            >
              Manage subscriptions
            </Link>
            {data.pendingMenuItems > 0 && (
              <span className="inline-flex items-center rounded-xl bg-amber-50 px-5 py-2.5 text-sm font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                {data.pendingMenuItems} awaiting review
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-orange-100 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
      <h3 className="text-lg font-black text-gray-900 dark:text-white">{title}</h3>
      <div className="mt-4 h-48">
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      </div>
    </section>
  );
}

function ActivityCard({
  title,
  href,
  linkLabel,
  emptyTitle,
  children,
}: {
  title: string;
  href: string;
  linkLabel: string;
  emptyTitle: string;
  children?: React.ReactNode;
}) {
  const count = Array.isArray(children) ? children.length : 0;
  return (
    <section className="rounded-2xl border border-orange-100 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-black text-gray-900 dark:text-white">{title}</h3>
        <Link href={href} className="text-xs font-bold text-[#E5484D] hover:underline">
          {linkLabel}
        </Link>
      </div>
      <div className="mt-4 space-y-3">
        {!count && <EmptyState title={emptyTitle} />}
        {children}
      </div>
    </section>
  );
}

function ActivityRow({
  title,
  subtitle,
  date,
  tone = "gray",
}: {
  title: string;
  subtitle: string;
  date: string;
  tone?: "gray" | "green" | "red" | "amber";
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-orange-100 p-3 dark:border-white/10">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{title}</p>
        <p className="truncate text-xs text-gray-400">{subtitle}</p>
        <p className="mt-1 text-[11px] text-gray-400">{formatDate(date)}</p>
      </div>
      <Badge tone={tone}>{formatDate(date)}</Badge>
    </div>
  );
}
