"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import type { Transaction } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { formatDate, formatPrice } from "@/lib/utils";
import Image from "next/image";

type SubscriptionStatus = "free" | "active" | "expired";

type SubscriptionRow = {
  _id: string;
  name: string;
  email: string;
  image?: string | null;
  businessName?: string | null;
  isBlocked?: boolean;
  joinedAt?: string;
  startDate?: string;
  subscriptionPlan?: "free" | "premium";
  subscriptionExpiresAt?: string | null;
  status: SubscriptionStatus;
  amountCents: number;
  paymentStatus: "pending" | "completed" | "failed" | "refunded" | "none";
  paymentMethod?: string | null;
  transactionCount: number;
  totalPaidCents: number;
  latestTransaction: Transaction | null;
};

type SubscriptionDetail = SubscriptionRow & { transactions: Transaction[] };

function statusTone(status: SubscriptionStatus) {
  if (status === "active") return "green" as const;
  if (status === "expired") return "red" as const;
  return "gray" as const;
}

function paymentTone(status?: string) {
  if (status === "completed") return "green" as const;
  if (status === "failed" || status === "refunded") return "red" as const;
  return "amber" as const;
}

function paymentLabel(status?: string) {
  if (!status) return "No payment";
  if (status === "completed") return "Successful";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function AdminSubscriptionsPage() {
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("");
  const [payment, setPayment] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filters = {
    ...(search ? { search } : {}),
    ...(plan ? { plan } : {}),
    ...(status ? { status } : {}),
    ...(payment ? { payment } : {}),
  };
  const query = `/admin/subscriptions${Object.keys(filters).length ? `?${new URLSearchParams(filters).toString()}` : ""}`;
  const { data, loading, error } = useApi<SubscriptionRow[]>(query, [query]);
  const {
    data: detail,
    loading: detailLoading,
    error: detailError,
  } = useApi<SubscriptionDetail>(selectedId ? `/admin/subscriptions/${selectedId}` : null, [selectedId]);

  const active = data?.filter((row) => row.status === "active").length || 0;
  const expired = data?.filter((row) => row.status === "expired").length || 0;
  const free = data?.filter((row) => row.status === "free").length || 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Subscription management</h2>
          <p className="mt-1 text-sm text-gray-500">
            Vendor plans and payment history read directly from MongoDB records.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            {active} active
          </span>
          <span className="rounded-full bg-red-50 px-3 py-2 text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {expired} expired
          </span>
          <span className="rounded-full bg-gray-100 px-3 py-2 text-gray-700 dark:bg-white/10 dark:text-gray-200">
            {free} free
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search vendor, email or restaurant..."
            className="pl-10"
          />
        </label>
        <Select value={plan} onChange={(event) => setPlan(event.target.value)} aria-label="Filter by plan">
          <option value="">All plans</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
        </Select>
        <Select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by subscription status">
          <option value="">All subscription states</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="free">Free</option>
        </Select>
        <Select value={payment} onChange={(event) => setPayment(event.target.value)} aria-label="Filter by latest payment status">
          <option value="">All payment states</option>
          <option value="none">No payment</option>
          <option value="pending">Pending</option>
          <option value="completed">Successful</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </Select>
      </div>

      {loading && <LoadingState label="Loading subscriptions..." />}
      {!loading && error && (
        <div className="mt-8"><EmptyState title="Could not load subscriptions" message={error} /></div>
      )}
      {!loading && !error && (!data || data.length === 0) && (
        <div className="mt-8"><EmptyState title="No subscriptions found" message="Try a different search or filter." /></div>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-orange-100 bg-white dark:border-white/10 dark:bg-slate-900">
        <table className="w-full min-w-[1120px] text-left text-sm">
          <thead className="bg-orange-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-white/5">
            <tr>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Start</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Latest payment</th>
              <th className="px-4 py-3">Payments</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-100 dark:divide-white/10">
            {data?.map((row) => (
              <tr key={row._id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {row.image ? (
                      <Image src={row.image} alt="" className="size-9 rounded-full bg-orange-100 object-cover" />
                    ) : (
                      <span className="flex size-9 items-center justify-center rounded-full bg-orange-100 text-xs font-black text-[#E5484D]">
                        {row.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{row.businessName || row.name}</p>
                      <p className="text-xs text-gray-400">{row.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 capitalize text-gray-600 dark:text-gray-300">
                  {row.subscriptionPlan || "free"}
                </td>
                <td className="px-4 py-3"><Badge tone={statusTone(row.status)}>{row.status}</Badge></td>
                <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                  {formatPrice(row.amountCents / 100)}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {row.startDate ? formatDate(row.startDate) : "—"}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {row.subscriptionExpiresAt ? formatDate(row.subscriptionExpiresAt) : "No expiry set"}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={paymentTone(row.paymentStatus)}>{paymentLabel(row.paymentStatus)}</Badge>
                  <p className="mt-1 text-xs capitalize text-gray-400">
                    {row.paymentMethod || "Method not recorded"}
                  </p>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                  <p className="font-bold">{row.transactionCount}</p>
                  <p className="text-xs text-gray-400">{formatPrice(row.totalPaidCents / 100)} paid</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedId(row._id)}
                      className="rounded-lg bg-[#E5484D] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#d43b40]"
                    >
                      View history
                    </button>
                    <Link
                      href={`/admin/users/${row._id}`}
                      className="rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-orange-50 dark:text-gray-200 dark:hover:bg-white/10"
                    >
                      Vendor
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={Boolean(selectedId)}
        onClose={() => setSelectedId(null)}
        title="Subscription details"
        className="max-w-2xl"
      >
        {detailLoading && <LoadingState label="Loading payment history..." />}
        {!detailLoading && detailError && (
          <EmptyState title="Could not load details" message={detailError} />
        )}
        {!detailLoading && detail && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <Detail label="Vendor" value={detail.businessName || detail.name} />
              <Detail label="Plan" value={detail.subscriptionPlan || "free"} />
              <Detail label="Status" value={detail.status} />
              <Detail label="Latest amount" value={formatPrice(detail.amountCents / 100)} />
              <Detail label="Subscription start" value={detail.startDate ? formatDate(detail.startDate) : "—"} />
              <Detail label="Joined" value={detail.joinedAt ? formatDate(detail.joinedAt) : "—"} />
              <Detail
                label="Expires"
                value={detail.subscriptionExpiresAt ? formatDate(detail.subscriptionExpiresAt) : "No expiry set"}
              />
              <Detail label="Payment status" value={paymentLabel(detail.paymentStatus)} />
              <Detail label="Payment method" value={detail.paymentMethod || "Not recorded"} />
              <Detail label="Paid to date" value={formatPrice(detail.totalPaidCents / 100)} />
            </div>

            <div>
              <h3 className="font-black text-gray-900 dark:text-white">Payment history</h3>
              {!detail.transactions?.length && (
                <p className="mt-3 rounded-xl bg-orange-50 p-4 text-sm text-gray-500 dark:bg-white/5">
                  No payment records exist for this vendor.
                </p>
              )}
              <div className="mt-3 space-y-2">
                {detail.transactions?.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-orange-100 p-3 dark:border-white/10"
                  >
                    <div>
                      <p className="font-mono text-xs text-gray-500">{transaction._id.slice(-10)}</p>
                      <p className="text-xs text-gray-400">
                        {transaction.createdAt ? formatDate(transaction.createdAt) : "—"}
                      </p>
                      <p className="text-xs capitalize text-gray-400">
                        {transaction.paymentMethod || "Method not recorded"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-gray-900 dark:text-white">
                        {formatPrice(transaction.amount / 100)}
                      </span>
                      <Badge tone={paymentTone(transaction.status)}>{paymentLabel(transaction.status)}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href={`/admin/users/${detail._id}`}
              onClick={() => setSelectedId(null)}
              className="inline-flex rounded-xl bg-[#E5484D] px-4 py-2.5 text-sm font-bold text-white"
            >
              Open vendor account
            </Link>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-orange-100 p-3 dark:border-white/10">
      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 truncate font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
