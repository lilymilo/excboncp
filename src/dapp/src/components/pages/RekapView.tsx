"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Radio,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { BotanicalAppShell } from "@/components/dapp/BotanicalAppShell";
import {
  BOTANICAL_CHART_COLORS,
  ChartBenchmarkBar,
  FinancialChartTooltip,
  computeSeriesBenchmarks,
  formatCompactIdrAxis,
} from "@/components/charts/ChartPrimitives";
import {
  BotanicalCard,
  BotanicalPageHeader,
  PageStatePanel,
  RoleRestrictedNotice,
  SimulasiBadge,
} from "@/components/dapp/BotanicalPrimitives";
import { useDashboardState } from "@/components/dapp/useDashboardStore";
import { normalizeUserRole } from "@/context/DappContext";
import {
  PERIOD_LABELS,
  formatPeriodHeading,
  getWibTodayIso,
  normalizePeriodKey,
  shiftPeriodDate,
  type ReportPeriodKey,
} from "@/lib/copy";
import { buildReportSummary } from "@/lib/exbon-api";
import { formatWibTime } from "@/lib/dashboard-helpers";
import { formatIdr, formatNumber } from "@/components/dapp/phantom-ui";
import { LiveNumber } from "@/components/motion";
import { Pagination } from "@/components/ui/Pagination";

const TX_PAGE_SIZE = 10;

function DeltaIndicator({ current, prev }: { current: number; prev: number | null }) {
  if (prev === null || prev === 0) {
    return <p className="font-telemetry text-[11.5px] font-semibold text-[var(--ink-muted)]">tetap</p>;
  }
  const pct = Math.round(((current - prev) / prev) * 100);
  const sign = pct > 0 ? "+" : "";
  const isUp = pct >= 0;
  return (
    <p
      className={`font-telemetry flex items-center gap-1 text-[11.5px] font-semibold leading-none ${
        isUp ? "text-[var(--status-verified-ink)]" : "text-[var(--status-dispute-ink)]"
      }`}
    >
      <TrendingUp className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span>
        {sign}
        {pct}% vs lalu
      </span>
    </p>
  );
}

