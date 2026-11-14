"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Check, Layers, Radio, Users, CheckCircle2 } from "lucide-react";

export function FeatureSpotlight() {
  const [activeChip, setActiveChip] = useState<"satelit" | "sensor" | "izin">("satelit");

  return (
    <section id="fitur" className="py-16 sm:py-24 border-t border-[var(--line-subtle)]">
      <div className="page-shell">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 sm:gap-16 items-center">
          {/* Left Column: Editorial Narrative */}
          <div className="max-w-xl">
            <span className="xb-eyebrow block mb-2">
              Multi-Layer Verification
            </span>
            <h2 className="xb-display text-[clamp(2.1rem,3.5vw,3.4rem)] font-bold text-[var(--ink)] leading-[1.15] tracking-tight">
              Tiga lapis bukti,{" "}
              <span className="text-[var(--forest-800)]">tanpa celah manipulasi</span> data.
            </h2>
            <p className="mt-5 text-[1rem] text-[var(--ink-muted)] leading-relaxed">
              Kondisi vegetasi diuji dari orbit antariksa oleh radar Sentinel, suhu pohon dipantau
              oleh sensor fisik di lapangan, dan kedaulatan tanah dipegang penuh oleh persetujuan warga desa.
            </p>
            <p className="mt-3 text-[0.925rem] text-[var(--ink-dim)] leading-relaxed">
              Jika salah satu lapis bukti gagal atau izin warga tidak terpenuhi, kode sistem secara
              deterministik menghentikan proses penguncian segel.
            </p>

            <div className="mt-8">
              <Link
                href="/tinjau"
                className="inline-flex min-h-[42px] items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-semibold bg-[var(--forest-800)] text-white hover:bg-[var(--forest-900)] shadow-xs transition-transform active:scale-95"
              >
                <span>Periksa Validasi Auditor</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Right Column: Mini Product Interface (Soft Botanical Card) */}
          <div className="xb-card p-6 sm:p-7 flex flex-col gap-5">
            {/* Filter / Category Chips */}
            <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-[var(--line-subtle)]">
              <button
                type="button"
                onClick={() => setActiveChip("satelit")}
                className={`min-h-[38px] px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
                  activeChip === "satelit"
                    ? "bg-[var(--forest-800)] text-white shadow-xs"
                    : "bg-[var(--surface-soft)] text-[var(--ink-muted)] hover:bg-[var(--surface-sunken)] hover:text-[var(--ink)] border border-[var(--line)]"
                }`}
              >
                1. Citra Satelit Radar
              </button>
              <button
                type="button"
                onClick={() => setActiveChip("sensor")}
                className={`min-h-[38px] px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
                  activeChip === "sensor"
                    ? "bg-[var(--forest-800)] text-white shadow-xs"
                    : "bg-[var(--surface-soft)] text-[var(--ink-muted)] hover:bg-[var(--surface-sunken)] hover:text-[var(--ink)] border border-[var(--line)]"
                }`}
              >
                2. Sensor Fisik Pohon
              </button>
              <button
                type="button"
                onClick={() => setActiveChip("izin")}
                className={`min-h-[38px] px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
                  activeChip === "izin"
                    ? "bg-[var(--forest-800)] text-white shadow-xs"
                    : "bg-[var(--surface-soft)] text-[var(--ink-muted)] hover:bg-[var(--surface-sunken)] hover:text-[var(--ink)] border border-[var(--line)]"
                }`}
              >
                3. Hak Izin Adat
              </button>
            </div>

            {/* Interactive Telemetry Inspector Box */}
            <div className="rounded-[16px] bg-[var(--surface-soft)] p-4 border border-[var(--line)] text-[13.5px]">
              {activeChip === "satelit" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--ink)] flex items-center gap-2 font-semibold">
                      <Layers className="w-4 h-4 text-[var(--forest-700)]" />
                      Sentinel-1 SAR Radar &amp; Sentinel-2 MSI
                    </span>
                    <span className="xb-numeric text-[11.5px] font-bold text-[var(--forest-700)] bg-[var(--leaf-100)] px-2 py-0.5 rounded">
                      Cache GEE: Valid
                    </span>
                  </div>
                  <p className="text-[13px] text-[var(--ink-muted)] leading-relaxed">
                    Radar C-band menembus tutupan awan hujan Kalimantan untuk mengukur kelembapan kanopi (-12.4 dB).
                    Indeks kehijauan rata-rata berada pada 0.78 NDVI.
                  </p>
                </div>
              )}

              {activeChip === "sensor" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--ink)] flex items-center gap-2 font-semibold">
                      <Radio className="w-4 h-4 text-[var(--forest-700)]" />
                      Mikrokontroler ESP32 + DHT22 + KY-026
                    </span>
                    <span className="xb-numeric text-[11.5px] font-bold text-[var(--forest-700)] bg-[var(--leaf-100)] px-2 py-0.5 rounded">
                      Ping: 5 Detik
                    </span>
                  </div>
                  <p className="text-[13px] text-[var(--ink-muted)] leading-relaxed">
                    Dipasang di pohon penyangga dengan baterai mandiri. Menghitung suhu permukaan 31.4&deg;C,
                    kelembapan udara 68.2%, dan status nyala api 0 (Aman).
                  </p>
                </div>
              )}

              {activeChip === "izin" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--ink)] flex items-center gap-2 font-semibold">
                      <Users className="w-4 h-4 text-[var(--forest-700)]" />
                      Konsensus Lembaga Adat Desa
                    </span>
                    <span className="xb-numeric text-[11.5px] font-bold text-[var(--forest-700)] bg-[var(--leaf-100)] px-2 py-0.5 rounded">
                      Tercatat di Ledger
                    </span>
                  </div>
                  <p className="text-[13px] text-[var(--ink-muted)] leading-relaxed">
                    Izin resmi diberikan dengan persetujuan 70% kuorum warga. Warga memiliki hak veto
                    untuk membuka sengketa yang seketika menghentikan transaksi.
                  </p>
                </div>
              )}
            </div>

            {/* Two Mini Status Cards */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="rounded-[16px] bg-white p-3.5 border border-[var(--line)] shadow-xs">
                <span className="text-[11.5px] font-medium text-[var(--ink-dim)] block">Status Verifikasi</span>
                <span className="text-[14.5px] font-semibold text-[var(--status-verified-ink)] mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--forest-700)]" />
                  Terverifikasi
                </span>
                <span className="text-[12px] text-[var(--ink-muted)] mt-1 block">
                  600 unit siap rilis
                </span>
              </div>

              <div className="rounded-[16px] bg-white p-3.5 border border-[var(--line)] shadow-xs">
                <span className="text-[11.5px] font-medium text-[var(--ink-dim)] block">Integritas Hash</span>
                <span className="text-[14.5px] font-semibold text-[var(--seal-600)] mt-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[var(--seal-600)]" />
                  Cocok 100%
                </span>
                <span className="xb-mono text-[11.5px] text-[var(--ink-muted)] mt-1 block truncate">
                  0x7f83b165...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
