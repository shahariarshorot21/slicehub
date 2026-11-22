export const PIZZA_SIZES = [
  { id: "regular", label: "Regular", price: 0 },
  { id: "medium", label: "Medium", price: 2 },
  { id: "large", label: "Large", price: 4 },
] as const;

export const PIZZA_OPTIONS = [
  { id: "extra-cheese", label: "Extra cheese", price: 1.5 },
  { id: "pepperoni", label: "Pepperoni", price: 2 },
  { id: "mushrooms", label: "Mushrooms", price: 1 },
  { id: "olives", label: "Olives", price: 1 },
] as const;

export type PizzaSize = (typeof PIZZA_SIZES)[number]["id"];
export type PizzaOption = (typeof PIZZA_OPTIONS)[number]["id"];

export type PizzaSelection = {
  size: PizzaSize;
  options: PizzaOption[];
};

export function getDefaultSelection(): PizzaSelection {
  return { size: "regular", options: [] };
}

export function selectionKey(selection: PizzaSelection): string {
  return `${selection.size}|${[...selection.options].sort().join(",")}`;
}

export function unitPriceFor(basePrice: number, selection: PizzaSelection): number {
  const size = PIZZA_SIZES.find((entry) => entry.id === selection.size);
  const optionsTotal = PIZZA_OPTIONS.reduce(
    (sum, option) => sum + (selection.options.includes(option.id) ? option.price : 0),
    0
  );
  return basePrice + (size?.price || 0) + optionsTotal;
}

export function selectionSummary(selection: PizzaSelection): string {
  const size = PIZZA_SIZES.find((entry) => entry.id === selection.size);
  const options = selection.options
    .map((id) => PIZZA_OPTIONS.find((entry) => entry.id === id)?.label)
    .filter(Boolean);
  return [size?.label || "Regular", ...options].join(" · ");
}
