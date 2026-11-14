"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Activity,
  ArrowUpRight,
  Clock,
  Cpu,
  Droplets,
  Leaf,
  Radio,
  Satellite,
  ShieldCheck,
  Thermometer,
} from "lucide-react";
import { BotanicalAppShell } from "@/components/dapp/BotanicalAppShell";
import {
  BotanicalCard,
  BotanicalPageHeader,
  CanonicalStatusBadge,
  LiveTelemetryPill,
  PageStatePanel,
} from "@/components/dapp/BotanicalPrimitives";
import { Pagination } from "@/components/ui/Pagination";
import { useDashboardState } from "@/components/dapp/useDashboardStore";
import { formatWibDateTime, formatWibTime, toCanonicalStatus } from "@/lib/dashboard-helpers";
import {
  fetchMonitoringMetrics,
  type MonitoringMetricsData,
} from "@/lib/exbon-api";
import { LiveNumber } from "@/components/motion";

interface LiveSensorReading {
  id: string;
  parcel_id: string;
  device_id: string;
  ts: string;
  temp_c: number;
  humidity_pct: number;
  soil_pct: number;
  flame: number;
  fire_status: string;
  sensor_flag: boolean;
  source: string;
}

const SENSOR_PAGE_SIZE = 6;
const SATELLITE_PAGE_SIZE = 4;

