import { CalendarDays, ClipboardCheck, MapPinned, Truck } from "lucide-react";

import { GlassCard } from "@/components/site/glass-card";

const steps = [
  {
    title: "Project details",
    text: "Enter your address",
    icon: MapPinned,
  },
  {
    title: "Material and services",
    text: "Choose delivery, installation, prep, or haul away.",
    icon: Truck,
  },
  {
    title: "Schedule fit",
    text: "Pick from available hours and service windows.",
    icon: CalendarDays,
  },
  {
    title: "Place order",
    text: "Review automated pricing and submit online.",
    icon: ClipboardCheck,
  },
];

export function OrderSteps() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-700">
          Easy ordering
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">
          From project idea to priced order without a call.
        </h2>
      </div>
      <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <GlassCard
            key={step.title}
            className="group p-5 transition duration-200 hover:-translate-y-1 hover:cursor-pointer hover:shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="rounded-full bg-emerald-600 px-3 py-1 text-sm font-black text-white">
                Step {index + 1}
              </span>
              <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 transition group-hover:scale-105">
                <step.icon className="size-6" />
              </span>
            </div>
            <h3 className="text-xl font-black text-emerald-950">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-emerald-950/62">{step.text}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
