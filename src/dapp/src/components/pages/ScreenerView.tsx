"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDownUp,
  ArrowLeft,
  Layers,
  Lock,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { ParcelInspectionPanel } from "@/components/dapp/ParcelInspectionPanel";
import {
  MarketSparkline,
  MarketTrendAreaChart,
} from "@/components/charts/ChartPrimitives";
import {
  BotanicalDrawer,
  CanonicalStatusBadge,
  PageStatePanel,
} from "@/components/dapp/BotanicalPrimitives";
import { Pagination } from "@/components/ui/Pagination";
import { useDashboardState } from "@/components/dapp/useDashboardStore";
import { PRICE_PER_TON, normalizeUserRole } from "@/context/DappContext";
import { buildScreenerData, type ScreenerRow } from "@/lib/exbon-api";
import {
  ECOSYSTEMS,
  ECOSYSTEM_LIST,
  isValidEcosystemId,
  type EcosystemId,
} from "@/lib/ecosystems";
import { formatIdr, formatNumber } from "@/components/dapp/phantom-ui";
import { LiveClock, LiveNumber } from "@/components/motion";
import "@/components/dapp/dashboard-botanical.css";

type EcosystemFilter = "semua" | EcosystemId;
type SortKey = "available_desc" | "value_desc" | "sold_desc" | "name_asc";

const PAGE_SIZE = 6;

const TREND_DAY_LABELS = ["H-6", "H-5", "H-4", "H-3", "H-2", "Kemarin", "Hari ini"];

function EcosystemBadge({ ecosystemId, compact }: { ecosystemId: EcosystemId; compact?: boolean }) {
  const meta = ECOSYSTEMS[ecosystemId];
  const Icon = meta.icon;
  return (
    <span
      style={{
        color: meta.textColorVar,
        backgroundColor: meta.bgColorVar,
        borderColor: meta.borderColorVar,
      }}
      className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-none"
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {!compact && <span>{meta.shortLabel}</span>}
    </span>
  );
}

