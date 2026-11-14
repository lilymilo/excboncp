"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { BotanicalCard } from "@/components/dapp/BotanicalPrimitives";
import { Reveal } from "@/components/motion";

const PROCESS_STEPS = [
  {
    num: "01",
    title: "Telemetri Fisik & Satelit",
    desc: "Sensor di pohon mengukur suhu, kelembapan, dan nyala api tiap 5 detik sementara satelit Sentinel memperbarui kerapatan kanopi.",
    detail: "Pipa otomasi dMRV berjalan deterministik tanpa intervensi manusia.",
    actionLabel: "Lihat Indikator Lapangan",
    href: "/indikator",
  },
  {
    num: "02",
    title: "Persetujuan Warga Adat (FPIC)",
    desc: "Komunitas memeriksa batas petak dan memberikan izin tertulis yang sah. Tanpa izin ini, sistem otomatis menahan seluruh unit.",
    detail: "Status lahan langsung berubah menjadi BLOCKED atau DISPUTE bila izin dicabut.",
    actionLabel: "Buka Halaman Izin Warga",
    href: "/izin/PARCEL-A",
  },
  {
    num: "03",
    title: "Kalkulasi Status & AI Explainer",
    desc: "Fungsi aturan deterministik menetapkan status kelayakan lahan, lalu asisten AI merangkum bukti ke dalam bahasa yang mudah dipahami.",
    detail: "Kode yang menentukan angka dan status; AI hanya menjelaskan alasan di baliknya.",
    actionLabel: "Pantau Umpan Langsung",
    href: "/langsung",
  },
  {
    num: "04",
    title: "Audit & Penguncian EAS Sepolia",
    desc: "Auditor independen meninjau bukti lapangan dan mengunci segel kriptografi SHA-256 ke Ethereum Attestation Service.",
    detail: "Menghasilkan nomor catatan publik yang bisa diverifikasi ulang di peramban.",
    actionLabel: "Periksa Segel SHA-256",
    href: "/verifikasi/1",
  },
  {
    num: "05",
    title: "Simulasi Pasar & Bagi Hasil 60/40",
    desc: "Unit terverifikasi masuk ke pasar simulasi dengan pembagian hasil otomatis: 60% untuk kas komunitas adat dan 40% untuk pengelola.",
    detail: "Jika sensor api menyala, unit karbon seketika dibekukan dari alokasi pasar.",
    actionLabel: "Buka Screener Pasar",
    href: "/screener",
  },
] as const;

export function ProcessJourneySection() {
  const [activeStep, setActiveStep] = useState<number>(0);

  return (
    <section id="proses" className="section-spacing border-t border-[var(--color-border-subtle)]">
      <div className="page-shell">
        {/* Consistent Section Header: Eyebrow + Title + 1-sentence description */}
        <Reveal className="max-w-3xl">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] block mb-2.5">
            Alur Verifikasi Terbuka
          </span>
          <h2 className="text-[clamp(1.95rem,3.4vw,3.1rem)] font-normal leading-[1.15] tracking-tight text-[var(--color-text-primary)]">
            Dari getaran pohon hingga{" "}
            <span className="text-[var(--color-accent)]">segel digital</span> di jaringan publik.
          </h2>
          <p className="mt-3.5 text-[0.95rem] leading-relaxed text-[var(--color-text-secondary)]">
            Lima tahapan berurutan yang memastikan integritas karbon hutan dapat dibuktikan
            secara mandiri oleh siapa pun.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-3.5">
          {PROCESS_STEPS.map((s, index) => {
            const isActive = activeStep === index;

            return (
              <Reveal key={s.num} delay={index * 60}>
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={isActive}
                  onClick={() => setActiveStep(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveStep(index);
                    }
                  }}
                >
                  <BotanicalCard
                    interactive
                    className={`p-5 sm:p-6 ${
                      isActive
                        ? "border-[var(--color-accent-line)] bg-[var(--color-surface-raised)]"
                        : ""
                    }`}
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-baseline">
                      <div className="md:col-span-2 flex items-center gap-2.5 font-mono text-sm">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isActive
                              ? "bg-[var(--color-accent)] shadow-[var(--shadow-glow-accent)]"
                              : "bg-[var(--color-border-strong)]"
                          }`}
                        />
                        <span
                          className={
                            isActive
                              ? "font-bold text-[var(--color-accent)]"
                              : "text-[var(--color-text-muted)]"
                          }
                        >
                          Tahap {s.num}
                        </span>
                      </div>

                      <div className="md:col-span-4">
                        <h3
                          className={`text-lg sm:text-xl font-medium tracking-tight ${
                            isActive
                              ? "text-[var(--color-accent)]"
                              : "text-[var(--color-text-primary)]"
                          }`}
                        >
                          {s.title}
                        </h3>
                      </div>

                      <div className="md:col-span-6 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                        <p>{s.desc}</p>

                        {isActive && (
                          <div className="xbm-content-ready mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3.5 text-xs">
                            <span className="inline-flex items-center gap-2 text-[var(--color-text-primary)]">
                              <CheckCircle2
                                className="h-4 w-4 shrink-0 text-[var(--color-accent)]"
                                aria-hidden="true"
                              />
                              <span>{s.detail}</span>
                            </span>
                            <Link
                              href={s.href}
                              onClick={(e) => e.stopPropagation()}
                              className="xbm-link-inline font-semibold text-[var(--color-accent)]"
                            >
                              <span>{s.actionLabel}</span>
                              <ArrowRight
                                className="xbm-card-icon h-3.5 w-3.5"
                                aria-hidden="true"
                              />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </BotanicalCard>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
