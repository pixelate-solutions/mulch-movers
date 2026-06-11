import Link from "next/link";
import {
  ArrowRight,
  CircleHelp,
  Clock,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { HeroAddressEstimate } from "@/components/site/hero-address-estimate";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#f7fff7] text-emerald-950">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_22%,rgba(132,204,22,0.22),transparent_32%),radial-gradient(circle_at_88%_18%,rgba(16,185,129,0.18),transparent_28%),linear-gradient(135deg,#fafff8_0%,#e5f8e8_46%,#f7fff3_100%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-white to-transparent" />

      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,0.96fr)_minmax(24rem,0.74fr)] lg:px-8 lg:py-14">
        <div className="max-w-4xl pt-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white/80 px-4 py-2 text-sm font-bold text-emerald-800 shadow-sm backdrop-blur">
            <Truck className="size-4 text-emerald-700" />
            Delivery, install, prep, and cleanup in approved ZIP codes
          </div>
          <h1 className="mt-6 max-w-4xl text-balance text-5xl font-black tracking-tight text-emerald-950 sm:text-6xl lg:text-7xl">
            Mulch Delivery & Installation
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-950/72 sm:text-xl">
            Price your small residential load, choose the add-ons you need, and
            reserve a delivery window without waiting on a callback.
          </p>
          <div className="mt-8 grid max-w-2xl gap-3 text-sm font-bold text-emerald-800 sm:grid-cols-3">
            {[
              { label: "Local delivery windows", icon: Clock },
              { label: "Online checkout", icon: ShieldCheck },
              { label: "Drop-off notes", icon: MapPin },
            ].map((item) => (
              <div
                key={item.label}
                className="flex min-h-14 items-center gap-3 border-l border-emerald-600/35 pl-3"
              >
                <item.icon className="size-4 shrink-0 text-emerald-700" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full justify-self-end rounded-[1.75rem] border border-emerald-900/10 bg-white/88 p-3 text-emerald-950 shadow-2xl shadow-emerald-950/12 backdrop-blur">
          <div className="rounded-[1.25rem] bg-emerald-950 p-5 text-white">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-lime-300">
              Start here
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight">
              Get pricing in minutes.
            </h2>
            <p className="mt-2 text-sm leading-6 text-emerald-50/72">
              Pick a direct path or use the guided builder for quantity,
              add-ons, schedule, and payment.
            </p>
          </div>
          <div className="grid gap-3 p-3">
            <div className="flex flex-col gap-4 rounded-[1.25rem] border border-emerald-900/10 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                  <PackageCheck className="size-5" />
                </span>
                <div>
                  <p className="text-lg font-black text-emerald-950">
                    I know what I need
                  </p>
                  <p className="mt-1 text-sm leading-6 text-emerald-950/62">
                    Choose mulch and add cubic yards to your cart.
                  </p>
                </div>
              </div>
              <Button asChild size="lg" className="shrink-0">
                <Link href="/shop">
                  Shop
                  <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="flex flex-col gap-4 rounded-[1.25rem] border border-lime-900/10 bg-lime-50 p-4 sm:flex-row sm:items-center sm:justify-between">
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
            <HeroAddressEstimate />
          </div>
        </div>
      </div>
    </section>
  );
}
