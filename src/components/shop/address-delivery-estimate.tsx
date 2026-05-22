"use client";

import { useState } from "react";
import { Check, Clock, MapPin, Truck } from "lucide-react";

import { useCart } from "@/components/shop/cart-provider";
import { AddressAutocomplete } from "@/components/shop/address-autocomplete";
import { GlassCard } from "@/components/site/glass-card";
import { Separator } from "@/components/ui/separator";
import {
  calculateSelectedAddressDelivery,
  formatCurrency,
  type GeocodedAddress,
} from "@/lib/delivery";

export function AddressDeliveryEstimate() {
  const { deliveryAddress, itemCount, setDeliveryAddress } = useCart();
  const [selectedAddress, setSelectedAddress] =
    useState<GeocodedAddress | null>(deliveryAddress);

  const estimate = selectedAddress
    ? calculateSelectedAddressDelivery(selectedAddress, Math.max(itemCount, 1))
    : null;

  return (
    <GlassCard className="p-4 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(13rem,0.75fr)_minmax(20rem,1fr)_auto_auto] lg:items-start">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <MapPin className="size-5" />
          </span>
          <div>
            <h2 className="text-xl font-black text-emerald-950">
              Delivery estimate
            </h2>
            <p className="mt-1 text-sm leading-5 text-emerald-950/62">
              Start typing and select a suggested address to estimate delivery.
            </p>
          </div>
        </div>
        <div className="relative">
          <AddressAutocomplete
            defaultValue={deliveryAddress?.label}
            onInputChange={() => {
              setSelectedAddress(null);
              setDeliveryAddress(null);
            }}
            onSelect={(address) => {
              setSelectedAddress(address);
              setDeliveryAddress(address);
            }}
          />
          {selectedAddress && (
            <div className="mt-2 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
              <Check className="size-4" />
              Address selected
            </div>
          )}
        </div>
        <Separator className="lg:hidden" />
        <div className="rounded-3xl bg-emerald-50 px-4 py-3">
          <p className="flex items-center gap-2 text-xs font-bold text-emerald-700">
            <Truck className="size-4" />
            Estimated fee
          </p>
          <p className="mt-1 text-base font-black text-emerald-950">
            {estimate ? formatCurrency(estimate.fee) : "Select address"}
          </p>
        </div>
        <div className="rounded-3xl bg-lime-50 px-4 py-3">
          <p className="flex items-center gap-2 text-xs font-bold text-lime-700">
            <Clock className="size-4" />
            Earliest window
          </p>
          <p className="mt-1 text-lg font-black leading-tight text-emerald-950">
            {estimate ? estimate.window : "Pending"}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
