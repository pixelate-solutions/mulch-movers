"use client";

import Link from "next/link";
import Image from "next/image";
import { ClipboardList, Minus, Plus, ShoppingBag, Trash2, Truck, Wrench } from "lucide-react";

import { useCart } from "@/components/shop/cart-provider";
import { GlassCard } from "@/components/site/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/delivery";
import { formatDisplayDate } from "@/lib/dates";
import { estimateOrder, serviceOptions } from "@/lib/order-estimates";

export function CartPage() {
  const {
    items,
    projectConfig,
    removeItem,
    setProjectConfig,
    subtotal,
    updateQuantity,
  } = useCart();
  const projectEstimate = projectConfig
    ? estimateOrder({
        address: projectConfig.address,
        productId: projectConfig.productId,
        quantity: projectConfig.quantity,
        family: projectConfig.materialFamily,
        services: projectConfig.services,
        prepLevel: projectConfig.prepLevel,
        debrisQuantity: projectConfig.debrisQuantity,
      })
    : null;
  const serviceTotal = projectEstimate
    ? projectEstimate.installSubtotal +
      projectEstimate.prepSubtotal +
      projectEstimate.debrisSubtotal
    : 0;
  const total = subtotal + serviceTotal;

  if (items.length === 0 && !projectConfig) {
    return (
      <GlassCard className="mx-auto max-w-2xl p-8 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700">
          <ShoppingBag className="size-8" />
        </span>
        <h1 className="mt-5 text-3xl font-black text-emerald-950">
          Your cart is ready for materials.
        </h1>
        <p className="mt-3 text-emerald-950/65">
          Add mulch, gravel, sand, soil, or compost to start a delivery estimate.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/shop">Shop materials</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/help">Get help choosing</Link>
          </Button>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="grid gap-4">
        {items.map((item) => (
          <GlassCard key={item.product.id} className="p-4">
            <div className="grid gap-4 sm:grid-cols-[6rem_1fr_auto] sm:items-center">
              <div className="relative h-24 overflow-hidden rounded-3xl">
                <Image
                  src={`/${item.product.id}.jpg`}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
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
        {projectConfig &&
          projectConfig.services.map((serviceKey) => {
            const option = serviceOptions.find((o) => o.key === serviceKey);
            const costMap: Record<string, number> = {
              mulchInstall: projectEstimate?.installSubtotal ?? 0,
              sitePrep: projectEstimate?.prepSubtotal ?? 0,
              debrisHaulAway: projectEstimate?.debrisSubtotal ?? 0,
            };
            const cost = costMap[serviceKey] ?? 0;

            return (
              <GlassCard key={serviceKey} className="p-4">
                <div className="grid gap-4 sm:grid-cols-[6rem_1fr_auto] sm:items-center">
                  <div className="flex h-24 items-center justify-center rounded-3xl bg-lime-50 text-lime-700">
                    <Wrench className="size-8" />
                  </div>
                  <div>
                    <Badge variant="secondary">Add-on service</Badge>
                    <h2 className="mt-2 text-xl font-black text-emerald-950">
                      {option?.label}
                    </h2>
                    <p className="mt-1 text-sm text-emerald-950/60">
                      {option?.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <p className="text-xl font-black text-emerald-950">
                      {cost > 0 ? formatCurrency(cost) : "Included"}
                    </p>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setProjectConfig(null)}
                      aria-label="Remove service add-on"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        {projectConfig && (
          <GlassCard className="p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-lime-100 text-lime-700">
                <ClipboardList className="size-5" />
              </span>
              <div>
                <Badge variant="secondary">Project details</Badge>
                <p className="mt-2 text-sm leading-6 text-emerald-950/62">
                  Desired date:{" "}
                  {projectConfig.desiredDate
                    ? formatDisplayDate(projectConfig.desiredDate)
                    : "Not selected"}
                </p>
                {projectConfig.notes && (
                  <p className="mt-1 text-sm leading-6 text-emerald-950/62">
                    Notes: {projectConfig.notes}
                  </p>
                )}
              </div>
            </div>
          </GlassCard>
        )}
      </div>

      <GlassCard className="h-fit p-6 lg:sticky lg:top-28">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Truck className="size-5" />
          </span>
          <div>
            <h2 className="text-2xl font-black text-emerald-950">Delivery quote</h2>
        <p className="mt-1 text-sm leading-6 text-emerald-950/62">
              Review items here. Checkout will confirm address, delivery fee,
              schedule, and payment.
            </p>
          </div>
        </div>
        <Separator className="my-5" />
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-emerald-950/62">Subtotal</span>
            <span className="font-black text-emerald-950">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-emerald-950/62">Delivery</span>
            <span className="font-black text-emerald-950">Calculated at checkout</span>
          </div>
          {serviceTotal > 0 && (
            <div className="flex justify-between">
              <span className="text-emerald-950/62">Selected services</span>
              <span className="font-black text-emerald-950">
                {formatCurrency(serviceTotal)}
              </span>
            </div>
          )}
        </div>
        <Separator className="my-5" />
        <div className="flex items-center justify-between text-xl font-black text-emerald-950">
          <span>Estimated total</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <Button asChild size="lg" className="mt-6 w-full">
          <Link href="/checkout">Proceed to checkout</Link>
        </Button>
        <Button asChild variant="secondary" size="lg" className="mt-3 w-full">
          <Link href="/shop">Keep shopping</Link>
        </Button>
      </GlassCard>
    </div>
  );
}
