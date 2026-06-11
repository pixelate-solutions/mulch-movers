"use client";

import { type FormEvent, useState } from "react";
import { CheckCircle2, Mail, Phone, Send } from "lucide-react";

import { AddressAutocomplete } from "@/components/shop/address-autocomplete";
import { GlassCard } from "@/components/site/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatPhoneInput, isValidUsPhone, phonePattern } from "@/lib/phone";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const materialOptions = [
  { label: "Mulch", value: "mulch" },
];

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [material, setMaterial] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [addressInputKey, setAddressInputKey] = useState(0);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Enter your name.");
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
    setSubmitted(false);
    setSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone,
          material,
          deliveryAddress,
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(body.error ?? "Failed to send request. Please try again.");
        return;
      }

      setSubmitted(true);
      setName("");
      setEmail("");
      setPhone("");
      setMaterial("");
      setDeliveryAddress("");
      setAddressInputKey((currentKey) => currentKey + 1);
      setMessage("");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <GlassCard className="p-6">
        <h2 className="text-2xl font-black text-emerald-950">Need help ordering?</h2>
        <p className="mt-3 text-sm leading-6 text-emerald-950/65">
          Reach out if you need help choosing mulch, estimating quantity, or
          placing an order. We can help match the project to local supplier
          availability and delivery timing.
        </p>
        <div className="mt-8 grid gap-4">
          <div className="flex items-center gap-3 rounded-3xl bg-emerald-50 p-4">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <Phone className="size-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-emerald-700">Phone</p>
              <p className="font-black text-emerald-950">(248) 555-0123</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-3xl bg-lime-50 p-4">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-lime-600 text-white">
              <Mail className="size-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-lime-700">Email</p>
              <a
                href="mailto:info@movingmulch.com"
                className="font-black text-emerald-950 transition hover:cursor-pointer hover:text-emerald-700"
              >
                info@movingmulch.com
              </a>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-emerald-950">
              Name
              <Input
                required
                name="name"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-emerald-950">
              Email
              <Input
                required
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                maxLength={254}
                pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value.replace(/\s/g, "").toLowerCase())
                }
                placeholder="you@example.com"
                title="Enter a valid email address."
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-emerald-950">
              Phone
              <Input
                required
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={14}
                pattern={phonePattern}
                value={phone}
                onChange={(event) => setPhone(formatPhoneInput(event.target.value))}
                placeholder="(248) 555-0123"
                title="Enter a valid 10-digit U.S. phone number."
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-emerald-950">
              Mulch needed
              <Select value={material} onValueChange={setMaterial}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose mulch" />
                </SelectTrigger>
                <SelectContent>
                  {materialOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          </div>
          <label className="grid gap-2 text-sm font-bold text-emerald-950">
            Delivery address
            <AddressAutocomplete
              key={addressInputKey}
              onInputChange={() => setDeliveryAddress("")}
              onSelect={(address) => setDeliveryAddress(address.label)}
            />
            <input type="hidden" name="deliveryAddress" value={deliveryAddress} />
          </label>
          <label className="grid gap-2 text-sm font-bold text-emerald-950">
            Message
            <Textarea
              name="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Tell us about timing, placement, material, and quantity."
            />
          </label>
          {error && (
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              {error}
            </div>
          )}
          {submitted && (
            <div className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-800">
              <CheckCircle2 className="mr-2 inline size-4" />
              Thanks. Your request has been sent.
            </div>
          )}
          <Button
            type="submit"
            size="lg"
            className="mx-auto w-full sm:w-fit"
            disabled={submitting}
          >
            <Send />
            {submitting ? "Sending..." : "Send request"}
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}
