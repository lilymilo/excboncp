import React from "react";
import { cn } from "@/lib/utils";

export interface PulseDotProps {
  className?: string;
  pulsing?: boolean;
  label?: string;
}

/** Small status dot. The ring is decorative, so it is hidden from screen readers. */
export function PulseDot({ className, pulsing = true, label }: PulseDotProps) {
  return (
    <span
      className={cn("xbm-pulse-dot", className)}
      data-pulsing={pulsing ? "true" : "false"}
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
