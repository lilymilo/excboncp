"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CloudRain, Wind, Gauge, Activity, SunMedium, Compass } from "lucide-react";
import { Particles } from "@/components/ui/particles";

export function AtmosphereStage() {
  const [altitude, setAltitude] = useState<"low" | "mid" | "high">("mid");
  const [windSpeed, setWindSpeed] = useState(18);

  const altitudeData = {
    high: {
      layer: "Troposfer Atas (12.000 M)",
      temp: "-52°C",
      humidity: "22%",
      pressure: "210 hPa",
      wind: "64 km/h (Jet Stream Khatulistiwa)",
      desc: "Lapisan sirkulasi sirkuler global yang mengalirkan kelembapan samudra melintasi sabuk khatulistiwa.",
    },
    mid: {
      layer: "Formasi Awan Konvektif (4.500 M)",
      temp: "+8°C",
      humidity: "84.2%",
      pressure: "620 hPa",
      wind: `${windSpeed} km/h (Angin Monsun Basah)`,
      desc: "Kondensasi uap air hutan membentuk selimut awan penyerap radiasi termal bumi dan penyubur kanopi.",
    },
    low: {
      layer: "Lapisan Batas Kanopi (500 M)",
      temp: "+26°C",
      humidity: "92.5%",
      pressure: "995 hPa",
      wind: "8 km/h (Mikroklimat Rimba)",
      desc: "Interaksi langsung uap transpirasi pohon purba dengan atmosfer bawah pembawa hujan harian.",
    },
  };

  const current = altitudeData[altitude];

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#020704] via-[#041209] to-[#020804] px-4 sm:px-8">
      {/* Background Interactive Particles (Misty Atmosphere Cloud Effect) */}
      <Particles
        className="absolute inset-0 z-0 opacity-40"
        quantity={90}
        color="#38bdf8"
        size={0.6}
        staticity={30}
      />

      {/* Atmospheric Radar Wave Background (CSS vector) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-25"
      >
        <div className="w-[500px] h-[500px] rounded-full border border-[#38bdf8]/30 animate-ping [animation-duration:6s]" />
        <div className="absolute w-[350px] h-[350px] rounded-full border border-[#AEDA2D]/30" />
        <div className="absolute w-[200px] h-[200px] rounded-full border border-white/20" />
      </div>

      {/* Center Interactive Atmospheric Diorama Panel */}
      <div className="relative z-10 w-full max-w-4xl rounded-3xl bg-[#050e07]/88 border border-white/12 backdrop-blur-2xl p-6 sm:p-9 shadow-[0_25px_80px_rgba(0,0,0,0.85)] pointer-events-auto">
        {/* Top Header & Altitude Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#38bdf8] shadow-[0_0_8px_#38bdf8] animate-pulse" />
              <span className="text-xs font-mono font-semibold tracking-wider text-[#38bdf8] uppercase">
                ATMOSPHERIC SOUNDING RADAR
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Siklus Hidrologi &amp; Atmosfer Khatulistiwa
            </h3>
          </div>

          {/* Altitude Level Tabs */}
          <div className="inline-flex rounded-xl bg-black/50 p-1 border border-white/10 self-start sm:self-auto">
            {(["low", "mid", "high"] as const).map((alt) => (
              <button
                key={alt}
                onClick={() => setAltitude(alt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  altitude === alt
                    ? "bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40 shadow-sm"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {alt === "low" ? "500 M" : alt === "mid" ? "4.500 M" : "12.000 M"}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Telemetry Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
            <div className="flex items-center justify-between text-white/50 mb-1.5">
              <span className="text-[0.7rem] font-mono">SUHU UDARA</span>
              <SunMedium className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-white">
              {current.temp}
            </div>
            <span className="text-[0.65rem] text-white/40">Ketinggian Lapis</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
            <div className="flex items-center justify-between text-white/50 mb-1.5">
              <span className="text-[0.7rem] font-mono">KELEMBAPAN</span>
              <CloudRain className="w-4 h-4 text-[#38bdf8]" />
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-[#38bdf8]">
              {current.humidity}
            </div>
            <span className="text-[0.65rem] text-white/40">Relative Humidity</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
            <div className="flex items-center justify-between text-white/50 mb-1.5">
              <span className="text-[0.7rem] font-mono">TEKANAN</span>
              <Gauge className="w-4 h-4 text-[#AEDA2D]" />
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-[#AEDA2D]">
              {current.pressure}
            </div>
            <span className="text-[0.65rem] text-white/40">Barometrik Sensor</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
            <div className="flex items-center justify-between text-white/50 mb-1.5">
              <span className="text-[0.7rem] font-mono">VEKTOR ANGIN</span>
              <Wind className="w-4 h-4 text-[#34d399]" />
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-[#34d399]">
              {altitude === "mid" ? `${windSpeed} km/h` : current.wind.split(" ")[0] + " km/h"}
            </div>
            <span className="text-[0.65rem] text-white/40">Monsun Khatulistiwa</span>
          </div>
        </div>

        {/* Narrative Description & Interactive Slider */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
          <div className="flex items-center gap-2 mb-1 text-xs font-mono text-white/70">
            <Compass className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="font-semibold text-white">{current.layer}</span>
          </div>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
            {current.desc}
          </p>
        </div>

        {/* Interactive Wind Simulation Slider */}
        {altitude === "mid" && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
            <label className="text-xs font-mono text-white/60 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>Simulasi Kecepatan Angin Monsun:</span>
              <span className="text-[#38bdf8] font-bold">{windSpeed} km/h</span>
            </label>
            <input
              type="range"
              min="5"
              max="50"
              value={windSpeed}
              onChange={(e) => setWindSpeed(Number(e.target.value))}
              className="w-full sm:w-48 accent-[#38bdf8] cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
}
