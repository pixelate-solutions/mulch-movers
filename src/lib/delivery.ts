import type { CartItem } from "@/types/product";
import type { Product } from "@/types/product";
import {
  calculateDeliveryPricing,
  deliveryZones,
  isServiceableAddress,
  serviceableDeliveryMessage,
} from "@/lib/pricing";

export type GeocodedAddress = {
  id: string;
  label: string;
  county?: string;
  state?: string;
  postcode?: string;
  longitude?: number;
  latitude?: number;
};

export const flatDeliveryFee = 80;
export const oaklandCountyDeliveryMessage =
  serviceableDeliveryMessage;
export const distanceDeliveryFeeTiers = deliveryZones;

export function isOaklandCountyAddress(address: GeocodedAddress | null) {
  return isServiceableAddress(address);
}

export function calculateSelectedAddressDelivery(
  address: GeocodedAddress,
  _itemCount: number,
) {
  void _itemCount;

  return calculateDeliveryPricing(address);
}

export function calculateDeliveryFee(address: string, _itemCount: number) {
  void _itemCount;

  return address.trim().length > 0 ? flatDeliveryFee : 0;
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
    (total, item) => total + getProductLineSubtotal(item.product, item.quantity),
    0,
  );
}

export function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export function getProductLineSubtotal(product: Product, quantity: number) {
  return roundCurrency(product.startingPrice) * quantity;
}

export function getCartQuantity(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}
