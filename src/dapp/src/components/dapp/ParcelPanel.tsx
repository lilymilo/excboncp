"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Flame,
  Gauge,
  Leaf,
  MapPin,
  Radio,
  Satellite,
  ShieldQuestion,
} from "lucide-react";
import {
  calculateSettlement,
  type AIAssessment,
  type ConsentRecord,
  type ParcelItem,
  type SensorData,
  type VerificationRecord,
  type VerificationStatus,
} from "@/context/DappContext";
import { SensorTelemetryChart } from "./CarbonCharts";
import {
  Card,
  Chip,
  EmptyState,
  StatusPill,
  Tabs,
  buttonClass,
  cx,
  formatIdr,
  formatNumber,
} from "./phantom-ui";

const STATUS_LABEL: Record<VerificationStatus, string> = {
  verified: "Terverifikasi",
  warning: "Peringatan",
  pending: "Menunggu",
  blocked: "Diblokir",
  dispute: "Sengketa",
};

const CONSENT_LABEL: Record<ConsentRecord["status"], string> = {
  granted: "Izin warga aktif",
  revoked: "Izin dicabut",
  none: "Belum ada izin",
};

type PanelTab = "ringkasan" | "satelit" | "iot" | "verifikasi";

const TABS: { id: PanelTab; label: string }[] = [
  { id: "ringkasan", label: "Ringkasan" },
  { id: "satelit", label: "Satelit & AI" },
  { id: "iot", label: "Sensor IoT" },
  { id: "verifikasi", label: "Bukti Hash" },
];

