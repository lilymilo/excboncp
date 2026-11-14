"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertTriangle, RefreshCw, ArrowRight, ShieldCheck } from "lucide-react";

export function TamperVerificationDemo() {
  const originalUnits = 600;
  const originalHash = "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069";
  const tamperedHash = "4a18df92a014bc91238914ab01289df198273618928371982739182739182731";

  const [isTampered, setIsTampered] = useState(false);

  return (
    <section id="verifikasi" className="py-16 sm:py-24 border-t border-[var(--line-subtle)]">
      <div className="page-shell">
        <div className="max-w-2xl mb-10 sm:mb-14">
          <span className="xb-eyebrow block mb-2">
            Kriptografi Publik &bull; SHA-256 &amp; EAS
          </span>
          <h2 className="xb-display text-[clamp(2.1rem,3.5vw,3.2rem)] font-bold text-[var(--ink)] leading-[1.18] tracking-tight">
            Uji integritas segel digital{" "}
            <span className="text-[var(--forest-800)]">langsung di browser</span>.
          </h2>
          <p className="mt-4 text-[1rem] text-[var(--ink-muted)] leading-relaxed">
            Di ExcbonCP, peramban milikmu menghitung ulang rumus segel digital secara mandiri.
            Ubah satu angka saja pada data, segel digital seketika tidak cocok.
          </p>
        </div>

        {/* Verification Card */}
        <div className="p-6 sm:p-10 rounded-[24px] bg-white border border-[var(--line)] shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-7 border-b border-[var(--line-subtle)]">
            <div>
              <span className="xb-eyebrow block mb-1">
                Verifikasi Mandiri di Sisi Klien
              </span>
              <h3 className="xb-display text-[1.35rem] font-bold text-[var(--ink)]">
                Pemeriksaan Entri Petak Mahakam Ulu #01
              </h3>
            </div>

            {/* Tamper Toggle Button */}
            <button
              type="button"
              onClick={() => setIsTampered(!isTampered)}
              className={`min-h-[42px] px-5 py-2.5 rounded-full text-[13.5px] font-semibold flex items-center gap-2 border transition-all active:scale-95 ${
                isTampered
                  ? "bg-[var(--status-blocked-bg)] text-[var(--status-blocked-ink)] border-[var(--status-blocked-line)] shadow-xs"
                  : "bg-[var(--surface-soft)] hover:bg-[var(--surface-sunken)] text-[var(--ink)] border-[var(--line)]"
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>{isTampered ? "Kembalikan Data Asli" : "Ubah 1 Angka pada Data"}</span>
            </button>
          </div>

          {/* Data Payload Comparison */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-[18px] bg-[var(--surface-soft)] border border-[var(--line)] text-[13px] font-mono space-y-2.5 text-[var(--ink)]">
              <span className="text-[var(--ink-dim)] font-sans font-semibold block mb-3 text-[11.5px] uppercase tracking-wider">
                Struktur Data yang Dibaca Browser
              </span>
              <p>
                <span className="text-[var(--ink-muted)]">parcel_id:</span> &quot;mahakam-ulu-01&quot;
              </p>
              <p>
                <span className="text-[var(--ink-muted)]">carbon_units:</span>{" "}
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    isTampered
                      ? "bg-[var(--status-blocked-bg)] text-[var(--status-blocked-ink)]"
                      : "bg-[var(--leaf-100)] text-[var(--forest-800)]"
                  }`}
                >
                  {isTampered ? 999 : originalUnits}
                </span>{" "}
                {isTampered && (
                  <span className="text-[var(--status-blocked-ink)] text-[11px] font-sans font-medium">
                    (Manipulasi fiktif!)
                  </span>
                )}
              </p>
              <p>
                <span className="text-[var(--ink-muted)]">consent_status:</span> &quot;GRANTED&quot;
              </p>
              <p>
                <span className="text-[var(--ink-muted)]">ndvi_score:</span> 0.81
              </p>
            </div>

            {/* Calculated Hash vs Stored Hash */}
            <div className="p-5 rounded-[18px] bg-[var(--surface-soft)] border border-[var(--line)] flex flex-col justify-between">
              <div>
                <span className="text-[var(--ink-dim)] font-sans font-semibold block mb-3 text-[11.5px] uppercase tracking-wider">
                  Hasil Perhitungan Hash SHA-256
                </span>
                <div className="space-y-3 font-mono text-[12px]">
                  <div>
                    <span className="text-[var(--ink-muted)] block text-[11px] font-sans">
                      Segel Tersimpan di Ledger Publik:
                    </span>
                    <span className="text-[var(--ink)] break-all font-semibold">{originalHash}</span>
                  </div>
                  <div>
                    <span className="text-[var(--ink-muted)] block text-[11px] font-sans">
                      Segel yang Dihitung Ulang Sisi Klien:
                    </span>
                    <span
                      className={`break-all font-semibold ${
                        isTampered ? "text-[var(--status-blocked-ink)] font-bold" : "text-[var(--forest-800)]"
                      }`}
                    >
                      {isTampered ? tamperedHash : originalHash}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div
                className={`mt-6 p-4 rounded-[16px] border flex items-center gap-3 ${
                  isTampered
                    ? "bg-[var(--status-blocked-bg)] border-[var(--status-blocked-line)] text-[var(--status-blocked-ink)]"
                    : "bg-[var(--status-verified-bg)] border-[var(--status-verified-line)] text-[var(--status-verified-ink)]"
                }`}
              >
                {isTampered ? (
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                )}
                <div className="text-[13px]">
                  <span className="font-bold block">
                    {isTampered ? "PERINGATAN: Manipulasi Terdeteksi" : "DATA VALID: Segel Digital Cocok"}
                  </span>
                  <span className="text-[12px] opacity-90">
                    {isTampered
                      ? "Angka tidak sesuai catatan rantai hash. Transaksi otomatis ditolak sistem."
                      : "Nilai hash sesuai persis dengan catatan publik. Data terbukti asli."}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-[var(--line-subtle)] flex items-center justify-between">
            <span className="text-[13px] text-[var(--ink-muted)]">
              Terverifikasi on-chain di Base Sepolia Testnet
            </span>
            <Link
              href="/verifikasi"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--forest-800)] hover:underline"
            >
              <span>Buka Portal Verifikasi Mandiri</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
