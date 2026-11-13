"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDownUp,
  ArrowUpRight,
  CheckCircle2,
  FlaskConical,
  Info,
  Radio,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { BotanicalAppShell } from "@/components/dapp/BotanicalAppShell";
import { ParcelInspectionPanel } from "@/components/dapp/ParcelInspectionPanel";
import {
  MarketSparkline,
  MarketTrendAreaChart,
} from "@/components/charts/ChartPrimitives";
import {
  BotanicalCard,
  BotanicalDrawer,
  BotanicalPageHeader,
  CanonicalStatusBadge,
  ConsentStatusBadge,
  PageStatePanel,
} from "@/components/dapp/BotanicalPrimitives";
import { useDashboardState } from "@/components/dapp/useDashboardStore";
import { PRICE_PER_TON, normalizeUserRole } from "@/context/DappContext";
import { buildScreenerData, type ScreenerRow } from "@/lib/exbon-api";
import { ZONES_CATALOG } from "@/lib/copy";
import { formatWibTime } from "@/lib/dashboard-helpers";
import { formatIdr, formatNumber } from "@/components/dapp/phantom-ui";
import { LiveClock, LiveNumber } from "@/components/motion";

type PresetKey = "semua" | "siap" | "perhatian" | "menunggu";
type SortKey = "available_desc" | "value_desc" | "sold_desc" | "name_asc";

const TREND_DAY_LABELS = ["H-6", "H-5", "H-4", "H-3", "H-2", "Kemarin", "Hari ini"];

