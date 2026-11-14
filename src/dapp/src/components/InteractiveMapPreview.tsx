"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowRight, Check, FileText, Lock, MapPin } from "lucide-react";
import { MOCK_PARCELS } from "@/lib/mock-data";
import { BotanicalCard } from "@/components/dapp/BotanicalPrimitives";
import { LiveNumber, PulseDot, Reveal, Segmented, type SegmentedOption } from "@/components/motion";

const PARCEL_OPTIONS: ReadonlyArray<SegmentedOption<string>> = MOCK_PARCELS.map((p) => ({
  value: p.id,
  label: p.name,
}));

export function InteractiveMapPreview() {
  const [selectedParcelId, setSelectedParcelId] = useState<string>(MOCK_PARCELS[0].id);
  const [switching, setSwitching] = useState(false);

  const parcel = MOCK_PARCELS.find((p) => p.id === selectedParcelId) || MOCK_PARCELS[0];
  const isVerified = parcel.status === "VERIFIED";

  useEffect(() => {
    setSwitching(true);
    const t = window.setTimeout(() => setSwitching(false), 140);
    return () => window.clearTimeout(t);
  }, [selectedParcelId]);

  return (
    <section id="peta" className="section-spacing border-t border-[var(--color-border-subtle)]">
      <div className="page-shell">
        {/* Consistent Section Header: Eyebrow + Title + 1-sentence description */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="max-w-2xl">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] block mb-2.5">
              Sistem Geospasial Terintegrasi
            </span>
            <h2 className="text-[clamp(1.95rem,3.4vw,3.1rem)] font-normal leading-[1.15] tracking-tight text-[var(--color-text-primary)]">
              Periksa petak hutan dan{" "}
              <span className="text-[var(--color-accent)]">status izinnya</span> secara langsung.
            </h2>
            <p className="mt-3.5 text-[0.95rem] leading-relaxed text-[var(--color-text-secondary)]">
              Petak dengan izin warga sah otomatis terverifikasi, sedangkan petak tanpa persetujuan
              masyarakat adat seketika ditahan dari pasar.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <Segmented
              ariaLabel="Pilih petak hutan contoh"
              options={PARCEL_OPTIONS}
              value={selectedParcelId}
              onChange={setSelectedParcelId}
              tone="accent"
            />
          </Reveal>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
          {/* Simulated Map Radar Canvas (7 Cols) */}
          <Reveal delay={60} className="lg:col-span-7 flex">
            <BotanicalCard className="relative flex min-h-[340px] w-full flex-col justify-between overflow-hidden p-6 sm:p-8">
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[90px] ${
                  isVerified ? "bg-[var(--color-accent)]/12" : "bg-[var(--xb-blocked)]/12"
                }`}
              />

              {/* Radar Header */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-[var(--color-text-secondary)]">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[var(--color-accent)]" aria-hidden="true" />
                  <span>{parcel.location}</span>
                </span>
                <span className="rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-1 text-[var(--color-text-primary)]">
                  <LiveNumber value={parcel.areaHa} countUpOnView={false} /> Hektar
                </span>
              </div>

              {/* Central Polygon Status Node */}
              <div className="relative z-10 my-6 flex flex-col items-center justify-center">
                {switching ? (
                  <div className="xb-skeleton h-44 w-44 rounded-[var(--radius-xl)]" aria-hidden="true" />
                ) : (
                  <div
                    key={parcel.id}
                    className={`xbm-content-ready flex h-44 w-44 sm:h-48 sm:w-48 flex-col items-center justify-center rounded-[var(--radius-xl)] border p-5 text-center backdrop-blur-sm ${
                      isVerified
                        ? "border-[var(--color-accent-line)] bg-[var(--color-surface-raised)]/90 shadow-[var(--shadow-glow-accent)] text-[var(--color-accent)]"
                        : "border-[var(--status-blocked-line)] bg-[var(--color-surface-raised)]/90 shadow-[var(--shadow-glow-danger)] text-[var(--status-blocked-ink)]"
                    }`}
                  >
                    {isVerified ? (
                      <Check className="mb-2 h-9 w-9 text-[var(--color-accent)]" aria-hidden="true" />
                    ) : (
                      <Lock className="mb-2 h-9 w-9 text-[var(--status-blocked-ink)]" aria-hidden="true" />
                    )}
                    <span
                      key={parcel.status}
                      className="xbm-status-badge mt-1 px-2.5 py-0.5 text-xs font-semibold text-[var(--color-text-primary)]"
                    >
                      <PulseDot pulsing={isVerified} />
                      <span>{parcel.statusLabel}</span>
                    </span>
                    <span className="mt-1.5 text-xs text-[var(--color-text-secondary)]">
                      {isVerified ? "Izin Adat Lengkap" : "Menunggu Izin Warga"}
                    </span>
                  </div>
                )}
              </div>

              {/* Radar Footer */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--color-border-subtle)] pt-3.5 font-mono text-xs text-[var(--color-text-secondary)]">
                <span className="inline-flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-[var(--color-accent)]" aria-hidden="true" />
                  <span>
                    NDVI Radar:{" "}
                    <LiveNumber
                      value={parcel.satellite.ndviMean}
                      format={(n) => n.toFixed(2)}
                      countUpOnView={false}
                    />
                  </span>
                </span>
                <span>
                  Suhu Kanopi:{" "}
                  <LiveNumber
                    value={parcel.telemetry.tempC}
                    format={(n) => n.toFixed(1)}
                    countUpOnView={false}
                  />
                  &deg;C
                </span>
              </div>
            </BotanicalCard>
          </Reveal>

          {/* Telemetry Inspection Card (5 Cols) */}
          <Reveal delay={120} className="lg:col-span-5 flex">
            <BotanicalCard className="flex w-full flex-col justify-between gap-5 p-6 sm:p-8">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
                    Inspeksi Bukti Petak
                  </span>
                  <span
                    key={parcel.status}
                    className={`xbm-status-badge border px-3 py-1 text-xs font-semibold ${
                      isVerified
                        ? "border-[var(--status-verified-line)] bg-[var(--status-verified-bg)] text-[var(--status-verified-ink)]"
                        : "border-[var(--status-blocked-line)] bg-[var(--status-blocked-bg)] text-[var(--status-blocked-ink)]"
                    }`}
                  >
                    <PulseDot pulsing={isVerified} />
                    <span>{parcel.statusLabel}</span>
                  </span>
                </div>
                <h3 className="mt-2.5 text-xl font-medium tracking-tight text-[var(--color-text-primary)]">
                  {parcel.name}
                </h3>
                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{parcel.location}</p>
              </div>

              {switching ? (
                <div className="space-y-3" aria-busy="true">
                  <div className="xb-skeleton h-10 w-full" />
                  <div className="xb-skeleton h-10 w-full" />
                  <div className="xb-skeleton h-10 w-full" />
                </div>
              ) : (
                <div key={parcel.id} className="xbm-content-ready divide-y divide-[var(--color-border-subtle)] text-xs sm:text-sm">
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-[var(--color-text-secondary)]">Persetujuan Komunitas</span>
                    <span className="font-medium text-[var(--color-text-primary)]">
                      {parcel.consent === "granted"
                        ? `Sah (${parcel.consentBy ?? "Lembaga Adat"})`
                        : "Belum Diberikan"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-[var(--color-text-secondary)]">Sensor Api &amp; Tanah</span>
                    <span className="xb-numeric font-medium text-[var(--color-text-primary)]">
                      {parcel.telemetry.flame === 0 ? "Aman" : "Peringatan"} &bull;{" "}
                      <LiveNumber value={parcel.telemetry.soilPct} countUpOnView={false} />% Lembap
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-[var(--color-text-secondary)]">Unit Siap Alokasi</span>
                    <span className="xb-numeric font-mono font-semibold text-[var(--color-accent)]">
                      <LiveNumber
                        value={isVerified ? parcel.carbonUnits : 0}
                        countUpOnView={false}
                      />{" "}
                      tCO2e
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3 font-mono text-[11px] text-[var(--color-text-secondary)]">
                  <span className="truncate pr-2">
                    SHA-256: {parcel.digitalSeal.hash.slice(0, 24)}...
                  </span>
                  <FileText className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" aria-hidden="true" />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <Link
                    href="/peta"
                    className="xbm-link-inline font-semibold text-[var(--color-accent)]"
                  >
                    <span>Buka Peta Interaktif Penuh</span>
                    <ArrowRight className="xbm-card-icon h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/screener"
                    className="xbm-link-inline text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  >
                    <span>Screener 3 Ekosistem</span>
                  </Link>
                </div>
              </div>
            </BotanicalCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
