"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag } from "lucide-react";

import { useCart } from "@/components/shop/cart-provider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/calculator", label: "Calculator" },
  { href: "/shop", label: "Shop" },
  { href: "/help", label: "Help Me Choose" },
  { href: "/contact", label: "Contact" },
];

const mobileNavLinks = [
  ...navLinks,
  { href: "/cart", label: "Cart" },
];

export function Navbar() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/72 backdrop-blur-2xl">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-full transition hover:cursor-pointer"
          aria-label="Mulch Movers home"
        >
          <span className="relative size-12 overflow-hidden rounded-2xl shadow-lg shadow-emerald-900/20">
            <Image
              src="/mulch-movers-logo.png"
              alt="Mulch Movers logo"
              fill
              sizes="48px"
              className="object-cover"
              priority
            />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-black tracking-tight text-emerald-950">
              Mulch Movers
            </span>
            <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
              Veteran Owned
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-emerald-900/10 bg-white/55 p-1 shadow-sm backdrop-blur xl:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold text-emerald-950/70 transition hover:cursor-pointer hover:bg-emerald-100 hover:text-emerald-950",
                pathname === link.href && "bg-emerald-600 text-white hover:bg-emerald-600 hover:text-white",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="secondary" className="hidden sm:inline-flex">
            <Link href="/cart">
              <ShoppingBag />
              Cart
              <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs text-white">
                {itemCount}
              </span>
            </Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="xl:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Mulch Movers</SheetTitle>
                <SheetDescription>
                  Fast mulch and landscape material delivery across Metro Detroit.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 grid gap-2">
                {mobileNavLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center justify-between rounded-2xl px-4 py-3 text-base font-semibold transition hover:cursor-pointer hover:bg-emerald-100",
                        link.href === "/cart" && "sm:hidden",
                        pathname === link.href && "bg-emerald-600 text-white hover:bg-emerald-600",
                      )}
                    >
                      {link.label}
                      {link.href === "/cart" && (
                        <span className="rounded-full bg-white/25 px-2 py-1 text-xs">
                          {itemCount}
                        </span>
                      )}
                    </Link>
                  </SheetClose>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
