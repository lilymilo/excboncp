"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function ProcessJourneySection() {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      num: "01",
      title: "Telemetri Fisik & Satelit",
      desc: "Sensor di pohon mengukur suhu, kelembapan, dan nyala api tiap 5 detik. Citra satelit Sentinel mengukur kerapatan biomassa secara berkala.",
      detail: "Proses otomasi dMRV (digital Measurement, Reporting, Verification) berjalan tanpa intervensi manusia.",
      actionLabel: "Buka Peta & Telemetri",
      actionHref: "/peta",
    },
    {
      num: "02",
      title: "Persetujuan Warga Adat",
      desc: "Komunitas memeriksa peta petak dan memberikan persetujuan tertulis. Tanpa persetujuan ini, sistem menolak penguncian lahan.",
      detail: "Status lahan otomatis BLOCKED jika izin belum ada, atau DISPUTE jika sengketa dibuka.",
      actionLabel: "Lihat Izin Warga",
      actionHref: "/login?role=community",
    },
    {
      num: "03",
      title: "Kalkulasi Status & AI Explainer",
      desc: "Fungsi aturan deterministik menentukan kelayakan status (VERIFIED/WARNING/DISPUTE). AI merangkum alasan penjelasan dalam bahasa manusia.",
      detail: "Kode yang memutuskan status dan angka; AI hanya bertugas menjelaskan alasan kepada pengguna.",
      actionLabel: "Lihat Indikator Sistem",
      actionHref: "/indikator",
    },
    {
      num: "04",
      title: "Audit & Penguncian EAS Sepolia",
      desc: "Auditor independen meninjau seluruh data bukti. Tombol persetujuan mengunci segel digital SHA-256 ke Ethereum Attestation Service.",
      detail: "Menghasilkan nomor catatan publik yang dapat diperiksa oleh siapa pun di seluruh dunia.",
      actionLabel: "Cek Portal Auditor",
      actionHref: "/tinjau",
    },
    {
      num: "05",
      title: "Simulasi Pasar & Bagi Hasil",
      desc: "Unit terverifikasi masuk ke pasar simulasi. Pendapatan otomatis dibagi: 60% untuk kas warga desa adat dan 40% untuk pengelola hutan.",
      detail: "Jika ada sensor api menyala, unit karbon seketika dibekukan otomatis dari transaksi pasar.",
      actionLabel: "Buka Screener Pasar",
      actionHref: "/screener",
    },
  ];

  return (
    <section id="proses" className="py-16 sm:py-24 border-t border-[var(--line-subtle)]">
      <div className="page-shell">
        {/* Intro Section: Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end mb-12 sm:mb-16 pb-8 border-b border-[var(--line-subtle)]">
          <div>
            <span className="xb-eyebrow block mb-2">
              Alur Verifikasi Terbuka
            </span>
            <h2 className="xb-display text-[clamp(2.1rem,3.5vw,3.2rem)] font-bold text-[var(--ink)] leading-[1.15] tracking-tight">
              Dari getaran pohon hingga{" "}
              <span className="text-[var(--forest-800)]">segel digital</span> di internet.
            </h2>
          </div>
          <div>
            <p className="text-[1rem] text-[var(--ink-muted)] leading-relaxed">
              Lima langkah transparan yang memastikan integritas karbon hutan dapat dibuktikan
              oleh siapa pun tanpa harus mempercayai satu pihak saja.
            </p>
          </div>
        </div>

        {/* Process List: Numbered Botanical Rows */}
        <div className="flex flex-col gap-3">
          {steps.map((s, index) => {
            const isActive = activeStep === index;

            return (
              <div
                key={s.num}
                onClick={() => setActiveStep(index)}
                className={`transition-all cursor-pointer rounded-[18px] p-5 sm:p-6 ${
                  isActive
                    ? "bg-white border border-[var(--line-strong)] shadow-card"
                    : "bg-[var(--surface-soft)] border border-[var(--line-subtle)] hover:bg-white hover:border-[var(--line)]"
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline">
                  {/* Small Number on Left */}
                  <div className="md:col-span-2 flex items-center gap-2.5">
                    <span
                      className={`xb-numeric inline-flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-bold ${
                        isActive
                          ? "bg-[var(--forest-800)] text-white"
                          : "bg-[var(--leaf-100)] text-[var(--forest-800)]"
                      }`}
                    >
                      {s.num}
                    </span>
                    <span className="text-[12.5px] font-semibold text-[var(--ink-dim)] uppercase tracking-wider">
                      Tahap {s.num}
                    </span>
                  </div>

                  {/* Stage Name in Middle */}
                  <div className="md:col-span-5">
                    <h3
                      className={`xb-display text-[1.25rem] sm:text-[1.35rem] font-bold tracking-tight transition-colors ${
                        isActive ? "text-[var(--forest-800)]" : "text-[var(--ink)]"
                      }`}
                    >
                      {s.title}
                    </h3>
                  </div>

                  {/* Description on Right */}
                  <div className="md:col-span-5 text-[13.5px] text-[var(--ink-muted)] leading-relaxed">
                    <p>{s.desc}</p>

                    {/* Active Row Expanded Content */}
                    {isActive && (
                      <div className="mt-4 pt-3 border-t border-[var(--line-subtle)] space-y-2">
                        <div className="flex items-center gap-2 text-[var(--ink)] font-medium">
                          <CheckCircle2 className="w-4 h-4 text-[var(--forest-700)] flex-shrink-0" />
                          <span>{s.detail}</span>
                        </div>
                        <div>
                          <Link
                            href={s.actionHref}
                            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--forest-800)] hover:underline pt-1"
                          >
                            <span>{s.actionLabel}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
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
