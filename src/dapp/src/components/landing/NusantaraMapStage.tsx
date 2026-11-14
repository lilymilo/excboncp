"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Trees, ShieldCheck, Satellite, Layers, CheckCircle2 } from "lucide-react";

interface IslandRegion {
  id: string;
  name: string;
  category: string;
  coords: string;
  forestCover: string;
  carbonStock: string;
  ndvi: string;
  fpicStatus: string;
  description: string;
}

const REGIONS: IslandRegion[] = [
  {
    id: "kalimantan",
    name: "Kalimantan",
    category: "Hutan Hujan Primer & Koridor Endemik",
    coords: "0.7893° S, 113.9213° E",
    forestCover: "40.8 Juta Ha",
    carbonStock: "12.4 Gt CO2e",
    ndvi: "0.86 (Sangat Lebat)",
    fpicStatus: "78% Terpenuhi (Konsensus Aktif)",
    description:
      "Habitat utama Orangutan Borneo dengan kanopi purba penyerap emisi raksasa. Dilengkapi simpul IoT pemantau suhu dan pencegah kebakaran gambut.",
  },
  {
    id: "sumatra",
    name: "Sumatra",
    category: "Lahan Gambut Dalam & Ekosistem Leuser",
    coords: "0.5897° N, 101.3431° E",
    forestCover: "14.2 Juta Ha",
    carbonStock: "7.8 Gt CO2e",
    ndvi: "0.81 (Lebat)",
    fpicStatus: "74% Terpenuhi (Terverifikasi)",
    description:
      "Kawasan rawa gambut tropis terdalam dengan simpanan karbon bawah tanah tertinggi. Membutuhkan sensor kelembapan tanah multi-level.",
  },
  {
    id: "papua",
    name: "Papua",
    category: "Taman Nasional Lorentz & Hutan Perawan",
    coords: "4.2699° S, 138.0804° E",
    forestCover: "34.6 Juta Ha",
    carbonStock: "9.2 Gt CO2e",
    ndvi: "0.91 (Pristine Reserve)",
    fpicStatus: "82% Terpenuhi (Hukum Adat)",
    description:
      "Bentang alam hutan tropis perawan terluas di Asia Pasifik. Keanekaragaman hayati tertinggi dengan integrasi satelit Sentinel-2.",
  },
  {
    id: "sulawesi",
    name: "Sulawesi",
    category: "Kawasan Transisi Wallacea",
    coords: "1.4300° S, 121.4456° E",
    forestCover: "8.9 Juta Ha",
    carbonStock: "2.1 Gt CO2e",
    ndvi: "0.79 (Subur)",
    fpicStatus: "71% Terpenuhi (Terverifikasi)",
    description:
      "Garis Wallacea dengan spesies unik. Dipantau untuk restorasi koridor hijau dan pemberdayaan masyarakat desa tepi hutan.",
  },
];

