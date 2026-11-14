"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Layers, ShieldCheck, Cpu, Lock } from "lucide-react";
import { BotanicalCard } from "@/components/dapp/BotanicalPrimitives";
import { LiveNumber, PulseDot, Reveal, Segmented, type SegmentedOption } from "@/components/motion";

type ProofLayerId = "satelit" | "sensor" | "izin";

const LAYER_OPTIONS: ReadonlyArray<SegmentedOption<ProofLayerId>> = [
  { value: "satelit", label: "1. Citra Satelit" },
  { value: "sensor", label: "2. Sensor Pohon" },
  { value: "izin", label: "3. Izin Adat" },
];

const LAYER_DETAILS: Record<
  ProofLayerId,
  {
    badge: string;
    title: string;
    summary: string;
    metricLabel: string;
    metricValue: number;
    metricFormat: (n: number) => string;
    metricUnit: string;
    secondaryLabel: string;
    secondaryValue: string;
    href: string;
    linkLabel: string;
  }
> = {
  satelit: {
    badge: "GEE Cache: Valid",
    title: "Sentinel-1 SAR Radar & Sentinel-2 MSI",
    summary:
      "Radar C-band menembus tutupan awan hujan Kalimantan untuk mengukur struktur kanopi (-12,4 dB) dan kerapatan klorofil rata-rata.",
    metricLabel: "Indeks Vegetasi (NDVI)",
    metricValue: 0.78,
    metricFormat: (n) => n.toFixed(2),
    metricUnit: "NDVI",
    secondaryLabel: "Kenaikan Tutupan Kanopi",
    secondaryValue: "+4,2% YoY",
    href: "/indikator",
    linkLabel: "Periksa detail indikator satelit",
  },
  sensor: {
    badge: "Ping MQTT: 5 Detik",
    title: "Node Fisik ESP32 + DHT22 + KY-026",
    summary:
      "Dipasang di pohon penyangga dengan daya mandiri untuk memantau suhu mikro-iklim, kelembapan tanah kapasitif, dan deteksi nyala api.",
    metricLabel: "Suhu Kanopi Rata-Rata",
    metricValue: 31.4,
    metricFormat: (n) => n.toFixed(1),
    metricUnit: "°C",
    secondaryLabel: "Kelembapan Tanah & Api",
    secondaryValue: "57% Lembap · 0 Titik Api",
    href: "/langsung",
    linkLabel: "Pantau umpan sensor langsung",
  },
  izin: {
    badge: "FPIC Terotentikasi",
    title: "Konsensus Tertulis Lembaga Adat Desa",
    summary:
      "Warga adat memegang hak veto penuh. Tanpa izin aktif atau saat sengketa batas dibuka, mesin aturan otomatis memblokir penerbitan unit.",
    metricLabel: "Porsi Bagi Hasil Komunitas",
    metricValue: 60,
    metricFormat: (n) => String(Math.round(n)),
    metricUnit: "% Bersih",
    secondaryLabel: "Status Persetujuan Lahan A",
    secondaryValue: "Resi FPIC Sah (600 Ha)",
    href: "/izin/PARCEL-A",
    linkLabel: "Lihat lembar persetujuan warga",
  },
};

