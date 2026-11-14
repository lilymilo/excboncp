"use client";

import React from "react";
import Link from "next/link";
import {
  Satellite,
  Radio,
  Users,
  ShieldCheck,
  Cpu,
  ArrowUpRight,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { PulseDot } from "@/components/motion";

export function DashboardPreviewStrip() {
  return (
    <section id="ringkasan" className="py-12 sm:py-16">
      <div className="page-shell">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="xb-eyebrow block mb-1">Telemetri &amp; Bukti Terkini</span>
            <h2 className="xb-display text-[clamp(1.75rem,2.8vw,2.4rem)] font-bold text-[var(--ink)]">
              Pemantauan Lapangan Tanpa Celah
            </h2>
          </div>
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--forest-800)] hover:text-[var(--forest-900)] group"
          >
            <span>Buka Dasbor Interaktif Lengkap</span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Botanical Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Card 1: Sentinel-2 Satellite */}
          <div className="xb-card flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-soft)] border border-[var(--line)] px-3 py-1 text-[12px] font-semibold text-[var(--forest-800)]">
                  <Satellite className="h-3.5 w-3.5 text-[var(--forest-700)]" />
                  <span>Sentinel-2 ESA</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--status-verified-ink)]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Spektral Valid</span>
                </span>
              </div>
              <h3 className="xb-display text-[19px] font-bold text-[var(--ink)]">
                Indeks NDVI &amp; Serapan Biomassa
              </h3>
              <p className="mt-2 text-[13.5px] text-[var(--ink-muted)] leading-relaxed">
                600 tCO2e terverifikasi dari data spektral satelit dengan kenaikan +4.2% tutupan hijau kanopi.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--line-subtle)] flex items-center justify-between text-[13px]">
              <span className="text-[var(--ink-muted)]">Skor NDVI</span>
              <span className="xb-numeric font-bold text-[var(--forest-800)] text-[16px]">
                0.81 <span className="text-[12px] font-normal text-[var(--ink-muted)]">/ 1.00</span>
              </span>
            </div>
          </div>

          {/* Card 2: IoT Canopy Node */}
          <div className="xb-card flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-soft)] border border-[var(--line)] px-3 py-1 text-[12px] font-semibold text-[var(--forest-800)]">
                  <Radio className="h-3.5 w-3.5 text-[var(--forest-700)]" />
                  <span>Node ESP32-01</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--forest-700)]">
                  <PulseDot className="text-[var(--forest-700)]" pulsing label="Aktif" />
                  <span>Online</span>
                </span>
              </div>
              <h3 className="xb-display text-[19px] font-bold text-[var(--ink)]">
                Telemetri IoT Kanopi Lapangan
              </h3>
              <p className="mt-2 text-[13.5px] text-[var(--ink-muted)] leading-relaxed">
                Suhu kanopi 31.4°C stabil, sensor api KY-026 aman, dan kelembapan kapasitif tanah 57%.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--line-subtle)] grid grid-cols-3 gap-2 text-center text-[12.5px]">
              <div className="rounded-lg bg-[var(--surface-soft)] p-1.5">
                <span className="block text-[var(--ink-muted)] text-[11px]">Suhu</span>
                <span className="xb-numeric font-bold text-[var(--ink)]">31.4°C</span>
              </div>
              <div className="rounded-lg bg-[var(--surface-soft)] p-1.5">
                <span className="block text-[var(--ink-muted)] text-[11px]">Api</span>
                <span className="font-bold text-[var(--status-verified-ink)]">Aman</span>
              </div>
              <div className="rounded-lg bg-[var(--surface-soft)] p-1.5">
                <span className="block text-[var(--ink-muted)] text-[11px]">Tanah</span>
                <span className="xb-numeric font-bold text-[var(--ink)]">57%</span>
              </div>
            </div>
          </div>

          {/* Card 3: Indigenous Community FPIC (Deep Panel for visual anchor) */}
          <div className="rounded-[20px] bg-[var(--surface-deep)] text-[var(--on-deep)] border border-[var(--deep-line)] shadow-md flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold text-[var(--on-deep)]">
                  <Users className="h-3.5 w-3.5 text-[var(--leaf-300)]" />
                  <span>Mahakam Ulu • Petak #01</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--leaf-300)]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>FPIC 100% Sah</span>
                </span>
              </div>
              <h3 className="xb-display text-[19px] font-bold text-white">
                Konsensus Masyarakat Adat
              </h3>
              <p className="mt-2 text-[13.5px] text-[var(--on-deep-muted)] leading-relaxed">
                Persetujuan warga 600 Ha sah dan terkunci. 60% pembagian hasil dialirkan langsung ke kas komunitas adat.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--deep-line)] flex items-center justify-between text-[13px]">
              <span className="text-[var(--on-deep-muted)]">Porsi Komunitas</span>
              <span className="xb-numeric font-bold text-[var(--leaf-300)] text-[16px]">
                60% <span className="text-[12px] font-normal text-[var(--on-deep-muted)]">Kas Adat</span>
              </span>
            </div>
          </div>

          {/* Card 4: Deterministic Pipeline */}
          <div className="xb-card flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-soft)] border border-[var(--line)] px-3 py-1 text-[12px] font-semibold text-[var(--forest-800)]">
                  <Cpu className="h-3.5 w-3.5 text-[var(--forest-700)]" />
                  <span>Aturan R5</span>
                </span>
                <span className="text-[12px] font-semibold text-[var(--seal-600)]">
                  Deterministik
                </span>
              </div>
              <h3 className="xb-display text-[19px] font-bold text-[var(--ink)]">
                Pipa Otomasi MRV Tanpa Celah
              </h3>
              <p className="mt-2 text-[13.5px] text-[var(--ink-muted)] leading-relaxed">
                Alur kode otomatis: validasi telemetri, kalkulasi CO2e, hingga verifikasi silang tanpa intervensi manual.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--line-subtle)] flex items-center justify-between text-[13px]">
              <span className="text-[var(--ink-muted)]">Intervensi Manual</span>
              <span className="font-bold text-[var(--status-verified-ink)]">0% (Otomatis)</span>
            </div>
          </div>

          {/* Card 5: SHA-256 Cryptographic Seal */}
          <div className="xb-card flex flex-col justify-between p-6 lg:col-span-2">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-soft)] border border-[var(--line)] px-3 py-1 text-[12px] font-semibold text-[var(--seal-600)]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[var(--seal-600)]" />
                  <span>Segel Kriptografi R9</span>
                </span>
                <span className="text-[12px] font-semibold text-[var(--seal-600)]">
                  Base Sepolia EAS
                </span>
              </div>
              <h3 className="xb-display text-[19px] font-bold text-[var(--ink)]">
                Buku Catatan SHA-256 &amp; Bukti On-Chain
              </h3>
              <p className="mt-2 text-[13.5px] text-[var(--ink-muted)] leading-relaxed">
                Setiap laporan diverifikasi dan disegel ke dalam rantai hash permanen. Data terbuka untuk diaudit oleh siapa saja dan kebal terhadap pemalsuan catatan.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--line-subtle)] flex flex-wrap items-center justify-between gap-3 text-[13px]">
              <div className="flex items-center gap-2">
                <span className="xb-mono text-[12px] text-[var(--ink-muted)] bg-[var(--surface-soft)] px-2.5 py-1 rounded border border-[var(--line)]">
                  0x7f83b165...e2d53
                </span>
                <span className="text-[12px] font-semibold text-[var(--status-verified-ink)]">
                  Tersegel Kriptografis
                </span>
              </div>
              <Link
                href="/verifikasi"
                className="text-[13px] font-semibold text-[var(--forest-800)] hover:underline inline-flex items-center gap-1"
              >
                <span>Periksa Pembuktian</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
