"use client";

import { useState } from "react";
import { MOCK_PARCELS } from "@/lib/mock-data";
import { Check, Lock, MapPin, FileText, Activity } from "lucide-react";

export function InteractiveMapPreview() {
  const [selectedParcelId, setSelectedParcelId] = useState<string>("lahan-a");
  const parcel = MOCK_PARCELS.find((p) => p.id === selectedParcelId) || MOCK_PARCELS[0];
  const isVerified = parcel.status === "VERIFIED";

  return (
    <section id="peta" className="py-20 sm:py-28 border-t border-[#1B211A]">
      <div className="page-shell">
        {/* Section Header */}
        <div className="max-w-2xl mb-10 sm:mb-14">
          <span className="text-[0.75rem] font-semibold text-[#AEDA2D] uppercase tracking-wider block mb-2">
            Sistem Geospasial Terintegrasi
          </span>
          <h2 className="text-[clamp(2.1rem,3.5vw,3.2rem)] font-normal text-[#F0F2EC] leading-[1.18] tracking-tight">
            Lihat petak hutan dan{" "}
            <span className="text-[#AEDA2D]">status izinnya</span>.
          </h2>
          <p className="mt-4 text-[0.95rem] text-[#A8AFA2] leading-relaxed">
            Status petak ditentukan langsung oleh aturan sistem tanpa campur tangan manual.
            Petak dengan izin sah akan terverifikasi, sedangkan petak tanpa izin warga otomatis terkunci.
          </p>
        </div>

        {/* Parcel Selector Buttons (Dark Lime Pills) */}
        <div className="flex flex-wrap gap-2.5 mb-8">
          {MOCK_PARCELS.map((p) => {
            const isSelected = p.id === selectedParcelId;
            const pVerified = p.status === "VERIFIED";

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedParcelId(p.id)}
                className={`button-touch px-5 py-2.5 rounded-pill text-[0.8rem] sm:text-[0.85rem] font-medium flex items-center gap-2.5 border transition-all ${
                  isSelected
                    ? "bg-[#AEDA2D] text-[#11160B] border-[#AEDA2D] shadow-[0_0_20px_rgba(174,218,45,0.25)]"
                    : "bg-[#101610] text-[#A8AFA2] border-[#252D22] hover:text-[#F0F2EC] hover:bg-[#1D231B]"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    pVerified
                      ? isSelected
                        ? "bg-[#11160B]"
                        : "bg-[#AEDA2D] shadow-[0_0_8px_rgba(174,218,45,0.7)]"
                      : "bg-[#D84C4C] shadow-[0_0_8px_rgba(216,76,76,0.7)]"
                  }`}
                />
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Inspection Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Simulated Map Radar Canvas (7 Cols) */}
          <div className="lg:col-span-7 aspect-[4/3] rounded-card bg-[#101610] border border-[#252D22] p-6 flex flex-col justify-between relative overflow-hidden shadow-panel">
            {/* Ambient Backlight inside Canvas */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-[100px] pointer-events-none transition-all duration-700 ${
                isVerified ? "bg-[#AEDA2D]/10" : "bg-[#D84C4C]/10"
              }`}
            />

            {/* Radar Coordinates Header */}
            <div className="relative z-10 flex items-center justify-between text-xs text-[#747D70] font-mono">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#AEDA2D]" />
                {parcel.location}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#171C16] border border-[#252D22] text-[#F0F2EC] text-[11px]">
                {parcel.areaHa} Hektar
              </span>
            </div>

            {/* Central Polygon Geometric Display */}
            <div className="relative z-10 flex flex-col items-center justify-center my-auto">
              <div
                className={`w-40 h-40 sm:w-48 sm:h-48 rounded-panel border flex flex-col items-center justify-center text-center p-5 transition-all duration-500 backdrop-blur-sm ${
                  isVerified
                    ? "border-[#AEDA2D]/40 bg-[#171C16]/90 shadow-[0_0_40px_rgba(174,218,45,0.15)] text-[#AEDA2D]"
                    : "border-[#D84C4C]/40 bg-[#171C16]/90 shadow-[0_0_40px_rgba(216,76,76,0.15)] text-[#D84C4C]"
                }`}
              >
                {isVerified ? (
                  <Check className="w-10 h-10 text-[#AEDA2D] mb-2" />
                ) : (
                  <Lock className="w-10 h-10 text-[#D84C4C] mb-2" />
                )}
                <span className="text-[#F0F2EC] text-sm font-medium tracking-tight">{parcel.statusLabel}</span>
                <span className="text-[#747D70] text-xs mt-1">
                  {isVerified ? "Izin Adat Lengkap" : "Tanpa Izin Warga"}
                </span>
              </div>
            </div>

            {/* Bottom Status Bar inside Canvas */}
            <div className="relative z-10 flex items-center justify-between text-xs text-[#747D70] font-mono border-t border-[#1B211A] pt-3">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#AEDA2D]" />
                NDVI Radar: {parcel.satellite.ndviMean}
              </span>
              <span>Sensor Suhu: {parcel.telemetry.tempC}&deg;C</span>
            </div>
          </div>

          {/* Telemetry Inspection Card (5 Cols) */}
          <div className="lg:col-span-5 rounded-card bg-[#101610] border border-[#252D22] p-6 sm:p-7 shadow-panel flex flex-col justify-between gap-6">
            <div>
              <span className="text-[0.75rem] font-semibold text-[#AEDA2D] uppercase tracking-wider block">
                Data Telemetri Fisik
              </span>
              <h3 className="text-[1.25rem] font-medium text-[#F0F2EC] mt-1.5 tracking-tight">
                {parcel.name}
              </h3>
              <p className="text-xs text-[#747D70] mt-0.5">{parcel.location}</p>
            </div>

            {/* Status Box */}
            <div
              className={`p-4 rounded-panel border flex items-center gap-3.5 ${
                isVerified
                  ? "bg-[#171C16] border-[#AEDA2D]/30 text-[#A8AFA2]"
                  : "bg-[#171C16] border-[#D84C4C]/30 text-[#A8AFA2]"
              }`}
            >
              {isVerified ? (
                <Check className="w-5 h-5 text-[#AEDA2D] flex-shrink-0" />
              ) : (
                <Lock className="w-5 h-5 text-[#D84C4C] flex-shrink-0" />
              )}
              <div className="text-xs leading-relaxed">
                <span className="font-semibold block text-[#F0F2EC]">{parcel.statusLabel}</span>
                {isVerified
                  ? "Izin warga tercatat sah. Unit karbon berhak masuk simulasi pasar."
                  : "Belum ada izin warga adat. Sistem otomatis menolak penguncian unit."}
              </div>
            </div>

            {/* Clean Telemetry Key-Value Pairs */}
            <div className="text-xs space-y-3 divide-y divide-[#1B211A]">
              <div className="flex justify-between pt-2">
                <span className="text-[#747D70]">Persetujuan Komunitas</span>
                <span className="font-medium text-[#F0F2EC]">
                  {parcel.consent === "granted" ? "Diberikan (Lembaga Adat)" : "Belum Ada"}
                </span>
              </div>
              <div className="flex justify-between pt-3">
                <span className="text-[#747D70]">Sensor Api Lapangan</span>
                <span className="font-medium text-[#F0F2EC]">
                  {parcel.telemetry.flame === 0 ? "Aman (0 Titik Api)" : "Peringatan Api"}
                </span>
              </div>
              <div className="flex justify-between pt-3">
                <span className="text-[#747D70]">Kelembapan Tanah</span>
                <span className="font-medium text-[#F0F2EC]">{parcel.telemetry.soilPct}% (Normal)</span>
              </div>
              <div className="flex justify-between pt-3">
                <span className="text-[#747D70]">Unit Karbon Siap Terbit</span>
                <span className="font-mono font-medium text-[#AEDA2D]">
                  {isVerified ? `${parcel.carbonUnits} Unit` : "0 Unit (Tertahan)"}
                </span>
              </div>
            </div>

            {/* Cryptographic Seal Snippet */}
            <div className="pt-2">
              <div className="p-3.5 rounded-panel bg-[#171C16] border border-[#252D22] font-mono text-[11px] text-[#747D70] flex items-center justify-between">
                <span className="truncate pr-2">Segel: {parcel.digitalSeal.hash.substring(0, 22)}...</span>
                <FileText className="w-3.5 h-3.5 text-[#AEDA2D] flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
