import { CreditCard, Heart, LayoutDashboard, ListChecks, Package, Settings, ShoppingBag, ShoppingCart, Users } from "lucide-react";
import type { NavItem } from "@/components/dashboard/dashboard-shell";

export const customerNav: NavItem[] = [
  { href: "/customer", label: "Overview", icon: LayoutDashboard },
  { href: "/cart", label: "My Cart", icon: ShoppingCart },
  { href: "/customer/orders", label: "My Orders", icon: ShoppingBag },
  { href: "/customer/favorites", label: "Favourites", icon: Heart },
  { href: "/customer/profile", label: "Profile Settings", icon: Settings },
];

export const vendorNav: NavItem[] = [
  { href: "/vendor", label: "Overview", icon: LayoutDashboard },
  { href: "/vendor/menu", label: "My Menu Items", icon: ListChecks },
  { href: "/vendor/menu/new", label: "Add Menu Item", icon: Package },
  { href: "/vendor/orders", label: "Customer Orders", icon: ShoppingBag },
  { href: "/vendor/subscription", label: "Subscription", icon: CreditCard },
  { href: "/vendor/profile", label: "Profile Settings", icon: Settings },
];

export const adminNav: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Manage Users", icon: Users },
  { href: "/admin/menu", label: "Manage Menu Items", icon: ListChecks },
  { href: "/admin/orders", label: "All Orders", icon: ShoppingBag },
  { href: "/admin/transactions", label: "Transactions", icon: CreditCard },
  { href: "/admin/profile", label: "Profile Settings", icon: Settings },
];
