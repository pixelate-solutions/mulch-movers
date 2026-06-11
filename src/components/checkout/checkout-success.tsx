"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

import { useCart } from "@/components/shop/cart-provider";
import { GlassCard } from "@/components/site/glass-card";
import { Button } from "@/components/ui/button";

export function CheckoutSuccess() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <GlassCard className="mx-auto max-w-2xl p-8 text-center">
      <span className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700">
        <CheckCircle2 className="size-8" />
      </span>
      <h1 className="mt-5 text-3xl font-black text-emerald-950">
        Payment received.
      </h1>
      <p className="mt-3 text-emerald-950/65">
        Your order is confirmed. A receipt and order confirmation will be sent
        after Stripe finishes processing the payment event.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/shop">Shop again</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </GlassCard>
  );
}
