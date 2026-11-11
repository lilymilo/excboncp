"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Flame,
  Gauge,
  Info,
  Leaf,
  Lock,
  Radio,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/dapp/AppShell";
import {
  Card,
  Chip,
  Disclosure,
  Metric,
  ScrollArea,
  SectionLabel,
  StatusPill,
  TestnetBadge,
  buttonClass,
  cx,
  formatIdr,
  formatIdrShort,
  formatNumber,
} from "@/components/dapp/phantom-ui";
import {
  PRICE_PER_TON,
  calculateSettlement,
  normalizeUserRole,
  useDapp,
  type ConsentRecord,
  type ParcelItem,
  type SensorData,
  type UserRole,
  type VerificationStatus,
} from "@/context/DappContext";

const STATUS_LABEL: Record<VerificationStatus, string> = {
  verified: "Terverifikasi",
  warning: "Peringatan",
  pending: "Menunggu",
  blocked: "Diblokir",
  dispute: "Sengketa",
};

const STATUS_DOT: Record<VerificationStatus, string> = {
  verified: "bg-xb-verified",
  warning: "bg-xb-warning",
  pending: "bg-xb-pending",
  blocked: "bg-xb-blocked",
  dispute: "bg-xb-dispute",
};

type RiskFactor = { label: string; weight: number; detail: string };

function buildRisk(
  parcel: ParcelItem,
  sensors: SensorData[],
  consent?: ConsentRecord
): { score: number; factors: RiskFactor[] } {
  const factors: RiskFactor[] = [];
  const statusWeight: Record<VerificationStatus, number> = {
    verified: 6,
    pending: 30,
    warning: 52,
    blocked: 74,
    dispute: 62,
  };

  factors.push({
    label: "Status verifikasi",
    weight: statusWeight[parcel.verificationStatus] ?? 30,
    detail: STATUS_LABEL[parcel.verificationStatus] ?? parcel.verificationStatus,
  });

  const anomalies = sensors.filter((sensor) => sensor.anomaly).length;
  if (anomalies > 0) {
    factors.push({
      label: "Anomali sensor",
      weight: Math.min(20, anomalies * 10),
      detail: `${anomalies} perangkat di luar ambang`,
    });
  }

  if (sensors.some((sensor) => sensor.flameDetected)) {
    factors.push({ label: "Deteksi api", weight: 16, detail: "Flame sensor aktif" });
  }

  if (parcel.ndvi !== undefined && parcel.ndvi < 0.7) {
    factors.push({
      label: "Kerapatan kanopi",
      weight: parcel.ndvi < 0.6 ? 20 : 14,
      detail: `NDVI ${parcel.ndvi.toFixed(2)}`,
    });
  }

  if (consent?.status !== "granted") {
    factors.push({
      label: "Izin komunitas",
      weight: 18,
      detail: consent ? "Izin dicabut" : "Belum ada izin",
    });
  }

  if (!parcel.eligibility) {
    factors.push({ label: "Kelayakan pasar", weight: 8, detail: "Belum layak jual" });
  }

  const score = Math.min(100, factors.reduce((sum, factor) => sum + factor.weight, 0));
  return { score, factors };
}

function riskTone(score: number) {
  if (score < 25) return { label: "Rendah", text: "text-xb-verified", bar: "bg-xb-verified" };
  if (score < 50) return { label: "Sedang", text: "text-xb-tech", bar: "bg-xb-tech" };
  if (score < 75) return { label: "Tinggi", text: "text-xb-warning", bar: "bg-xb-warning" };
  return { label: "Kritis", text: "text-xb-blocked", bar: "bg-xb-blocked" };
}

const ROLE_ACTION: Record<
  UserRole,
  { label: string; hint: string; href?: string; tone: "primary" | "secondary" }
