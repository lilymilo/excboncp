"use client";

import React, { useState } from "react";
import Link from "next/link";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import {
  AlertTriangle,
  ArrowUpRight,
  Flame,
  Gauge,
  MapPin,
  Radio,
  Satellite,
  ShieldCheck,
} from "lucide-react";
import {
  calculateSettlement,
  type AIAssessment,
  type ConsentRecord,
  type ParcelItem,
  type SensorData,
  type UserRole,
  type VerificationRecord,
} from "@/context/DappContext";
import {
  formatWibDateTime,
  toCanonicalStatus,
} from "@/lib/dashboard-helpers";
import { ExplorerLink } from "@/components/ui/ExplorerLink";
import { EAS_LIVE, attestationExplorerUrl, txExplorerUrl } from "@/lib/explorer";
import { formatIdr, formatNumber } from "./phantom-ui";
import {
  BotanicalCard,
  CanonicalStatusBadge,
  ConsentStatusBadge,
} from "./BotanicalPrimitives";
import { HashSeal } from "./HashSeal";

type TabId = "ringkasan" | "sensor" | "satelit" | "segel";

function DataRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-[13.5px] font-medium text-[var(--ink-muted)]">{label}</span>
      <span
        className={`text-right text-[14px] font-semibold text-[var(--ink)] ${
          mono ? "font-telemetry text-[13px]" : "font-telemetry"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function ParcelInspectionPanel({
  parcel,
  sensors,
  assessment,
  verification,
  consent,
  role = "guest",
  inDrawer = false,
}: {
  parcel: ParcelItem;
  sensors: SensorData[];
  assessment?: AIAssessment;
  verification?: VerificationRecord & { approved_by?: string };
  consent?: ConsentRecord;
  role?: UserRole;
  inDrawer?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("ringkasan");
  const canonical = toCanonicalStatus(parcel.verificationStatus);
  const parcelSensors = sensors.filter((s) => s.parcel_id === parcel.id);
  const settlement = calculateSettlement(
    canonical === "VERIFIED" ? parcel.settlementEstimateIdr : 0
  );

  const innerContent = (
    <div className="flex flex-col">
      <div className={inDrawer ? "pb-4" : "border-b border-[var(--line)] px-5 pb-4 pt-5"}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-telemetry flex items-center gap-1.5 text-[12px] font-semibold text-[var(--forest-700)]">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{parcel.id}</span>
            </p>
            <h2 className="font-display mt-1 text-[20px] font-bold tracking-tight leading-snug text-[var(--ink)]">
              {parcel.name}
            </h2>
            <p className="mt-0.5 text-[13.5px] text-[var(--ink-muted)]">
              {parcel.community} · {parcel.region}
            </p>
          </div>
          <CanonicalStatusBadge status={canonical} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <ConsentStatusBadge status={consent?.status ?? parcel.consentStatus} />
          {parcel.frozenUnits > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--status-blocked-bg)] px-3 py-1 text-[13px] font-semibold text-[var(--status-blocked-ink)]">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{formatNumber(parcel.frozenUnits)} unit ditahan</span>
            </span>
          )}
        </div>
      </div>

      <TabsPrimitive.Root
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabId)}
        className="flex flex-col"
      >
        <div className={inDrawer ? "pt-3 px-1" : "px-5 pt-3.5"}>
          <TabsPrimitive.List
            aria-label="Bagian inspeksi lahan"
            className="flex p-1 rounded-[12px] bg-[var(--surface-sunken)] border border-[var(--line-subtle)] gap-1"
          >
            {[
              { id: "ringkasan" as const, label: "Ringkasan" },
              { id: "sensor" as const, label: `Sensor (${parcelSensors.length})` },
              { id: "satelit" as const, label: "Satelit & AI" },
              { id: "segel" as const, label: "Segel" },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <TabsPrimitive.Trigger
                  key={tab.id}
                  value={tab.id}
                  className={`flex-1 min-h-[34px] rounded-[9px] px-2 text-[13px] font-semibold transition-all active:scale-[0.98] ${
                    active
                      ? "bg-[var(--surface)] text-[var(--ink)] shadow-xs"
                      : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {tab.label}
                </TabsPrimitive.Trigger>
              );
            })}
          </TabsPrimitive.List>
        </div>

        <div className={inDrawer ? "pt-3" : "p-5"}>
          <TabsPrimitive.Content value="ringkasan" className="space-y-4 focus:outline-none">
            <div className="grid grid-cols-2 gap-3 rounded-[16px] border border-[var(--line-subtle)] bg-[var(--surface-soft)] p-4 shadow-xs">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">Unit siap dijual</p>
                <p className="font-display font-bold mt-1 text-[24px] text-[var(--status-verified-ink)] leading-none tracking-tight">
                  {formatNumber(parcel.availableUnits)}{" "}
                  <span className="text-[13px] font-medium text-[var(--ink-muted)]">tCO2e</span>
                </p>
              </div>
              <div className="border-l border-[var(--line-subtle)] pl-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">Nilai simulasi</p>
                <p className="font-display font-bold mt-1 text-[20px] text-[var(--ink)] leading-none tracking-tight">
                  {canonical === "VERIFIED" ? formatIdr(settlement.gross_idr) : "Ditahan"}
                </p>
              </div>
            </div>

            <div className="rounded-[14px] border border-[var(--line-subtle)] bg-[var(--surface-soft)] px-4 py-0.5 divide-y divide-[var(--line-subtle)] shadow-xs">
              <DataRow label="Luas pantau" value={`${formatNumber(parcel.area)} ha`} />
              <DataRow label="Stok karbon" value={`${formatNumber(parcel.carbonStock)} tCO2e`} />
              <DataRow
                label="Bagian komunitas (60%)"
                value={canonical === "VERIFIED" ? formatIdr(settlement.community_idr) : "-"}
              />
              <DataRow
                label="Bagian pengelola (40%)"
                value={canonical === "VERIFIED" ? formatIdr(settlement.operations_idr) : "-"}
              />
              <DataRow
                label="Pembaruan terakhir"
                value={formatWibDateTime(parcel.lastUpdate)}
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href={`/peta/${encodeURIComponent(parcel.id)}`}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[12px] bg-[var(--forest-700)] px-4 text-[13.5px] font-semibold text-white shadow-xs transition-all hover:bg-[var(--forest-800)] active:scale-[0.98]"
              >
                <span>Buka halaman lahan</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              {role === "community" && (
                <Link
                  href={`/izin/${encodeURIComponent(parcel.id)}`}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[12px] border border-[var(--line-subtle)] bg-[var(--leaf-100)] px-4 text-[13.5px] font-semibold text-[var(--forest-800)] transition-all hover:bg-[var(--selection-bg)] active:scale-[0.98]"
                >
                  <span>Kelola izin warga</span>
                </Link>
              )}
            </div>
          </TabsPrimitive.Content>

          <TabsPrimitive.Content value="sensor" className="space-y-3 focus:outline-none">
            {parcelSensors.length === 0 ? (
              <p className="rounded-[14px] border border-[var(--line-subtle)] bg-[var(--surface-soft)] p-4 text-[14px] text-[var(--ink-muted)]">
                Belum ada telemetri node IoT tercatat untuk lahan ini.
              </p>
            ) : (
              parcelSensors.map((s) => (
                <div
                  key={s.sensor_id}
                  className="rounded-[14px] border border-[var(--line-subtle)] bg-[var(--surface-soft)] p-3.5 shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Radio className="h-4 w-4 text-[var(--seal-600)]" aria-hidden="true" />
                      <span className="font-telemetry text-[13.5px] font-bold text-[var(--ink)]">
                        {s.sensor_id}
                      </span>
                      <span className="text-[12.5px] font-medium text-[var(--ink-muted)]">
                        · {s.type}
                      </span>
                    </div>
                    {s.flameDetected ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--status-blocked-bg)] px-2.5 py-0.5 text-[12px] font-semibold text-[var(--status-blocked-ink)]">
                        <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Api terdeteksi</span>
                      </span>
                    ) : s.anomaly ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--status-warning-bg)] px-2.5 py-0.5 text-[12px] font-semibold text-[var(--status-warning-ink)]">
                        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Anomali</span>
                      </span>
                    ) : (
                      <span className="rounded-full bg-[var(--status-verified-bg)] px-2.5 py-0.5 text-[12px] font-semibold text-[var(--status-verified-ink)]">
                        Normal
                      </span>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-[13.5px]">
                    <div className="rounded-[10px] border border-[var(--line-subtle)]/60 bg-[var(--surface)] p-2">
                      <p className="text-[11.5px] text-[var(--ink-muted)]">Suhu</p>
                      <p className="font-telemetry font-bold text-[var(--ink)]">{s.temperature} °C</p>
                    </div>
                    <div className="rounded-[10px] border border-[var(--line-subtle)]/60 bg-[var(--surface)] p-2">
                      <p className="text-[11.5px] text-[var(--ink-muted)]">Kelembapan</p>
                      <p className="font-telemetry font-bold text-[var(--ink)]">{s.humidity}%</p>
                    </div>
                    <div className="rounded-[10px] border border-[var(--line-subtle)]/60 bg-[var(--surface)] p-2">
                      <p className="text-[11.5px] text-[var(--ink-muted)]">Tanah</p>
                      <p className="font-telemetry font-bold text-[var(--ink)]">{s.soil_moisture}%</p>
                    </div>
                  </div>
                  <p className="mt-2 text-[12px] text-[var(--ink-muted)]">
                    Diterima {formatWibDateTime(s.timestamp)}
                  </p>
                </div>
              ))
            )}
          </TabsPrimitive.Content>

          <TabsPrimitive.Content value="satelit" className="space-y-3.5 focus:outline-none">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[14px] border border-[var(--line-subtle)] bg-[var(--surface-soft)] p-3.5 shadow-xs">
                <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--ink-muted)]">
                  <Satellite className="h-4 w-4 text-[var(--forest-700)]" aria-hidden="true" />
                  <span>Indeks NDVI</span>
                </p>
                <p className="font-display font-bold mt-1.5 text-[24px] text-[var(--ink)] leading-none tracking-tight">
                  {(parcel.ndvi ?? 0).toFixed(2)}
                </p>
                <p className="mt-1 text-[11.5px] text-[var(--ink-muted)]">Ambang minimum 0,70</p>
              </div>
              <div className="rounded-[14px] border border-[var(--line-subtle)] bg-[var(--surface-soft)] p-3.5 shadow-xs">
                <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--ink-muted)]">
                  <Gauge className="h-4 w-4 text-[var(--seal-600)]" aria-hidden="true" />
                  <span>Sinyal radar (SAR)</span>
                </p>
                <p className="font-display font-bold mt-1.5 text-[24px] text-[var(--ink)] leading-none tracking-tight">
                  {(parcel.sar ?? 0).toFixed(2)}
                </p>
                <p className="mt-1 text-[11.5px] text-[var(--ink-muted)]">Struktur tutupan kanopi</p>
              </div>
            </div>

            <div className="rounded-[14px] border border-[var(--line-subtle)] bg-[var(--surface)] p-4 shadow-xs">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[14px] font-bold text-[var(--ink)]">Penjelasan AI</p>
                <span className="text-[11.5px] font-semibold text-[var(--seal-600)] bg-[var(--seal-100)]/60 px-2 py-0.5 rounded-full">
                  Informasi pembantu
                </span>
              </div>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink)]">
                {assessment?.ai1_summary ??
                  "Belum ada ringkasan AI baru untuk pembacaan terakhir pada lahan ini."}
              </p>
              <p className="mt-2 text-[12px] text-[var(--ink-muted)] leading-normal">
                Catatan: AI hanya membantu merangkum bukti; status lahan tetap ditetapkan oleh aturan
                sistem dan auditor manusia.
              </p>
            </div>
          </TabsPrimitive.Content>

          <TabsPrimitive.Content value="segel" className="space-y-3.5 focus:outline-none">
            {verification ? (
              <div className="space-y-3.5">
                <div className="flex items-center gap-3.5 rounded-[14px] border border-[var(--seal-line)] bg-[var(--seal-100)]/50 p-4 shadow-xs">
                  <HashSeal hash={verification.hash} size={56} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-[14px] font-bold text-[var(--ink)]">
                      <ShieldCheck className="h-4 w-4 text-[var(--seal-600)]" aria-hidden="true" />
                      <span>Blok Buku Catatan #{verification.block_index}</span>
                    </p>
                    <p className="font-telemetry mt-1 truncate text-[12px] text-[var(--seal-600)]">
                      {verification.hash}
                    </p>
                    <p className="mt-0.5 text-[12.5px] text-[var(--ink-muted)]">
                      {EAS_LIVE && verification.eas_uid && /^0x[0-9a-f]{64}$/i.test(verification.eas_uid)
                        ? "Hash tercatat di EAS testnet"
                        : "Tersegel di rantai lokal · EAS simulasi"}
                    </p>
                    {EAS_LIVE && [verification.eas_uid, verification.tx_hash].some((value) => value && /^0x[0-9a-f]{64}$/i.test(value)) && (
                      <div className="mt-1 flex flex-wrap items-center gap-x-3.5">
                        <ExplorerLink
                          href={attestationExplorerUrl(/^0x[0-9a-f]{64}$/i.test(verification.eas_uid) ? verification.eas_uid : null)}
                          label="Attestation"
                        />
                        {verification.tx_hash && /^0x[0-9a-f]{64}$/i.test(verification.tx_hash) && <ExplorerLink href={txExplorerUrl(verification.tx_hash)} label="Transaksi" />}
                      </div>
                    )}
                  </div>
                </div>
                <Link
                  href={`/verifikasi/${encodeURIComponent(String(verification.block_index))}`}
                  className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-[12px] bg-[var(--seal-600)] px-5 text-[14px] font-semibold text-white shadow-xs transition-all hover:bg-[var(--seal-700)] active:scale-[0.98]"
                >
                  <span>Periksa segel keaslian</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            ) : (
              <div className="rounded-[14px] border border-[var(--line-subtle)] bg-[var(--surface-soft)] p-4 shadow-xs">
                <p className="text-[14px] font-semibold text-[var(--ink)]">
                  Belum ada blok buku catatan untuk lahan ini
                </p>
                <p className="mt-1 text-[13.5px] text-[var(--ink-muted)]">
                  Lahan perlu memenuhi syarat verifikasi dan tinjauan auditor sebelum disegel ke buku
                  catatan.
                </p>
                {role === "auditor" && (
                  <Link
                    href="/tinjau"
                    className="mt-3 inline-flex min-h-[40px] items-center gap-1.5 rounded-[12px] bg-[var(--forest-700)] px-4 text-[13.5px] font-semibold text-white transition-all hover:bg-[var(--forest-800)] active:scale-[0.98]"
                  >
                    <span>Buka antrean Tinjau</span>
                  </Link>
                )}
              </div>
            )}
          </TabsPrimitive.Content>
        </div>
      </TabsPrimitive.Root>
    </div>
  );

  if (inDrawer) {
    return innerContent;
  }

  return <BotanicalCard className="overflow-hidden">{innerContent}</BotanicalCard>;
}
