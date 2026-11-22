import type { Order, OrderItemSnapshot } from "@/lib/types";
import { PIZZA_OPTIONS, PIZZA_SIZES } from "@/lib/pizza-customization";

/** Normalizes legacy single-item orders into the same line shape as cart orders. */
export function orderLines(order: Order): OrderItemSnapshot[] {
  if (order.items?.length) return order.items;
  if (order.item) {
    return [{
      itemId: order.itemId,
      nameSnapshot: order.item.itemName,
      priceSnapshot: order.item.price,
      quantity: 1,
      menuItem: order.item,
    }];
  }
  return [];
}

export function orderLineUnitPrice(line: OrderItemSnapshot): number {
  return line.unitPrice ?? line.priceSnapshot;
}

export function orderLineTotal(line: OrderItemSnapshot): number {
  return orderLineUnitPrice(line) * line.quantity;
}

/** Human-readable size and extras persisted with the order. */
export function orderLineCustomization(line: OrderItemSnapshot): string {
  const size = line.size ? PIZZA_SIZES.find((entry) => entry.id === line.size)?.label : undefined;
  const options = (line.options || [])
    .map((id) => PIZZA_OPTIONS.find((entry) => entry.id === id)?.label)
    .filter(Boolean);
  return [size, ...options].join(" · ");
}

export function orderTotal(order: Order): number {
  const lines = orderLines(order);
  return order.totalAmount ?? lines.reduce((sum, line) => sum + orderLineTotal(line), 0);
}
