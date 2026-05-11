import type { CartItem } from "@/types/product";

export function calculateDeliveryFee(address: string, itemCount: number) {
  const baseFee = address.trim().length > 0 ? 39 : 49;
  const loadFee = Math.max(0, itemCount - 1) * 7;
  const distanceSignal = address.trim().length % 18;

  return baseFee + loadFee + distanceSignal;
}

export function getDeliveryWindow(address: string) {
  if (!address.trim()) {
    return "Enter an address for a delivery window";
  }

  const windows = [
    "Tomorrow morning",
    "Tomorrow afternoon",
    "2 business days",
    "Next available Saturday",
  ];

  return windows[address.trim().length % windows.length];
}

export function getCartSubtotal(items: CartItem[]) {
  return items.reduce(
    (total, item) => total + item.product.startingPrice * item.quantity,
    0,
  );
}

export function getCartQuantity(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
