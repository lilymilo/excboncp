"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedProps<T extends string> {
  options: ReadonlyArray<SegmentedOption<T>>;
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  tone?: "default" | "accent";
  className?: string;
}

/**
 * Tabs-style control with a spring-driven sliding thumb.
 * Uses transform translate3d for horizontal travel (no layout property transitions).
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  tone = "default",
  className,
}: SegmentedProps<T>) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = React.useState<{ x: number; width: number } | null>(null);

  const measure = React.useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const active = track.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!active) return;
    setThumb({ x: active.offsetLeft, width: active.offsetWidth });
  }, []);

  React.useLayoutEffect(() => {
    measure();
    const track = trackRef.current;
    if (!track || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [measure, value, options.length]);

  return (
    <div
      ref={trackRef}
      role="tablist"
      aria-label={ariaLabel}
      data-tone={tone}
      className={cn("xbm-segmented", className)}
    >
      {thumb ? (
        <span
          aria-hidden="true"
          className="xbm-segmented-thumb"
          style={{
            transform: `translate3d(${thumb.x}px, 0, 0)`,
            width: thumb.width,
          }}
        />
      ) : null}
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          disabled={option.disabled}
          className="xbm-segmented-item disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
