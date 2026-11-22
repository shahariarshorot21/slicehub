"use client";

import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/components/cart/cart-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CartProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{ className: "font-sans" }}
        />
        {children}
      </CartProvider>
    </ThemeProvider>
  );
}