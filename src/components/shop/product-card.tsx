"use client";

import Link from "next/link";
import { Calculator, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";

import { useCart } from "@/components/shop/cart-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/delivery";
import type { Product } from "@/types/product";

function formatYardQuantity(quantity: number) {
  return `${quantity} ${quantity === 1 ? "yd" : "yds"}`;
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem, items, updateQuantity } = useCart();
  const cartItem = items.find((item) => item.product.id === product.id);
  const quantity = cartItem?.quantity ?? 0;

  return (
    <Card className="group overflow-hidden transition duration-200 hover:-translate-y-1 hover:cursor-pointer hover:shadow-2xl">
      <div className="relative h-44 overflow-hidden">
        <Image
          src={`/${product.id}.jpg`}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(6,78,59,0.42),transparent)]" />
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
        <p className="mt-3 rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
          Online orders up to {product.maxCubicYards} cubic yards per{" "}
          {product.category.toLowerCase()} load.
        </p>
        <div className="mt-5">
          {quantity > 0 ? (
            <div className="flex h-11 w-full items-center justify-between rounded-full bg-emerald-600 p-1 text-white shadow-lg shadow-emerald-900/15">
              <button
                type="button"
                onClick={() => updateQuantity(product.id, quantity - 1)}
                className="flex size-9 items-center justify-center rounded-full transition hover:cursor-pointer hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                aria-label={
                  quantity === 1
                    ? `Remove ${product.name} from cart`
                    : `Decrease ${product.name} quantity`
                }
              >
                {quantity === 1 ? (
                  <Trash2 className="size-4" />
                ) : (
                  <Minus className="size-4" />
                )}
              </button>
              <span className="min-w-16 text-center text-sm font-black">
                {formatYardQuantity(quantity)}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(product.id, quantity + 1)}
                disabled={quantity >= product.maxCubicYards}
                className="flex size-9 items-center justify-center rounded-full transition hover:cursor-pointer hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                aria-label={`Increase ${product.name} quantity`}
              >
                <Plus className="size-4" />
              </button>
            </div>
          ) : (
            <Button
              onClick={() => addItem(product)}
              className="w-full bg-emerald-100 text-emerald-900 shadow-none hover:bg-emerald-200"
            >
              <Plus />
              Add to Cart
            </Button>
          )}
        </div>
        {quantity > 0 ? (
          <Button asChild variant="outline" className="mt-4 w-full">
            <Link href="/cart">
              <ShoppingBag />
              View cart
            </Link>
          </Button>
        ) : (
          <a
            href="/calculator"
            className="mt-4 flex items-center justify-center gap-2 rounded-full py-2 text-sm font-bold text-emerald-700 transition hover:cursor-pointer hover:bg-emerald-50 hover:text-emerald-900"
          >
            <Calculator className="size-4" />
            Estimate Material
          </a>
        )}
      </CardContent>
    </Card>
  );
}
