"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Compass,
  FlaskConical,
  HelpCircle,
  Map as MapIcon,
  ShieldCheck,
  Users,
} from "lucide-react";
import { BotanicalAppShell } from "@/components/dapp/BotanicalAppShell";
import {
  BotanicalCard,
  BotanicalPageHeader,
  CanonicalStatusBadge,
  SimulasiBadge,
} from "@/components/dapp/BotanicalPrimitives";
import { Mascot } from "@/components/mascot/Mascot";
import { APP_SIMULATION_NOTE, ROLE_TITLES, STATUS_DISPLAY } from "@/lib/copy";
import type { CanonicalStatus } from "@/lib/dashboard-helpers";
import type { UserRole } from "@/context/DappContext";

const GUIDED_STEPS = [
  {
    step: "1. Pantau kondisi lahan & izin",
    detail:
      "Buka halaman Peta atau Screener untuk melihat batas kawasan kehutanan, suhu sensor lapangan, kerapatan tajuk satelit (NDVI), dan status izin warga.",
    href: "/peta",
    cta: "Buka Peta Lahan",
  },
  {
    step: "2. Tinjau bukti & segel rantai",
    detail:
      "Perwakilan komunitas mengelola persetujuan (FPIC), lalu Auditor MRV memverifikasi kecocokan data sebelum blok disegel secara kriptografis.",
    href: "/verifikasi",
    cta: "Uji Verifikasi Segel",
  },
  {
    step: "3. Simulasi manfaat & rekap laporan",
    detail:
      "Unit yang berstatus terverifikasi dapat diuji pada Pasar Simulasi dengan pemisahan otomatis 60% untuk komunitas dan 40% untuk operasi pengelola.",
    href: "/rekap/harian",
    cta: "Lihat Rekap Laporan",
  },
];

const ROLE_ORDER: UserRole[] = ["community", "manager", "recipient", "auditor", "guest"];
const STATUS_ORDER: CanonicalStatus[] = ["VERIFIED", "WARNING", "DISPUTE", "BLOCKED"];

