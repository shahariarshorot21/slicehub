"use client";

import { useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SessionUser } from "@/lib/types";
import Image from "next/image";

export function ProfileForm() {
  const { user, refetch } = useAuth();
  if (!user) return null;
  return <ProfileFields key={user.id} user={user} refetch={refetch} />;
}

function ProfileFields({ user, refetch }: { user: SessionUser; refetch: () => Promise<unknown> | unknown }) {
  const [name, setName] = useState(user.name || "");
  const [image, setImage] = useState(user.image || "");
  const [businessName, setBusinessName] = useState(user.businessName || "");
  const [restaurantDescription, setRestaurantDescription] = useState(user.restaurantDescription || "");
  const [restaurantAddress, setRestaurantAddress] = useState(user.restaurantAddress || "");
  const [restaurantContact, setRestaurantContact] = useState(user.restaurantContact || "");
  const [restaurantImage, setRestaurantImage] = useState(user.restaurantImage || "");
  const [restaurantLogo, setRestaurantLogo] = useState(user.restaurantLogo || "");
  const [restaurantCover, setRestaurantCover] = useState(user.restaurantCover || "");
  const [saving, setSaving] = useState(false);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const result = await apiFetch<{ message: string }>("/me/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name,
          image: image.trim() || "",
          ...(user.role === "vendor"
            ? {
                businessName: businessName.trim(),
                restaurantDescription: restaurantDescription.trim(),
                restaurantAddress: restaurantAddress.trim(),
                restaurantContact: restaurantContact.trim(),
                restaurantImage: restaurantImage.trim() || "",
                restaurantLogo: restaurantLogo.trim() || "",
                restaurantCover: restaurantCover.trim() || "",
              }
            : {}),
        }),
      });
      toast.success(result.message);
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-2xl space-y-4 rounded-2xl border border-orange-100 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
      <div>
        <label htmlFor="profile-name" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">
          {user.role === "vendor" ? "Owner Name" : user.role === "admin" ? "Admin Name" : "Full name"}
        </label>
        <Input id="profile-name" required value={name} onChange={(event) => setName(event.target.value)} />
      </div>
      <div>
        <label htmlFor="profile-email" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Email</label>
        <Input id="profile-email" value={user.email || ""} disabled className="opacity-60" />
        <p className="mt-1 text-xs text-gray-400">Your email address cannot be changed here.</p>
      </div>

      {user.role === "vendor" && (
        <div className="space-y-4 border-t border-orange-100 pt-4 dark:border-white/10">
          <p className="text-sm font-black text-gray-900 dark:text-white">Restaurant profile</p>
          <div>
            <label htmlFor="profile-business" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Restaurant name</label>
            <Input
              id="profile-business"
              required
              maxLength={120}
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              placeholder="Mario's Pizza House"
            />
          </div>
          <div>
            <label htmlFor="profile-restaurant-description" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Restaurant Description</label>
            <Textarea
              id="profile-restaurant-description"
              maxLength={1000}
              value={restaurantDescription}
              onChange={(event) => setRestaurantDescription(event.target.value)}
              placeholder="Tell customers what makes your pizzas special..."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="profile-restaurant-address" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Location</label>
              <Input
                id="profile-restaurant-address"
                maxLength={300}
                value={restaurantAddress}
                onChange={(event) => setRestaurantAddress(event.target.value)}
                placeholder="123 Main St, New York"
              />
            </div>
            <div>
              <label htmlFor="profile-restaurant-contact" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Phone Number</label>
              <Input
                id="profile-restaurant-contact"
                maxLength={120}
                value={restaurantContact}
                onChange={(event) => setRestaurantContact(event.target.value)}
                placeholder="+1 555 0100"
              />
            </div>
          </div>
          <div>
            <label htmlFor="profile-restaurant-image" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Restaurant image URL</label>
            <Input
              id="profile-restaurant-image"
              type="url"
              value={restaurantImage}
              onChange={(event) => setRestaurantImage(event.target.value)}
              placeholder="https://..."
            />
            {restaurantImage.trim() && (

              <Image
                src={restaurantImage.trim()}
                alt="Restaurant preview"
                className="mt-3 h-32 w-full rounded-xl object-cover"
              />
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="profile-restaurant-logo" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Restaurant logo URL</label>
              <Input
                id="profile-restaurant-logo"
                type="url"
                value={restaurantLogo}
                onChange={(event) => setRestaurantLogo(event.target.value)}
                placeholder="https://..."
              />
              {restaurantLogo.trim() && (

                <Image
                  src={restaurantLogo.trim()}
                  alt="Restaurant logo preview"
                  className="mt-3 size-16 rounded-xl object-cover"
                />
              )}
            </div>
            <div>
              <label htmlFor="profile-restaurant-cover" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Restaurant cover URL</label>
              <Input
                id="profile-restaurant-cover"
                type="url"
                value={restaurantCover}
                onChange={(event) => setRestaurantCover(event.target.value)}
                placeholder="https://..."
              />
              {restaurantCover.trim() && (

                <Image
                  src={restaurantCover.trim()}
                  alt="Restaurant cover preview"
                  className="mt-3 h-24 w-full rounded-xl object-cover"
                />
              )}
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-orange-100 pt-4 dark:border-white/10">
        <label htmlFor="profile-image" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Account image URL</label>
        <Input id="profile-image" type="url" value={image} onChange={(event) => setImage(event.target.value)} placeholder="https://..." />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-[#E5484D] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#d43b40] disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
