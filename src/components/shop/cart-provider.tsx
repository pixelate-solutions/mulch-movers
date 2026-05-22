"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  getCartQuantity,
  getCartSubtotal,
  type GeocodedAddress,
} from "@/lib/delivery";
import type { CartProjectConfiguration } from "@/lib/order-estimates";
import { getCategoryLimit, getProduct } from "@/lib/products";
import type { CartItem, Product } from "@/types/product";

type StoredCartItem = {
  productId: string;
  quantity: number;
};

type StoredCart = {
  items: StoredCartItem[];
  projectConfig: CartProjectConfiguration | null;
  deliveryAddress: GeocodedAddress | null;
};

type CartContextValue = {
  items: CartItem[];
  projectConfig: CartProjectConfiguration | null;
  deliveryAddress: GeocodedAddress | null;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setProjectConfig: (config: CartProjectConfiguration | null) => void;
  setDeliveryAddress: (address: GeocodedAddress | null) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart() {
  try {
    const storedCart = window.localStorage.getItem("mulch-movers-cart");

    if (!storedCart) {
      return { items: [], projectConfig: null, deliveryAddress: null };
    }

    const parsedCart = JSON.parse(storedCart) as StoredCart | StoredCartItem[];
    const storedItems = Array.isArray(parsedCart)
      ? parsedCart
      : parsedCart.items;
    const projectConfig = Array.isArray(parsedCart)
      ? null
      : parsedCart.projectConfig;
    const deliveryAddress = Array.isArray(parsedCart)
      ? null
      : parsedCart.deliveryAddress;

    return {
      items: storedItems.flatMap((item) => {
        const product = getProduct(item.productId);
        return product ? [{ product, quantity: item.quantity }] : [];
      }),
      projectConfig,
      deliveryAddress,
    };
  } catch {
    return { items: [], projectConfig: null, deliveryAddress: null };
  }
}

function getOtherCategoryQuantity(
  items: CartItem[],
  product: Product,
  productIdToIgnore?: string,
) {
  return items.reduce((total, item) => {
    if (
      item.product.category !== product.category ||
      item.product.id === productIdToIgnore
    ) {
      return total;
    }

    return total + item.quantity;
  }, 0);
}

function clampProductQuantity(
  items: CartItem[],
  product: Product,
  quantity: number,
) {
  const categoryLimit = getCategoryLimit(product.category);
  const otherCategoryQuantity = getOtherCategoryQuantity(
    items,
    product,
    product.id,
  );

  return Math.max(0, Math.min(quantity, categoryLimit - otherCategoryQuantity));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [projectConfig, setProjectConfig] =
    useState<CartProjectConfiguration | null>(null);
  const [deliveryAddress, setDeliveryAddress] =
    useState<GeocodedAddress | null>(null);
  const hasLoadedCart = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.requestAnimationFrame(() => {
      const storedCart = readStoredCart();
      setItems(storedCart.items);
      setProjectConfig(storedCart.projectConfig);
      setDeliveryAddress(storedCart.deliveryAddress);
      hasLoadedCart.current = true;
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !hasLoadedCart.current) {
      return;
    }

    const storedCart: StoredCart = {
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      projectConfig,
      deliveryAddress,
    };

    window.localStorage.setItem("mulch-movers-cart", JSON.stringify(storedCart));
  }, [deliveryAddress, items, projectConfig]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      projectConfig,
      deliveryAddress,
      addItem: (product, quantity = 1) => {
        setItems((currentItems) => {
          const existingItem = currentItems.find(
            (item) => item.product.id === product.id,
          );

          if (existingItem) {
            const safeQuantity = clampProductQuantity(
              currentItems,
              product,
              existingItem.quantity + quantity,
            );

            return currentItems.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: safeQuantity }
                : item,
            );
          }

          const safeQuantity = clampProductQuantity(
            currentItems,
            product,
            quantity,
          );

          if (safeQuantity <= 0) {
            return currentItems;
          }

          return [...currentItems, { product, quantity: safeQuantity }];
        });
      },
      removeItem: (productId) => {
        setItems((currentItems) =>
          currentItems.filter((item) => item.product.id !== productId),
        );
      },
      updateQuantity: (productId, quantity) => {
        setItems((currentItems) =>
          currentItems.flatMap((item) => {
            if (item.product.id !== productId) {
              return [item];
            }

            const safeQuantity = clampProductQuantity(
              currentItems,
              item.product,
              quantity,
            );

            return safeQuantity > 0 ? [{ ...item, quantity: safeQuantity }] : [];
          }),
        );
      },
      setProjectConfig,
      setDeliveryAddress,
      clearCart: () => {
        setItems([]);
        setProjectConfig(null);
        setDeliveryAddress(null);
      },
      subtotal: getCartSubtotal(items),
      itemCount: getCartQuantity(items),
    }),
    [deliveryAddress, items, projectConfig],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
