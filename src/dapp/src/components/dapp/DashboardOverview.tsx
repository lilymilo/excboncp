"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileCheck2,
  FlaskConical,
  Leaf,
  Lock,
  PieChart,
  ShieldCheck,
  Sprout,
  Users,
} from "lucide-react";
import {
  computeRoleNextAction,
  formatWibDateTime,
  formatWibTime,
  getGreetingWib,
  useDashboardData,
  type CardKey,
} from "@/lib/dashboard-api";
import { formatIdr, formatIdrShort, formatNumber } from "@/components/dapp/phantom-ui";
import { BotanicalRoleBadge } from "@/components/dapp/BotanicalAppShell";
import { CardStateFrame } from "@/components/ui/CardStateFrame";
import { HashSeal } from "@/components/dapp/HashSeal";
import { Mascot } from "@/components/mascot/Mascot";
import { SimulationRevenueChart } from "@/components/charts/SimulationRevenueChart";
import { ResultSplitDonut } from "@/components/charts/ResultSplitDonut";
import { LiveNumber, LiveClock, PulseDot } from "@/components/motion";

function MiniBars({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-10 items-end gap-1" aria-hidden="true">
      {values.map((v, i) => {
        const pct = Math.max(22, Math.round((v / max) * 100));
        const active = i === values.length - 1;
        return (
          <span
            key={i}
            style={{ height: `${pct}%` }}
            className={`w-1.5 rounded-full ${
              active ? "bg-[var(--forest-800)]" : "bg-[var(--leaf-300)]"
            }`}
          />
        );
      })}
    </div>
  );
}

function Sparkline({ values, tone = "var(--on-deep)" }: { values: number[]; tone?: string }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 0.1);
  const coords = values.map((v, idx) => {
    const x = (idx / Math.max(values.length - 1, 1)) * 78 + 4;
    const y = 26 - ((v - min) / span) * 18;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width="86" height="32" viewBox="0 0 86 32" aria-hidden="true">
      <polyline
        fill="none"
        stroke={tone}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={coords.join(" ")}
      />
    </svg>
  );
}

