"use client";

import { useState } from "react";
import { formatIDR } from "@/lib/utils";
import { Flame, ShieldAlert, Check, CheckCircle2 } from "lucide-react";

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
    <section id="simulasi" className="py-16 sm:py-24 border-t border-[var(--line-subtle)]">
      <div className="page-shell">
        <div className="rounded-[24px] bg-white border border-[var(--line)] p-6 sm:p-12 shadow-card relative overflow-hidden">
          {/* Dynamic Ambient Glow inside Container */}
          <div
            className={`absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[110px] pointer-events-none transition-all duration-700 ${
              fireSimulated ? "bg-[var(--status-warning-bg)] opacity-80" : "bg-[var(--leaf-100)] opacity-70"
            }`}
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 border-b border-[var(--line-subtle)]">
            <div className="max-w-xl">
              <span className="xb-eyebrow block mb-2">
                Simulasi Bagi Hasil Terbuka
              </span>
              <h2 className="xb-display text-[clamp(2.1rem,3.5vw,3.2rem)] font-bold text-[var(--ink)] leading-[1.18] tracking-tight">
                Bukti bermasalah,{" "}
                <span className="text-[var(--forest-800)]">pendapatan berkurang</span> otomatis.
              </h2>
              <p className="mt-3 text-[1rem] text-[var(--ink-muted)] leading-relaxed">
                Setiap pihak melihat angka yang sama. Hanya unit terverifikasi yang boleh dialokasikan.
                Jika sensor mendeteksi bahaya, sistem langsung membekukan unit saat itu juga.
              </p>
            </div>

            {/* Live Fire Simulation Trigger */}
            <div className="flex items-center gap-3 bg-[var(--surface-soft)] border border-[var(--line)] p-2 rounded-full">
              <button
                type="button"
                onClick={() => setFireSimulated(!fireSimulated)}
                className={`min-h-[42px] px-5 py-2 rounded-full text-[13.5px] font-semibold flex items-center gap-2 transition-all active:scale-95 ${
                  fireSimulated
                    ? "bg-[var(--status-warning-bg)] text-[var(--status-warning-ink)] border border-[var(--status-warning-line)] shadow-xs"
                    : "bg-white text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--surface-sunken)]"
                }`}
              >
                <Flame className={`w-4 h-4 ${fireSimulated ? "text-[var(--status-warning-ink)] animate-bounce" : "text-[var(--status-warning-ink)]"}`} />
                <span>{fireSimulated ? "Matikan Pemicu Api" : "Uji Nyala Api (KY-026)"}</span>
              </button>
              <span className="text-[12px] text-[var(--ink-muted)] pr-3 font-medium">
                {fireSimulated ? "100 unit dibekukan" : "Status normal"}
              </span>
            </div>
          </div>

          {/* Real-time Calculation Grid */}
          <div className="relative z-10 mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Units Card */}
            <div className="rounded-[18px] p-5 sm:p-6 bg-[var(--surface-soft)] border border-[var(--line)]">
              <span className="text-[12px] font-semibold text-[var(--ink-dim)] uppercase tracking-wider block">
                Unit Terverifikasi
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="xb-numeric text-3xl font-bold text-[var(--ink)]">{units}</span>
                <span className="text-[13px] text-[var(--ink-muted)]">tCO2e</span>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--line-subtle)] flex items-center gap-1.5 text-[12px]">
                {fireSimulated ? (
                  <span className="text-[var(--status-warning-ink)] flex items-center gap-1 font-semibold">
                    <ShieldAlert className="w-4 h-4" /> 100 Unit Terkunci Sensor
                  </span>
                ) : (
                  <span className="text-[var(--status-verified-ink)] flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> 100% Lolos Verifikasi
                  </span>
                )}
              </div>
            </div>

            {/* Total Gross Value */}
            <div className="rounded-[18px] p-5 sm:p-6 bg-[var(--surface-soft)] border border-[var(--line)]">
              <span className="text-[12px] font-semibold text-[var(--ink-dim)] uppercase tracking-wider block">
                Nilai Transaksi (Rp40k/t)
              </span>
              <div className="xb-numeric mt-3 text-2xl font-bold text-[var(--ink)] tracking-tight">
                {formatIDR(gross)}
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--line-subtle)] text-[12px] text-[var(--ink-muted)]">
                Biaya platform 2%: <span className="xb-numeric font-semibold text-[var(--ink)]">{formatIDR(fee)}</span>
              </div>
            </div>

            {/* Community Share Card (Highlighted Deep Forest Card) */}
            <div className="rounded-[18px] p-5 sm:p-6 bg-[var(--surface-deep)] text-[var(--on-deep)] border border-[var(--deep-line)] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[var(--leaf-300)] uppercase tracking-wider">
                  Kas Adat (60%)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[var(--leaf-300)] text-[10.5px] font-semibold">
                  Hak Veto
                </span>
              </div>
              <div className="xb-numeric mt-3 text-2xl font-bold text-white tracking-tight">
                {formatIDR(communityShare)}
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--deep-line)] text-[12px] text-[var(--on-deep-muted)]">
                Langsung masuk ke kas komunitas desa
              </div>
            </div>

            {/* Forestry Manager Share Card */}
            <div className="rounded-[18px] p-5 sm:p-6 bg-[var(--surface-soft)] border border-[var(--line)]">
              <span className="text-[12px] font-semibold text-[var(--ink-dim)] uppercase tracking-wider block">
                Pengelola Lahan (40%)
              </span>
              <div className="xb-numeric mt-3 text-2xl font-bold text-[var(--ink)] tracking-tight">
                {formatIDR(managerShare)}
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--line-subtle)] text-[12px] text-[var(--ink-muted)]">
                Operasional pemeliharaan sensor dan lahan
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
