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

const REALISTIC_PIZZAS = [
  { name: "Classic Margherita", desc: "San Marzano tomato, fresh mozzarella, basil and extra virgin olive oil.", category: "Classic", price: 450 },
  { name: "Pepperoni Supreme", desc: "A generous layer of pepperoni, mozzarella and our signature tomato sauce.", category: "Spicy", price: 520 },
  { name: "Truffle Mushroom", desc: "Wild mushrooms, truffle cream, mozzarella and a touch of fresh thyme.", category: "Premium", price: 580 },
  { name: "Smoky BBQ Chicken", desc: "Tender chicken, smoky BBQ sauce, red onion and melted mozzarella.", category: "BBQ", price: 560 },
  { name: "Four Cheese", desc: "Mozzarella, cheddar, parmesan and gorgonzola blended to perfection.", category: "Cheese Lovers", price: 540 },
  { name: "Garlic Shrimp", desc: "Juicy shrimp, garlic butter, fresh parsley and a hint of chili.", category: "Seafood", price: 620 },
  { name: "Hot Honey Pepperoni", desc: "Cup-and-char pepperoni, whipped ricotta, chili honey and fresh oregano.", category: "Spicy", price: 550 },
  { name: "Tuscan Garlic Supreme", desc: "Roasted garlic cloves, grilled chicken, spinach and creamy white sauce.", category: "Classic", price: 490 },
  { name: "Spicy Diavola", desc: "Italian spicy salami, fresh red chillies, mozzarella and hot honey drizzle.", category: "Spicy", price: 530 },
  { name: "Mediterranean Veggie", desc: "Black olives, feta cheese, sun-dried tomatoes, artichokes and pesto base.", category: "Classic", price: 480 },
  { name: "Prosciutto Arugula", desc: "Aged prosciutto, fresh baby arugula, shaved parmesan and balsamic glaze.", category: "Premium", price: 610 },
  { name: "Buffalo Chicken", desc: "Crispy chicken chunks tossed in spicy buffalo sauce with ranch drizzle.", category: "Spicy", price: 570 },
  { name: "Pesto Paradise", desc: "House-made basil pesto, cherry tomatoes, pine nuts and fresh mozzarella.", category: "Classic", price: 500 },
  { name: "Meat Lovers Feast", desc: "Pepperoni, Italian sausage, smoked ham, ground beef and bacon.", category: "Classic", price: 650 },
  { name: "Wild Mushroom & Truffle", desc: "Portobello mushrooms, cremini, truffle oil and rich fontina cheese.", category: "Premium", price: 590 },
  { name: "Hawaiian Luau", desc: "Sweet pineapple chunks, smoked ham, crispy bacon and extra mozzarella.", category: "Classic", price: 470 },
  { name: "Caprese Melt", desc: "Sliced vine tomatoes, fresh mozzarella balls, basil leaves and pesto swirl.", category: "Cheese Lovers", price: 460 },
  { name: "Double Cheesy Crunch", desc: "Extra double layers of stretchy mozzarella with golden toasted crust edges.", category: "Cheese Lovers", price: 490 },
];

const FALLBACK_PIZZAS: Pizza[] = REALISTIC_PIZZAS.map((item, index) => ({
  _id: `fallback-${index + 1}`,
  itemName: item.name,
  description: item.desc,
  price: item.price,
  images: [
    index % 6 === 0
      ? "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60"
      : index % 6 === 1
      ? "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60"
      : index % 6 === 2
      ? "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&auto=format&fit=crop&q=60"
      : index % 6 === 3
      ? "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=60"
      : index % 6 === 4
      ? "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=500&auto=format&fit=crop&q=60"
      : "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=500&auto=format&fit=crop&q=60"
  ],
  category: item.category,
  location: index % 2 === 0 ? "Dhaka" : "Chittagong",
  isAvailable: true,
  status: "approved",
  featured: index < 6,
  vendorId: `fallback-vendor-${index + 1}`,
  averageRating: 4.8,
}));

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

  const items = useMemo(() => {
    let sourceList: Pizza[] = [];
    if (data && data.length > 0) {
      sourceList = data.map((pizza, idx) => {
        const isGeneric = !pizza.itemName || pizza.itemName.startsWith("Signature Pizza");
        if (isGeneric) {
          return {
            ...pizza,
            itemName: REALISTIC_PIZZAS[idx % REALISTIC_PIZZAS.length].name,
            description: REALISTIC_PIZZAS[idx % REALISTIC_PIZZAS.length].desc,
            price: pizza.price || REALISTIC_PIZZAS[idx % REALISTIC_PIZZAS.length].price,
          };
        }
        return pizza;
      });
    }

    if (sourceList.length >= 18) {
      return sourceList.slice(0, 18);
    }

    const needed = 18 - sourceList.length;
    const combined = [...sourceList, ...FALLBACK_PIZZAS.slice(0, needed)];

    return combined
      .filter((pizza) => {
        if (search.trim()) {
          const q = search.trim().toLowerCase();
          const matchName = pizza.itemName?.toLowerCase().includes(q);
          const matchDesc = pizza.description?.toLowerCase().includes(q);
          if (!matchName && !matchDesc) return false;
        }
        if (category && pizza.category !== category) return false;
        if (minPrice && Number(minPrice) >= 0 && Number(pizza.price) < Number(minPrice)) return false;
        if (maxPrice && Number(maxPrice) >= 0 && Number(pizza.price) > Number(maxPrice)) return false;
        return true;
      })
      .sort((a, b) => {
        if (sort === "price-asc") return Number(a.price) - Number(b.price);
        if (sort === "price-desc") return Number(b.price) - Number(a.price);
        return 0;
      })
      .slice(0, 18);
  }, [data, search, category, minPrice, maxPrice, sort]);

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

          {/* সার্চ বারের নিচে ক্যাটাগরি বাটন ও Reset বাটন */}
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