export function DashboardOverview() {
  const router = useRouter();
  const {
    user,
    role,
    parcels,
    verificationRecords,
    recentTrades,
    period,
    setPeriod,
    series,
    metrics,
    latencySec,
    roleCardStats,
    getCardState,
    retryCard,
  } = useDashboardData();

  const [sealInput, setSealInput] = useState("");
  const [flashedTxIds, setFlashedTxIds] = useState<string[]>([]);
  const knownTxIdsRef = useRef<Set<string> | null>(null);
  const displayName = user?.name ?? "Tamu Publik";
  const nextAction = computeRoleNextAction(role, parcels);
  const isGuest = role === "guest";

  useEffect(() => {
    const currentIds = recentTrades.map((t) => t.tx_id);
    if (knownTxIdsRef.current === null) {
      knownTxIdsRef.current = new Set(currentIds);
      return;
    }
    const newlyArrived = currentIds.filter((id) => !knownTxIdsRef.current?.has(id));
    if (newlyArrived.length === 0) return;

    newlyArrived.forEach((id) => knownTxIdsRef.current?.add(id));
    setFlashedTxIds((prev) => [...new Set([...prev, ...newlyArrived])]);
    const timer = window.setTimeout(() => {
      setFlashedTxIds((prev) => prev.filter((id) => !newlyArrived.includes(id)));
    }, 1250);
    return () => window.clearTimeout(timer);
  }, [recentTrades]);

  const primaryUnitsValue =
    role === "recipient" ? metrics.recipientUsedUnits : metrics.verifiedUnits;
  const primaryUnitsTitle =
    role === "recipient" ? "Unit Terpakai Zona" : "Unit Terverifikasi";
  const latestSealHash = verificationRecords[0]?.hash;

  const handleCheckSeal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = sealInput.trim() || verificationRecords[0]?.record_id || "VR-001";
    router.push(`/verify?q=${encodeURIComponent(target)}`);
  };

  const statusLegend = [
    { label: "Terverifikasi", count: metrics.statusCounts.VERIFIED, dot: "var(--forest-700)" },
    { label: "Perhatian", count: metrics.statusCounts.WARNING, dot: "var(--status-warning-ink)" },
    { label: "Ditahan", count: metrics.statusCounts.DISPUTE, dot: "var(--status-dispute-ink)" },
    { label: "Blokir", count: metrics.statusCounts.BLOCKED, dot: "var(--status-blocked-ink)" },
  ];

  return (
    <div className="space-y-4">
      <section className="xb-hero xbm-lift px-5 py-5 sm:px-6 sm:py-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/illustrations/forest-canopy.jpg"
          alt=""
          aria-hidden="true"
          className="xb-hero-media"
        />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="xb-eyebrow">
              {isGuest ? "Mode tamu · simulasi testnet" : "Simulasi testnet · MRV hutan"}
            </p>
            <h1 className="xb-hero-title mt-2">
              {getGreetingWib().greeting}, {displayName}
            </h1>
            <p className="xb-hero-sub">{nextAction.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="xb-chip">
              <PulseDot className="text-[var(--forest-700)]" label="Data tersegel" />
              Data tersegel
            </span>
            <span
              className="xb-numeric hidden items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2 text-[13px] font-semibold text-[var(--ink-muted)] md:inline-flex"
              aria-label="Jam WIB"
            >
              <LiveClock />
            </span>
            <Link
              href={nextAction.href}
              className="xb-hero-cta transition-transform duration-150 hover:scale-[1.02] active:scale-95"
            >
              <span>{nextAction.label}</span>
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <div className="flex flex-col items-start gap-4 xl:flex-row">
        <div className="w-full min-w-0 flex-1 space-y-4">
          <section
            aria-label="Indikator utama hutan dan verifikasi"
            className="grid grid-cols-2 items-stretch gap-3 min-[1400px]:grid-cols-4"
          >
            {/* Unit terverifikasi */}
            <div className="xb-kpi xbm-lift">
              <CardStateFrame
                state={getCardState("kpiUnits", parcels.length > 0)}
                onRetry={() => retryCard("kpiUnits" as CardKey)}
                emptyMessage="Belum ada unit tercatat."
                skeletonHeight="h-24"
              >
                <Link
                  href={role === "recipient" ? "/portfolio" : "/market"}
                  className="xb-kpi-body flex h-full flex-col justify-between"
                >
                  <div className="xb-kpi-label">
                    <Leaf className="h-4 w-4 shrink-0 text-[var(--forest-700)]" aria-hidden="true" />
                    <span className="truncate">{primaryUnitsTitle}</span>
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-2">
                    <div>
                      <p className="xb-kpi-value whitespace-nowrap">
                        <LiveNumber
                          value={primaryUnitsValue}
                          format={(v) => formatNumber(Math.round(v))}
                          durationMs={650}
                        />
                        <span className="xb-kpi-unit">tCO2e</span>
                      </p>
                      <p className="xb-numeric mt-2 inline-flex items-center gap-1 whitespace-nowrap text-[12px] font-semibold text-[var(--status-verified-ink)]">
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                        +12%
                      </p>
                    </div>
                    <div className="shrink-0">
                      <MiniBars values={metrics.trend7d} />
                    </div>
                  </div>
                </Link>
              </CardStateFrame>
            </div>

            {/* Status lahan */}
            <div className="xb-kpi xbm-lift">
              <CardStateFrame
                state={getCardState("kpiStatus", parcels.length > 0)}
                onRetry={() => retryCard("kpiStatus")}
                emptyMessage="Belum ada lahan terdaftar."
                skeletonHeight="h-24"
              >
                <Link href="/map" className="xb-kpi-body flex h-full flex-col justify-between">
                  <div className="xb-kpi-label">
                    <Users className="h-4 w-4 shrink-0 text-[var(--forest-700)]" aria-hidden="true" />
                    <span className="truncate">Status Lahan</span>
                  </div>
                  <p className="xb-kpi-value mt-3">
                    <LiveNumber value={parcels.length} format={(v) => String(Math.round(v))} />
                    <span className="xb-kpi-unit">blok</span>
                  </p>
                  <div className="xb-numeric mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] font-semibold">
                    {statusLegend.map((entry) => (
                      <span
                        key={entry.label}
                        title={entry.label}
                        className="inline-flex items-center gap-1 whitespace-nowrap text-[var(--ink-muted)]"
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: entry.dot }}
                          aria-hidden="true"
                        />
                        <span>{entry.count}</span>
                        <span className="sr-only">{entry.label}</span>
                      </span>
                    ))}
                  </div>
                </Link>
              </CardStateFrame>
            </div>

            {/* Bagian komunitas */}
            <div className="xb-kpi xbm-lift">
              <CardStateFrame
                state={getCardState("kpiCommunity", !isGuest)}
                onRetry={() => retryCard("kpiCommunity")}
                emptyMessage="Masuk akun peran untuk melihat alokasi."
                skeletonHeight="h-24"
              >
                <Link href="/portfolio" className="xb-kpi-body flex h-full flex-col justify-between">
                  <div className="xb-kpi-label">
                    <Sprout className="h-4 w-4 shrink-0 text-[var(--forest-700)]" aria-hidden="true" />
                    <span className="truncate">Bagian Komunitas</span>
                  </div>
                  <p
                    title={formatIdr(metrics.totalCommunityToday)}
                    className="xb-kpi-value mt-3 whitespace-nowrap"
                  >
                    <LiveNumber
                      value={metrics.totalCommunityToday}
                      format={(v) => formatIdrShort(Math.round(v))}
                    />
                  </p>
                  <p className="xb-numeric mt-2 inline-flex items-center gap-1 whitespace-nowrap text-[12px] font-semibold text-[var(--status-verified-ink)]">
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />+
                    {metrics.communityDeltaPct}%
                  </p>
                </Link>
              </CardStateFrame>
            </div>

            {/* Satu-satunya panel gelap di layar ini */}
            <div className="xb-kpi xb-deep">
              <CardStateFrame
                state={getCardState("kpiLatency", latencySec > 0)}
                onRetry={() => retryCard("kpiLatency")}
                emptyMessage="Belum ada catatan latensi."
                skeletonHeight="h-24"
              >
                <Link href="/verify" className="xb-kpi-body flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold leading-tight">Dari Data ke Status</span>
                    <Clock className="h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-2">
                    <div>
                      <p className="xb-kpi-value whitespace-nowrap text-[var(--on-deep)]">
                        <LiveNumber
                          value={latencySec}
                          format={(v) => v.toFixed(1).replace(".", ",")}
                        />
                        <span className="ml-1 font-sans text-[12.5px] font-semibold text-[var(--on-deep-muted)]">
                          dtk
                        </span>
                      </p>
                      <p className="xb-deep-label mt-2 whitespace-nowrap text-[12px]">Rata-rata proses</p>
                    </div>
                    <div className="shrink-0">
                      <Sparkline values={metrics.latencySparkline} tone="var(--on-deep)" />
                    </div>
                  </div>
                </Link>
              </CardStateFrame>
            </div>
          </section>

          <section className="xb-card p-5 sm:p-6">
            <CardStateFrame
              state={getCardState("chartRevenue", !isGuest && series.points.length > 0)}
              onRetry={() => retryCard("chartRevenue")}
              emptyMessage={
                isGuest
                  ? "Masuk akun peran untuk melihat grafik pendapatan simulasi."
                  : "Belum ada data grafik pendapatan simulasi."
              }
              skeletonHeight="h-64"
            >
              <SimulationRevenueChart
                period={period}
                onPeriodChange={setPeriod}
                points={series.points}
                unitsSold={series.unitsSold}
                grossIdr={series.grossIdr}
                deltaPct={series.deltaPct}
                marketState={series.marketState}
              />
            </CardStateFrame>
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {/* Rantai segel */}
            <div className="xb-card flex flex-col p-5">
              <CardStateFrame
                state={getCardState("ledgerChain", verificationRecords.length > 0)}
                onRetry={() => retryCard("ledgerChain")}
                emptyMessage="Belum ada entri buku catatan tersegel."
                skeletonHeight="h-44"
              >
                <div>
                  <div className="xb-panel-head">
                    <h2 className="xb-panel-title">
                      <ShieldCheck className="h-[18px] w-[18px] text-[var(--seal-600)]" aria-hidden="true" />
                      Rantai Segel
                    </h2>
                    <Link href="/verify" className="xb-link-quiet">
                      <span>Lihat semua</span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    </Link>
                  </div>

                  <div className="xb-rail mt-4 space-y-1 pl-5">
                    {verificationRecords.map((rec) => {
                      const locked = Boolean(rec.eas_uid);
                      return (
                        <Link
                          key={rec.record_id}
                          href={`/verify?q=${encodeURIComponent(rec.record_id)}`}
                          className="xb-row relative flex items-center justify-between gap-2.5 p-2"
                        >
                          <span
                            aria-hidden="true"
                            className={`absolute -left-5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full border ${
                              locked
                                ? "border-[var(--status-verified-line)] bg-[var(--status-verified-bg)] text-[var(--status-verified-ink)]"
                                : "border-[var(--status-warning-line)] bg-[var(--status-warning-bg)] text-[var(--status-warning-ink)]"
                            }`}
                          >
                            {locked ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <Clock className="h-3.5 w-3.5" />
                            )}
                          </span>

                          <div className="min-w-0 flex-1 pl-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="xb-mono truncate text-[13px] font-medium text-[var(--ink)]">
                                #{rec.hash.slice(0, 8)}
                              </p>
                              <span className="xb-chip shrink-0">Blok #{rec.block_index}</span>
                            </div>
                            <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-[var(--ink-muted)]">
                              <span
                                className={
                                  locked
                                    ? "font-semibold text-[var(--status-verified-ink)]"
                                    : "font-semibold text-[var(--status-warning-ink)]"
                                }
                              >
                                {locked ? "Terverifikasi" : "Dalam Proses"}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="xb-numeric whitespace-nowrap">
                                {formatWibDateTime(rec.timestamp)}
                              </span>
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </CardStateFrame>
            </div>

            {/* Transaksi terakhir */}
            <div className="xb-card flex flex-col p-5">
              <CardStateFrame
                state={getCardState("recentTrades", recentTrades.length > 0)}
                onRetry={() => retryCard("recentTrades")}
                emptyMessage="Belum ada transaksi simulasi tercatat."
                skeletonHeight="h-44"
              >
                <div>
                  <div className="xb-panel-head">
                    <h2 className="xb-panel-title">
                      <FileCheck2 className="h-[18px] w-[18px] text-[var(--forest-700)]" aria-hidden="true" />
                      Transaksi Terakhir
                    </h2>
                    <Link href="/activity" className="xb-link-quiet">
                      <span>Lihat semua</span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    </Link>
                  </div>

                  <div className="mt-2 divide-y divide-[var(--line-subtle)]">
                    {recentTrades.map((tx) => {
                      const isFlashing = flashedTxIds.includes(tx.tx_id);
                      const cleanParcel = tx.parcel_id.toUpperCase();
                      const routeLabel = cleanParcel.includes("A")
                        ? "Lahan A → Zona 1"
                        : cleanParcel.includes("B")
                        ? "Lahan B → Zona 2"
                        : cleanParcel.includes("C")
                        ? "Lahan C → Zona 1"
                        : `${tx.parcel_id} → Zona 1`;

                      return (
                        <div
                          key={tx.tx_id}
                          className={`xb-row flex items-center justify-between gap-2.5 px-2 py-2.5 ${
                            isFlashing ? "xb-tx-flash" : ""
                          }`}
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-2.5">
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--leaf-100)] text-[var(--forest-700)]">
                              <Leaf className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-semibold text-[var(--ink)]">
                                {routeLabel}
                              </p>
                              <p className="xb-numeric whitespace-nowrap text-[11.5px] text-[var(--ink-muted)]">
                                +{tx.volume_tco2e} tCO2e · {formatWibTime(tx.timestamp)}
                              </p>
                            </div>
                          </div>
                          <div className="shrink-0 pl-2 text-right">
                            {!isGuest && (
                              <p className="xb-numeric whitespace-nowrap text-[13px] font-semibold text-[var(--ink)]">
                                {formatIdrShort(tx.gross_amount_idr)}
                              </p>
                            )}
                            <span className="xb-chip mt-0.5">
                              <FlaskConical className="h-2.5 w-2.5" aria-hidden="true" />
                              <span>Simulasi</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardStateFrame>
            </div>
          </section>
        </div>

        <aside
          aria-label="Pembagian hasil, kartu peran, dan cek keaslian"
          className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:w-[320px] xl:shrink-0 xl:grid-cols-1 2xl:w-[348px]"
        >
          <div className="xb-card p-5">
            <CardStateFrame
              state={getCardState("splitShare", !isGuest)}
              onRetry={() => retryCard("splitShare")}
              emptyMessage="Masuk sebagai akun peran untuk melihat detail pembagian hasil."
              skeletonHeight="h-52"
            >
              <div className="xb-panel-head mb-4">
                <h2 className="xb-panel-title">
                  <PieChart className="h-[18px] w-[18px] text-[var(--forest-700)]" aria-hidden="true" />
                  Pembagian Hasil
                </h2>
              </div>
              <ResultSplitDonut
                communityIdr={metrics.activeSettle.community_idr}
                managerIdr={metrics.activeSettle.operations_idr}
                sandboxFeeIdr={metrics.activeSettle.sandbox_fee_idr}
              />
            </CardStateFrame>
          </div>

          <div className="xb-card p-5">
            <CardStateFrame
              state={getCardState("myCard", true)}
              onRetry={() => retryCard("myCard")}
              emptyMessage="Profil akun belum tersedia."
              skeletonHeight="h-44"
            >
              <div className="xb-panel-head">
                <h2 className="xb-panel-title">
                  <ShieldCheck className="h-[18px] w-[18px] text-[var(--seal-600)]" aria-hidden="true" />
                  Kartu Saya
                </h2>
                <Link
                  href="/portfolio"
                  aria-label="Buka ringkasan akun dan bagian hasil"
                  className="grid h-9 w-9 place-items-center rounded-xl text-[var(--ink-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]"
                >
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>

              <div className="mt-4 flex items-center gap-3.5">
                <Mascot
                  variant="avatar"
                  size={60}
                  alt="Avatar maskot orangutan pengguna EXBON CP"
                />
                <div className="min-w-0">
                  <p className="xb-display truncate text-[16.5px] font-semibold text-[var(--ink)]">
                    {displayName}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <BotanicalRoleBadge role={role} />
                  </div>
                  <p className="mt-1 truncate text-[13.5px] text-[var(--ink-muted)]">
                    {roleCardStats.linkedLabel}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[var(--line)] pt-3.5">
                {roleCardStats.items.map((stat) => {
                  const isAlertStat =
                    stat.label === "Perhatian" ||
                    stat.label === "Ditahan" ||
                    stat.label === "Anomali" ||
                    stat.label === "Keberatan";
                  return (
                    <div key={stat.label}>
                      <div className="flex items-center gap-1">
                        {isAlertStat ? (
                          <AlertTriangle
                            className="h-3.5 w-3.5 shrink-0 text-[var(--status-blocked-ink)]"
                            aria-hidden="true"
                          />
                        ) : (
                          <CheckCircle2
                            className="h-3.5 w-3.5 shrink-0 text-[var(--status-verified-ink)]"
                            aria-hidden="true"
                          />
                        )}
                        <p className="xb-numeric font-display text-[19px] font-semibold leading-none text-[var(--ink)]">
                          {stat.value}
                        </p>
                      </div>
                      <p className="mt-1 truncate text-[13px] text-[var(--ink-muted)]">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </CardStateFrame>
          </div>

          <div className="xb-card relative overflow-hidden p-5 md:col-span-2 xl:col-span-1">
            <CardStateFrame
              state={getCardState("verifyCheck", true)}
              onRetry={() => retryCard("verifyCheck")}
              emptyMessage="Layanan cek keaslian belum siap."
              skeletonHeight="h-44"
            >
              <div className="xb-panel-head">
                <h2 className="xb-panel-title">
                  <Lock className="h-[18px] w-[18px] text-[var(--seal-600)]" aria-hidden="true" />
                  Cek Keaslian
                </h2>
              </div>

              <form onSubmit={handleCheckSeal} className="mt-3.5 flex gap-2">
                <label htmlFor="xb-seal-check-input" className="sr-only">
                  Masukkan nomor segel
                </label>
                <input
                  id="xb-seal-check-input"
                  type="text"
                  value={sealInput}
                  onChange={(e) => setSealInput(e.target.value)}
                  placeholder="Nomor segel..."
                  className="xb-mono min-h-[44px] min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-[var(--surface-sunken)] px-3 text-[13.5px] text-[var(--ink)] placeholder:text-[var(--ink-dim)] focus:border-[var(--seal-600)] focus:bg-[var(--surface)] focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl bg-[var(--forest-800)] px-4 text-[14px] font-semibold text-white hover:bg-[var(--forest-900)]"
                >
                  Periksa
                </button>
              </form>

              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[var(--seal-line)] bg-[var(--seal-100)] p-3">
                <HashSeal
                  hash={
                    verificationRecords.find(
                      (v) =>
                        sealInput.trim().length > 0 &&
                        (v.record_id.toLowerCase() === sealInput.trim().toLowerCase() ||
                          v.hash
                            .toLowerCase()
                            .startsWith(sealInput.trim().replace(/^0x/i, "").toLowerCase()))
                    )?.hash ??
                    (/^(0x)?[0-9a-f]{4,}$/i.test(sealInput.trim())
                      ? sealInput.trim()
                      : latestSealHash)
                  }
                  size={52}
                  className="shrink-0"
                />
                <p className="text-[13px] leading-snug text-[var(--ink)]">
                  Ubah satu huruf, segelnya berubah total.
                </p>
              </div>
            </CardStateFrame>
          </div>
        </aside>
      </div>
    </div>
  );
}
