"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useApi } from "@/hooks/use-api";
import { useAuth } from "@/hooks/use-auth";
import type { Pizza } from "@/lib/types";
import { isPremiumUser } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

function isValidImageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function MenuItemForm({ initial }: { initial?: Pizza }) {
  const router = useRouter();
  const { user } = useAuth();
  const { data: vendorItems, loading: itemsLoading } = useApi<Pizza[]>("/menu-items/vendor/items");
  const [itemName, setItemName] = useState(initial?.itemName || "");
  const [category, setCategory] = useState(initial?.category || "Classic");
  const [description, setDescription] = useState(initial?.description || "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [location, setLocation] = useState(initial?.location || "");
  const [imageUrl, setImageUrl] = useState(initial?.images[0] || "");
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedImageUrl = imageUrl.trim();
  const imageUrlSyntaxValid = isValidImageUrl(trimmedImageUrl);
  const imageFailed = failedImageUrl === trimmedImageUrl;

  const isPremium = isPremiumUser(user);
  const freeLimitReached =
    !isPremium &&
    !initial &&
    !itemsLoading &&
    (vendorItems?.filter((item) => item.status === "approved" && item.isAvailable).length || 0) >= 3;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!trimmedImageUrl) {
      setError("Please enter an item image URL before submitting");
      return;
    }
    if (!imageUrlSyntaxValid || imageFailed) return;

    if (freeLimitReached) {
      setError("Free plan allows a maximum of 3 active menu items. Upgrade to Premium for unlimited items.");
      return;
    }

    setSaving(true);
    try {
      const body = {
        itemName,
        category,
        description,
        price: Number(price),
        location,
        images: [trimmedImageUrl],
      };
      const result = await apiFetch<{ message: string }>(
        initial ? `/menu-items/vendor/items/${initial._id}` : "/menu-items/vendor/items",
        { method: initial ? "PUT" : "POST", body: JSON.stringify(body) }
      );
      toast.success(result.message || "Menu item saved");
      router.push("/vendor/menu");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save menu item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-5 rounded-2xl border border-orange-100 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
      {freeLimitReached && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
          <span>Free plan allows a maximum of 3 active menu items. Upgrade to Premium for unlimited items.</span>
          <Link href="/vendor/subscription" className="font-bold underline">
            Upgrade to Premium
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="item-name" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Item name</label>
          <Input id="item-name" required minLength={2} value={itemName} onChange={(event) => setItemName(event.target.value)} placeholder="Classic Margherita" />
        </div>
        <div>
          <label htmlFor="item-category" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Category</label>
          <Input id="item-category" required value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Classic" />
        </div>
        <div>
          <label htmlFor="item-price" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Price (USD)</label>
          <Input id="item-price" type="number" required min={0.01} step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="12.99" />
        </div>
        <div>
          <label htmlFor="item-location" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Location (Area / City)</label>
          <Input id="item-location" required value={location} onChange={(event) => setLocation(event.target.value)} placeholder="New York, NY" />
        </div>
      </div>

      <div>
        <label htmlFor="item-description" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Description</label>
        <Textarea id="item-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Tell customers what makes this pizza special..." />
      </div>

      <div>
        <label htmlFor="item-image-url" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">
          Item image URL <span className="text-[#E5484D]">*</span>
        </label>
        <Input
          id="item-image-url"
          type="url"
          required
          value={imageUrl}
          onChange={(event) => {
            setImageUrl(event.target.value);
            setFailedImageUrl(null);
            setError(null);
          }}
          placeholder="https://example.com/pizza.jpg"
          aria-invalid={Boolean(trimmedImageUrl) && (!imageUrlSyntaxValid || imageFailed)}
          aria-describedby={trimmedImageUrl && (!imageUrlSyntaxValid || imageFailed) ? "item-image-url-error" : undefined}
        />
        {trimmedImageUrl && (!imageUrlSyntaxValid || imageFailed) && (
          <p id="item-image-url-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
            Enter a valid direct image URL.
          </p>
        )}
        {trimmedImageUrl && imageUrlSyntaxValid && (
          <div className="relative mt-3 size-24 overflow-hidden rounded-xl border border-orange-100 dark:border-white/10">
            
            <Image
              key={trimmedImageUrl}
              src={trimmedImageUrl}
              alt="Item image preview"
              className="size-full object-cover"
              onLoad={(event) => {
                if (event.currentTarget.getAttribute("src") === trimmedImageUrl) setFailedImageUrl(null);
              }}
              onError={(event) => {
                if (event.currentTarget.getAttribute("src") === trimmedImageUrl) setFailedImageUrl(trimmedImageUrl);
              }}
            />
            <button
              type="button"
              aria-label="Remove image URL"
              onClick={() => {
                setImageUrl("");
                setFailedImageUrl(null);
                setError(null);
              }}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
            >
              <X className="size-3" />
            </button>
          </div>
        )}
        {error && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
            <span>{error}</span>
            {/premium/i.test(error) && (
              <Link href="/vendor/subscription" className="font-bold underline">
                Upgrade to Premium
              </Link>
            )}
          </div>
        )}
        <p className="mt-2 text-xs text-gray-400">Paste a direct http(s) image URL. Local file paths are never saved.</p>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-orange-100 pt-5 dark:border-white/10">
        <button
          type="submit"
          disabled={saving || !trimmedImageUrl || !imageUrlSyntaxValid || imageFailed || freeLimitReached}
          className="rounded-xl bg-[#E5484D] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#d43b40] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : initial ? "Save changes" : "Submit for approval"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/vendor/menu")}
          className="rounded-xl border border-orange-200 px-6 py-3 text-sm font-bold text-gray-700 dark:text-gray-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
