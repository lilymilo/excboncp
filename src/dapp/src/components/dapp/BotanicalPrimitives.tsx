"use client";

import React, { useState } from "react";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  FlaskConical,
  HelpCircle,
  Lock,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import type { CanonicalStatus } from "@/lib/dashboard-helpers";
import type { ConsentStatus } from "@/context/DappContext";
import { APP_SIMULATION_PILL, CONSENT_DISPLAY, STATUS_DISPLAY } from "@/lib/copy";
import { HashSeal } from "@/components/dapp/HashSeal";
import { Mascot } from "@/components/mascot/Mascot";

export function BotanicalCard({
  children,
  className = "",
  interactive = false,
}: {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div className={`xb-card ${interactive ? "xb-card-interactive" : ""} ${className}`}>
      {children}
    </div>
  );
}

const CANONICAL_STATUS_STYLES: Record<
  CanonicalStatus,
  { cls: string; Icon: LucideIcon }
> = {
  VERIFIED: {
    cls: "bg-[var(--status-verified-bg)] text-[var(--status-verified-ink)]",
    Icon: CheckCircle2,
  },
  WARNING: {
    cls: "bg-[var(--status-warning-bg)] text-[var(--status-warning-ink)]",
    Icon: AlertTriangle,
  },
  DISPUTE: {
    cls: "bg-[var(--status-dispute-bg)] text-[var(--status-dispute-ink)]",
    Icon: ShieldAlert,
  },
  BLOCKED: {
    cls: "bg-[var(--status-blocked-bg)] text-[var(--status-blocked-ink)]",
    Icon: Lock,
  },
};

const CONSENT_STATUS_STYLES: Record<
  ConsentStatus,
  { cls: string; Icon: LucideIcon }
> = {
  granted: {
    cls: "bg-[var(--status-verified-bg)] text-[var(--status-verified-ink)]",
    Icon: CheckCircle2,
  },
  revoked: {
    cls: "bg-[var(--status-blocked-bg)] text-[var(--status-blocked-ink)]",
    Icon: Lock,
  },
  none: {
    cls: "bg-[var(--status-warning-bg)] text-[var(--status-warning-ink)]",
    Icon: AlertTriangle,
  },
};

export function SimulasiBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 py-1 text-[14px] font-semibold text-[var(--forest-800)] ${className}`}
    >
      <FlaskConical className="h-4 w-4 text-[var(--forest-700)]" aria-hidden="true" />
      <span>{APP_SIMULATION_PILL}</span>
    </span>
  );
}

export function CanonicalStatusBadge({
  status,
  compact = false,
}: {
  status: CanonicalStatus;
  compact?: boolean;
}) {
  const meta = STATUS_DISPLAY[status];
  const { cls, Icon } = CANONICAL_STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[14px] font-semibold ${cls}`}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden={true} />
      <span>{compact ? meta.shortLabel : meta.label}</span>
    </span>
  );
}

