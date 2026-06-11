import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { serviceAreaZipCodes } from "@/lib/pricing";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop Mulch" },
  { href: "/help", label: "Help Me Choose" },
  { href: "/calculator", label: "Calculator" },
  { href: "/contact", label: "Contact" },
  { href: "/cart", label: "Cart" },
  { href: "/checkout", label: "Checkout" },
];

const serviceAreaZipList = Object.keys(serviceAreaZipCodes).sort().join(", ");

export function Footer() {
  return (
    <footer className="border-t border-white/60 bg-emerald-950 text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="relative size-12 shrink-0 overflow-hidden rounded-2xl bg-white/80 p-1 shadow-sm shadow-emerald-950/20">
              <Image
                src="/mulch-movers-logo.png?v=2026-06-08"
                alt="Mulch Movers logo"
                fill
                sizes="48px"
                className="object-contain drop-shadow-lg"
                unoptimized
              />
            </span>
            <div>
              <p className="text-xl font-black tracking-tight">Mulch Movers LLC</p>
              <p className="text-sm text-emerald-100">
                We mulch. You enjoy.
              </p>
            </div>
          </div>
          <p className="max-w-md text-sm leading-6 text-emerald-50/75">
            We source and deliver landscape materials, install mulch, prepare
            small project sites, and haul away yard debris for Metro Detroit
            residential projects.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-emerald-100">
            <ShieldCheck className="size-4 text-emerald-300" />
            Veteran owned and operated
          </p>
        </div>
        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-emerald-200">
            Service Area
          </h2>
          <div className="space-y-3 text-sm text-emerald-50/75">
            <p className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 text-emerald-300" />
              <span className="group relative inline-flex w-fit">
                <span
                  tabIndex={0}
                  className="rounded-full outline-none transition hover:cursor-help hover:text-white focus-visible:text-white focus-visible:ring-2 focus-visible:ring-emerald-300"
                >
                  Approved local ZIP codes
                </span>
                <span className="pointer-events-none absolute bottom-full left-0 z-50 mb-3 w-64 rounded-2xl border border-white/15 bg-white/95 px-4 py-3 text-sm font-semibold leading-6 text-emerald-950 opacity-0 shadow-2xl shadow-emerald-950/30 transition group-hover:opacity-100 group-focus-within:opacity-100">
                  {serviceAreaZipList}
                </span>
              </span>
            </p>
            <p className="flex items-center gap-3">
              <Phone className="size-4 text-emerald-300" />
              (248) 555-0123
            </p>
            <p className="flex items-center gap-3">
              <Mail className="size-4 text-emerald-300" />
              <a
                href="mailto:info@movingmulch.com"
                className="transition hover:cursor-pointer hover:text-white"
              >
                info@movingmulch.com
              </a>
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
        <p>© 2026 Mulch Movers LLC. All rights reserved.</p>
        <p>Online estimates include material, service, debris, and schedule capacity.</p>
      </div>
    </footer>
  );
}
