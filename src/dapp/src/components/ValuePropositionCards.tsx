"use client";

import React from "react";

export function ValuePropositionCards() {
  return (
    <section className="py-16 sm:py-24 border-t border-[var(--line-subtle)]">
      <div className="page-shell">
        {/* Centered Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="xb-eyebrow block mb-2">
            Nilai &amp; Manfaat Sistem
          </span>
          <h2 className="xb-display text-[clamp(2.1rem,3.5vw,3.2rem)] font-bold text-[var(--ink)] leading-[1.18] tracking-tight">
            Transparansi untuk komunitas,{" "}
            <br className="hidden sm:inline" />
            <span className="text-[var(--forest-800)]">kepastian data</span> untuk pasar.
          </h2>
          <p className="mt-4 text-[1rem] text-[var(--ink-muted)]">
            Tiga keunggulan terukur yang dibuktikan secara langsung oleh arsitektur ExcbonCP.
          </p>
        </div>

        {/* Three Cards Grid (1 Featured Deep Forest Card + 2 Botanical Surface Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 items-stretch">
          {/* Card 1: Featured Deep Forest Card */}
          <div className="rounded-[20px] bg-[var(--surface-deep)] p-7 text-[var(--on-deep)] border border-[var(--deep-line)] shadow-md flex flex-col justify-between">
            <div>
              <span className="text-[11.5px] font-semibold uppercase tracking-wider text-[var(--leaf-300)] block mb-3">
                Kedaulatan Warga &bull; 60% Bagi Hasil
              </span>
              <h3 className="xb-display text-[1.35rem] font-bold text-white leading-snug tracking-tight">
                Hak veto mutlak bagi masyarakat adat.
              </h3>
              <p className="mt-3 text-[13.5px] text-[var(--on-deep-muted)] leading-relaxed">
                Tanpa persetujuan tertulis dari warga yang merawat hutan, sistem menolak penerbitan
                unit karbon. Bagian hasil terbesar (60%) langsung tercatat ke kas komunitas desa.
              </p>
            </div>

            {/* Simple Bar Chart Illustration */}
            <div className="mt-8 pt-5 border-t border-[var(--deep-line)]">
              <div className="flex items-end justify-between h-20 gap-2 px-2">
                <div className="w-1/4 flex flex-col items-center gap-1">
                  <div className="w-full bg-white/20 rounded-t" style={{ height: "35%" }} />
                  <span className="text-[11px] font-mono text-[var(--on-deep-muted)]">Awal</span>
                </div>
                <div className="w-1/4 flex flex-col items-center gap-1">
                  <div className="w-full bg-white/40 rounded-t" style={{ height: "55%" }} />
                  <span className="text-[11px] font-mono text-[var(--on-deep-muted)]">Kelola</span>
                </div>
                <div className="w-1/4 flex flex-col items-center gap-1">
                  <div className="w-full bg-[var(--leaf-300)] rounded-t" style={{ height: "90%" }} />
                  <span className="text-[11px] font-mono font-bold text-[var(--leaf-300)]">Adat 60%</span>
                </div>
                <div className="w-1/4 flex flex-col items-center gap-1">
                  <div className="w-full bg-white/60 rounded-t" style={{ height: "65%" }} />
                  <span className="text-[11px] font-mono text-[var(--on-deep-muted)]">Mitra 40%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Speed & Determinism Card */}
          <div className="xb-card p-7 flex flex-col justify-between">
            <div>
              <span className="text-[11.5px] font-semibold uppercase tracking-wider text-[var(--ink-dim)] block mb-3">
                Kecepatan Data &bull; Detik ke Status
              </span>
              <h3 className="xb-display text-[1.35rem] font-bold text-[var(--ink)] leading-snug tracking-tight">
                Dari getaran sensor ke status terbuka.
              </h3>
              <p className="mt-3 text-[13.5px] text-[var(--ink-muted)] leading-relaxed">
                Menghilangkan proses audit manual 12-18 bulan. Sensor mengirim data tiap 5 detik
                dan satelit memperbarui kerapatan daun otomatis via Google Earth Engine.
              </p>
            </div>

            {/* Line Chart Illustration */}
            <div className="mt-8 pt-5 border-t border-[var(--line-subtle)]">
              <div className="h-20 w-full relative">
                <svg viewBox="0 0 240 70" className="w-full h-full overflow-visible">
                  <line x1="0" y1="15" x2="240" y2="15" stroke="var(--line-subtle)" strokeWidth="1" />
                  <line x1="0" y1="45" x2="240" y2="45" stroke="var(--line-subtle)" strokeWidth="1" />
                  <path
                    d="M 0,55 L 40,48 L 80,50 L 120,32 L 160,28 L 200,18 L 240,12"
                    fill="none"
                    stroke="var(--forest-700)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="240" cy="12" r="4" fill="var(--forest-800)" />
                </svg>
              </div>
              <div className="flex items-center justify-between text-[11.5px] text-[var(--ink-muted)] font-mono mt-1">
                <span>0.1 Detik Ingest</span>
                <span className="font-bold text-[var(--forest-800)]">Status Deterministik</span>
              </div>
            </div>
          </div>

          {/* Card 3: Cryptographic Permanence Card */}
          <div className="xb-card p-7 flex flex-col justify-between">
            <div>
              <span className="text-[11.5px] font-semibold uppercase tracking-wider text-[var(--ink-dim)] block mb-3">
                Integritas Segel &bull; Kriptografi Publik
              </span>
              <h3 className="xb-display text-[1.35rem] font-bold text-[var(--ink)] leading-snug tracking-tight">
                Buku catatan berantai dan EAS Sepolia.
              </h3>
              <p className="mt-3 text-[13.5px] text-[var(--ink-muted)] leading-relaxed">
                Setiap persetujuan auditor disegel dengan rumus SHA-256 dan dicatat ke Ethereum Attestation
                Service. Tidak ada otoritas tunggal yang dapat menghapus jejak audit.
              </p>
            </div>

            {/* Donut Chart Illustration */}
            <div className="mt-8 pt-5 border-t border-[var(--line-subtle)] flex items-center justify-around">
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="var(--line)" strokeWidth="4" />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="var(--forest-700)"
                    strokeWidth="4"
                    strokeDasharray="66 100"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="var(--leaf-300)"
                    strokeWidth="4"
                    strokeDasharray="22 100"
                    strokeDashoffset="-68"
                  />
                </svg>
              </div>
              <div className="text-[12.5px] space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--forest-700)]" />
                  <span className="font-semibold text-[var(--ink)]">Unit Sah: 600 tCO2e</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--leaf-300)]" />
                  <span className="text-[var(--ink-muted)]">Buffer Aman: 100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
