"use client";

import Link from "next/link";
import { CheckCircle2, Clock3, CreditCard, Package, Plus, ShoppingBag, Sparkles, Store } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { useAuth } from "@/hooks/use-auth";
import type { Order, Pizza, SessionUser } from "@/lib/types";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { orderStatusLabel, orderStatusTone } from "@/lib/order-status";
import { formatDate, formatPrice, isPremiumUser } from "@/lib/utils";

type VendorStats = {
  totalOrders: number;
  pendingOrders: number;
  acceptedOrders: number;
  completedOrders: number;
  totalMenuItems: number;
  revenue: number;
  recentOrders: Order[];
};

type Subscription = { subscriptionPlan: "free" | "premium"; subscriptionExpiresAt: string | null };

export default function VendorOverview() {
  const { data: items, loading: itemsLoading } = useApi<Pizza[]>("/menu-items/vendor/items");
  const { data: stats, loading: statsLoading } = useApi<VendorStats>("/orders/vendor/stats");
  const { data: subscription, loading: subscriptionLoading } = useApi<Subscription>("/payments/subscription-status");
  const { data: profile } = useApi<SessionUser>("/me/me");
  const { user } = useAuth();

  const premiumActive = isPremiumUser(subscription);
  const totalMenuItems = stats?.totalMenuItems ?? items?.length ?? 0;
  const activeMenuItems = items?.filter((item) => item.status === "approved" && item.isAvailable).length ?? 0;
  const recentItems = (items || []).slice(0, 5);
  const recentOrders = stats?.recentOrders || [];
  const restaurantName = profile?.businessName || user?.businessName || "Your restaurant";
  const loading = itemsLoading || statsLoading || subscriptionLoading;

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#E5484D]">YOUR PIZZERIA</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-900 dark:text-white">Overview</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Here&apos;s what&apos;s happening at your shop today.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge tone={premiumActive ? "amber" : "gray"}>
                {premiumActive ? "Premium Vendor" : "Free plan"}
              </Badge>
              <span className="text-sm text-gray-500 dark:text-gray-400">{restaurantName}</span>
            </div>
          </div>
          <Link
            href="/vendor/menu/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#E5484D] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#d43b40]"
          >
            <Plus className="size-4" /> Add Menu Item
          </Link>
        </div>
      </header>

      {loading && <LoadingState label="Loading your dashboard..." />}

      {!loading && (
        <>
          <section>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">At a glance</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard label="Total Menu Items" value={totalMenuItems} icon={Package} />
              <StatCard label="Active Menu Items" value={activeMenuItems} icon={CheckCircle2} tone="green" />
              <StatCard label="Pending Customer Orders" value={stats?.pendingOrders || 0} icon={Clock3} tone="amber" />
              <StatCard label="Accepted Orders" value={stats?.acceptedOrders || 0} icon={ShoppingBag} tone="blue" />
              <StatCard label="Current Subscription Plan" value={premiumActive ? "Premium" : "Free"} icon={CreditCard} />
            </div>
          </section>

          {!premiumActive && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:bg-amber-500/10">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 size-6 text-amber-600" />
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">Make room for more.</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    Upgrade to Premium for $19/month and list unlimited menu items.
                  </p>
                </div>
              </div>
              <Link href="/vendor/subscription" className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-amber-600">
                View plans
              </Link>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-orange-100 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-gray-900 dark:text-white">Recent Customer Orders</h3>
                <Link href="/vendor/orders" className="text-sm font-bold text-[#E5484D] hover:underline">View all</Link>
              </div>
              <div className="mt-4 space-y-3">
                {!recentOrders.length && <EmptyState title="No incoming orders" message="New customer orders will appear here." />}
                {recentOrders.map((order) => (
                  <div key={order._id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-100 p-4 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={order.item?.images?.[0] || order.items?.[0]?.menuItem?.images?.[0] || ""}
                        alt=""
                        className="size-12 rounded-xl bg-orange-100 object-cover"
                      />
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {order.items?.map((line) => line.nameSnapshot).join(", ") || order.item?.itemName || "Pizza order"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {order.customer?.name || order.contactName || "Customer"} · {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[#E5484D]">{formatPrice(order.totalAmount ?? 0)}</span>
                      <Badge tone={orderStatusTone(order.status)}>{orderStatusLabel(order.status)}</Badge>
                      <Link href={`/vendor/orders/${order._id}`} className="text-xs font-bold text-[#E5484D] hover:underline">Details</Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-orange-100 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-gray-900 dark:text-white">Recent Menu Items</h3>
                <Link href="/vendor/menu" className="text-sm font-bold text-[#E5484D] hover:underline">View all</Link>
              </div>
              <div className="mt-4 space-y-3">
                {!recentItems.length && <EmptyState title="No menu items yet" message="Add your first item to start building your menu." />}
                {recentItems.map((item) => (
                  <div key={item._id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-100 p-4 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.images?.[0] || ""} alt="" className="size-12 rounded-xl bg-orange-100 object-cover" />
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{item.itemName}</p>
                        <p className="text-xs text-gray-400">{item.category} · {formatPrice(item.price)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={item.status === "approved" ? "green" : item.status === "pending" ? "amber" : "red"}>
                        {item.status}
                      </Badge>
                      <Badge tone={item.isAvailable ? "blue" : "gray"}>
                        {item.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-orange-100 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Restaurant Information</h3>
              {(profile?.restaurantCover || profile?.restaurantImage) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.restaurantCover || profile.restaurantImage || ""}
                  alt=""
                  className="mt-4 h-28 w-full rounded-xl object-cover"
                />
              )}
              <div className="mt-4 flex items-start gap-4">
                {(profile?.restaurantLogo || profile?.image) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.restaurantLogo || profile.image || ""}
                    alt=""
                    className="size-14 rounded-xl bg-orange-100 object-cover"
                  />
                )}
                <div>
                  <p className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                    <Store className="size-4 text-[#E5484D]" /> {restaurantName}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {profile?.name || user?.name} · {profile?.email || user?.email}
                  </p>
                </div>
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-gray-400">Phone number</dt>
                  <dd className="mt-1 text-gray-700 dark:text-gray-200">{profile?.restaurantContact || "Not added yet"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-gray-400">Location</dt>
                  <dd className="mt-1 text-gray-700 dark:text-gray-200">{profile?.restaurantAddress || "Not added yet"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-gray-400">Description</dt>
                  <dd className="mt-1 text-gray-700 dark:text-gray-200">
                    {profile?.restaurantDescription || "Add a restaurant description in Profile Settings."}
                  </dd>
                </div>
              </dl>
              <Link href="/vendor/profile" className="mt-5 inline-flex text-sm font-bold text-[#E5484D] hover:underline">
                Edit restaurant profile
              </Link>
            </section>

            <section className="rounded-2xl border border-orange-100 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Subscription Status</h3>
              <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#E5484D] to-[#F97316] p-5 text-white">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold uppercase tracking-wide">{premiumActive ? "Premium plan" : "Free plan"}</p>
                  <Sparkles className="size-5" />
                </div>
                <p className="mt-3 text-3xl font-black">{premiumActive ? "$19 / month" : "$0 / forever"}</p>
                <p className="mt-2 text-sm text-white/85">
                  {premiumActive
                    ? subscription?.subscriptionExpiresAt
                      ? `Active until ${formatDate(subscription.subscriptionExpiresAt)}`
                      : "Active with unlimited active menu items"
                    : "Up to 3 active menu items"}
                </p>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[#E5484D]" /> Vendor Dashboard</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[#E5484D]" /> Order Management</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-[#E5484D]" /> {premiumActive ? "Premium badge and featured placement" : "Upgrade any time for unlimited items"}</li>
              </ul>
              <Link href="/vendor/subscription" className="mt-5 inline-flex text-sm font-bold text-[#E5484D] hover:underline">
                Manage subscription
              </Link>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
