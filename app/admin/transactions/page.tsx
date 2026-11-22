"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import type { Transaction } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { formatDate, formatPrice } from "@/lib/utils";

type AdminTransaction = Transaction & {
  restaurantName?: string;
};

function statusLabel(status: string) {
  if (status === "completed") return "Successful";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusTone(status: string) {
  if (status === "completed") return "green" as const;
  if (status === "failed" || status === "refunded") return "red" as const;
  return "amber" as const;
}

export default function AdminTransactionsPage() {
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [selected, setSelected] = useState<AdminTransaction | null>(null);

  const filters = {
    ...(search ? { search } : {}),
    ...(plan ? { plan } : {}),
    ...(status ? { status } : {}),
    ...(date ? { date } : {}),
  };
  const query = `/admin/transactions${Object.keys(filters).length ? `?${new URLSearchParams(filters).toString()}` : ""}`;
  const { data, loading, error } = useApi<AdminTransaction[]>(query, [query]);
  const total = data?.filter((item) => item.status === "completed").reduce((sum, item) => sum + item.amount, 0) || 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Platform transactions</h2>
          <p className="mt-1 text-sm text-gray-500">
            Read-only subscription payment records. Payment status changes are made only by the verified gateway.
          </p>
        </div>
        <div className="rounded-2xl bg-emerald-50 px-5 py-3 dark:bg-emerald-500/10">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Filtered total collected</p>
          <p className="text-xl font-black text-emerald-700">{formatPrice(total / 100)}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <label className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search transaction ID or vendor..."
            className="pl-10"
          />
        </label>
        <Select value={plan} onChange={(event) => setPlan(event.target.value)} aria-label="Filter by subscription plan">
          <option value="">All plans</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
        </Select>
        <Select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by payment status">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Successful</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </Select>
        <Input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          aria-label="Filter by transaction date"
        />
      </div>

      {loading && <LoadingState label="Loading transactions..." />}
      {!loading && error && (
        <div className="mt-8"><EmptyState title="Could not load transactions" message={error} /></div>
      )}
      {!loading && !error && (!data || data.length === 0) && (
        <div className="mt-8"><EmptyState title="No transactions found" message="Try a different search or filter." /></div>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-orange-100 bg-white dark:border-white/10 dark:bg-slate-900">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-orange-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-white/5">
            <tr>
              <th className="px-4 py-3">Transaction</th>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">Restaurant</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-100 dark:divide-white/10">
            {data?.map((item) => (
              <tr key={item._id}>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{item._id.slice(-10)}</td>
                <td className="px-4 py-3">
                  <p className="font-bold text-gray-900 dark:text-white">{item.vendor?.name || "Unknown vendor"}</p>
                  <p className="text-xs text-gray-400">{item.vendor?.email || ""}</p>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.restaurantName || "—"}</td>
                <td className="px-4 py-3 capitalize text-gray-600 dark:text-gray-300">{item.plan}</td>
                <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">{formatPrice(item.amount / 100)}</td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone(item.status)}>{statusLabel(item.status)}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(item.createdAt)}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className="text-xs font-bold text-[#E5484D] hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Transaction details" className="max-w-xl">
        {selected && (
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <DetailRow label="Transaction ID" value={selected._id} />
            <DetailRow label="Vendor" value={selected.vendor?.name || "Unknown vendor"} />
            <DetailRow label="Vendor email" value={selected.vendor?.email || "Not available"} />
            <DetailRow label="Restaurant" value={selected.restaurantName || "Not provided"} />
            <DetailRow label="Subscription plan" value={selected.plan} />
            <DetailRow label="Payment amount" value={formatPrice(selected.amount / 100)} />
            <DetailRow label="Currency" value={selected.currency.toUpperCase()} />
            <DetailRow label="Payment status" value={statusLabel(selected.status)} />
            <DetailRow label="Transaction date" value={formatDate(selected.createdAt)} />
            <DetailRow label="Gateway session" value={selected.stripeSessionId} />
            <p className="rounded-xl bg-orange-50 p-3 text-xs text-gray-500 dark:bg-white/5 dark:text-gray-400">
              This record is read-only. Admins cannot modify payment amounts, statuses, dates or transaction IDs.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-orange-100 pb-2 dark:border-white/10">
      <span className="font-semibold text-gray-500">{label}</span>
      <span className="max-w-[65%] break-all text-right font-bold text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}
