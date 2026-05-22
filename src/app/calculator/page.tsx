import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { MaterialCalculator } from "@/components/calculator/material-calculator";
import { Button } from "@/components/ui/button";

export default function CalculatorPage() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-700">
          Estimate quantity
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-emerald-950 sm:text-5xl">
          Know how many cubic yards to order.
        </h1>
        <p className="mt-4 text-base leading-7 text-emerald-950/65">
          Enter your project dimensions and choose a common mulch depth or a
          custom depth in feet. The calculator rounds up so you can request a
          practical order quantity.
        </p>
        <Button asChild size="lg" className="mt-7">
          <Link href="/shop">
            Ready? Start shopping
            <ArrowRight />
          </Link>
        </Button>
      </div>
      <MaterialCalculator />
    </div>
  );
}
