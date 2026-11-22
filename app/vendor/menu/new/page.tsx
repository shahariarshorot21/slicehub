import { MenuItemForm } from "@/components/dashboard/menu-item-form";

export default function NewMenuItemPage() {
  return (
    <div>
      <h2 className="text-2xl font-black text-gray-900 dark:text-white">Add a new pizza</h2>
      <p className="mt-1 text-sm text-gray-500">New items are submitted to an admin for approval before going live.</p>
      <div className="mt-6"><MenuItemForm /></div>
    </div>
  );
}
