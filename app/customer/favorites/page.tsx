
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import type { Pizza } from "@/lib/types";
import { PizzaCard } from "@/components/menu/pizza-card";
import { EmptyState, LoadingState } from "@/components/ui/states";

function getLocalFavorites(): Pizza[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("slicehub_demo_favorites") || "[]");
  } catch {
    return [];
  }
}

export default function CustomerFavoritesPage() {
  const { data: apiData, loading } = useApi<Pizza[]>("/me/favorites");
  const [localData, setLocalData] = useState<Pizza[]>([]);

  useEffect(() => {
    setLocalData(getLocalFavorites());
    const handleSync = () => setLocalData(getLocalFavorites());
    window.addEventListener("slicehub-favorites-updated", handleSync);
    return () => window.removeEventListener("slicehub-favorites-updated", handleSync);
  }, []);

  const data = (() => {
    const combined = [...(apiData || []), ...localData];
    const map = new Map<string, Pizza>();
    combined.forEach((p) => {
      if (p && p._id) map.set(p._id, p);
    });
    return Array.from(map.values());
  })();

  return (
    <div>
      <h2 className="text-2xl font-black text-gray-900 dark:text-white">Your favourites</h2>
      <p className="mt-1 text-sm text-gray-500">All the pizzas you saved for later.</p>

      {loading && data.length === 0 && <LoadingState label="Loading favourites..." />}
      {!loading && data.length === 0 && (
        <div className="mt-8">
          <EmptyState title="No favourites yet" message="Tap the heart on any pizza to save it here." />
          <div className="mt-4 text-center">
            <Link href="/menu" className="inline-block rounded-xl bg-[#E5484D] px-5 py-3 text-sm font-bold text-white">Explore menu</Link>
          </div>
        </div>
      )}
      {data.length > 0 && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((pizza, index) => <PizzaCard key={pizza._id} pizza={pizza} index={index} />)}
        </div>
      )}
    </div>
  );
}