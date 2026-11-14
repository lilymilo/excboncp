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
  /** Count up from 0 when first entering the viewport. */
  countUpOnView?: boolean;
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Interpolates numeric values and counts up on first viewport entry.
 * Static under prefers-reduced-motion; capped at 420ms (--dur-slow) by default.
 */
export function LiveNumber({
  value,
  format = (n) => Math.round(n).toLocaleString("id-ID"),
  durationMs = 420,
  className,
  signal = true,
  countUpOnView = true,
}: LiveNumberProps) {
  const spanRef = React.useRef<HTMLSpanElement>(null);
  const [inView, setInView] = React.useState(!countUpOnView);
  const [display, setDisplay] = React.useState(value);
  const [direction, setDirection] = React.useState<"up" | "down" | "flat">("flat");
  const fromRef = React.useRef(countUpOnView ? 0 : value);
  const hasCountedInRef = React.useRef(!countUpOnView);
  const frameRef = React.useRef<number>();

  React.useEffect(() => {
    if (!countUpOnView) return;
    const node = spanRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [countUpOnView]);

  React.useEffect(() => {
    if (!inView) return;

    const isFirstView = !hasCountedInRef.current;
    const from = isFirstView ? 0 : fromRef.current;
    hasCountedInRef.current = true;

    if (from === value) {
      setDisplay(value);
      return;
    }

    const cappedDuration = Math.min(durationMs, 420);

    if (prefersReducedMotion() || cappedDuration <= 0) {
      fromRef.current = value;
      setDisplay(value);
      if (!isFirstView) {
        setDirection(value > from ? "up" : "down");
      }
      return;
    }

    const start = performance.now();
    const delta = value - from;

    const tick = (now: number) => {
      const progress = Math.min(1, Math.max(0, (now - start) / cappedDuration));
      setDisplay(from + delta * easeOut(progress));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
        setDisplay(value);
      }
    };

    if (!isFirstView) {
      setDirection(delta > 0 ? "up" : "down");
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, durationMs, inView]);

  React.useEffect(() => {
    if (direction === "flat") return;
    const timer = window.setTimeout(() => setDirection("flat"), 420);
    return () => window.clearTimeout(timer);
  }, [direction]);

  return (
    <span
      ref={spanRef}
      className={cn("xbm-livenumber", className)}
      data-direction={signal ? direction : "flat"}
      aria-live="polite"
    >
      {format(display)}
    </span>
  );
}
