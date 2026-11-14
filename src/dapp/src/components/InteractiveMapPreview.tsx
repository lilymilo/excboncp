"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_PARCELS } from "@/lib/mock-data";
import { Check, Lock, MapPin, FileText, Activity, ArrowRight, ShieldCheck } from "lucide-react";

export function InteractiveMapPreview() {
  const [selectedParcelId, setSelectedParcelId] = useState<string>("lahan-a");
  const parcel = MOCK_PARCELS.find((p) => p.id === selectedParcelId) || MOCK_PARCELS[0];
  const isVerified = parcel.status === "VERIFIED";

  return (
    <section id="peta" className="py-16 sm:py-24 border-t border-[var(--line-subtle)]">
      <div className="page-shell">
        {/* Section Header */}
        <div className="max-w-2xl mb-10 sm:mb-14">
          <span className="xb-eyebrow block mb-2">
            Sistem Geospasial Terintegrasi
          </span>
          <h2 className="xb-display text-[clamp(2.1rem,3.5vw,3.2rem)] font-bold text-[var(--ink)] leading-[1.18] tracking-tight">
            Lihat petak hutan dan{" "}
            <span className="text-[var(--forest-800)]">status izinnya</span>.
          </h2>
          <p className="mt-4 text-[1rem] text-[var(--ink-muted)] leading-relaxed">
            Status petak ditentukan langsung oleh aturan sistem tanpa campur tangan manual.
            Petak dengan izin sah akan terverifikasi, sedangkan petak tanpa izin warga otomatis terkunci.
          </p>
        </div>

        {/* Parcel Selector Buttons (Botanical Chips) */}
        <div className="flex flex-wrap gap-2.5 mb-8">
          {MOCK_PARCELS.map((p) => {
            const isSelected = p.id === selectedParcelId;
            const pVerified = p.status === "VERIFIED";

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedParcelId(p.id)}
                className={`min-h-[40px] px-5 py-2 rounded-full text-[13.5px] font-semibold flex items-center gap-2.5 transition-all ${
                  isSelected
                    ? "bg-[var(--forest-800)] text-white shadow-xs"
                    : "bg-white text-[var(--ink-muted)] border border-[var(--line)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]"
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    pVerified
                      ? isSelected
                        ? "bg-[var(--leaf-300)]"
                        : "bg-[var(--forest-700)]"
                      : isSelected
                        ? "bg-white"
                        : "bg-[var(--status-blocked-ink)]"
                  }`}
                />
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Inspection Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Simulated Map Radar Canvas */}
          <div className="lg:col-span-7 aspect-[4/3] rounded-[20px] bg-white border border-[var(--line)] p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden shadow-card">
            {/* Ambient Backlight inside Canvas */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-[90px] pointer-events-none transition-all duration-700 ${
                isVerified ? "bg-[var(--leaf-100)] opacity-70" : "bg-[var(--status-blocked-bg)] opacity-60"
              }`}
            />

            {/* Radar Coordinates Header */}
            <div className="relative z-10 flex items-center justify-between text-[12.5px] text-[var(--ink-muted)] font-mono">
              <span className="flex items-center gap-1.5 font-sans font-semibold text-[var(--ink)]">
                <MapPin className="w-4 h-4 text-[var(--forest-700)]" />
                {parcel.location}
              </span>
              <span className="px-3 py-1 rounded-full bg-[var(--surface-soft)] border border-[var(--line)] text-[var(--ink)] font-semibold text-[12px]">
                {parcel.areaHa} Hektar
              </span>
            </div>

            {/* Central Polygon Geometric Display */}
            <div className="relative z-10 flex flex-col items-center justify-center my-auto">
              <div
                className={`w-40 h-40 sm:w-48 sm:h-48 rounded-[20px] border flex flex-col items-center justify-center text-center p-5 transition-all duration-500 backdrop-blur-xs ${
                  isVerified
                    ? "border-[var(--status-verified-line)] bg-[var(--status-verified-bg)] text-[var(--status-verified-ink)] shadow-xs"
                    : "border-[var(--status-blocked-line)] bg-[var(--status-blocked-bg)] text-[var(--status-blocked-ink)] shadow-xs"
                }`}
              >
                {isVerified ? (
                  <Check className="w-10 h-10 text-[var(--status-verified-ink)] mb-2" />
                ) : (
                  <Lock className="w-10 h-10 text-[var(--status-blocked-ink)] mb-2" />
                )}
                <span className="text-[14.5px] font-bold tracking-tight">{parcel.statusLabel}</span>
                <span className="text-[12px] opacity-85 mt-1">
                  {isVerified ? "Izin Adat Lengkap" : "Tanpa Izin Warga"}
                </span>
              </div>
            </div>

            {/* Bottom Status Bar inside Canvas */}
            <div className="relative z-10 flex items-center justify-between text-[12px] text-[var(--ink-muted)] font-mono border-t border-[var(--line-subtle)] pt-3">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[var(--forest-700)]" />
                NDVI Radar: {parcel.satellite.ndviMean}
              </span>
              <span>Sensor Suhu: {parcel.telemetry.tempC}&deg;C</span>
            </div>
          </div>

          {/* Telemetry Inspection Card */}
          <div className="lg:col-span-5 rounded-[20px] bg-white border border-[var(--line)] p-6 sm:p-7 shadow-card flex flex-col justify-between gap-6">
            <div>
              <span className="xb-eyebrow block mb-1">
                Data Telemetri Fisik
              </span>
              <h3 className="xb-display text-[1.35rem] font-bold text-[var(--ink)] tracking-tight">
                {parcel.name}
              </h3>
              <p className="text-[13px] text-[var(--ink-muted)] mt-0.5">{parcel.location}</p>
            </div>

            {/* Status Box */}
            <div
              className={`p-4 rounded-[16px] border flex items-center gap-3.5 ${
                isVerified
                  ? "bg-[var(--status-verified-bg)] border-[var(--status-verified-line)] text-[var(--status-verified-ink)]"
                  : "bg-[var(--status-blocked-bg)] border-[var(--status-blocked-line)] text-[var(--status-blocked-ink)]"
              }`}
            >
              {isVerified ? (
                <Check className="w-5 h-5 text-[var(--status-verified-ink)] flex-shrink-0" />
              ) : (
                <Lock className="w-5 h-5 text-[var(--status-blocked-ink)] flex-shrink-0" />
              )}
              <div className="text-[13px] leading-relaxed">
                <span className="font-bold block">{parcel.statusLabel}</span>
                {isVerified
                  ? "Izin warga tercatat sah. Unit karbon berhak masuk simulasi pasar."
                  : "Belum ada izin warga adat. Sistem otomatis menolak penguncian unit."}
              </div>
            </div>

            {/* Clean Telemetry Key-Value Pairs */}
            <div className="text-[13px] space-y-3 divide-y divide-[var(--line-subtle)]">
              <div className="flex justify-between pt-2">
                <span className="text-[var(--ink-muted)]">Persetujuan Komunitas</span>
                <span className="font-semibold text-[var(--ink)]">
                  {parcel.consent === "granted" ? "Diberikan (Lembaga Adat)" : "Belum Ada"}
                </span>
              </div>
              <div className="flex justify-between pt-3">
                <span className="text-[var(--ink-muted)]">Sensor Api Lapangan</span>
                <span className="font-semibold text-[var(--ink)]">
                  {parcel.telemetry.flame === 0 ? "Aman (0 Titik Api)" : "Peringatan Api"}
                </span>
              </div>
              <div className="flex justify-between pt-3">
                <span className="text-[var(--ink-muted)]">Kelembapan Tanah</span>
                <span className="font-semibold text-[var(--ink)]">{parcel.telemetry.soilPct}% (Normal)</span>
              </div>
              <div className="flex justify-between pt-3">
                <span className="text-[var(--ink-muted)]">Unit Karbon Siap Terbit</span>
                <span className="xb-numeric font-bold text-[var(--forest-800)] text-[14px]">
                  {isVerified ? `${parcel.carbonUnits} Unit` : "0 Unit (Tertahan)"}
                </span>
              </div>
            </div>

            {/* Cryptographic Seal Snippet & Link */}
            <div className="pt-2 flex flex-col gap-3">
              <div className="p-3 rounded-xl bg-[var(--surface-soft)] border border-[var(--line)] font-mono text-[11.5px] text-[var(--ink-muted)] flex items-center justify-between">
                <span className="truncate pr-2">Segel: {parcel.digitalSeal.hash.substring(0, 24)}...</span>
                <FileText className="w-3.5 h-3.5 text-[var(--seal-600)] flex-shrink-0" />
              </div>
              <Link
                href="/peta"
                className="inline-flex items-center justify-center gap-2 min-h-[42px] rounded-full bg-[var(--forest-800)] text-white hover:bg-[var(--forest-900)] text-[13.5px] font-semibold shadow-xs transition-transform active:scale-95"
              >
                <span>Buka Peta Interaktif Lengkap</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
