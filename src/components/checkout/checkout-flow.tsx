"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CreditCard,
  ShoppingBag,
  Sparkles,
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
  getProductLineSubtotal,
  isOaklandCountyAddress,
  oaklandCountyDeliveryMessage,
  type GeocodedAddress,
} from "@/lib/delivery";
import { localDateValue } from "@/lib/dates";
import {
  estimateOrder,
  scheduleDays,
  serviceOptions,
  type PrepLevel,
  type ServiceKey,
} from "@/lib/order-estimates";
import { formatPhoneInput, isValidUsPhone, phonePattern } from "@/lib/phone";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const checkoutServiceOptions = serviceOptions.filter(
  (option) => option.key !== "delivery",
);
const prepOptions: { value: Exclude<PrepLevel, "ready">; label: string }[] = [
  { value: "light", label: "Light prep" },
  { value: "moderate", label: "Moderate prep" },
  { value: "heavy", label: "Heavy prep" },
];

export function CheckoutFlow() {
  const {
    deliveryAddress,
    itemCount,
    items,
    projectConfig,
    setDeliveryAddress,
    subtotal,
  } = useCart();
  const [selectedAddress, setSelectedAddress] =
    useState<GeocodedAddress | null>(deliveryAddress);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(projectConfig?.desiredDate ?? "");
  const initialScheduleDay = scheduleDays.find(
    (scheduleDay) => scheduleDay.date === projectConfig?.desiredDate,
  );
  const [deliveryWindow, setDeliveryWindow] = useState(
    initialScheduleDay?.windows[0] ?? "",
  );
  const [dropOffNotes, setDropOffNotes] = useState("");
  const [checkoutServices, setCheckoutServices] = useState<ServiceKey[]>(
    projectConfig?.services.filter((service) => service !== "delivery") ?? [],
  );
  const [checkoutPrepLevel, setCheckoutPrepLevel] = useState<PrepLevel | "">(
    projectConfig?.prepLevel && projectConfig.prepLevel !== "ready"
      ? projectConfig.prepLevel
      : "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const hasCountyBlockedAddress =
    Boolean(selectedAddress) && !isOaklandCountyAddress(selectedAddress);

  const selectedDay =
    scheduleDays.find((scheduleDay) => scheduleDay.date === date) ?? null;
  const delivery = selectedAddress && !hasCountyBlockedAddress
    ? calculateSelectedAddressDelivery(selectedAddress, Math.max(itemCount, 1))
    : null;
  const materialQuantity =
    projectConfig?.quantity ??
    items.reduce((total, item) => total + item.quantity, 0);
  const selectedProductId =
    projectConfig?.productId ?? items[0]?.product.id ?? "brown-mulch";
  const activePrepLevel: PrepLevel =
    checkoutServices.includes("sitePrep") && checkoutPrepLevel
      ? checkoutPrepLevel
      : "ready";
  const debrisEstimateQuantity = checkoutServices.includes("debrisHaulAway")
    ? 1
    : 0;
  const serviceEstimate = estimateOrder({
    address: selectedAddress?.label ?? projectConfig?.address ?? "",
    deliveryAddress: selectedAddress,
    productId: selectedProductId,
    quantity: materialQuantity,
    family: projectConfig?.materialFamily ?? "mulch",
    services: checkoutServices,
    prepLevel: activePrepLevel,
    debrisQuantity: debrisEstimateQuantity,
  });
  const serviceTotal =
    serviceEstimate.installSubtotal +
    serviceEstimate.prepSubtotal +
    serviceEstimate.debrisSubtotal;
  const total = subtotal + (delivery?.fee ?? 0) + serviceTotal;
  const availableScheduleDates = scheduleDays.map((scheduleDay) => scheduleDay.date);
  const selectedServiceLabels = checkoutServices
    .map((key) => serviceOptions.find((option) => option.key === key)?.label)
    .filter(Boolean);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      if (deliveryAddress && deliveryAddress.id !== selectedAddress?.id) {
        setSelectedAddress(deliveryAddress);
      }

      if (!projectConfig) {
        return;
      }

      if (projectConfig.desiredDate && !date) {
        const nextDay =
          scheduleDays.find(
            (scheduleDay) => scheduleDay.date === projectConfig.desiredDate,
          ) ?? null;

        setDate(projectConfig.desiredDate);
        setDeliveryWindow(nextDay?.windows[0] ?? "");
      }

      if (checkoutServices.length === 0) {
        setCheckoutServices(
          projectConfig.services.filter((service) => service !== "delivery"),
        );
      }

      if (!checkoutPrepLevel && projectConfig.prepLevel !== "ready") {
        setCheckoutPrepLevel(projectConfig.prepLevel);
      }
    });
  }, [
    checkoutPrepLevel,
    checkoutServices.length,
    date,
    deliveryAddress,
    projectConfig,
    selectedAddress,
  ]);

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      if (new URLSearchParams(window.location.search).get("canceled")) {
        setError(
          "Stripe checkout was canceled. Review your order and try again when ready.",
        );
      }
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  function updateDate(nextDate: string) {
    const nextDay =
      scheduleDays.find((scheduleDay) => scheduleDay.date === nextDate) ?? null;

    setDate(nextDate);
    setDeliveryWindow(nextDay?.windows[0] ?? "");
  }

  function toggleCheckoutService(service: ServiceKey) {
    setCheckoutServices((current) => {
      const next = current.includes(service)
        ? current.filter((key) => key !== service)
        : [...current, service];

      if (service === "sitePrep" && current.includes(service)) {
        setCheckoutPrepLevel("");
      }

      return next;
    });
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
          Add mulch from the shop or build a guided configuration before checkout.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/shop">Shop mulch</Link>
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
                setDeliveryAddress(
                  isOaklandCountyAddress(address) ? address : null,
                );
              }}
            />
            {hasCountyBlockedAddress && (
              <p className="mt-2 text-sm font-bold text-red-700">
                {oaklandCountyDeliveryMessage}
              </p>
            )}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-emerald-950">
              Delivery date
              <DatePicker
                value={date}
                onChange={updateDate}
                availableDates={availableScheduleDates}
                minDate={localDateValue()}
                placeholder="Choose delivery date"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-emerald-950">
              Delivery window
              <Select
                value={deliveryWindow}
                onValueChange={setDeliveryWindow}
                disabled={!date}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose window" />
                </SelectTrigger>
                <SelectContent>
                  {(selectedDay?.windows ?? []).map((scheduleWindow) => (
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
              <Sparkles className="size-5" />
            </span>
            <div>
              <h2 className="text-2xl font-black text-emerald-950">
                Installation help
              </h2>
              <p className="mt-0.5 text-sm text-emerald-950/60">
                Add install, prep, or debris cleanup to this order.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {checkoutServiceOptions.map((option) => (
              <label
                key={option.key}
                className={`flex gap-3 rounded-3xl border p-4 text-sm transition hover:cursor-pointer ${
                  checkoutServices.includes(option.key)
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-emerald-900/10 bg-white/70"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checkoutServices.includes(option.key)}
                  onChange={() => toggleCheckoutService(option.key)}
                  className="mt-1 size-4 accent-emerald-600 hover:cursor-pointer"
                />
                <span>
                  <span className="block font-black text-emerald-950">
                    {option.label}
                  </span>
                  <span className="mt-1 block leading-6 text-emerald-950/62">
                    {option.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
          {checkoutServices.includes("sitePrep") && (
            <div className="mt-4 rounded-3xl border border-emerald-900/10 bg-white/70 p-4">
              <p className="font-black text-emerald-950">Site prep level</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {prepOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex gap-2 rounded-2xl border p-3 text-sm font-semibold transition hover:cursor-pointer ${
                      checkoutPrepLevel === option.value
                        ? "border-emerald-600 bg-emerald-50 text-emerald-950"
                        : "border-emerald-900/10 bg-white text-emerald-950/70"
                    }`}
                  >
                    <input
                      type="radio"
                      name="checkoutPrepLevel"
                      checked={checkoutPrepLevel === option.value}
                      onChange={() => setCheckoutPrepLevel(option.value)}
                      className="mt-0.5 size-4 accent-emerald-600 hover:cursor-pointer"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <CreditCard className="size-5" />
            </span>
            <div>
              <h2 className="text-2xl font-black text-emerald-950">Payment</h2>
              <p className="mt-0.5 text-sm text-emerald-950/60">
                Secure card payment with Stripe
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-emerald-950/62">
            After confirming the details below, you will be redirected to Stripe
            to pay for materials, delivery, and selected add-ons.
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
                {formatCurrency(getProductLineSubtotal(item.product, item.quantity))}
              </span>
            </div>
          ))}
          {checkoutServices.length > 0 && (
            <div className="rounded-3xl bg-lime-50 p-4">
              <Badge variant="secondary">Services</Badge>
              <p className="mt-2 text-sm leading-6 text-emerald-950/65">
                {selectedServiceLabels.join(", ")}
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
              {delivery?.zone
                ? formatCurrency(delivery.fee)
                : selectedAddress
                  ? "Outside zone"
                  : "Select address"}
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
          <span>{delivery?.zone ? formatCurrency(total) : "Pending"}</span>
        </div>
        {error && (
          <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            {error}
          </div>
        )}
        <Button
          type="button"
          size="lg"
          className="mt-5 w-full"
          disabled={submitting || hasCountyBlockedAddress}
          onClick={async () => {
            if (!selectedAddress) {
              setError("Select one of the suggested delivery addresses first.");
              return;
            }
            if (!isOaklandCountyAddress(selectedAddress)) {
              setError(oaklandCountyDeliveryMessage);
              return;
            }
            if (!delivery?.zone) {
              setError("This address is outside the current delivery mileage zones.");
              return;
            }
            if (!date) {
              setError("Choose a delivery date.");
              return;
            }
            if (!deliveryWindow) {
              setError("Choose a delivery window.");
              return;
            }
            if (checkoutServices.includes("sitePrep") && !checkoutPrepLevel) {
              setError("Choose a site prep level.");
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
                  address: selectedAddress,
                  deliveryDate: date,
                  deliveryWindow,
                  dropOffNotes,
                  items: items.map((item) => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                  })),
                  services: checkoutServices,
                  prepLevel: checkoutPrepLevel,
                }),
              });

              const body = await res.json().catch(() => ({}));

              if (!res.ok) {
                setError(body.error ?? "Failed to start checkout. Please try again.");
                return;
              }

              if (typeof body.url !== "string") {
                setError("Stripe did not return a checkout URL.");
                return;
              }

              window.location.assign(body.url);
            } catch {
              setError("Network error. Please check your connection and try again.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {submitting ? "Starting Stripe checkout..." : "Proceed to Stripe checkout"}
        </Button>
      </GlassCard>
    </div>
  );
}
