import { ProfileForm } from "@/components/dashboard/profile-form";

export default function VendorProfilePage() {
  return (
    <div>
      <h2 className="text-2xl font-black text-gray-900 dark:text-white">Profile settings</h2>
      <p className="mt-1 text-sm text-gray-500">Update your name, restaurant name and profile image.</p>
      <div className="mt-6"><ProfileForm /></div>
    </div>
  );
}
