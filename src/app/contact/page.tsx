import type { Metadata } from "next";

import { ContactForm } from "@/components/contact/contact-form";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact | Mulch Movers",
  description:
    "Contact Mulch Movers for custom landscape material delivery questions and Metro Detroit project help.",
  alternates: {
    canonical: absoluteUrl("/contact"),
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-700">
          Contact Mulch Movers
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-emerald-950 sm:text-5xl">
          Get help after using the online order flow.
        </h1>
        <p className="mt-4 text-base leading-7 text-emerald-950/65">
          Pricing, estimating, and scheduling now start in the guided order and
          checkout flow. Use this form only for unusual access, custom requests,
          or questions.
        </p>
      </div>
      <ContactForm />
    </div>
  );
}