function StatCell({
  label,
  value,
  valueClassName = "text-[var(--ink)]",
  suffix,
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
  suffix?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col justify-center">
      <span className="truncate text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ink-dim)]">
        {label}
      </span>
      <span
        className={`xb-numeric mt-0.5 truncate text-[14px] font-bold leading-tight ${valueClassName}`}
      >
        {value}
        {suffix && (
          <span className="ml-1 text-[10.5px] font-medium text-[var(--ink-muted)]">{suffix}</span>
        )}
      </span>
    </div>
  );
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

export function ScreenerView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDesktop = useIsDesktop();
  const {
    user,
    parcels,
    sensors,
    aiAssessments,
    consentRecords,
    verificationRecords,
    transactions,
    isLoading,
  } = useDashboardState();

  const role = normalizeUserRole(user?.role, user?.email);
  const isGuest = role === "guest";
  const stateParam = searchParams.get("state");

  const rawEco = searchParams.get("ekosistem")?.toLowerCase();
  const initialEco: EcosystemFilter = isValidEcosystemId(rawEco) ? rawEco : "semua";
  const rawSort = searchParams.get("urut") as SortKey | null;
  const initialSort: SortKey =
    rawSort && ["available_desc", "value_desc", "sold_desc", "name_asc"].includes(rawSort)
      ? rawSort
      : "available_desc";
  const initialQuery = searchParams.get("q") ?? "";
  const initialLahan = searchParams.get("lahan")?.trim().toUpperCase() || null;

  const [ecosystemFilter, setEcosystemFilter] = useState<EcosystemFilter>(initialEco);
  const [sortKey, setSortKey] = useState<SortKey>(initialSort);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [activeParcelId, setActiveParcelId] = useState<string | null>(initialLahan);
  const [secondsAgo, setSecondsAgo] = useState<number>(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const nextEco = searchParams.get("ekosistem")?.toLowerCase();
    setEcosystemFilter(isValidEcosystemId(nextEco) ? nextEco : "semua");

    const nextSort = searchParams.get("urut") as SortKey | null;
    if (nextSort && ["available_desc", "value_desc", "sold_desc", "name_asc"].includes(nextSort)) {
      setSortKey(nextSort);
    }

    setSearchQuery(searchParams.get("q") ?? "");

    const nextLahan = searchParams.get("lahan")?.trim().toUpperCase() || null;
    if (nextLahan) setActiveParcelId(nextLahan);
  }, [searchParams]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsAgo((prev) => (prev >= 14 ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const syncUrlParams = (
    nextEco: EcosystemFilter,
    nextSort: SortKey,
    nextQuery: string,
    nextLahan: string | null = activeParcelId
  ) => {
    const params = new URLSearchParams();
    if (nextEco !== "semua") params.set("ekosistem", nextEco);
    if (nextSort !== "available_desc") params.set("urut", nextSort);
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    if (nextLahan) params.set("lahan", nextLahan);
    if (stateParam) params.set("state", stateParam);
    const qs = params.toString();
    router.replace(qs ? `/screener?${qs}` : "/screener", { scroll: false });
  };

  const screener = useMemo(
    () =>
      buildScreenerData({
        role,
        parcels,
        sensors,
        consentRecords,
        verificationRecords,
        transactions,
      }),
    [role, parcels, sensors, consentRecords, verificationRecords, transactions]
  );

  const ecosystemCounts = useMemo(() => {
    const counts: Record<EcosystemFilter, number> = {
      semua: screener.rows.length,
      hutan: 0,
      industri: 0,
      "smart-city": 0,
    };
    screener.rows.forEach((row) => {
      counts[row.ecosystem_id] = (counts[row.ecosystem_id] ?? 0) + 1;
    });
    return counts;
  }, [screener.rows]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const matched = screener.rows.filter((row) => {
      if (ecosystemFilter !== "semua" && row.ecosystem_id !== ecosystemFilter) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.parcel_id.toLowerCase().includes(q) ||
        row.region.toLowerCase().includes(q)
      );
    });

    return [...matched].sort((a, b) => {
      if (sortKey === "name_asc") return a.name.localeCompare(b.name, "id");
      if (sortKey === "value_desc") return b.value_idr - a.value_idr;
      if (sortKey === "sold_desc") return b.sold_24h_units - a.sold_24h_units;
      return b.units_available - a.units_available;
    });
  }, [screener.rows, ecosystemFilter, searchQuery, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filteredRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [ecosystemFilter, sortKey, searchQuery]);

  useEffect(() => {
    if (!activeParcelId) return;
    const index = filteredRows.findIndex(
      (row) => row.parcel_id.toUpperCase() === activeParcelId.toUpperCase()
    );
    if (index >= 0) setPage(Math.floor(index / PAGE_SIZE) + 1);
  }, [activeParcelId, filteredRows]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const stripMetrics = useMemo(() => {
    const sourceRows =
      ecosystemFilter === "semua"
        ? screener.rows
        : screener.rows.filter((r) => r.ecosystem_id === ecosystemFilter);
    return {
      referencePriceIdr: screener.reference_price_idr || PRICE_PER_TON,
      unitsAvailable: sourceRows.reduce((acc, r) => acc + r.units_available, 0),
      unitsFrozen: sourceRows.reduce((acc, r) => acc + r.units_frozen, 0),
      sold24hUnits: sourceRows.reduce((acc, r) => acc + r.sold_24h_units, 0),
    };
  }, [screener.rows, screener.reference_price_idr, ecosystemFilter]);

  const activeParcel = useMemo(
    () =>
      activeParcelId
        ? parcels.find((p) => p.id.toUpperCase() === activeParcelId.toUpperCase()) ?? null
        : null,
    [parcels, activeParcelId]
  );

  const activeRow = useMemo(
    () =>
      activeParcel
        ? screener.rows.find((r) => r.parcel_id === activeParcel.id) ?? null
        : null,
    [screener.rows, activeParcel]
  );

  // Di desktop panel kanan tidak boleh kosong: pakai baris teratas halaman aktif sebagai tampilan awal.
  const fallbackRow = !activeParcel && isDesktop ? pageRows[0] ?? null : null;
  const fallbackParcel = fallbackRow
    ? parcels.find((p) => p.id === fallbackRow.parcel_id) ?? null
    : null;
  const displayParcel = activeParcel ?? fallbackParcel;
  const displayRow = activeRow ?? fallbackRow;
  const highlightedParcelId = activeParcelId ?? fallbackRow?.parcel_id ?? null;

  const activeTrendSeries = useMemo(() => {
    const points = displayRow?.trend_7d ?? [];
    const refPrice = screener.reference_price_idr || PRICE_PER_TON;
    return TREND_DAY_LABELS.map((label, idx) => {
      const units = points[idx] ?? 0;
      return { label, units, grossIdr: units * refPrice };
    });
  }, [displayRow, screener.reference_price_idr]);

  const selectParcel = (parcelId: string) => {
    setActiveParcelId(parcelId);
    syncUrlParams(ecosystemFilter, sortKey, searchQuery, parcelId);
  };

  const clearSelection = () => {
    setActiveParcelId(null);
    syncUrlParams(ecosystemFilter, sortKey, searchQuery, null);
  };

  const resetFilters = () => {
    setEcosystemFilter("semua");
    setSortKey("available_desc");
    setSearchQuery("");
    syncUrlParams("semua", "available_desc", "", activeParcelId);
  };

  const hasActiveFilter =
    ecosystemFilter !== "semua" || sortKey !== "available_desc" || searchQuery.trim().length > 0;

  const pageState: "loading" | "empty" | "error" | "ready" =
    isLoading || stateParam === "memuat"
      ? "loading"
      : stateParam === "gagal"
      ? "error"
      : filteredRows.length === 0 || stateParam === "kosong"
      ? "empty"
      : "ready";

  const filterTransitionKey = `${ecosystemFilter}-${sortKey}-${searchQuery.trim()}-${safePage}`;

  const renderSealChip = (row: ScreenerRow) => {
    if (row.sealed && row.ledger_id) {
      return (
        <Link
          href={`/verifikasi/${encodeURIComponent(row.ledger_id)}`}
          onClick={(e) => e.stopPropagation()}
          className="xbm-pressable inline-flex min-h-[26px] items-center gap-1 rounded-full border border-[var(--seal-line)] bg-[var(--seal-100)] px-2 py-0.5 text-[11px] font-semibold text-[var(--seal-600)] hover:bg-[var(--seal-200)]"
        >
          <ShieldCheck className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="xb-mono">#{row.ledger_id}</span>
        </Link>
      );
    }
    return <span className="text-[11.5px] font-medium text-[var(--ink-dim)]">Menunggu segel</span>;
  };

  const renderMarketCap = (row: ScreenerRow) =>
    isGuest ? (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--seal-600)]">
        <Lock className="h-3 w-3" aria-hidden="true" />
        <span>Terkunci</span>
      </span>
    ) : (
      <LiveNumber value={row.value_idr} format={formatIdr} />
    );

  const renderDetail = () => {
    if (!displayParcel || !displayRow) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--leaf-100)] text-[var(--forest-700)]">
            <Layers className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="xb-display text-[16px] font-bold text-[var(--ink)]">Pilih lahan di daftar</p>
          <p className="max-w-[280px] text-[13.5px] leading-relaxed text-[var(--ink-muted)]">
            Grafik tren, telemetri sensor, dan segel audit muncul di sini.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4 p-4 xl:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <EcosystemBadge ecosystemId={displayRow.ecosystem_id} />
              <CanonicalStatusBadge status={displayRow.status} compact />
              {renderSealChip(displayRow)}
            </div>
            <h2 className="xb-display mt-2 truncate text-[19px] font-bold leading-tight text-[var(--ink)]">
              {displayParcel.name}
            </h2>
            <p className="xb-mono mt-0.5 text-[12px] text-[var(--ink-muted)]">
              {displayParcel.id} · {displayRow.region}
            </p>
          </div>
          {activeParcel && (
            <button
              type="button"
              aria-label="Tutup detail lahan"
              onClick={clearSelection}
              className="xbm-pressable grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line-subtle)] xl:grid-cols-4">
          <div className="bg-[var(--surface)] p-3.5">
            <StatCell label="Market cap" value={renderMarketCap(displayRow)} />
          </div>
          <div className="bg-[var(--surface)] p-3.5">
            <StatCell
              label="Jatah tersedia"
              value={formatNumber(displayRow.units_available)}
              suffix="t"
              valueClassName="text-[var(--status-verified-ink)]"
            />
          </div>
          <div className="bg-[var(--surface)] p-3.5">
            <StatCell
              label="Jatah beku"
              value={formatNumber(displayRow.units_frozen)}
              suffix="t"
              valueClassName="text-[var(--status-blocked-ink)]"
            />
          </div>
          <div className="bg-[var(--surface)] p-3.5">
            <StatCell
              label="Volume 24 jam"
              value={formatNumber(displayRow.sold_24h_units)}
              suffix="t"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3.5">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <p className="text-[13px] font-bold text-[var(--ink)]">Tren market cap · 7 hari</p>
            <span className="xb-mono text-[11px] font-semibold text-[var(--forest-700)]">
              {displayParcel.id}
            </span>
          </div>
          <MarketTrendAreaChart
            data={activeTrendSeries}
            heightClassName="h-[190px]"
            contextTag={displayParcel.id}
            showStatsFooter={false}
          />
        </div>

        <ParcelInspectionPanel
          parcel={displayParcel}
          sensors={sensors}
          assessment={aiAssessments.find((a) => a.parcel_id === displayParcel.id)}
          verification={verificationRecords.find((v) => v.parcel_id === displayParcel.id)}
          consent={consentRecords.find((c) => c.parcel_id === displayParcel.id)}
          role={role}
          inDrawer
        />
      </div>
    );
  };

  return (
    <div className="xb-botanical flex h-dvh flex-col overflow-hidden bg-[var(--canvas)]">
      {/* Bar atas: identitas ringkas + kontrol global */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--surface)] px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/exboncp-brand-mark.svg"
            alt=""
            width={30}
            height={30}
            className="h-[30px] w-[30px] shrink-0"
          />
          <div className="min-w-0 leading-tight">
            <p className="xb-display truncate text-[15px] font-bold text-[var(--ink)]">
              Pasar Karbon
            </p>
            <p className="truncate text-[11.5px] font-medium text-[var(--ink-muted)]">
              Screener lintas ekosistem
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="xb-numeric hidden items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-[12.5px] font-semibold text-[var(--ink-muted)] sm:inline-flex">
            <span aria-hidden="true" className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--forest-700)] opacity-55" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--forest-700)]" />
            </span>
            <LiveClock />
          </span>
          <button
            type="button"
            onClick={() => setSecondsAgo(0)}
            aria-label="Segarkan ulang"
            className="xbm-pressable inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 text-[12.5px] font-semibold text-[var(--ink)] hover:bg-[var(--surface-soft)]"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[var(--forest-700)]" aria-hidden="true" />
            <span className="xb-numeric hidden sm:inline">{secondsAgo}d</span>
          </button>
          <Link
            href="/app"
            className="xbm-pressable inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 text-[12.5px] font-semibold text-[var(--ink)] hover:bg-[var(--surface-soft)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Dasbor</span>
          </Link>
        </div>
      </header>

      {/* Toolbar: chip ekosistem + pencarian + urutan + strip agregat */}
      <div className="shrink-0 border-b border-[var(--line)] bg-[var(--surface)] px-4 py-2.5">
        <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
          <div
            className="flex flex-wrap items-center gap-1.5"
            role="group"
            aria-label="Filter ekosistem pasar karbon"
          >
            {(
              [
                { id: "semua" as const, label: "Semua", count: ecosystemCounts.semua },
                ...ECOSYSTEM_LIST.map((eco) => ({
                  id: eco.id,
                  label: eco.label,
                  count: ecosystemCounts[eco.id] ?? 0,
                  eco,
                })),
              ]
            ).map((item) => {
              const active = ecosystemFilter === item.id;
              const Icon = "eco" in item ? item.eco.icon : Layers;
              const isPlain = !("eco" in item);
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setEcosystemFilter(item.id);
                    syncUrlParams(item.id, sortKey, searchQuery);
                  }}
                  style={
                    active && !isPlain
                      ? {
                          color: item.eco.textColorVar,
                          backgroundColor: item.eco.bgColorVar,
                          borderColor: item.eco.textColorVar,
                        }
                      : undefined
                  }
                  className={`xbm-eco-chip inline-flex min-h-[34px] items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] font-semibold ${
                    active
                      ? isPlain
                        ? "border-[var(--forest-700)] bg-[var(--forest-700)] text-white"
                        : ""
                      : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink-muted)] hover:border-[var(--line-strong)] hover:text-[var(--ink)]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                  <span
                    className={`xb-numeric rounded-full px-1.5 py-0.5 text-[10.5px] font-bold leading-none ${
                      active && !isPlain ? "" : "bg-[var(--canvas)] text-[var(--ink-muted)]"
                    }`}
                    style={
                      active && !isPlain
                        ? { color: item.eco.textColorVar, backgroundColor: "var(--surface)" }
                        : undefined
                    }
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[190px] flex-1 sm:flex-none">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--ink-muted)]"
                aria-hidden="true"
              />
              <label htmlFor="market-search" className="sr-only">
                Cari lahan
              </label>
              <input
                id="market-search"
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  const nextQ = e.target.value;
                  setSearchQuery(nextQ);
                  syncUrlParams(ecosystemFilter, sortKey, nextQ);
                }}
                placeholder="Cari lahan atau kode..."
                className="h-9 w-full rounded-full border border-[var(--line)] bg-[var(--surface)] pl-9 pr-3 text-[13px] font-medium text-[var(--ink)] placeholder:text-[var(--ink-dim)] focus:border-[var(--forest-700)] focus:outline-none sm:w-[230px]"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <label
                htmlFor="screener-sort"
                className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[var(--ink-muted)]"
              >
                <ArrowDownUp className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">Urut</span>
              </label>
              <select
                id="screener-sort"
                value={sortKey}
                onChange={(e) => {
                  const nextSort = e.target.value as SortKey;
                  setSortKey(nextSort);
                  syncUrlParams(ecosystemFilter, nextSort, searchQuery);
                }}
                className="h-9 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 text-[12.5px] font-semibold text-[var(--ink)] focus:border-[var(--forest-700)] focus:outline-none"
              >
                <option value="available_desc">Jatah tersedia</option>
                <option value="value_desc">Market cap</option>
                <option value="sold_desc">Volume 24 jam</option>
                <option value="name_asc">Nama A-Z</option>
              </select>
            </div>

            {hasActiveFilter && (
              <button
                type="button"
                onClick={resetFilters}
                className="xbm-pressable inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 text-[12.5px] font-semibold text-[var(--ink-muted)] hover:border-[var(--forest-700)] hover:text-[var(--ink)]"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Strip agregat tipis */}
        <div className="mt-2.5 grid grid-cols-2 divide-x divide-[var(--line-subtle)] border-t border-[var(--line-subtle)] pt-2 sm:grid-cols-4">
          <div className="px-3 first:pl-0 last:pr-0">
            <StatCell
              label="Harga referensi"
              value={<LiveNumber value={stripMetrics.referencePriceIdr} format={formatIdr} />}
              suffix="/ t"
            />
          </div>
          <div className="px-3 first:pl-0 last:pr-0">
            <StatCell
              label="Jatah tersedia"
              value={formatNumber(stripMetrics.unitsAvailable)}
              suffix="t"
              valueClassName="text-[var(--status-verified-ink)]"
            />
          </div>
          <div className="px-3 first:pl-0 last:pr-0">
            <StatCell
              label="Jatah beku"
              value={formatNumber(stripMetrics.unitsFrozen)}
              suffix="t"
              valueClassName="text-[var(--status-blocked-ink)]"
            />
          </div>
          <div className="px-3 first:pl-0 last:pr-0">
            <StatCell
              label="Volume 24 jam"
              value={formatNumber(stripMetrics.sold24hUnits)}
              suffix="t"
            />
          </div>
        </div>
      </div>

      {/* Badan: daftar kiri + detail kanan (desktop), daftar penuh + overlay (mobile) */}
      <div className="flex min-h-0 flex-1">
        <section
          aria-label="Daftar lahan"
          className="flex min-h-0 w-full flex-col lg:w-[390px] lg:shrink-0 lg:border-r lg:border-[var(--line)] xl:w-[430px]"
        >
          <div className="min-h-0 flex-1 overflow-y-auto">
            <PageStatePanel
              state={pageState}
              onRetry={resetFilters}
              allowMascot
              emptyTitle={
                ecosystemFilter === "semua"
                  ? "Tidak ada lahan yang cocok"
                  : "Belum ada lahan pada ekosistem ini"
              }
              emptyDescription="Ubah filter ekosistem, pencarian, atau tekan Reset."
            >
              {/* Daftar padat desktop */}
              <ul key={`desk-${filterTransitionKey}`} className="hidden lg:block">
                {pageRows.map((row, idx) => {
                  const selected =
                    highlightedParcelId?.toUpperCase() === row.parcel_id.toUpperCase();
                  return (
                    <li key={row.parcel_id}>
                      <button
                        type="button"
                        onClick={() => selectParcel(row.parcel_id)}
                        aria-current={selected ? "true" : undefined}
                        style={
                          { "--row-delay": `${Math.min(idx * 40, 220)}ms` } as React.CSSProperties
                        }
                        className={`xbm-table-row grid w-full grid-cols-[1fr_auto] items-center gap-3 border-b border-[var(--line-subtle)] px-4 py-2.5 text-left ${
                          selected ? "bg-[var(--leaf-100)]/70" : "hover:bg-[var(--surface-soft)]"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <EcosystemBadge ecosystemId={row.ecosystem_id} compact />
                            <CanonicalStatusBadge status={row.status} compact />
                          </div>
                          <p className="xb-display mt-1 truncate text-[14px] font-bold text-[var(--ink)]">
                            {row.name}
                          </p>
                          <p className="xb-mono truncate text-[11.5px] text-[var(--ink-muted)]">
                            {row.parcel_id} · {row.region}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right leading-tight">
                            <p className="xb-numeric text-[13px] font-bold text-[var(--ink)]">
                              {renderMarketCap(row)}
                            </p>
                            <p className="xb-numeric mt-0.5 text-[11.5px] font-semibold text-[var(--status-verified-ink)]">
                              {formatNumber(row.units_available)} t
                            </p>
                          </div>
                          <MarketSparkline
                            points={row.trend_7d}
                            label={`Tren 7 hari ${row.name}`}
                          />
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Kartu mobile */}
              <div key={`mob-${filterTransitionKey}`} className="space-y-2 p-3 lg:hidden">
                {pageRows.map((row, idx) => (
                  <button
                    key={row.parcel_id}
                    type="button"
                    onClick={() => selectParcel(row.parcel_id)}
                    style={
                      { "--row-delay": `${Math.min(idx * 40, 220)}ms` } as React.CSSProperties
                    }
                    className="xbm-table-row block w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3.5 text-left shadow-[0_1px_4px_rgba(20,38,26,0.04)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <EcosystemBadge ecosystemId={row.ecosystem_id} compact />
                        <CanonicalStatusBadge status={row.status} compact />
                      </div>
                      <MarketSparkline points={row.trend_7d} label={`Tren ${row.name}`} />
                    </div>

                    <p className="xb-display mt-2 truncate text-[15.5px] font-bold text-[var(--ink)]">
                      {row.name}
                    </p>
                    <p className="xb-mono truncate text-[11.5px] text-[var(--ink-muted)]">
                      {row.parcel_id} · {row.region}
                    </p>

                    <div className="mt-2.5 grid grid-cols-3 divide-x divide-[var(--line-subtle)] border-t border-[var(--line-subtle)] pt-2.5">
                      <div className="pr-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-dim)]">
                          Market cap
                        </p>
                        <p className="xb-numeric mt-0.5 truncate text-[12.5px] font-bold text-[var(--ink)]">
                          {renderMarketCap(row)}
                        </p>
                      </div>
                      <div className="px-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-dim)]">
                          Tersedia
                        </p>
                        <p className="xb-numeric mt-0.5 truncate text-[12.5px] font-bold text-[var(--status-verified-ink)]">
                          {formatNumber(row.units_available)} t
                        </p>
                      </div>
                      <div className="pl-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-dim)]">
                          24 jam
                        </p>
                        <p className="xb-numeric mt-0.5 truncate text-[12.5px] font-bold text-[var(--ink)]">
                          {formatNumber(row.sold_24h_units)} t
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </PageStatePanel>

            <Pagination
              page={safePage}
              pageSize={PAGE_SIZE}
              totalItems={filteredRows.length}
              onPageChange={setPage}
              label="Navigasi daftar lahan pasar"
              className="px-4 py-3"
            />

            <p className="px-4 pb-4 pt-2 text-[11px] leading-relaxed text-[var(--ink-dim)]">
              Harga referensi simulasi · pembanding IDXCarbon Jan 2026 ~Rp40.000/t · REDD+
              yurisdiksi EDF 2024 US$6–12/t.
            </p>
          </div>
        </section>

        {/* Panel detail (desktop) */}
        <aside
          aria-label="Detail lahan terpilih"
          className="hidden min-w-0 flex-1 overflow-y-auto lg:block"
        >
          {renderDetail()}
        </aside>
      </div>

      {/* Overlay detail (mobile) */}
      <BotanicalDrawer
        open={Boolean(activeParcel) && !isDesktop}
        onOpenChange={(open) => {
          if (!open) clearSelection();
        }}
        title={activeParcel ? activeParcel.name : "Detail Lahan"}
        description="Tren 7 hari, telemetri sensor, satelit, dan segel audit."
      >
        {activeParcel && activeRow && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <EcosystemBadge ecosystemId={activeRow.ecosystem_id} />
              <span className="xb-mono text-[11.5px] text-[var(--ink-muted)]">
                {activeRow.zone_name}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line-subtle)]">
              <div className="bg-[var(--surface)] p-3">
                <StatCell label="Market cap" value={renderMarketCap(activeRow)} />
              </div>
              <div className="bg-[var(--surface)] p-3">
                <StatCell
                  label="Jatah tersedia"
                  value={formatNumber(activeRow.units_available)}
                  suffix="t"
                  valueClassName="text-[var(--status-verified-ink)]"
                />
              </div>
              <div className="bg-[var(--surface)] p-3">
                <StatCell
                  label="Jatah beku"
                  value={formatNumber(activeRow.units_frozen)}
                  suffix="t"
                  valueClassName="text-[var(--status-blocked-ink)]"
                />
              </div>
              <div className="bg-[var(--surface)] p-3">
                <StatCell
                  label="Volume 24 jam"
                  value={formatNumber(activeRow.sold_24h_units)}
                  suffix="t"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
              <MarketTrendAreaChart
                data={activeTrendSeries}
                heightClassName="h-[150px]"
                contextTag={activeParcel.id}
                showStatsFooter={false}
              />
            </div>

            <ParcelInspectionPanel
              parcel={activeParcel}
              sensors={sensors}
              assessment={aiAssessments.find((a) => a.parcel_id === activeParcel.id)}
              verification={verificationRecords.find((v) => v.parcel_id === activeParcel.id)}
              consent={consentRecords.find((c) => c.parcel_id === activeParcel.id)}
              role={role}
              inDrawer
            />
          </div>
        )}
      </BotanicalDrawer>
    </div>
  );
}
