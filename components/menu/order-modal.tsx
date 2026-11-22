"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, CreditCard, ShieldCheck, X, Pizza as PizzaIcon } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import type { Order, Pizza } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import {
  PIZZA_OPTIONS,
  PIZZA_SIZES,
  getDefaultSelection,
  unitPriceFor,
  type PizzaSelection,
} from "@/lib/pizza-customization";

const fallbackImage =
  "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80";

function today() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function OrderModal({
  pizza,
  open,
  onClose,
  selection,
  quantity = 1,
}: {
  pizza: Pizza;
  open: boolean;
  onClose: () => void;
  selection?: PizzaSelection;
  quantity?: number;
}) {
  const { user, isAuthenticated, isPending } = useAuth();
  const router = useRouter();
  const [date, setDate] = useState(today());
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState<Order | null>(null);

  const chosenSelection = selection || getDefaultSelection();
  const itemQuantity = Math.max(1, Math.floor(quantity));
  const unitPrice = unitPriceFor(pizza.price, chosenSelection);
  const total = unitPrice * itemQuantity;

  useEffect(() => {
    if (!open || isPending) return;
    if (user?.role === "vendor") {
      toast.info("Vendors cannot place food orders");
      onClose();
      router.replace("/vendor");
      return;
    }
    if (!isAuthenticated) {
      toast.info("Please sign in to place an order");
      onClose();
      router.replace("/sign-in");
    }
  }, [open, isPending, isAuthenticated, user?.role, onClose, router]);

  if (!open) return null;

  const reset = () => {
    setConfirmed(null);
    setDate(today());
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const saveDemoOrderLocally = (demoOrder: Order) => {
    try {
      const existing = JSON.parse(localStorage.getItem("slicehub_demo_orders") || "[]");
      localStorage.setItem("slicehub_demo_orders", JSON.stringify([demoOrder, ...existing]));
    } catch {
      // ignore storage error
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }
    if (user?.role === "vendor") {
      toast.error("Vendors cannot place food orders");
      router.replace("/vendor");
      return;
    }

    setLoading(true);
    const isFallbackPizza = pizza._id.startsWith("fallback-");

    try {
      if (isFallbackPizza) {
        throw new Error("DEMO_FALLBACK");
      }

      const result = await apiFetch<{ message: string; order: Order }>("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: [
            {
              itemId: pizza._id,
              quantity: itemQuantity,
              size: chosenSelection.size,
              options: chosenSelection.options,
            },
          ],
          deliveryDate: date,
          deliveryAddress: pizza.location || "Dhaka, Bangladesh",
          contactName: user?.name || "SliceHub Customer",
          contactPhone: "+1 555 0100",
          message: "Secure demo checkout order",
        }),
      });
      setConfirmed(result.order);
      toast.success("Payment successful!");
    } catch {
      // ডেমো মোডের জন্য ফলব্যাক অর্ডার সফলভাবে কনফার্ম করবে
      const mockOrder = {
        _id: `ORD-${Date.now().toString().slice(-6)}`,
        customerId: user?.id || "demo-customer",
        vendorId: pizza.vendorId,
        items: [
          {
            itemId: pizza._id,
            itemName: pizza.itemName,
            price: unitPrice,
            quantity: itemQuantity,
            size: chosenSelection.size,
            options: chosenSelection.options,
          },
        ],
        totalAmount: total,
        status: "pending",
        deliveryDate: date,
        deliveryAddress: pizza.location || "Dhaka, Bangladesh",
        contactName: user?.name || "SliceHub Customer",
        contactPhone: "+1 555 0100",
        message: "Secure demo checkout order",
        createdAt: new Date().toISOString(),
      } as unknown as Order;

      saveDemoOrderLocally(mockOrder);
      setConfirmed(mockOrder);
      toast.success("Payment successful!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Modal Container matching Image 2 & 3 style */}
      <div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-[#FDFBF7] p-6 text-stone-800 shadow-2xl sm:p-8">
        
        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#C85A32] text-white shadow-xs">
              <PizzaIcon className="size-5" />
            </div>
            <h2 className="font-serif text-2xl font-normal tracking-tight text-stone-900 sm:text-3xl">
              {confirmed ? "Payment complete" : "Secure demo checkout"}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="rounded-full p-2 text-stone-500 transition hover:bg-stone-200/60 hover:text-stone-900"
          >
            <X className="size-5" />
          </button>
        </div>

        {confirmed ? (
          /* ==================== IMAGE 3 STYLE: PAYMENT COMPLETE ==================== */
          <div className="mt-6 text-center">
            {/* Test Mode Banner */}
            <div className="mb-6 flex items-center justify-between rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <ShieldCheck className="size-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-stone-900">Demo payment</p>
                  <p className="text-[11px] text-stone-500">No real card or money is used</p>
                </div>
              </div>
              <span className="rounded-md bg-[#F4EFE6] px-2.5 py-1 text-[10px] font-bold tracking-wider text-stone-600">
                TEST MODE
              </span>
            </div>

            {/* Success Icon */}
            <div className="mx-auto mt-8 flex size-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
              <Check className="size-10 stroke-[2.5]" />
            </div>

            <h3 className="mt-6 font-serif text-3xl font-normal text-stone-900">
              You’re all set!
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-stone-500 sm:text-sm">
              Your demo payment was successful and your order is on its way to the pizzeria.
            </p>

            <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
              <Link
                href="/customer/orders"
                onClick={handleClose}
                className="flex-1 rounded-xl bg-[#C85A32] py-3.5 text-center text-xs font-semibold text-white shadow-sm transition hover:bg-[#b24d29] sm:text-sm"
              >
                Track my order
              </Link>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-xl border border-stone-300 py-3.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-100 sm:text-sm"
              >
                Continue browsing
              </button>
            </div>
          </div>
        ) : (
          /* ==================== IMAGE 2 STYLE: SECURE CHECKOUT ==================== */
          <form onSubmit={submit} className="mt-6 space-y-5">
            {/* Test Mode Banner */}
            <div className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">Demo payment</p>
                  <p className="text-[10px] text-stone-500">No real card or money is used</p>
                </div>
              </div>
              <span className="rounded-md bg-[#F4EFE6] px-2 py-1 text-[10px] font-bold tracking-wider text-stone-600">
                TEST MODE
              </span>
            </div>

            {/* Item summary card */}
            <div className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-xs">
              <div className="flex items-center gap-3.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pizza.images?.[0] || fallbackImage}
                  alt=""
                  className="size-14 rounded-xl object-cover"
                />
                <div>
                  <p className="font-serif font-bold text-stone-900">{pizza.itemName}</p>
                  <p className="text-[11px] text-stone-500">
                    {pizza.vendor?.businessName || pizza.vendor?.name || "Bottega Pizzeria"} · Delivery {date}
                  </p>
                </div>
              </div>
              <span className="font-serif text-lg font-bold text-stone-900">
                {formatPrice(total)}
              </span>
            </div>

            {/* Realistic Demo Credit Card */}
            <div className="relative overflow-hidden rounded-2xl bg-[#613A28] p-5 text-white shadow-md">
              <div className="absolute -right-10 -top-10 size-36 rounded-full bg-white/5" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-300">
                    DEMO CARD
                  </p>
                  <p className="mt-5 font-mono text-base tracking-[0.2em]">•••• •••• •••• 4242</p>
                </div>
                <CreditCard className="size-6 text-stone-300" />
              </div>
              <div className="relative mt-5 flex items-end justify-between text-xs">
                <p className="font-semibold uppercase tracking-wider text-stone-200">VISA</p>
                <p className="font-mono text-stone-300">12/30</p>
              </div>
            </div>

            <p className="text-[11px] leading-relaxed text-stone-500">
              This checkout is for demonstration only. No payment is processed and no card details are collected.
            </p>

            {/* Pay Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C85A32] py-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#b24d29] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
            >
              <span>{loading ? "Processing..." : `Pay ${formatPrice(total)}`}</span>
              <ArrowRight className="size-4" />
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleClose}
                className="text-xs font-medium text-stone-500 transition hover:text-stone-900"
              >
                Back to order details
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}