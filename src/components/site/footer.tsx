import Link from "next/link";
import { Mail, MapPin, Phone, Sprout } from "lucide-react";

import { Separator } from "@/components/ui/separator";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop Materials" },
  { href: "/calculator", label: "Calculator" },
  { href: "/contact", label: "Contact" },
  { href: "/cart", label: "Cart" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/60 bg-emerald-950 text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500 text-white">
              <Sprout className="size-6" />
            </span>
            <div>
              <p className="text-xl font-black tracking-tight">Mulch Movers</p>
              <p className="text-sm text-emerald-100">Fast local material delivery</p>
            </div>
          </div>
          <p className="max-w-md text-sm leading-6 text-emerald-50/75">
            We source mulch, gravel, sand, soil, and landscape materials from
            trusted Metro Detroit suppliers so your project can keep moving.
          </p>
        </div>
        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-emerald-200">
            Service Area
          </h2>
          <div className="space-y-3 text-sm text-emerald-50/75">
            <p className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 text-emerald-300" />
              Metro Detroit, including Oakland, Macomb, and Wayne County communities.
            </p>
            <p className="flex items-center gap-3">
              <Phone className="size-4 text-emerald-300" />
              (248) 555-0123
            </p>
            <p className="flex items-center gap-3">
              <Mail className="size-4 text-emerald-300" />
              orders@mulchmovers.com
            </p>
          </div>
        </div>
        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-emerald-200">
            Quick Links
          </h2>
          <div className="grid gap-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="w-fit rounded-full text-sm text-emerald-50/75 transition hover:cursor-pointer hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Separator className="bg-white/10" />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-emerald-50/60 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>© 2026 Mulch Movers. All rights reserved.</p>
        <p>Local supplier sourcing. Delivery estimates are mock values for now.</p>
      </div>
    </footer>
  );
}
