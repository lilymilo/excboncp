"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";

export function TamperVerificationDemo() {
  const originalUnits = 600;
  const originalHash = "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069";
  const tamperedHash = "4a18df92a014bc91238914ab01289df198273618928371982739182739182731";

  const [isTampered, setIsTampered] = useState(false);

  return (
    <section id="verifikasi" className="py-20 sm:py-28 border-t border-[#1B211A]">
      <div className="page-shell">
        <div className="max-w-2xl mb-10 sm:mb-14">
          <span className="text-[0.75rem] font-semibold text-[#AEDA2D] uppercase tracking-wider block mb-2">
            Kriptografi Publik &bull; SHA-256
          </span>
          <h2 className="text-[clamp(2.1rem,3.5vw,3.2rem)] font-normal text-[#F0F2EC] leading-[1.18] tracking-tight">
            Uji integritas segel digital{" "}
            <span className="text-[#AEDA2D]">langsung di browser</span>.
          </h2>
          <p className="mt-4 text-[0.95rem] text-[#A8AFA2] leading-relaxed">
            Di Excboncp, peramban milikmu menghitung ulang rumus segel digital secara mandiri.
            Ubah satu angka saja pada data, segel digital seketika tidak cocok.
          </p>
        </div>

        {/* Verification Card */}
        <div className="p-6 sm:p-10 rounded-card bg-[#101610] border border-[#252D22] shadow-panel">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-7 border-b border-[#1B211A]">
            <div>
              <span className="text-[0.7rem] text-[#747D70] font-mono font-semibold uppercase tracking-wider">
                Verifikasi Mandiri di Sisi Klien
              </span>
              <h3 className="text-[1.25rem] font-medium text-[#F0F2EC] mt-1">
                Pemeriksaan Entri Lahan Long Isun #01
              </h3>
            </div>

            {/* Tamper Toggle Button */}
            <button
              type="button"
              onClick={() => setIsTampered(!isTampered)}
              className={`button-touch px-5 py-2.5 rounded-pill text-[0.8rem] font-medium flex items-center gap-2 border transition-all ${
                isTampered
                  ? "bg-[#D84C4C]/15 text-[#D84C4C] border-[#D84C4C]/40 shadow-[0_0_20px_rgba(216,76,76,0.2)]"
                  : "bg-[#171C16] hover:bg-[#1D231B] text-[#F0F2EC] border-[#252D22]"
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isTampered ? "Kembalikan Data Asli" : "Ubah 1 Angka pada Data"}</span>
            </button>
          </div>

          {/* Data Payload Comparison */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-panel bg-[#171C16] border border-[#252D22] text-xs font-mono space-y-2.5 text-[#A8AFA2]">
              <span className="text-[#747D70] font-sans font-semibold block mb-3 text-[11px] uppercase tracking-wider">
                Struktur Data yang Dibaca Browser
              </span>
              <p>
                <span className="text-[#747D70]">parcel_id:</span> &quot;lahan-long-isun-01&quot;
              </p>
              <p>
                <span className="text-[#747D70]">carbon_units:</span>{" "}
                <span
                  className={`px-1.5 py-0.5 rounded ${
                    isTampered ? "bg-[#D84C4C]/20 text-[#D84C4C] font-bold" : "text-[#AEDA2D]"
                  }`}
                >
                  {isTampered ? 999 : originalUnits}
                </span>{" "}
                {isTampered && <span className="text-[#D84C4C] text-[10px]">(Diubah fiktif!)</span>}
              </p>
              <p>
                <span className="text-[#747D70]">consent_status:</span> &quot;GRANTED&quot;
              </p>
              <p>
                <span className="text-[#747D70]">ndvi_score:</span> 0.81
              </p>
            </div>

            {/* Calculated Hash vs Stored Hash */}
            <div className="p-5 rounded-panel bg-[#171C16] border border-[#252D22] flex flex-col justify-between">
              <div>
                <span className="text-[#747D70] font-sans font-semibold block mb-3 text-[11px] uppercase tracking-wider">
                  Hasil Perhitungan Hash SHA-256
                </span>
                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-[#747D70] block text-[10px]">Segel Tersimpan di Ledger:</span>
                    <span className="text-[#F0F2EC] break-all">{originalHash}</span>
                  </div>
                  <div>
                    <span className="text-[#747D70] block text-[10px]">Segel yang Dihitung Ulang:</span>
                    <span
                      className={`break-all ${isTampered ? "text-[#D84C4C] font-bold" : "text-[#AEDA2D]"}`}
                    >
                      {isTampered ? tamperedHash : originalHash}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div
                className={`mt-6 p-4 rounded-panel border flex items-center gap-3 ${
                  isTampered
                    ? "bg-[#D84C4C]/10 border-[#D84C4C]/30 text-[#D84C4C]"
                    : "bg-[#AEDA2D]/10 border-[#AEDA2D]/30 text-[#AEDA2D]"
                }`}
              >
                {isTampered ? (
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                )}
                <div className="text-xs">
                  <span className="font-semibold block">
                    {isTampered ? "PERINGATAN: Manipulasi Terdeteksi" : "DATA VALID: Segel Digital Cocok"}
                  </span>
                  <span className="text-[11px] opacity-80">
                    {isTampered
                      ? "Angka tidak sesuai catatan rantai hash. Transaksi otomatis ditolak sistem."
                      : "Nilai hash sesuai persis dengan catatan publik. Data terbukti asli."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
