"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import type { Pizza } from "@/lib/types";
import { PizzaCard } from "@/components/menu/pizza-card";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type Filters = { categories: string[]; locations: string[] };

const CATEGORY_PILLS = [
  "Classic",
  "Spicy",
  "Premium",
  "BBQ",
  "Cheese Lovers",
  "Seafood",
];

export function BrowseMenu() {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("search") || "");
  const [category, setCategory] = useState(params.get("category") || "");
  const [location, setLocation] = useState(params.get("location") || "");
  const [availability, setAvailability] = useState(params.get("availability") || "available");
  const [minPrice, setMinPrice] = useState(params.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") || "");
  const [sort, setSort] = useState(params.get("sort") || "newest");

  const { data: filters } = useApi<Filters>("/menu-items/categories");

  const query = useMemo(() => {
    const searchParams = new URLSearchParams();
    if (search.trim()) searchParams.set("search", search.trim());
    if (category) searchParams.set("category", category);
    if (location) searchParams.set("location", location);
    if (availability !== "available") searchParams.set("availability", availability);
    if (minPrice && Number(minPrice) >= 0) searchParams.set("minPrice", minPrice);
    if (maxPrice && Number(maxPrice) >= 0) searchParams.set("maxPrice", maxPrice);
    if (sort !== "newest") searchParams.set("sort", sort);
    searchParams.set("limit", "18");
    return `/menu-items?${searchParams.toString()}`;
  }, [search, category, location, availability, minPrice, maxPrice, sort]);

  const { data, loading, error } = useApi<Pizza[]>(query, [query]);

  const items = data ?? [];

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = new URLSearchParams();
      if (search.trim()) next.set("search", search.trim());
      if (category) next.set("category", category);
      if (location) next.set("location", location);
      if (availability !== "available") next.set("availability", availability);
      if (minPrice && Number(minPrice) >= 0) next.set("minPrice", minPrice);
      if (maxPrice && Number(maxPrice) >= 0) next.set("maxPrice", maxPrice);
      if (sort !== "newest") next.set("sort", sort);
      router.replace(`/menu${next.size ? `?${next.toString()}` : ""}`, { scroll: false });
    }, 250);
    return () => clearTimeout(timer);
  }, [search, category, location, availability, minPrice, maxPrice, sort, router]);

  const reset = () => {
    setSearch("");
    setCategory("");
    setLocation("");
    setAvailability("available");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    router.replace("/menu", { scroll: false });
  };

  const displayCategories = filters?.categories?.length ? filters.categories : CATEGORY_PILLS;

  return (
    <main className="min-h-screen bg-[#FFFBF7] py-12 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-[#E5484D]">The full menu</p>
            <h1 className="mt-2 text-3xl font-black text-gray-900 sm:text-4xl dark:text-white">
              Find your perfect pizza
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Browse approved pizzas and filter by availability to find your next slice.
            </p>
          </div>
          <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-[#E5484D] dark:bg-white/10">
            {items.length} pizzas
          </span>
        </div>

        <div className="mt-8 rounded-3xl border border-orange-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto]">
            <label className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or keywords..."
                className="pl-10"
              />
            </label>

            <Select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">All categories</option>
              {displayCategories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>

            <Select value={location} onChange={(event) => setLocation(event.target.value)}>
              <option value="">All locations</option>
              {(filters?.locations || []).map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>

            <Select value={availability} onChange={(event) => setAvailability(event.target.value)}>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
              <option value="all">All</option>
            </Select>

            <Input
              type="number"
              min="0"
              step="0.01"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="Min price"
              aria-label="Minimum price"
            />

            <Input
              type="number"
              min="0"
              step="0.01"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="Max price"
              aria-label="Maximum price"
            />

            <Select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="newest">Newest first</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </Select>
          </div>


          <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-orange-100/80 pt-3.5 dark:border-white/10">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-200 px-4 py-2 text-xs font-semibold text-gray-600 transition hover:bg-orange-50 dark:border-white/15 dark:text-gray-200 dark:hover:bg-white/10"
            >
              <SlidersHorizontal className="size-3.5" /> Reset
            </button>

            <div className="mx-1 h-5 w-px bg-orange-100 dark:bg-white/10" />

            <button
              type="button"
              onClick={() => setCategory("")}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                category === ""
                  ? "bg-stone-900 text-white shadow-xs dark:bg-[#E5484D]"
                  : "border border-orange-100 bg-white text-gray-700 hover:bg-orange-50 dark:border-white/10 dark:bg-slate-800 dark:text-gray-300"
              }`}
            >
              All
            </button>

            {displayCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat === category ? "" : cat)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  category === cat
                    ? "bg-stone-900 text-white shadow-xs dark:bg-[#E5484D]"
                    : "border border-orange-100 bg-white text-gray-700 hover:bg-orange-50 dark:border-white/10 dark:bg-slate-800 dark:text-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          {loading && <LoadingState label="Loading pizzas..." />}
          {error && !loading && <EmptyState title="Could not load the menu" message={error} />}
          {!loading && !error && items.length === 0 && (
            <EmptyState
              title="No pizzas found"
              message="Try changing your search or filters — a fresh slice might be just around the corner."
            />
          )}
          {!loading && !error && items.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((pizza, index) => (
                <PizzaCard key={pizza._id} pizza={pizza} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}