export function NusantaraMapStage() {
  const [selectedId, setSelectedId] = useState<string>("kalimantan");

  const activeRegion = REGIONS.find((r) => r.id === selectedId) || REGIONS[0];

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#020804] via-[#041108] to-[#020704] px-4 sm:px-8">
      {/* Background Cartography Grid Lines */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(174, 218, 45, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(174, 218, 45, 0.15) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Main Diorama Card */}
      <div className="relative z-10 w-full max-w-5xl rounded-3xl bg-[#060e07]/90 border border-white/12 backdrop-blur-2xl p-6 sm:p-9 shadow-[0_25px_80px_rgba(0,0,0,0.85)] pointer-events-auto">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Satellite className="w-4 h-4 text-[#AEDA2D] animate-pulse" />
              <span className="text-xs font-mono font-semibold tracking-wider text-[#AEDA2D] uppercase">
                GEOSPATIAL SENTINEL • ARCHIPELAGO RADAR
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Benteng Karbon Tropis Nusantara
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-white/50 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-[#64c975]" />
            <span>120+ Juta Hektar Hutan Terpantau</span>
          </div>
        </div>

        {/* Region Selector Pills */}
        <div className="flex flex-wrap gap-2 my-4">
          {REGIONS.map((r) => {
            const isSelected = r.id === selectedId;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? "bg-[#AEDA2D]/20 text-[#AEDA2D] border border-[#AEDA2D]/50 shadow-[0_0_15px_rgba(174,218,45,0.2)]"
                    : "bg-white/5 text-white/60 hover:text-white border border-white/10"
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 ${isSelected ? "text-[#AEDA2D]" : "text-white/40"}`} />
                <span>{r.name}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive GIS Display Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-2">
          {/* Left: Vector Radar / Polygon Schematic Box */}
          <div className="lg:col-span-5 rounded-2xl bg-black/60 border border-white/10 p-5 flex flex-col justify-between relative overflow-hidden">
            {/* Ambient Corner Glow */}
            <div
              aria-hidden="true"
              className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#AEDA2D]/20 blur-2xl pointer-events-none"
            />

            <div>
              <div className="flex items-center justify-between text-xs font-mono text-white/50 mb-3">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#AEDA2D]" />
                  POLIGON VEKTOR GIS
                </span>
                <span className="text-[#AEDA2D] font-bold">{activeRegion.coords}</span>
              </div>

              {/* Stylized Island Polygon Radar Wireframe */}
              <div className="h-44 w-full rounded-xl bg-[#09150c]/80 border border-[#1b331f] relative flex items-center justify-center overflow-hidden">
                {/* Radar Grid Circles */}
                <div className="absolute w-36 h-36 rounded-full border border-dashed border-[#AEDA2D]/30" />
                <div className="absolute w-20 h-20 rounded-full border border-[#AEDA2D]/40" />

                {/* Animated Scanner Bar */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 origin-center pointer-events-none"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent 0deg, transparent 300deg, rgba(174, 218, 45, 0.25) 360deg)",
                  }}
                />

                {/* Central Geographic Pin Indicator */}
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-[#AEDA2D]/20 border border-[#AEDA2D] flex items-center justify-center shadow-[0_0_20px_#AEDA2D]">
                    <Trees className="w-5 h-5 text-[#AEDA2D]" />
                  </div>
                  <span className="text-xs font-mono font-bold text-white tracking-wider">
                    POLIGON #{activeRegion.id.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* FPIC Legal Status Badge */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono text-white/50">Konsensus FPIC 70%:</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#8fcb97]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#64c975]" />
                {activeRegion.fpicStatus}
              </span>
            </div>
          </div>

          {/* Right: Detailed Telemetry Cards */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-3">
            {/* Top 3 Key Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                <span className="text-[0.68rem] font-mono text-white/50 block mb-1">
                  TUTUPAN HUTAN
                </span>
                <span className="text-lg sm:text-xl font-mono font-bold text-white">
                  {activeRegion.forestCover}
                </span>
                <span className="text-[0.62rem] text-white/40 block mt-0.5">Citra Sentinel-2</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                <span className="text-[0.68rem] font-mono text-white/50 block mb-1">
                  STOK KARBON
                </span>
                <span className="text-lg sm:text-xl font-mono font-bold text-[#AEDA2D]">
                  {activeRegion.carbonStock}
                </span>
                <span className="text-[0.62rem] text-white/40 block mt-0.5">Biomassa Terestrial</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                <span className="text-[0.68rem] font-mono text-white/50 block mb-1">
                  INDEKS NDVI
                </span>
                <span className="text-lg sm:text-xl font-mono font-bold text-[#34d399]">
                  {activeRegion.ndvi.split(" ")[0]}
                </span>
                <span className="text-[0.62rem] text-white/40 block mt-0.5">Kerapatan Kanopi</span>
              </div>
            </div>

            {/* Description Narrative Card */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2 text-xs font-mono text-[#AEDA2D]">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-semibold text-white">{activeRegion.category}</span>
              </div>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
                {activeRegion.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
