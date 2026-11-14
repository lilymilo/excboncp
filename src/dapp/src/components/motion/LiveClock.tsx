"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { formatWibDateTime } from "@/lib/dashboard-helpers";

export interface LiveClockProps {
  className?: string;
  /** Display the full date plus time (default: time only). */
  withDate?: boolean;
  /** Tick interval in ms (default 1s). */
  intervalMs?: number;
  label?: string;
}

/**
 * Self-ticking WIB wall clock. Owns its own timer so the shell, page
 * headers, and panels all read the same instant without prop drilling.
 */
export function LiveClock({
  className,
  withDate = false,
  intervalMs = 1000,
  label,
}: LiveClockProps) {
  // Render placeholder sampai mount supaya jam server dan klien tidak bentrok saat hidrasi.
  const [stamp, setStamp] = useState<string>("--:--:-- WIB");

  useEffect(() => {
    const tick = () => {
      const iso = new Date().toISOString();
      setStamp(withDate ? formatWibDateTime(iso) : formatWibTimeNow());
    };
    tick();
    const timer = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(timer);
  }, [withDate, intervalMs]);

  return (
    <span
      className={cn("xbm-clock", className)}
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {stamp}
    </span>
  );
}

function formatWibTimeNow(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
  const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
  const ss = parts.find((p) => p.type === "second")?.value ?? "00";
  return `${hh}:${mm}:${ss} WIB`;
}