> = {
  recipient: {
    label: "Ajukan pembelian",
    hint: "Permintaan tercatat pada sesi ini. Testnet tidak memproses pembayaran nyata.",
    tone: "primary",
  },
  community: {
    label: "Cek izin komunitas",
    hint: "Kredit hanya bisa dijual jika izin warga masih aktif dan tercatat.",
    href: "/consent",
    tone: "secondary",
  },
  manager: {
    label: "Buka monitoring",
    hint: "Porsi 40% operasi baru cair setelah settlement terverifikasi.",
    href: "/app",
    tone: "secondary",
  },
  auditor: {
    label: "Tinjau bukti lahan",
    hint: "Kelayakan pasar mengikuti hasil verifikasi auditor.",
    href: "/approve",
    tone: "secondary",
  },
  guest: {
    label: "Masuk akun demo",
    hint: "Sebagian aksi hanya tersedia untuk peran tertentu.",
    href: "/login",
    tone: "secondary",
  },
};

export default function MarketPage() {
  const { user, parcels, sensors, transactions, consentRecords, switchDemoRole } = useDapp();

  const [selectedId, setSelectedId] = useState<string | null>(parcels[0]?.id ?? null);
  const [volumeInput, setVolumeInput] = useState("10");
  const [quoted, setQuoted] = useState(false);

  const selected = useMemo(
    () => parcels.find((parcel) => parcel.id === selectedId) ?? parcels[0],
    [parcels, selectedId]
  );

  const selectedSensors = selected
    ? sensors.filter((sensor) => sensor.parcel_id === selected.id)
    : [];
  const selectedConsent = selected
    ? consentRecords.find((record) => record.parcel_id === selected.id)
    : undefined;

  const risk = selected ? buildRisk(selected, selectedSensors, selectedConsent) : null;
  const tone = risk ? riskTone(risk.score) : null;

  const available = selected?.availableUnits ?? 0;
  const eligible =
    !!selected &&
    selected.verificationStatus === "verified" &&
    selected.eligibility &&
    selectedConsent?.status === "granted" &&
    available > 0;

  const requestedVolume = Number.parseInt(volumeInput, 10);
  const volume = Number.isFinite(requestedVolume)
    ? Math.max(0, Math.min(requestedVolume, available))
    : 0;
  const gross = volume * PRICE_PER_TON;
  const settlement = eligible ? calculateSettlement(gross) : calculateSettlement(0);

  const totals = useMemo(() => {
    const availableUnits = parcels.reduce((sum, parcel) => sum + parcel.availableUnits, 0);
    const potentialGross = parcels.reduce((sum, parcel) => sum + parcel.settlementEstimateIdr, 0);
    const potential = calculateSettlement(potentialGross);
    return { availableUnits, potentialGross, potential };
  }, [parcels]);

  const role: UserRole = normalizeUserRole(user?.role, user?.email);
  const roleAction = ROLE_ACTION[role] ?? ROLE_ACTION.guest;

  const selectParcel = (id: string) => {
    setSelectedId(id);
    setQuoted(false);
    setVolumeInput("10");
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <section className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <SectionLabel>Carbon screener</SectionLabel>
              <TestnetBadge />
            </div>
            <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-xb-text sm:text-[25px]">
              Screener &amp; Risk Terminal
            </h1>
            <p className="mt-1 max-w-[62ch] text-[12.5px] leading-relaxed text-xb-mute">
              Nilai unit kredit karbon per parcel, profil risiko, dan simulasi settlement sebelum
              transaksi diajukan.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-xb-line/70 bg-xb-surface px-3.5 py-2.5">
            <TrendingUp className="h-4 w-4 text-xb-forest" aria-hidden="true" />
            <div>
              <SectionLabel>Harga acuan</SectionLabel>
              <p className="mt-0.5 text-[15px] font-semibold text-xb-text xb-numeric">
                {formatIdr(PRICE_PER_TON)}
                <span className="ml-1 text-[10.5px] font-medium text-xb-dim">/ tCO₂e</span>
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <Card className="p-3.5">
            <Metric
              label="Unit tersedia"
              value={formatNumber(totals.availableUnits)}
              unit="unit"
              sub={`Dari ${parcels.length} parcel terdaftar`}
            />
          </Card>
          <Card className="p-3.5">
            <Metric
              label="Nilai bruto potensial"
              value={formatIdrShort(totals.potentialGross)}
              tone="forest"
              sub="Sebelum biaya sandbox"
            />
          </Card>
          <Card className="p-3.5">
            <Metric
              label="Kas komunitas potensial"
              value={formatIdrShort(totals.potential.community_idr)}
              tone="tech"
              sub="60% dari nilai bersih"
            />
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_392px]">
          <div className="min-w-0 space-y-4">
            <Card className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-xb-line/70 px-4 py-3">
                <div>
                  <SectionLabel>Daftar parcel</SectionLabel>
                  <p className="mt-0.5 text-[11.5px] text-xb-dim">
                    Pilih baris untuk menghitung settlement
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 text-[10.5px] text-xb-dim">
                  {(["verified", "warning", "blocked"] as const).map((status) => (
                    <span key={status} className="inline-flex items-center gap-1.5">
                      <span className={cx("h-1.5 w-1.5 rounded-full", STATUS_DOT[status])} />
                      {STATUS_LABEL[status]}
                    </span>
                  ))}
                </div>
              </div>

              <div className="xb-scroll overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-xb-line/60 text-[10px] uppercase tracking-[0.12em] text-xb-dim">
                      <th className="px-4 py-2.5 font-semibold">Parcel</th>
                      <th className="px-3 py-2.5 font-semibold">Status</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Unit</th>
                      <th className="px-3 py-2.5 text-right font-semibold">NDVI</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Risiko</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Estimasi bruto</th>
                      <th className="px-4 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {parcels.map((parcel) => {
                      const active = parcel.id === selected?.id;
                      const parcelSensors = sensors.filter((sensor) => sensor.parcel_id === parcel.id);
                      const parcelConsent = consentRecords.find(
                        (record) => record.parcel_id === parcel.id
                      );
                      const parcelRisk = buildRisk(parcel, parcelSensors, parcelConsent);
                      const parcelTone = riskTone(parcelRisk.score);
                      return (
                        <tr
                          key={parcel.id}
                          onClick={() => selectParcel(parcel.id)}
                          className={cx(
                            "cursor-pointer border-b border-xb-line/40 transition-colors last:border-0",
                            active ? "bg-xb-forest/[0.07]" : "hover:bg-xb-raised/50"
                          )}
                        >
                          <td className="px-4 py-3">
                            <p className="text-[12.5px] font-semibold text-xb-text">{parcel.name}</p>
                            <p className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-xb-dim">
                              <Leaf className="h-3 w-3" aria-hidden="true" />
                              {parcel.id} · {formatNumber(parcel.area)} ha · {parcel.region}
                            </p>
                          </td>
                          <td className="px-3 py-3">
                            <StatusPill
                              status={parcel.verificationStatus}
                              label={STATUS_LABEL[parcel.verificationStatus]}
                            />
                          </td>
                          <td className="px-3 py-3 text-right">
                            <p className="text-[12.5px] font-medium text-xb-text xb-numeric">
                              {formatNumber(parcel.availableUnits)}
                            </p>
                            {parcel.frozenUnits > 0 && (
                              <p className="mt-0.5 text-[10px] text-xb-blocked xb-numeric">
                                {formatNumber(parcel.frozenUnits)} dibekukan
                              </p>
                            )}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span
                              className={cx(
                                "text-[12px] font-medium xb-numeric",
                                parcel.ndvi !== undefined && parcel.ndvi >= 0.7
                                  ? "text-xb-forest"
                                  : "text-xb-warning"
                              )}
                            >
                              {parcel.ndvi !== undefined ? parcel.ndvi.toFixed(2) : "—"}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className={cx("text-[12px] font-semibold xb-numeric", parcelTone.text)}>
                              {parcelRisk.score}
                            </span>
                            <span className="ml-1 text-[10px] text-xb-dim">{parcelTone.label}</span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className="text-[12px] text-xb-text xb-numeric">
                              {parcel.settlementEstimateIdr > 0
                                ? formatIdrShort(parcel.settlementEstimateIdr)
                                : "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <ChevronRight
                              className={cx(
                                "inline h-4 w-4",
                                active ? "text-xb-forest" : "text-xb-dim"
                              )}
                              aria-hidden="true"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-start gap-2 border-t border-xb-line/60 px-4 py-2.5">
                <Info className="mt-0.5 h-3 w-3 shrink-0 text-xb-dim" aria-hidden="true" />
                <p className="text-[10.5px] leading-relaxed text-xb-dim">
                  Semua baris berasal dari data simulasi. Parcel dengan status selain terverifikasi
                  tidak dapat ditransaksikan.
                </p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between gap-2">
                <SectionLabel>Profil risiko</SectionLabel>
                <span className={cx("text-[11px] font-semibold", tone?.text)}>{tone?.label}</span>
              </div>

              <div className="mt-2 flex items-baseline gap-1.5">
                <span className={cx("text-[26px] font-semibold leading-none xb-numeric", tone?.text)}>
                  {risk?.score ?? 0}
                </span>
                <span className="text-[10.5px] text-xb-dim">/ 100</span>
                <span className="ml-auto flex items-center gap-1 text-[10.5px] text-xb-dim">
                  <Radio className="h-3 w-3" aria-hidden="true" />
                  {selectedSensors.length} sensor
                </span>
              </div>

              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-xb-raised">
                <div
                  className={cx("h-full rounded-full transition-all duration-500", tone?.bar)}
                  style={{ width: `${risk?.score ?? 0}%` }}
                />
              </div>

              <ul className="mt-3 space-y-1.5">
                {risk?.factors.map((factor) => (
                  <li key={factor.label} className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-1.5 text-[11.5px] text-xb-mute">
                      {factor.weight >= 16 ? (
                        <AlertTriangle className="h-3 w-3 shrink-0 text-xb-warning" aria-hidden="true" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3 shrink-0 text-xb-verified" aria-hidden="true" />
                      )}
                      <span className="truncate">{factor.label}</span>
                      <span className="truncate text-[10.5px] text-xb-dim">· {factor.detail}</span>
                    </span>
                    <span className="shrink-0 font-mono text-[10.5px] text-xb-dim">
                      +{factor.weight}
                    </span>
                  </li>
                ))}
                {risk?.factors.length === 0 && (
                  <li className="text-[11.5px] text-xb-mute">Tidak ada faktor risiko terdeteksi.</li>
                )}
              </ul>

              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-xb-line/50 pt-2.5 text-[10.5px]">
                <div>
                  <p className="text-xb-dim">NDVI</p>
                  <p className="mt-0.5 font-mono text-xb-text">
                    {selected?.ndvi !== undefined ? selected.ndvi.toFixed(2) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xb-dim">SAR</p>
                  <p className="mt-0.5 font-mono text-xb-text">
                    {selected?.sar !== undefined ? selected.sar.toFixed(2) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xb-dim">Anomali</p>
                  <p className="mt-0.5 font-mono text-xb-text">
                    {selectedSensors.filter((sensor) => sensor.anomaly).length}/
                    {selectedSensors.length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="min-w-0 space-y-4">
            <Card className="overflow-hidden">
              <div className="border-b border-xb-line/70 px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <SectionLabel>Settlement simulator</SectionLabel>
                    <p className="mt-0.5 truncate text-[13px] font-semibold text-xb-text">
                      {selected?.name ?? "Belum ada parcel"}
                    </p>
                  </div>
                  {selected && (
                    <StatusPill
                      status={selected.verificationStatus}
                      label={STATUS_LABEL[selected.verificationStatus]}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-3 p-4">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="volume"
                      className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-xb-dim"
                    >
                      Volume (tCO₂e)
                    </label>
                    <span className="text-[10.5px] text-xb-dim xb-numeric">
                      maks {formatNumber(available)}
                    </span>
                  </div>
                  <input
                    id="volume"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={available}
                    value={volumeInput}
                    onChange={(event) => {
                      setVolumeInput(event.target.value);
                      setQuoted(false);
                    }}
                    disabled={available === 0}
                    className="mt-1.5 h-[42px] w-full rounded-lg border border-xb-line/70 bg-xb-raised/60 px-3 text-[14px] font-medium text-xb-text xb-numeric outline-none transition-colors focus:border-xb-forest/50 focus:ring-2 focus:ring-xb-forest/15 disabled:cursor-not-allowed disabled:text-xb-dim"
                  />
                  <div className="mt-2 flex gap-1.5">
                    {[0.25, 0.5, 1].map((fraction) => {
                      const value = Math.max(1, Math.floor(available * fraction));
                      return (
                        <button
                          key={fraction}
                          type="button"
                          disabled={available === 0}
                          onClick={() => {
                            setVolumeInput(String(value));
                            setQuoted(false);
                          }}
                          className="flex-1 rounded-md border border-xb-line/60 py-1.5 text-[11px] font-medium text-xb-mute transition-colors hover:border-xb-forest/35 hover:text-xb-text disabled:opacity-40"
                        >
                          {fraction === 1 ? "Semua" : `${fraction * 100}%`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-lg border border-xb-line/60 bg-xb-raised/30 p-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <SectionLabel>Nilai bruto</SectionLabel>
                    <span className="text-[10px] text-xb-dim xb-numeric">
                      {formatNumber(volume)} × {formatIdr(PRICE_PER_TON)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[20px] font-semibold leading-none text-xb-text xb-numeric">
                    {formatIdr(settlement.gross_idr)}
                  </p>

                  <div className="mt-3 space-y-1.5 border-t border-xb-line/50 pt-2.5">
                    <Line
                      label="Biaya sandbox 2%"
                      value={`−${formatIdr(settlement.sandbox_fee_idr)}`}
                      tone="text-xb-warning"
                    />
                    <Line label="Nilai bersih" value={formatIdr(settlement.net_idr)} />
                    <Line
                      label="Kas komunitas 60%"
                      value={formatIdr(settlement.community_idr)}
                      tone="text-xb-verified"
                      strong
                    />
                    <Line
                      label="Operasi pengelola 40%"
                      value={formatIdr(settlement.operations_idr)}
                      tone="text-xb-tech"
                      strong
                    />
                  </div>
                </div>

                {selected && !eligible && (
                  <div className="flex items-start gap-2 rounded-lg border border-xb-warning/30 bg-xb-warning/[0.07] p-2.5">
                    <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-xb-warning" aria-hidden="true" />
                    <p className="text-[11px] leading-relaxed text-xb-warning">
                      {available === 0
                        ? "Tidak ada unit tersedia. Seluruh unit pada parcel ini dibekukan."
                        : "Parcel belum memenuhi syarat transaksi: status verifikasi, kelayakan pasar, dan izin komunitas harus aktif."}
                    </p>
                  </div>
                )}

                {roleAction.href ? (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        switchDemoRole("recipient");
                        if (eligible && volume > 0) setQuoted(true);
                      }}
                      className={buttonClass("primary", "w-full")}
                    >
                      Uji Pembelian sebagai PT. GreenCorp
                    </button>
                    <Link href={roleAction.href} className={buttonClass(roleAction.tone, "w-full")}>
                      {roleAction.label}
                    </Link>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={!eligible || volume === 0}
                    onClick={() => setQuoted(true)}
                    className={buttonClass("primary", "w-full")}
                  >
                    {roleAction.label}
                  </button>
                )}
                <p className="text-[10.5px] leading-relaxed text-xb-dim">{roleAction.hint}</p>

                {quoted && eligible && (
                  <div className="rounded-lg border border-xb-forest/30 bg-xb-forest/[0.07] p-3">
                    <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-xb-forest">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Permintaan simulasi tercatat
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-xb-mute">
                      {formatNumber(volume)} tCO₂e dari {selected?.id} dengan nilai bruto{" "}
                      {formatIdr(settlement.gross_idr)}. Tidak ada pembayaran, transfer unit, atau
                      pencatatan on-chain pada sesi testnet ini.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_392px]">
          <Card className="min-w-0 overflow-hidden">
            <div className="border-b border-xb-line/70 px-4 py-3">
              <SectionLabel>Riwayat transaksi</SectionLabel>
              <p className="mt-0.5 text-[11.5px] text-xb-dim">
                {transactions.length} transaksi tercatat pada ledger simulasi
              </p>
            </div>

            {transactions.length === 0 ? (
              <p className="px-4 py-8 text-center text-[12px] text-xb-mute">
                Belum ada transaksi. Selesaikan verifikasi lahan untuk membuka pasar.
              </p>
            ) : (
              <div className="xb-scroll overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-xb-line/60 text-[10px] uppercase tracking-[0.12em] text-xb-dim">
                      <th className="px-4 py-2.5 font-semibold">Tx</th>
                      <th className="px-3 py-2.5 font-semibold">Parcel</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Volume</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Bruto</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Fee 2%</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Komunitas 60%</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Operasi 40%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.tx_id} className="border-b border-xb-line/40 last:border-0">
                        <td className="px-4 py-3">
                          <p className="font-mono text-[11.5px] text-xb-text">{tx.tx_id}</p>
                          <p className="mt-0.5 text-[10px] text-xb-dim">
                            {new Date(tx.timestamp).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-[11.5px] text-xb-mute">{tx.parcel_id}</td>
                        <td className="px-3 py-3 text-right text-[11.5px] text-xb-text xb-numeric">
                          {formatNumber(tx.volume_tco2e)}
                        </td>
                        <td className="px-3 py-3 text-right text-[11.5px] text-xb-text xb-numeric">
                          {formatIdrShort(tx.gross_amount_idr)}
                        </td>
                        <td className="px-3 py-3 text-right text-[11.5px] text-xb-warning xb-numeric">
                          {formatIdrShort(tx.mrv_allocation_idr)}
                        </td>
                        <td className="px-3 py-3 text-right text-[11.5px] text-xb-verified xb-numeric">
                          {formatIdrShort(tx.community_allocation_idr)}
                        </td>
                        <td className="px-4 py-3 text-right text-[11.5px] text-xb-tech xb-numeric">
                          {formatIdrShort(tx.manager_allocation_idr)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card className="p-4">
            <SectionLabel>Formula settlement</SectionLabel>
            <div className="mt-2.5 space-y-2 text-[11.5px] leading-relaxed text-xb-mute">
              <p className="flex items-start gap-2">
                <Gauge className="mt-0.5 h-3.5 w-3.5 shrink-0 text-xb-tech" aria-hidden="true" />
                Bruto = volume × harga acuan per tCO₂e.
              </p>
              <p className="flex items-start gap-2">
                <Flame className="mt-0.5 h-3.5 w-3.5 shrink-0 text-xb-warning" aria-hidden="true" />
                Biaya sandbox 2% dipotong untuk biaya layanan MRV.
              </p>
              <p className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-xb-verified" aria-hidden="true" />
                Nilai bersih dibagi 60% kas komunitas dan 40% operasi pengelola.
              </p>
            </div>
            <div className="mt-3 space-y-1.5 rounded-lg border border-xb-line/60 bg-xb-raised/30 p-3 font-mono text-[10.5px] text-xb-dim">
              <p>fee = gross × 0.02</p>
              <p>net = gross − fee</p>
              <p>community = net × 0.60</p>
              <p>operations = net × 0.40</p>
            </div>
            <Disclosure className="mt-3" />
          </Card>
        </section>
      </div>
    </AppShell>
  );
}

function Line({
  label,
  value,
  tone,
  strong,
}: {
  label: string;
  value: string;
  tone?: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-[11.5px]">
      <span className="text-xb-mute">{label}</span>
      <span
        className={cx(
          "font-mono xb-numeric",
          tone ?? "text-xb-text",
          strong && "font-semibold"
        )}
      >
        {value}
      </span>
    </div>
  );
}
