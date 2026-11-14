"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, LayoutDashboard, LogIn } from "lucide-react";

export function ClosingCtaPanel() {
  return (
    <section className="py-16 sm:py-24">
      <div className="page-shell">
        {/* Wide Centered Panel in Deep Forest Green */}
        <div className="relative rounded-[24px] bg-[var(--surface-deep)] text-[var(--on-deep)] border border-[var(--deep-line)] p-8 sm:p-14 text-center overflow-hidden shadow-lg">
          {/* Subtle Ambient Leaf Vignette Gradients */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[var(--leaf-300)]/15 to-transparent pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[var(--leaf-300)]/15 to-transparent pointer-events-none"
          />

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <span className="text-[12px] font-semibold text-[var(--leaf-300)] uppercase tracking-wider block mb-3">
              Mulai Uji Coba Sekarang
            </span>
            <h2 className="xb-display text-[clamp(2.1rem,3.8vw,3.5rem)] font-bold text-white leading-[1.14] tracking-tight text-balance">
              Buktikan integritas karbon hutan,{" "}
              <span className="text-[var(--leaf-300)]">langsung di browser</span> kamu.
            </h2>
            <p className="mt-5 text-[1rem] text-[var(--on-deep-muted)] leading-relaxed max-w-[52ch]">
              Tanpa unduh aplikasi dan tanpa uang sungguhan. Masuk dengan empat akun contoh
              untuk memeriksa seluruh alur dari sensor hingga segel digital di Base Sepolia.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
              <Link
                href="/app"
                className="w-full sm:w-auto min-h-[46px] px-8 py-3.5 rounded-full bg-white text-[var(--forest-900)] hover:bg-[var(--leaf-100)] text-[14.5px] font-bold shadow-md hover:shadow-lg transition-all active:scale-95 inline-flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-[var(--forest-800)]" aria-hidden="true" />
                <span>Buka Dasbor Pemantauan</span>
                <ArrowRight className="w-4 h-4 text-[var(--forest-800)]" aria-hidden="true" />
              </Link>

              <Link
                href="/login"
                className="w-full sm:w-auto min-h-[46px] px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[14.5px] font-semibold shadow-xs transition-all active:scale-95 inline-flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" aria-hidden="true" />
                <span>Masuk Akun Demo</span>
              </Link>
            </div>

            {/* Cryptographic Footnote */}
            <div className="mt-7 flex items-center justify-center gap-2 text-[12px] text-[var(--on-deep-muted)]">
              <ShieldCheck className="w-4 h-4 text-[var(--leaf-300)]" aria-hidden="true" />
              <span>Tersegel Kriptografis Base Sepolia EAS &bull; SHA-256 Hash Chain</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
