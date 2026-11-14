"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Cpu, Flame, Droplets, Thermometer, ShieldCheck, Heart, RefreshCw, KeyRound } from "lucide-react";

export function IotHardwareStage() {
  const [temperature, setTemperature] = useState(26.5);
  const [soilMoisture, setSoilMoisture] = useState(64.2);
  const [fireState, setFireState] = useState<"normal" | "warning" | "danger">("normal");

  // Deterministic live hash simulation based on state
  const computedHash = `0x${((Math.round(temperature * 100) + Math.round(soilMoisture * 10) + (fireState === "danger" ? 9999 : fireState === "warning" ? 5555 : 1111)) * 987654321)
    .toString(16)
    .padStart(8, "0")}...${(fireState === "danger" ? "DEADBEEF" : fireState === "warning" ? "CAFEBABE" : "AEDA2D01")}`;

  const toggleFireState = () => {
    if (fireState === "normal") setFireState("warning");
    else if (fireState === "warning") setFireState("danger");
    else setFireState("normal");
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#020804] via-[#05140b] to-[#020704] px-4 sm:px-8">
      {/* Background Cyber-PCB Traces (Subtle Grid) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(#AEDA2D 1px, transparent 1px), radial-gradient(#38bdf8 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          backgroundPosition: "0 0, 20px 20px",
        }}
      />

      {/* Main Hardware Telemetry Console Card */}
      <div className="relative z-10 w-full max-w-5xl rounded-3xl bg-[#060e07]/92 border border-white/12 backdrop-blur-2xl p-6 sm:p-9 shadow-[0_25px_80px_rgba(0,0,0,0.85)] pointer-events-auto">
        {/* Top Header & Node ID */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="w-4 h-4 text-[#AEDA2D]" />
              <span className="text-xs font-mono font-semibold tracking-wider text-[#AEDA2D] uppercase">
                EDGE IOT HARDWARE • TAMPER-EVIDENT MRV
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Simbiosis Satwa &amp; Sensor Pohon Pintar
            </h3>
          </div>

          {/* Wildlife Shield Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#f97316]/15 border border-[#f97316]/40 text-xs font-mono text-[#f97316] font-semibold self-start sm:self-auto">
            <Heart className="w-3.5 h-3.5 fill-[#f97316]" />
            <span>Koridor Orangutan Kalimantan Terpantau</span>
          </div>
        </div>

        {/* 2-Column Split: Left Hardware Simulator / Right Cryptographic Seal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 my-4">
          {/* Left: Interactive Sensor Dials */}
          <div className="lg:col-span-7 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {/* Temperature */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                <div className="flex items-center justify-between text-white/50 mb-1">
                  <span className="text-[0.68rem] font-mono">SUHU UDARA</span>
                  <Thermometer className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-lg sm:text-2xl font-mono font-bold text-white">
                  {temperature}°C
                </div>
                <span className="text-[0.62rem] text-white/40 block mt-0.5">DHT22 Digital</span>
              </div>

              {/* Soil Moisture */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                <div className="flex items-center justify-between text-white/50 mb-1">
                  <span className="text-[0.68rem] font-mono">KELEMBAPAN TANAH</span>
                  <Droplets className="w-4 h-4 text-[#38bdf8]" />
                </div>
                <div className="text-lg sm:text-2xl font-mono font-bold text-[#38bdf8]">
                  {soilMoisture}%
                </div>
                <span className="text-[0.62rem] text-white/40 block mt-0.5">Sensor Kapasitif</span>
              </div>

              {/* Flame Detection */}
              <div
                className={`p-3.5 rounded-2xl border transition-colors ${
                  fireState === "danger"
                    ? "bg-red-950/60 border-red-500/80 text-red-200"
                    : fireState === "warning"
                    ? "bg-amber-950/60 border-amber-500/80 text-amber-200"
                    : "bg-black/40 border-white/10 text-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1 opacity-70">
                  <span className="text-[0.68rem] font-mono">DETEKSI API</span>
                  <Flame className={`w-4 h-4 ${fireState !== "normal" ? "animate-bounce text-red-400" : "text-white/40"}`} />
                </div>
                <div className="text-base sm:text-lg font-mono font-bold leading-tight uppercase">
                  {fireState === "danger" ? "BAHAYA API!" : fireState === "warning" ? "SIAGA" : "AMAN"}
                </div>
                <span className="text-[0.62rem] opacity-60 block mt-0.5">Sensor KY-026</span>
              </div>
            </div>

            {/* Interactive Hardware Controls */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-white/70">Simulasi Kelembapan Tanah:</span>
                <span className="text-xs font-mono font-bold text-[#38bdf8]">{soilMoisture}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="95"
                step="0.5"
                value={soilMoisture}
                onChange={(e) => setSoilMoisture(Number(e.target.value))}
                className="w-full accent-[#38bdf8] cursor-pointer"
              />

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-xs font-mono text-white/70">Simulasi Sensor Api KY-026:</span>
                <button
                  onClick={toggleFireState}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    fireState === "danger"
                      ? "bg-red-500 text-white shadow-[0_0_15px_red]"
                      : fireState === "warning"
                      ? "bg-amber-500 text-black shadow-[0_0_15px_orange]"
                      : "bg-[#AEDA2D]/20 text-[#AEDA2D] border border-[#AEDA2D]/40 hover:bg-[#AEDA2D]/30"
                  }`}
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Ubah Status ({fireState.toUpperCase()})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Cryptographic Seal & EAS Base Sepolia Live Box */}
          <div className="lg:col-span-5 rounded-2xl bg-black/70 border border-white/10 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-white/50 mb-3">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#AEDA2D]" />
                  BUKTI KRIPTOGRAFIS EAS
                </span>
                <span className="text-[#AEDA2D] font-bold">BASE SEPOLIA</span>
              </div>

              {/* Dynamic Hash Display */}
              <div className="p-3 rounded-xl bg-[#0a150d] border border-[#1d3521] text-xs font-mono">
                <span className="text-white/40 block text-[0.68rem] mb-1">HASH CHAIN SHA-256 REAL-TIME:</span>
                <code className="text-[#AEDA2D] font-bold break-all block">{computedHash}</code>
              </div>

              <div className="mt-3 space-y-1.5 text-[0.72rem] font-mono text-white/70">
                <div className="flex justify-between">
                  <span className="text-white/40">Status Ledger:</span>
                  <span className="text-[#8fcb97] font-semibold">Terkunci &amp; Tamper-Evident</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Skema EAS:</span>
                  <span className="text-white">UID #0x4f8a...92bc</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Edge Node:</span>
                  <span className="text-white">ESP32-SOLAR-KAL-01</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 text-center">
              <span className="text-[0.72rem] text-white/60">
                Data sensor ditandatangani langsung di hardware sebelum diunggah ke blockchain.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
