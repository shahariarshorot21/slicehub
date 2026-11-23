"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ShieldBan, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/hooks/use-api";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api";
import type { Role } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { formatDate } from "@/lib/utils";
import Image from "next/image";

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  isBlocked?: boolean;
  businessName?: string;
  subscriptionPlan?: string;
  createdAt: string;
};

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const filters = { ...(search ? { search } : {}), ...(role ? { role } : {}), ...(status ? { status } : {}) };
  const query = `/admin/users${Object.keys(filters).length ? `?${new URLSearchParams(filters).toString()}` : ""}`;
  const { data, loading, error, reload } = useApi<AdminUser[]>(query, [query]);

  const setBlocked = async (user: AdminUser, isBlocked: boolean) => {
    const action = isBlocked ? "block" : "unblock";
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${user.name}'s account?`)) return;
    setBusyId(user._id);
    try {
      const result = await apiFetch<{ message: string }>(`/admin/users/${user._id}/block`, {
        method: "PATCH",
        body: JSON.stringify({ isBlocked }),
      });
      toast.success(result.message);
      await reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update user");
    } finally {
      setBusyId(null);
    }
  };

  const changeRole = async (user: AdminUser, nextRole: Role) => {
    if (nextRole === user.role) return;
    if (!window.confirm(`Change ${user.name}'s role from ${user.role} to ${nextRole}?`)) return;
    setBusyId(user._id);
    try {
      const result = await apiFetch<{ message: string }>(`/admin/users/${user._id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: nextRole }),
      });
      toast.success(result.message);
      await reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not change role");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-black text-gray-900 dark:text-white">Manage users</h2>
      <p className="mt-1 text-sm text-gray-500">Search accounts, change roles and block or unblock users.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
        <label className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or email..." className="pl-10" />
        </label>
        <Select value={role} onChange={(event) => setRole(event.target.value)} aria-label="Filter by role">
          <option value="">All users</option>
          <option value="customer">Customers</option>
          <option value="vendor">Vendors</option>
          <option value="admin">Admins</option>
        </Select>
        <Select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by account status">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </Select>
      </div>

      {loading && <LoadingState label="Loading users..." />}
      {!loading && error && (
        <div className="mt-8"><EmptyState title="Could not load users" message={error} /></div>
      )}
      {!loading && !error && (!data || data.length === 0) && (
        <div className="mt-8"><EmptyState title="No users found" message="Try a different search or filter." /></div>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-orange-100 bg-white dark:border-white/10 dark:bg-slate-900">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-orange-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-white/5">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-100 dark:divide-white/10">
            {data?.map((user) => {
              const isSelf = user._id === currentUser?.id;
              const disabled = busyId === user._id;
              return (
                <tr key={user._id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <Image src={user.image} alt="" className="size-9 rounded-full bg-orange-100 object-cover" />
                      ) : (
                        <span className="flex size-9 items-center justify-center rounded-full bg-orange-100 text-xs font-black text-[#E5484D]">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                        {user.businessName && <p className="text-[11px] text-orange-500">{user.businessName}</p>}
                        <Link href={`/admin/users/${user._id}`} className="mt-1 inline-block text-[11px] font-bold text-[#E5484D] hover:underline">
                          View details
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={user.role === "admin" ? "red" : user.role === "vendor" ? "blue" : "gray"}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={user.isBlocked ? "red" : "green"}>{user.isBlocked ? "blocked" : "active"}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Select
                        value={user.role}
                        disabled={disabled || isSelf}
                        onChange={(event) => changeRole(user, event.target.value as Role)}
                        aria-label={`Change role for ${user.name}`}
                        className="h-9 w-32 px-3 text-xs"
                      >
                        <option value="customer">Customer</option>
                        <option value="vendor">Vendor</option>
                        {(user.email === currentUser?.email || user.role === "admin") && (
                          <option value="admin">Admin</option>
                        )}
                      </Select>
                      {isSelf ? (
                        <span className="text-xs text-gray-400">You</span>
                      ) : user.role === "admin" ? (
                        <span className="text-xs text-gray-400">Protected</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setBlocked(user, !user.isBlocked)}
                          disabled={disabled}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold disabled:opacity-50 ${
                            user.isBlocked
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-red-50 text-red-600 hover:bg-red-100"
                          }`}
                        >
                          {user.isBlocked ? <ShieldCheck className="size-3.5" /> : <ShieldBan className="size-3.5" />}
                          {user.isBlocked ? "Unblock" : "Block"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
