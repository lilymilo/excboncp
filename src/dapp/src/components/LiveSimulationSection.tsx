"use client";

import { useState } from "react";
import { formatIDR } from "@/lib/utils";
import { Flame, ShieldAlert, Check } from "lucide-react";

export function LiveSimulationSection() {
  const [fireSimulated, setFireSimulated] = useState(false);

  // Economic formula from Blueprint: settle(units, 40000, 2, 60)
  const pricePerUnit = 40000;
  const units = fireSimulated ? 500 : 600;
  const gross = units * pricePerUnit;
  const fee = (gross * 2) / 100;
  const net = gross - fee;
  const communityShare = (net * 60) / 100;
  const managerShare = net - communityShare;

  return (
    <section id="simulasi" className="py-20 sm:py-28 border-t border-[#1B211A]">
      <div className="page-shell">
        <div className="rounded-card bg-[#101610] border border-[#252D22] p-6 sm:p-12 shadow-panel relative overflow-hidden">
          {/* Dynamic Ambient Glow inside Container */}
          <div
            className={`absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[120px] pointer-events-none transition-all duration-700 ${
              fireSimulated ? "bg-[#D29A38]/20" : "bg-[#AEDA2D]/10"
            }`}
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 border-b border-[#1B211A]">
            <div className="max-w-xl">
              <span className="text-[0.75rem] font-semibold text-[#AEDA2D] uppercase tracking-wider block mb-2">
                Simulasi Bagi Hasil Terbuka
              </span>
              <h2 className="text-[clamp(2.1rem,3.5vw,3.2rem)] font-normal text-[#F0F2EC] leading-[1.18] tracking-tight">
                Bukti bermasalah,{" "}
                <span className="text-[#AEDA2D]">pendapatan berkurang</span> otomatis.
              </h2>
              <p className="mt-3 text-[0.95rem] text-[#A8AFA2] leading-relaxed">
                Setiap pihak melihat angka yang sama. Hanya unit terverifikasi yang boleh dijual.
                Jika sensor mendeteksi bahaya, sistem langsung membekukan unit saat itu juga.
              </p>
            </div>

            {/* Live Fire Simulation Trigger */}
            <div className="flex items-center gap-3 bg-[#171C16] border border-[#252D22] p-2.5 rounded-panel">
              <button
                type="button"
                onClick={() => setFireSimulated(!fireSimulated)}
                className={`button-touch px-4 py-2.5 rounded-pill text-[0.8rem] font-semibold flex items-center gap-2 transition-all ${
                  fireSimulated
                    ? "bg-[#D29A38] text-[#11160B] shadow-[0_0_20px_rgba(210,154,56,0.4)]"
                    : "bg-[#1D231B] text-[#F0F2EC] hover:bg-[#252D22]"
                }`}
              >
                <Flame className={`w-4 h-4 ${fireSimulated ? "text-[#11160B]" : "text-[#D29A38]"}`} />
                <span>{fireSimulated ? "Matikan Pemicu Api" : "Uji Nyala Api (KY-026)"}</span>
              </button>
              <span className="text-[11px] text-[#747D70] pr-2 font-mono">
                {fireSimulated ? "100 unit dibekukan" : "Status normal"}
              </span>
            </div>
          </div>

          {/* Real-time Calculation Grid */}
          <div className="relative z-10 mt-10 grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
            {/* Units Card */}
            <div className="surface-card p-5 sm:p-6 bg-[#171C16] border-[#252D22]">
              <span className="text-[0.75rem] text-[#747D70] font-mono uppercase tracking-wider block">
                Unit Terverifikasi
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-mono font-medium text-[#F0F2EC]">{units}</span>
                <span className="text-xs text-[#747D70]">tCO2e</span>
              </div>
              <div className="mt-4 pt-3 border-t border-[#1B211A] flex items-center gap-1.5 text-[11px]">
                {fireSimulated ? (
                  <span className="text-[#D29A38] flex items-center gap-1 font-medium">
                    <ShieldAlert className="w-3.5 h-3.5" /> 100 Unit Terkunci Sensor
                  </span>
                ) : (
                  <span className="text-[#AEDA2D] flex items-center gap-1 font-medium">
                    <Check className="w-3.5 h-3.5" /> 100% Lolos Verifikasi
                  </span>
                )}
              </div>
            </div>

            {/* Total Gross Value */}
            <div className="surface-card p-5 sm:p-6 bg-[#171C16] border-[#252D22]">
              <span className="text-[0.75rem] text-[#747D70] font-mono uppercase tracking-wider block">
                Nilai Transaksi (Rp40k/t)
              </span>
              <div className="mt-3 text-2xl font-mono font-medium text-[#F0F2EC] tracking-tight">
                {formatIDR(gross)}
              </div>
              <div className="mt-4 pt-3 border-t border-[#1B211A] text-[11px] text-[#747D70]">
                Biaya platform 2%: <span className="font-mono text-[#A8AFA2]">{formatIDR(fee)}</span>
              </div>
            </div>

            {/* Community Share Card (Highlighted Lime Pill/Border) */}
            <div className="surface-card p-5 sm:p-6 bg-[#1D231B] border-[#AEDA2D]/40">
              <div className="flex items-center justify-between">
                <span className="text-[0.75rem] text-[#AEDA2D] font-mono uppercase tracking-wider">
                  Kas Adat (60%)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#AEDA2D]/10 text-[#AEDA2D] border border-[#AEDA2D]/20 text-[10px] font-medium">
                  Hak Veto
                </span>
              </div>
              <div className="mt-3 text-2xl font-mono font-bold text-[#AEDA2D] tracking-tight">
                {formatIDR(communityShare)}
              </div>
              <div className="mt-4 pt-3 border-t border-[#252D22] text-[11px] text-[#A8AFA2]">
                Langsung masuk ke kas komunitas warga
              </div>
            </div>

            {/* Forestry Manager Share Card */}
            <div className="surface-card p-5 sm:p-6 bg-[#171C16] border-[#252D22]">
              <span className="text-[0.75rem] text-[#747D70] font-mono uppercase tracking-wider block">
                Pengelola Lahan (40%)
              </span>
              <div className="mt-3 text-2xl font-mono font-medium text-[#F0F2EC] tracking-tight">
                {formatIDR(managerShare)}
              </div>
              <div className="mt-4 pt-3 border-t border-[#1B211A] text-[11px] text-[#747D70]">
                Operasional pemeliharaan sensor dan lahan
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
