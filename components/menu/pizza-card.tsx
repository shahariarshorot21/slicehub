"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, MapPin, ShoppingCart, Star, Store } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import type { Pizza } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/components/cart/cart-context";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { PizzaDetailsModal } from "@/components/menu/pizza-details-modal";

const fallbackImage =
  "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80";

const UNIQUE_PIZZA_NAMES = [
  "Margherita Royale",
  "Smoky Pepperoni Feast",
  "Truffle Mushroom Delight",
  "Spicy BBQ Chicken",
  "Four Cheese Artisan",
  "Mediterranean Veggie",
  "Hot Honey Pepperoni",
  "Tuscan Garlic Supreme",
];

function getUniquePizzaName(pizza: Pizza, index: number): string {
  const existingName =
    pizza.itemName?.trim() ||
    (pizza as Pizza & { name?: string; title?: string }).name?.trim() ||
    (pizza as Pizza & { name?: string; title?: string }).title?.trim();

  if (existingName) return existingName;

  const idSuffix = pizza._id ? pizza._id.slice(-3).toUpperCase() : `${index + 1}`;
  const baseName = UNIQUE_PIZZA_NAMES[index % UNIQUE_PIZZA_NAMES.length];
  return `${baseName} #${idSuffix}`;
}

function getLocalFavorites(): Pizza[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("slicehub_demo_favorites") || "[]");
  } catch {
    return [];
  }
}

export function PizzaCard({ pizza, index = 0 }: { pizza: Pizza; index?: number }) {
  const { isAuthenticated, user, refetch } = useAuth();
  const { addItem } = useCart();

  const displayName = getUniquePizzaName(pizza, index);
  const pizzaWithDisplayName: Pizza = {
    ...pizza,
    itemName: displayName,
  };

  const [favorite, setFavorite] = useState(false);
  const [busy, setBusy] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    const isUserFav = Boolean(user?.favoriteItemIds?.includes(pizza._id));
    const localFavs = getLocalFavorites();
    const isLocalFav = localFavs.some((p) => p._id === pizza._id);
    setFavorite(isUserFav || isLocalFav);
  }, [user, pizza._id]);

  const toggleFavorite = async () => {
    setBusy(true);
    try {
      if (!isAuthenticated) {
        const localFavs = getLocalFavorites();
        const exists = localFavs.some((p) => p._id === pizza._id);
        let updated: Pizza[];
        if (exists) {
          updated = localFavs.filter((p) => p._id !== pizza._id);
          setFavorite(false);
          toast.success("Removed from favourites");
        } else {
          updated = [pizzaWithDisplayName, ...localFavs];
          setFavorite(true);
          toast.success("Added to favourites");
        }
        localStorage.setItem("slicehub_demo_favorites", JSON.stringify(updated));
        window.dispatchEvent(new Event("slicehub-favorites-updated"));
        setBusy(false);
        return;
      }

      const result = await apiFetch<{ favorite: boolean }>(`/me/favorites/${pizza._id}`, {
        method: "POST",
      });
      setFavorite(result.favorite);
      await refetch();
      toast.success(result.favorite ? "Added to favourites" : "Removed from favourites");
    } catch {

      const localFavs = getLocalFavorites();
      const exists = localFavs.some((p) => p._id === pizza._id);
      let updated: Pizza[];
      if (exists) {
        updated = localFavs.filter((p) => p._id !== pizza._id);
        setFavorite(false);
        toast.success("Removed from favourites");
      } else {
        updated = [pizzaWithDisplayName, ...localFavs];
        setFavorite(true);
        toast.success("Added to favourites");
      }
      localStorage.setItem("slicehub_demo_favorites", JSON.stringify(updated));
      window.dispatchEvent(new Event("slicehub-favorites-updated"));
    } finally {
      setBusy(false);
    }
  };

  const addToCart = () => {
    if (!pizza.isAvailable) {
      toast.error("This pizza is currently unavailable");
      return;
    }
    if (user?.role === "vendor") {
      toast.info("Vendors cannot place food orders");
      return;
    }
    if (user?.id === pizza.vendorId) {
      toast.info("You cannot order your own menu item");
      return;
    }
    addItem(pizzaWithDisplayName);
    toast.success(`${displayName} added to your cart`);
  };

  const openDetails = () => setDetailsOpen(true);

  const handleCardClick = (event: React.MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("button, a")) return;
    openDetails();
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDetails();
    }
  };

  return (
    <>
      <motion.article
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${displayName}`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
        className="group flex h-[440px] flex-col overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-slate-900"
      >
        <div className="relative h-52 shrink-0 overflow-hidden bg-orange-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageError || !pizza.images?.[0] ? fallbackImage : pizza.images[0]}
            alt={displayName}
            onError={() => setImageError(true)}
            className="size-full object-cover transition duration-500 group-hover:scale-110"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
          <div className="absolute left-3 top-3 flex gap-2">
            <Badge tone="red" className="bg-white/90 text-[#E5484D]">
              {pizza.category}
            </Badge>
            {pizza.featured && <Badge tone="amber">Featured</Badge>}
            {!pizza.isAvailable && <Badge tone="gray">Unavailable</Badge>}
          </div>
          <div className="absolute right-3 top-3 flex gap-2">
            {user?.role !== "vendor" && (
              <button
                type="button"
                onClick={addToCart}
                aria-label={`Add ${displayName} to cart`}
                className="flex size-9 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow transition hover:text-[#E5484D]"
              >
                <ShoppingCart className="size-5" />
              </button>
            )}
            <button
              type="button"
              onClick={toggleFavorite}
              disabled={busy}
              aria-label={favorite ? "Remove from favourites" : "Add to favourites"}
              className="flex size-9 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow transition hover:text-[#E5484D] disabled:opacity-50"
            >
              <Heart className={favorite ? "size-5 fill-[#E5484D] text-[#E5484D]" : "size-5"} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-1 text-lg font-black tracking-tight text-gray-900 dark:text-white">
              {displayName}
            </h3>
            <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-lg font-black text-[#E5484D] dark:bg-white/10">
              {formatPrice(pizza.price)}
            </span>
          </div>

          <p className="mt-1 line-clamp-2 min-h-10 text-sm text-gray-500 dark:text-gray-400">
            {pizza.description}
          </p>

          <div className="mt-3 flex min-h-6 flex-wrap items-center gap-x-4 gap-y-1 border-t border-orange-100 pt-3 text-xs text-gray-500 dark:border-white/10 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Store className="size-3.5" />{" "}
              {pizza.vendor?.businessName ||
                pizza.vendor?.name ||
                pizza.vendorName ||
                "SliceHub Vendor"}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" /> {pizza.location}
            </span>
            {Boolean(pizza.averageRating) && (
              <span className="flex items-center gap-1 text-amber-600">
                <Star className="size-3.5 fill-amber-500" /> {pizza.averageRating?.toFixed(1)}
              </span>
            )}
          </div>

          <Link
            href={`/menu/${pizza._id}`}
            onClick={(event) => {
              event.preventDefault();
              openDetails();
            }}
            className="mt-auto flex w-full items-center justify-center rounded-xl bg-[#E5484D] py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#d43b40]"
          >
            View Details
          </Link>
        </div>
      </motion.article>

      <PizzaDetailsModal
        pizza={pizzaWithDisplayName}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
    </>
  );
}