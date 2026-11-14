"use client";

import Link from "next/link";
import { Mascot } from "@/components/mascot/Mascot";

export function Footer() {
  return (
    <footer className="mt-auto py-14 border-t border-[var(--line)] bg-white text-[var(--ink-muted)] text-[13px]">
      <div className="page-shell flex flex-col gap-10">
        {/* Four-Column Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Column 1: Brand Mark & Summary */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] p-0.5">
                <Mascot variant="avatar" size={30} alt="Maskot ExcbonCP" />
              </div>
              <span className="xb-display text-[16px] font-bold tracking-tight text-[var(--ink)]">
                excboncp
              </span>
            </div>
            <p className="text-[13px] text-[var(--ink-muted)] leading-relaxed">
              Sistem pemantauan hutan dMRV dan simulasi pasar kredit karbon terbuka di jaringan testnet Base Sepolia.
            </p>
            <div className="flex items-center gap-3 pt-1 text-[12.5px] font-semibold text-[var(--forest-800)]">
              <Link href="https://github.com" className="hover:underline">
                GitHub Repo
              </Link>
              <span>&bull;</span>
              <Link href="/verifikasi" className="hover:underline">
                Base Sepolia EAS
              </Link>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-3">
            <span className="text-[12px] font-semibold text-[var(--ink)] uppercase tracking-wider block">
              Navigasi Halaman
            </span>
            <ul className="space-y-2 text-[13px] text-[var(--ink-muted)]">
              <li>
                <Link href="/app" className="hover:text-[var(--forest-800)] transition-colors">
                  Dasbor Utama (/app)
                </Link>
              </li>
              <li>
                <Link href="/peta" className="hover:text-[var(--forest-800)] transition-colors">
                  Peta Petak Hutan (/peta)
                </Link>
              </li>
              <li>
                <Link href="/screener" className="hover:text-[var(--forest-800)] transition-colors">
                  Screener Karbon (/screener)
                </Link>
              </li>
              <li>
                <Link href="/tinjau" className="hover:text-[var(--forest-800)] transition-colors">
                  Portal Auditor (/tinjau)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Features & Services */}
          <div className="space-y-3">
            <span className="text-[12px] font-semibold text-[var(--ink)] uppercase tracking-wider block">
              Komponen Sistem
            </span>
            <ul className="space-y-2 text-[13px] text-[var(--ink-muted)]">
              <li>
                <Link href="#fitur" className="hover:text-[var(--forest-800)] transition-colors">
                  Sentinel-1 &amp; Sentinel-2 (GEE)
                </Link>
              </li>
              <li>
                <Link href="#fitur" className="hover:text-[var(--forest-800)] transition-colors">
                  Sensor Lapangan ESP32 (IoT)
                </Link>
              </li>
              <li>
                <Link href="#verifikasi" className="hover:text-[var(--forest-800)] transition-colors">
                  Buku Catatan SHA-256
                </Link>
              </li>
              <li>
                <Link href="/verifikasi" className="hover:text-[var(--forest-800)] transition-colors">
                  EAS Schema Registry
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Info */}
          <div className="space-y-3">
            <span className="text-[12px] font-semibold text-[var(--ink)] uppercase tracking-wider block">
              Informasi &amp; Lokasi
            </span>
            <p className="text-[13px] text-[var(--ink-muted)] leading-relaxed">
              Arsitektur terpadu pembuktian kelayakan dMRV hutan tropis berbasis data fisik lapangan dan satelit.
            </p>
            <div className="text-[12px] text-[var(--ink-dim)]">
              Lokasi Percontohan: Mahakam Ulu, Kalimantan Timur
            </div>
          </div>
        </div>

        {/* Legal & Compliance Notice Row */}
        <div className="pt-6 border-t border-[var(--line-subtle)] space-y-4">
          <div className="p-4 rounded-[14px] bg-[var(--surface-soft)] border border-[var(--line)] text-[12px] text-[var(--ink-muted)] leading-relaxed">
            <strong className="text-[var(--ink)]">Catatan Kepatuhan Sandbox:</strong> Seluruh transaksi, angka rupiah, dan penerbitan unit di ExcbonCP bersifat simulasi di jaringan uji coba (testnet). Proyek ini ditujukan untuk riset pembuktian integritas data lingkungan dan belum memiliki afiliasi komersial.
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] text-[var(--ink-dim)]">
            <span>&copy; {new Date().getFullYear()} ExcbonCP &bull; Soft Botanical Design System.</span>
            <div className="flex items-center gap-3">
              <span className="hover:text-[var(--ink)]">Aturan Status R5</span>
              <span>&bull;</span>
              <span className="hover:text-[var(--ink)]">Formula Settle R7</span>
              <span>&bull;</span>
              <span className="hover:text-[var(--ink)]">Audit EAS R9</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
