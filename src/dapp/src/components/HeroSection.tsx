"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Compass, MapPin, ShieldCheck } from "lucide-react";
import { BotanicalCard } from "@/components/dapp/BotanicalPrimitives";
import { LiveNumber, PulseDot, Reveal } from "@/components/motion";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { RippleButton } from "@/components/ui/ripple-button";

const HERO_METRICS = [
  {
    id: "verified",
    label: "Unit Terverifikasi",
    value: 1307,
    suffix: " tCO2e",
    sub: "Siap alokasi pasar simulasi",
  },
  {
    id: "area",
    label: "Luas Kanopi Dipantau",
    value: 1961,
    suffix: " Ha",
    sub: "Sentinel-2 & radar SAR aktif",
  },
  {
    id: "share",
    label: "Porsi Kas Komunitas",
    value: 60,
    suffix: "%",
    sub: "Hak veto FPIC warga adat",
  },
  {
    id: "block",
    label: "Rantai Segel SHA-256",
    value: 1253,
    prefix: "#",
    suffix: "",
    sub: "Terkunci di Base Sepolia EAS",
  },
] as const;

export function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-20">
      {/* Ambient Radial Halo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-1/2 -z-10 h-[360px] w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(100,117,62,0.22)_0%,rgba(11,16,12,0)_70%)] blur-[80px] sm:h-[440px] sm:w-[820px]"
      />

      <div className="page-shell flex flex-col items-center text-center">
        <Reveal delay={0}>
          <div className="xbm-status-badge mb-6 border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3.5 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] shadow-[var(--shadow-xs)]">
            <PulseDot pulsing className="text-[var(--color-accent)]" />
            <span>Sistem Pemantauan Hutan &amp; Verifikasi Karbon Terbuka</span>
          </div>
        </Reveal>

        <Reveal delay={60}>
          <h1 className="max-w-4xl text-[clamp(2.35rem,5vw,4.35rem)] font-normal leading-[1.1] tracking-tight text-[var(--color-text-primary)]">
            Bukti <span className="text-[var(--color-accent)]">kondisi hutan</span>,
            <br className="hidden sm:inline" /> sebelum menghitung nilai.
          </h1>
        </Reveal>

        <Reveal delay={120}>
          <p className="mt-5 max-w-[58ch] text-[0.95rem] leading-relaxed text-[var(--color-text-secondary)] sm:text-[1.05rem]">
            Excboncp menyatukan citra satelit, sensor fisik di pepohonan, dan izin tertulis warga adat
            ke dalam buku catatan terbuka yang disegel secara kriptografis tanpa perantara.
          </p>
        </Reveal>

        {/* Primary & Secondary CTAs */}
        <Reveal delay={180} className="mt-8 flex w-full flex-col items-center justify-center gap-3.5 sm:w-auto sm:flex-row">
          <ShimmerButton
            onClick={() => router.push("/screener")}
            className="w-full sm:w-auto text-[0.9rem]"
          >
            <span>Buka Pasar &amp; Screener</span>
            <ArrowRight className="xbm-card-icon h-4 w-4" aria-hidden="true" />
          </ShimmerButton>

          <RippleButton
            onClick={() => router.push("/peta")}
            className="w-full sm:w-auto rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-6 py-2.5 text-[0.9rem] font-medium text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-soft)]"
          >
            <MapPin className="h-4 w-4 text-[var(--color-accent)]" aria-hidden="true" />
            <span>Peta Poligon &amp; IoT</span>
          </RippleButton>
        </Reveal>

        {/* Quick Navigation Inline Links */}
        <Reveal delay={240} className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[var(--color-text-secondary)]">
          <Link href="/screener" className="xbm-link-inline font-medium text-[var(--color-accent)]">
            <Compass className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Screener 3 Ekosistem (/screener)</span>
          </Link>
          <span aria-hidden="true" className="text-[var(--color-border-strong)]">&bull;</span>
          <Link href="/app" className="xbm-link-inline hover:text-[var(--color-text-primary)]">
            <span>Ringkasan Dasbor (/app)</span>
          </Link>
          <span aria-hidden="true" className="text-[var(--color-border-strong)]">&bull;</span>
          <Link href="/verifikasi/1" className="xbm-link-inline hover:text-[var(--color-text-primary)]">
            <span>Audit &amp; Segel EAS (/verifikasi)</span>
          </Link>
          <span aria-hidden="true" className="text-[var(--color-border-strong)]">&bull;</span>
          <Link href="/login" className="xbm-link-inline hover:text-[var(--color-text-primary)]">
            <span>Masuk Akun Demo (/login)</span>
          </Link>
        </Reveal>

        {/* 4 Key Metrics Strip */}
        <div className="mt-12 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 text-left">
          {HERO_METRICS.map((item, idx) => (
            <Reveal key={item.id} delay={160 + idx * 60}>
              <BotanicalCard className="p-5 h-full flex flex-col justify-between">
                <span className="font-mono text-[0.72rem] uppercase tracking-wider text-[var(--color-text-muted)]">
                  {item.label}
                </span>
                <div className="mt-2.5 flex items-baseline gap-0.5 text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
                  {"prefix" in item && item.prefix ? (
                    <span className="text-[var(--color-accent)]">{item.prefix}</span>
                  ) : null}
                  <LiveNumber value={item.value} />
                  <span className="ml-1 text-sm font-medium text-[var(--color-accent)]">
                    {item.suffix}
                  </span>
                </div>
                <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                  {item.sub}
                </p>
              </BotanicalCard>
            </Reveal>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
          <ShieldCheck className="h-3.5 w-3.5 text-[var(--color-accent-muted)]" aria-hidden="true" />
          <span>Simulasi sandbox di jaringan uji coba Base Sepolia &bull; Tanpa dompet kripto</span>
        </div>
      </div>
    </section>
  );
}
