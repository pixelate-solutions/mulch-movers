import Link from "next/link";
import { ArrowRight, CalendarClock, MapPin, PackageCheck, Truck } from "lucide-react";

import { GlassCard } from "@/components/site/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const supplierSignals = [
  { label: "Brown mulch", value: "$38 / yd", icon: PackageCheck },
  { label: "Topsoil", value: "$45 / yd", icon: MapPin },
  { label: "Morning drop", value: "8-11 AM", icon: CalendarClock },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.26),transparent_34%),linear-gradient(135deg,#f7fff7_0%,#e5f8e8_42%,#f8fff6_100%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-white to-transparent" />
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-16">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white/70 px-4 py-2 text-sm font-bold text-emerald-800 shadow-sm backdrop-blur">
            <Truck className="size-4" />
            Local supplier sourcing + fast delivery
          </div>
          <h1 className="text-balance text-5xl font-black tracking-tight text-emerald-950 sm:text-6xl lg:text-7xl">
            Fast Mulch Delivery in Metro Detroit.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-950/70 sm:text-xl">
            Tell us what you need, where you need it, and when you need it. We
            source from trusted local suppliers to get you fast, affordable,
            in-stock delivery.
          </p>
          <p className="mt-3 max-w-2xl text-base leading-7 text-emerald-950/62">
            Mulch, gravel, sand, soil, and more delivered without the hassle.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/shop">
                Shop Materials
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/calculator">Use Calculator</Link>
            </Button>
          </div>
        </div>

        <GlassCard className="relative mx-auto w-full max-w-xl p-4 sm:p-5">
          <div className="overflow-hidden rounded-[1.55rem] bg-gradient-to-br from-emerald-800 via-lime-700 to-stone-700 p-5 text-white shadow-2xl shadow-emerald-950/25">
            <div className="grid min-h-80 content-between rounded-[1.25rem] border border-white/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.24),rgba(255,255,255,0.04)),radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.28),transparent_16%),radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.18),transparent_22%)] p-5 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white/75">Live sourcing</p>
                  <p className="text-2xl font-black">3 supplier options</p>
                </div>
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold">
                  Same week
                </span>
              </div>
              <div className="grid gap-3">
                {supplierSignals.map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/16 p-4 backdrop-blur"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-full bg-white/20">
                        <Icon className="size-5" />
                      </span>
                      <span className="font-semibold">{label}</span>
                    </div>
                    <span className="font-black">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-3 rounded-[1.5rem] border border-emerald-900/10 bg-white/75 p-4 shadow-inner shadow-emerald-950/5 backdrop-blur sm:grid-cols-[1fr_auto]">
            <Input placeholder="Enter delivery address" aria-label="Delivery address" />
            <Button asChild>
              <Link href="/shop">Estimate</Link>
            </Button>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
