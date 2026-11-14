"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trees, Sun, Droplets, Zap, ShieldAlert, Cpu } from "lucide-react";

interface CanopyStratum {
  id: string;
  name: string;
  height: string;
  solarAbsorption: string;
  biomassContribution: string;
  keySpecies: string;
  carbonRole: string;
}

const STRATA: CanopyStratum[] = [
  {
    id: "emergent",
    name: "Tajuk Tertinggi (Emergent Layer)",
    height: "50 - 65 Meter",
    solarAbsorption: "95% Radiasi Matahari",
    biomassContribution: "32% Total Biomassa",
    keySpecies: "Pohon Meranti Purba (Shorea sp.) & Ramin",
    carbonRole:
      "Tiang biomassa raksasa penangkap angin badai. Menyimpan akumulasi karbon ratusan tahun dalam batang kayu padat berdiameter 2+ meter.",
  },
  {
    id: "canopy",
    name: "Kanopi Rapat (Main Canopy)",
    height: "30 - 45 Meter",
    solarAbsorption: "82% Penyerapan Foton",
    biomassContribution: "48% Total Biomassa",
    keySpecies: "Epifit, Anggrek Hutan, & Jalur Jelajah Orangutan",
    carbonRole:
      "Dapur fotosintesis utama dunia. Miliaran meter persegi daun aktif mengubah karbon dioksida atmosfer menjadi glukosa dan biomassa selulosa setiap detik.",
  },
  {
    id: "understory",
    name: "Lapisan Tengah (Understory)",
    height: "10 - 25 Meter",
    solarAbsorption: "15% Penetrasi Cahaya",
    biomassContribution: "12% Total Biomassa",
    keySpecies: "Pakis Purba, Rotan Hutan, & Pohon Muda",
    carbonRole:
      "Penyangga mikroklimat. Memerangkap kelembapan 85%+ dan menurunkan suhu tanah rimba hingga 6°C lebih sejuk dibanding padang terbuka.",
  },
  {
    id: "peatland",
    name: "Lahan Gambut & Akar Sub-surface",
    height: "0 hingga -5 Meter",
    solarAbsorption: "0% (Anaerob Bawah Tanah)",
    biomassContribution: "550 Ton C / Hektar",
    keySpecies: "Akumulasi Vegetasi 10.000 Tahun Tanpa Oksigen",
    carbonRole:
      "Brankas karbon terdalam bumi. Lapisan gambut tropis basah mengunci karbon organik terestrial secara permanen selama tanah tetap basah terlindungi.",
  },
];

export function CanopyBiomassStage() {
  const [activeStratumId, setActiveStratumId] = useState<string>("canopy");

  const currentStratum =
    STRATA.find((s) => s.id === activeStratumId) || STRATA[1];

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#020704] via-[#05130a] to-[#020804] px-4 sm:px-8">
      {/* Background Vertical Architecture Grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(52, 211, 153, 0.12) 1px, transparent 1px)",
          backgroundSize: "100% 48px",
        }}
      />

      {/* Main Diorama Card */}
      <div className="relative z-10 w-full max-w-5xl rounded-3xl bg-[#060e07]/92 border border-white/12 backdrop-blur-2xl p-6 sm:p-9 shadow-[0_25px_80px_rgba(0,0,0,0.85)] pointer-events-auto">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trees className="w-4 h-4 text-[#AEDA2D]" />
              <span className="text-xs font-mono font-semibold tracking-wider text-[#AEDA2D] uppercase">
                BIOMASS STRATA ARCHITECTURE
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Arsitektur Biomassa &amp; Kanopi Rimba
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#AEDA2D] bg-[#AEDA2D]/10 px-3 py-1.5 rounded-xl border border-[#AEDA2D]/30 self-start sm:self-auto">
            <Zap className="w-3.5 h-3.5" />
            <span>Fotosintesis Aktif 24/7</span>
          </div>
        </div>

        {/* 4 Stratum Vertical Selector Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
          {STRATA.map((stratum) => {
            const isSelected = stratum.id === activeStratumId;
            return (
              <button
                key={stratum.id}
                onClick={() => setActiveStratumId(stratum.id)}
                className={`p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                  isSelected
                    ? "bg-[#122315] border-[#AEDA2D] shadow-[0_0_20px_rgba(174,218,45,0.25)]"
                    : "bg-black/40 border-white/10 hover:border-white/30 text-white/60"
                }`}
              >
                <div className="text-[0.68rem] font-mono text-[#AEDA2D] font-bold">
                  {stratum.height}
                </div>
                <div className="text-xs font-semibold text-white mt-1 leading-snug">
                  {stratum.name.split("(")[0]}
                </div>
              </button>
            );
          })}
        </div>

        {/* Stratum Detailed Breakdown Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-2">
          {/* Left: Strata Graphic Simulation */}
          <div className="lg:col-span-5 rounded-2xl bg-black/60 border border-white/10 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-white/50 mb-3">
                <span>SIMULASI PENETRASI LIDAR</span>
                <span className="text-[#34d399] font-bold">SENTINEL-2 / GEDI</span>
              </div>

              {/* Stacked Strata Bar Indicator */}
              <div className="space-y-2 my-2">
                {STRATA.map((s) => {
                  const isCurrent = s.id === activeStratumId;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setActiveStratumId(s.id)}
                      className={`h-9 rounded-xl px-3 flex items-center justify-between text-xs font-mono transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-[#AEDA2D]/25 border border-[#AEDA2D] text-white shadow-[0_0_12px_rgba(174,218,45,0.3)] font-bold"
                          : "bg-white/5 border border-white/5 text-white/50 hover:bg-white/10"
                      }`}
                    >
                      <span>{s.name.split("(")[0]}</span>
                      <span className="text-[0.7rem] text-[#AEDA2D]">{s.height}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/50">
              <span>Spesies Utama:</span>
              <span className="text-white font-medium text-[0.72rem] truncate max-w-[200px]">
                {currentStratum.keySpecies}
              </span>
            </div>
          </div>

          {/* Right: Metrics & Scientific Function */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                <div className="flex items-center justify-between text-white/50 mb-1">
                  <span className="text-[0.68rem] font-mono">ABSORPSI RADIASI</span>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-lg sm:text-xl font-mono font-bold text-white">
                  {currentStratum.solarAbsorption}
                </div>
                <span className="text-[0.62rem] text-white/40 block mt-0.5">Penetrasi Foton</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                <div className="flex items-center justify-between text-white/50 mb-1">
                  <span className="text-[0.68rem] font-mono">PORSI BIOMASSA</span>
                  <Droplets className="w-3.5 h-3.5 text-[#34d399]" />
                </div>
                <div className="text-lg sm:text-xl font-mono font-bold text-[#AEDA2D]">
                  {currentStratum.biomassContribution}
                </div>
                <span className="text-[0.62rem] text-white/40 block mt-0.5">Simpanan Karbon Aktif</span>
              </div>
            </div>

            {/* Description Card */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2 text-xs font-mono text-[#AEDA2D]">
                <Cpu className="w-4 h-4" />
                <span className="font-semibold text-white">{currentStratum.name}</span>
              </div>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
                {currentStratum.carbonRole}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