export function BantuanView() {
  return (
    <BotanicalAppShell>
      <div className="space-y-6">
        <BotanicalPageHeader
          title="Bantuan & Panduan EXBON CP"
          description="Penjelasan ringkas mengenai pemantauan hutan, peran pengguna, aturan izin warga, serta cara memeriksa keaslian segel secara mandiri."
          actions={<SimulasiBadge />}
        />

        <BotanicalCard className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Mascot
              pose="menunjuk-peta"
              size={104}
              alt="Maskot EXBON CP menunjuk panduan peta"
              className="shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h2 className="xb-display text-[21px] font-bold text-[var(--ink)]">
                Apa itu EXBON CP?
              </h2>
              <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-[var(--ink-muted)]">
                EXBON CP adalah platform pemantauan proyek serapan karbon berbasis komunitas yang
                menggabungkan sensor hutan (ESP32), pemantauan tutupan hijau satelit (NDVI),
                persetujuan bebas tanpa paksaan (FPIC), dan pencatatan segel hash SHA-256 agar
                setiap unit dapat dipertanggungjawabkan secara terbuka.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <Link
                  href="/peta"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--forest-700)] px-5 text-[14.5px] font-semibold text-white transition hover:bg-[var(--forest-800)]"
                >
                  <MapIcon className="h-4 w-4" aria-hidden="true" />
                  <span>Mulai dari Peta</span>
                </Link>
                <Link
                  href="/verifikasi"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--seal-line)] bg-[var(--seal-100)] px-5 text-[14.5px] font-semibold text-[var(--seal-700)] transition hover:bg-[var(--surface-soft)]"
                >
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  <span>Cek Keaslian Segel</span>
                </Link>
              </div>
            </div>
          </div>
        </BotanicalCard>

        <section aria-labelledby="panduan-3-langkah" className="space-y-4">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-[var(--forest-700)]" aria-hidden="true" />
            <h2 id="panduan-3-langkah" className="xb-display text-[19px] font-bold text-[var(--ink)]">
              Alur Kerja Tiga Langkah
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {GUIDED_STEPS.map((item) => (
              <BotanicalCard key={item.step} className="flex flex-col justify-between p-5">
                <div>
                  <h3 className="xb-display text-[17.5px] font-bold text-[var(--ink)]">{item.step}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--ink-muted)]">{item.detail}</p>
                </div>
                <div className="mt-4 pt-3">
                  <Link
                    href={item.href}
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 text-[14px] font-semibold text-[var(--ink)] transition hover:bg-[var(--leaf-100)]"
                  >
                    <span>{item.cta}</span>
                    <ArrowUpRight className="h-4 w-4 text-[var(--forest-700)]" aria-hidden="true" />
                  </Link>
                </div>
              </BotanicalCard>
            ))}
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          <BotanicalCard className="flex h-full flex-col justify-between p-6">
            <div>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-[var(--forest-700)]" aria-hidden="true" />
                <h2 className="xb-display text-[19px] font-bold text-[var(--ink)]">
                  Arti Empat Status Lahan
                </h2>
              </div>
              <p className="mt-1.5 text-[14.5px] text-[var(--ink-muted)]">
                Status lahan ditentukan oleh gabungan izin warga, kondisi sensor, indeks NDVI
                (minimal 0,70), serta keputusan Auditor MRV.
              </p>
              <div className="mt-4 space-y-3">
                {STATUS_ORDER.map((statusCode) => {
                  const info = STATUS_DISPLAY[statusCode];
                  return (
                    <div
                      key={statusCode}
                      className="rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <CanonicalStatusBadge status={statusCode} />
                        <span className="text-[13.5px] font-semibold text-[var(--ink-muted)]">
                          {info.marketLabel}
                        </span>
                      </div>
                      <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--ink)]">{info.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="mt-4 border-t border-[var(--line-subtle)] pt-3 text-[13px] text-[var(--ink-muted)]">
              Setiap perubahan status langsung tercermin pada Peta, Screener, dan panel penawaran simulasi.
            </p>
          </BotanicalCard>

          <BotanicalCard className="flex h-full flex-col justify-between p-6">
            <div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[var(--forest-700)]" aria-hidden="true" />
                <h2 className="xb-display text-[19px] font-bold text-[var(--ink)]">
                  Peran & Hak Akses
                </h2>
              </div>
              <p className="mt-1.5 text-[14.5px] text-[var(--ink-muted)]">
                Setiap peran memiliki batas layar tersendiri untuk mencegah benturan wewenang.
              </p>
              <div className="mt-4 space-y-3">
                {ROLE_ORDER.map((r) => (
                  <div
                    key={r}
                    className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"
                  >
                    <p className="text-[15px] font-bold text-[var(--ink)]">{ROLE_TITLES[r].label}</p>
                    <p className="mt-1 text-[14.5px] leading-relaxed text-[var(--ink-muted)]">{ROLE_TITLES[r].scopeSummary}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-4 border-t border-[var(--line-subtle)] pt-3 text-[13px] text-[var(--ink-muted)]">
              Untuk mencoba alur berbeda, gunakan pengalih peran demo di halaman Akun.
            </p>
          </BotanicalCard>
        </div>

        <BotanicalCard className="border-[var(--seal-line)] bg-[var(--seal-100)]/45 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--seal-100)] text-[var(--seal-600)]">
              <FlaskConical className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="xb-display text-[19px] font-bold text-[var(--ink)]">
                Penjelasan Verifikasi SHA-256 & Mode Simulasi
              </h2>
              <p className="mt-1.5 text-[15px] leading-relaxed text-[var(--ink)]">
                Setiap laporan yang disahkan Auditor diikat dengan tanda tangan hash SHA-256 dan
                disambungkan ke blok sebelumnya. Anda bisa membuktikan keutuhan ini di halaman{" "}
                <Link href="/verifikasi" className="font-semibold text-[var(--seal-700)] underline">
                  Verifikasi
                </Link>{" "}
                dengan mengubah satu huruf pada isi JSON untuk melihat nilai hash berubah seketika.
              </p>
              <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--ink-muted)]">
                {APP_SIMULATION_NOTE}
              </p>
            </div>
          </div>
        </BotanicalCard>
      </div>
    </BotanicalAppShell>
  );
}

