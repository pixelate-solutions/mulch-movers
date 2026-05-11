"use client";

import { useMemo, useState } from "react";
import { Clock, MapPin, Truck } from "lucide-react";

import { useCart } from "@/components/shop/cart-provider";
import { GlassCard } from "@/components/site/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { calculateDeliveryFee, formatCurrency, getDeliveryWindow } from "@/lib/delivery";

export function AddressDeliveryEstimate() {
  const [address, setAddress] = useState("");
  const { itemCount } = useCart();

  const estimate = useMemo(
    () => ({
      fee: calculateDeliveryFee(address, Math.max(itemCount, 1)),
      window: getDeliveryWindow(address),
    }),
    [address, itemCount],
  );

  return (
    <GlassCard className="p-4 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(13rem,0.75fr)_minmax(20rem,1fr)_auto_auto] lg:items-center">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <MapPin className="size-5" />
          </span>
          <div>
            <h2 className="text-xl font-black text-emerald-950">
              Delivery estimate
            </h2>
            <p className="mt-1 text-sm leading-5 text-emerald-950/62">
              Enter your Metro Detroit address for a mock fee and timing window.
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="123 Main St, Royal Oak, MI"
            aria-label="Delivery address"
          />
          <Button type="button">Estimate</Button>
        </div>
        <Separator className="lg:hidden" />
        <div className="rounded-3xl bg-emerald-50 px-4 py-3">
          <p className="flex items-center gap-2 text-xs font-bold text-emerald-700">
            <Truck className="size-4" />
            Estimated fee
          </p>
          <p className="mt-1 text-2xl font-black text-emerald-950">
            {formatCurrency(estimate.fee)}
          </p>
        </div>
        <div className="rounded-3xl bg-lime-50 px-4 py-3">
          <p className="flex items-center gap-2 text-xs font-bold text-lime-700">
            <Clock className="size-4" />
            Earliest window
          </p>
          <p className="mt-1 text-lg font-black leading-tight text-emerald-950">
            {estimate.window}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
