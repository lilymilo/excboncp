"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Flame,
  Gauge,
  Leaf,
  Link2,
  MapPin,
  Radio,
  Satellite,
  ShieldQuestion,
  Thermometer,
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
import {
  Card,
  Chip,
  EmptyState,
  SectionLabel,
  StatusPill,
  Tabs,
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

type PanelTab = "ringkasan" | "satelit" | "iot" | "ai" | "verifikasi";

const TABS: { id: PanelTab; label: string }[] = [
  { id: "ringkasan", label: "Ringkasan" },
  { id: "satelit", label: "Satelit" },
  { id: "iot", label: "IoT" },
  { id: "ai", label: "AI" },
  { id: "verifikasi", label: "Verifikasi" },
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
    <div className="flex items-start justify-between gap-4 border-b border-xb-line/50 py-2 last:border-0">
      <span className="text-[11.5px] text-xb-mute">{label}</span>
      <span
        className={cx(
          "text-right text-[12px] font-medium text-xb-text",
          mono && "font-mono text-[11.5px]"
        )}
      >
        {value}
      </span>
    </div>
  );
}

function DataBlock({
  label,
  value,
  unit,
  tone = "default",
  hint,
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
  tone?: "default" | "forest" | "warning" | "blocked" | "tech";
  hint?: string;
}) {
  const toneClass = {
    default: "text-xb-text",
    forest: "text-xb-forest",
    warning: "text-xb-warning",
    blocked: "text-xb-blocked",
    tech: "text-xb-tech",
  }[tone];

  return (
    <div className="rounded-lg border border-xb-line/60 bg-xb-raised/40 p-3">
      <SectionLabel>{label}</SectionLabel>
      <p className={cx("mt-1.5 text-[17px] font-semibold leading-none xb-numeric", toneClass)}>
        {value}
        {unit && <span className="ml-1 text-[10.5px] font-medium text-xb-dim">{unit}</span>}
      </p>
      {hint && <p className="mt-1.5 text-[11px] leading-snug text-xb-dim">{hint}</p>}
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
  verification?: VerificationRecord;
  consent?: ConsentRecord;
  className?: string;
}) {
  const [tab, setTab] = useState<PanelTab>("ringkasan");

  const parcelSensors = sensors.filter((s) => s.parcel_id === parcel.id);
  const settlement = calculateSettlement(parcel.verificationStatus === "verified" ? parcel.settlementEstimateIdr : 0);

  return (
    <Card className={cx("flex min-h-0 flex-col overflow-hidden", className)}>
      <div className="border-b border-xb-line/70 px-4 pb-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-xb-dim">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              {parcel.id}
            </p>
            <h2 className="mt-1 truncate text-[17px] font-semibold tracking-[-0.01em] text-xb-text">
              {parcel.name}
            </h2>
            <p className="mt-0.5 truncate text-[11.5px] text-xb-mute">
              {parcel.community} · {parcel.region}
            </p>
          </div>
          <StatusPill status={parcel.verificationStatus} label={STATUS_LABEL[parcel.verificationStatus]} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Chip>{formatNumber(parcel.area)} ha</Chip>
          <Chip>{formatNumber(parcel.carbonStock)} tCO₂e stok</Chip>
          <Chip>{formatNumber(parcel.availableUnits)} unit siap jual</Chip>
          {parcel.frozenUnits > 0 && (
            <span className="inline-flex items-center gap-1 rounded border border-xb-blocked/30 bg-xb-blocked/10 px-1.5 py-0.5 text-[11px] font-medium text-xb-blocked">
              <AlertTriangle className="h-3 w-3" aria-hidden="true" />
              {formatNumber(parcel.frozenUnits)} unit dibekukan
            </span>
          )}
          <span
            className={cx(
              "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium",
              consent?.status === "granted"
                ? "border-xb-verified/30 bg-xb-verified/10 text-xb-verified"
                : "border-xb-warning/30 bg-xb-warning/10 text-xb-warning"
            )}
          >
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            {CONSENT_LABEL[consent?.status ?? "none"]}
          </span>
        </div>
      </div>

      <Tabs
        items={TABS}
        value={tab}
        onChange={setTab}
        label={`Detail ${parcel.name}`}
      />

      <div className="xb-scroll min-h-0 flex-1 overflow-y-auto p-4">
        {tab === "ringkasan" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <DataBlock label="Luas area" value={formatNumber(parcel.area)} unit="ha" />
              <DataBlock
                label="Stok karbon"
                value={formatNumber(parcel.carbonStock)}
                unit="tCO₂e"
                hint="Estimasi biomassa terverifikasi"
              />
              <DataBlock
                label="Unit tersedia"
                value={formatNumber(parcel.availableUnits)}
                unit="unit"
                tone={parcel.availableUnits > 0 ? "forest" : "blocked"}
              />
              <DataBlock
                label="Unit dibekukan"
                value={formatNumber(parcel.frozenUnits)}
                unit="unit"
                tone={parcel.frozenUnits > 0 ? "warning" : "default"}
              />
            </div>

            <div className="rounded-lg border border-xb-line/60 bg-xb-raised/30 p-3">
              <SectionLabel>Estimasi settlement (gross)</SectionLabel>
              <p className="mt-1.5 text-[19px] font-semibold leading-none text-xb-forest xb-numeric">
                {formatIdr(settlement.gross_idr)}
              </p>
              <div className="mt-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="text-xb-mute">Biaya sandbox 2%</span>
                  <span className="font-mono text-xb-warning">
                    −{formatIdr(settlement.sandbox_fee_idr)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="text-xb-mute">Kas komunitas 60%</span>
                  <span className="font-mono text-xb-verified">
                    {formatIdr(settlement.community_idr)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="text-xb-mute">Operasi pengelola 40%</span>
                  <span className="font-mono text-xb-tech">
                    {formatIdr(settlement.operations_idr)}
                  </span>
                </div>
              </div>
              {parcel.verificationStatus !== "verified" && (
                <p className="mt-2.5 flex items-start gap-1.5 text-[11px] leading-snug text-xb-warning">
                  <ShieldQuestion className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                  Settlement baru dibuka setelah status lahan terverifikasi.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-xb-line/60 px-3 py-1.5">
              <Row label="Pembaruan terakhir" value={formatDateTime(parcel.lastUpdate)} />
              <Row label="Jumlah sensor" value={`${parcelSensors.length} unit`} />
              <Row
                label="Kelayakan pasar"
                value={parcel.eligibility ? "Layak" : "Belum layak"}
              />
            </div>
          </div>
        )}

        {tab === "satelit" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <DataBlock
                label="NDVI"
                value={parcel.ndvi !== undefined ? parcel.ndvi.toFixed(2) : "—"}
                tone={
                  parcel.ndvi !== undefined && parcel.ndvi >= 0.7 ? "forest" : "warning"
                }
                hint="Indeks vegetasi 0–1"
              />
              <DataBlock
                label="SAR"
                value={parcel.sar !== undefined ? parcel.sar.toFixed(2) : "—"}
                tone="tech"
                hint="Backscatter radar"
              />
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-xb-line/60 bg-xb-raised/30 p-3">
              <Satellite className="mt-0.5 h-4 w-4 shrink-0 text-xb-tech" aria-hidden="true" />
              <div>
                <p className="text-[12px] font-medium text-xb-text">
                  {parcel.ndvi !== undefined && parcel.ndvi >= 0.7
                    ? "Tutupan kanopi relatif sehat"
                    : "Tutupan kanopi perlu perhatian"}
                </p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-xb-mute">
                  NDVI {parcel.ndvi ?? "—"} dengan SAR {parcel.sar ?? "—"} dibaca sebagai
                  indikator kerapatan vegetasi. Angka ini dipakai sebagai pembanding
                  telemetri lapangan, bukan pengganti verifikasi petugas.
                </p>
                <p className="mt-2 text-[11px] text-xb-dim">
                  Citra acuan: {formatDateTime(parcel.lastUpdate)}
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === "iot" && (
          <div className="space-y-2.5">
            {parcelSensors.length === 0 ? (
              <EmptyState
                title="Belum ada sensor terhubung"
                body="Perangkat IoT untuk lahan ini belum mengirim data ke gateway."
              />
            ) : (
              parcelSensors.map((sensor) => (
                <div
                  key={sensor.sensor_id}
                  className="rounded-lg border border-xb-line/60 bg-xb-raised/30 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex items-center gap-1.5 text-[12px] font-semibold text-xb-text">
                      <Radio className="h-3.5 w-3.5 text-xb-tech" aria-hidden="true" />
                      {sensor.sensor_id}
                      <span className="font-normal text-xb-dim">· {sensor.type}</span>
                    </p>
                    <span
                      className={cx(
                        "rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
                        sensor.anomaly
                          ? "border-xb-blocked/30 bg-xb-blocked/10 text-xb-blocked"
                          : "border-xb-verified/30 bg-xb-verified/10 text-xb-verified"
                      )}
                    >
                      {sensor.anomaly ? "Anomali" : "Normal"}
                    </span>
                  </div>

                  <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11.5px] sm:grid-cols-3">
                    <span className="flex items-center gap-1 text-xb-mute">
                      <Thermometer className="h-3 w-3" aria-hidden="true" />
                      {sensor.temperature.toFixed(1)} °C
                    </span>
                    <span className="text-xb-mute">{sensor.humidity}% RH</span>
                    <span className="text-xb-mute">{sensor.soil_moisture}% tanah</span>
                    <span className="text-xb-mute">
                      {sensor.co2e_tonPerDay.toFixed(3)} tCO₂e/hari
                    </span>
                    {sensor.flameDetected && (
                      <span className="flex items-center gap-1 font-semibold text-xb-blocked">
                        <Flame className="h-3 w-3" aria-hidden="true" />
                        Api terdeteksi
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-[10.5px] text-xb-dim">
                    {formatDateTime(sensor.timestamp)}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "ai" && (
          <div className="space-y-3">
            {!assessment ? (
              <EmptyState
                title="Belum ada penilaian AI"
                body="Model belum menjalankan evaluasi untuk lahan ini."
              />
            ) : (
              <>
                <div className="flex items-center justify-between gap-2 rounded-lg border border-xb-line/60 bg-xb-raised/30 p-3">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-xb-tech" aria-hidden="true" />
                    <div>
                      <SectionLabel>Skor anomali</SectionLabel>
                      <p className="mt-1 text-[17px] font-semibold leading-none text-xb-text xb-numeric">
                        {assessment.ai2_score.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <StatusPill
                    status={assessment.status === "passed" ? "verified" : "warning"}
                    label={assessment.status === "passed" ? "Lolos" : "Perlu tinjauan"}
                  />
                </div>

                <div className="rounded-lg border border-xb-line/60 p-3">
                  <SectionLabel>Ringkasan AI-1</SectionLabel>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-xb-text">
                    {assessment.ai1_summary}
                  </p>
                </div>

                <div className="rounded-lg border border-xb-line/60 p-3">
                  <SectionLabel>Analisis anomali AI-2</SectionLabel>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-xb-text">
                    {assessment.ai2_anomaly}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {assessment.evidence.map((item) => (
                      <Chip key={item}>{item}</Chip>
                    ))}
                  </div>
                  <p className="mt-2 text-[10.5px] text-xb-dim">
                    {formatDateTime(assessment.timestamp)}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {tab === "verifikasi" && (
          <div className="space-y-3">
            {!verification ? (
              <EmptyState
                title="Belum ada catatan verifikasi"
                body="Auditor belum menerbitkan attestation untuk lahan ini."
              />
            ) : (
              <>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[12px] font-semibold text-xb-text">
                      {verification.record_id}
                    </p>
                    <p className="text-[11px] text-xb-dim">
                      Blok #{formatNumber(verification.block_index)}
                    </p>
                  </div>
                  <StatusPill
                    status={verification.tampered ? "blocked" : "verified"}
                    label={verification.tampered ? "Hash tidak cocok" : "Hash cocok"}
                  />
                </div>

                <div className="flex items-start gap-2 rounded-lg border border-xb-line/60 bg-xb-raised/30 p-3">
                  <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-xb-tech" aria-hidden="true" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div>
                      <SectionLabel>Hash</SectionLabel>
                      <p className="mt-0.5 break-all font-mono text-[10.5px] text-xb-text">
                        {shortHash(verification.hash)}
                      </p>
                    </div>
                    <div>
                      <SectionLabel>Prev hash</SectionLabel>
                      <p className="mt-0.5 break-all font-mono text-[10.5px] text-xb-mute">
                        {shortHash(verification.prev_hash)}
                      </p>
                    </div>
                    <div>
                      <SectionLabel>EAS UID</SectionLabel>
                      <p className="mt-0.5 break-all font-mono text-[10.5px] text-xb-mute">
                        {shortHash(verification.eas_uid, 12, 10)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-xb-line/60 px-3 py-1.5">
                  <Row label="Waktu segel" value={formatDateTime(verification.timestamp)} />
                  <Row
                    label="Tx hash"
                    value={shortHash(verification.tx_hash, 8, 6)}
                    mono
                  />
                  <Row label="Jaringan" value="Base Sepolia" />
                  <Row label="Status rantai" value="Simulasi testnet" />
                </div>

                {verification.reasons.length > 0 && (
                  <div className="rounded-lg border border-xb-blocked/30 bg-xb-blocked/5 p-3">
                    <SectionLabel className="text-xb-blocked">Temuan</SectionLabel>
                    <ul className="mt-1.5 space-y-1 text-[11.5px] text-xb-mute">
                      {verification.reasons.map((reason) => (
                        <li key={reason} className="flex items-start gap-1.5">
                          <AlertTriangle
                            className="mt-0.5 h-3 w-3 shrink-0 text-xb-blocked"
                            aria-hidden="true"
                          />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 border-t border-xb-line/70 px-4 py-2.5 text-[10.5px] text-xb-dim">
        <Leaf className="h-3 w-3" aria-hidden="true" />
        Data lahan bersumber dari telemetri lapangan dan citra satelit.
      </div>
    </Card>
  );
}
