"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";

import { useCart } from "@/components/shop/cart-provider";
import { GlassCard } from "@/components/site/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { calculateDeliveryFee, formatCurrency } from "@/lib/delivery";
import { useState } from "react";

export function CartPage() {
  const { items, itemCount, removeItem, subtotal, updateQuantity } = useCart();
  const [address, setAddress] = useState("");
  const deliveryFee = items.length > 0 ? calculateDeliveryFee(address, itemCount) : 0;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <GlassCard className="mx-auto max-w-2xl p-8 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-[1.5rem] bg-emerald-100 text-emerald-700">
          <ShoppingBag className="size-8" />
        </span>
        <h1 className="mt-5 text-3xl font-black text-emerald-950">
          Your cart is ready for materials.
        </h1>
        <p className="mt-3 text-emerald-950/65">
          Add mulch, gravel, sand, soil, or compost to start a delivery estimate.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/shop">Shop materials</Link>
        </Button>
      </GlassCard>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="grid gap-4">
        {items.map((item) => (
          <GlassCard key={item.product.id} className="p-4">
            <div className="grid gap-4 sm:grid-cols-[6rem_1fr_auto] sm:items-center">
              <div
                className={`h-24 rounded-[1.5rem] bg-gradient-to-br ${item.product.imageClassName}`}
              />
              <div>
                <Badge variant="outline">{item.product.category}</Badge>
                <h2 className="mt-2 text-xl font-black text-emerald-950">
                  {item.product.name}
                </h2>
                <p className="mt-1 text-sm text-emerald-950/60">
                  {formatCurrency(item.product.startingPrice)} / cubic yard
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <div className="flex items-center rounded-full border border-emerald-900/10 bg-white/70 p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity - 1)
                    }
                    aria-label={`Decrease ${item.product.name}`}
                  >
                    <Minus />
                  </Button>
                  <span className="w-10 text-center font-black text-emerald-950">
                    {item.quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity + 1)
                    }
                    aria-label={`Increase ${item.product.name}`}
                  >
                    <Plus />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeItem(item.product.id)}
                  aria-label={`Remove ${item.product.name}`}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="h-fit p-6 lg:sticky lg:top-28">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Truck className="size-5" />
          </span>
          <div>
            <h2 className="text-2xl font-black text-emerald-950">Delivery quote</h2>
            <p className="mt-1 text-sm leading-6 text-emerald-950/62">
              Mock estimate based on item count and address.
            </p>
          </div>
        </div>
        <label className="mt-5 grid gap-2 text-sm font-bold text-emerald-950">
          Delivery address
          <Input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Enter delivery address"
          />
        </label>
        <Separator className="my-5" />
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-emerald-950/62">Subtotal</span>
            <span className="font-black text-emerald-950">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-emerald-950/62">Estimated delivery</span>
            <span className="font-black text-emerald-950">
              {formatCurrency(deliveryFee)}
            </span>
          </div>
        </div>
        <Separator className="my-5" />
        <div className="flex items-center justify-between text-xl font-black text-emerald-950">
          <span>Estimated total</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <Button size="lg" className="mt-6 w-full">
          Request delivery slot
        </Button>
        <Button asChild variant="secondary" size="lg" className="mt-3 w-full">
          <Link href="/shop">Keep shopping</Link>
        </Button>
      </GlassCard>
    </div>
  );
}
