"use client";

import Link from "next/link";
import { useState } from "react";

import { AddressAutocomplete } from "@/components/shop/address-autocomplete";
import { Button } from "@/components/ui/button";
import type { GeocodedAddress } from "@/lib/delivery";

export function HeroAddressEstimate() {
  const [, setAddress] = useState<GeocodedAddress | null>(null);

  return (
    <div className="grid gap-3 rounded-[1.25rem] border border-emerald-900/10 bg-white p-3 shadow-inner shadow-emerald-950/5 sm:grid-cols-[1fr_auto] sm:items-start">
      <AddressAutocomplete
        placeholder="Enter project address"
        onInputChange={() => setAddress(null)}
        onSelect={setAddress}
      />
      <Button asChild className="h-12 px-6">
        <Link href="/shop">Estimate</Link>
      </Button>
    </div>
  );
}
