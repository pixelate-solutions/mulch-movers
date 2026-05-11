"use client";

import { useState } from "react";
import { Mail, Phone, Send } from "lucide-react";

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

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <GlassCard className="p-6">
        <h2 className="text-2xl font-black text-emerald-950">Need help ordering?</h2>
        <p className="mt-3 text-sm leading-6 text-emerald-950/65">
          Reach out if you need help choosing material, estimating quantity, or
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
              <p className="font-black text-emerald-950">orders@mulchmovers.com</p>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-emerald-950">
              Name
              <Input required placeholder="Your name" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-emerald-950">
              Email
              <Input required type="email" placeholder="you@example.com" />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-emerald-950">
              Phone
              <Input type="tel" placeholder="(248) 555-0123" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-emerald-950">
              Material needed
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mulch">Mulch</SelectItem>
                  <SelectItem value="gravel">Gravel</SelectItem>
                  <SelectItem value="sand">Sand</SelectItem>
                  <SelectItem value="soil">Soil</SelectItem>
                  <SelectItem value="other">Other material</SelectItem>
                </SelectContent>
              </Select>
            </label>
          </div>
          <label className="grid gap-2 text-sm font-bold text-emerald-950">
            Delivery address
            <Input placeholder="Street, city, ZIP" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-emerald-950">
            Message
            <Textarea placeholder="Tell us about timing, placement, material, and quantity." />
          </label>
          {submitted && (
            <div className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-800">
              Thanks. Your request has been captured in this prototype.
            </div>
          )}
          <Button type="submit" size="lg" className="mx-auto w-full sm:w-fit">
            <Send />
            Send request
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}
