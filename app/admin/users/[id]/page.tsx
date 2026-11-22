"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ShieldBan, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/hooks/use-api";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api";
import type { Role } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { formatDate } from "@/lib/utils";

type AdminUserDetail = {
  _id: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  isBlocked?: boolean;
  businessName?: string | null;
  restaurantDescription?: string | null;
  restaurantAddress?: string | null;
  restaurantContact?: string | null;
  restaurantImage?: string | null;
  restaurantLogo?: string | null;
  restaurantCover?: string | null;
  subscriptionPlan?: string;
  subscriptionExpiresAt?: string | null;
  favoriteItemIds?: string[];
  createdAt: string;
};

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [busy, setBusy] = useState(false);
  const { data: user, loading, error, reload } = useApi<AdminUserDetail>(
    params?.id ? `/admin/users/${params.id}` : null
  );

  const changeRole = async (role: Role) => {
    if (!user || role === user.role) return;
    setBusy(true);
    try {
      const result = await apiFetch<{ message: string }>(`/admin/users/${user._id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      toast.success(result.message);
      await reload();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not change role");
    } finally {
      setBusy(false);
    }
  };

  const setBlocked = async (isBlocked: boolean) => {
    if (!user) return;
    setBusy(true);
    try {
      const result = await apiFetch<{ message: string }>(`/admin/users/${user._id}/block`, {
        method: "PATCH",
        body: JSON.stringify({ isBlocked }),
      });
      toast.success(result.message);
      await reload();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not update user");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingState label="Loading user details..." />;
  if (error || !user) {
    return (
      <div>
        <EmptyState title="User not found" message={error || "This account is no longer available."} />
        <div className="mt-5 text-center">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 rounded-xl bg-[#E5484D] px-5 py-3 text-sm font-bold text-white"
          >
            <ArrowLeft className="size-4" /> Back to users
          </Link>
        </div>
      </div>
    );
  }

  const isSelf = user._id === currentUser?.id;
  const protectedUser = isSelf || user.role === "admin";

  return (
    <div className="space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#E5484D]"
      >
        <ArrowLeft className="size-4" /> Back to users
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="" className="size-14 rounded-full bg-orange-100 object-cover" />
          ) : (
            <span className="flex size-14 items-center justify-center rounded-full bg-orange-100 text-xl font-black text-[#E5484D]">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={user.role === "admin" ? "red" : user.role === "vendor" ? "blue" : "gray"}>{user.role}</Badge>
          <Badge tone={user.isBlocked ? "red" : "green"}>{user.isBlocked ? "blocked" : "active"}</Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-orange-100 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
        <h3 className="font-black text-gray-900 dark:text-white">Account controls</h3>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200" htmlFor="user-role">
              Role
            </label>
            <Select
              id="user-role"
              value={user.role}
              disabled={busy || isSelf}
              onChange={(event) => changeRole(event.target.value as Role)}
              className="h-10 w-40 px-3 text-sm"
            >
              <option value="customer">Customer</option>
              <option value="vendor">Vendor</option>
              <option value="admin">Admin</option>
            </Select>
          </div>
          <button
            type="button"
            disabled={busy || protectedUser}
            onClick={() => setBlocked(!user.isBlocked)}
            className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50 ${
              user.isBlocked
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "bg-red-50 text-red-600 hover:bg-red-100"
            }`}
          >
            {user.isBlocked ? <ShieldCheck className="size-4" /> : <ShieldBan className="size-4" />}
            {user.isBlocked ? "Unblock user" : "Block user"}
          </button>
          {protectedUser && <p className="text-xs text-gray-400">{isSelf ? "This is your account." : "Admin accounts are protected."}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-orange-100 bg-white p-6 text-sm text-gray-600 dark:border-white/10 dark:bg-slate-900 dark:text-gray-300">
          <h3 className="font-black text-gray-900 dark:text-white">Account information</h3>
          <p><span className="font-semibold">Joined:</span> {formatDate(user.createdAt)}</p>
          <p><span className="font-semibold">Plan:</span> {user.subscriptionPlan || "free"}</p>
          <p><span className="font-semibold">Favourites:</span> {user.favoriteItemIds?.length || 0}</p>
          {user.subscriptionExpiresAt && (
            <p><span className="font-semibold">Plan expires:</span> {formatDate(user.subscriptionExpiresAt)}</p>
          )}
        </div>

        {user.role === "vendor" && (
          <div className="space-y-3 rounded-2xl border border-orange-100 bg-white p-6 text-sm text-gray-600 dark:border-white/10 dark:bg-slate-900 dark:text-gray-300">
            <h3 className="font-black text-gray-900 dark:text-white">Restaurant</h3>
            <p><span className="font-semibold">Name:</span> {user.businessName || "Not provided"}</p>
            {user.restaurantDescription && <p>{user.restaurantDescription}</p>}
            {user.restaurantAddress && <p><span className="font-semibold">Address:</span> {user.restaurantAddress}</p>}
            {user.restaurantContact && <p><span className="font-semibold">Contact:</span> {user.restaurantContact}</p>}
            {(user.restaurantCover || user.restaurantImage) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.restaurantCover || user.restaurantImage || ""}
                alt="Restaurant"
                className="h-28 w-full rounded-xl object-cover"
              />
            )}
            {user.restaurantLogo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.restaurantLogo} alt="Restaurant logo" className="size-16 rounded-xl object-cover" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
