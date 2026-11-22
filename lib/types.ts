export type Role = "customer" | "vendor" | "admin";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  businessName?: string | null;
  restaurantDescription?: string | null;
  restaurantAddress?: string | null;
  restaurantContact?: string | null;
  restaurantImage?: string | null;
  restaurantLogo?: string | null;
  restaurantCover?: string | null;
  isBlocked?: boolean;
  subscriptionPlan?: "free" | "premium";
  subscriptionExpiresAt?: string | null;
  favoriteItemIds?: string[];
};

export type VendorSummary = {
  name?: string;
  image?: string | null;
  businessName?: string;
  restaurantDescription?: string | null;
  restaurantAddress?: string | null;
  restaurantContact?: string | null;
  restaurantImage?: string | null;
  restaurantLogo?: string | null;
  restaurantCover?: string | null;
};

export type Review = {
  _id: string;
  itemId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type Pizza = {
  _id: string;
  itemName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  status: "pending" | "approved" | "rejected" | "inactive";
  isAvailable: boolean;
  featured: boolean;
  vendorId: string;
  vendorName?: string;
  vendor?: VendorSummary;
  averageRating?: number;
  reviews?: Review[];
  createdAt?: string;
};

export type CartItem = {
  pizza: Pizza;
  quantity: number;
  selection?: import("./pizza-customization").PizzaSelection;
  unitPrice?: number;
};

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled"
  | "out_for_delivery"
  | "delivered"
  | "rejected";

export type OrderItemSnapshot = {
  itemId: string;
  nameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
  size?: import("./pizza-customization").PizzaSize;
  options?: import("./pizza-customization").PizzaOption[];
  unitPrice?: number;
  menuItem?: Pizza | null;
};

export type Order = {
  _id: string;
  itemId: string;
  customerId: string;
  vendorId: string;
  deliveryDate: string;
  deliveryAddress: string;
  message: string;
  status: OrderStatus;
  createdAt: string;
  item?: Pizza | null;
  items?: OrderItemSnapshot[];
  customer?: { name?: string; email?: string; image?: string | null } | null;
  contactName?: string;
  contactPhone?: string;
  subtotal?: number;
  totalAmount?: number;
};

export type Transaction = {
  _id: string;
  vendorId: string;
  plan: "free" | "premium";
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  stripeSessionId: string;
  createdAt: string;
  vendor?: { name?: string; email?: string } | null;
};