export function ScreenerView() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  const initialPreset = (searchParams.get("preset") as PresetKey) || "semua";
  const initialZone = searchParams.get("zona") || "SEMUA";
  const initialSort = (searchParams.get("urut") as SortKey) || "available_desc";

  const [preset, setPreset] = useState<PresetKey>(
    ["semua", "siap", "perhatian", "menunggu"].includes(initialPreset) ? initialPreset : "semua"
  );
  const [zoneFilter, setZoneFilter] = useState<string>(initialZone);
  const [sortKey, setSortKey] = useState<SortKey>(
    ["available_desc", "value_desc", "sold_desc", "name_asc"].includes(initialSort)
      ? initialSort
      : "available_desc"
  );
  const [drawerParcelId, setDrawerParcelId] = useState<string | null>(null);
  const [secondsAgo, setSecondsAgo] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsAgo((prev) => (prev >= 14 ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const syncUrlParams = (nextPreset: PresetKey, nextZone: string, nextSort: SortKey) => {
    const params = new URLSearchParams();
    if (nextPreset !== "semua") params.set("preset", nextPreset);
    if (nextZone !== "SEMUA") params.set("zona", nextZone);
    if (nextSort !== "available_desc") params.set("urut", nextSort);
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

  const aggregateTrendSeries = useMemo(() => {
    return TREND_DAY_LABELS.map((label, idx) => {
      const units = screener.rows.reduce((sum, r) => sum + (r.trend_7d[idx] ?? 0), 0);
      return {
        label,
        units,
        grossIdr: units * (screener.reference_price_idr || PRICE_PER_TON),
      };
    });
  }, [screener.rows, screener.reference_price_idr]);

  const filteredRows = useMemo(() => {
    const matched = screener.rows.filter((row) => {
      if (preset === "siap" && row.status !== "VERIFIED") return false;
      if (preset === "perhatian" && row.status !== "WARNING" && row.status !== "DISPUTE") {
        return false;
      }
      if (preset === "menunggu" && row.sealed) return false;
      if (zoneFilter !== "SEMUA" && row.zone_id !== zoneFilter) return false;
      return true;
    });

    return [...matched].sort((a, b) => {
      if (sortKey === "name_asc") return a.name.localeCompare(b.name, "id");
      if (sortKey === "value_desc") return b.value_idr - a.value_idr;
      if (sortKey === "sold_desc") return b.sold_24h_units - a.sold_24h_units;
      return b.units_available - a.units_available;
    });
  }, [screener.rows, preset, zoneFilter, sortKey]);

  const drawerParcel = parcels.find((p) => p.id === drawerParcelId) ?? null;

  const clearFilters = () => {
    setPreset("semua");
    setZoneFilter("SEMUA");
    setSortKey("available_desc");
    syncUrlParams("semua", "SEMUA", "available_desc");
  };

  const pageState: "loading" | "empty" | "error" | "ready" =
    isLoading || stateParam === "memuat"
      ? "loading"
      : stateParam === "gagal"
      ? "error"
      : filteredRows.length === 0 || stateParam === "kosong"
      ? "empty"
      : "ready";

  const renderSealCell = (row: ScreenerRow) => {
    if (row.sealed && row.ledger_id) {
      return (
        <Link
          href={`/verifikasi/${encodeURIComponent(row.ledger_id)}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex min-h-[34px] items-center gap-1.5 rounded-full bg-[var(--seal-100)] px-3 py-1 text-[13.5px] font-semibold text-[var(--seal-600)] transition hover:bg-[var(--seal-200)]"
        >
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Terkunci</span>
        </Link>
      );
    }
    return (
      <span className="text-[13.5px] font-medium text-[var(--ink-muted)]">Menunggu segel</span>
    );
  };

  return (
    <BotanicalAppShell>
      <div className="space-y-5">
        <BotanicalPageHeader
          title="Screener Lahan & Unit Tersedia"
          description="Pantau ketersediaan unit serapan karbon per lahan, unit yang ditahan sistem, status izin warga, dan segel keaslian dalam satu tampilan ringkas."
          showSimulation
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <span className="xb-numeric hidden items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 py-1.5 text-[13px] font-semibold text-[var(--ink-muted)] sm:inline-flex">
                <span aria-hidden="true" className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--forest-700)] opacity-55" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--forest-700)]" />
                </span>
                <LiveClock />
              </span>
              <button
                type="button"
                onClick={() => setSecondsAgo(0)}
                className="inline-flex min-h-[38px] items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 text-[13.5px] font-semibold text-[var(--ink)] hover:bg-[var(--surface-soft)]"
              >
                <RefreshCw className="h-3.5 w-3.5 text-[var(--forest-700)]" aria-hidden="true" />
                <span className="xb-numeric">Diperbarui {secondsAgo} dtk lalu</span>
              </button>
            </div>
          }
        />

        {/* Balanced Market Pulse + 7-Day Trend Bento */}
        <div className="grid gap-4 xl:grid-cols-12">
          <div
            className={`grid gap-3.5 xl:col-span-5 ${
              isGuest ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2"
            }`}
          >
            <BotanicalCard interactive className="flex flex-col justify-between p-4">
              <p className="text-[13.5px] font-medium text-[var(--ink-muted)]">Harga referensi</p>
              <p className="xb-display xb-numeric mt-1.5 text-[23px] font-bold text-[var(--ink)]">
                <LiveNumber value={screener.reference_price_idr} format={formatIdr} />
              </p>
              <p className="mt-1 text-[12.5px] text-[var(--ink-muted)]">
                Parameter simulasi per tCO2e
              </p>
            </BotanicalCard>

            <BotanicalCard interactive className="flex flex-col justify-between p-4">
              <p className="text-[13.5px] font-medium text-[var(--ink-muted)]">Unit tersedia</p>
              <p className="xb-display xb-numeric mt-1.5 text-[23px] font-bold text-[var(--status-verified-ink)]">
                <LiveNumber
                  value={screener.totals.units_available}
                  format={(v) => formatNumber(Math.round(v))}
                />{" "}
                <span className="text-[13.5px] font-medium text-[var(--ink-muted)]">tCO2e</span>
              </p>
              <p className="mt-1 text-[12.5px] text-[var(--ink-muted)]">Siap dialokasikan</p>
            </BotanicalCard>

            {isGuest ? (
              <BotanicalCard interactive className="flex flex-col justify-between p-4 sm:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[13.5px] font-medium text-[var(--ink-muted)]">
                      Status akses & kondisi pasar
                    </p>
                    <p className="mt-1 text-[15.5px] font-semibold text-[var(--ink)]">
                      {screener.market_state} · Mode pembaca publik
                    </p>
                  </div>
                  <Link
                    href="/login"
                    className="inline-flex min-h-[40px] items-center rounded-full bg-[var(--forest-700)] px-4 text-[14px] font-semibold text-white hover:bg-[var(--forest-800)]"
                  >
                    Masuk akun
                  </Link>
                </div>
                <p className="mt-1.5 text-[13px] text-[var(--ink-muted)]">
                  Masuk akun demo untuk membuka simulasi pembagian nilai dan riwayat transaksi 24 jam.
                </p>
              </BotanicalCard>
            ) : (
              <>
                <BotanicalCard interactive className="flex flex-col justify-between p-4">
                  <p className="text-[13.5px] font-medium text-[var(--ink-muted)]">Unit dibekukan</p>
                  <p className="xb-display xb-numeric mt-1.5 text-[23px] font-bold text-[var(--status-blocked-ink)]">
                    <LiveNumber
                      value={screener.totals.units_frozen}
                      format={(v) => formatNumber(Math.round(v))}
                    />{" "}
                    <span className="text-[13.5px] font-medium text-[var(--ink-muted)]">tCO2e</span>
                  </p>
                  <p className="mt-1 text-[12.5px] text-[var(--ink-muted)]">Menunggu pemulihan</p>
                </BotanicalCard>

                <BotanicalCard interactive className="flex flex-col justify-between p-4">
                  <p className="text-[13.5px] font-medium text-[var(--ink-muted)]">Terjual 24 jam</p>
                  <p className="xb-display xb-numeric mt-1.5 text-[23px] font-bold text-[var(--ink)]">
                    <LiveNumber
                      value={screener.totals.sold_today_units}
                      format={(v) => formatNumber(Math.round(v))}
                    />{" "}
                    <span className="text-[13.5px] font-medium text-[var(--ink-muted)]">tCO2e</span>
                  </p>
                  <p className="mt-1 text-[12.5px] text-[var(--ink-muted)]">Catatan simulasi harian</p>
                </BotanicalCard>
              </>
            )}
          </div>

          <BotanicalCard className="flex flex-col justify-between p-4 sm:p-5 xl:col-span-7">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="xb-display text-[17px] font-bold text-[var(--ink)]">
                  Tren Alokasi Nilai Simulasi (7 Hari)
                </h2>
                <p className="mt-0.5 text-[13.5px] text-[var(--ink-muted)]">
                  Akumulasi nilai simulasi harian seluruh lahan terpantau.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--seal-100)] px-3 py-1 text-[13px] font-semibold text-[var(--seal-600)]">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                <span>Pasar: {screener.market_state}</span>
              </span>
            </div>

            <div className="mt-2.5">
              <MarketTrendAreaChart
                data={aggregateTrendSeries}
                heightClassName="h-[168px]"
                contextTag="Agregat Screener"
              />
            </div>
          </BotanicalCard>
        </div>

        {/* Presets, Zone Filter & Sort Controls */}
        <BotanicalCard className="p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Saring status cepat">
              {(
                [
                  { id: "semua", label: "Semua" },
                  { id: "siap", label: "Siap dijual" },
                  { id: "perhatian", label: "Perlu perhatian" },
                  { id: "menunggu", label: "Menunggu auditor" },
                ] as const
              ).map((item) => {
                const active = preset === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setPreset(item.id);
                      syncUrlParams(item.id, zoneFilter, sortKey);
                    }}
                    className={`min-h-[42px] rounded-full border px-4 text-[14.5px] font-semibold ${
                      active
                        ? "border-[var(--forest-700)] bg-[var(--forest-700)] text-white"
                        : "border-[var(--line)] bg-[var(--surface-soft)] text-[var(--ink-muted)] hover:bg-[var(--leaf-100)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="screener-zona" className="text-[14px] font-semibold text-[var(--ink-muted)]">
                  Zona
                </label>
                <select
                  id="screener-zona"
                  value={zoneFilter}
                  onChange={(e) => {
                    const nextZone = e.target.value;
                    setZoneFilter(nextZone);
                    syncUrlParams(preset, nextZone, sortKey);
                  }}
                  className="h-11 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 text-[14.5px] font-semibold text-[var(--ink)] focus:border-[var(--forest-700)] focus:outline-none"
                >
                  <option value="SEMUA">Semua zona</option>
                  {Object.values(ZONES_CATALOG).map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="screener-sort" className="inline-flex items-center gap-1 text-[14px] font-semibold text-[var(--ink-muted)]">
                  <ArrowDownUp className="h-4 w-4" aria-hidden="true" />
                  <span>Urut</span>
                </label>
                <select
                  id="screener-sort"
                  value={sortKey}
                  onChange={(e) => {
                    const nextSort = e.target.value as SortKey;
                    setSortKey(nextSort);
                    syncUrlParams(preset, zoneFilter, nextSort);
                  }}
                  className="h-11 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 text-[14.5px] font-semibold text-[var(--ink)] focus:border-[var(--forest-700)] focus:outline-none"
                >
                  <option value="available_desc">Unit tersedia terbanyak</option>
                  <option value="value_desc">Nilai tertinggi</option>
                  <option value="sold_desc">Terjual 24 jam</option>
                  <option value="name_asc">Nama lahan A-Z</option>
                </select>
              </div>
            </div>
          </div>
        </BotanicalCard>

        <PageStatePanel
          state={pageState}
          onRetry={() => router.replace("/screener", { scroll: false })}
          allowMascot
          emptyTitle="Belum ada lahan yang cocok dengan saringan ini"
          emptyDescription="Ubah pilihan status cepat atau zona di atas untuk menampilkan daftar lahan yang tersedia."
        >
          {/* Desktop Tabular Screener (>= 768px) */}
          <BotanicalCard className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--line)] bg-[var(--surface-soft)] text-[13px] font-semibold text-[var(--ink-muted)]">
                    <th scope="col" className="min-w-[205px] px-3.5 py-3">Lahan</th>
                    <th scope="col" className="whitespace-nowrap px-3 py-3">Status</th>
                    <th scope="col" className="whitespace-nowrap px-3 py-3 text-right">Tersedia</th>
                    <th scope="col" className="whitespace-nowrap px-3 py-3 text-right">Beku</th>
                    <th scope="col" className="whitespace-nowrap px-3 py-3 text-right">Nilai tersedia</th>
                    <th scope="col" className="whitespace-nowrap px-3 py-3 text-right">24 jam</th>
                    <th scope="col" className="whitespace-nowrap px-3 py-3">Izin warga</th>
                    <th scope="col" className="whitespace-nowrap px-3 py-3">Sensor</th>
                    <th scope="col" className="whitespace-nowrap px-3 py-3">Segel</th>
                    <th scope="col" className="whitespace-nowrap px-3.5 py-3 text-right">Tren 7h</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)] text-[14.5px]">
                  {filteredRows.map((row) => (
                    <tr
                      key={row.parcel_id}
                      onClick={() => setDrawerParcelId(row.parcel_id)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setDrawerParcelId(row.parcel_id);
                        }
                      }}
                      className="cursor-pointer transition-colors hover:bg-[var(--surface-soft)] focus-visible:bg-[var(--leaf-100)]/60 focus-visible:outline-none"
                    >
                      <td className="min-w-[205px] px-3.5 py-3">
                        <p className="xb-display font-bold text-[var(--ink)]">{row.name}</p>
                        <p className="xb-mono text-[12.5px] text-[var(--ink-muted)]">
                          {row.parcel_id} · {row.zone_name}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <CanonicalStatusBadge status={row.status} compact />
                      </td>
                      <td className="xb-numeric whitespace-nowrap px-3 py-3 text-right font-bold text-[var(--status-verified-ink)]">
                        {formatNumber(row.units_available)} t
                      </td>
                      <td className="xb-numeric whitespace-nowrap px-3 py-3 text-right font-semibold text-[var(--status-blocked-ink)]">
                        {formatNumber(row.units_frozen)} t
                      </td>
                      <td className="xb-numeric whitespace-nowrap px-3 py-3 text-right font-semibold text-[var(--ink)]">
                        {isGuest ? (
                          <Link
                            href="/login"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[13.5px] font-semibold text-[var(--seal-600)] underline"
                          >
                            Masuk
                          </Link>
                        ) : (
                          <Link
                            href={`/pasar/${encodeURIComponent(row.parcel_id)}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[var(--forest-800)] hover:underline"
                          >
                            <span>{formatIdr(row.value_idr)}</span>
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </Link>
                        )}
                      </td>
                      <td className="xb-numeric whitespace-nowrap px-3 py-3 text-right font-semibold text-[var(--ink)]">
                        {isGuest ? (
                          <span className="text-[13px] text-[var(--ink-muted)]">Tamu</span>
                        ) : (
                          `${formatNumber(row.sold_24h_units)} t`
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <ConsentStatusBadge status={row.consent} compact />
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <p className="xb-numeric text-[13.5px] font-semibold text-[var(--ink)]">
                          {formatWibTime(row.last_sensor_at)}
                        </p>
                        <p className="mt-0.5 inline-flex items-center gap-1 text-[12px] font-medium text-[var(--ink-muted)]">
                          {row.sensor_source === "ESP32" ? (
                            <Radio className="h-3 w-3 text-[var(--forest-700)]" aria-hidden="true" />
                          ) : (
                            <FlaskConical className="h-3 w-3 text-[var(--seal-600)]" aria-hidden="true" />
                          )}
                          <span>{row.sensor_source}</span>
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">{renderSealCell(row)}</td>
                      <td className="whitespace-nowrap px-3.5 py-3 text-right">
                        <MarketSparkline
                          points={row.trend_7d}
                          label={`Tren 7 hari ${row.name}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </BotanicalCard>

          {/* Mobile Stacked Cards (< 768px) */}
          <div className="space-y-3 md:hidden">
            {filteredRows.map((row) => (
              <BotanicalCard key={row.parcel_id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="xb-mono text-[12.5px] font-semibold text-[var(--forest-700)]">
                      {row.parcel_id}
                    </p>
                    <h3 className="xb-display text-[17px] font-bold text-[var(--ink)]">{row.name}</h3>
                    <p className="text-[13.5px] text-[var(--ink-muted)]">{row.zone_name}</p>
                  </div>
                  <CanonicalStatusBadge status={row.status} compact />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2.5 rounded-xl bg-[var(--surface-soft)] p-3 text-[14px]">
                  <div>
                    <p className="text-[12.5px] text-[var(--ink-muted)]">Unit tersedia</p>
                    <p className="xb-numeric font-bold text-[var(--status-verified-ink)]">
                      {formatNumber(row.units_available)} tCO2e
                    </p>
                  </div>
                  <div>
                    <p className="text-[12.5px] text-[var(--ink-muted)]">Unit beku</p>
                    <p className="xb-numeric font-bold text-[var(--status-blocked-ink)]">
                      {formatNumber(row.units_frozen)} tCO2e
                    </p>
                  </div>
                  <div>
                    <p className="text-[12.5px] text-[var(--ink-muted)]">Nilai tersedia</p>
                    <p className="xb-numeric font-bold text-[var(--ink)]">
                      {isGuest ? "Masuk untuk melihat" : formatIdr(row.value_idr)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12.5px] text-[var(--ink-muted)]">Tren 7 hari</p>
                    <div className="mt-0.5">
                      <MarketSparkline points={row.trend_7d} label={`Tren ${row.name}`} />
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  {renderSealCell(row)}
                  <button
                    type="button"
                    onClick={() => setDrawerParcelId(row.parcel_id)}
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-[var(--forest-700)] px-4 text-[14px] font-semibold text-white hover:bg-[var(--forest-800)]"
                  >
                    <span>Detail lahan</span>
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </BotanicalCard>
            ))}
          </div>
        </PageStatePanel>

        {filteredRows.length === 0 && stateParam !== "kosong" && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex min-h-[44px] items-center rounded-full bg-[var(--forest-700)] px-5 text-[15px] font-semibold text-white hover:bg-[var(--forest-800)]"
            >
              Hapus filter
            </button>
          </div>
        )}

        {/* Static Benchmark Disclosure Card (Reference Only) */}
        <BotanicalCard className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--seal-100)] text-[var(--seal-600)]">
              <Info className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="xb-display text-[17px] font-bold text-[var(--ink)]">
                Referensi, bukan harga hutan resmi
              </h2>
              <p className="mt-1 text-[15px] leading-relaxed text-[var(--ink-muted)]">
                Angka berikut dipakai sebagai pembanding konteks: rata-rata IDXCarbon Januari 2026
                sekitar Rp40.000 per ton (hitungan tim; mayoritas proyek sektor energi dan limbah),
                sedangkan acuan kredit REDD+ yurisdiksi berada pada kisaran US$6 sampai US$12 per ton
                (EDF, 2024). Harga di tabel adalah parameter simulasi sementara.
              </p>
            </div>
          </div>
        </BotanicalCard>

        {/* Row Inspection Drawer reusing L2 Panel */}
        <BotanicalDrawer
          open={Boolean(drawerParcel)}
          onOpenChange={(open) => {
            if (!open) setDrawerParcelId(null);
          }}
          title={drawerParcel ? drawerParcel.name : "Detail Lahan"}
          description="Ringkasan status, telemetri sensor, indeks satelit, dan segel digital."
        >
          {drawerParcel && (
            <div className="space-y-4">
              <ParcelInspectionPanel
                parcel={drawerParcel}
                sensors={sensors}
                assessment={aiAssessments.find((a) => a.parcel_id === drawerParcel.id)}
                verification={verificationRecords.find((v) => v.parcel_id === drawerParcel.id)}
                consent={consentRecords.find((c) => c.parcel_id === drawerParcel.id)}
                role={role}
                inDrawer
              />
              <div className="grid grid-cols-2 gap-2.5 border-t border-[var(--line)] pt-4">
                <Link
                  href={`/peta/${encodeURIComponent(drawerParcel.id)}`}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 text-[14.5px] font-semibold text-[var(--ink)] hover:bg-[var(--leaf-100)]"
                >
                  Buka peta
                </Link>
                {!isGuest && (
                  <Link
                    href={`/pasar/${encodeURIComponent(drawerParcel.id)}`}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--forest-700)] px-4 text-[14.5px] font-semibold text-white hover:bg-[var(--forest-800)]"
                  >
                    Buka pasar
                  </Link>
                )}
              </div>
            </div>
          )}
        </BotanicalDrawer>
      </div>
    </BotanicalAppShell>
  );
}

