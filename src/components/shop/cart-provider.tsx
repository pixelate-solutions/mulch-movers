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

import { getCartQuantity, getCartSubtotal } from "@/lib/delivery";
import { getProduct } from "@/lib/products";
import type { CartItem, Product } from "@/types/product";

type StoredCartItem = {
  productId: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart() {
  try {
    const storedCart = window.localStorage.getItem("mulch-movers-cart");

    if (!storedCart) {
      return [];
    }

    const parsedCart = JSON.parse(storedCart) as StoredCartItem[];

    return parsedCart.flatMap((item) => {
      const product = getProduct(item.productId);
      return product ? [{ product, quantity: item.quantity }] : [];
    });
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const hasLoadedCart = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.requestAnimationFrame(() => {
      setItems(readStoredCart());
      hasLoadedCart.current = true;
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !hasLoadedCart.current) {
      return;
    }

    const storedItems: StoredCartItem[] = items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    window.localStorage.setItem("mulch-movers-cart", JSON.stringify(storedItems));
  }, [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem: (product, quantity = 1) => {
        setItems((currentItems) => {
          const existingItem = currentItems.find(
            (item) => item.product.id === product.id,
          );

          if (existingItem) {
            return currentItems.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            );
          }

          return [...currentItems, { product, quantity }];
        });
      },
      removeItem: (productId) => {
        setItems((currentItems) =>
          currentItems.filter((item) => item.product.id !== productId),
        );
      },
      updateQuantity: (productId, quantity) => {
        setItems((currentItems) =>
          currentItems.flatMap((item) =>
            item.product.id === productId
              ? quantity > 0
                ? [{ ...item, quantity }]
                : []
              : [item],
          ),
        );
      },
      clearCart: () => setItems([]),
      subtotal: getCartSubtotal(items),
      itemCount: getCartQuantity(items),
    }),
    [items],
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