export function IndikatorView() {
  const searchParams = useSearchParams();
  const stateParam = searchParams.get("state");
  const { parcels, sensors, aiAssessments, verificationRecords, isLoading } = useDashboardState();

  const [metrics, setMetrics] = useState<MonitoringMetricsData | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [liveReading, setLiveReading] = useState<LiveSensorReading | null>(null);
  const [sensorPage, setSensorPage] = useState(1);
  const [satellitePage, setSatellitePage] = useState(1);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "");
    if (!apiBase) return;
    let active = true;
    const load = async () => {
      try {
        const res = await fetch(`${apiBase}/api/sensor/readings?limit=20`, { cache: "no-store" });
        if (!res.ok) return;
        const rows = (await res.json()) as LiveSensorReading[];
        const latestReading = rows.find((row) => row.source === "esp" || row.source === "simulator");
        if (active && latestReading) setLiveReading(latestReading);
      } catch {
        // Server lapangan opsional; kartu simulasi tetap tampil saat API mati.
      }
    };
    load();
    const timer = window.setInterval(load, 10000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetchMonitoringMetrics(sensors, verificationRecords)
      .then((data) => {
        if (active) setMetrics(data);
      })
      .catch(() => {
        if (active) setMetrics(null);
      });
    return () => {
      active = false;
    };
  }, [sensors, verificationRecords, retryKey]);

  const pageState: "loading" | "empty" | "error" | "ready" =
    stateParam === "loading" || isLoading
      ? "loading"
      : stateParam === "error"
      ? "error"
      : stateParam === "empty"
      ? "empty"
      : "ready";

  const normalCount = sensors.filter((s) => !s.anomaly && !s.flameDetected).length;
  const totalSensorPages = Math.max(1, Math.ceil(sensors.length / SENSOR_PAGE_SIZE));
  const safeSensorPage = Math.min(sensorPage, totalSensorPages);
  const visibleSensors = sensors.slice(
    (safeSensorPage - 1) * SENSOR_PAGE_SIZE,
    safeSensorPage * SENSOR_PAGE_SIZE
  );
  const totalSatellitePages = Math.max(1, Math.ceil(parcels.length / SATELLITE_PAGE_SIZE));
  const safeSatellitePage = Math.min(satellitePage, totalSatellitePages);
  const visibleParcels = parcels.slice(
    (safeSatellitePage - 1) * SATELLITE_PAGE_SIZE,
    safeSatellitePage * SATELLITE_PAGE_SIZE
  );

  return (
    <BotanicalAppShell>
      <div className="space-y-4">
        <BotanicalPageHeader
          title="Indikator Sistem & Sensor"
          description="Kondisi jaringan sensor hutan, kesegaran citra satelit NDVI terhadap ambang sehat 0,70, dan waktu proses penguncian rantai."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <LiveTelemetryPill label="Node ESP32 Aktif" />
              <Link
                href="/langsung"
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 text-[13.5px] font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-soft)]"
              >
                <span>Buka pantauan langsung</span>
                <ArrowUpRight className="h-4 w-4 text-[var(--forest-700)]" aria-hidden="true" />
              </Link>
            </div>
          }
        />

        <PageStatePanel
          state={pageState}
          onRetry={() => setRetryKey((k) => k + 1)}
          emptyTitle="Belum ada indikator telemetri"
          emptyDescription="Data perangkat sensor belum terbaca untuk sesi saat ini."
        >
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            <BotanicalCard interactive className="p-4">
              <div className="flex items-center justify-between text-[var(--ink-muted)]">
                <span className="text-[13.5px] font-semibold">Kecepatan Data ke Status</span>
                <Clock className="h-4 w-4 text-[var(--forest-700)]" aria-hidden="true" />
              </div>
              <p className="xb-numeric xb-display mt-1.5 text-[25px] font-bold text-[var(--ink)]">
                <LiveNumber
                  value={metrics?.avg_pipeline_sec ?? 1.4}
                  format={(v) => `${v.toFixed(1).replace(".", ",")} dtk`}
                />
              </p>
              <p className="mt-1 text-[12.5px] text-[var(--ink-muted)]">
                Target batas sistem di bawah 2,5 menit
              </p>
            </BotanicalCard>

            <BotanicalCard interactive className="p-4">
              <div className="flex items-center justify-between text-[var(--ink-muted)]">
                <span className="text-[13.5px] font-semibold">Ketersediaan Sensor</span>
                <Radio className="h-4 w-4 text-[var(--forest-700)]" aria-hidden="true" />
              </div>
              <p className="xb-numeric xb-display mt-1.5 text-[25px] font-bold text-[var(--ink)]">
                <LiveNumber
                  value={metrics?.sensor_uptime_pct ?? 99.4}
                  format={(v) => `${v.toFixed(1).replace(".", ",")}%`}
                />
              </p>
              <p className="mt-1 text-[12.5px] text-[var(--ink-muted)]">
                {normalCount} dari {sensors.length} perangkat dalam kondisi normal
              </p>
            </BotanicalCard>

            <BotanicalCard interactive className="p-4">
              <div className="flex items-center justify-between text-[var(--ink-muted)]">
                <span className="text-[13.5px] font-semibold">Blok Rantai Segel Terakhir</span>
                <ShieldCheck className="h-4 w-4 text-[var(--seal-600)]" aria-hidden="true" />
              </div>
              <p className="xb-mono xb-display mt-1.5 text-[25px] font-bold text-[var(--seal-600)]">
                #<LiveNumber
                  value={metrics?.chain_head_block ?? verificationRecords[0]?.block_index ?? 1247}
                  format={(v) => String(Math.round(v))}
                />
              </p>
              <p className="mt-1 text-[12.5px] text-[var(--ink-muted)]">
                Mode EAS: {metrics?.eas_simulation_mode ?? true ? "Simulasi testnet" : "Aktif"}
              </p>
            </BotanicalCard>

            <BotanicalCard interactive className="p-4">
              <div className="flex items-center justify-between text-[var(--ink-muted)]">
                <span className="text-[13.5px] font-semibold">Ambang Kanopi Sehat</span>
                <Leaf className="h-4 w-4 text-[var(--forest-700)]" aria-hidden="true" />
              </div>
              <p className="xb-numeric xb-display mt-1.5 whitespace-nowrap text-[22px] font-bold text-[var(--ink)] sm:text-[25px]">
                NDVI ≥ 0,70
              </p>
              <p className="mt-1 text-[12.5px] text-[var(--ink-muted)]">
                Sinkron satelit: {metrics ? formatWibDateTime(metrics.ndvi_last_sync) : "Hari ini"}
              </p>
            </BotanicalCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-12">
            <BotanicalCard className="flex h-full flex-col justify-between p-5 lg:col-span-7">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="xb-display text-[18px] font-bold text-[var(--ink)]">
                      Status Perangkat Sensor Lapangan
                    </h2>
                    <p className="mt-0.5 text-[13.5px] text-[var(--ink-muted)]">
                      DHT22 dan kelembapan tanah dari ESP32 atau simulator · pembaruan otomatis.
                    </p>
                  </div>
                </div>

                {liveReading && (
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-[var(--seal-line)] bg-[var(--seal-100)]/60 px-3.5 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[var(--seal-700)]">
                      <Radio className="h-3.5 w-3.5" aria-hidden="true" />
                      {liveReading.source === "esp" ? "Telemetri ESP32" : "Telemetri simulator"}
                    </span>
                    <span className="text-[11.5px] font-medium text-[var(--ink-muted)]">
                      {formatWibTime(liveReading.ts)}
                    </span>
                    <span className="xb-mono text-[12px] font-semibold text-[var(--ink)]">
                      {liveReading.device_id}
                    </span>
                    <span className="text-[12.5px] text-[var(--ink-muted)]">
                      Suhu <strong className="text-[var(--ink)]">{liveReading.temp_c.toFixed(1)}°C</strong>
                      {" · "}Udara <strong className="text-[var(--ink)]">{liveReading.humidity_pct.toFixed(0)}%</strong>
                      {" · "}Tanah <strong className="text-[var(--ink)]">{liveReading.soil_pct.toFixed(0)}%</strong>
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11.5px] font-semibold ${
                        liveReading.fire_status === "NORMAL"
                          ? "bg-[var(--status-verified-bg)] text-[var(--status-verified-ink)]"
                          : "bg-[var(--status-warning-bg)] text-[var(--status-warning-ink)]"
                      }`}
                    >
                      {liveReading.fire_status}
                    </span>
                  </div>
                )}

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {visibleSensors.map((sensor, idx) => {
                    const parcel = parcels.find((p) => p.id === sensor.parcel_id);
                    const isOddLast =
                      visibleSensors.length % 2 === 1 && idx === visibleSensors.length - 1;
                    const statusBadge = sensor.flameDetected
                      ? {
                          label: "Peringatan api",
                          cls: "bg-[var(--status-blocked-bg)] text-[var(--status-blocked-ink)]",
                        }
                      : sensor.anomaly
                      ? {
                          label: "Anomali",
                          cls: "bg-[var(--status-warning-bg)] text-[var(--status-warning-ink)]",
                        }
                      : {
                          label: "Aktif normal",
                          cls: "bg-[var(--status-verified-bg)] text-[var(--status-verified-ink)]",
                        };
                    return (
                      <div
                        key={sensor.sensor_id}
                        className={`xb-surface-tile flex flex-col justify-between p-3.5 ${
                          isOddLast ? "sm:col-span-2" : ""
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="xb-mono text-[14px] font-bold text-[var(--ink)]">
                              {sensor.sensor_id} · {sensor.parcel_id}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${statusBadge.cls}`}
                            >
                              {statusBadge.label}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[13px] text-[var(--ink-muted)]">
                            {parcel?.name ?? sensor.parcel_id}
                          </p>

                          <div className="mt-3 grid grid-cols-3 gap-2">
                            <div className="rounded-xl border border-[var(--line-subtle)] bg-[var(--surface)] p-2">
                              <div className="flex items-center gap-1 text-[12px] text-[var(--ink-muted)]">
                                <Thermometer className="h-3 w-3 text-[var(--forest-700)]" aria-hidden="true" />
                                <span>Suhu</span>
                              </div>
                              <p className="xb-numeric mt-0.5 text-[14px] font-bold text-[var(--ink)]">
                                <LiveNumber
                                  value={sensor.temperature}
                                  format={(v) => `${v.toFixed(1)}°C`}
                                />
                              </p>
                            </div>
                            <div className="rounded-xl border border-[var(--line-subtle)] bg-[var(--surface)] p-2">
                              <div className="flex items-center gap-1 text-[12px] text-[var(--ink-muted)]">
                                <Droplets className="h-3 w-3 text-[var(--seal-600)]" aria-hidden="true" />
                                <span>Udara</span>
                              </div>
                              <p className="xb-numeric mt-0.5 text-[14px] font-bold text-[var(--ink)]">
                                <LiveNumber
                                  value={sensor.humidity}
                                  format={(v) => `${Math.round(v)}%`}
                                />
                              </p>
                            </div>
                            <div className="rounded-xl border border-[var(--line-subtle)] bg-[var(--surface)] p-2">
                              <div className="flex items-center gap-1 text-[12px] text-[var(--ink-muted)]">
                                <Activity className="h-3 w-3 text-[var(--forest-700)]" aria-hidden="true" />
                                <span>Tanah</span>
                              </div>
                              <p className="xb-numeric mt-0.5 text-[14px] font-bold text-[var(--ink)]">
                                <LiveNumber
                                  value={sensor.soil_moisture}
                                  format={(v) => `${Math.round(v)}%`}
                                />
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-2.5 flex items-center justify-between border-t border-[var(--line-subtle)] pt-2 text-[12.5px]">
                          <span className="xb-numeric text-[var(--ink-muted)]">
                            {formatWibDateTime(sensor.timestamp)}
                          </span>
                          <Link
                            href={`/peta/${sensor.parcel_id}`}
                            className="font-semibold text-[var(--forest-700)] hover:underline"
                          >
                            Buka Peta
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Pagination
                  page={safeSensorPage}
                  pageSize={SENSOR_PAGE_SIZE}
                  totalItems={sensors.length}
                  onPageChange={setSensorPage}
                  label="Navigasi perangkat sensor"
                  className="mt-3"
                />
              </div>
            </BotanicalCard>

            <BotanicalCard className="flex h-full flex-col justify-between p-5 lg:col-span-5">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Satellite className="h-5 w-5 text-[var(--forest-700)]" aria-hidden="true" />
                    <h2 className="xb-display text-[18px] font-bold text-[var(--ink)]">
                      Satelit NDVI & Catatan AI
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[12.5px] font-medium text-[var(--seal-700)]">
                    <Cpu className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Informasi bantu</span>
                  </span>
                </div>

                <div className="mt-3.5 space-y-2.5">
                  {visibleParcels.map((parcel) => {
                    const assessment = aiAssessments.find((a) => a.parcel_id === parcel.id);
                    const ndviVal = parcel.ndvi ?? 0;
                    const healthy = ndviVal >= 0.7;
                    return (
                      <div
                        key={parcel.id}
                        className="rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-3.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="xb-mono text-[12px] font-semibold text-[var(--forest-700)]">
                              {parcel.id}
                            </span>{" "}
                            <span className="xb-display text-[15px] font-bold text-[var(--ink)]">
                              · {parcel.name}
                            </span>
                          </div>
                          <CanonicalStatusBadge
                            status={toCanonicalStatus(parcel.verificationStatus)}
                            compact
                          />
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[13px]">
                          <span className="text-[var(--ink-muted)]">Kerapatan kanopi (NDVI)</span>
                          <span
                            className={`xb-numeric font-bold ${
                              healthy
                                ? "text-[var(--status-verified-ink)]"
                                : "text-[var(--status-dispute-ink)]"
                            }`}
                          >
                            {ndviVal.toFixed(2)} {healthy ? "(≥ 0,70)" : "(< 0,70)"}
                          </span>
                        </div>

                        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[var(--canvas)]">
                          <div
                            className={`h-full rounded-full ${
                              healthy ? "bg-[var(--forest-700)]" : "bg-[var(--status-dispute-ink)]"
                            }`}
                            style={{ width: `${Math.min(100, Math.round(ndviVal * 100))}%` }}
                          />
                        </div>

                        {assessment && (
                          <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-[var(--ink-muted)]">
                            <strong className="text-[var(--ink)]">
                              AI ({Math.round(assessment.ai2_score * 100)}%):
                            </strong>{" "}
                            {assessment.ai1_summary}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <Pagination
                  page={safeSatellitePage}
                  pageSize={SATELLITE_PAGE_SIZE}
                  totalItems={parcels.length}
                  onPageChange={setSatellitePage}
                  label="Navigasi catatan satelit"
                  className="mt-3"
                />
              </div>
              <p className="mt-3 border-t border-[var(--line-subtle)] pt-2.5 text-[12px] text-[var(--ink-muted)]">
                Keputusan akhir status lahan tetap memerlukan pengesahan Auditor MRV dan izin warga.
              </p>
            </BotanicalCard>
          </div>
        </PageStatePanel>
      </div>
    </BotanicalAppShell>
  );
}
