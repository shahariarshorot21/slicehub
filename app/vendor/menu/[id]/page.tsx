"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import type { Pizza } from "@/lib/types";
import { MenuItemForm } from "@/components/dashboard/menu-item-form";
import { EmptyState, LoadingState } from "@/components/ui/states";

export default function EditMenuItemPage() {
  const params = useParams<{ id: string }>();
  const { data, loading, error } = useApi<Pizza>(`/menu-items/${params.id}`);

  return (
    <div>
      <Link href="/vendor/menu" className="text-sm font-semibold text-gray-500 hover:text-[#E5484D]">← Back to menu items</Link>
      <h2 className="mt-3 text-2xl font-black text-gray-900 dark:text-white">Edit pizza</h2>
      <p className="mt-1 text-sm text-gray-500">Changes to approved items are sent for review again.</p>

      {loading && <LoadingState label="Loading item..." />}
      {!loading && (error || !data) && <div className="mt-6"><EmptyState title="Item not found" message={error || "This item may have been deleted."} /></div>}
      {!loading && data && <div className="mt-6"><MenuItemForm initial={data} /></div>}
    </div>
  );
}
