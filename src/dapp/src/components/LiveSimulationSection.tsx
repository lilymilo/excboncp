"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Flame,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { formatIDR } from "@/lib/utils";
import { BotanicalCard } from "@/components/dapp/BotanicalPrimitives";
import { LiveNumber, PulseDot, Reveal, Segmented, type SegmentedOption } from "@/components/motion";
import { RippleButton } from "@/components/ui/ripple-button";

type LabMode = "semua" | "ekonomi" | "segel";

const LAB_OPTIONS: ReadonlyArray<SegmentedOption<LabMode>> = [
  { value: "semua", label: "Semua Lab" },
  { value: "ekonomi", label: "Simulasi Bagi Hasil & Api" },
  { value: "segel", label: "Uji Segel SHA-256" },
];

const ORIGINAL_HASH = "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069";
const TAMPERED_HASH = "4a18df92a014bc91238914ab01289df198273618928371982739182739182731";

export function LiveSimulationSection() {
  const [labMode, setLabMode] = useState<LabMode>("semua");
  const [fireSimulated, setFireSimulated] = useState(false);
  const [isTampered, setIsTampered] = useState(false);

  const pricePerUnit = 150000;
  const units = fireSimulated ? 500 : 600;
  const gross = units * pricePerUnit;
  const fee = (gross * 2) / 100;
  const net = gross - fee;
  const communityShare = (net * 60) / 100;
  const managerShare = net - communityShare;

  const showEconomy = labMode === "semua" || labMode === "ekonomi";
  const showSeal = labMode === "semua" || labMode === "segel";

  return (
    <section id="simulasi" className="section-spacing border-t border-[var(--color-border-subtle)]">
      <div className="page-shell">
        {/* Consistent Section Header: Eyebrow + Title + 1-sentence description */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="max-w-2xl">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] block mb-2.5">
              Laboratorium Simulasi &amp; Kriptografi Publik
            </span>
            <h2 className="text-[clamp(1.95rem,3.4vw,3.1rem)] font-normal leading-[1.15] tracking-tight text-[var(--color-text-primary)]">
              Uji pembekuan sensor api dan{" "}
              <span className="text-[var(--color-accent)]">integritas segel SHA-256</span>.
            </h2>
            <p className="mt-3.5 text-[0.95rem] leading-relaxed text-[var(--color-text-secondary)]">
              Simulasikan bagaimana deteksi bahaya membekukan unit otomatis, dan buktikan bahwa
              mengubah satu angka saja langsung mematahkan kecocokan segel digital.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <Segmented
              ariaLabel="Filter mode laboratorium interaktif"
              options={LAB_OPTIONS}
              value={labMode}
              onChange={setLabMode}
              tone="accent"
            />
          </Reveal>
        </div>

        <div className="mt-10 space-y-6">
          {/* Workbench 1: Economic Settlement & Fire Sensor Freeze */}
          {showEconomy && (
            <Reveal delay={60}>
              <BotanicalCard className="relative overflow-hidden p-6 sm:p-8">
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute -top-28 -right-28 h-72 w-72 rounded-full blur-[100px] ${
                    fireSimulated ? "bg-[var(--xb-warning)]/20" : "bg-[var(--color-accent)]/12"
                  }`}
                />

                <div className="relative z-10 flex flex-col gap-4 border-b border-[var(--color-border-subtle)] pb-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                        Lab 01 &bull; Pembagian Hasil 60/40
                      </span>
                      <span
                        key={fireSimulated ? "fire" : "safe"}
                        className={`xbm-status-badge border px-2.5 py-0.5 text-xs font-semibold ${
                          fireSimulated
                            ? "border-[var(--status-warning-line)] bg-[var(--status-warning-bg)] text-[var(--status-warning-ink)]"
                            : "border-[var(--status-verified-line)] bg-[var(--status-verified-bg)] text-[var(--status-verified-ink)]"
                        }`}
                      >
                        <PulseDot pulsing />
                        <span>{fireSimulated ? "100 Unit Dibekukan" : "Semua Unit Aktif"}</span>
                      </span>
                    </div>
                    <h3 className="mt-1.5 text-lg sm:text-xl font-medium text-[var(--color-text-primary)]">
                      Respons Otomatis Sensor Api KY-026 terhadap Nilai Bagi Hasil
                    </h3>
                  </div>

                  <RippleButton
                    type="button"
                    onClick={() => setFireSimulated((v) => !v)}
                    className={`rounded-[var(--radius-pill)] border px-4 py-2 text-xs sm:text-sm font-semibold ${
                      fireSimulated
                        ? "border-[var(--status-warning-line)] bg-[var(--xb-warning)] text-[var(--color-text-on-accent)] shadow-[var(--shadow-glow-warning)]"
                        : "border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)]"
                    }`}
                  >
                    <Flame
                      className={`h-4 w-4 ${
                        fireSimulated ? "text-[var(--color-text-on-accent)]" : "text-[var(--xb-warning)]"
                      }`}
                      aria-hidden="true"
                    />
                    <span>{fireSimulated ? "Matikan Pemicu Api" : "Uji Nyala Api (KY-026)"}</span>
                  </RippleButton>
                </div>

                <div className="relative z-10 mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5">
                    <span className="block font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                      Unit Terverifikasi
                    </span>
                    <div className="mt-2.5 flex items-baseline gap-1.5">
                      <span className="font-mono text-2xl sm:text-3xl font-semibold text-[var(--color-text-primary)]">
                        <LiveNumber value={units} countUpOnView={false} />
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)]">tCO2e</span>
                    </div>
                    <div className="mt-3 border-t border-[var(--color-border-subtle)] pt-2.5 text-xs">
                      {fireSimulated ? (
                        <span className="inline-flex items-center gap-1 font-medium text-[var(--status-warning-ink)]">
                          <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>100 unit ditahan sensor</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-medium text-[var(--color-accent)]">
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>100% lolos verifikasi</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5">
                    <span className="block font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                      Nilai Kotor (Rp150rb/t)
                    </span>
                    <div className="mt-2.5 font-mono text-xl sm:text-2xl font-semibold text-[var(--color-text-primary)]">
                      <LiveNumber value={gross} format={formatIDR} countUpOnView={false} />
                    </div>
                    <div className="mt-3 border-t border-[var(--color-border-subtle)] pt-2.5 text-xs text-[var(--color-text-secondary)]">
                      Biaya sandbox 2%:{" "}
                      <span className="font-mono text-[var(--color-text-primary)]">
                        <LiveNumber value={fee} format={formatIDR} countUpOnView={false} />
                      </span>
                    </div>
                  </div>

                  <div className="rounded-[var(--radius-panel)] border border-[var(--color-accent-line)] bg-[var(--color-surface-soft)] p-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs uppercase tracking-wider text-[var(--color-accent)]">
                        Kas Adat (60%)
                      </span>
                      <span className="rounded-[var(--radius-pill)] border border-[var(--color-accent-line)] bg-[var(--color-accent-tint)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-accent)]">
                        Hak Veto
                      </span>
                    </div>
                    <div className="mt-2.5 font-mono text-xl sm:text-2xl font-bold text-[var(--color-accent)]">
                      <LiveNumber value={communityShare} format={formatIDR} countUpOnView={false} />
                    </div>
                    <div className="mt-3 border-t border-[var(--color-border)] pt-2.5 text-xs text-[var(--color-text-secondary)]">
                      Langsung ke kas komunitas desa
                    </div>
                  </div>

                  <div className="rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5">
                    <span className="block font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                      Pengelola Lahan (40%)
                    </span>
                    <div className="mt-2.5 font-mono text-xl sm:text-2xl font-semibold text-[var(--color-text-primary)]">
                      <LiveNumber value={managerShare} format={formatIDR} countUpOnView={false} />
                    </div>
                    <div className="mt-3 border-t border-[var(--color-border-subtle)] pt-2.5 text-xs text-[var(--color-text-secondary)]">
                      Operasional pemeliharaan sensor
                    </div>
                  </div>
                </div>

                <div className="relative z-10 mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border-subtle)] pt-4 text-xs">
                  <span className="text-[var(--color-text-secondary)]">
                    Formula R7: potongan 2% biaya operasional sandbox, lalu 60% warga : 40% pengelola.
                  </span>
                  <Link
                    href="/screener"
                    className="xbm-link-inline font-semibold text-[var(--color-accent)]"
                  >
                    <span>Buka Screener Pasar Karbon</span>
                    <ArrowRight className="xbm-card-icon h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </BotanicalCard>
            </Reveal>
          )}

          {/* Workbench 2: Client-Side SHA-256 Tamper Verification */}
          {showSeal && (
            <Reveal delay={120}>
              <BotanicalCard id="verifikasi" className="p-6 sm:p-8">
                <div className="flex flex-col gap-4 border-b border-[var(--color-border-subtle)] pb-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                        Lab 02 &bull; Verifikasi Mandiri Sisi Klien
                      </span>
                      <span
                        key={isTampered ? "tampered" : "valid"}
                        className={`xbm-status-badge border px-2.5 py-0.5 text-xs font-semibold ${
                          isTampered
                            ? "border-[var(--status-blocked-line)] bg-[var(--status-blocked-bg)] text-[var(--status-blocked-ink)]"
                            : "border-[var(--status-verified-line)] bg-[var(--status-verified-bg)] text-[var(--status-verified-ink)]"
                        }`}
                      >
                        <PulseDot pulsing={!isTampered} />
                        <span>{isTampered ? "Manipulasi Terdeteksi" : "Segel SHA-256 Cocok"}</span>
                      </span>
                    </div>
                    <h3 className="mt-1.5 text-lg sm:text-xl font-medium text-[var(--color-text-primary)]">
                      Pemeriksaan Entri Lahan Long Isun #01 Secara Langsung di Browser
                    </h3>
                  </div>

                  <RippleButton
                    type="button"
                    onClick={() => setIsTampered((v) => !v)}
                    className={`rounded-[var(--radius-pill)] border px-4 py-2 text-xs sm:text-sm font-semibold ${
                      isTampered
                        ? "border-[var(--status-blocked-line)] bg-[var(--status-blocked-bg)] text-[var(--status-blocked-ink)] shadow-[var(--shadow-glow-danger)]"
                        : "border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)]"
                    }`}
                  >
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{isTampered ? "Kembalikan Data Asli" : "Ubah 1 Angka pada Data"}</span>
                  </RippleButton>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 font-mono text-xs text-[var(--color-text-secondary)] space-y-2.5">
                    <span className="block font-sans text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
                      Struktur Muatan Data yang Dibaca Browser
                    </span>
                    <p>
                      <span className="text-[var(--color-text-muted)]">parcel_id:</span> &quot;lahan-long-isun-01&quot;
                    </p>
                    <p>
                      <span className="text-[var(--color-text-muted)]">carbon_units:</span>{" "}
                      <span
                        className={`rounded px-1.5 py-0.5 font-bold ${
                          isTampered
                            ? "bg-[var(--status-blocked-bg)] text-[var(--status-blocked-ink)]"
                            : "text-[var(--color-accent)]"
                        }`}
                      >
                        <LiveNumber value={isTampered ? 999 : 600} countUpOnView={false} />
                      </span>{" "}
                      {isTampered && (
                        <span className="text-[10px] text-[var(--status-blocked-ink)]">
                          (Diubah fiktif!)
                        </span>
                      )}
                    </p>
                    <p>
                      <span className="text-[var(--color-text-muted)]">consent_status:</span> &quot;GRANTED&quot;
                    </p>
                    <p>
                      <span className="text-[var(--color-text-muted)]">ndvi_score:</span> 0.81
                    </p>
                  </div>

                  <div className="flex flex-col justify-between rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5">
                    <div>
                      <span className="block font-sans text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
                        Perbandingan Hash SHA-256
                      </span>
                      <div className="space-y-3 font-mono text-xs">
                        <div>
                          <span className="block text-[10px] text-[var(--color-text-muted)]">
                            Segel Tersimpan di Ledger:
                          </span>
                          <span className="break-all text-[var(--color-text-primary)]">
                            {ORIGINAL_HASH}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-[var(--color-text-muted)]">
                            Segel yang Dihitung Ulang:
                          </span>
                          <span
                            className={`break-all ${
                              isTampered
                                ? "font-bold text-[var(--status-blocked-ink)]"
                                : "text-[var(--color-accent)]"
                            }`}
                          >
                            {isTampered ? TAMPERED_HASH : ORIGINAL_HASH}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`mt-5 flex items-center gap-3 rounded-[var(--radius-panel)] border p-3.5 text-xs ${
                        isTampered
                          ? "border-[var(--status-blocked-line)] bg-[var(--status-blocked-bg)] text-[var(--status-blocked-ink)]"
                          : "border-[var(--status-verified-line)] bg-[var(--status-verified-bg)] text-[var(--status-verified-ink)]"
                      }`}
                    >
                      {isTampered ? (
                        <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
                      )}
                      <div>
                        <span className="block font-semibold">
                          {isTampered
                            ? "PERINGATAN: Manipulasi Terdeteksi"
                            : "DATA VALID: Segel Digital Cocok"}
                        </span>
                        <span className="text-[11px] opacity-90">
                          {isTampered
                            ? "Nilai hash melenceng dari rantai publik. Alokasi otomatis ditolak."
                            : "Hash sesuai persis dengan catatan Base Sepolia EAS."}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border-subtle)] pt-4 text-xs">
                  <span className="text-[var(--color-text-secondary)]">
                    Setiap blok ledger menyertakan prev_hash sehingga riwayat tidak bisa disisipi mundur.
                  </span>
                  <Link
                    href="/verifikasi/1"
                    className="xbm-link-inline font-semibold text-[var(--color-accent)]"
                  >
                    <span>Buka Pemeriksa Segel Penuh</span>
                    <ArrowRight className="xbm-card-icon h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </BotanicalCard>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
