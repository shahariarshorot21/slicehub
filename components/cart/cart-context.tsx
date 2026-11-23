"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem, Pizza } from "@/lib/types";
import {
  PIZZA_OPTIONS,
  PIZZA_SIZES,
  getDefaultSelection,
  selectionKey,
  unitPriceFor,
  type PizzaSelection,
} from "@/lib/pizza-customization";

const STORAGE_KEY = "slicehub-cart-v1";

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  addItem: (pizza: Pizza, quantity?: number, selection?: PizzaSelection) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function itemKey(item: CartItem): string {
  return `${item.pizza._id}|${selectionKey(item.selection || getDefaultSelection())}`;
}

function normalizeSelection(value: PizzaSelection | undefined): PizzaSelection {
  const fallback = getDefaultSelection();
  if (!value) return fallback;
  const size = PIZZA_SIZES.some((entry) => entry.id === value.size) ? value.size : fallback.size;
  const options = (value.options || []).filter((id) => PIZZA_OPTIONS.some((entry) => entry.id === id));
  return { size, options };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Array<Partial<CartItem> & { pizza?: Pizza; quantity?: number }>;
          if (Array.isArray(parsed) && !cancelled) {
            setItems(
              parsed.flatMap((entry) => {
                const pizza = entry.pizza;
                const quantity = Number(entry.quantity);
                if (!pizza?._id || !Number.isFinite(quantity) || quantity < 1) return [];
                const selection = normalizeSelection(entry.selection);
                return [
                  {
                    pizza,
                    quantity: Math.min(20, Math.floor(quantity)),
                    selection,
                    unitPrice: unitPriceFor(pizza.price, selection),
                  },
                ];
              })
            );
          }
        }
      } catch {
      } finally {
        if (!cancelled) setHydrated(true);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
    }
  }, [items, hydrated]);

  const addItem = useCallback((pizza: Pizza, quantity = 1, selection = getDefaultSelection()) => {
    const amount = Math.max(1, Math.floor(quantity));
    const normalizedSelection = normalizeSelection(selection);
    const unitPrice = unitPriceFor(pizza.price, normalizedSelection);
    setItems((current) => {
      const key = `${pizza._id}|${selectionKey(normalizedSelection)}`;
      const existing = current.find((entry) => itemKey(entry) === key);
      if (existing) {
        return current.map((entry) =>
          itemKey(entry) === key ? { ...entry, quantity: Math.min(20, entry.quantity + amount) } : entry
        );
      }
      return [...current, { pizza, quantity: Math.min(20, amount), selection: normalizedSelection, unitPrice }];
    });
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    if (quantity < 1) {
      setItems((current) => current.filter((entry) => itemKey(entry) !== key));
      return;
    }
    setItems((current) =>
      current.map((entry) =>
        itemKey(entry) === key ? { ...entry, quantity: Math.min(20, Math.floor(quantity)) } : entry
      )
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((current) => current.filter((entry) => itemKey(entry) !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((sum, entry) => sum + entry.quantity, 0),
      subtotal: items.reduce(
        (sum, entry) => sum + (entry.unitPrice ?? unitPriceFor(entry.pizza.price, entry.selection || getDefaultSelection())) * entry.quantity,
        0
      ),
      hydrated,
      addItem,
      updateQuantity,
      removeItem,
      clear,
    }),
    [items, hydrated, addItem, updateQuantity, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}

export { itemKey };
