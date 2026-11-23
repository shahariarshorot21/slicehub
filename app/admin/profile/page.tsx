"use client"

import { useAuth } from "@/hooks/use-auth"
import { ProfileForm } from "@/components/dashboard/profile-form"
import { Badge } from "@/components/ui/badge"
import { LoadingState } from "@/components/ui/states"
import Image from "next/image"

export default function AdminProfilePage() {
  const { user, isPending } = useAuth()

  if (isPending) return <LoadingState label="Loading profile..." />
  if (!user) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
          Profile settings
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your admin account information.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-orange-100 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
          <p className="text-xs font-bold tracking-wide text-gray-400 uppercase">
            Account information
          </p>
          <p className="mt-2 font-bold text-gray-900 dark:text-white">
            {user.name}
          </p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <div className="rounded-2xl border border-orange-100 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
          <p className="text-xs font-bold tracking-wide text-gray-400 uppercase">
            Role
          </p>
          <div className="mt-2">
            <Badge tone="red">{user.role}</Badge>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Permissions are managed by the platform.
          </p>
        </div>
        <div className="rounded-2xl border border-orange-100 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
          <p className="text-xs font-bold tracking-wide text-gray-400 uppercase">
            Account status
          </p>
          <div className="mt-2">
            <Badge tone="green">Active</Badge>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Signed in with SliceHub authentication.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-orange-100 bg-white p-5 sm:col-span-3 dark:border-white/10 dark:bg-slate-900">
        <div className="flex items-center gap-4">
          {user.image ? (
            <Image
              src={user.image}
              alt=""
              className="size-16 rounded-full object-cover"
            />
          ) : (
            <span className="flex size-16 items-center justify-center rounded-full bg-[#E5484D] text-xl font-black text-white">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <p className="font-bold text-gray-900 dark:text-white">
              Profile image
            </p>
            <p className="text-sm text-gray-500">
              Update the image URL in the form below.
            </p>
          </div>
        </div>
      </div>

      <ProfileForm />
    </div>
  )
}
