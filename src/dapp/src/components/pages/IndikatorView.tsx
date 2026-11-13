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
  PageStatePanel,
} from "@/components/dapp/BotanicalPrimitives";
import { useDashboardState } from "@/components/dapp/useDashboardStore";
import { formatWibDateTime, toCanonicalStatus } from "@/lib/dashboard-helpers";
import {
  fetchMonitoringMetrics,
  type MonitoringMetricsData,
} from "@/lib/exbon-api";

export function IndikatorView() {
  const searchParams = useSearchParams();
  const stateParam = searchParams.get("state");
  const { parcels, sensors, aiAssessments, verificationRecords, isLoading } = useDashboardState();

  const [metrics, setMetrics] = useState<MonitoringMetricsData | null>(null);
  const [retryKey, setRetryKey] = useState(0);

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

  return (
    <BotanicalAppShell>
      <div className="space-y-6">
        <BotanicalPageHeader
          title="Indikator Sistem & Sensor"
          description="Kondisi jaringan sensor hutan, kesegaran citra satelit NDVI terhadap ambang sehat 0,70, dan waktu proses penguncian rantai."
          actions={
            <Link
              href="/langsung"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-[14px] font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-soft)]"
            >
              <span>Buka pantauan langsung</span>
              <ArrowUpRight className="h-4 w-4 text-[var(--forest-700)]" aria-hidden="true" />
            </Link>
          }
        />

        <PageStatePanel
          state={pageState}
          onRetry={() => setRetryKey((k) => k + 1)}
          emptyTitle="Belum ada indikator telemetri"
          emptyDescription="Data perangkat sensor belum terbaca untuk sesi saat ini."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <BotanicalCard className="p-5">
              <div className="flex items-center justify-between text-[var(--ink-muted)]">
                <span className="text-[14px] font-semibold">Kecepatan Data ke Status</span>
                <Clock className="h-4 w-4 text-[var(--forest-700)]" aria-hidden="true" />
              </div>
              <p className="xb-numeric xb-display mt-2 text-[28px] font-bold text-[var(--ink)]">
                {metrics ? `${metrics.avg_pipeline_sec} dtk` : "1,4 dtk"}
              </p>
              <p className="mt-1 text-[13.5px] text-[var(--ink-muted)]">
                Target batas sistem di bawah 2,5 menit
              </p>
            </BotanicalCard>

            <BotanicalCard className="p-5">
              <div className="flex items-center justify-between text-[var(--ink-muted)]">
                <span className="text-[14px] font-semibold">Ketersediaan Sensor</span>
                <Radio className="h-4 w-4 text-[var(--forest-700)]" aria-hidden="true" />
              </div>
              <p className="xb-numeric xb-display mt-2 text-[28px] font-bold text-[var(--ink)]">
                {metrics ? `${metrics.sensor_uptime_pct}%` : "99,4%"}
              </p>
              <p className="mt-1 text-[13.5px] text-[var(--ink-muted)]">
                {normalCount} dari {sensors.length} perangkat dalam kondisi normal
              </p>
            </BotanicalCard>

            <BotanicalCard className="p-5">
              <div className="flex items-center justify-between text-[var(--ink-muted)]">
                <span className="text-[14px] font-semibold">Blok Rantai Segel Terakhir</span>
                <ShieldCheck className="h-4 w-4 text-[var(--seal-600)]" aria-hidden="true" />
              </div>
              <p className="xb-mono xb-display mt-2 text-[28px] font-bold text-[var(--seal-600)]">
                #{metrics?.chain_head_block ?? verificationRecords[0]?.block_index ?? 1247}
              </p>
              <p className="mt-1 text-[13.5px] text-[var(--ink-muted)]">
                Mode EAS: {metrics?.eas_simulation_mode ?? true ? "Simulasi testnet" : "Aktif"}
              </p>
            </BotanicalCard>

            <BotanicalCard className="p-5">
              <div className="flex items-center justify-between text-[var(--ink-muted)]">
                <span className="text-[14px] font-semibold">Ambang Kanopi Sehat</span>
                <Leaf className="h-4 w-4 text-[var(--forest-700)]" aria-hidden="true" />
              </div>
              <p className="xb-numeric xb-display mt-2 text-[28px] font-bold text-[var(--ink)]">
                NDVI ≥ 0,70
              </p>
              <p className="mt-1 text-[13.5px] text-[var(--ink-muted)]">
                Sinkron satelit: {metrics ? formatWibDateTime(metrics.ndvi_last_sync) : "Hari ini"} WIB
              </p>
            </BotanicalCard>
          </div>

          <BotanicalCard className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="xb-display text-[19px] font-bold text-[var(--ink)]">
                  Status Perangkat Sensor Lapangan
                </h2>
                <p className="mt-1 text-[14.5px] text-[var(--ink-muted)]">
                  Sumber: Node ESP32 DHT22 & kelembapan tanah · diperbarui sekitar{" "}
                  {metrics?.last_sensor_sec_ago ?? 18} detik lalu.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {sensors.map((sensor) => {
                const parcel = parcels.find((p) => p.id === sensor.parcel_id);
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
                    className="flex h-full flex-col justify-between rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="xb-mono text-[14.5px] font-bold text-[var(--ink)]">
                          {sensor.sensor_id}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${statusBadge.cls}`}
                        >
                          {statusBadge.label}
                        </span>
                      </div>
                      <p className="mt-1 text-[13.5px] text-[var(--ink-muted)]">
                        {parcel?.name ?? sensor.parcel_id}
                      </p>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="rounded-xl border border-[var(--line-subtle)] bg-[var(--surface)] p-2.5">
                          <div className="flex items-center gap-1 text-[13px] text-[var(--ink-muted)]">
                            <Thermometer className="h-3.5 w-3.5 text-[var(--forest-700)]" aria-hidden="true" />
                            <span>Suhu</span>
                          </div>
                          <p className="xb-numeric mt-1 text-[15px] font-bold text-[var(--ink)]">
                            {sensor.temperature}°C
                          </p>
                        </div>
                        <div className="rounded-xl border border-[var(--line-subtle)] bg-[var(--surface)] p-2.5">
                          <div className="flex items-center gap-1 text-[13px] text-[var(--ink-muted)]">
                            <Droplets className="h-3.5 w-3.5 text-[var(--seal-600)]" aria-hidden="true" />
                            <span>Udara</span>
                          </div>
                          <p className="xb-numeric mt-1 text-[15px] font-bold text-[var(--ink)]">
                            {sensor.humidity}%
                          </p>
                        </div>
                        <div className="rounded-xl border border-[var(--line-subtle)] bg-[var(--surface)] p-2.5">
                          <div className="flex items-center gap-1 text-[13px] text-[var(--ink-muted)]">
                            <Activity className="h-3.5 w-3.5 text-[var(--forest-700)]" aria-hidden="true" />
                            <span>Tanah</span>
                          </div>
                          <p className="xb-numeric mt-1 text-[15px] font-bold text-[var(--ink)]">
                            {sensor.soil_moisture}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-[var(--line-subtle)] pt-2.5 text-[13.5px]">
                      <span className="text-[var(--ink-muted)]">
                        {formatWibDateTime(sensor.timestamp)} WIB
                      </span>
                      <Link
                        href={`/peta/${sensor.parcel_id}`}
                        className="font-semibold text-[var(--forest-700)] hover:underline"
                      >
                        Lokasi
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </BotanicalCard>

          <BotanicalCard className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Satellite className="h-5 w-5 text-[var(--forest-700)]" aria-hidden="true" />
                <h2 className="xb-display text-[19px] font-bold text-[var(--ink)]">
                  Indeks Satelit NDVI & Catatan AI Pembantu
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-[var(--seal-700)]">
                <Cpu className="h-4 w-4" aria-hidden="true" />
                <span>AI hanya bersifat informasi bantu</span>
              </span>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {parcels.map((parcel, idx) => {
                const assessment = aiAssessments.find((a) => a.parcel_id === parcel.id);
                const ndviVal = parcel.ndvi ?? 0;
                const healthy = ndviVal >= 0.7;
                const isOddTail = parcels.length % 2 === 1 && idx === parcels.length - 1;
                return (
                  <div
                    key={parcel.id}
                    className={`flex h-full flex-col justify-between rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 ${
                      isOddTail ? "md:col-span-2" : ""
                    }`}
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="xb-mono text-[13.5px] text-[var(--ink-muted)]">{parcel.id}</p>
                          <h3 className="xb-display text-[17.5px] font-bold text-[var(--ink)]">
                            {parcel.name}
                          </h3>
                        </div>
                        <CanonicalStatusBadge status={toCanonicalStatus(parcel.verificationStatus)} compact />
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[15px]">
                        <span className="text-[var(--ink-muted)]">Indeks kerapatan kanopi (NDVI)</span>
                        <span
                          className={`xb-numeric font-bold ${
                            healthy
                              ? "text-[var(--status-verified-ink)]"
                              : "text-[var(--status-dispute-ink)]"
                          }`}
                        >
                          {ndviVal.toFixed(2)} {healthy ? "(Memenuhi ≥ 0,70)" : "(Di bawah 0,70)"}
                        </span>
                      </div>

                      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[var(--canvas)]">
                        <div
                          className={`h-full rounded-full ${
                            healthy ? "bg-[var(--forest-700)]" : "bg-[var(--status-dispute-ink)]"
                          }`}
                          style={{ width: `${Math.min(100, Math.round(ndviVal * 100))}%` }}
                        />
                      </div>
                    </div>

                    {assessment && (
                      <div className="mt-3 rounded-xl border border-[var(--line-subtle)] bg-[var(--surface-soft)] p-3 text-[14px] leading-relaxed text-[var(--ink-muted)]">
                        <p className="font-semibold text-[var(--ink)]">
                          Ringkasan AI (Skor keandalan {Math.round(assessment.ai2_score * 100)}% · Tidak mengikat):
                        </p>
                        <p className="mt-1">{assessment.ai1_summary}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </BotanicalCard>
        </PageStatePanel>
      </div>
    </BotanicalAppShell>
  );
}
