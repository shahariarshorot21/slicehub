"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Eye, EyeOff, Pencil, Search, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/hooks/use-api";
import { apiFetch } from "@/lib/api";
import type { Pizza } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { formatDate, formatPrice } from "@/lib/utils";
import Image from "next/image";

type AdminMenuItem = Pizza & {
  vendorEmail?: string;
  restaurantName?: string;
};

export function MenuModeration() {
  const params = useSearchParams();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(params.get("status") || "");
  const [availability, setAvailability] = useState("");
  const [pendingDelete, setPendingDelete] = useState<AdminMenuItem | null>(null);
  const [editing, setEditing] = useState<AdminMenuItem | null>(null);
  const [reviewing, setReviewing] = useState<AdminMenuItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filters = { ...(search ? { search } : {}), ...(status ? { status } : {}), ...(availability ? { availability } : {}) };
  const query = `/admin/menu-items${Object.keys(filters).length ? `?${new URLSearchParams(filters).toString()}` : ""}`;
  const { data, loading, error, reload } = useApi<AdminMenuItem[]>(query, [query]);

  const review = async (item: AdminMenuItem, nextStatus: "approved" | "rejected", featured?: boolean) => {
    if (nextStatus === "rejected" && !window.confirm(`Reject ${item.itemName}? It will be hidden from the public menu.`)) {
      return;
    }
    setBusyId(item._id);
    try {
      const result = await apiFetch<{ message: string }>(`/admin/menu-items/${item._id}/review`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus, ...(featured === undefined ? {} : { featured }) }),
      });
      toast.success(result.message);
      setReviewing(null);
      await reload();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not review item");
    } finally {
      setBusyId(null);
    }
  };

  const changeAvailability = async (item: AdminMenuItem, isAvailable: boolean) => {
    setBusyId(item._id);
    try {
      const result = await apiFetch<{ message: string }>(`/admin/menu-items/${item._id}`, {
        method: "PUT",
        body: JSON.stringify({ isAvailable }),
      });
      toast.success(result.message);
      await reload();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not update availability");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async () => {
    if (!pendingDelete) return;
    setBusyId(pendingDelete._id);
    try {
      const result = await apiFetch<{ message: string }>(`/admin/menu-items/${pendingDelete._id}`, {
        method: "DELETE",
      });
      toast.success(result.message);
      setPendingDelete(null);
      await reload();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not delete item");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-black text-gray-900 dark:text-white">Manage menu items</h2>
      <p className="mt-1 text-sm text-gray-500">
        Review submissions, manage published pizzas and keep the public menu accurate.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
        <label className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search food, category, vendor or restaurant..."
            className="pl-10"
          />
        </label>
        <Select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by approval status">
          <option value="">All items</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="inactive">Inactive</option>
        </Select>
        <Select value={availability} onChange={(event) => setAvailability(event.target.value)} aria-label="Filter by availability">
          <option value="">All availability</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>

      {loading && <LoadingState label="Loading menu items..." />}
      {!loading && error && (
        <div className="mt-8"><EmptyState title="Could not load menu items" message={error} /></div>
      )}
      {!loading && !error && (!data || data.length === 0) && (
        <div className="mt-8"><EmptyState title="No menu items found" message="Try a different search or filter." /></div>
      )}

      <div className="mt-6 space-y-3">
        {data?.map((item) => (
          <div
            key={item._id}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-orange-100 bg-white p-4 dark:border-white/10 dark:bg-slate-900"
          >
            {item.images?.[0] ? (

              <Image src={item.images[0]} alt="" className="size-16 rounded-xl bg-orange-100 object-cover" />
            ) : (
              <span className="flex size-16 items-center justify-center rounded-xl bg-orange-100 text-2xl">🍕</span>
            )}
            <div className="min-w-48 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold text-gray-900 dark:text-white">{item.itemName}</p>
                <Badge tone={item.status === "approved" ? "green" : item.status === "pending" ? "amber" : "gray"}>
                  {item.status}
                </Badge>
                <Badge tone={item.isAvailable ? "green" : "gray"}>
                  {item.isAvailable ? "Active" : "Inactive"}
                </Badge>
                {item.featured && <Badge tone="amber">Featured</Badge>}
              </div>
              <p className="text-xs text-gray-400">
                {item.category} · {item.location}
              </p>
              <p className="text-xs text-gray-400">
                {item.restaurantName || item.vendorName || "Vendor"} · {item.vendorEmail || ""}
              </p>
              {item.description && (
                <p className="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
              )}
              <p className="text-[11px] text-gray-400">Submitted {formatDate(item.createdAt || new Date(0))}</p>
            </div>
            <span className="font-black text-[#E5484D]">{formatPrice(item.price)}</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setReviewing(item)}
                className="inline-flex items-center gap-1 rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-orange-50 dark:text-gray-200 dark:hover:bg-white/10"
              >
                <Eye className="size-3" /> View
              </button>
              {item.status !== "approved" && (
                <button
                  type="button"
                  disabled={busyId === item._id}
                  onClick={() => review(item, "approved")}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 disabled:opacity-60"
                >
                  <Check className="size-3" /> Approve
                </button>
              )}
              {item.status !== "rejected" && (
                <button
                  type="button"
                  disabled={busyId === item._id}
                  onClick={() => review(item, "rejected")}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-60 dark:hover:bg-red-500/10"
                >
                  <X className="size-3" /> Reject
                </button>
              )}
              {item.status === "approved" && (
                <>
                  <button
                    type="button"
                    disabled={busyId === item._id}
                    onClick={() => review(item, "approved", !item.featured)}
                    className="inline-flex items-center gap-1 rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-600 hover:bg-amber-50 disabled:opacity-60 dark:hover:bg-amber-500/10"
                  >
                    <Star className={`size-3 ${item.featured ? "fill-amber-400" : ""}`} />
                    {item.featured ? "Unfeature" : "Feature"}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === item._id}
                    onClick={() => changeAvailability(item, !item.isAvailable)}
                    className="inline-flex items-center gap-1 rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-orange-50 disabled:opacity-60 dark:text-gray-200 dark:hover:bg-white/10"
                  >
                    <EyeOff className="size-3" />
                    {item.isAvailable ? "Deactivate" : "Reactivate"}
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setEditing(item)}
                className="inline-flex items-center gap-1 rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-orange-50 dark:text-gray-200 dark:hover:bg-white/10"
              >
                <Pencil className="size-3" /> Edit
              </button>
              <button
                type="button"
                onClick={() => setPendingDelete(item)}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <Trash2 className="size-3" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {reviewing && (
        <Modal open onClose={() => setReviewing(null)} title={reviewing.itemName} className="max-w-2xl">
          <div className="grid gap-5 sm:grid-cols-2">
            {reviewing.images?.[0] && (

              <Image
                src={reviewing.images[0]}
                alt={reviewing.itemName}
                className="h-48 w-full rounded-2xl bg-orange-100 object-cover"
              />
            )}
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <p><span className="font-semibold">Description:</span> {reviewing.description || "Not provided"}</p>
              <p><span className="font-semibold">Category:</span> {reviewing.category}</p>
              <p><span className="font-semibold">Price:</span> {formatPrice(reviewing.price)}</p>
              <p><span className="font-semibold">Location:</span> {reviewing.location}</p>
              <p><span className="font-semibold">Submitted:</span> {formatDate(reviewing.createdAt || new Date(0))}</p>
            </div>
            <div className="space-y-2 rounded-2xl bg-orange-50 p-4 text-sm text-gray-700 dark:bg-white/5 dark:text-gray-200 sm:col-span-2">
              <p className="font-black text-gray-900 dark:text-white">Vendor information</p>
              <p><span className="font-semibold">Vendor:</span> {reviewing.vendorName || "Vendor"}</p>
              <p><span className="font-semibold">Restaurant:</span> {reviewing.restaurantName || "Not provided"}</p>
              {reviewing.vendorEmail && <p><span className="font-semibold">Email:</span> {reviewing.vendorEmail}</p>}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => setReviewing(null)}
              className="rounded-xl border border-orange-200 px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200"
            >
              Close
            </button>
            {reviewing.status !== "approved" && (
              <button
                type="button"
                disabled={busyId === reviewing._id}
                onClick={() => review(reviewing, "approved")}
                className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-60"
              >
                Approve
              </button>
            )}
            {reviewing.status !== "rejected" && (
              <button
                type="button"
                disabled={busyId === reviewing._id}
                onClick={() => review(reviewing, "rejected")}
                className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-60"
              >
                Reject
              </button>
            )}
          </div>
        </Modal>
      )}

      {editing && (
        <EditItemModal
          key={editing._id}
          item={editing}
          onClose={() => setEditing(null)}
          onSaved={reload}
        />
      )}

      <Modal open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)} title="Delete menu item" className="max-w-md">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Delete <strong>{pendingDelete?.itemName}</strong> permanently?
        </p>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={() => setPendingDelete(null)} className="flex-1 rounded-xl border border-orange-200 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200">
            Cancel
          </button>
          <button type="button" onClick={remove} className="flex-1 rounded-xl bg-[#E5484D] py-2.5 text-sm font-bold text-white">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

function EditItemModal({
  item,
  onClose,
  onSaved,
}: {
  item: AdminMenuItem;
  onClose: () => void;
  onSaved: () => Promise<unknown> | unknown;
}) {
  const [itemName, setItemName] = useState(item.itemName);
  const [category, setCategory] = useState(item.category);
  const [description, setDescription] = useState(item.description);
  const [price, setPrice] = useState(String(item.price));
  const [location, setLocation] = useState(item.location);
  const [images, setImages] = useState(item.images.join("\n"));
  const [status, setStatus] = useState<Pizza["status"]>(item.status);
  const [isAvailable, setIsAvailable] = useState(String(item.isAvailable));
  const [featured, setFeatured] = useState(String(item.featured));
  const [saving, setSaving] = useState(false);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    const imageList = images
      .split(/[\n,]+/)
      .map((url) => url.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      const result = await apiFetch<{ message: string }>(`/admin/menu-items/${item._id}`, {
        method: "PUT",
        body: JSON.stringify({
          itemName: itemName.trim(),
          category: category.trim(),
          description: description.trim(),
          price: numericPrice,
          location: location.trim(),
          images: imageList,
          status,
          isAvailable: isAvailable === "true",
          featured: featured === "true",
        }),
      });
      toast.success(result.message);
      onClose();
      await onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update menu item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={`Edit ${item.itemName}`} className="max-w-2xl">
      <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="admin-item-name" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Item name</label>
          <Input id="admin-item-name" required minLength={2} maxLength={120} value={itemName} onChange={(event) => setItemName(event.target.value)} />
        </div>
        <div>
          <label htmlFor="admin-item-category" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Category</label>
          <Input id="admin-item-category" required minLength={2} maxLength={80} value={category} onChange={(event) => setCategory(event.target.value)} />
        </div>
        <div>
          <label htmlFor="admin-item-price" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Price</label>
          <Input id="admin-item-price" type="number" min="0.01" step="0.01" required value={price} onChange={(event) => setPrice(event.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="admin-item-description" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Description</label>
          <Textarea id="admin-item-description" maxLength={1000} value={description} onChange={(event) => setDescription(event.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="admin-item-location" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Location</label>
          <Input id="admin-item-location" required minLength={2} maxLength={120} value={location} onChange={(event) => setLocation(event.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="admin-item-images" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Image URLs</label>
          <Textarea
            id="admin-item-images"
            value={images}
            onChange={(event) => setImages(event.target.value)}
            placeholder="One image URL per line"
          />
          <p className="mt-1 text-xs text-gray-400">Separate multiple URLs with a new line or comma.</p>
        </div>
        <div>
          <label htmlFor="admin-item-status" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Approval status</label>
          <Select id="admin-item-status" value={status} onChange={(event) => setStatus(event.target.value as Pizza["status"])}>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
        <div>
          <label htmlFor="admin-item-availability" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Availability</label>
          <Select id="admin-item-availability" value={isAvailable} onChange={(event) => setIsAvailable(event.target.value)}>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>
        </div>
        <div>
          <label htmlFor="admin-item-featured" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Featured</label>
          <Select id="admin-item-featured" value={featured} onChange={(event) => setFeatured(event.target.value)}>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </Select>
        </div>
        <div className="flex items-end justify-end gap-3 sm:col-span-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-orange-200 px-5 py-3 text-sm font-bold text-gray-700 dark:text-gray-200">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#E5484D] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#d43b40] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
