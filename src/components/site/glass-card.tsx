import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function GlassCard({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-white/65 bg-white/68 shadow-2xl shadow-emerald-950/10 backdrop-blur-2xl",
        className,
      )}
      {...props}
    />
  );
}
