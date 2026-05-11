import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-32 w-full rounded-2xl border border-emerald-900/10 bg-white/80 px-4 py-3 text-base text-emerald-950 shadow-inner shadow-emerald-950/5 outline-none transition-all placeholder:text-emerald-950/35 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
