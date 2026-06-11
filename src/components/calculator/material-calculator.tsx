"use client";

import { useMemo, useState } from "react";
import { Calculator, CheckCircle2, Ruler } from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function roundToTenth(value: number) {
  return Math.ceil(value * 10) / 10;
}

export function MaterialCalculator() {
  const [length, setLength] = useState("20");
  const [width, setWidth] = useState("10");
  const [depthInches, setDepthInches] = useState("3");
  const [customDepthInches, setCustomDepthInches] = useState("3");
  const [depthMode, setDepthMode] = useState("mulch");

  const result = useMemo(() => {
    const parsedLength = Number(length) || 0;
    const parsedWidth = Number(width) || 0;
    const depthFeet =
      depthMode === "mulch"
        ? (Number(depthInches) || 0) / 12
        : (Number(customDepthInches) || 0) / 12;
    const cubicYards = (parsedLength * parsedWidth * depthFeet) / 27;

    return {
      cubicYards,
      rounded: Math.ceil(cubicYards),
      display: roundToTenth(cubicYards),
    };
  }, [customDepthInches, depthInches, depthMode, length, width]);

  return (
    <GlassCard className="p-5 sm:p-6">
      <div className="mb-6 flex items-start gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <Calculator className="size-6" />
        </span>
        <div>
          <h2 className="text-2xl font-black text-emerald-950">
            Material calculator
          </h2>
          <p className="mt-1 text-sm leading-6 text-emerald-950/62">
            Estimate cubic yards using length x width x depth in feet / 27.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-emerald-950">
          Length in feet
          <Input
            type="number"
            min="0"
            value={length}
            onChange={(event) => setLength(event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-emerald-950">
          Width in feet
          <Input
            type="number"
            min="0"
            value={width}
            onChange={(event) => setWidth(event.target.value)}
          />
        </label>
      </div>

      <Tabs value={depthMode} onValueChange={setDepthMode} className="mt-5">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mulch" className="w-full">
            Mulch depth
          </TabsTrigger>
          <TabsTrigger value="custom" className="w-full">
            Custom depth
          </TabsTrigger>
        </TabsList>
        <TabsContent value="mulch">
          <label className="grid gap-2 text-sm font-bold text-emerald-950">
            Common mulch depth
            <Select value={depthInches} onValueChange={setDepthInches}>
              <SelectTrigger>
                <SelectValue placeholder="Choose depth" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 inches</SelectItem>
                <SelectItem value="3">3 inches</SelectItem>
                <SelectItem value="4">4 inches</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </TabsContent>
        <TabsContent value="custom">
          <label className="grid gap-2 text-sm font-bold text-emerald-950">
            Depth in inches
            <Input
              type="number"
              min="0"
              step="0.5"
              value={customDepthInches}
              onChange={(event) => setCustomDepthInches(event.target.value)}
            />
          </label>
        </TabsContent>
      </Tabs>

      <div className="mt-6 grid gap-4 rounded-[1.5rem] bg-emerald-950 p-5 text-white sm:grid-cols-2">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-emerald-200">
            <Ruler className="size-4" />
            Estimated cubic yards needed
          </p>
          <p className="mt-2 text-4xl font-black">{result.display}</p>
        </div>
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-emerald-200">
            <CheckCircle2 className="size-4" />
            Suggested quantity rounded up
          </p>
          <p className="mt-2 text-4xl font-black">{result.rounded} yd</p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-[1.5rem] bg-lime-50 p-4 text-sm leading-6 text-emerald-950/70 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Mulch orders are capped at 5 cubic yards online. Debris cleanup can
          be added in the guided order flow.
        </p>
        <Button asChild variant="secondary">
          <a href="/shop">Shop mulch</a>
        </Button>
      </div>
    </GlassCard>
  );
}
