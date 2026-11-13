"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface LiveNumberProps {
  value: number;
  format?: (value: number) => string;
  durationMs?: number;
  className?: string;
  /** Show a colour cue when the value moves up or down. */
  signal?: boolean;
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Interpolates between numeric values instead of snapping. Static under reduced motion. */
export function LiveNumber({
  value,
  format = (n) => n.toLocaleString("id-ID"),
  durationMs = 600,
  className,
  signal = true,
}: LiveNumberProps) {
  const [display, setDisplay] = React.useState(value);
  const [direction, setDirection] = React.useState<"up" | "down" | "flat">("flat");
  const fromRef = React.useRef(value);
  const frameRef = React.useRef<number>();

  React.useEffect(() => {
    const from = fromRef.current;
    if (from === value) return;

    if (prefersReducedMotion() || durationMs <= 0) {
      fromRef.current = value;
      setDisplay(value);
      setDirection(value > from ? "up" : "down");
      return;
    }

    const start = performance.now();
    const delta = value - from;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      setDisplay(from + delta * easeOut(progress));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
      }
    };

    setDirection(delta > 0 ? "up" : "down");
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, durationMs]);

  React.useEffect(() => {
    if (direction === "flat") return;
    const timer = window.setTimeout(() => setDirection("flat"), 900);
    return () => window.clearTimeout(timer);
  }, [direction]);

  return (
    <span
      className={cn("xbm-livenumber", className)}
      data-direction={signal ? direction : "flat"}
      aria-live="polite"
    >
      {format(display)}
    </span>
  );
}
