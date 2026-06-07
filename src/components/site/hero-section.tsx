import Link from "next/link";
import {
  ArrowRight,
  CircleHelp,
  PackageCheck,
  Truck,
} from "lucide-react";

import { GlassCard } from "@/components/site/glass-card";
import { HeroAddressEstimate } from "@/components/site/hero-address-estimate";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.26),transparent_34%),linear-gradient(135deg,#f7fff7_0%,#e5f8e8_42%,#f8fff6_100%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-white to-transparent" />
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-16">
        <div className="max-w-3xl">
          <h1 className="text-balance text-5xl font-black tracking-tight text-emerald-950 sm:text-6xl lg:text-7xl">
            Welcome to Mulch Movers LLC.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-950/70 sm:text-xl">
            We exist to help your landscape goals come true. We specialize in
            small-to-mid-size residential mulch deliveries and installation.
          </p>
          <p className="mt-3 max-w-2xl text-base leading-7 text-emerald-950/62">
            Choose materials, installation help, site prep, debris haul away,
            and an available schedule slot without calling for pricing.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold text-emerald-800">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 shadow-sm backdrop-blur">
              <Truck className="size-4" />
              Serving the Metro Detroit area
            </span>
          </div>
        </div>

        <GlassCard className="relative mx-auto w-full max-w-xl p-4 sm:p-5">
          <div className="grid gap-4">
            <div className="flex flex-col gap-4 rounded-[1.5rem] bg-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                  <PackageCheck className="size-5" />
                </span>
                <div>
                  <p className="text-lg font-black text-emerald-950">
                    I know what I need
                  </p>
                  <p className="mt-1 text-sm leading-6 text-emerald-950/62">
                    Browse materials and add cubic yards to your cart.
                  </p>
                </div>
              </div>
              <Button asChild size="lg" className="shrink-0">
                <Link href="/shop">
                  Shop materials
                  <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="flex flex-col gap-4 rounded-[1.5rem] bg-lime-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-lime-600 text-white">
                  <CircleHelp className="size-5" />
                </span>
                <div>
                  <p className="text-lg font-black text-emerald-950">
                    I need some guidance
                  </p>
                  <p className="mt-1 text-sm leading-6 text-emerald-950/62">
                    Answer a few questions and build the order step by step.
                  </p>
                </div>
              </div>
              <Button asChild size="lg" variant="secondary" className="shrink-0">
                <Link href="/help">
                  Help me choose
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
          <HeroAddressEstimate />
        </GlassCard>
      </div>
    </section>
  );
}
