"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function ProcessJourneySection() {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      num: "01",
      title: "Telemetri Fisik & Satelit",
      desc: "Sensor di pohon mengukur suhu, kelembapan, dan nyala api tiap 5 detik. Citra satelit Sentinel mengukur kerapatan biomassa secara berkala.",
      detail: "Proses otomasi dMRV (digital Measurement, Reporting, Verification) berjalan tanpa intervensi manusia.",
      actionLabel: "Lihat Spesifikasi Sensor",
    },
    {
      num: "02",
      title: "Persetujuan Warga Adat",
      desc: "Komunitas memeriksa peta petak dan memberikan persetujuan tertulis. Tanpa persetujuan ini, sistem menolak penguncian lahan.",
      detail: "Status lahan otomatis BLOCKED jika izin belum ada, atau DISPUTE jika sengketa dibuka.",
      actionLabel: "Aturan Konsensus Adat",
    },
    {
      num: "03",
      title: "Kalkulasi Status & AI Explainer",
      desc: "Fungsi aturan deterministik menentukan kelayakan status (VERIFIED/WARNING/DISPUTE). AI merangkum alasan penjelasan dalam bahasa manusia.",
      detail: "Kode yang memutuskan status dan angka; AI hanya bertugas menjelaskan alasan kepada pengguna.",
      actionLabel: "Pelajari Aturan Status",
    },
    {
      num: "04",
      title: "Audit & Penguncian EAS Sepolia",
      desc: "Auditor independen meninjau seluruh data bukti. Tombol persetujuan mengunci segel digital SHA-256 ke Ethereum Attestation Service.",
      detail: "Menghasilkan nomor catatan publik yang dapat diperiksa oleh siapa pun di seluruh dunia.",
      actionLabel: "Cek Explorer Blockchain",
    },
    {
      num: "05",
      title: "Simulasi Pasar & Bagi Hasil",
      desc: "Unit terverifikasi masuk ke pasar simulasi. Pendapatan otomatis dibagi: 60% untuk kas warga desa adat dan 40% untuk pengelola hutan.",
      detail: "Jika ada sensor api menyala, unit karbon seketika dibekukan otomatis dari transaksi pasar.",
      actionLabel: "Buka Simulasi Pasar",
    },
  ];

  return (
    <section id="proses" className="py-20 sm:py-28 border-t border-[#1B211A]">
      <div className="page-shell">
        
        {/* Intro Section: Two Columns (Section 4.7) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end mb-14 sm:mb-18 pb-10 border-b border-[#1B211A]">
          <div>
            <span className="text-[0.75rem] font-semibold text-[#AEDA2D] uppercase tracking-wider block mb-2">
              Alur Verifikasi Terbuka
            </span>
            <h2 className="text-[clamp(2.1rem,3.5vw,3.2rem)] font-normal text-[#F0F2EC] leading-[1.15] tracking-tight">
              Dari getaran pohon hingga{" "}
              <span className="text-[#AEDA2D]">segel digital</span> di internet.
            </h2>
          </div>
          <div>
            <p className="text-[0.95rem] text-[#A8AFA2] leading-relaxed">
              Lima langkah transparan yang memastikan integritas karbon hutan dapat dibuktikan
              oleh siapa pun tanpa harus mempercayai satu pihak saja.
            </p>
          </div>
        </div>

        {/* Process List: Numbered Horizontal Rows (Section 4.7) */}
        <div className="divide-y divide-[#1B211A]">
          {steps.map((s, index) => {
            const isActive = activeStep === index;

            return (
              <div
                key={s.num}
                onClick={() => setActiveStep(index)}
                className={`py-6 sm:py-8 transition-colors cursor-pointer group ${
                  isActive ? "bg-[#101610]/40 -mx-4 px-4 sm:-mx-6 sm:px-6 rounded-panel" : "hover:bg-[#101610]/20"
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline">
                  {/* Small Number on Left (2 cols) */}
                  <div className="md:col-span-2 font-mono text-[0.85rem] text-[#747D70] group-hover:text-[#AEDA2D] transition-colors flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#AEDA2D]" : "bg-transparent"}`} />
                    <span>{s.num}</span>
                  </div>

                  {/* Large Stage Name in Middle (5 cols) */}
                  <div className="md:col-span-5">
                    <h3
                      className={`text-[1.25rem] sm:text-[1.4rem] font-medium tracking-tight transition-colors ${
                        isActive ? "text-[#AEDA2D]" : "text-[#F0F2EC] group-hover:text-white"
                      }`}
                    >
                      {s.title}
                    </h3>
                  </div>

                  {/* Description on Right (5 cols) */}
                  <div className="md:col-span-5 text-[0.875rem] text-[#A8AFA2] leading-relaxed">
                    <p>{s.desc}</p>

                    {/* Active Row Expanded Content (Section 4.7) */}
                    {isActive && (
                      <div className="mt-4 pt-3 border-t border-[#252D22] text-[0.8rem] text-[#747D70] space-y-2">
                        <div className="flex items-center gap-2 text-[#A8AFA2]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#AEDA2D] flex-shrink-0" />
                          <span>{s.detail}</span>
                        </div>
                        <span className="inline-flex items-center gap-1.5 font-medium text-[#AEDA2D] hover:underline pt-1">
                          {s.actionLabel} &rarr;
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

