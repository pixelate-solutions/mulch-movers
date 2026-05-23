"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Banknote,
  CheckCircle2,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { useCart } from "@/components/shop/cart-provider";
import { AddressAutocomplete } from "@/components/shop/address-autocomplete";
import { GlassCard } from "@/components/site/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  calculateSelectedAddressDelivery,
  formatCurrency,
  type GeocodedAddress,
} from "@/lib/delivery";
import { localDateValue } from "@/lib/dates";
import { estimateOrder, scheduleDays, serviceOptions } from "@/lib/order-estimates";
import { formatPhoneInput, isValidUsPhone, phonePattern } from "@/lib/phone";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CheckoutFlow() {
  const {
    deliveryAddress,
    itemCount,
    items,
    projectConfig,
    setDeliveryAddress,
    subtotal,
    clearCart,
  } = useCart();
  const [selectedAddress, setSelectedAddress] =
    useState<GeocodedAddress | null>(deliveryAddress);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(projectConfig?.desiredDate || scheduleDays[0].date);
  const [window, setWindow] = useState(scheduleDays[0].windows[0]);
  const [dropOffNotes, setDropOffNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedDay =
    scheduleDays.find((scheduleDay) => scheduleDay.date === date) ??
    scheduleDays[0];
  const delivery = selectedAddress
    ? calculateSelectedAddressDelivery(selectedAddress, Math.max(itemCount, 1))
    : null;
  const serviceEstimate = projectConfig
    ? estimateOrder({
        address: selectedAddress?.label ?? projectConfig.address,
        productId: projectConfig.productId,
        quantity: projectConfig.quantity,
        family: projectConfig.materialFamily,
        services: projectConfig.services,
        prepLevel: projectConfig.prepLevel,
        debrisQuantity: projectConfig.debrisQuantity,
      })
    : null;
  const serviceTotal = serviceEstimate
    ? serviceEstimate.installSubtotal +
      serviceEstimate.prepSubtotal +
      serviceEstimate.debrisSubtotal
    : 0;
  const total = subtotal + (delivery?.fee ?? 0) + serviceTotal;
  const availableScheduleDates = scheduleDays.map((scheduleDay) => scheduleDay.date);

  function updateDate(nextDate: string) {
    const nextDay =
      scheduleDays.find((scheduleDay) => scheduleDay.date === nextDate) ??
      scheduleDays[0];

    setDate(nextDate);
    setWindow(nextDay.windows[0]);
  }

  if (items.length === 0 && !projectConfig) {
    return (
      <GlassCard className="mx-auto max-w-2xl p-8 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700">
          <ShoppingBag className="size-8" />
        </span>
        <h1 className="mt-5 text-3xl font-black text-emerald-950">
          Checkout needs an order first.
        </h1>
        <p className="mt-3 text-emerald-950/65">
          Add products from the shop or build a guided configuration.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/shop">Shop products</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/help">Get help choosing</Link>
          </Button>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
      <div className="grid gap-6">
        <GlassCard className="p-5 sm:p-6">
          <h2 className="text-2xl font-black text-emerald-950">
            Contact information
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-emerald-950">
              First name
              <Input
                required
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="First name"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-emerald-950">
              Last name
              <Input
                required
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Last name"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-emerald-950">
              Email
              <Input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                pattern="^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
                placeholder="you@example.com"
                title="Enter a valid email address."
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-emerald-950">
              Mobile phone
              <Input
                required
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(formatPhoneInput(event.target.value))}
                pattern={phonePattern}
                maxLength={14}
                placeholder="(248) 555-0123"
                title="Enter a valid 10-digit U.S. phone number."
              />
            </label>
          </div>
        </GlassCard>

        <GlassCard className="p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Truck className="size-5" />
            </span>
            <h2 className="text-2xl font-black text-emerald-950">
              Delivery details
            </h2>
          </div>
          <div className="relative mt-5">
            <AddressAutocomplete
              defaultValue={deliveryAddress?.label ?? projectConfig?.address}
              onInputChange={() => {
                setSelectedAddress(null);
                setDeliveryAddress(null);
              }}
              onSelect={(address) => {
                setSelectedAddress(address);
                setDeliveryAddress(address);
              }}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-emerald-950">
              Delivery date
              <DatePicker
                value={date}
                onChange={updateDate}
                availableDates={availableScheduleDates}
                minDate={localDateValue()}
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-emerald-950">
              Delivery window
              <Select value={window} onValueChange={setWindow}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose window" />
                </SelectTrigger>
                <SelectContent>
                  {selectedDay.windows.map((scheduleWindow) => (
                    <SelectItem key={scheduleWindow} value={scheduleWindow}>
                      {scheduleWindow}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          </div>
          <label className="mt-4 grid gap-2 text-sm font-bold text-emerald-950">
            Drop-off notes
            <Textarea
              value={dropOffNotes}
              onChange={(event) => setDropOffNotes(event.target.value)}
              placeholder="Driveway side, tarp location, gate code, slope, or access notes."
            />
          </label>
        </GlassCard>

        <GlassCard className="p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Banknote className="size-5" />
            </span>
            <div>
              <h2 className="text-2xl font-black text-emerald-950">Payment</h2>
              <p className="mt-0.5 text-sm text-emerald-950/60">Pay on delivery</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-emerald-950/62">
            No payment is collected now. Our crew will collect payment at the time of delivery. We accept cash, check, or card on-site.
          </p>
        </GlassCard>
      </div>

      <GlassCard className="h-fit p-5 sm:p-6 lg:sticky lg:top-28">
        <h2 className="text-2xl font-black text-emerald-950">Order summary</h2>
        <div className="mt-5 grid gap-3">
          {items.map((item) => (
            <div key={item.product.id} className="flex justify-between gap-4 text-sm">
              <span className="text-emerald-950/65">
                {item.quantity} CY {item.product.name}
              </span>
              <span className="font-black text-emerald-950">
                {formatCurrency(item.quantity * item.product.startingPrice)}
              </span>
            </div>
          ))}
          {projectConfig && (
            <div className="rounded-3xl bg-lime-50 p-4">
              <Badge variant="secondary">Services</Badge>
              <p className="mt-2 text-sm leading-6 text-emerald-950/65">
                {projectConfig.services
                  .map(
                    (service) =>
                      serviceOptions.find((option) => option.key === service)
                        ?.label,
                  )
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          )}
        </div>
        <Separator className="my-5" />
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-emerald-950/62">Materials</span>
            <span className="font-black text-emerald-950">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-emerald-950/62">Delivery</span>
            <span className="font-black text-emerald-950">
              {delivery ? formatCurrency(delivery.fee) : "Select address"}
            </span>
          </div>
          {serviceTotal > 0 && (
            <div className="flex justify-between">
              <span className="text-emerald-950/62">Services</span>
              <span className="font-black text-emerald-950">
                {formatCurrency(serviceTotal)}
              </span>
            </div>
          )}
        </div>
        <Separator className="my-5" />
        <div className="flex items-center justify-between text-xl font-black text-emerald-950">
          <span>Total</span>
          <span>{delivery ? formatCurrency(total) : "Pending"}</span>
        </div>
        {error && (
          <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            {error}
          </div>
        )}
        {submitted && (
          <div className="mt-4 rounded-3xl bg-emerald-100 p-4 text-sm font-semibold leading-6 text-emerald-800">
            <CheckCircle2 className="mr-2 inline size-4" />
            Order placed! A confirmation has been sent to {email}. Our team has also been notified.
          </div>
        )}
        <Button
          type="button"
          size="lg"
          className="mt-5 w-full"
          disabled={submitting}
          onClick={async () => {
            if (!selectedAddress) {
              setError("Select one of the suggested delivery addresses first.");
              return;
            }
            if (!firstName.trim() || !lastName.trim()) {
              setError("Enter your first and last name.");
              return;
            }
            if (!emailPattern.test(email.trim())) {
              setError("Enter a valid email address.");
              return;
            }
            if (!isValidUsPhone(phone)) {
              setError("Enter a valid 10-digit U.S. phone number.");
              return;
            }

            setError("");
            setSubmitting(true);

            try {
              const res = await fetch("/api/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  firstName: firstName.trim(),
                  lastName: lastName.trim(),
                  email: email.trim(),
                  phone,
                  address: selectedAddress.label,
                  deliveryDate: date,
                  deliveryWindow: window,
                  dropOffNotes,
                  items: items.map((item) => ({
                    name: item.product.name,
                    quantity: item.quantity,
                    unitPrice: item.product.startingPrice,
                  })),
                  services: projectConfig?.services.map(
                    (key) => serviceOptions.find((o) => o.key === key)?.label ?? key,
                  ) ?? [],
                  materialSubtotal: subtotal,
                  deliveryFee: delivery?.fee ?? 0,
                  serviceTotal,
                  total,
                }),
              });

              if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                setError(body.error?.message ?? "Failed to place order. Please try again.");
                return;
              }

              setSubmitted(true);
            } catch {
              setError("Network error. Please check your connection and try again.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {submitting ? "Placing order…" : "Place order"}
        </Button>
        {submitted && (
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="mt-3 w-full"
            onClick={clearCart}
          >
            Clear completed cart
          </Button>
        )}
      </GlassCard>
    </div>
  );
}
