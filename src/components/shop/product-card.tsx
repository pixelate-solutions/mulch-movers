"use client";

import { Calculator, Minus, Plus, Truck } from "lucide-react";

import { useCart } from "@/components/shop/cart-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/delivery";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

export function ProductCard({ product }: { product: Product }) {
  const { addItem, items, updateQuantity } = useCart();
  const cartItem = items.find((item) => item.product.id === product.id);
  const quantity = cartItem?.quantity ?? 0;

  return (
    <Card className="group overflow-hidden transition duration-200 hover:-translate-y-1 hover:cursor-pointer hover:shadow-2xl">
      <div
        className={cn(
          "relative h-44 bg-gradient-to-br",
          product.imageClassName,
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_24%,rgba(255,255,255,0.34),transparent_18%),radial-gradient(circle_at_78%_36%,rgba(255,255,255,0.18),transparent_22%),linear-gradient(to_top,rgba(6,78,59,0.42),transparent)]" />
        <Badge className="absolute left-4 top-4" variant="outline">
          {product.availability}
        </Badge>
      </div>
      <CardContent className="p-5">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              {product.category}
            </p>
            <h3 className="mt-1 text-xl font-black text-emerald-950">
              {product.name}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-emerald-950/50">Starts at</p>
            <p className="text-xl font-black text-emerald-950">
              {formatCurrency(product.startingPrice)}
            </p>
          </div>
        </div>
        <p className="min-h-12 text-sm leading-6 text-emerald-950/62">
          {product.description}
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {quantity > 0 ? (
            <div className="flex h-11 w-full items-center justify-between rounded-full bg-emerald-600 p-1 text-white shadow-lg shadow-emerald-900/15">
              <button
                type="button"
                onClick={() => updateQuantity(product.id, quantity - 1)}
                className="flex size-9 items-center justify-center rounded-full transition hover:cursor-pointer hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                aria-label={`Decrease ${product.name} quantity`}
              >
                <Minus className="size-4" />
              </button>
              <span className="min-w-12 text-center text-sm font-black">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(product.id, quantity + 1)}
                className="flex size-9 items-center justify-center rounded-full transition hover:cursor-pointer hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                aria-label={`Increase ${product.name} quantity`}
              >
                <Plus className="size-4" />
              </button>
            </div>
          ) : (
            <Button onClick={() => addItem(product)} className="w-full">
              <Plus />
              Add to Cart
            </Button>
          )}
          <Button variant="secondary" className="w-full">
            <Truck />
            Estimate
          </Button>
        </div>
        <a
          href="/calculator"
          className="mt-4 flex items-center justify-center gap-2 rounded-full py-2 text-sm font-bold text-emerald-700 transition hover:cursor-pointer hover:bg-emerald-50 hover:text-emerald-900"
        >
          <Calculator className="size-4" />
          Get Delivery Estimate
        </a>
      </CardContent>
    </Card>
  );
}