export function ConsentStatusBadge({
  status,
  compact = false,
}: {
  status: ConsentStatus;
  compact?: boolean;
}) {
  const copy = CONSENT_DISPLAY[status];
  const { cls, Icon } = CONSENT_STATUS_STYLES[status] ?? CONSENT_STATUS_STYLES.none;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${
        compact ? "px-2.5 py-0.5 text-[13px]" : "px-3 py-1 text-[14px]"
      } ${cls}`}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden={true} />
      <span>{copy.label}</span>
    </span>
  );
}

export function BotanicalPageHeader({
  title,
  description,
  showSimulation = false,
  actions,
}: {
  title: string;
  description: string;
  showSimulation?: boolean;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 max-w-[66ch]">
        <h1 className="xb-display text-[26px] font-bold leading-tight tracking-[-0.025em] text-[var(--ink)] sm:text-[30px]">
          {title}
        </h1>
        <p className="mt-1.5 text-[16px] leading-relaxed text-[var(--ink-muted)]">{description}</p>
      </div>
      {(showSimulation || actions) && (
        <div className="flex flex-wrap items-center gap-2.5">
          {showSimulation && <SimulasiBadge />}
          {actions}
        </div>
      )}
    </header>
  );
}

export function RoleRestrictedNotice({
  title = "Belum bisa dibuka",
  reason,
}: {
  title?: string;
  reason: string;
}) {
  return (
    <BotanicalCard className="mx-auto max-w-2xl p-6 sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[var(--seal-100)] text-[var(--seal-600)]">
          <Lock className="h-7 w-7" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="xb-display text-[22px] font-bold text-[var(--ink)]">{title}</h2>
          <p className="mt-2 text-[16px] leading-relaxed text-[var(--ink-muted)]">{reason}</p>
          <p className="mt-2 text-[15px] text-[var(--ink-muted)]">
            Gunakan menu peran demo pada avatar kanan atas jika Anda sedang menguji alur peran tertentu,
            atau kembali ke halaman yang tersedia.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/app"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--forest-700)] px-5 text-[15px] font-semibold text-white hover:bg-[var(--forest-800)]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Kembali ke Dasbor</span>
            </Link>
            <Link
              href="/bantuan"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 text-[15px] font-semibold text-[var(--ink)] hover:bg-[var(--surface-soft)]"
            >
              <HelpCircle className="h-4 w-4 text-[var(--forest-700)]" aria-hidden="true" />
              <span>Bantuan</span>
            </Link>
            <Link
              href="/akun"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-5 text-[15px] font-semibold text-[var(--ink)] hover:bg-[var(--leaf-100)]"
            >
              <span>Keluar / Ganti Akun</span>
            </Link>
          </div>
        </div>
      </div>
    </BotanicalCard>
  );
}

export function PageStatePanel({
  state,
  onRetry,
  emptyTitle = "Belum ada data tersedia",
  emptyDescription,
  emptyActionHref,
  emptyActionLabel,
  allowMascot = false,
  errorTitle = "Data gagal dimuat sementara",
  errorDescription = "Sambungan ke layanan data belum merespons. Anda bisa mencoba muat ulang atau membuka halaman Bantuan.",
  children,
}: {
  state: "loading" | "empty" | "error" | "ready";
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionHref?: string;
  emptyActionLabel?: string;
  allowMascot?: boolean;
  errorTitle?: string;
  errorDescription?: string;
  children: React.ReactNode;
}) {
  if (state === "loading") {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Memuat konten">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["w-32", "w-28", "w-36", "w-28"].map((widthClass, idx) => (
            <div key={idx} className="xb-card p-5">
              <div className="xb-skeleton h-4 w-24" />
              <div className={`xb-skeleton mt-3 h-9 ${widthClass}`} />
            </div>
          ))}
        </div>
        <div className="xb-card p-6">
          <div className="xb-skeleton h-5 w-48" />
          <div className="xb-skeleton mt-4 h-56 w-full" />
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <BotanicalCard className="p-6 sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="xb-display text-[20px] font-bold text-[var(--status-blocked-ink)]">
              {errorTitle}
            </p>
            <p className="mt-1.5 max-w-[60ch] text-[16px] text-[var(--ink)]">{errorDescription}</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--forest-700)] px-5 text-[15px] font-semibold text-white hover:bg-[var(--forest-800)]"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                <span>Coba lagi</span>
              </button>
            )}
            <Link
              href="/app"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-[15px] font-semibold text-[var(--ink)] hover:bg-[var(--surface-soft)]"
            >
              <span>Kembali</span>
            </Link>
            <Link
              href="/bantuan"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 text-[15px] font-semibold text-[var(--ink)] hover:bg-[var(--leaf-100)]"
            >
              <span>Bantuan</span>
            </Link>
          </div>
        </div>
      </BotanicalCard>
    );
  }

  if (state === "empty") {
    return (
      <BotanicalCard className="p-6 sm:p-8">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          {allowMascot && <Mascot pose="mengintip" size={112} alt="" />}
          <div className="min-w-0 flex-1">
            <h2 className="xb-display text-[20px] font-bold text-[var(--ink)]">{emptyTitle}</h2>
            {emptyDescription && (
              <p className="mt-1.5 text-[16px] text-[var(--ink-muted)]">{emptyDescription}</p>
            )}
            {emptyActionHref && emptyActionLabel && (
              <div className="mt-4">
                <Link
                  href={emptyActionHref}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--forest-700)] px-5 text-[15px] font-semibold text-white hover:bg-[var(--forest-800)]"
                >
                  <span>{emptyActionLabel}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </BotanicalCard>
    );
  }

  return <>{children}</>;
}

export function BotanicalReceiptCard({
  title,
  receiptId,
  hash,
  timestampWib,
  details,
  verifyHref,
}: {
  title: string;
  receiptId: string;
  hash: string;
  timestampWib: string;
  details: string;
  verifyHref?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--seal-line)] bg-[var(--seal-100)]/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <HashSeal hash={hash} size={58} />
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[16px] font-bold text-[var(--ink)]">
              <ShieldCheck className="h-5 w-5 text-[var(--seal-600)]" aria-hidden="true" />
              <span>{title}</span>
            </p>
            <p className="mt-0.5 text-[15px] text-[var(--ink)]">{details}</p>
            <p className="xb-mono mt-1 text-[13.5px] text-[var(--seal-600)]">
              Resi: {receiptId} · {timestampWib}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--seal-line)] bg-[var(--surface)] px-4 text-[14px] font-semibold text-[var(--seal-600)] hover:bg-[var(--seal-100)]"
          >
            {copied ? (
              <Check className="h-4 w-4 text-[var(--status-verified-ink)]" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{copied ? "Hash tersalin" : "Salin hash"}</span>
          </button>
          {verifyHref && (
            <Link
              href={verifyHref}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--seal-600)] px-4 text-[14px] font-semibold text-white hover:bg-[var(--seal-700)]"
            >
              <span>Periksa segel</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function BotanicalDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="xb-botanical fixed inset-0 z-50 bg-[var(--overlay-scrim)]" />
        <DialogPrimitive.Content
          aria-label={title}
          className="xb-botanical fixed inset-y-0 right-0 z-50 flex w-full max-w-[460px] flex-col border-l border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl focus:outline-none"
        >
          <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] pb-4">
            <div className="min-w-0">
              <DialogPrimitive.Title className="xb-display text-[20px] font-bold text-[var(--ink)]">
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="mt-1 text-[14.5px] text-[var(--ink-muted)]">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close
              aria-label="Tutup panel"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] text-[var(--ink)] hover:bg-[var(--leaf-100)]"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>
          <div className="mt-4 flex-1 overflow-y-auto pr-1">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

