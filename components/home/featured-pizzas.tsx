"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import type { Pizza } from "@/lib/types";
import { PizzaCard } from "@/components/menu/pizza-card";
import { EmptyState, LoadingState } from "@/components/ui/states";

export function FeaturedPizzas() {
  const featured = useApi<Pizza[]>("/menu-items?featured=true&limit=6");
  const all = useApi<Pizza[]>("/menu-items?limit=50");

  const items = useMemo(() => {
    const combined = [...(featured.data || [])];
    const seen = new Set(combined.map((pizza) => pizza._id));

    for (const pizza of all.data || []) {
      if (seen.has(pizza._id)) continue;
      combined.push(pizza);
      seen.add(pizza._id);
    }

    return combined.slice(0, 18);
  }, [featured.data, all.data]);

  const loading = featured.loading || all.loading;
  const error = featured.error || all.error;
  const visibleItems = items.slice(0, 6);

  return (
    <section className="bg-[#FFFBF7] py-20 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-[#E5484D]">
              Popular right now
            </p>
            <h2 className="mt-2 text-3xl font-black text-gray-900 sm:text-4xl dark:text-white">
              Featured Menu Items
            </h2>
            <p className="mt-2 max-w-xl text-sm text-gray-600 dark:text-gray-400">
              Hand-picked pizzas from approved vendors, ready for delivery.
            </p>
          </div>

          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#E5484D] hover:underline"
          >
            See the full menu <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-10">
          {loading && <LoadingState label="Loading featured pizzas..." />}

          {!loading && error && <EmptyState title="Could not load pizzas" message={error} />}

          {!loading && !error && visibleItems.length === 0 && (
            <EmptyState
              title="No approved pizzas yet"
              message="Vendors are preparing their menus. Check back soon for fresh slices!"
            />
          )}

          {!loading && !error && visibleItems.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleItems.map((pizza, index) => (
                <PizzaCard key={pizza._id || index} pizza={pizza} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
