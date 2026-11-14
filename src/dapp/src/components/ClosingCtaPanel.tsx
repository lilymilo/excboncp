"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ClipboardCheck,
  Factory,
  LogIn,
  ShieldCheck,
  Trees,
  UserPlus,
  Users,
} from "lucide-react";
import { BotanicalCard } from "@/components/dapp/BotanicalPrimitives";
import { Reveal } from "@/components/motion";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { RippleButton } from "@/components/ui/ripple-button";

const DEMO_ROLES = [
  {
    id: "komunitas",
    title: "Komunitas Adat",
    desc: "Kelola izin warga (FPIC), cabut persetujuan bila ada sengketa, dan periksa alokasi kas 60%.",
    icon: Users,
    badge: "Hak Veto",
  },
  {
    id: "pengelola",
    title: "Pengelola Hutan",
    desc: "Pantau kondisi sensor pohon, status radar satelit, dan kesiapan unit karbon masuk pasar.",
    icon: Trees,
    badge: "Monitoring",
  },
  {
    id: "penerima",
    title: "Kawasan Industri (KEK)",
    desc: "Simulasikan penyerapan unit karbon terverifikasi untuk dekarbonisasi zona industri.",
    icon: Factory,
    badge: "Penerima",
  },
  {
    id: "auditor",
    title: "Auditor Independen",
    desc: "Tinjau bukti berlapis sebelum menyetujui penguncian segel digital SHA-256 permanen.",
    icon: ClipboardCheck,
    badge: "Penyetuju",
  },
] as const;

export function ClosingCtaPanel() {
  const router = useRouter();

  return (
    <section id="demo" className="section-spacing border-t border-[var(--color-border-subtle)]">
      <div className="page-shell space-y-10">
        {/* Consistent Section Header: Eyebrow + Title + 1-sentence description */}
        <Reveal className="max-w-3xl">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] block mb-2.5">
            Akses Eksplorasi 4 Peran &amp; Mulai Uji Coba
          </span>
          <h2 className="text-[clamp(1.95rem,3.4vw,3.1rem)] font-normal leading-[1.15] tracking-tight text-[var(--color-text-primary)]">
            Buktikan integritas karbon hutan,{" "}
            <span className="text-[var(--color-accent)]">langsung di browser</span> kamu.
          </h2>
          <p className="mt-3.5 text-[0.95rem] leading-relaxed text-[var(--color-text-secondary)]">
            Pilih salah satu peran contoh di bawah untuk masuk otomatis tanpa dompet kripto, atau
            buka dasbor utama untuk menjelajahi seluruh fitur.
          </p>
        </Reveal>

        {/* 4 Interactive Role Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DEMO_ROLES.map((r, idx) => {
            const Icon = r.icon;
            return (
              <Reveal key={r.id} delay={idx * 60}>
                <Link href={`/login?role=${r.id}`} className="block h-full">
                  <BotanicalCard
                    interactive
                    className="flex h-full flex-col justify-between p-6"
                  >
                    <div>
                      <div className="mb-5 flex items-center justify-between">
                        <span className="grid h-11 w-11 place-items-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-accent)]">
                          <Icon className="xbm-card-icon h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2.5 py-1 font-mono text-[10px] text-[var(--color-text-secondary)]">
                          {r.badge}
                        </span>
                      </div>

                      <h3 className="text-lg font-medium tracking-tight text-[var(--color-text-primary)]">
                        {r.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                        {r.desc}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-[var(--color-border-subtle)] pt-4 text-xs font-semibold text-[var(--color-accent)]">
                      <span>Masuk Akun Demo</span>
                      <ArrowRight className="xbm-card-icon h-3.5 w-3.5" aria-hidden="true" />
                    </div>
                  </BotanicalCard>
                </Link>
              </Reveal>
            );
          })}
        </div>

        {/* Closing Anchor Banner */}
        <Reveal delay={180}>
          <BotanicalCard className="relative overflow-hidden p-8 sm:p-12 text-center">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[var(--color-accent-muted)]/14 to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[var(--color-accent-muted)]/14 to-transparent"
            />

            <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
              <h3 className="text-2xl sm:text-3xl font-normal tracking-tight text-[var(--color-text-primary)]">
                Siap menguji alur penuh dari <span className="text-[var(--color-accent)]">sensor ke segel</span>?
              </h3>
              <p className="mt-3 text-sm sm:text-base text-[var(--color-text-secondary)]">
                Jalur pengujian 5 menit siap pakai untuk meninjau dasbor peran, pasar simulasi, dan
                katalog 3 ekosistem.
              </p>

              <div className="mt-7 flex w-full flex-col items-center justify-center gap-3.5 sm:w-auto sm:flex-row">
                <ShimmerButton
                  onClick={() => router.push("/login")}
                  className="w-full sm:w-auto text-sm"
                >
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  <span>Halaman Log In (4 Peran)</span>
                </ShimmerButton>

                <RippleButton
                  onClick={() => router.push("/register")}
                  className="w-full sm:w-auto rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-6 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)]"
                >
                  <UserPlus className="h-4 w-4 text-[var(--color-accent)]" aria-hidden="true" />
                  <span>Daftar Akun Baru</span>
                </RippleButton>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--color-text-muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[var(--color-accent-muted)]" aria-hidden="true" />
                  <span>Berjalan di testnet Base Sepolia</span>
                </span>
                <span aria-hidden="true">&bull;</span>
                <Link
                  href="/bantuan"
                  className="xbm-link-inline text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                >
                  <span>Baca Panduan Lengkap (/bantuan)</span>
                </Link>
              </div>
            </div>
          </BotanicalCard>
        </Reveal>
      </div>
    </section>
  );
}
