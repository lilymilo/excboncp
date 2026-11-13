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
            className={`w-1.5 rounded-full ${active ? "bg-[#2E6B3F]" : "bg-[#8FCB97]"}`}
          />
        );
      })}
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
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
        stroke="#8FCB97"
        strokeWidth="2.5"
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

  return (
    <div className="space-y-4">
      {/* Main Heading & Tropical Forest Canopy Backdrop matching Reference Mockup */}
      <section className="relative overflow-hidden rounded-[24px] px-1 py-2 sm:px-2 sm:py-3">
        {/* Atmospheric Forest Canopy Background Illustration */}
        <div className="pointer-events-none absolute inset-0 select-none overflow-hidden rounded-[24px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/forest-canopy.jpg"
            alt=""
            className="h-full w-full object-cover object-right opacity-90"
            aria-hidden="true"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#EEF5EC] via-[#EEF5EC]/82 to-transparent"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#EEF5EC] to-transparent"
          />
        </div>

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-[680px]">
            <h1 className="xb-display text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#14261A] sm:text-[40px] xl:text-[44px]">
              Dashboard EXBON CP
            </h1>
            <p className="mt-1.5 text-[16px] font-normal text-[#14261A]/85">
              Pantau kondisi hutan dan aktivitas verifikasi proyek Anda.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:pt-1">
            <span className="inline-flex min-h-[38px] items-center gap-2 rounded-full border border-[#D8E5D4] bg-white/95 px-3.5 py-1.5 text-[14px] font-semibold text-[#17692F] shadow-xs">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2E6B3F]" aria-hidden="true" />
              <span>Simulasi, testnet</span>
            </span>
          </div>
        </div>

        {/* Role Next Action Strip (compact, single-CTA guide without bloat) */}
        <div className="relative mt-4 flex flex-col items-start justify-between gap-3 rounded-2xl border border-[#D8E5D4] bg-white/90 px-4 py-3 sm:flex-row sm:items-center">
          <p className="text-[15.5px] font-medium text-[#14261A]">{nextAction.description}</p>
          <Link
            href={nextAction.href}
            className="inline-flex min-h-[42px] shrink-0 items-center gap-2 rounded-xl bg-[#2E6B3F] px-4 py-2 text-[14.5px] font-semibold text-white hover:bg-[#1F4D2E]"
          >
            <span>{nextAction.label}</span>
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* THREE-PART COMPOSITION: Center Main Workspace + Right Contextual Column */}
      <div className="flex flex-col items-start gap-4 xl:flex-row">
        {/* CENTER WORKSPACE (4 Horizontal KPIs -> Wide Pendapatan Simulasi -> Bottom Rantai Segel + Transaksi) */}
        <div className="w-full min-w-0 flex-1 space-y-4">
          {/* 1. Four Horizontal KPI Cards (2x2 at 1280px xl for comfortable spacing, 4-col at >=1400px) */}
          <section
            aria-label="Indikator utama hutan dan verifikasi"
            className="grid grid-cols-2 items-stretch gap-3 sm:gap-3.5 min-[1400px]:grid-cols-4"
          >
            {/* KPI 1: Unit Terverifikasi */}
            <div className="xb-card xb-card-interactive flex min-h-[140px] flex-col justify-between p-3.5 sm:p-4">
              <CardStateFrame
                state={getCardState("kpiUnits", parcels.length > 0)}
                onRetry={() => retryCard("kpiUnits" as CardKey)}
                emptyMessage="Belum ada unit tercatat."
                skeletonHeight="h-24"
              >
                <Link
                  href={role === "recipient" ? "/portfolio" : "/market"}
                  className="flex h-full flex-col justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#E2F3E6] text-[#17692F]">
                      <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="text-[13px] font-semibold leading-tight text-[#14261A] sm:text-[13.5px]">
                      {primaryUnitsTitle}
                    </span>
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-2">
                    <div>
                      <p className="xb-display xb-numeric whitespace-nowrap text-[22px] font-bold leading-none text-[#14261A] sm:text-[25px]">
                        {formatNumber(primaryUnitsValue)}
                        <span className="ml-1 text-[12.5px] font-semibold text-[#4A5E4F] sm:text-[13.5px]">
                          tCO2e
                        </span>
                      </p>
                      <p className="xb-numeric mt-2 inline-flex items-center gap-1 whitespace-nowrap text-[12px] font-semibold text-[#17692F] sm:text-[12.5px]">
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />+12%
                      </p>
                    </div>
                    <div className="shrink-0">
                      <MiniBars values={metrics.trend7d} />
                    </div>
                  </div>
                </Link>
              </CardStateFrame>
            </div>

            {/* KPI 2: Status Lahan */}
            <div className="xb-card xb-card-interactive flex min-h-[140px] flex-col justify-between p-3.5 sm:p-4">
              <CardStateFrame
                state={getCardState("kpiStatus", parcels.length > 0)}
                onRetry={() => retryCard("kpiStatus")}
                emptyMessage="Belum ada lahan terdaftar."
                skeletonHeight="h-24"
              >
                <Link href="/map" className="flex h-full flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#E2F3E6] text-[#17692F]">
                      <Users className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="text-[13px] font-semibold leading-tight text-[#14261A] sm:text-[13.5px]">
                      Status Lahan
                    </span>
                  </div>
                  <p className="xb-display xb-numeric mt-3 text-[22px] font-bold leading-none text-[#14261A] sm:text-[25px]">
                    {parcels.length}
                  </p>
                  <div className="xb-numeric mt-2 flex items-center gap-2 text-[12px] font-semibold">
                    <span
                      title="Terverifikasi"
                      className="inline-flex items-center gap-1 whitespace-nowrap text-[#17692F]"
                    >
                      <span className="h-2 w-2 rounded-full bg-[#2E6B3F]" aria-hidden="true" />
                      <span>{metrics.statusCounts.VERIFIED}</span>
                      <span className="sr-only">Terverifikasi</span>
                    </span>
                    <span
                      title="Perhatian"
                      className="inline-flex items-center gap-1 whitespace-nowrap text-[#7A5600]"
                    >
                      <span className="h-2 w-2 rounded-full bg-[#E8A520]" aria-hidden="true" />
                      <span>{metrics.statusCounts.WARNING}</span>
                      <span className="sr-only">Perhatian</span>
                    </span>
                    <span
                      title="Ditahan"
                      className="inline-flex items-center gap-1 whitespace-nowrap text-[#9A4400]"
                    >
                      <span className="h-2 w-2 rounded-full bg-[#E06A26]" aria-hidden="true" />
                      <span>{metrics.statusCounts.DISPUTE}</span>
                      <span className="sr-only">Ditahan</span>
                    </span>
                    <span
                      title="Blokir"
                      className="inline-flex items-center gap-1 whitespace-nowrap text-[#B3261E]"
                    >
                      <span className="h-2 w-2 rounded-full bg-[#D84A43]" aria-hidden="true" />
                      <span>{metrics.statusCounts.BLOCKED}</span>
                      <span className="sr-only">Blokir</span>
                    </span>
                  </div>
                </Link>
              </CardStateFrame>
            </div>

            {/* KPI 3: Bagian Komunitas Hari Ini */}
            <div className="xb-card xb-card-interactive flex min-h-[140px] flex-col justify-between p-3.5 sm:p-4">
              <CardStateFrame
                state={getCardState("kpiCommunity", !isGuest)}
                onRetry={() => retryCard("kpiCommunity")}
                emptyMessage="Masuk akun peran untuk melihat alokasi."
                skeletonHeight="h-24"
              >
                <Link href="/portfolio" className="flex h-full flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#E2F3E6] text-[#17692F]">
                      <Sprout className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="text-[13px] font-semibold leading-tight text-[#14261A] sm:text-[13.5px]">
                      Bagian Komunitas
                    </span>
                  </div>
                  <p
                    title={formatIdr(metrics.totalCommunityToday)}
                    className="xb-display xb-numeric mt-3 whitespace-nowrap text-[22px] font-bold leading-none text-[#14261A] sm:text-[25px]"
                  >
                    {formatIdrShort(metrics.totalCommunityToday)}
                  </p>
                  <p className="xb-numeric mt-2 inline-flex items-center gap-1 whitespace-nowrap text-[12px] font-semibold text-[#17692F] sm:text-[12.5px]">
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />+
                    {metrics.communityDeltaPct}%
                  </p>
                </Link>
              </CardStateFrame>
            </div>

            {/* KPI 4: Dari Data ke Status (Single Dark Forest Highlight KPI Card) */}
            <div className="xb-card xb-highlight-gradient xb-card-interactive flex min-h-[140px] flex-col justify-between p-3.5 sm:p-4">
              <CardStateFrame
                state={getCardState("kpiLatency", latencySec > 0)}
                onRetry={() => retryCard("kpiLatency")}
                emptyMessage="Belum ada catatan latensi."
                skeletonHeight="h-24"
              >
                <Link href="/verify" className="flex h-full flex-col justify-between text-white">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold leading-tight text-[#E2F2E5] sm:text-[13.5px]">
                      Dari Data ke Status
                    </span>
                    <Clock className="h-3.5 w-3.5 shrink-0 text-[#E2F2E5]" aria-hidden="true" />
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-2">
                    <div>
                      <p className="xb-display xb-numeric whitespace-nowrap text-[22px] font-bold leading-none text-white sm:text-[25px]">
                        {latencySec.toFixed(1).replace(".", ",")} dtk
                      </p>
                      <p className="mt-2 whitespace-nowrap text-[12px] text-[#E2F2E5] sm:text-[12.5px]">Rata-rata proses</p>
                    </div>
                    <div className="shrink-0">
                      <Sparkline values={metrics.latencySparkline} />
                    </div>
                  </div>
                </Link>
              </CardStateFrame>
            </div>
          </section>

          {/* 2. Wide Analytical Chart Card (Pendapatan Simulasi) */}
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

          {/* 3. Bottom Two Evidence & Trades Cards (Rantai Segel + Transaksi Terakhir) */}
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {/* Rantai Segel */}
            <div className="xb-card flex flex-col justify-between p-4 sm:p-5">
              <CardStateFrame
                state={getCardState("ledgerChain", verificationRecords.length > 0)}
                onRetry={() => retryCard("ledgerChain")}
                emptyMessage="Belum ada entri buku catatan tersegel."
                skeletonHeight="h-44"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <ShieldCheck className="h-5 w-5 shrink-0 text-[#2E6B3F]" aria-hidden="true" />
                      <h2 className="xb-display whitespace-nowrap text-[15px] font-bold text-[#14261A] sm:text-[16.5px]">
                        Rantai Segel
                      </h2>
                    </div>
                    <Link
                      href="/verify"
                      className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[12.5px] font-semibold text-[#14261A] hover:text-[#2E6B3F] sm:text-[13px]"
                    >
                      <span>Lihat Semua</span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    </Link>
                  </div>

                  <div className="relative mt-4 space-y-3 pl-5">
                    {/* Thin vertical timeline connector line */}
                    <span
                      aria-hidden="true"
                      className="absolute bottom-3 left-[11px] top-3 w-[1.5px] bg-[#D8E5D4]"
                    />
                    {verificationRecords.map((rec) => {
                      const locked = Boolean(rec.eas_uid);
                      return (
                        <Link
                          key={rec.record_id}
                          href={`/verify?q=${encodeURIComponent(rec.record_id)}`}
                          className="relative flex items-center justify-between gap-2.5 rounded-xl p-2 transition-colors hover:bg-[#F5F9F3]"
                        >
                          <span
                            aria-hidden="true"
                            className={`absolute -left-5 top-1/2 -translate-y-1/2 grid h-6 w-6 place-items-center rounded-full border ${
                              locked
                                ? "border-[#B7DEC0] bg-[#E2F3E6] text-[#17692F]"
                                : "border-[#E8CE82] bg-[#FFF0C7] text-[#7A5600]"
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
                              <p className="xb-mono text-[13.5px] font-bold text-[#14261A] sm:text-[14px]">
                                #{rec.hash.slice(0, 8)}
                              </p>
                              <span className="shrink-0 rounded-full bg-[#E3EEF9] px-2 py-0.5 text-[11px] font-semibold text-[#1F5A94]">
                                Blok #{rec.block_index}
                              </span>
                            </div>
                            <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-[#4A5E4F] sm:text-[12.5px]">
                              <span className={locked ? "font-semibold text-[#17692F]" : "text-[#7A5600]"}>
                                {locked ? "Terverifikasi" : "Dalam Proses"}
                              </span>
                              <span>·</span>
                              <span className="xb-numeric whitespace-nowrap">{formatWibDateTime(rec.timestamp)}</span>
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </CardStateFrame>
            </div>

            {/* Transaksi Terakhir */}
            <div className="xb-card flex flex-col justify-between p-4 sm:p-5">
              <CardStateFrame
                state={getCardState("recentTrades", recentTrades.length > 0)}
                onRetry={() => retryCard("recentTrades")}
                emptyMessage="Belum ada transaksi simulasi tercatat."
                skeletonHeight="h-44"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <FileCheck2 className="h-5 w-5 shrink-0 text-[#2E6B3F]" aria-hidden="true" />
                      <h2 className="xb-display whitespace-nowrap text-[15px] font-bold text-[#14261A] sm:text-[16.5px]">
                        Transaksi Terakhir
                      </h2>
                    </div>
                    <Link
                      href="/activity"
                      className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[12.5px] font-semibold text-[#14261A] hover:text-[#2E6B3F] sm:text-[13px]"
                    >
                      <span>Lihat Semua</span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    </Link>
                  </div>

                  <div className="mt-3 divide-y divide-[#D8E5D4]">
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
                          className={`flex items-center justify-between gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-[#F5F9F3] ${
                            isFlashing ? "xb-tx-flash" : ""
                          }`}
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-2.5">
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#E2F3E6] text-[#17692F]">
                              <Leaf className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-semibold text-[#14261A] sm:text-[13.5px]">
                                {routeLabel}
                              </p>
                              <p className="xb-numeric whitespace-nowrap text-[11.5px] text-[#4A5E4F] sm:text-[12px]">
                                +{tx.volume_tco2e} tCO2e · {formatWibTime(tx.timestamp)}
                              </p>
                            </div>
                          </div>
                          <div className="shrink-0 pl-2 text-right">
                            {!isGuest && (
                              <p className="xb-numeric whitespace-nowrap text-[13px] font-bold text-[#14261A] sm:text-[13.5px]">
                                {formatIdrShort(tx.gross_amount_idr)}
                              </p>
                            )}
                            <span className="mt-0.5 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-[#E2F3E6] px-2 py-0.5 text-[10.5px] font-semibold text-[#17692F]">
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

        {/* RIGHT CONTEXTUAL COLUMN (Compact at 1280px, expanding at 1440px+) */}
        <aside
          aria-label="Pembagian hasil, kartu peran, dan cek keaslian"
          className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:w-[320px] xl:shrink-0 xl:grid-cols-1 2xl:w-[348px]"
        >
          {/* Card 1: Pembagian Hasil (Full 2-Segment Donut) */}
          <div className="xb-card p-5">
            <CardStateFrame
              state={getCardState("splitShare", !isGuest)}
              onRetry={() => retryCard("splitShare")}
              emptyMessage="Masuk sebagai akun peran untuk melihat detail pembagian hasil."
              skeletonHeight="h-52"
            >
              <div className="mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-[#2E6B3F]" aria-hidden="true" />
                <h2 className="xb-display text-[17.5px] font-bold text-[#14261A]">
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

          {/* Card 2: Kartu Saya */}
          <div className="xb-card p-5">
            <CardStateFrame
              state={getCardState("myCard", true)}
              onRetry={() => retryCard("myCard")}
              emptyMessage="Profil akun belum tersedia."
              skeletonHeight="h-44"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[#2E6B3F]" aria-hidden="true" />
                  <h2 className="xb-display text-[17.5px] font-bold text-[#14261A]">
                    Kartu Saya
                  </h2>
                </div>
                <Link
                  href="/portfolio"
                  aria-label="Buka ringkasan akun dan bagian hasil"
                  className="grid h-9 w-9 place-items-center rounded-xl text-[#4A5E4F] hover:bg-[#F5F9F3] hover:text-[#14261A]"
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
                  <p className="xb-display truncate text-[17px] font-bold text-[#14261A]">
                    {displayName}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <BotanicalRoleBadge role={role} />
                  </div>
                  <p className="mt-1 truncate text-[14px] text-[#4A5E4F]">
                    {roleCardStats.linkedLabel}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#D8E5D4] pt-3.5">
                {roleCardStats.items.map((stat, idx) => {
                  const isAlertStat =
                    stat.label === "Perhatian" ||
                    stat.label === "Ditahan" ||
                    stat.label === "Anomali" ||
                    stat.label === "Keberatan";
                  return (
                    <div key={stat.label}>
                      <div className="flex items-center gap-1">
                        {isAlertStat ? (
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[#B3261E]" aria-hidden="true" />
                        ) : idx === 1 ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#17692F]" aria-hidden="true" />
                        ) : (
                          <Leaf className="h-3.5 w-3.5 shrink-0 text-[#2E6B3F]" aria-hidden="true" />
                        )}
                        <p className="xb-display xb-numeric text-[20px] font-bold leading-none text-[#14261A]">
                          {stat.value}
                        </p>
                      </div>
                      <p className="mt-1 truncate text-[14px] text-[#4A5E4F]">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </CardStateFrame>
          </div>

          {/* Card 3: Cek Keaslian */}
          <div className="xb-card relative overflow-hidden p-5 md:col-span-2 xl:col-span-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/illustrations/botanical-leaves.svg"
              alt=""
              className="pointer-events-none absolute -bottom-1 -right-1 h-16 w-24 select-none object-contain"
              aria-hidden="true"
            />
            <CardStateFrame
              state={getCardState("verifyCheck", true)}
              onRetry={() => retryCard("verifyCheck")}
              emptyMessage="Layanan cek keaslian belum siap."
              skeletonHeight="h-44"
            >
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-[#2E6B3F]" aria-hidden="true" />
                <h2 className="xb-display text-[17.5px] font-bold text-[#14261A]">
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
                  placeholder="Masukkan nomor segel..."
                  className="xb-mono min-h-[44px] min-w-0 flex-1 rounded-xl border border-[#D8E5D4] bg-[#F5F9F3] px-3 text-[14px] text-[#14261A] placeholder:text-[#4A5E4F] focus:border-[#2E6B3F] focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl bg-[#2E6B3F] px-4 text-[14.5px] font-semibold text-white hover:bg-[#1F4D2E]"
                >
                  Periksa
                </button>
              </form>

              <div className="relative mt-4 flex items-center gap-3 rounded-2xl border border-[#D8E5D4] bg-[#EEF5EC] p-3">
                <HashSeal
                  hash={
                    verificationRecords.find(
                      (v) =>
                        sealInput.trim().length > 0 &&
                        (v.record_id.toLowerCase() === sealInput.trim().toLowerCase() ||
                          v.hash.toLowerCase().startsWith(sealInput.trim().replace(/^0x/i, "").toLowerCase()))
                    )?.hash ??
                    (/^(0x)?[0-9a-f]{4,}$/i.test(sealInput.trim())
                      ? sealInput.trim()
                      : latestSealHash)
                  }
                  size={52}
                  className="shrink-0"
                />
                <p className="text-[14px] leading-snug text-[#14261A]">
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
