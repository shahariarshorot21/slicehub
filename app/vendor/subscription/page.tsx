"use client";

import { useState, useEffect } from "react";
import { Check, Sparkles, Zap, ShieldCheck, Clock, Bell } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/hooks/use-api";
import type { Transaction } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { formatDate, formatPrice, isPremiumUser } from "@/lib/utils";

type Subscription = { subscriptionPlan: "free" | "premium"; subscriptionExpiresAt: string | null };

const freeFeatures = ["Up to 3 active menu items", "Vendor Dashboard", "Order Management"];
const premiumFeatures = [
  "Unlimited active menu items",
  "Premium Vendor Badge",
  "Featured Menu Placement",
  "Everything in Free",
];

function getLocalSubscription(): Subscription {
  if (typeof window === "undefined") return { subscriptionPlan: "free", subscriptionExpiresAt: null };
  try {
    const saved = localStorage.getItem("slicehub_demo_subscription");
    if (saved) return JSON.parse(saved);
  } catch {}
  return { subscriptionPlan: "free", subscriptionExpiresAt: null };
}

export default function SubscriptionPage() {
  const { data: apiSub, loading } = useApi<Subscription>("/payments/subscription-status");
  const { data: transactions } = useApi<Transaction[]>("/payments/transactions");
  
  const [subscription, setSubscription] = useState<Subscription>(getLocalSubscription());
  const [requestStatus, setRequestStatus] = useState<string>("none"); // "none" | "pending" | "approved"
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (apiSub) {
      setSubscription(apiSub);
    }
    const checkRequests = () => {
      try {
        const reqs = JSON.parse(localStorage.getItem("slicehub_admin_upgrade_requests") || "[]");
        if (reqs.length > 0) {
          setRequestStatus(reqs[0].status);
          if (reqs[0].status === "approved" && subscription.subscriptionPlan !== "premium") {
            const nextSub: Subscription = {
              subscriptionPlan: "premium",
              subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            };
            setSubscription(nextSub);
            localStorage.setItem("slicehub_demo_subscription", JSON.stringify(nextSub));
          }
        }
      } catch {}
    };
    checkRequests();
    window.addEventListener("slicehub-subscription-updated", checkRequests);
    return () => window.removeEventListener("slicehub-subscription-updated", checkRequests);
  }, [subscription.subscriptionPlan]);

  const premiumActive = isPremiumUser(subscription) || subscription.subscriptionPlan === "premium";
  const currentPlan = premiumActive ? "premium" : "free";

  const requestUpgradeToAdmin = () => {
    setUpgrading(true);
    setTimeout(() => {
      // অ্যাডমিনের কাছে নোটিফিকেশন এবং রিকোয়েস্ট পাঠানো হলো
      const requests = JSON.parse(localStorage.getItem("slicehub_admin_upgrade_requests") || "[]");
      const newReq = { id: Date.now(), shop: "MD Shahariar Hossen Pizzeria", date: new Date().toISOString(), status: "pending" };
      requests.unshift(newReq);
      localStorage.setItem("slicehub_admin_upgrade_requests", JSON.stringify(requests));
      
      setRequestStatus("pending");
      setUpgrading(false);
      toast.success("Upgrade request sent to Admin successfully!");
    }, 600);
  };

  // ডেমো পারপাসে অ্যাডমিন ছাড়াই ইনস্ট্যান্ট প্রিমিয়াম অ্যাক্টিভ করার অপশন বা টেস্টিং ফাংশন
  const simulateAdminApproval = () => {
    const nextSub: Subscription = {
      subscriptionPlan: "premium",
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    setSubscription(nextSub);
    localStorage.setItem("slicehub_demo_subscription", JSON.stringify(nextSub));
    
    const requests = JSON.parse(localStorage.getItem("slicehub_admin_upgrade_requests") || "[]");
    if (requests.length > 0) {
      requests[0].status = "approved";
      localStorage.setItem("slicehub_admin_upgrade_requests", JSON.stringify(requests));
    }
    setRequestStatus("approved");
    window.dispatchEvent(new Event("slicehub-subscription-updated"));
    toast.success("Admin approved your Premium request!");
  };

  const planButton = (plan: "free" | "premium") => {
    if (plan === currentPlan) {
      return (
        <button
          type="button"
          onClick={() => toast.info("Your shop is already running on Premium Power!")}
          className="w-full rounded-2xl border border-emerald-200 bg-emerald-50 py-3.5 text-sm font-black text-emerald-700 shadow-xs transition hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300"
        >
          ✓ Current Active Plan (Click to Manage)
        </button>
      );
    }
    if (plan === "premium") {
      if (requestStatus === "pending") {
        return (
          <div className="space-y-2">
            <button
              type="button"
              disabled
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 text-sm font-black text-white opacity-90 cursor-not-allowed shadow"
            >
              <Clock className="size-4 animate-spin" /> Pending Admin Approval...
            </button>
            <button
              type="button"
              onClick={simulateAdminApproval}
              className="w-full text-xs font-bold text-[#E5484D] underline hover:text-red-700 dark:text-red-400"
            >
              [Demo: Click here to simulate Admin Approval]
            </button>
          </div>
        );
      }
      return (
        <button
          type="button"
          onClick={requestUpgradeToAdmin}
          disabled={upgrading}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-[#E5484D] py-3.5 text-sm font-black text-white shadow-lg transition hover:opacity-95 disabled:opacity-60"
        >
          <Sparkles className="size-4 animate-pulse text-amber-200" />
          {upgrading ? "Sending request to Admin..." : "Upgrade to Premium Now"}
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={() => toast.info("You are currently switched to Standard Tier")}
        className="w-full rounded-2xl border border-orange-200 bg-white py-3.5 text-sm font-bold text-gray-700 transition hover:bg-orange-50 dark:bg-slate-800 dark:border-white/10 dark:text-gray-300"
      >
        Standard Free Tier (Active / Switch)
      </button>
    );
  };

  return (
    <div className="space-y-10">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#E5484D]">YOUR PIZZERIA WORKSPACE</p>
          {premiumActive && (
            <Badge tone="amber" className="gap-1 normal-case font-bold shadow-xs">
              <Sparkles className="size-3" /> Verified Premium Vendor
            </Badge>
          )}
        </div>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-900 dark:text-white">Shop Subscription</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Manage your store plan, active item limits, and featured placement perks.
        </p>
      </header>

      {loading ? (
        <LoadingState label="Loading subscription..." />
      ) : (
        <section>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#E5484D]">PLANS THAT RISE WITH YOU</p>
              <h3 className="mt-1 text-2xl font-black tracking-tight text-gray-900 dark:text-white">Accelerate your sales.</h3>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Free Plan Card */}
            <article className="relative flex flex-col overflow-hidden rounded-3xl border border-orange-100 bg-white p-8 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-slate-900">
              <div className="absolute right-0 top-0 h-32 w-32 bg-orange-50/50 rounded-bl-full pointer-events-none dark:bg-white/5" />
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-orange-50 px-3 py-1 text-xs font-extrabold text-gray-700 dark:bg-white/10 dark:text-gray-300">
                  <Zap className="size-3.5 text-orange-500" /> STARTER
                </span>
                {currentPlan === "free" && <Badge tone="gray">Active</Badge>}
              </div>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tight text-gray-900 dark:text-white">$0</span>
                <span className="text-sm font-semibold text-gray-400">/ forever free</span>
              </div>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Ideal for neighborhood pizza shops getting started online.
              </p>
              <div className="mt-6 flex-1 space-y-3.5 border-t border-orange-100 pt-6 dark:border-white/10">
                {freeFeatures.map((feature) => (
                  <p key={feature} className="flex items-start gap-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[#E5484D] dark:bg-white/10">
                      <Check className="size-3 stroke-[3]" />
                    </span> 
                    {feature}
                  </p>
                ))}
              </div>
              <div className="mt-8">{planButton("free")}</div>
            </article>

            {/* Premium Plan Card */}
            <article className="relative flex flex-col overflow-hidden rounded-3xl border-2 border-[#E5484D] bg-gradient-to-b from-orange-50/30 via-white to-white p-8 shadow-xl dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
              <span className="absolute -right-12 top-6 rotate-45 bg-[#E5484D] px-12 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow">
                POPULAR
              </span>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                  <Sparkles className="size-3.5 text-amber-600" /> UNLIMITED POWER
                </span>
                {currentPlan === "premium" && <Badge tone="amber">Active Premium</Badge>}
              </div>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tight text-[#E5484D]">$21.4</span>
                <span className="text-sm font-semibold text-gray-400">/ month</span>
              </div>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                For ambitious pizzerias ready to scale orders and brand reach.
              </p>
              <div className="mt-6 flex-1 space-y-3.5 border-t border-orange-100 pt-6 dark:border-white/10">
                {premiumFeatures.map((feature) => (
                  <p key={feature} className="flex items-start gap-3 text-sm font-medium text-gray-800 dark:text-gray-100">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[#E5484D] dark:bg-red-500/20">
                      <Check className="size-3 stroke-[3]" />
                    </span> 
                    {feature}
                  </p>
                ))}
              </div>
              <div className="mt-8">{planButton("premium")}</div>
            </article>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-gray-400">
            <Bell className="size-4 text-[#E5484D]" />
            <span>Clicking upgrade notifies the Admin instantly. Manual or demo instant approval supported.</span>
          </div>
        </section>
      )}

      <section>
        <h3 className="text-lg font-black text-gray-900 dark:text-white">Payment history</h3>
        <div className="mt-4 space-y-3">
          {!transactions?.length && subscription.subscriptionPlan !== "premium" && (
            <EmptyState title="No payments yet" message="Your verified Premium transactions will be listed here." />
          )}
          {subscription.subscriptionPlan === "premium" && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-white/10 dark:bg-slate-900">
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Premium Vendor Plan</p>
                <p className="text-xs text-gray-400">Activated via Admin Approval · Demo Verified</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-black text-[#E5484D]">{formatPrice(19)}</p>
                <Badge tone="green">completed</Badge>
              </div>
            </div>
          )}
          {transactions?.map((item) => (
            <div key={item._id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-100 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Premium plan</p>
                <p className="text-xs text-gray-400">{formatDate(item.createdAt)} · {item.stripeSessionId.slice(0, 16)}...</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-black text-[#E5484D]">{formatPrice(item.amount / 100)}</p>
                <Badge tone={item.status === "completed" ? "green" : item.status === "failed" ? "red" : "amber"}>
                  {item.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}