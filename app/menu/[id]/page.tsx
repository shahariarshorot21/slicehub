"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, MapPin, Phone, ShoppingCart, Star, Store } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/hooks/use-api";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api";
import type { Pizza } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { OrderModal } from "@/components/menu/order-modal";
import { useCart } from "@/components/cart/cart-context";
import { ReviewSection } from "@/components/menu/review-section";
import Image from "next/image";

const fallbackImage =
  "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1200&q=80";

export default function PizzaDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const { data: pizza, loading, error } = useApi<Pizza>(id ? `/menu-items/${id}` : null);
  const { isAuthenticated, user, refetch } = useAuth();
  const { addItem } = useCart();

  const [orderOpen, setOrderOpen] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <LoadingState label="Loading pizza details..." />
      </main>
    );
  }

  if (error || !pizza) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title="Pizza not found" message={error || "This pizza may have been removed."} />
        <div className="mt-6 text-center">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 rounded-xl bg-[#E5484D] px-5 py-3 text-sm font-bold text-white"
          >
            <ArrowLeft className="size-4" />
            Back to menu
          </Link>
        </div>
      </main>
    );
  }

  const isFavorite = favorite || Boolean(user?.favoriteItemIds?.includes(pizza._id));
  const isOwnItem = user?.id === pizza.vendorId;
  const isVendor = user?.role === "vendor";
  const canOrder = pizza.status === "approved" && pizza.isAvailable && !isOwnItem && !isVendor;
  const vendor = pizza.vendor;
  const images = pizza.images?.length ? pizza.images : [fallbackImage];

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }

    setFavoriteBusy(true);
    try {
      const result = await apiFetch<{ favorite: boolean }>(`/me/favorites/${pizza._id}`, {
        method: "POST",
      });
      setFavorite(result.favorite);
      await refetch();
      toast.success(result.favorite ? "Added to favourites" : "Removed from favourites");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not update favourites");
    } finally {
      setFavoriteBusy(false);
    }
  };

  const handleOrder = () => {
    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }
    if (isVendor) {
      toast.info("Vendors cannot place food orders");
      router.replace("/vendor");
      return;
    }
    if (isOwnItem) {
      toast.info("You cannot order your own menu item");
      return;
    }
    if (pizza.status !== "approved" || !pizza.isAvailable) {
      toast.error("This pizza is currently unavailable");
      return;
    }
    setOrderOpen(true);
  };

  const addToCart = () => {
    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }
    if (isVendor) {
      toast.info("Vendors cannot place food orders");
      router.replace("/vendor");
      return;
    }
    if (isOwnItem) {
      toast.info("You cannot order your own menu item");
      return;
    }
    if (!canOrder) {
      toast.error("This pizza is currently unavailable");
      return;
    }
    addItem(pizza);
    toast.success(`${pizza.itemName} added to your cart`);
  };

  return (
    <main className="min-h-screen bg-[#FFFBF7] py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#E5484D]"
        >
          <ArrowLeft className="size-4" />
          Back to menu
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Image
              src={images[activeImage] || fallbackImage}
              alt={pizza.itemName}
              className="h-80 w-full rounded-3xl object-cover shadow-lg sm:h-[420px]"
            />

            {images.length > 1 && (
              <div className="mt-3 flex gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`View image ${index + 1}`}
                    className={`size-16 overflow-hidden rounded-xl border-2 ${
                      activeImage === index ? "border-[#E5484D]" : "border-transparent"
                    }`}
                  >
                    <Image src={image} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="red">{pizza.category}</Badge>
              {pizza.featured && <Badge tone="amber">Featured</Badge>}
              {pizza.status !== "approved" && <Badge tone="gray">{pizza.status}</Badge>}
              {!pizza.isAvailable && <Badge tone="gray">Unavailable</Badge>}
            </div>

            <h1 className="mt-4 text-4xl font-black text-gray-900 dark:text-white">{pizza.itemName}</h1>
            <p className="mt-3 text-base leading-relaxed text-gray-600 dark:text-gray-400">{pizza.description}</p>

            <div className="mt-6 flex items-center gap-4">
              <span className="text-3xl font-black text-[#E5484D]">{formatPrice(pizza.price)}</span>
              {Boolean(pizza.averageRating) && (
                <span className="flex items-center gap-1 text-sm font-semibold text-amber-600">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  {pizza.averageRating?.toFixed(1)} rating
                </span>
              )}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-orange-100 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                  <MapPin className="size-4" />
                  Serving area
                </p>
                <p className="mt-1 font-bold text-gray-900 dark:text-white">{pizza.location}</p>
              </div>

              <div className="rounded-2xl border border-orange-100 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                  <Store className="size-4" />
                  Restaurant
                </p>
                <p className="mt-1 font-bold text-gray-900 dark:text-white">
                  {vendor?.businessName || vendor?.name || pizza.vendorName || "SliceHub Vendor"}
                </p>
              </div>
            </div>

            {(vendor?.restaurantDescription ||
              vendor?.restaurantAddress ||
              vendor?.restaurantContact ||
              vendor?.restaurantLogo ||
              vendor?.restaurantCover ||
              vendor?.restaurantImage) && (
              <div className="mt-3 rounded-2xl border border-orange-100 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">About this restaurant</p>
                {(vendor?.restaurantCover || vendor?.restaurantImage) && (

                  <Image
                    src={vendor.restaurantCover || vendor.restaurantImage || ""}
                    alt={vendor.businessName || vendor.name || "Restaurant"}
                    className="mt-3 h-36 w-full rounded-xl object-cover"
                  />
                )}
                {vendor?.restaurantLogo && (

                  <Image
                    src={vendor.restaurantLogo}
                    alt={`${vendor.businessName || vendor.name || "Restaurant"} logo`}
                    className="mt-3 size-16 rounded-xl object-cover"
                  />
                )}
                {vendor?.restaurantDescription && (
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {vendor.restaurantDescription}
                  </p>
                )}
                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  {vendor?.restaurantAddress && (
                    <p className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-[#E5484D]" />
                      {vendor.restaurantAddress}
                    </p>
                  )}
                  {vendor?.restaurantContact && (
                    <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Phone className="size-4 shrink-0 text-[#E5484D]" />
                      {vendor.restaurantContact}
                    </p>
                  )}
                </div>
              </div>
            )}

            {isVendor ? (
              <div className="mt-7 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-gray-600 dark:bg-white/5 dark:text-gray-300">
                Ordering is available to customers only. Use your Vendor Dashboard to manage menu items and orders.
              </div>
            ) : (
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleOrder}
                  disabled={!canOrder}
                  className="flex-1 rounded-xl bg-[#E5484D] px-6 py-3.5 text-sm font-bold text-white shadow transition hover:bg-[#d43b40] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isOwnItem
                    ? "This is your item"
                    : canOrder
                      ? "Order this pizza"
                      : "Currently unavailable"}
                </button>

                <button
                  type="button"
                  onClick={addToCart}
                  disabled={!canOrder}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-5 py-3.5 text-sm font-bold text-gray-700 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:text-gray-200 dark:hover:bg-white/10"
                >
                  <ShoppingCart className="size-4" /> Add to cart
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={toggleFavorite}
              disabled={favoriteBusy}
              className="mt-3 flex size-12 items-center justify-center rounded-xl border border-orange-200 bg-white text-gray-500 transition hover:text-[#E5484D] disabled:opacity-50 dark:bg-slate-900"
              aria-label="Toggle favourite"
            >
              <Heart
                className={isFavorite ? "size-5 fill-[#E5484D] text-[#E5484D]" : "size-5"}
              />
            </button>
          </motion.div>
        </div>

        <ReviewSection itemId={pizza._id} />
      </div>

      <OrderModal pizza={pizza} open={orderOpen} onClose={() => setOrderOpen(false)} />
    </main>
  );
}
