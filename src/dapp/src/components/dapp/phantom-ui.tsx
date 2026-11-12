"use client";

import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Check, X } from "lucide-react";
import type { VerificationStatus } from "@/context/DappContext";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function formatIdr(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatIdrShort(amount: number): string {
  if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(2)} M`;
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)} jt`;
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)} rb`;
  return formatIdr(amount);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

export const STATUS_LABEL_ID: Record<VerificationStatus, string> = {
  verified: "Terverifikasi",
  warning: "Peringatan",
  pending: "Menunggu",
  blocked: "Diblokir",
  dispute: "Sengketa",
};

type ButtonVariant = "lavender" | "forest" | "primary" | "secondary" | "ghost" | "danger";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  lavender: "bg-[#AA9AF5] text-[#090B0A] border border-transparent hover:bg-[#B8AAFA] font-semibold",
  forest: "bg-[#23865A] text-[#F4F5F2] border border-transparent hover:bg-[#2A9967] font-semibold",
  primary: "bg-[#72C99A] text-[#090B0A] border border-transparent hover:bg-[#84D4A8] font-semibold",
  secondary: "bg-[#1D211E] text-[#F4F5F2] border border-[#39423C] hover:bg-[#242925] font-medium",
  ghost: "bg-transparent text-[#A6ADA7] border border-transparent hover:bg-[#1D211E] hover:text-[#F4F5F2] font-medium",
  danger: "bg-[#ED7770]/15 text-[#ED7770] border border-[#ED7770]/45 hover:bg-[#ED7770]/25 font-semibold",
};

export function buttonClass(variant: ButtonVariant = "secondary", className?: string) {
  return cx(
    "inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-[13.5px] leading-none disabled:cursor-not-allowed disabled:opacity-45",
    BUTTON_VARIANTS[variant],
    className
  );
}

export function Button({
  children,
  variant = "secondary",
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
}) {
  return (
    <button type="button" className={buttonClass(variant, className)} {...rest}>
      {children}
    </button>
  );
}

export function Card({
  children,
  className = "",
  raised = false,
}: {
  children: React.ReactNode;
  className?: string;
  raised?: boolean;
}) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-[#252B27]",
        raised ? "bg-[#1D211E]" : "bg-[#151816]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function ScrollArea({
  children,
  className = "",
  orientation = "vertical",
}: {
  children: React.ReactNode;
  className?: string;
  orientation?: "vertical" | "horizontal";
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [fade, setFade] = React.useState({ left: false, right: false });

  React.useEffect(() => {
    if (orientation !== "horizontal") return;
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      setFade({
        left: el.scrollLeft > 1,
        right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
      });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [orientation]);

  if (orientation === "horizontal") {
    return (
      <div className="relative">
        <div
          ref={scrollRef}
          className={cx("xb-scroll overflow-x-auto", className)}
        >
          {children}
        </div>
        <span
          aria-hidden="true"
          className={cx(
            "xb-scroll-fade pointer-events-none absolute inset-y-0 left-0 w-6",
            fade.left ? "opacity-100" : "opacity-0"
          )}
          style={{ transform: "scaleX(-1)" }}
        />
        <span
          aria-hidden="true"
          className={cx(
            "xb-scroll-fade pointer-events-none absolute inset-y-0 right-0 w-6",
            fade.right ? "opacity-100" : "opacity-0"
          )}
        />
      </div>
    );
  }

  return <div className={cx("xb-scroll overflow-y-auto", className)}>{children}</div>;
}

export function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cx("text-[12px] font-medium text-[#A6ADA7]", className)}>
      {children}
    </p>
  );
}

/** Accessible horizontal tab switcher built on @radix-ui/react-tabs with zero animation. */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  label,
  variant = "underline",
}: {
  items: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  variant?: "underline" | "phantom";
}) {
  return (
    <TabsPrimitive.Root
      value={value}
      onValueChange={(v) => onChange(v as T)}
      className="min-w-0"
    >
      <TabsPrimitive.List
        aria-label={label}
        className={cx(
          "xb-scroll flex items-center gap-2 overflow-x-auto",
          variant === "underline"
            ? "border-b border-[#252B27] px-1"
            : "pb-1"
        )}
      >
        {items.map((item) => {
          const active = item.id === value;
          return (
            <TabsPrimitive.Trigger
              key={item.id}
              value={item.id}
              className={cx(
                "relative inline-flex min-h-[44px] shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap px-3 text-[14px]",
                variant === "phantom"
                  ? active
                    ? "font-semibold text-[#F4F5F2]"
                    : "font-medium text-[#8B948D] hover:text-[#F4F5F2]"
                  : active
                    ? "font-semibold text-[#F4F5F2]"
                    : "font-medium text-[#8B948D] hover:text-[#F4F5F2]"
              )}
            >
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span className="text-[12px] font-normal text-[#8B948D] xb-numeric">
                  ({item.count})
                </span>
              )}
              {active && variant === "underline" && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-[#AA9AF5]"
                />
              )}
            </TabsPrimitive.Trigger>
          );
        })}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  );
}

export function Chip({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-lg border border-[#2E3530] bg-[#1D211E] px-2.5 py-1 text-[11.5px] font-medium text-[#A6ADA7]",
        className
      )}
    >
      {children}
    </span>
  );
}

const STATUS_PILL_STYLE: Record<VerificationStatus, string> = {
  verified: "border-[#72C99A]/35 bg-[#23865A]/20 text-[#72C99A]",
  warning: "border-[#F2B84B]/40 bg-[#F2B84B]/12 text-[#F2B84B]",
  pending: "border-[#AA9AF5]/40 bg-[#AA9AF5]/14 text-[#AA9AF5]",
  blocked: "border-[#ED7770]/45 bg-[#ED7770]/14 text-[#ED7770]",
  dispute: "border-[#F2B84B]/45 bg-[#F2B84B]/14 text-[#F2B84B]",
};

export function StatusPill({
  status,
  label,
}: {
  status: VerificationStatus;
  label?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center whitespace-nowrap rounded-lg border px-2.5 py-0.5 text-[11.5px] font-semibold",
        STATUS_PILL_STYLE[status]
      )}
    >
      {label ?? STATUS_LABEL_ID[status]}
    </span>
  );
}

export function TestnetBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border border-[#39423C] bg-[#1D211E] px-3 py-1 text-[11.5px] font-medium text-[#AA9AF5]",
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[#72C99A]" aria-hidden="true" />
      Base Sepolia Testnet
    </span>
  );
}

export function EmptyState({
  title,
  body,
  illustration,
  action,
}: {
  title: string;
  body: string;
  illustration?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {illustration && <div className="mb-3">{illustration}</div>}
      <p className="text-[15px] font-semibold text-[#F4F5F2]">{title}</p>
      <p className="mt-1.5 max-w-[38ch] text-[13px] leading-relaxed text-[#A6ADA7]">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Disclosure({ className = "" }: { className?: string }) {
  return (
    <p className={cx("text-[12px] leading-relaxed text-[#8B948D]", className)}>
      Simulasi testnet Base Sepolia. Data parcel, telemetri IoT, settlement 2% / 60% / 40%, dan
      attestation berjalan dalam mode demo tanpa transaksi uang nyata.
    </p>
  );
}

export function Metric({
  label,
  value,
  unit,
  tone = "default",
  sub,
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
  tone?: "default" | "forest" | "green" | "warning" | "blocked" | "tech" | "lavender";
  sub?: string;
}) {
  const toneClass = {
    default: "text-[#F4F5F2]",
    forest: "text-[#72C99A]",
    green: "text-[#72C99A]",
    warning: "text-[#F2B84B]",
    blocked: "text-[#ED7770]",
    tech: "text-[#AA9AF5]",
    lavender: "text-[#AA9AF5]",
  }[tone];

  return (
    <div>
      <p className="text-[12px] font-medium text-[#A6ADA7]">{label}</p>
      <p
        className={cx(
          "mt-1.5 text-[22px] font-semibold leading-none tracking-[-0.02em] xb-numeric",
          toneClass
        )}
      >
        {value}
        {unit && <span className="ml-1.5 text-[12px] font-medium text-[#8B948D]">{unit}</span>}
      </p>
      {sub && <p className="mt-1.5 text-[12px] leading-snug text-[#8B948D]">{sub}</p>}
    </div>
  );
}

/** Accessible Left Navigation Sheet built on Radix Dialog, scoped under .xb-dashboard with zero animations. */
export function NavDrawerSheet({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <div className="xb-dashboard">
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/75" />
          <DialogPrimitive.Content
            aria-label={title}
            className="fixed inset-y-0 left-0 z-50 flex w-[296px] max-w-[86vw] flex-col border-r border-[#252B27] bg-[#151816] text-[#F4F5F2] shadow-2xl focus:outline-none"
          >
            <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
            {children}
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** Static Radix Modal Dialog for inspecting records/hashes without navigating away. */
export function DetailModal({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <div className="xb-dashboard">
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80" />
          <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,540px)] max-h-[85vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[#39423C] bg-[#151816] p-5 text-[#F4F5F2] shadow-2xl focus:outline-none xb-scroll">
            <div className="flex items-start justify-between gap-3 border-b border-[#252B27] pb-3.5">
              <div className="min-w-0">
                <DialogPrimitive.Title className="text-[16px] font-semibold text-[#F4F5F2]">
                  {title}
                </DialogPrimitive.Title>
                {description && (
                  <DialogPrimitive.Description className="mt-1 text-[12.5px] text-[#A6ADA7]">
                    {description}
                  </DialogPrimitive.Description>
                )}
              </div>
              <DialogPrimitive.Close
                aria-label="Tutup jendela"
                className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-[#39423C] bg-[#1D211E] text-[#A6ADA7] hover:bg-[#242925] hover:text-[#F4F5F2]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </DialogPrimitive.Close>
            </div>
            <div className="mt-4">{children}</div>
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** DropdownMenu primitives ported for dashboard use under .xb-dashboard with zero animations. */
export const AccountDropdown = {
  Root: DropdownMenuPrimitive.Root,
  Trigger: DropdownMenuPrimitive.Trigger,
  Content: ({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <DropdownMenuPrimitive.Portal>
      <div className="xb-dashboard">
        <DropdownMenuPrimitive.Content
          align="end"
          sideOffset={8}
          className={cx(
            "z-50 w-[264px] rounded-2xl border border-[#39423C] bg-[#151816] p-2 text-[#F4F5F2] shadow-2xl",
            className
          )}
        >
          {children}
        </DropdownMenuPrimitive.Content>
      </div>
    </DropdownMenuPrimitive.Portal>
  ),
  Label: ({ children }: { children: React.ReactNode }) => (
    <DropdownMenuPrimitive.Label className="px-2.5 pb-1 pt-2 text-[11.5px] font-medium text-[#8B948D]">
      {children}
    </DropdownMenuPrimitive.Label>
  ),
  RadioItem: ({
    selected,
    label,
    tag,
    onSelect,
  }: {
    selected: boolean;
    label: string;
    tag: string;
    onSelect: () => void;
  }) => (
    <DropdownMenuPrimitive.Item
      onSelect={onSelect}
      className={cx(
        "flex min-h-[44px] w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-2.5 text-[13px] outline-none",
        selected
          ? "bg-[#AA9AF5]/16 font-semibold text-[#F4F5F2]"
          : "text-[#A6ADA7] hover:bg-[#1D211E] hover:text-[#F4F5F2]"
      )}
    >
      <span className="min-w-0 truncate">
        {label}{" "}
        <span className="ml-1 text-[11.5px] font-normal text-[#8B948D]">({tag})</span>
      </span>
      {selected && <Check className="h-4 w-4 shrink-0 text-[#AA9AF5]" aria-hidden="true" />}
    </DropdownMenuPrimitive.Item>
  ),
  LinkItem: ({
    children,
    onSelect,
  }: {
    children: React.ReactNode;
    onSelect: () => void;
  }) => (
    <DropdownMenuPrimitive.Item
      onSelect={onSelect}
      className="flex min-h-[44px] cursor-pointer items-center justify-between rounded-xl px-2.5 text-[13px] text-[#A6ADA7] outline-none hover:bg-[#1D211E] hover:text-[#F4F5F2]"
    >
      {children}
    </DropdownMenuPrimitive.Item>
  ),
  Separator: () => <DropdownMenuPrimitive.Separator className="my-1.5 h-px bg-[#252B27]" />,
};

/** Recharts dark Obsidian tooltip surface (follows shadcn ChartTooltip semantics). */
export function XbChartTooltip({
  active,
  payload,
  label,
  unit = "",
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string }>;
  label?: string;
  unit?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-[#39423C] bg-[#151816] px-3 py-2 text-[12px] text-[#F4F5F2] shadow-xl">
      {label && <p className="mb-1 font-medium text-[#A6ADA7]">{label}</p>}
      <div className="space-y-1">
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-[#A6ADA7]">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color ?? "#72C99A" }}
              />
              {entry.name}
            </span>
            <span className="font-semibold text-[#F4F5F2] xb-numeric">
              {typeof entry.value === "number" ? formatNumber(entry.value) : entry.value}
              {unit ? ` ${unit}` : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Accessible Info Tooltip for concise term help (FPIC, EAS, tCO2e). */
export function HelpTip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={0}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <div className="xb-dashboard">
            <TooltipPrimitive.Content
              sideOffset={6}
              className="z-50 max-w-[260px] rounded-xl border border-[#39423C] bg-[#1D211E] px-3 py-2 text-[12px] leading-snug text-[#F4F5F2] shadow-xl"
            >
              {label}
            </TooltipPrimitive.Content>
          </div>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
