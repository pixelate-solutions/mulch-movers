"use client";

import Link from "next/link";
import { useState } from "react";

import { AddressAutocomplete } from "@/components/shop/address-autocomplete";
import { Button } from "@/components/ui/button";
import type { GeocodedAddress } from "@/lib/delivery";

export function HeroAddressEstimate() {
  const [, setAddress] = useState<GeocodedAddress | null>(null);

  return (
    <div className="mt-4 grid gap-3 rounded-[1.5rem] border border-emerald-900/10 bg-white/75 p-4 shadow-inner shadow-emerald-950/5 backdrop-blur sm:grid-cols-[1fr_auto] sm:items-start">
      <AddressAutocomplete
        placeholder="Enter project address"
        onInputChange={() => setAddress(null)}
        onSelect={setAddress}
      />
      <Button asChild>
        <Link href="/shop">Estimate</Link>
      </Button>
    </div>
  );
}
