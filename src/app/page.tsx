import Link from "next/link";
import { ArrowRight, BadgeDollarSign, Leaf, Sparkles, Truck } from "lucide-react";

import { HeroSection } from "@/components/site/hero-section";
import { OrderSteps } from "@/components/site/order-steps";
import { GlassCard } from "@/components/site/glass-card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <HeroSection />
      <OrderSteps />
      <section className="bg-white/65 py-16">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-700">
              Services offered
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">
              Delivery, installation, prep, and cleanup in one order flow.
            </h2>
            <p className="mt-4 text-base leading-7 text-emerald-950/65">
              The site guides customers through material choice, quantity,
              project readiness, haul away needs, and calendar availability so
              pricing and scheduling can happen online.
            </p>
            <Button asChild size="lg" className="mt-7">
              <Link href="/shop">
                Shop materials
                <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Material purchase and delivery",
                text: "Supplier sourcing, delivery pricing, and order timing for small residential loads.",
                icon: Truck,
              },
              {
                title: "Material installation",
                text: "Mulch spreading when beds are ready for installation.",
                icon: Leaf,
              },
              {
                title: "Project site preparation",
                text: "Light or heavy prep selections for edging, weeding, trimming, and removal.",
                icon: BadgeDollarSign,
              },
              {
                title: "Yard debris haul away",
                text: "Cleanup and haul away for shrubs, sticks, leaves, and small branches.",
                icon: Sparkles,
              },
            ].map((feature) => (
              <GlassCard key={feature.title} className="p-5">
                <span className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <feature.icon className="size-6" />
                </span>
                <h3 className="text-xl font-black text-emerald-950">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-emerald-950/62">
                  {feature.text}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-emerald-950 p-6 text-white shadow-2xl shadow-emerald-950/20 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                Ready to price your next delivery?
              </h2>
              <p className="mt-3 max-w-2xl text-emerald-50/75">
                Use the automated order flow to price materials, services,
                project prep, debris cleanup, and available schedule windows.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="secondary">
                <Link href="/calculator">Calculate quantity</Link>
              </Button>
              <Button asChild size="lg" className="bg-lime-400 text-emerald-950 hover:bg-lime-300">
                <Link href="/help">Help me choose</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
