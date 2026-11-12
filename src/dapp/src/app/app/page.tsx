"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Leaf,
  Map as MapIcon,
  Radio,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { normalizeUserRole, PRICE_PER_TON, type UserRole } from "@/context/DappContext";
import { AppShell } from "@/components/dapp/AppShell";
import { CarbonMap } from "@/components/dapp/CarbonMap";
import { ParcelNdviChart, ParcelSupplyChart } from "@/components/dapp/CarbonCharts";
import {
  BotanicalSpiritMark,
  CoinsPlusIcon,
  CollectiblesEmptyIcon,
} from "@/components/dapp/PhantomIllustrations";
import {
  Card,
  Disclosure,
  EmptyState,
  StatusPill,
  Tabs,
  buttonClass,
  cx,
  formatIdr,
  formatIdrShort,
  formatNumber,
} from "@/components/dapp/phantom-ui";
import { useDashboardState } from "@/components/dapp/useDashboardStore";

type HomeTab = "assets" | "signals" | "attestations";

const HOME_TABS: { id: HomeTab; label: string }[] = [
  { id: "assets", label: "Carbon Assets" },
  { id: "signals", label: "Forest Signals" },
  { id: "attestations", label: "Attestations" },
];

const ROLE_CTA: Record<
  UserRole,
  { subtitle: string; primaryLabel: string; primaryHref: string }
> = {
  recipient: {
    subtitle: "Siap memilih aset karbon hutan terverifikasi di lingkungan simulasi.",
    primaryLabel: "Beli Unit Karbon",
    primaryHref: "/market",
  },
  community: {
    subtitle: "Hak veto FPIC menentukan kelayakan pasar · 60% settlement menuju kas komunitas.",
    primaryLabel: "Kelola Persetujuan Warga",
    primaryHref: "/consent",
  },
  manager: {
    subtitle: "Pantau sensor lapangan, anomali kanopi, dan alokasi 40% operasi konservasi.",
    primaryLabel: "Buka Forest Intelligence",
    primaryHref: "/map",
  },
  auditor: {
    subtitle: "Verifikasi integritas bukti lapangan sebelum menerbitkan segel EAS Base Sepolia.",
    primaryLabel: "Buka Auditor Cockpit",
    primaryHref: "/approve",
  },
  guest: {
    subtitle: "Mode peninjau aktif. Ganti peran di menu profil atau jelajahi aset demo.",
    primaryLabel: "Jelajahi Carbon Market",
    primaryHref: "/market",
  },
};

const TONE_DOT: Record<string, string> = {
  green: "bg-[#72C99A]",
  lavender: "bg-[#AA9AF5]",
  warning: "bg-[#F2B84B]",
  error: "bg-[#ED7770]",
};

