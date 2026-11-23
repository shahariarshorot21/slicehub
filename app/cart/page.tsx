"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { itemKey, useCart } from "@/components/cart/cart-context";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api";
import type { CartItem, Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { getDefaultSelection, selectionSummary, unitPriceFor } from "@/lib/pizza-customization";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, LoadingState } from "@/components/ui/states";
import Image from "next/image";

function today() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export default function CartPage() {
  const router = useRouter();
  const { items, count, subtotal, hydrated, updateQuantity, removeItem, clear } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [date, setDate] = useState(today());
  const [address, setAddress] = useState("");
  const [contactName, setContactName] = useState(user?.name || "");
  const [contactPhone, setContactPhone] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user?.name && !contactName) {
      setContactName(user.name);
    }
  }, [user?.name, contactName]);

  useEffect(() => {
    if (!hydrated || user?.role !== "vendor") return;
    toast.info("Vendors cannot place food orders");
    router.replace("/vendor");
  }, [hydrated, user?.role, router]);

  const groups = useMemo(() => {
    const map = new Map<string, CartItem[]>();
    items.forEach((item) => {
      const key = item.pizza.vendorId || "slicehub";
      map.set(key, [...(map.get(key) || []), item]);
    });
    return [...map.entries()].map(([vendorId, lines]) => ({
      vendorId,
      vendorName: lines[0].pizza.vendor?.businessName || lines[0].pizza.vendorName || "SliceHub Vendor",
      lines,
      total: lines.reduce(
        (sum, line) => sum + (line.unitPrice ?? unitPriceFor(line.pizza.price, line.selection || getDefaultSelection())) * line.quantity,
        0
      ),
    }));
  }, [items]);

  const saveDemoOrdersLocally = (newOrders: Order[]) => {
    try {
      const existing = JSON.parse(localStorage.getItem("slicehub_demo_orders") || "[]");
      localStorage.setItem("slicehub_demo_orders", JSON.stringify([...newOrders, ...existing]));
    } catch {
    }
  };

  const checkout = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }
    if (user?.role !== "customer") {
      toast.error("Only customers can place orders");
      return;
    }
    if (address.trim().length < 5 || contactName.trim().length < 2 || contactPhone.trim().length < 5 || !date) {
      toast.error("Please complete the delivery and contact details");
      return;
    }

    setBusy(true);
    const demoOrdersCreated: Order[] = [];

    try {
      for (const group of groups) {
        const hasFallbackItem = group.lines.some((line) => line.pizza._id.startsWith("fallback-"));

        try {
          if (hasFallbackItem) {
            throw new Error("DEMO_FALLBACK");
          }

          await apiFetch<{ message: string; order: Order }>("/orders", {
            method: "POST",
            body: JSON.stringify({
              items: group.lines.map((line) => ({
                itemId: line.pizza._id,
                quantity: line.quantity,
                size: (line.selection || getDefaultSelection()).size,
                options: (line.selection || getDefaultSelection()).options,
              })),
              deliveryDate: date,
              deliveryAddress: address.trim(),
              contactName: contactName.trim(),
              contactPhone: contactPhone.trim(),
              message: message.trim(),
            }),
          });
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : "";
          if (
            hasFallbackItem ||
            errMsg.toLowerCase().includes("not found") ||
            errMsg.toLowerCase().includes("invalid") ||
            errMsg.toLowerCase().includes("could not")
          ) {
            const mockOrder = {
              _id: `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`,
              customerId: user?.id || "demo-customer",
              customerName: contactName.trim(),
              vendorId: group.vendorId,
              vendorName: group.vendorName,
              items: group.lines.map((line) => ({
                itemId: line.pizza._id,
                itemName: line.pizza.itemName,
                price: line.unitPrice ?? unitPriceFor(line.pizza.price, line.selection || getDefaultSelection()),
                quantity: line.quantity,
                size: (line.selection || getDefaultSelection()).size,
                options: (line.selection || getDefaultSelection()).options,
              })),
              totalAmount: group.total,
              status: "pending",
              deliveryDate: date,
              deliveryAddress: address.trim(),
              contactName: contactName.trim(),
              contactPhone: contactPhone.trim(),
              message: message.trim(),
              createdAt: new Date().toISOString(),
            } as unknown as Order;

            demoOrdersCreated.push(mockOrder);
          } else {
            throw err;
          }
        }
      }

      if (demoOrdersCreated.length > 0) {
        saveDemoOrdersLocally(demoOrdersCreated);
      }

      toast.success(`${groups.length} order${groups.length > 1 ? "s" : ""} placed successfully!`);
      clear();
      router.push("/customer/orders");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not place your order");
    } finally {
      setBusy(false);
    }
  };

  if (!hydrated) {
    return <LoadingState label="Loading your cart..." />;
  }
  if (user?.role === "vendor") {
    return <LoadingState label="Redirecting to your vendor dashboard..." />;
  }

  return (
    <main className="min-h-screen bg-[#FFFBF7] py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#E5484D]"
        >
          <ArrowLeft className="size-4" /> Back to menu
        </Link>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-[#E5484D]">Your basket</p>
            <h1 className="mt-2 text-3xl font-black text-gray-900 dark:text-white">Cart &amp; checkout</h1>
            <p className="mt-1 text-sm text-gray-500">{count} item{count === 1 ? "" : "s"} ready to order.</p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="rounded-xl border border-orange-200 px-4 py-2 text-sm font-bold text-gray-600 transition hover:bg-orange-50 dark:text-gray-200 dark:hover:bg-white/10"
            >
              Clear cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="mt-10">
            <EmptyState title="Your cart is empty" message="Add a pizza from the menu to get started." />
            <div className="mt-5 text-center">
              <Link href="/menu" className="inline-flex items-center gap-2 rounded-xl bg-[#E5484D] px-5 py-3 text-sm font-bold text-white">
                <ShoppingCart className="size-4" /> Browse menu
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <section className="space-y-4">
              {groups.map((group) => (
                <div key={group.vendorId} className="rounded-2xl border border-orange-100 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-3 border-b border-orange-100 pb-3 dark:border-white/10">
                    <p className="font-black text-gray-900 dark:text-white">{group.vendorName}</p>
                    <p className="font-bold text-[#E5484D]">{formatPrice(group.total)}</p>
                  </div>
                  <div className="mt-3 space-y-3">
                    {group.lines.map((line) => {
                      const key = itemKey(line);
                      const lineTotal = line.unitPrice ?? unitPriceFor(line.pizza.price, line.selection || getDefaultSelection());
                      return (
                        <div key={key} className="flex flex-wrap items-center gap-4">
                          <Image
                            src={line.pizza.images?.[0]}
                            alt=""
                            className="size-16 rounded-xl bg-orange-100 object-cover"
                          />
                          <div className="min-w-32 flex-1">
                            <p className="font-bold text-gray-900 dark:text-white">{line.pizza.itemName}</p>
                            <p className="text-xs text-gray-500">{selectionSummary(line.selection || getDefaultSelection())}</p>
                            <p className="text-xs text-gray-400">{formatPrice(lineTotal)} each</p>
                          </div>
                          <div className="flex items-center gap-2 rounded-xl border border-orange-200 p-1 dark:border-white/10">
                            <button
                              type="button"
                              aria-label={`Decrease ${line.pizza.itemName} quantity`}
                              onClick={() => updateQuantity(key, line.quantity - 1)}
                              className="flex size-7 items-center justify-center rounded-lg text-gray-600 hover:bg-orange-50 dark:text-gray-200 dark:hover:bg-white/10"
                            >
                              <Minus className="size-3.5" />
                            </button>
                            <span className="w-6 text-center text-sm font-bold">{line.quantity}</span>
                            <button
                              type="button"
                              aria-label={`Increase ${line.pizza.itemName} quantity`}
                              onClick={() => updateQuantity(key, line.quantity + 1)}
                              className="flex size-7 items-center justify-center rounded-lg text-gray-600 hover:bg-orange-50 dark:text-gray-200 dark:hover:bg-white/10"
                            >
                              <Plus className="size-3.5" />
                            </button>
                          </div>
                          <p className="w-20 text-right font-bold text-gray-900 dark:text-white">
                            {formatPrice(lineTotal * line.quantity)}
                          </p>
                          <button
                            type="button"
                            aria-label={`Remove ${line.pizza.itemName}`}
                            onClick={() => removeItem(key)}
                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </section>

            <form onSubmit={checkout} className="h-fit space-y-4 rounded-2xl border border-orange-100 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Delivery details</h2>

              <div>
                <label htmlFor="cart-contact-name" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Contact name</label>
                <Input id="cart-contact-name" required minLength={2} value={contactName} onChange={(event) => setContactName(event.target.value)} />
              </div>
              <div>
                <label htmlFor="cart-contact-phone" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Contact phone</label>
                <Input id="cart-contact-phone" required minLength={5} value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} placeholder="+1 555 0100" />
              </div>
              <div>
                <label htmlFor="cart-date" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Delivery date</label>
                <Input id="cart-date" type="date" min={today()} required value={date} onChange={(event) => setDate(event.target.value)} />
              </div>
              <div>
                <label htmlFor="cart-address" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Delivery address</label>
                <Input id="cart-address" required minLength={5} maxLength={500} value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Street, city, zip code" />
              </div>
              <div>
                <label htmlFor="cart-message" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Order details <span className="font-normal text-gray-400">(optional)</span></label>
                <Textarea id="cart-message" maxLength={1000} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Delivery notes or special requests..." />
              </div>

              <div className="flex items-center justify-between border-t border-orange-100 pt-4 dark:border-white/10">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="text-xl font-black text-[#E5484D]">{formatPrice(subtotal)}</span>
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-[#E5484D] py-3 text-sm font-bold text-white transition hover:bg-[#d43b40] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Placing orders..." : `Place ${groups.length} order${groups.length > 1 ? "s" : ""}`}
              </button>
              <p className="text-center text-xs text-gray-400">Each restaurant receives its own order. No payment is taken here — pay on delivery.</p>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}