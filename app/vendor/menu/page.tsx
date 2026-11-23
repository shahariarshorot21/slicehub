"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/hooks/use-api";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api";
import type { Pizza } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { Modal } from "@/components/ui/modal";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";

export default function VendorMenuPage() {
  const { data, loading, reload } = useApi<Pizza[]>("/menu-items/vendor/items");
  const { isPremium } = useAuth();
  const [pendingDelete, setPendingDelete] = useState<Pizza | null>(null);

  const toggleAvailability = async (item: Pizza) => {
    try {
      const result = await apiFetch<{ message: string }>(`/menu-items/vendor/items/${item._id}/availability`, {
        method: "PATCH",
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      toast.success(result.message);
      await reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update availability");
    }
  };

  const remove = async () => {
    if (!pendingDelete) return;
    try {
      const result = await apiFetch<{ message: string }>(`/menu-items/vendor/items/${pendingDelete._id}`, { method: "DELETE" });
      toast.success(result.message);
      setPendingDelete(null);
      await reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete item");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">My menu items</h2>
          <p className="mt-1 text-sm text-gray-500">
            {isPremium ? "Premium plan — unlimited active items." : "Free plan — up to 3 active items."}
          </p>
        </div>
        <Link href="/vendor/menu/new" className="inline-flex items-center gap-2 rounded-xl bg-[#E5484D] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#d43b40]">
          <Plus className="size-4" /> Add new item
        </Link>
      </div>

      {loading && <LoadingState label="Loading your menu..." />}
      {!loading && (!data || data.length === 0) && (
        <div className="mt-8">
          <EmptyState title="Your menu is empty" message="Add your first pizza and submit it for admin approval." />
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data?.map((item) => (
          <div key={item._id} className="overflow-hidden rounded-2xl border border-orange-100 bg-white dark:border-white/10 dark:bg-slate-900">
            <Image src={item.images?.[0]} alt={item.itemName} className="h-40 w-full bg-orange-100 object-cover" />
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-gray-900 dark:text-white">{item.itemName}</h3>
                <span className="whitespace-nowrap font-black text-[#E5484D]">{formatPrice(item.price)}</span>
              </div>
              <p className="mt-1 text-xs text-gray-400">{item.category} · {item.location}</p>
              <p className="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{item.description || "No description added."}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone={item.status === "approved" ? "green" : item.status === "pending" ? "amber" : "red"}>
                  {item.status === "approved" ? "Approved" : item.status === "pending" ? "Pending" : item.status === "rejected" ? "Rejected" : "Inactive"}
                </Badge>
                <Badge tone={item.isAvailable ? "blue" : "gray"}>{item.isAvailable ? "Available" : "Unavailable"}</Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/menu/${item._id}`} className="inline-flex items-center gap-1 rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-orange-50 dark:text-gray-200 dark:hover:bg-white/10">
                  <Eye className="size-3" /> View
                </Link>
                <button
                  type="button"
                  onClick={() => toggleAvailability(item)}
                  className="rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-orange-50 dark:text-gray-200 dark:hover:bg-white/10"
                >
                  {item.isAvailable ? "Mark unavailable" : "Mark available"}
                </button>
                <Link href={`/vendor/menu/${item._id}`} className="inline-flex items-center gap-1 rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-orange-50 dark:text-gray-200 dark:hover:bg-white/10">
                  <Pencil className="size-3" /> Edit
                </Link>
                <button
                  type="button"
                  onClick={() => setPendingDelete(item)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="size-3" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)} title="Delete menu item" className="max-w-md">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Are you sure you want to delete <strong>{pendingDelete?.itemName}</strong>? This cannot be undone.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => setPendingDelete(null)}
            className="flex-1 rounded-xl border border-orange-200 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200"
          >
            Keep item
          </button>
          <button
            type="button"
            onClick={remove}
            className="flex-1 rounded-xl bg-[#E5484D] py-2.5 text-sm font-bold text-white"
          >
            Delete item
          </button>
        </div>
      </Modal>
    </div>
  );
}