export function RekapView({ initialPeriod }: { initialPeriod?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stateParam = searchParams.get("state");
  const todayWib = useMemo(() => getWibTodayIso(), []);
  const dateParam = searchParams.get("tanggal") || todayWib;

  const {
    user,
    parcels,
    sensors,
    consentRecords,
    verificationRecords,
    transactions,
    isLoading,
  } = useDashboardState();

  const role = normalizeUserRole(user?.role, user?.email);
  const periodKey: ReportPeriodKey = normalizePeriodKey(initialPeriod);
  const [showAllTx, setShowAllTx] = useState(false);
  const [txPage, setTxPage] = useState(1);
  useEffect(() => setTxPage(1), [periodKey, dateParam]);

  const report = useMemo(
    () =>
      buildReportSummary({
        period: periodKey,
        isoDate: dateParam,
        parcels,
        transactions,
        sensors,
        consentRecords,
        verificationRecords,
      }),
    [periodKey, dateParam, parcels, transactions, sensors, consentRecords, verificationRecords]
  );

  const bucketStats = useMemo(
    () =>
      computeSeriesBenchmarks(
        report.buckets.map((b) => ({
          grossIdr: b.gross,
        }))
      ),
    [report.buckets]
  );
  const totalTxPages = Math.max(1, Math.ceil(report.transactions.length / TX_PAGE_SIZE));
  const safeTxPage = Math.min(txPage, totalTxPages);
  const visibleTransactions = report.transactions.slice((safeTxPage - 1) * TX_PAGE_SIZE, safeTxPage * TX_PAGE_SIZE);
  useEffect(() => {
    if (txPage > totalTxPages) setTxPage(totalTxPages);
  }, [txPage, totalTxPages]);

  if (role === "guest") {
    return (
      <BotanicalAppShell>
        <RoleRestrictedNotice reason="Rekap berkala transaksi dan pembagian hasil simulasi hanya tersedia untuk pengguna yang sudah masuk." />
      </BotanicalAppShell>
    );
  }

  const nextDate = shiftPeriodDate(periodKey, dateParam, 1);
  const prevDate = shiftPeriodDate(periodKey, dateParam, -1);
  const canGoNext = nextDate <= todayWib;

  const currentPeriodButtonLabel =
    periodKey === "harian"
      ? "Hari ini"
      : periodKey === "mingguan"
      ? "Minggu ini"
      : periodKey === "bulanan"
      ? "Bulan ini"
      : "Tahun ini";

  const navigatePeriod = (nextPeriod: ReportPeriodKey, targetDate = dateParam) => {
    const qs = targetDate ? `?tanggal=${encodeURIComponent(targetDate)}` : "";
    router.push(`/rekap/${nextPeriod}${qs}`);
  };

  const pageState: "loading" | "empty" | "error" | "ready" =
    isLoading || stateParam === "memuat"
      ? "loading"
      : stateParam === "gagal"
      ? "error"
      : !report.hasData || stateParam === "kosong"
      ? "empty"
      : "ready";

  const headingDate = formatPeriodHeading(periodKey, dateParam);

  return (
    <BotanicalAppShell>
      <div className="space-y-5">
        <BotanicalPageHeader
          title={`Rekap ${PERIOD_LABELS[periodKey]} · ${headingDate}`}
          description="Ringkasan performa unit serapan, pendapatan simulasi, kejadian lapangan, dan pembagian hasil komunitas maupun pengelola untuk dibaca langsung di layar."
          showSimulation
        />

        {/* Period Tabs + Chronological Date Controls (Apple Segmented Control & Aligned Buttons) */}
        <BotanicalCard className="p-3 sm:p-3.5 rounded-[16px] border border-[var(--line-subtle)] shadow-xs">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div
              role="tablist"
              aria-label="Pilih periode rekap"
              className="flex items-center p-1 rounded-[12px] bg-[var(--surface-sunken)] border border-[var(--line-subtle)] gap-1 overflow-x-auto"
            >
              {(["harian", "mingguan", "bulanan", "tahunan"] as ReportPeriodKey[]).map((key) => {
                const active = key === periodKey;
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => navigatePeriod(key)}
                    className={`min-h-[34px] flex-1 sm:flex-initial px-3.5 text-[13px] font-semibold rounded-[8px] transition-all active:scale-[0.98] ${
                      active
                        ? "bg-[var(--surface)] text-[var(--ink)] shadow-xs"
                        : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {PERIOD_LABELS[key]}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                aria-label="Periode sebelumnya"
                onClick={() => navigatePeriod(periodKey, prevDate)}
                className="inline-flex min-h-[34px] items-center gap-1 rounded-[9px] border border-[var(--line-subtle)] bg-[var(--surface)] px-3 text-[13px] font-semibold text-[var(--ink)] transition-all hover:bg-[var(--surface-soft)] active:scale-[0.98]"
              >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Sebelumnya</span>
              </button>

              <button
                type="button"
                onClick={() => navigatePeriod(periodKey, todayWib)}
                className="inline-flex min-h-[34px] items-center rounded-[9px] border border-[var(--line-subtle)] bg-[var(--leaf-100)] px-3 text-[13px] font-semibold text-[var(--forest-800)] transition-all hover:bg-[var(--selection-bg)] active:scale-[0.98]"
              >
                {currentPeriodButtonLabel}
              </button>

              <button
                type="button"
                aria-label="Periode berikutnya"
                disabled={!canGoNext}
                onClick={() => navigatePeriod(periodKey, nextDate)}
                className="inline-flex min-h-[34px] items-center gap-1 rounded-[9px] border border-[var(--line-subtle)] bg-[var(--surface)] px-3 text-[13px] font-semibold text-[var(--ink)] transition-all hover:bg-[var(--surface-soft)] disabled:opacity-40 active:scale-[0.98]"
              >
                <span>Berikutnya</span>
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {report.isSimulatedSeed && (
            <p className="mt-3 border-t border-[var(--line-subtle)] pt-2.5 text-[12.5px] text-[var(--ink-muted)]">
              Catatan periode: rekap {PERIOD_LABELS[periodKey].toLowerCase()} ini menggabungkan data
              simulasi dari skrip seed lingkungan uji.
            </p>
          )}
        </BotanicalCard>

        <PageStatePanel
          state={pageState}
          onRetry={() => navigatePeriod(periodKey, todayWib)}
          allowMascot
          emptyTitle="Belum ada transaksi pada periode ini"
          emptyDescription="Tanggal yang dipilih belum memiliki catatan transaksi atau kejadian lapangan. Kembali ke periode terakhir yang berisi data."
          emptyActionHref={`/rekap/${periodKey}?tanggal=${encodeURIComponent(todayWib)}`}
          emptyActionLabel={`Buka ${currentPeriodButtonLabel.toLowerCase()}`}
        >
          {/* 6 Summary KPIs with concentric borders, uniform baselines, and even spacing */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <BotanicalCard interactive className="rounded-[14px] border border-[var(--line-subtle)] bg-[var(--surface)] p-3.5 sm:p-4 shadow-xs flex flex-col justify-between min-h-[112px] transition-all hover:border-[var(--forest-700)]/30 active:scale-[0.98]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)] truncate">Transaksi</p>
                <p className="font-display font-bold text-[19px] sm:text-[20px] tracking-tight text-[var(--ink)] tabular-nums leading-none mt-2">
                  <LiveNumber
                    value={report.totals.trades}
                    format={(v) => formatNumber(Math.round(v))}
                  />
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-[var(--line-subtle)]/60">
                <DeltaIndicator
                  current={report.totals.trades}
                  prev={report.prev_totals?.trades ?? null}
                />
              </div>
            </BotanicalCard>

            <BotanicalCard interactive className="rounded-[14px] border border-[var(--line-subtle)] bg-[var(--surface)] p-3.5 sm:p-4 shadow-xs flex flex-col justify-between min-h-[112px] transition-all hover:border-[var(--forest-700)]/30 active:scale-[0.98]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)] truncate">Unit terjual</p>
                <p className="font-display font-bold text-[19px] sm:text-[20px] tracking-tight text-[var(--status-verified-ink)] tabular-nums leading-none mt-2">
                  <LiveNumber
                    value={report.totals.units_sold}
                    format={(v) => formatNumber(Math.round(v))}
                  />{" "}
                  <span className="text-[12px] font-semibold text-[var(--ink-muted)]">t</span>
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-[var(--line-subtle)]/60">
                <DeltaIndicator
                  current={report.totals.units_sold}
                  prev={report.prev_totals?.units_sold ?? null}
                />
              </div>
            </BotanicalCard>

            <BotanicalCard interactive className="rounded-[14px] border border-[var(--line-subtle)] bg-[var(--surface)] p-3.5 sm:p-4 shadow-xs flex flex-col justify-between min-h-[112px] transition-all hover:border-[var(--forest-700)]/30 active:scale-[0.98]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)] truncate">Pendapatan</p>
                <p className="font-display font-bold text-[18px] sm:text-[19px] tracking-tight text-[var(--ink)] tabular-nums leading-none mt-2 truncate">
                  <LiveNumber value={report.totals.gross} format={formatIdr} />
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-[var(--line-subtle)]/60">
                <DeltaIndicator
                  current={report.totals.gross}
                  prev={report.prev_totals?.gross ?? null}
                />
              </div>
            </BotanicalCard>

            <BotanicalCard interactive className="rounded-[14px] border border-[var(--line-subtle)] bg-[var(--surface)] p-3.5 sm:p-4 shadow-xs flex flex-col justify-between min-h-[112px] transition-all hover:border-[var(--forest-700)]/30 active:scale-[0.98]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)] truncate">
                  Komunitas (60%)
                </p>
                <p className="font-display font-bold text-[18px] sm:text-[19px] tracking-tight text-[var(--status-verified-ink)] tabular-nums leading-none mt-2 truncate">
                  <LiveNumber value={report.totals.community} format={formatIdr} />
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-[var(--line-subtle)]/60">
                <DeltaIndicator
                  current={report.totals.community}
                  prev={report.prev_totals?.community ?? null}
                />
              </div>
            </BotanicalCard>

            <BotanicalCard interactive className="rounded-[14px] border border-[var(--line-subtle)] bg-[var(--surface)] p-3.5 sm:p-4 shadow-xs flex flex-col justify-between min-h-[112px] transition-all hover:border-[var(--forest-700)]/30 active:scale-[0.98]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)] truncate">
                  Pengelola (40%)
                </p>
                <p className="font-display font-bold text-[18px] sm:text-[19px] tracking-tight text-[var(--forest-800)] tabular-nums leading-none mt-2 truncate">
                  <LiveNumber value={report.totals.manager} format={formatIdr} />
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-[var(--line-subtle)]/60">
                <DeltaIndicator
                  current={report.totals.manager}
                  prev={report.prev_totals?.manager ?? null}
                />
              </div>
            </BotanicalCard>

            <BotanicalCard interactive className="rounded-[14px] border border-[var(--line-subtle)] bg-[var(--surface)] p-3.5 sm:p-4 shadow-xs flex flex-col justify-between min-h-[112px] transition-all hover:border-[var(--forest-700)]/30 active:scale-[0.98]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)] truncate">Unit beku</p>
                <p className="font-display font-bold text-[19px] sm:text-[20px] tracking-tight text-[var(--status-blocked-ink)] tabular-nums leading-none mt-2">
                  <LiveNumber
                    value={report.totals.units_frozen}
                    format={(v) => formatNumber(Math.round(v))}
                  />{" "}
                  <span className="text-[12px] font-semibold text-[var(--ink-muted)]">t</span>
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-[var(--line-subtle)]/60">
                <DeltaIndicator
                  current={report.totals.units_frozen}
                  prev={report.prev_totals?.units_frozen ?? null}
                />
              </div>
            </BotanicalCard>
          </div>

          {/* Revenue Bar Chart + Key Events (Consistent Padding & Inset Elements) */}
          <div className="grid gap-4 xl:grid-cols-12 items-stretch">
            <BotanicalCard className="flex flex-col justify-between p-5 xl:col-span-7 rounded-[16px] border border-[var(--line-subtle)] shadow-xs">
              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="font-display text-[16px] font-bold tracking-tight text-[var(--ink)]">
                      Grafik Pendapatan per{" "}
                      {periodKey === "harian"
                        ? "Jam"
                        : periodKey === "tahunan"
                        ? "Bulan"
                        : "Hari"}
                    </h2>
                    <p className="text-[13px] text-[var(--ink-muted)] mt-0.5">
                      Nilai rupiah simulasi beserta jumlah unit per titik observasi.
                    </p>
                  </div>
                </div>
                <div
                  className="xb-financial-chart h-[215px] w-full"
                  aria-label={`Grafik batang pendapatan simulasi periode ${PERIOD_LABELS[periodKey]} total ${formatIdr(report.totals.gross)}`}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={report.buckets}
                      margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="xbRekapBarGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={BOTANICAL_CHART_COLORS.line} stopOpacity={0.95} />
                          <stop offset="100%" stopColor={BOTANICAL_CHART_COLORS.forest700} stopOpacity={0.72} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        stroke={BOTANICAL_CHART_COLORS.grid}
                        strokeDasharray="3 3"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: BOTANICAL_CHART_COLORS.inkMuted, fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tickFormatter={(val) => formatCompactIdrAxis(Number(val))}
                        tick={{ fill: BOTANICAL_CHART_COLORS.inkMuted, fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        width={60}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(226, 242, 229, 0.45)" }}
                        content={<FinancialChartTooltip contextTag="Rekap Periode" />}
                      />
                      <Bar
                        dataKey="gross"
                        fill="url(#xbRekapBarGradient)"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                        isAnimationActive={false}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mt-3.5 pt-3 border-t border-[var(--line-subtle)]">
                <ChartBenchmarkBar stats={bucketStats} />
              </div>
            </BotanicalCard>

            <BotanicalCard className="flex flex-col justify-between p-5 xl:col-span-5 rounded-[16px] border border-[var(--line-subtle)] shadow-xs">
              <div>
                <h2 className="font-display text-[16px] font-bold tracking-tight text-[var(--ink)]">
                  Kejadian Penting
                </h2>
                <p className="mt-0.5 text-[13px] text-[var(--ink-muted)]">
                  Pembaruan status, sensor, izin warga, dan segel pada periode ini.
                </p>
                <ul className="mt-3 space-y-2">
                  {report.events.slice(0, 4).map((ev) => (
                    <li key={ev.id}>
                      <Link
                        href={ev.href}
                        className="flex min-h-[42px] items-start justify-between gap-2.5 rounded-[12px] border border-[var(--line-subtle)] bg-[var(--surface-soft)] px-3 py-2.5 transition-all hover:bg-[var(--surface-sunken)] active:scale-[0.99]"
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          {ev.type === "seal" ? (
                            <ShieldCheck
                              className="mt-0.5 h-4 w-4 shrink-0 text-[var(--seal-600)]"
                              aria-hidden="true"
                            />
                          ) : ev.type === "sensor" ? (
                            <AlertTriangle
                              className="mt-0.5 h-4 w-4 shrink-0 text-[var(--status-warning-ink)]"
                              aria-hidden="true"
                            />
                          ) : (
                            <Radio
                              className="mt-0.5 h-4 w-4 shrink-0 text-[var(--forest-700)]"
                              aria-hidden="true"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-telemetry text-[11.5px] font-semibold text-[var(--ink-muted)]">
                              {formatWibTime(ev.ts)} · {ev.parcel_id}
                            </p>
                            <p className="line-clamp-1 text-[13px] font-medium text-[var(--ink)]">{ev.text}</p>
                          </div>
                        </div>
                        <ArrowUpRight
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--ink-muted)]"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-3.5 border-t border-[var(--line-subtle)] pt-3 text-[12px] text-[var(--ink-muted)]">
                Menampilkan {Math.min(4, report.events.length)} dari {report.events.length} catatan kejadian.
              </div>
            </BotanicalCard>
          </div>

          {/* Breakdown Cards: Per Lahan & Per Zona (Inset Grouped Tables with Balanced Vertical Weight) */}
          <div className="grid gap-5 lg:grid-cols-2 items-start">
            <BotanicalCard className="overflow-hidden p-5 rounded-[16px] border border-[var(--line-subtle)] shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-[16px] font-bold tracking-tight text-[var(--ink)]">
                    Rincian per Lahan
                  </h2>
                  <p className="text-[12.5px] text-[var(--ink-muted)] mt-0.5">
                    {report.by_parcel.length} lahan aktif terdata pada periode ini
                  </p>
                </div>
              </div>
              <div className="mt-3 hidden overflow-x-auto rounded-[12px] border border-[var(--line-subtle)] bg-[var(--surface-soft)] md:block">
                <table className="w-full border-collapse text-left text-[14px]">
                  <thead>
                    <tr className="border-b border-[var(--line-subtle)] bg-[var(--surface-sunken)]/60 text-[11.5px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                      <th scope="col" className="px-3.5 py-2.5">Lahan</th>
                      <th scope="col" className="px-3 py-2.5 text-right">Unit</th>
                      <th scope="col" className="px-3 py-2.5 text-right">Pendapatan</th>
                      <th scope="col" className="px-3.5 py-2.5 text-right">Bagian komunitas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line-subtle)]">
                    {report.by_parcel.map((row) => (
                      <tr key={row.parcel_id} className="transition-colors hover:bg-[var(--surface)]">
                        <td className="px-3.5 py-2.5 font-medium">
                          <Link
                            href={`/peta/${encodeURIComponent(row.parcel_id)}`}
                            className="font-semibold text-[var(--forest-800)] hover:underline"
                          >
                            {row.name}
                          </Link>
                        </td>
                        <td className="font-telemetry px-3 py-2.5 text-right text-[13px] font-medium text-[var(--ink)]">
                          {formatNumber(row.units)} t
                        </td>
                        <td className="font-telemetry px-3 py-2.5 text-right text-[13px] text-[var(--ink)]">
                          {formatIdr(row.gross)}
                        </td>
                        <td className="font-telemetry px-3.5 py-2.5 text-right text-[13px] font-semibold text-[var(--status-verified-ink)]">
                          {formatIdr(row.community)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 space-y-2 md:hidden">
                {report.by_parcel.map((row) => (
                  <div
                    key={row.parcel_id}
                    className="rounded-[12px] border border-[var(--line-subtle)] bg-[var(--surface-soft)] p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        href={`/peta/${encodeURIComponent(row.parcel_id)}`}
                        className="font-semibold text-[13.5px] text-[var(--forest-800)] hover:underline"
                      >
                        {row.name}
                      </Link>
                      <span className="font-telemetry text-[13px] font-semibold text-[var(--ink)]">
                        {formatNumber(row.units)} t
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[12.5px]">
                      <div>
                        <p className="text-[var(--ink-muted)]">Pendapatan</p>
                        <p className="font-telemetry font-semibold text-[var(--ink)]">
                          {formatIdr(row.gross)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[var(--ink-muted)]">Komunitas</p>
                        <p className="font-telemetry font-bold text-[var(--status-verified-ink)]">
                          {formatIdr(row.community)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BotanicalCard>

            <BotanicalCard className="overflow-hidden p-5 rounded-[16px] border border-[var(--line-subtle)] shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-[16px] font-bold tracking-tight text-[var(--ink)]">
                    Rincian per Zona
                  </h2>
                  <p className="text-[12.5px] text-[var(--ink-muted)] mt-0.5">
                    {report.by_zone.length} zona alokasi aktif terdata pada periode ini
                  </p>
                </div>
              </div>
              <div className="mt-3 hidden overflow-x-auto rounded-[12px] border border-[var(--line-subtle)] bg-[var(--surface-soft)] md:block">
                <table className="w-full border-collapse text-left text-[14px]">
                  <thead>
                    <tr className="border-b border-[var(--line-subtle)] bg-[var(--surface-sunken)]/60 text-[11.5px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                      <th scope="col" className="px-3.5 py-2.5">Zona</th>
                      <th scope="col" className="px-3 py-2.5 text-right">Unit</th>
                      <th scope="col" className="px-3 py-2.5 text-right">Pendapatan</th>
                      <th scope="col" className="px-3.5 py-2.5 text-right">Bagian komunitas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line-subtle)]">
                    {report.by_zone.map((row) => (
                      <tr key={row.zone_id} className="transition-colors hover:bg-[var(--surface)]">
                        <td className="px-3.5 py-2.5 font-semibold text-[var(--ink)]">{row.name}</td>
                        <td className="font-telemetry px-3 py-2.5 text-right text-[13px] font-medium text-[var(--ink)]">
                          {formatNumber(row.units)} t
                        </td>
                        <td className="font-telemetry px-3 py-2.5 text-right text-[13px] text-[var(--ink)]">
                          {formatIdr(row.gross)}
                        </td>
                        <td className="font-telemetry px-3.5 py-2.5 text-right text-[13px] font-semibold text-[var(--status-verified-ink)]">
                          {formatIdr(row.community)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Informative summary note so the card has balanced visual weight without empty space */}
              <div className="mt-3.5 rounded-[12px] border border-[var(--line-subtle)] bg-[var(--surface-soft)] p-3 text-[12.5px] text-[var(--ink-muted)]">
                <p className="font-semibold text-[var(--ink)]">Distribusi Alokasi Zona Kepatuhan</p>
                <p className="mt-0.5 leading-relaxed">
                  Seluruh unit serapan terserap disalurkan sesuai regulasi dan kuota mitigasi emisi industri zona terkait.
                </p>
              </div>

              <div className="mt-3 space-y-2 md:hidden">
                {report.by_zone.map((row) => (
                  <div
                    key={row.zone_id}
                    className="rounded-[12px] border border-[var(--line-subtle)] bg-[var(--surface-soft)] p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[13.5px] text-[var(--ink)]">{row.name}</span>
                      <span className="font-telemetry text-[13px] font-semibold text-[var(--ink)]">
                        {formatNumber(row.units)} t
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[12.5px]">
                      <div>
                        <p className="text-[var(--ink-muted)]">Pendapatan</p>
                        <p className="font-telemetry font-semibold text-[var(--ink)]">
                          {formatIdr(row.gross)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[var(--ink-muted)]">Komunitas</p>
                        <p className="font-telemetry font-bold text-[var(--status-verified-ink)]">
                          {formatIdr(row.community)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BotanicalCard>
          </div>

          {/* Expandable Transaction List (Concentric Inset Container) */}
          <BotanicalCard className="overflow-hidden rounded-[16px] border border-[var(--line-subtle)] shadow-xs">
            <button
              type="button"
              aria-expanded={showAllTx}
              onClick={() => setShowAllTx((v) => !v)}
              className="flex min-h-[48px] w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-[var(--surface-soft)] active:scale-[0.99]"
            >
              <div>
                <p className="font-display text-[15px] font-bold tracking-tight text-[var(--ink)]">
                  Semua transaksi periode ini ({report.transactions.length})
                </p>
                <p className="text-[13px] text-[var(--ink-muted)]">
                  Rincian baris per baris siap diperiksa langsung di layar
                </p>
              </div>
              {showAllTx ? (
                <ChevronUp className="h-4 w-4 text-[var(--ink-muted)]" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--ink-muted)]" aria-hidden="true" />
              )}
            </button>

            {showAllTx && (
              <div className="border-t border-[var(--line-subtle)] p-4 pt-1">
                <div className="hidden overflow-x-auto rounded-[12px] border border-[var(--line-subtle)] bg-[var(--surface-soft)] md:block">
                  <table className="w-full border-collapse text-left text-[14px]">
                    <thead>
                      <tr className="border-b border-[var(--line-subtle)] bg-[var(--surface-sunken)]/60 text-[11.5px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                        <th scope="col" className="px-4 py-2.5">Jam WIB</th>
                        <th scope="col" className="px-4 py-2.5">Lahan ke Zona</th>
                        <th scope="col" className="px-4 py-2.5 text-right">Unit</th>
                        <th scope="col" className="px-4 py-2.5 text-right">Nilai kotor</th>
                        <th scope="col" className="px-4 py-2.5 text-right">Komunitas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--line-subtle)]">
                      {visibleTransactions.map((tx) => (
                        <tr key={tx.id} className="transition-colors hover:bg-[var(--surface)]">
                          <td className="font-telemetry px-4 py-2.5 text-[12.5px] text-[var(--ink-muted)]">
                            {formatWibTime(tx.ts)}
                          </td>
                          <td className="px-4 py-2.5 font-medium text-[var(--ink)]">
                            {tx.parcel_id} ke {tx.zone_name}
                          </td>
                          <td className="font-telemetry px-4 py-2.5 text-right font-semibold text-[var(--status-verified-ink)]">
                            +{formatNumber(tx.units)} t
                          </td>
                          <td className="font-telemetry px-4 py-2.5 text-right text-[13px] text-[var(--ink)]">
                            {formatIdr(tx.total_idr)}
                          </td>
                          <td className="font-telemetry px-4 py-2.5 text-right text-[13px] font-semibold text-[var(--status-verified-ink)]">
                            {formatIdr(tx.community_idr)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="divide-y divide-[var(--line-subtle)] rounded-[12px] border border-[var(--line-subtle)] bg-[var(--surface-soft)] md:hidden">
                  {visibleTransactions.map((tx) => (
                    <div key={tx.id} className="p-3.5 text-[13.5px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-[var(--ink)]">
                          {tx.parcel_id} ke {tx.zone_name}
                        </span>
                        <span className="font-telemetry font-bold text-[var(--status-verified-ink)]">
                          +{formatNumber(tx.units)} t
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2 text-[12.5px] text-[var(--ink-muted)]">
                        <span className="font-telemetry">{formatWibTime(tx.ts)}</span>
                        <span className="font-telemetry font-semibold text-[var(--ink)]">
                          {formatIdr(tx.total_idr)} (Komunitas {formatIdr(tx.community_idr)})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <Pagination page={safeTxPage} pageSize={TX_PAGE_SIZE} totalItems={report.transactions.length} onPageChange={setTxPage} label="Halaman rincian transaksi" className="mt-3" />
              </div>
            )}
          </BotanicalCard>
        </PageStatePanel>
      </div>
    </BotanicalAppShell>
  );
}
