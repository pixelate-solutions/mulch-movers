import type { Metadata } from "next";

import { HelpFlow } from "@/components/help/help-flow";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Guided Ordering Help | Mulch Movers",
  description:
    "Answer a few questions to choose mulch, estimate quantity, and build a residential landscape material order.",
  alternates: {
    canonical: absoluteUrl("/help"),
  },
};

export default function HelpPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-700">
          Guided ordering help
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-emerald-950 sm:text-5xl">
          Answer a few questions and build the right order.
        </h1>
        <p className="mt-4 text-base leading-7 text-emerald-950/65">
          This flow walks through material needs, quantity, installation help,
          project readiness, and debris cleanup one question at a time.
        </p>
      </div>
      <HelpFlow />
    </div>
  );
}