export function FeatureSpotlight() {
  const [activeLayer, setActiveLayer] = useState<ProofLayerId>("satelit");
  const detail = LAYER_DETAILS[activeLayer];

  return (
    <section id="fitur" className="section-spacing border-t border-[var(--color-border-subtle)]">
      <div className="page-shell">
        {/* Consistent Section Header: Eyebrow + Title + 1-sentence description */}
        <Reveal className="max-w-3xl">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] block mb-2.5">
            Verifikasi Berlapis &amp; Keunggulan Sistem
          </span>
          <h2 className="text-[clamp(1.95rem,3.4vw,3.1rem)] font-normal leading-[1.15] tracking-tight text-[var(--color-text-primary)]">
            Tiga lapis bukti lapangan,{" "}
            <span className="text-[var(--color-accent)]">tanpa celah manipulasi</span> data.
          </h2>
          <p className="mt-3.5 text-[0.95rem] leading-relaxed text-[var(--color-text-secondary)]">
            Citra satelit, telemetri sensor pohon, dan hak veto masyarakat adat diuji silang secara
            deterministik sebelum unit karbon diizinkan terbit.
          </p>
        </Reveal>

        {/* Main Asymmetric Grid: Left Interactive Multi-Layer Inspector (7 cols) + Right Key Value Stack (5 cols) */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
          <Reveal delay={60} className="lg:col-span-7 flex">
            <BotanicalCard className="p-6 sm:p-8 flex flex-col justify-between w-full">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] pb-4">
                  <Segmented
                    ariaLabel="Pilih lapisan bukti verifikasi"
                    options={LAYER_OPTIONS}
                    value={activeLayer}
                    onChange={setActiveLayer}
                    tone="accent"
                  />
                  <span
                    key={detail.badge}
                    className="xbm-status-badge border border-[var(--color-accent-line)] bg-[var(--color-accent-tint)] px-3 py-1 font-mono text-xs font-semibold text-[var(--color-accent)]"
                  >
                    <PulseDot pulsing />
                    <span>{detail.badge}</span>
                  </span>
                </div>

                {/* Active Layer Content with fade-in */}
                <div key={activeLayer} className="xbm-content-ready mt-6 space-y-5">
                  <div className="flex items-start gap-3.5">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-accent)]">
                      {activeLayer === "satelit" ? (
                        <Layers className="h-5 w-5" aria-hidden="true" />
                      ) : activeLayer === "sensor" ? (
                        <Cpu className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Check className="h-5 w-5" aria-hidden="true" />
                      )}
                    </span>
                    <div>
                      <h3 className="text-lg sm:text-xl font-medium tracking-tight text-[var(--color-text-primary)]">
                        {detail.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                        {detail.summary}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    <div className="rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
                      <span className="block font-mono text-[0.72rem] uppercase tracking-wider text-[var(--color-text-muted)]">
                        {detail.metricLabel}
                      </span>
                      <div className="mt-2 flex items-baseline gap-1.5 text-2xl font-semibold text-[var(--color-text-primary)]">
                        <LiveNumber
                          value={detail.metricValue}
                          format={detail.metricFormat}
                          countUpOnView={false}
                        />
                        <span className="text-xs font-mono text-[var(--color-accent)]">
                          {detail.metricUnit}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
                      <span className="block font-mono text-[0.72rem] uppercase tracking-wider text-[var(--color-text-muted)]">
                        {detail.secondaryLabel}
                      </span>
                      <p className="mt-2 text-base font-medium text-[var(--color-text-primary)]">
                        {detail.secondaryValue}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border-subtle)] pt-4 text-xs">
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                  <ShieldCheck className="h-4 w-4 text-[var(--color-accent)]" aria-hidden="true" />
                  <span>Gagal 1 syarat = status otomatis ditahan</span>
                </div>
                <Link
                  href={detail.href}
                  className="xbm-link-inline font-semibold text-[var(--color-accent)]"
                >
                  <span>{detail.linkLabel}</span>
                  <ArrowRight className="xbm-card-icon h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </BotanicalCard>
          </Reveal>

          {/* Right Column: 3 Compact Value Pillars (Merged from ValuePropositionCards & PreviewStrip) */}
          <div className="lg:col-span-5 flex flex-col gap-4 justify-between">
            <Reveal delay={120}>
              <BotanicalCard className="p-5 sm:p-6 border-[var(--color-accent-line)] bg-[var(--color-surface-raised)]">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--color-accent)]">
                    Kedaulatan Warga &bull; Bagi Hasil
                  </span>
                  <span className="xb-numeric font-mono text-sm font-bold text-[var(--color-accent)]">
                    <LiveNumber value={60} />% : <LiveNumber value={40} />%
                  </span>
                </div>
                <h3 className="mt-2 text-base sm:text-lg font-medium text-[var(--color-text-primary)]">
                  Hak veto mutlak &amp; porsi 60% kas komunitas adat.
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  Tanpa persetujuan tertulis warga desa, unit karbon tidak dapat diterbitkan.
                </p>
              </BotanicalCard>
            </Reveal>

            <Reveal delay={180}>
              <BotanicalCard className="p-5 sm:p-6">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                    Otomasi dMRV &bull; Detik ke Status
                  </span>
                  <span className="xb-numeric font-mono text-sm font-semibold text-[var(--color-accent)]">
                    Ping <LiveNumber value={5} /> dtk
                  </span>
                </div>
                <h3 className="mt-2 text-base sm:text-lg font-medium text-[var(--color-text-primary)]">
                  Mengganti audit manual 18 bulan dengan pipa kode langsung.
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  Telemetri lapangan dan indeks satelit langsung dievaluasi oleh mesin status R5.
                </p>
              </BotanicalCard>
            </Reveal>

            <Reveal delay={240}>
              <BotanicalCard className="p-5 sm:p-6">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                    Segel Kriptografi &bull; Base Sepolia
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-xs text-[var(--color-accent)]">
                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                    SHA-256 + EAS
                  </span>
                </div>
                <h3 className="mt-2 text-base sm:text-lg font-medium text-[var(--color-text-primary)]">
                  Buku catatan berantai yang bisa diaudit siapa saja.
                </h3>
                <div className="mt-2.5 flex items-center justify-between text-xs">
                  <span className="text-[var(--color-text-secondary)]">
                    Setiap blok mengunci hash sebelumnya.
                  </span>
                  <Link
                    href="/screener"
                    className="xbm-link-inline font-semibold text-[var(--color-accent)]"
                  >
                    <span>Buka Screener</span>
                    <ArrowRight className="xbm-card-icon h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </BotanicalCard>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
