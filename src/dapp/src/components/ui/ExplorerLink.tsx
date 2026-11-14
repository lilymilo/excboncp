import React from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExplorerLinkProps {
  href: string | null;
  label?: string;
  compact?: boolean;
  className?: string;
}

export function ExplorerLink({
  href,
  label = "Explorer",
  compact = false,
  className,
}: ExplorerLinkProps) {
  if (!href) return null;

  if (compact) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title="Buka di blockchain explorer (Base Sepolia testnet)"
        aria-label={label}
        className={cn(
          "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--seal-line)] bg-[var(--seal-100)] text-[var(--seal-700)] transition hover:border-[var(--seal-600)] hover:bg-[var(--seal-100)]/70",
          className
        )}
      >
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title="Buka di blockchain explorer (Base Sepolia testnet)"
      className={cn(
        "inline-flex min-h-[32px] items-center gap-1.5 text-[12.5px] font-semibold text-[var(--seal-700)] transition hover:text-[var(--seal-600)] hover:underline",
        className
      )}
    >
      <span>{label}</span>
      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
    </a>
  );
}
