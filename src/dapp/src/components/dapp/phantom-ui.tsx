"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function formatIdr(value: number) {
  return `Rp ${Math.round(value).toLocaleString("id-ID")}`;
}

export function formatIdrShort(value: number) {
  if (Math.abs(value) >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(2)} M`;
  if (Math.abs(value) >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(2)} jt`;
  if (Math.abs(value) >= 1_000) return `Rp ${(value / 1_000).toFixed(0)} rb`;
  return formatIdr(value);
}

export function formatNumber(value: number, digits = 0) {
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export function buttonClass(variant: ButtonVariant = "primary", className?: string) {
  const base =
    "inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg px-4 text-[13.5px] font-semibold tracking-[-0.01em] transition duration-150 active:scale-[0.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-xb-forest/60 disabled:cursor-not-allowed disabled:bg-xb-raised disabled:text-xb-dim disabled:active:scale-100";
  const tone = {
    primary:
      "bg-xb-forest text-xb-forest-ink hover:bg-[#54E39C] shadow-[0_10px_28px_-16px_rgba(61,214,140,0.9)]",
    secondary:
      "border border-xb-line bg-xb-raised text-xb-text hover:border-xb-forest/40 hover:bg-xb-soft",
    ghost: "text-xb-mute hover:bg-xb-raised hover:text-xb-text",
    danger: "bg-xb-blocked/12 text-xb-blocked hover:bg-xb-blocked/20",
  }[variant];
  return cx(base, tone, className);
}

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button type="button" {...props} className={buttonClass(variant, className)} />;
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cx(
        "rounded-xl border border-xb-line/80 bg-xb-surface",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Horizontal scroller with edge fades, so wide tables and card rows signal
 * overflow on small screens instead of looking abruptly cropped.
 */
export function ScrollArea({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const overflow = el.scrollWidth - el.clientWidth;
    if (overflow <= 1) {
      setEdges({ left: false, right: false });
      return;
    }
    setEdges({ left: el.scrollLeft > 1, right: el.scrollLeft < overflow - 1 });
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    Array.from(el.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [measure]);

  return (
    <div className="relative">
      <div
        ref={scroller}
        onScroll={measure}
        className={cx("xb-scroll overflow-x-auto", className)}
      >
        {children}
      </div>
      <span
        aria-hidden="true"
        className={cx(
          "xb-scroll-fade pointer-events-none absolute inset-y-0 right-0 w-10",
          edges.right ? "opacity-100" : "opacity-0"
        )}
      />
      <span
        aria-hidden="true"
        className={cx(
          "xb-scroll-fade pointer-events-none absolute inset-y-0 left-0 w-10 rotate-180",
          edges.left ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}

export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cx(
        "text-[10.5px] font-semibold uppercase tracking-[0.16em] text-xb-dim",
        className
      )}
    >
      {children}
    </p>
  );
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  label,
}: {
  items: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="xb-scroll flex items-center gap-0.5 overflow-x-auto border-b border-xb-line/70"
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cx(
              "relative flex min-h-[40px] shrink-0 items-center gap-1.5 px-3 text-[13px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-xb-forest/60",
              active ? "text-xb-text" : "text-xb-mute hover:text-xb-text"
            )}
          >
            {item.label}
            {typeof item.count === "number" && (
              <span
                className={cx(
                  "rounded px-1 py-px text-[10.5px] font-semibold xb-numeric",
                  active ? "bg-xb-forest/15 text-xb-forest" : "bg-xb-raised text-xb-dim"
                )}
              >
                {item.count}
              </span>
            )}
            <span
              aria-hidden="true"
              className={cx(
                "absolute inset-x-2 -bottom-px h-px transition-colors",
                active ? "bg-xb-forest" : "bg-transparent"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded border border-xb-line/70 bg-xb-raised px-1.5 py-0.5 text-[11px] font-medium text-xb-mute">
      {children}
    </span>
  );
}

const STATUS_TONE: Record<string, string> = {
  verified: "border-xb-verified/30 bg-xb-verified/10 text-xb-verified",
  verified_upper: "border-xb-verified/30 bg-xb-verified/10 text-xb-verified",
  warning: "border-xb-warning/30 bg-xb-warning/10 text-xb-warning",
  pending: "border-xb-pending/30 bg-xb-pending/10 text-xb-pending",
  blocked: "border-xb-blocked/30 bg-xb-blocked/10 text-xb-blocked",
  dispute: "border-xb-dispute/30 bg-xb-dispute/10 text-xb-dispute",
  completed: "border-xb-verified/30 bg-xb-verified/10 text-xb-verified",
};

export function StatusPill({
  status,
  label,
  className,
}: {
  status: string;
  label?: string;
  className?: string;
}) {
  const key = status.toLowerCase();
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.08em]",
        STATUS_TONE[key] ?? "border-xb-line bg-xb-raised text-xb-mute",
        className
      )}
    >
      <span className="h-1 w-1 rounded-full bg-current" aria-hidden="true" />
      {label ?? status}
    </span>
  );
}

export function TestnetBadge({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded border border-xb-tech/25 bg-xb-tech/8 px-2 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-xb-tech",
        className
      )}
    >
      <span className="h-1 w-1 rounded-full bg-xb-tech" aria-hidden="true" />
      Simulasi testnet
    </span>
  );
}

export function EmptyState({
  illustration,
  title,
  body,
}: {
  illustration?: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      {illustration && <div className="mb-4 h-16">{illustration}</div>}
      <p className="text-[14px] font-semibold text-xb-text">{title}</p>
      <p className="mt-1 max-w-[34ch] text-[12.5px] leading-relaxed text-xb-mute">{body}</p>
    </div>
  );
}

export function Disclosure({ className }: { className?: string }) {
  return (
    <p className={cx("flex items-start gap-2 text-[11.5px] leading-relaxed text-xb-dim", className)}>
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      Simulasi, testnet. Tanpa uang nyata dan bukan nasihat keuangan.
    </p>
  );
}

export function Metric({
  label,
  value,
  unit,
  sub,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
  sub?: React.ReactNode;
  tone?: "default" | "forest" | "warning" | "blocked" | "tech";
}) {
  const toneClass = {
    default: "text-xb-text",
    forest: "text-xb-forest",
    warning: "text-xb-warning",
    blocked: "text-xb-blocked",
    tech: "text-xb-tech",
  }[tone];

  return (
    <div className="min-w-0">
      <SectionLabel>{label}</SectionLabel>
      <p className={cx("mt-1.5 flex items-baseline gap-1 text-[21px] font-semibold leading-none xb-numeric", toneClass)}>
        {value}
        {unit && <span className="text-[11px] font-medium text-xb-dim">{unit}</span>}
      </p>
      {sub && <p className="mt-1.5 text-[11.5px] leading-snug text-xb-mute">{sub}</p>}
    </div>
  );
}
