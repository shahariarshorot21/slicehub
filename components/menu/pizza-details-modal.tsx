"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  BadgeCheck,
  MapPin,
  Pizza as PizzaIcon,
  Star,
  X,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"
import type { Pizza, Order } from "@/lib/types"
import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/components/cart/cart-context"
import { formatPrice } from "@/lib/utils"
import { getDefaultSelection, unitPriceFor } from "@/lib/pizza-customization"

const fallbackImage =
  "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1200&q=80"

export function PizzaDetailsModal({
  pizza,
  open,
  onClose,
}: {
  pizza: Pizza
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { addItem } = useCart()

  const [step, setStep] = useState<"details" | "checkout" | "success">(
    "details"
  )

  const [deliveryDate, setDeliveryDate] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [imageError, setImageError] = useState(false)
  const [loading, setLoading] = useState(false)

  const selection = getDefaultSelection()
  const quantity = 1
  const total = unitPriceFor(pizza.price, selection) * quantity

  const isVendor = user?.role === "vendor"
  const isOwnItem = user?.id === pizza.vendorId
  const canOrder = pizza.isAvailable && !isVendor && !isOwnItem

  if (!open) return null

  const reset = () => {
    setStep("details")
    setDeliveryDate("")
    setDeliveryAddress("")
    setSpecialInstructions("")
    setImageError(false)
    setLoading(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleProceedToCheckout = (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      handleClose()
      router.push("/sign-in")
      return
    }

    if (isVendor) {
      toast.info("Vendors cannot place food orders")
      return
    }
    if (isOwnItem) {
      toast.info("You cannot order your own menu item")
      return
    }
    if (!pizza.isAvailable) {
      toast.error("This pizza is currently unavailable")
      return
    }

    if (!deliveryDate || !deliveryAddress.trim()) {
      toast.error("Please enter both delivery date and address")
      return
    }

    setStep("checkout")
  }

  const handleDemoPayment = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)

      const newOrder: Order = {
        _id: `demo-${Date.now()}`,
        customer: user?.id || "demo-user",
        items: [
          {
            menuItem: pizza._id,
            nameSnapshot: pizza.itemName,
            priceSnapshot: total,
            quantity: quantity,
          },
        ],
        totalAmount: total,
        deliveryDate: new Date(deliveryDate).toISOString(),
        deliveryAddress,
        message: specialInstructions,
        status: "pending",
        createdAt: new Date().toISOString(),
      }

      try {
        const existingOrders = JSON.parse(
          localStorage.getItem("slicehub_demo_orders") || "[]"
        )
        localStorage.setItem(
          "slicehub_demo_orders",
          JSON.stringify([newOrder, ...existingOrders])
        )
        window.dispatchEvent(new Event("slicehub-orders-updated"))
      } catch {
        // ignore storage errors
      }

      addItem(pizza, quantity, selection)
      setStep("success")
      toast.success("Payment complete! Your order has been placed.")
    }, 1000)
  }

  return (
    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/50 p-4 backdrop-blur-xs duration-200 fade-in">
      {/* Main Modal Container with Warm Cream Background */}
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-[#FDFBF7] p-6 text-stone-800 shadow-2xl sm:p-8">
        {/* Top Header: Brand Icon + Title + Close Button */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-[#C85A32] text-white shadow-xs">
              <PizzaIcon className="size-5" />
            </div>
            <h2 className="font-serif text-2xl font-normal tracking-tight text-stone-900 sm:text-3xl">
              {step === "details" && "Your next favorite"}
              {step === "checkout" && "Secure demo checkout"}
              {step === "success" && "Payment complete"}
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

        {/* STEP 1: DETAILS & ORDER FORM */}
        {step === "details" && (
          <div className="grid gap-7 md:grid-cols-[1fr_1.05fr] md:gap-8">
            {/* Left Column: Full-height Rounded Image */}
            <div className="relative min-h-[300px] overflow-hidden rounded-2xl bg-stone-200 md:min-h-[460px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={pizza.images?.[0] || fallbackImage}
                src={
                  imageError || !pizza.images?.[0]
                    ? fallbackImage
                    : pizza.images[0]
                }
                alt={pizza.itemName}
                onError={() => setImageError(true)}
                className="size-full object-cover"
              />
              {!pizza.isAvailable && (
                <div className="absolute top-3 left-3 rounded-full bg-stone-900/80 px-3 py-1 text-xs font-medium text-white">
                  Unavailable
                </div>
              )}
            </div>

            {/* Right Column: Info & Order Form */}
            <form
              onSubmit={handleProceedToCheckout}
              className="flex flex-col justify-between"
            >
              <div>
                {/* Category Tag */}
                <p className="text-[11px] font-bold tracking-[0.14em] text-[#B84A27] uppercase">
                  {pizza.category || "Classic"}
                </p>

                {/* Pizza Name (Serif Font) */}
                <h3 className="mt-1 font-serif text-3xl leading-tight font-normal text-stone-900">
                  {pizza.itemName}
                </h3>

                {/* Rating Stars & Reviews */}
                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-stone-600">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        className={`size-3.5 ${
                          idx < Math.round(pizza.averageRating || 5)
                            ? "fill-amber-400 text-amber-400"
                            : "text-stone-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-stone-900">
                    {pizza.averageRating
                      ? pizza.averageRating.toFixed(1)
                      : "4.9"}
                  </span>
                  <span className="text-stone-400">
                    · 120+ local love notes
                  </span>
                </div>

                {/* Description */}
                <p className="mt-3 text-xs leading-relaxed text-stone-600 sm:text-[13px]">
                  {pizza.description}
                </p>

                {/* Location & Vendor Info */}
                <div className="mt-4 space-y-2 border-b border-stone-200/80 pb-4 text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-[#C85A32]" />
                    <span>
                      {pizza.location ||
                        pizza.vendor?.restaurantAddress ||
                        "Dhaka"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="size-4 text-[#C85A32]" />
                    <span>
                      {pizza.vendor?.businessName ||
                        pizza.vendor?.name ||
                        pizza.vendorName ||
                        "SliceHub Vendor"}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-serif text-2xl font-medium text-stone-900">
                    {formatPrice(total)}
                  </span>
                  <span className="text-xs text-stone-500">
                    · made fresh to order
                  </span>
                </div>

                {/* Form Fields */}
                <div className="mt-4 space-y-3.5">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-stone-800">
                      Delivery date
                    </label>
                    <input
                      type="date"
                      required
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-800 transition outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-stone-800">
                      Delivery address
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Street, apartment, city"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-800 transition outline-none placeholder:text-stone-400 focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-stone-800">
                      Special instructions{" "}
                      <span className="font-normal text-stone-400">
                        optional
                      </span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Extra crispy, please..."
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="w-full resize-none rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs text-stone-800 transition outline-none placeholder:text-stone-400 focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32]"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button & Disclaimer */}
              <div className="mt-5">
                {!canOrder && (
                  <p className="mb-2.5 rounded-xl bg-amber-50 px-3 py-2 text-center text-xs text-amber-800">
                    {isVendor
                      ? "Ordering is available to customers only."
                      : isOwnItem
                        ? "This is your own menu item."
                        : "This pizza is currently unavailable."}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!canOrder}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C85A32] py-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#b24d29] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                >
                  <span>Place order · {formatPrice(total)}</span>
                  <ArrowRight className="size-4" />
                </button>

                <p className="mt-2.5 text-center text-[10px] text-stone-400">
                  Payment is simulated for this demo. No charge will be made.
                </p>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: SECURE DEMO CHECKOUT (২নং ছবির মতো) */}
        {step === "checkout" && (
          <div className="mx-auto max-w-xl space-y-6 py-4">
            <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <ShieldCheck className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-900">
                    Demo payment
                  </p>
                  <p className="text-xs text-stone-500">
                    No real card or money is used
                  </p>
                </div>
              </div>
              <span className="rounded-md bg-amber-100 px-2 py-1 text-[10px] font-black tracking-wider text-amber-800 uppercase">
                Test Mode
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-4">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pizza.images?.[0] || fallbackImage}
                  alt=""
                  className="size-12 rounded-xl object-cover"
                />
                <div>
                  <p className="font-bold text-stone-900">{pizza.itemName}</p>
                  <p className="text-xs text-stone-500">
                    {pizza.vendor?.businessName ||
                      pizza.vendorName ||
                      "SliceHub Kitchen"}{" "}
                    · Delivery {new Date(deliveryDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className="font-black text-stone-900">
                {formatPrice(total)}
              </span>
            </div>

            {/* Demo Card Box */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5c3a21] to-[#3d2414] p-6 text-white shadow-xl">
              <div className="flex items-start justify-between">
                <span className="text-[10px] tracking-widest text-white/60 uppercase">
                  Demo Card
                </span>
                <span className="text-lg font-black tracking-wider italic">
                  VISA
                </span>
              </div>
              <div className="mt-8 flex items-center gap-4 font-mono text-lg tracking-widest">
                <span>••••</span>
                <span>••••</span>
                <span>••••</span>
                <span className="font-bold">4242</span>
              </div>
              <div className="mt-6 flex items-end justify-between text-xs text-white/80">
                <span>CARDHOLDER</span>
                <span className="font-mono">12/30</span>
              </div>
            </div>

            <p className="text-center text-xs text-stone-500">
              This checkout is for demonstration only. No payment is processed
              and no card details are collected.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                disabled={loading}
                onClick={handleDemoPayment}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C85A32] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b24d29] disabled:opacity-50"
              >
                <span>
                  {loading ? "Processing..." : `Pay ${formatPrice(total)}`}
                </span>
                <ArrowRight className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setStep("details")}
                className="w-full text-center text-xs font-bold text-stone-500 hover:underline"
              >
                Back to order details
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT COMPLETE / SUCCESS (৩নং ছবির মতো) */}
        {step === "success" && (
          <div className="mx-auto max-w-xl space-y-6 py-8 text-center">
            <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-4 text-left shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <ShieldCheck className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-900">
                    Demo payment
                  </p>
                  <p className="text-xs text-stone-500">
                    No real card or money is used
                  </p>
                </div>
              </div>
              <span className="rounded-md bg-amber-100 px-2 py-1 text-[10px] font-black tracking-wider text-amber-800 uppercase">
                Test Mode
              </span>
            </div>

            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
              <CheckCircle2 className="size-10" />
            </div>

            <div>
              <h3 className="font-serif text-3xl font-normal text-stone-900">
                You’re all set!
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-stone-600">
                Your demo payment was successful and your order is on its way to
                the pizzeria.
              </p>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C85A32] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b24d29]"
              >
                View orders in dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
