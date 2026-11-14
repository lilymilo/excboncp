"use client";

import Link from "next/link";
import {
  Users,
  Trees,
  Factory,
  ClipboardCheck,
  ArrowRight,
  LogIn,
  UserPlus,
} from "lucide-react";

export function GetStartedSection() {
  const roles = [
    {
      id: "community",
      title: "Masyarakat Adat",
      desc: "Melihat laporan lahan sendiri, memberikan atau mencabut izin musyawarah adat, dan mengecek bagian kas 60%.",
      icon: Users,
      badge: "Hak Veto 60%",
    },
    {
      id: "manager",
      title: "Pengelola Hutan",
      desc: "Memantau kondisi sensor pohon, status radar satelit, dan unit yang siap dialokasikan ke pasar.",
      icon: Trees,
      badge: "Monitoring Lapangan",
    },
    {
      id: "recipient",
      title: "Kawasan Industri (KEK)",
      desc: "Melihat laporan pemakaian unit karbon untuk kawasan industri hijau tanpa klaim ganda atau fiktif.",
      icon: Factory,
      badge: "Klaim Emisi Bersih",
    },
    {
      id: "auditor",
      title: "Auditor Independen",
      desc: "Meninjau seluruh bukti fisik multi-lapis sebelum menyetujui penguncian segel digital permanen di Base Sepolia EAS.",
      icon: ClipboardCheck,
      badge: "Penyetuju EAS",
    },
  ];

  return (
    <section id="demo" className="py-16 sm:py-24 border-t border-[var(--line-subtle)]">
      <div className="page-shell">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="xb-eyebrow block mb-2">
            Akses Eksplorasi 4 Peran
          </span>
          <h2 className="xb-display text-[clamp(2.1rem,3.5vw,3.2rem)] font-bold text-[var(--ink)] leading-[1.18] tracking-tight">
            Coba langsung lewat{" "}
            <span className="text-[var(--forest-800)]">browser kamu</span>.
          </h2>
          <p className="mt-4 text-[1rem] text-[var(--ink-muted)] leading-relaxed">
            Tidak perlu unduh aplikasi dan tidak perlu akun berbayar. Pilih
            salah satu peran contoh untuk masuk otomatis ke halaman Login, atau
            buat akun baru di halaman Register.
          </p>

          {/* Direct Links to Dedicated /login and /register Pages */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex min-h-[42px] items-center gap-2 px-5 py-2.5 rounded-full text-[13.5px] font-semibold bg-[var(--forest-800)] text-white hover:bg-[var(--forest-900)] shadow-xs transition-transform active:scale-95"
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              <span>Halaman Masuk (Akun Seed)</span>
            </Link>
            <Link
              href="/register"
              className="inline-flex min-h-[42px] items-center gap-2 px-5 py-2.5 rounded-full text-[13.5px] font-semibold bg-white text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--surface-soft)] shadow-xs transition-transform active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-[var(--forest-700)]" aria-hidden="true" />
              <span>Halaman Register</span>
            </Link>
          </div>
        </div>

        {/* 4 Roles Grid linking directly to /login?role=... */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <Link
                key={r.title}
                href={`/login?role=${r.id}`}
                className="xb-card p-6 sm:p-7 flex flex-col justify-between hover:border-[var(--line-strong)] hover:shadow-hover transition-all group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-[14px] bg-[var(--surface-soft)] border border-[var(--line)] flex items-center justify-center text-[var(--forest-700)] group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[var(--leaf-100)] text-[11px] font-semibold text-[var(--forest-800)]">
                      {r.badge}
                    </span>
                  </div>

                  <h3 className="xb-display text-[1.15rem] font-bold text-[var(--ink)] tracking-tight group-hover:text-[var(--forest-800)] transition-colors">
                    {r.title}
                  </h3>
                  <p className="mt-2.5 text-[13px] text-[var(--ink-muted)] leading-relaxed">
                    {r.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--line-subtle)] flex items-center justify-between text-[13px] font-semibold text-[var(--forest-800)] group-hover:text-[var(--forest-900)] transition-colors">
                  <span>Masuk Akun Demo</span>
                  <ArrowRight
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