function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortHash(hash: string, head = 10, tail = 8) {
  if (hash.length <= head + tail + 3) return hash;
  return `${hash.slice(0, head)}…${hash.slice(-tail)}`;
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#252B27] py-2.5 last:border-0">
      <span className="text-[12.5px] text-[#A6ADA7]">{label}</span>
      <span
        className={cx(
          "text-right text-[13px] font-medium text-[#F4F5F2]",
          mono && "font-mono text-[12px]"
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function ParcelPanel({
  parcel,
  sensors,
  assessment,
  verification,
  consent,
  className,
}: {
  parcel: ParcelItem;
  sensors: SensorData[];
  assessment?: AIAssessment;
  verification?: VerificationRecord & { approved_by?: string };
  consent?: ConsentRecord;
  className?: string;
}) {
  const [tab, setTab] = useState<PanelTab>("ringkasan");

  const parcelSensors = sensors.filter((s) => s.parcel_id === parcel.id);
  const settlement = calculateSettlement(
    parcel.verificationStatus === "verified" ? parcel.settlementEstimateIdr : 0
  );

  return (
    <Card className={cx("flex min-h-0 flex-col overflow-hidden", className)}>
      <div className="border-b border-[#252B27] px-5 pb-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-mono text-[12px] font-medium text-[#72C99A]">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {parcel.id}
            </p>
            <h2 className="mt-1 truncate text-[18px] font-semibold tracking-[-0.015em] text-[#F4F5F2]">
              {parcel.name}
            </h2>
            <p className="mt-0.5 truncate text-[13px] text-[#A6ADA7]">
              {parcel.community} · {parcel.region}
            </p>
          </div>
          <StatusPill
            status={parcel.verificationStatus}
            label={STATUS_LABEL[parcel.verificationStatus]}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px]">
          <span
            className={cx(
              "inline-flex items-center gap-1.5 font-medium",
              consent?.status === "granted" ? "text-[#72C99A]" : "text-[#F2B84B]"
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {CONSENT_LABEL[consent?.status ?? "none"]}
          </span>
          {parcel.frozenUnits > 0 && (
            <span className="inline-flex items-center gap-1.5 font-medium text-[#ED7770]">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {formatNumber(parcel.frozenUnits)} unit dibekukan
            </span>
          )}
        </div>
      </div>

      <div className="px-3 pt-1">
        <Tabs items={TABS} value={tab} onChange={setTab} label="Detail inspeksi parcel" />
      </div>

      <div className="xb-scroll flex-1 overflow-y-auto p-5">
        {tab === "ringkasan" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-[#252B27] bg-[#1D211E] p-4">
              <div>
                <p className="text-[12px] text-[#A6ADA7]">Unit Siap Jual</p>
                <p className="mt-1 text-[20px] font-semibold text-[#72C99A] xb-numeric">
                  {formatNumber(parcel.availableUnits)}
                  <span className="ml-1 text-[12px] font-normal text-[#8B948D]">tCO₂e</span>
                </p>
              </div>
              <div>
                <p className="text-[12px] text-[#A6ADA7]">Estimasi Settlement</p>
                <p className="mt-1 text-[20px] font-semibold text-[#F4F5F2] xb-numeric">
                  {parcel.verificationStatus === "verified" ? formatIdr(settlement.gross_idr) : "Tertahan"}
                </p>
              </div>
            </div>

            <div>
              <Row label="Luas area" value={`${formatNumber(parcel.area)} ha`} />
              <Row label="Stok karbon" value={`${formatNumber(parcel.carbonStock)} tCO₂e`} />
              <Row
                label="Nilai net (setelah fee 2%)"
                value={parcel.verificationStatus === "verified" ? formatIdr(settlement.net_idr) : "Menunggu verifikasi"}
              />
              <Row
                label="Alokasi kas komunitas (60%)"
                value={parcel.verificationStatus === "verified" ? formatIdr(settlement.community_idr) : "-"}
              />
              <Row label="Pembaruan terakhir" value={formatDateTime(parcel.lastUpdate)} />
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Link href="/screener" className={buttonClass("lavender", "flex-1 rounded-full")}>
                <Leaf className="h-4 w-4" aria-hidden="true" />
                Buka di Screener Pasar
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/consent" className={buttonClass("secondary", "rounded-full")}>
                Cek Izin FPIC
              </Link>
            </div>
          </div>
        )}

        {tab === "satelit" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-[#252B27] bg-[#1D211E] p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#23865A]/20 text-[#72C99A]">
                  <Satellite className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[12px] text-[#A6ADA7]">Indeks Vegetasi (NDVI)</p>
                  <p className="text-[20px] font-semibold text-[#F4F5F2] xb-numeric">
                    {parcel.ndvi !== undefined ? parcel.ndvi.toFixed(2) : "N/A"}
                  </p>
                </div>
              </div>
              <Chip>{parcel.ndvi && parcel.ndvi >= 0.7 ? "Kanopi Rapat" : "Perlu Pantauan"}</Chip>
            </div>

            {assessment ? (
              <div className="space-y-3 rounded-xl border border-[#252B27] bg-[#1D211E] p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#F4F5F2]">
                    <Gauge className="h-4 w-4 text-[#AA9AF5]" aria-hidden="true" />
                    Penilaian AI MRV
                  </span>
                  <span
                    className={cx(
                      "rounded-lg px-2.5 py-0.5 text-[11.5px] font-semibold",
                      assessment.status === "passed"
                        ? "bg-[#23865A]/20 text-[#72C99A]"
                        : "bg-[#F2B84B]/15 text-[#F2B84B]"
                    )}
                  >
                    Skor {assessment.ai2_score.toFixed(2)}
                  </span>
                </div>
                <p className="text-[13px] leading-relaxed text-[#F4F5F2]">
                  {assessment.ai1_summary}
                </p>
                <p className="text-[12.5px] leading-relaxed text-[#A6ADA7]">
                  Catatan anomali: {assessment.ai2_anomaly}
                </p>
              </div>
            ) : (
              <EmptyState
                title="Belum ada analisis AI"
                body="Evaluasi citra satelit & sensor otomatis belum dijalankan untuk parcel ini."
              />
            )}
          </div>
        )}

        {tab === "iot" && (
          <div className="space-y-4">
            {parcelSensors.length > 0 ? (
              <>
                <SensorTelemetryChart sensors={parcelSensors} />
                <div className="divide-y divide-[#252B27] rounded-xl border border-[#252B27] bg-[#1D211E]">
                  {parcelSensors.map((sensor) => (
                    <div key={sensor.sensor_id} className="space-y-2 p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-2 font-mono text-[12.5px] font-semibold text-[#F4F5F2]">
                          <Radio className="h-3.5 w-3.5 text-[#AA9AF5]" aria-hidden="true" />
                          {sensor.sensor_id}
                        </span>
                        {sensor.flameDetected ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#ED7770]/15 px-2 py-0.5 text-[11.5px] font-semibold text-[#ED7770]">
                            <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                            Api terdeteksi
                          </span>
                        ) : sensor.anomaly ? (
                          <span className="rounded-md bg-[#F2B84B]/15 px-2 py-0.5 text-[11.5px] font-semibold text-[#F2B84B]">
                            Anomali
                          </span>
                        ) : (
                          <span className="rounded-md bg-[#23865A]/20 px-2 py-0.5 text-[11.5px] font-semibold text-[#72C99A]">
                            Aman
                          </span>
                        )}
                      </div>
                      <p className="text-[12.5px] text-[#A6ADA7] xb-numeric">
                        {sensor.temperature.toFixed(1)}°C · RH {sensor.humidity}% · Tanah{" "}
                        {sensor.soil_moisture}% · {sensor.co2e_tonPerDay.toFixed(3)} tCO₂e/hari
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                title="Tidak ada node IoT"
                body="Belum ada telemetri node ESP32 yang terhubung pada parcel ini."
              />
            )}
          </div>
        )}

        {tab === "verifikasi" && (
          <div className="space-y-4">
            {verification ? (
              <>
                <div className="rounded-xl border border-[#252B27] bg-[#1D211E] p-4">
                  <Row label="Nomor Blok" value={`#${verification.block_index}`} mono />
                  <Row label="Hash SHA-256" value={shortHash(verification.hash)} mono />
                  <Row label="Prev Hash" value={shortHash(verification.prev_hash)} mono />
                  <Row label="EAS UID" value={shortHash(verification.eas_uid)} mono />
                  <Row label="Tx Hash" value={shortHash(verification.tx_hash)} mono />
                  <Row label="Auditor" value={verification.approved_by ?? "Auditor MRV (Base Sepolia)"} />
                </div>
                <Link href="/verify" className={buttonClass("secondary", "w-full rounded-full")}>
                  Buka Rantai Hash Lengkap
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </>
            ) : (
              <EmptyState
                illustration={<ShieldQuestion className="h-10 w-10 text-[#8B948D]" />}
                title="Belum ada blok verifikasi"
                body="Parcel ini belum diterbitkan ke rantai hash SHA-256."
              />
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