export default function DashboardPage() {
  const {
    user,
    parcels,
    sensors,
    consentRecords,
    verificationRecords,
    transactions,
    activities,
  } = useDashboardState();

  const [tab, setTab] = useState<HomeTab>("assets");
  const [selectedId, setSelectedId] = useState<string | null>(parcels[0]?.id ?? null);

  const role = normalizeUserRole(user?.role, user?.email);
  const roleCta = ROLE_CTA[role] ?? ROLE_CTA.guest;
  const emailPrefix = user?.email?.split("@")[0]?.replace(/[^a-zA-Z0-9_.-]/g, "");
  const handle = emailPrefix ? `@${emailPrefix}` : `@${role}_demo`;

  const selected = useMemo(
    () => parcels.find((item) => item.id === selectedId) ?? parcels[0],
    [parcels, selectedId]
  );

  const totals = useMemo(() => {
    const availableUnits = parcels.reduce((sum, p) => sum + p.availableUnits, 0);
    const totalArea = parcels.reduce((sum, p) => sum + p.area, 0);
    const anomalies = sensors.filter((s) => s.anomaly || s.flameDetected).length;
    const settledVolume = transactions.reduce((sum, t) => sum + t.volume_tco2e, 0);
    const eligibleCount = parcels.filter(
      (p) => p.eligibility && p.verificationStatus === "verified"
    ).length;
    return { availableUnits, totalArea, anomalies, settledVolume, eligibleCount };
  }, [parcels, sensors, transactions]);

  const lastSeal = useMemo(() => {
    if (verificationRecords.length === 0) return null;
    return verificationRecords.reduce((a, b) => (b.block_index > a.block_index ? b : a));
  }, [verificationRecords]);

  const grantedConsents = consentRecords.filter((item) => item.status === "granted").length;

  const quickActions = [
    {
      label: "Carbon Market",
      sub: "Screener & beli unit",
      href: "/market",
      icon: TrendingUp,
      color: "#AA9AF5",
    },
    {
      label: "Forest Map",
      sub: "GeoJSON & IoT sensor",
      href: "/map",
      icon: MapIcon,
      color: "#72C99A",
    },
    {
      label: "Portfolio",
      sub: "Kepemilikan karbon",
      href: "/portfolio",
      icon: Wallet,
      color: "#F2B84B",
    },
    {
      label: role === "community" ? "FPIC Veto" : "Aktivitas",
      sub: role === "community" ? "Izin & veto komunitas" : "Riwayat MRV & pasar",
      href: role === "community" ? "/consent" : "/activity",
      icon: role === "community" ? Users : Clock,
      color: "#72C99A",
    },
  ];

  const statusStrip = [
    {
      label: "Segel MRV",
      value: lastSeal ? `#${lastSeal.block_index}` : "—",
      sub: lastSeal ? lastSeal.parcel_id : "belum ada segel",
      alert: false,
    },
    {
      label: "Node IoT",
      value: String(sensors.length),
      sub: `node · ${totals.anomalies} anomali`,
      alert: totals.anomalies > 0,
    },
    {
      label: "FPIC",
      value: `${grantedConsents}/${parcels.length}`,
      sub: "parcel disetujui",
      alert: false,
    },
    {
      label: "Transaksi",
      value: String(transactions.length),
      sub: `order · ${formatNumber(totals.settledVolume)} tCO₂e`,
      alert: false,
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* ── Account Hero + Key Metrics ── */}
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="relative flex flex-col overflow-hidden p-6 sm:p-8">
            {/* Background tonal radial hint (zero animation, opacity 3%) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse 60% 50% at 15% 60%, rgba(114,201,154,0.06) 0%, transparent 100%), radial-gradient(ellipse 50% 40% at 85% 20%, rgba(170,154,245,0.05) 0%, transparent 100%)",
              }}
            />
            <div className="relative mx-auto flex w-full max-w-[520px] flex-1 flex-col items-center justify-center text-center">
              <BotanicalSpiritMark className="h-[68px] w-[68px]" />
              <h1 className="mt-4 text-[28px] font-semibold tracking-[-0.03em] text-[#F4F5F2] sm:text-[32px]">
                Welcome, {handle}
              </h1>
              <p className="mt-2 max-w-[44ch] text-[14px] leading-relaxed text-[#A6ADA7]">
                {roleCta.subtitle}
              </p>
              <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row">
                <Link
                  href={roleCta.primaryHref}
                  className={buttonClass("lavender", "h-12 flex-1 rounded-full text-[14px]")}
                >
                  {roleCta.primaryLabel}
                </Link>
                <Link
                  href="/map"
                  className={buttonClass("secondary", "h-12 flex-1 rounded-full text-[14px]")}
                >
                  Forest Intelligence
                </Link>
              </div>
            </div>

            {/* 4 Quick Action Tiles */}
            <div className="relative mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {quickActions.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-2xl border border-[#252B27] bg-[#1D211E] px-3 py-3.5 text-center hover:border-[#39423C] hover:bg-[#242925]"
                  >
                    <span
                      className="grid h-9 w-9 place-items-center rounded-xl"
                      style={{
                        backgroundColor: `${item.color}18`,
                        color: item.color,
                      }}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-[13px] font-semibold text-[#F4F5F2]">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-[#8B948D]">
                        {item.sub}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Bottom status strip — derived pipeline state, anchors the card */}
            <div className="relative mt-6 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-[#252B27] pt-5 sm:grid-cols-4">
              {statusStrip.map((cell, index) => (
                <div
                  key={cell.label}
                  className={cx("min-w-0", index > 0 && "sm:border-l sm:border-[#252B27] sm:pl-5")}
                >
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-[#7E877F]">
                    {cell.label}
                  </p>
                  <p className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5">
                    <span
                      className={cx(
                        "text-[15px] font-semibold tracking-[-0.02em] xb-numeric",
                        cell.alert ? "text-[#F2B84B]" : "text-[#F4F5F2]"
                      )}
                    >
                      {cell.value}
                    </span>
                    <span className="text-[11.5px] font-medium text-[#8B948D]">{cell.sub}</span>
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Right column: metrics + supply chart */}
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4">
                <p className="text-[11.5px] font-medium text-[#A6ADA7]">Unit Tersedia</p>
                <p className="mt-1.5 text-[26px] font-semibold tracking-[-0.03em] text-[#72C99A] xb-numeric">
                  {formatNumber(totals.availableUnits)}
                </p>
                <p className="mt-1 text-[11.5px] text-[#8B948D]">tCO₂e siap transaksi</p>
              </Card>
              <Card className="p-4">
                <p className="text-[11.5px] font-medium text-[#A6ADA7]">Harga Acuan</p>
                <p className="mt-1.5 text-[20px] font-semibold tracking-[-0.02em] text-[#F4F5F2] xb-numeric">
                  {formatIdrShort(PRICE_PER_TON)}
                </p>
                <p className="mt-1 text-[11.5px] text-[#8B948D]">/ tCO₂e · testnet</p>
              </Card>
              <Card className="p-4">
                <p className="text-[11.5px] font-medium text-[#A6ADA7]">Area Terpantau</p>
                <p className="mt-1.5 text-[26px] font-semibold tracking-[-0.03em] text-[#F4F5F2] xb-numeric">
                  {formatNumber(totals.totalArea)}
                </p>
                <p className="mt-1 text-[11.5px] text-[#8B948D]">ha · Bogor, Jabar</p>
              </Card>
              <Card className="p-4">
                <p className="text-[11.5px] font-medium text-[#A6ADA7]">Parcel Layak</p>
                <p className="mt-1.5 text-[26px] font-semibold tracking-[-0.03em] text-[#AA9AF5] xb-numeric">
                  {totals.eligibleCount}
                </p>
                <p className="mt-1 text-[11.5px] text-[#8B948D]">dari {parcels.length} parcel dMRV</p>
              </Card>
            </div>

            <Card className="flex flex-col p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[13.5px] font-semibold text-[#F4F5F2]">Likuiditas Karbon</p>
                  <p className="text-[12px] text-[#A6ADA7]">Unit tersedia vs dibekukan</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#23865A]/20 px-2.5 py-0.5 text-[11.5px] font-semibold text-[#72C99A]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#72C99A]" aria-hidden="true" />
                  Siap Pasar
                </span>
              </div>
              <ParcelSupplyChart parcels={parcels} />
              {totals.anomalies > 0 && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#F2B84B]/35 bg-[#F2B84B]/10 px-3 py-2.5">
                  <AlertTriangle
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#F2B84B]"
                    aria-hidden="true"
                  />
                  <p className="text-[12px] leading-snug text-[#F2B84B]">
                    {totals.anomalies} node IoT anomali — parcel terkait terkunci otomatis.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </section>

        {/* ── Phantom Tabs: Carbon Assets / Forest Signals / Attestations ── */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Tabs
              variant="phantom"
              items={HOME_TABS}
              value={tab}
              onChange={setTab}
              label="Tampilan aset dan sinyal hutan"
            />
            <Link
              href="/market"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-2.5 text-[13px] font-semibold text-[#AA9AF5] hover:bg-[#151816]"
            >
              Semua di Screener
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {tab === "assets" && (
            <Card className="overflow-hidden">
              {parcels.length === 0 ? (
                <EmptyState
                  illustration={<CoinsPlusIcon className="h-16 w-16" />}
                  title="Belum ada aset karbon"
                  body="Parcel hutan yang lolos MRV dan izin komunitas akan tampil di sini."
                />
              ) : (
                <div className="divide-y divide-[#252B27]">
                  {parcels.map((parcel) => {
                    const consent = consentRecords.find((c) => c.parcel_id === parcel.id);
                    const eligible =
                      parcel.verificationStatus === "verified" &&
                      parcel.eligibility &&
                      consent?.status === "granted";

                    return (
                      <Link
                        key={parcel.id}
                        href={eligible ? "/market" : "/map"}
                        className="flex flex-col justify-between gap-3 px-5 py-4 hover:bg-[#1D211E] sm:flex-row sm:items-center"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <span
                            className={cx(
                              "grid h-11 w-11 shrink-0 place-items-center rounded-2xl border",
                              eligible
                                ? "border-[#72C99A]/30 bg-[#23865A]/20 text-[#72C99A]"
                                : "border-[#39423C] bg-[#1D211E] text-[#A6ADA7]"
                            )}
                          >
                            <Leaf className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[15px] font-semibold text-[#F4F5F2]">
                                {parcel.name}
                              </span>
                              <span className="rounded-md bg-[#1D211E] px-2 py-0.5 font-mono text-[11px] font-medium text-[#8B948D]">
                                {parcel.id}
                              </span>
                              <StatusPill status={parcel.verificationStatus} />
                            </div>
                            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-[#A6ADA7]">
                              <span>{parcel.region}</span>
                              <span className="xb-numeric">{formatNumber(parcel.area)} ha</span>
                              <span>
                                NDVI{" "}
                                <span
                                  className={cx(
                                    "font-semibold xb-numeric",
                                    parcel.ndvi !== undefined && parcel.ndvi >= 0.7
                                      ? "text-[#72C99A]"
                                      : "text-[#F2B84B]"
                                  )}
                                >
                                  {parcel.ndvi !== undefined ? parcel.ndvi.toFixed(2) : "N/A"}
                                </span>
                              </span>
                              <span
                                className={
                                  consent?.status === "granted"
                                    ? "text-[#72C99A]"
                                    : "text-[#ED7770]"
                                }
                              >
                                {consent?.status === "granted"
                                  ? "FPIC Aktif"
                                  : "Belum ada izin"}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-5 sm:justify-end">
                          <div className="text-left sm:text-right">
                            <p
                              className={cx(
                                "text-[16px] font-semibold xb-numeric",
                                eligible ? "text-[#72C99A]" : "text-[#A6ADA7]"
                              )}
                            >
                              {eligible
                                ? `${formatNumber(parcel.availableUnits)} tCO₂e`
                                : `${formatNumber(parcel.frozenUnits)} beku`}
                            </p>
                            <p className="mt-0.5 text-[12px] text-[#8B948D] xb-numeric">
                              {eligible
                                ? `~${formatIdrShort(parcel.settlementEstimateIdr)}`
                                : "Terkunci MRV"}
                            </p>
                          </div>
                          <ArrowUpRight
                            className="h-4 w-4 shrink-0 text-[#8B948D]"
                            aria-hidden="true"
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

          {tab === "signals" && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="p-5">
                <div className="mb-3">
                  <p className="text-[14px] font-semibold text-[#F4F5F2]">
                    Indeks Vegetasi Kanopi (NDVI)
                  </p>
                  <p className="text-[12px] text-[#A6ADA7]">
                    Ambang kelayakan verifikasi satelit: 0.70
                  </p>
                </div>
                <ParcelNdviChart parcels={parcels} />
              </Card>

              <Card className="overflow-hidden">
                <div className="border-b border-[#252B27] px-5 py-3.5">
                  <p className="text-[14px] font-semibold text-[#F4F5F2]">Telemetri Node ESP32</p>
                  <p className="text-[12px] text-[#A6ADA7]">
                    {sensors.length} sensor aktif di lapangan
                  </p>
                </div>
                <div className="divide-y divide-[#252B27]">
                  {sensors.map((sensor) => (
                    <div
                      key={sensor.sensor_id}
                      className="flex items-center justify-between gap-3 px-5 py-3.5"
                    >
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 font-mono text-[13px] font-semibold text-[#F4F5F2]">
                          <Radio
                            className="h-3.5 w-3.5 text-[#AA9AF5]"
                            aria-hidden="true"
                          />
                          {sensor.sensor_id}
                          <span className="text-[11.5px] font-normal text-[#8B948D]">
                            · {sensor.parcel_id}
                          </span>
                        </p>
                        <p className="mt-1 text-[12.5px] text-[#A6ADA7] xb-numeric">
                          {sensor.temperature.toFixed(1)}°C · RH {sensor.humidity}% · Tanah{" "}
                          {sensor.soil_moisture}%
                        </p>
                      </div>
                      <span
                        className={cx(
                          "shrink-0 rounded-lg px-2.5 py-1 text-[11.5px] font-semibold",
                          sensor.flameDetected
                            ? "bg-[#ED7770]/15 text-[#ED7770]"
                            : sensor.anomaly
                              ? "bg-[#F2B84B]/15 text-[#F2B84B]"
                              : "bg-[#23865A]/20 text-[#72C99A]"
                        )}
                      >
                        {sensor.flameDetected ? "Api" : sensor.anomaly ? "Anomali" : "Aman"}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {tab === "attestations" && (
            <Card className="overflow-hidden">
              {verificationRecords.length === 0 ? (
                <EmptyState
                  illustration={<CollectiblesEmptyIcon className="h-16 w-20" />}
                  title="Belum ada sertifikat attestation"
                  body="Blok SHA-256 yang sudah disahkan auditor di Base Sepolia akan tampil di sini."
                />
              ) : (
                <div className="divide-y divide-[#252B27]">
                  {verificationRecords.map((rec) => (
                    <Link
                      key={rec.record_id}
                      href="/verify"
                      className="flex flex-col justify-between gap-3 px-5 py-4 hover:bg-[#1D211E] sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-[#72C99A]" aria-hidden="true" />
                          <span className="font-mono text-[13px] font-semibold text-[#F4F5F2]">
                            Blok #{rec.block_index} · {rec.parcel_id}
                          </span>
                          {rec.reasons.length > 0 && (
                            <span className="rounded-md bg-[#F2B84B]/15 px-2 py-0.5 text-[11.5px] font-semibold text-[#F2B84B]">
                              {rec.reasons.length} catatan
                            </span>
                          )}
                        </div>
                        <p className="mt-1 truncate font-mono text-[12px] text-[#8B948D]">
                          EAS: {rec.eas_uid}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#AA9AF5]">
                        Periksa Hash
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          )}
        </section>

        {/* ── Forest Intelligence Preview + Activity Stream ── */}
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#252B27] px-5 py-4">
              <div>
                <h2 className="text-[16px] font-semibold text-[#F4F5F2]">Forest Intelligence</h2>
                <p className="mt-0.5 text-[12.5px] text-[#A6ADA7]">
                  Bogor, Jawa Barat · klik poligon untuk memilih parcel
                </p>
              </div>
              <Link
                href="/map"
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#39423C] bg-[#1D211E] px-3.5 text-[12.5px] font-semibold text-[#F4F5F2] hover:bg-[#242925]"
              >
                Peta Penuh
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            <CarbonMap
              parcels={parcels}
              sensors={sensors}
              selectedId={selected?.id ?? null}
              onSelect={setSelectedId}
              className="h-[300px] w-full"
            />

            <div className="grid grid-cols-1 gap-2 border-t border-[#252B27] p-3 sm:grid-cols-2">
              {parcels.map((parcel) => {
                const active = parcel.id === selected?.id;
                return (
                  <button
                    key={parcel.id}
                    type="button"
                    onClick={() => setSelectedId(parcel.id)}
                    aria-pressed={active}
                    className={cx(
                      "min-h-[52px] rounded-xl border px-3.5 py-2.5 text-left",
                      active
                        ? "border-[#AA9AF5]/50 bg-[#AA9AF5]/12"
                        : "border-[#252B27] bg-[#1D211E] hover:border-[#39423C]"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[12px] font-semibold text-[#F4F5F2]">
                        {parcel.id}
                      </span>
                      <StatusPill status={parcel.verificationStatus} />
                    </div>
                    <p className="mt-0.5 truncate text-[12px] text-[#A6ADA7]">{parcel.name}</p>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="flex flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b border-[#252B27] px-5 py-4">
              <div>
                <h2 className="text-[16px] font-semibold text-[#F4F5F2]">Aktivitas Terbaru</h2>
                <p className="mt-0.5 text-[12.5px] text-[#A6ADA7]">
                  Pasar, izin warga, dan ledger
                </p>
              </div>
              <Link
                href="/activity"
                className="inline-flex min-h-[44px] items-center gap-1 text-[12.5px] font-semibold text-[#AA9AF5]"
              >
                Semua
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            <div className="flex-1 divide-y divide-[#252B27]">
              {activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                  <Zap className="h-10 w-10 text-[#2E3530]" aria-hidden="true" />
                  <p className="mt-3 text-[14px] font-semibold text-[#F4F5F2]">
                    Belum ada aktivitas
                  </p>
                  <p className="mt-1.5 text-[12.5px] text-[#A6ADA7]">
                    Order, verifikasi, dan perubahan izin akan muncul di sini.
                  </p>
                </div>
              ) : (
                activities.slice(0, 6).map((ev) => (
                  <div key={ev.id} className="flex items-start gap-3 px-5 py-3.5">
                    <span
                      className={cx(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        TONE_DOT[ev.tone] ?? "bg-[#A6ADA7]"
                      )}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-[#F4F5F2]">
                        {ev.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-[12px] text-[#A6ADA7]">
                        {ev.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </section>

        <Disclosure />
      </div>
    </AppShell>
  );
}
