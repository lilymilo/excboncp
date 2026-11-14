"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Sparkles, ShieldCheck, Sprout } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-16 pb-14 sm:pt-24 sm:pb-20 overflow-hidden">
      {/* Background Soft Botanical Ambient Glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[850px] h-[350px] sm:h-[450px] bg-[radial-gradient(ellipse_at_center,rgba(143,203,151,0.25)_0%,rgba(238,245,236,0)_70%)] blur-[90px] pointer-events-none -z-10"
      />

      <div className="page-shell flex flex-col items-center text-center">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[var(--line)] text-[12.5px] font-semibold text-[var(--forest-800)] mb-6 shadow-xs">
          <Sprout className="w-3.5 h-3.5 text-[var(--forest-700)]" aria-hidden="true" />
          <span>Sistem Pemantauan Hutan &amp; Verifikasi Terbuka</span>
        </div>

        {/* Two-Tone Botanical Headline */}
        <h1 className="xb-display text-[clamp(2.4rem,4.8vw,4.4rem)] font-bold tracking-tight text-[var(--ink)] max-w-4xl leading-[1.12] text-balance">
          Membangun bukti{" "}
          <span className="text-[var(--forest-800)] underline decoration-[var(--leaf-300)] decoration-wavy decoration-2 underline-offset-4">
            kondisi hutan
          </span>
          ,<br className="hidden sm:inline" /> sebelum menghitung nilai.
        </h1>

        {/* Supporting Copy */}
        <p className="mt-5 text-[1rem] sm:text-[1.1rem] text-[var(--ink-muted)] max-w-[58ch] leading-relaxed">
          ExcbonCP menyatukan citra satelit, sensor di pepohonan, dan izin warga adat
          ke dalam buku catatan terbuka yang tersegel secara digital di Base Sepolia tanpa perantara.
        </p>

        {/* Dual CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          {/* Primary CTA */}
          <Link
            href="/app"
            className="w-full sm:w-auto min-h-[46px] px-7 py-3 rounded-full bg-[var(--forest-800)] text-white hover:bg-[var(--forest-900)] text-[14.5px] font-semibold shadow-xs hover:shadow-md transition-all active:scale-95 inline-flex items-center justify-center gap-2"
          >
            <span>Buka Dasbor Pemantauan</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>

          {/* Secondary CTA */}
          <Link
            href="/peta"
            className="w-full sm:w-auto min-h-[46px] px-6 py-3 rounded-full bg-white text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--surface-soft)] text-[14.5px] font-semibold shadow-xs transition-all active:scale-95 inline-flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4 text-[var(--forest-700)]" aria-hidden="true" />
            <span>Peta Lahan &amp; Telemetri</span>
          </Link>
        </div>

        {/* Blueprint Navigation Strip */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs">
          <Link
            href="/app"
            className="px-3.5 py-1.5 rounded-full bg-white border border-[var(--line)] text-[var(--ink)] hover:border-[var(--forest-700)] hover:text-[var(--forest-800)] transition-colors font-medium shadow-xs"
          >
            Dasbor Utama (/app)
          </Link>
          <Link
            href="/screener"
            className="px-3.5 py-1.5 rounded-full bg-white border border-[var(--line)] text-[var(--ink-muted)] hover:border-[var(--forest-700)] hover:text-[var(--forest-800)] transition-colors font-medium shadow-xs"
          >
            Screener Karbon (/screener)
          </Link>
          <Link
            href="/peta"
            className="px-3.5 py-1.5 rounded-full bg-white border border-[var(--line)] text-[var(--ink-muted)] hover:border-[var(--forest-700)] hover:text-[var(--forest-800)] transition-colors font-medium shadow-xs"
          >
            Peta Petak Hutan (/peta)
          </Link>
          <Link
            href="/tinjau"
            className="px-3.5 py-1.5 rounded-full bg-white border border-[var(--line)] text-[var(--ink-muted)] hover:border-[var(--forest-700)] hover:text-[var(--forest-800)] transition-colors font-medium shadow-xs"
          >
            Portal Auditor (/tinjau)
          </Link>
          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-full bg-white border border-[var(--line)] text-[var(--ink-muted)] hover:border-[var(--forest-700)] hover:text-[var(--forest-800)] transition-colors font-medium shadow-xs"
          >
            Halaman Masuk (/login)
          </Link>
        </div>
      </div>
    </section>
  );
}
