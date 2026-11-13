"use client";

import { useState } from "react";
import { ArrowRight, ShieldCheck, Check, Layers, AlertCircle } from "lucide-react";

export function FeatureSpotlight() {
  const [activeChip, setActiveChip] = useState<"satelit" | "sensor" | "izin">("satelit");

  return (
    <section id="fitur" className="py-20 sm:py-28 border-t border-[#1B211A]">
      <div className="page-shell">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 sm:gap-16 items-center">
          
          {/* Left Column: Editorial Narrative (Headline with Lime Highlight, Body, Small CTA) */}
          <div className="max-w-xl">
            <span className="text-[0.75rem] font-semibold text-[#AEDA2D] uppercase tracking-wider block mb-3">
              Multi-Layer Verification
            </span>
            <h2 className="text-[clamp(2.1rem,3.5vw,3.4rem)] font-normal text-[#F0F2EC] leading-[1.15] tracking-tight">
              Tiga lapis bukti,{" "}
              <span className="text-[#AEDA2D]">tanpa celah manipulasi</span> data.
            </h2>
            <p className="mt-5 text-[0.95rem] text-[#A8AFA2] leading-relaxed">
              Kondisi vegetasi diuji dari orbit antariksa oleh radar Sentinel, suhu pohon dipantau
              oleh sensor fisik di lapangan, dan kedaulatan tanah dipegang penuh oleh persetujuan warga desa.
            </p>
            <p className="mt-3 text-[0.875rem] text-[#747D70] leading-relaxed">
              Jika salah satu lapis bukti gagal atau izin warga tidak terpenuhi, kode sistem secara
              deterministik menghentikan proses penguncian segel.
            </p>

            <div className="mt-8">
              <a
                href="#proses"
                className="button-touch inline-flex items-center gap-2 px-5 py-2.5 rounded-pill text-[0.825rem] font-semibold bg-[#171C16] text-[#F0F2EC] border border-[#252D22] hover:border-[#64753E] hover:bg-[#1D231B] transition-all"
              >
                Pelajari Alur Lengkap
                <ArrowRight className="w-3.5 h-3.5 text-[#AEDA2D]" />
              </a>
            </div>
          </div>

          {/* Right Column: Mini Product Interface (Chips, Interactive Panel, Status Cards) */}
          <div className="surface-card p-6 sm:p-7 shadow-panel flex flex-col gap-5">
            
            {/* Filter / Category Chips (Section 5.3) */}
            <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-[#1B211A]">
              <button
                type="button"
                onClick={() => setActiveChip("satelit")}
                className={`button-touch px-3.5 py-1.5 rounded-pill text-[0.78rem] font-medium transition-colors ${
                  activeChip === "satelit"
                    ? "bg-[#AEDA2D] text-[#11160B]"
                    : "bg-[#171C16] text-[#A8AFA2] hover:text-[#F0F2EC] border border-[#252D22]"
                }`}
              >
                1. Citra Satelit Radar
              </button>
              <button
                type="button"
                onClick={() => setActiveChip("sensor")}
                className={`button-touch px-3.5 py-1.5 rounded-pill text-[0.78rem] font-medium transition-colors ${
                  activeChip === "sensor"
                    ? "bg-[#AEDA2D] text-[#11160B]"
                    : "bg-[#171C16] text-[#A8AFA2] hover:text-[#F0F2EC] border border-[#252D22]"
                }`}
              >
                2. Sensor Fisik Pohon
              </button>
              <button
                type="button"
                onClick={() => setActiveChip("izin")}
                className={`button-touch px-3.5 py-1.5 rounded-pill text-[0.78rem] font-medium transition-colors ${
                  activeChip === "izin"
                    ? "bg-[#AEDA2D] text-[#11160B]"
                    : "bg-[#171C16] text-[#A8AFA2] hover:text-[#F0F2EC] border border-[#252D22]"
                }`}
              >
                3. Hak Izin Adat
              </button>
            </div>

            {/* Interactive Telemetry Inspector Box */}
            <div className="surface-raised p-4 rounded-panel border border-[#252D22] text-[0.825rem]">
              {activeChip === "satelit" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#A8AFA2] flex items-center gap-1.5 font-medium">
                      <Layers className="w-4 h-4 text-[#AEDA2D]" />
                      Sentinel-1 SAR Radar &amp; Sentinel-2 MSI
                    </span>
                    <span className="text-[0.7rem] font-mono text-[#64753E]">GEE Cache: Valid</span>
                  </div>
                  <p className="text-[0.78rem] text-[#747D70] leading-relaxed">
                    Radar C-band menembus tutupan awan hujan Kalimantan untuk mengukur kelembapan kanopi (-12.4 dB).
                    Indeks kehijauan rata-rata berada pada 0.78 NDVI.
                  </p>
                </div>
              )}

              {activeChip === "sensor" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#A8AFA2] flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-4 h-4 text-[#AEDA2D]" />
                      Mikrokontroler ESP32 + DHT22 + KY-026
                    </span>
                    <span className="text-[0.7rem] font-mono text-[#AEDA2D]">Ping: 5 Detik</span>
                  </div>
                  <p className="text-[0.78rem] text-[#747D70] leading-relaxed">
                    Dipasang di pohon penyangga dengan baterai mandiri. Menghitung suhu permukaan 31.4&deg;C,
                    kelembapan udara 68.2%, dan status nyala api 0 (Aman).
                  </p>
                </div>
              )}

              {activeChip === "izin" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#A8AFA2] flex items-center gap-1.5 font-medium">
                      <Check className="w-4 h-4 text-[#AEDA2D]" />
                      Konsensus Lembaga Adat Desa
                    </span>
                    <span className="text-[0.7rem] font-mono text-[#AEDA2D]">Terekam di Ledger</span>
                  </div>
                  <p className="text-[0.78rem] text-[#747D70] leading-relaxed">
                    Izin resmi diberikan dengan tanda tangan digital terotentikasi. Warga memiliki hak veto
                    untuk membuka sengketa yang seketika menghentikan transaksi.
                  </p>
                </div>
              )}
            </div>

            {/* Two Mini Status Cards (Section 4.5 right column) */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="surface-soft p-3.5 rounded-panel border border-[#252D22]">
                <span className="text-[0.7rem] text-[#747D70] block">Status Verifikasi</span>
                <span className="text-[0.95rem] font-medium text-[#F0F2EC] mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#AEDA2D]" />
                  Terverifikasi
                </span>
                <span className="text-[0.72rem] text-[#64753E] mt-1 block">
                  600 unit siap rilis
                </span>
              </div>

              <div className="surface-soft p-3.5 rounded-panel border border-[#252D22]">
                <span className="text-[0.7rem] text-[#747D70] block">Integritas Hash</span>
                <span className="text-[0.95rem] font-medium text-[#F0F2EC] mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#AEDA2D]" />
                  Cocok 100%
                </span>
                <span className="text-[0.72rem] text-[#747D70] font-mono mt-1 block truncate">
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

