"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  FileSearch,
  FlaskConical,
  RotateCcw,
  Search,
  Share2,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { BotanicalAppShell } from "@/components/dapp/BotanicalAppShell";
import {
  BotanicalCard,
  BotanicalPageHeader,
  LiveTelemetryPill,
  PageStatePanel,
  SimulasiBadge,
} from "@/components/dapp/BotanicalPrimitives";
import { HashSeal } from "@/components/dapp/HashSeal";
import { useDashboardState } from "@/components/dapp/useDashboardStore";
import { formatWibDateTime } from "@/lib/dashboard-helpers";
import { lookupVerificationRecord, type VerifyLookupResult } from "@/lib/exbon-api";

function shortHash(value?: string | null): string {
  if (!value) return "-";
  if (value.length <= 16) return value;
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

export function VerifikasiView({ initialQueryId }: { initialQueryId?: string }) {
  const searchParams = useSearchParams();
  const stateParam = searchParams.get("state");
  const queryFromUrl = searchParams.get("id") ?? searchParams.get("q");
  const { parcels, sensors, verificationRecords, isLoading } = useDashboardState();

  const defaultQuery =
    initialQueryId?.trim() ||
    queryFromUrl?.trim() ||
    String(verificationRecords[0]?.block_index ?? 1247);

  const [inputQuery, setInputQuery] = useState(defaultQuery);
  const [activeQuery, setActiveQuery] = useState(defaultQuery);
  const [tamperEditorText, setTamperEditorText] = useState("");
  const [isTamperDirty, setIsTamperDirty] = useState(false);
  const [result, setResult] = useState<VerifyLookupResult | null>(null);
  const [lookupBusy, setLookupBusy] = useState(true);
  const [copiedField, setCopiedField] = useState<"hash" | "recomputed" | "link" | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const nextDefault =
      initialQueryId?.trim() ||
      queryFromUrl?.trim() ||
      String(verificationRecords[0]?.block_index ?? 1247);
    setInputQuery(nextDefault);
    setActiveQuery(nextDefault);
    setIsTamperDirty(false);
  }, [initialQueryId, queryFromUrl, verificationRecords]);

  useEffect(() => {
    let cancelled = false;
    setLookupBusy(true);

    lookupVerificationRecord({
      queryId: activeQuery,
      verificationRecords,
      parcels,
      sensors,
      tamperTestJson: isTamperDirty ? tamperEditorText : undefined,
    })
      .then((res) => {
        if (cancelled) return;
        setResult(res);
        if (!isTamperDirty && res.found) {
          setTamperEditorText(JSON.stringify(res.payload, null, 2));
        }
        setLookupBusy(false);
      })
      .catch(() => {
        if (!cancelled) setLookupBusy(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeQuery, verificationRecords, parcels, sensors, isTamperDirty, tamperEditorText, retryKey]);

  const pageState: "loading" | "empty" | "error" | "ready" =
    stateParam === "loading" || (isLoading && !result)
      ? "loading"
      : stateParam === "error"
      ? "error"
      : stateParam === "empty"
      ? "empty"
      : "ready";

  const copyValue = async (text: string, tag: "hash" | "recomputed" | "link") => {
    if (typeof navigator !== "undefined" && navigator.clipboard && text) {
      await navigator.clipboard.writeText(text);
      setCopiedField(tag);
      setTimeout(() => setCopiedField(null), 1800);
    }
  };

  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    setIsTamperDirty(false);
    setActiveQuery(inputQuery.trim());
  };

  const quickSelectQuery = (q: string) => {
    setInputQuery(q);
    setIsTamperDirty(false);
    setActiveQuery(q);
  };

  const resetTamperTest = () => {
    setIsTamperDirty(false);
    if (result?.found && result.payload) {
      setTamperEditorText(JSON.stringify(result.payload, null, 2));
    }
  };

  const statusTone = useMemo(() => {
    if (!result) return "pending";
    if (!result.found) return "not_found";
    if (!result.valid || !result.hash_matches || !result.canonical) return "tampered";
    if (result.eas_uid) return "verified_eas";
    return "verified_local";
  }, [result]);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verifikasi/${encodeURIComponent(activeQuery)}`
      : `/verifikasi/${encodeURIComponent(activeQuery)}`;

  return (
    <BotanicalAppShell>
      <div className="space-y-4">
        <BotanicalPageHeader
          title="Verifikasi Segel & Rantai Hash"
          description="Pemeriksa keaslian terbuka untuk publik. Hitung ulang hash SHA-256 catatan laporan secara langsung dan uji apa yang terjadi bila satu karakter diubah."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <LiveTelemetryPill label="Rantai SHA-256 Aktif" />
              <SimulasiBadge />
            </div>
          }
        />

        <PageStatePanel
          state={pageState}
          onRetry={() => setRetryKey((k) => k + 1)}
          emptyTitle="Belum ada catatan segel dipilih"
          emptyDescription="Masukkan nomor blok, ID catatan, ID lahan, atau potongan hash untuk mulai memeriksa."
        >
          <BotanicalCard className="p-4 sm:p-5">
            <form onSubmit={handleSubmitSearch} className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--ink-muted)]"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  aria-label="Cari nomor blok, ID catatan, ID lahan, atau hash segel"
                  placeholder="Masukkan nomor blok (mis. 1247), ID lahan (PARCEL-A), atau awalan hash..."
                  className="min-h-[44px] w-full rounded-full border border-[var(--line)] bg-[var(--surface-soft)] pl-11 pr-4 text-[14.5px] text-[var(--ink)] focus:border-[var(--seal-600)] focus:bg-[var(--surface)] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="xbm-pressable inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[var(--seal-600)] px-5 text-[14.5px] font-semibold text-white transition hover:bg-[var(--seal-700)]"
              >
                <FileSearch className="h-4 w-4" aria-hidden="true" />
                <span>Periksa segel</span>
              </button>
            </form>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-medium text-[var(--ink-muted)]">Contoh cepat:</span>
              {verificationRecords.map((rec) => (
                <button
                  key={rec.record_id}
                  type="button"
                  onClick={() => quickSelectQuery(String(rec.block_index))}
                  className={`xbm-pressable inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold transition ${
                    String(activeQuery) === String(rec.block_index)
                      ? "border-[var(--seal-600)] bg-[var(--seal-100)] text-[var(--seal-700)]"
                      : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-soft)]"
                  }`}
                >
                  <span className="xb-mono">Blok #{rec.block_index}</span>
                  <span>({rec.parcel_id})</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => quickSelectQuery("TIDAK-ADA-999")}
                className={`xbm-pressable inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold transition ${
                  activeQuery === "TIDAK-ADA-999"
                    ? "border-[var(--status-blocked-ink)] bg-[var(--status-blocked-bg)] text-[var(--status-blocked-ink)]"
                    : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink-muted)] hover:bg-[var(--surface-soft)]"
                }`}
              >
                <span>Uji tidak ditemukan</span>
              </button>
            </div>
          </BotanicalCard>

          {result && !lookupBusy && (
            <>
              <BotanicalCard className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    {statusTone === "tampered" || statusTone === "not_found" ? (
                      <div className="grid h-18 w-18 shrink-0 place-items-center rounded-2xl border border-[var(--status-blocked-line)] bg-[var(--status-blocked-bg)] text-[var(--status-blocked-ink)]">
                        <ShieldAlert className="h-8 w-8" aria-hidden="true" />
                      </div>
                    ) : (
                      <HashSeal hash={result.recomputed_hash || result.hash} size={76} />
                    )}

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {statusTone === "verified_eas" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--seal-100)] px-3 py-0.5 text-[12.5px] font-semibold text-[var(--seal-700)]">
                            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Terverifikasi di Rantai & EAS Base Sepolia</span>
                          </span>
                        )}
                        {statusTone === "verified_local" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--status-warning-bg)] px-3 py-0.5 text-[12.5px] font-semibold text-[var(--status-warning-ink)]">
                            <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Hash cocok di lokal, menunggu penguncian EAS</span>
                          </span>
                        )}
                        {statusTone === "tampered" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--status-blocked-bg)] px-3 py-0.5 text-[12.5px] font-semibold text-[var(--status-blocked-ink)]">
                            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Tidak valid / Isi telah berubah</span>
                          </span>
                        )}
                        {statusTone === "not_found" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--status-blocked-bg)] px-3 py-0.5 text-[12.5px] font-semibold text-[var(--status-blocked-ink)]">
                            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Catatan tidak ditemukan</span>
                          </span>
                        )}
                        {result.found && (
                          <span className="xb-mono text-[13px] font-semibold text-[var(--ink-muted)]">
                            Blok #{result.block_index} · {result.parcel_id}
                          </span>
                        )}
                      </div>

                      <h2 className="xb-display mt-1.5 text-[19.5px] font-bold text-[var(--ink)]">
                        {statusTone === "verified_eas"
                          ? "Segel Utuh dan Terkunci"
                          : statusTone === "verified_local"
                          ? "Segel Lokal Valid (Menunggu EAS)"
                          : statusTone === "tampered"
                          ? "Hash Berubah, Segel Tidak Cocok"
                          : "Nomor atau Hash Tidak Ada di Rantai"}
                      </h2>
                      <p className="mt-0.5 text-[14px] leading-relaxed text-[var(--ink-muted)]">{result.message}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyValue(shareUrl, "link")}
                      className="xbm-pressable inline-flex min-h-[40px] items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-[13.5px] font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-soft)]"
                    >
                      {copiedField === "link" ? (
                        <Check className="h-4 w-4 text-[var(--status-verified-ink)]" aria-hidden="true" />
                      ) : (
                        <Share2 className="h-4 w-4 text-[var(--seal-600)]" aria-hidden="true" />
                      )}
                      <span>{copiedField === "link" ? "Tautan tersalin" : "Salin tautan"}</span>
                    </button>
                  </div>
                </div>

                {result.found && (
                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-2xl border border-[var(--seal-line)] bg-[var(--seal-100)]/55 p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[13px] font-semibold text-[var(--seal-700)]">
                          Hash tersimpan pada blok #{result.block_index}
                        </p>
                        <button
                          type="button"
                          onClick={() => copyValue(result.hash, "hash")}
                          className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 text-[12.5px] font-semibold text-[var(--seal-700)] transition hover:bg-[var(--surface-soft)]"
                        >
                          {copiedField === "hash" ? (
                            <Check className="h-3.5 w-3.5 text-[var(--status-verified-ink)]" aria-hidden="true" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                          <span>{copiedField === "hash" ? "Tersalin" : "Salin"}</span>
                        </button>
                      </div>
                      <p className="xb-mono mt-1.5 break-all text-[13px] leading-relaxed text-[var(--ink)]">
                        {result.hash || "-"}
                      </p>
                    </div>

                    <div
                      className={`rounded-2xl border p-3.5 ${
                        result.hash_matches && result.canonical
                          ? "border-[var(--status-verified-line)] bg-[var(--status-verified-bg)]/65"
                          : "border-[var(--status-blocked-line)] bg-[var(--status-blocked-bg)]/80"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-[13px] font-semibold ${
                            result.hash_matches && result.canonical
                              ? "text-[var(--status-verified-ink)]"
                              : "text-[var(--status-blocked-ink)]"
                          }`}
                        >
                          Hash hitung ulang SHA-256 (peramban)
                        </p>
                        <button
                          type="button"
                          onClick={() => copyValue(result.recomputed_hash, "recomputed")}
                          className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 text-[12.5px] font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-soft)]"
                        >
                          {copiedField === "recomputed" ? (
                            <Check className="h-3.5 w-3.5 text-[var(--status-verified-ink)]" aria-hidden="true" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                          <span>{copiedField === "recomputed" ? "Tersalin" : "Salin"}</span>
                        </button>
                      </div>
                      <p className="xb-mono mt-1.5 break-all text-[13px] leading-relaxed text-[var(--ink)]">
                        {result.recomputed_hash || "-"}
                      </p>
                    </div>
                  </div>
                )}

                {result.found && (
                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-3">
                      <p className="text-[12.5px] text-[var(--ink-muted)]">Kecocokan hash</p>
                      <p
                        className={`mt-0.5 text-[14.5px] font-bold ${
                          result.hash_matches
                            ? "text-[var(--status-verified-ink)]"
                            : "text-[var(--status-blocked-ink)]"
                        }`}
                      >
                        {result.hash_matches ? "Cocok" : "Berbeda"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-3">
                      <p className="text-[12.5px] text-[var(--ink-muted)]">Tautan blok sebelum</p>
                      <p
                        className={`mt-0.5 text-[14.5px] font-bold ${
                          result.link_matches
                            ? "text-[var(--status-verified-ink)]"
                            : "text-[var(--status-blocked-ink)]"
                        }`}
                      >
                        {result.link_matches ? "Tersambung" : "Putus"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-3">
                      <p className="text-[12.5px] text-[var(--ink-muted)]">EAS UID (Testnet)</p>
                      <p className="xb-mono mt-0.5 truncate text-[13px] font-semibold text-[var(--seal-700)]">
                        {result.eas_uid ? shortHash(result.eas_uid) : "Belum terkunci"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-3">
                      <p className="text-[12.5px] text-[var(--ink-muted)]">Waktu pencatatan</p>
                      <p className="mt-0.5 text-[13px] font-semibold text-[var(--ink)]">
                        {result.timestamp ? `${formatWibDateTime(result.timestamp)} WIB` : "-"}
                      </p>
                    </div>
                  </div>
                )}
              </BotanicalCard>

              {result.found && (
                <div className="grid gap-4 lg:grid-cols-12">
                  <BotanicalCard className="flex h-full flex-col justify-between p-5 lg:col-span-7">
                    <div className="flex flex-1 flex-col">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h2 className="xb-display text-[18px] font-bold text-[var(--ink)]">
                            Ubah 1 huruf, segel langsung berbeda
                          </h2>
                          <p className="mt-0.5 text-[13.5px] text-[var(--ink-muted)]">
                            Sunting isi data JSON di bawah ini untuk membuktikan bahwa perubahan kecil
                            akan menghasilkan hash SHA-256 yang sama sekali berbeda.
                          </p>
                        </div>
                        {isTamperDirty && (
                          <button
                            type="button"
                            onClick={resetTamperTest}
                            className="inline-flex min-h-[38px] items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 text-[13.5px] font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-soft)]"
                          >
                            <RotateCcw className="h-4 w-4 text-[var(--forest-700)]" aria-hidden="true" />
                            <span>Kembalikan ke data asli</span>
                          </button>
                        )}
                      </div>

                      <textarea
                        aria-label="Editor uji perubahan isi segel JSON"
                        rows={7}
                        value={tamperEditorText}
                        onChange={(e) => {
                          setTamperEditorText(e.target.value);
                          setIsTamperDirty(true);
                        }}
                        className="xb-mono mt-3 min-h-[200px] w-full flex-1 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-3.5 text-[13.5px] leading-relaxed text-[var(--ink)] focus:border-[var(--seal-600)] focus:bg-[var(--surface)] focus:outline-none"
                      />
                    </div>
                    <p className="mt-3 border-t border-[var(--line-subtle)] pt-2.5 text-[12.5px] text-[var(--ink-muted)]">
                      Pengujian di atas berjalan lokal pada peramban dan tidak mengubah catatan segel asli.
                    </p>
                  </BotanicalCard>

                  <BotanicalCard className="flex h-full flex-col justify-between p-5 lg:col-span-5">
                    <div>
                      <h2 className="xb-display text-[18px] font-bold text-[var(--ink)]">
                        Daftar Blok Rantai Segel
                      </h2>
                      <p className="mt-0.5 text-[13.5px] text-[var(--ink-muted)]">
                        Pilih entri lain untuk memverifikasi tautan antar blok.
                      </p>
                      <div className="mt-3 space-y-2">
                        {verificationRecords.map((item) => {
                          const itemStatus = item.tampered
                            ? {
                                label: "Bermasalah",
                                cls: "bg-[var(--status-blocked-bg)] text-[var(--status-blocked-ink)]",
                              }
                            : item.eas_uid
                            ? {
                                label: "EAS Terkunci",
                                cls: "bg-[var(--seal-100)] text-[var(--seal-700)]",
                              }
                            : {
                                label: "Menunggu",
                                cls: "bg-[var(--status-warning-bg)] text-[var(--status-warning-ink)]",
                              };
                          return (
                            <button
                              key={item.record_id}
                              type="button"
                              onClick={() => quickSelectQuery(String(item.block_index))}
                              className={`xbm-pressable flex min-h-[52px] w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left transition ${
                                String(activeQuery) === String(item.block_index)
                                  ? "border-[var(--seal-600)] bg-[var(--seal-100)]/70"
                                  : "border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-soft)]"
                              }`}
                            >
                              <div className="min-w-0">
                                <p className="xb-mono text-[13.5px] font-bold text-[var(--ink)]">
                                  Blok #{item.block_index} · {item.parcel_id}
                                </p>
                                <p className="xb-mono truncate text-[12.5px] text-[var(--ink-muted)]">
                                  {shortHash(item.hash)}
                                </p>
                              </div>
                              <span
                                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${itemStatus.cls}`}
                              >
                                {itemStatus.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-3 border-t border-[var(--line)] pt-3">
                      <Link
                        href="/bantuan"
                        className="inline-flex min-h-[38px] items-center gap-2 text-[13.5px] font-semibold text-[var(--seal-700)] hover:underline"
                      >
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        <span>Pelajari cara kerja SHA-256 dan EAS di Bantuan</span>
                      </Link>
                    </div>
                  </BotanicalCard>
                </div>
              )}
            </>
          )}
        </PageStatePanel>
      </div>
    </BotanicalAppShell>
  );
}
