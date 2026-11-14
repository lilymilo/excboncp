"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Cpu,
  Lock,
  Radio,
  Satellite,
  ShieldCheck,
  X,
} from "lucide-react";
import { BotanicalAppShell } from "@/components/dapp/BotanicalAppShell";
import {
  BotanicalCard,
  BotanicalPageHeader,
  BotanicalReceiptCard,
  CanonicalStatusBadge,
  ConsentStatusBadge,
  PageStatePanel,
  RoleRestrictedNotice,
} from "@/components/dapp/BotanicalPrimitives";
import { LiveNumber, PulseDot } from "@/components/motion";
import {
  useDashboardState,
  type ExtendedVerificationRecord,
} from "@/components/dapp/useDashboardStore";
import { normalizeUserRole } from "@/context/DappContext";
import { formatWibDateTime, toCanonicalStatus } from "@/lib/dashboard-helpers";
import { runIntegrityChecks } from "@/lib/verification";
import { Pagination } from "@/components/ui/Pagination";

type AuditFilter = "all" | "pending" | "verified" | "flagged";
const REVIEW_PAGE_SIZE = 5;

function shortHash(value?: string | null): string {
  if (!value) return "-";
  if (value.length <= 16) return value;
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

export function TinjauView() {
  const searchParams = useSearchParams();
  const stateParam = searchParams.get("state");
  const {
    user,
    parcels,
    sensors,
    aiAssessments,
    consentRecords,
    verificationRecords,
    overrides,
    isLoading,
    reviewVerification,
  } = useDashboardState();

  const role = normalizeUserRole(user?.role, user?.email);
  const [filter, setFilter] = useState<AuditFilter>("all");
  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    verificationRecords[0]?.record_id ?? "VR-001"
  );
  const [auditNote, setAuditNote] = useState("");
  const [confirmDecision, setConfirmDecision] = useState<"verified" | "flagged" | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [recordPage, setRecordPage] = useState(1);

  const getRecordReviewStatus = (rec: ExtendedVerificationRecord): "verified" | "flagged" | "pending" => {
    const manual = overrides.verificationReviewOverrides[rec.record_id];
    if (manual) return manual.decision;
    if (rec.tampered || rec.reasons.length > 0) return "flagged";
    if (rec.eas_uid && rec.approved_by !== "Menunggu Audit") return "verified";
    return "pending";
  };

  const filteredRecords = useMemo(() => {
    return verificationRecords.filter((rec) => {
      if (filter === "all") return true;
      return getRecordReviewStatus(rec) === filter;
    });
  }, [verificationRecords, overrides.verificationReviewOverrides, filter]);
  const totalRecordPages = Math.max(1, Math.ceil(filteredRecords.length / REVIEW_PAGE_SIZE));
  const safeRecordPage = Math.min(recordPage, totalRecordPages);
  const visibleRecords = filteredRecords.slice((safeRecordPage - 1) * REVIEW_PAGE_SIZE, safeRecordPage * REVIEW_PAGE_SIZE);
  const selectRecord = (recordId: string) => {
    setSelectedRecordId(recordId);
    const index = filteredRecords.findIndex((record) => record.record_id === recordId);
    if (index >= 0) setRecordPage(Math.floor(index / REVIEW_PAGE_SIZE) + 1);
  };
  useEffect(() => {
    if (recordPage > totalRecordPages) setRecordPage(totalRecordPages);
  }, [recordPage, totalRecordPages]);

  const activeRecord = useMemo(
    () =>
      filteredRecords.find((r) => r.record_id === selectedRecordId) ??
      filteredRecords[0] ??
      verificationRecords[0],
    [filteredRecords, selectedRecordId, verificationRecords]
  );

  const activeParcel = useMemo(
    () => parcels.find((p) => p.id === activeRecord?.parcel_id),
    [parcels, activeRecord]
  );

  const activeConsent = useMemo(
    () => consentRecords.find((c) => c.parcel_id === activeRecord?.parcel_id),
    [consentRecords, activeRecord]
  );

  const activeSensors = useMemo(
    () => sensors.filter((s) => s.parcel_id === activeRecord?.parcel_id),
    [sensors, activeRecord]
  );

  const activeAi = useMemo(
    () => aiAssessments.find((a) => a.parcel_id === activeRecord?.parcel_id),
    [aiAssessments, activeRecord]
  );

  const integrityChecks = useMemo(() => {
    if (!activeRecord) return [];
    return runIntegrityChecks(activeRecord, verificationRecords);
  }, [activeRecord, verificationRecords]);

  const hasWarnIntegrity = integrityChecks.some((c) => c.state === "warn");
  const pageState: "loading" | "empty" | "error" | "ready" =
    stateParam === "loading" || isLoading
      ? "loading"
      : stateParam === "error"
      ? "error"
      : stateParam === "empty" || !activeRecord
      ? "empty"
      : "ready";

  const handleConfirmDecision = () => {
    if (!activeRecord || !confirmDecision) return;
    const res = reviewVerification(activeRecord.record_id, confirmDecision, auditNote);
    setFeedback(res);
    setConfirmDecision(null);
  };

  if (role !== "auditor") {
    return (
      <BotanicalAppShell>
        <div className="space-y-4">
          <BotanicalPageHeader
            title="Tinjau & Sahkan Bukti (Auditor)"
            description="Pemeriksaan bukti lapangan dan penguncian blok oleh Auditor MRV sebelum unit terbuka penuh."
          />
          <RoleRestrictedNotice
            title="Khusus Peran Auditor MRV"
            reason="Keputusan pengesahan atau penahanan bukti blok hanya dapat dilakukan oleh Auditor MRV. Untuk memeriksa keaslian segel secara publik, gunakan halaman Verifikasi."
          />
        </div>
      </BotanicalAppShell>
    );
  }

  const verifiedCount = verificationRecords.filter((r) => getRecordReviewStatus(r) === "verified").length;
  const flaggedOrPendingCount = verificationRecords.length - verifiedCount;

  return (
    <BotanicalAppShell>
      <div key={retryKey} className="space-y-4">
        <BotanicalPageHeader
          title="Tinjau & Sahkan Bukti (Auditor)"
          description="Bandingkan telemetri sensor, indeks satelit NDVI, status izin warga, dan kecocokan rantai hash. Penilaian AI hanya bersifat informasi pembantu."
          actions={
            activeRecord && (
              <Link
                href={`/verifikasi/${activeRecord.block_index}`}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-[var(--seal-line)] bg-[var(--seal-100)] px-4 text-[13.5px] font-semibold text-[var(--seal-700)] transition hover:bg-[var(--surface-soft)]"
              >
                <span>Buka pemeriksa hash</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )
          }
        />

        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          <BotanicalCard interactive className="p-4">
            <p className="text-[12.5px] font-semibold text-[var(--ink-muted)]">Total Blok Antrean</p>
            <p className="xb-numeric mt-1 text-[23px] font-bold text-[var(--ink)]">
              <LiveNumber value={verificationRecords.length} format={(val: number) => `${Math.round(val)} blok`} />
            </p>
            <p className="mt-0.5 text-[12.5px] text-[var(--ink-muted)]">Terhubung ke rantai SHA-256</p>
          </BotanicalCard>

          <BotanicalCard interactive className="p-4">
            <p className="text-[12.5px] font-semibold text-[var(--ink-muted)]">Disahkan Auditor</p>
            <p className="xb-numeric mt-1 text-[23px] font-bold text-[var(--status-verified-ink)]">
              <LiveNumber value={verifiedCount} format={(val: number) => `${Math.round(val)} blok`} />
            </p>
            <p className="mt-0.5 text-[12.5px] text-[var(--ink-muted)]">EAS Base Sepolia terkunci</p>
          </BotanicalCard>

          <BotanicalCard interactive className="p-4">
            <p className="text-[12.5px] font-semibold text-[var(--ink-muted)]">Perlu Pemeriksaan</p>
            <p className="xb-numeric mt-1 text-[23px] font-bold text-[var(--status-warning-ink)]">
              <LiveNumber value={flaggedOrPendingCount} format={(val: number) => `${Math.round(val)} blok`} />
            </p>
            <p className="mt-0.5 text-[12.5px] text-[var(--ink-muted)]">Menunggu audit / ditahan</p>
          </BotanicalCard>

          <BotanicalCard interactive className="p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[12.5px] font-semibold text-[var(--ink-muted)]">Node Sensor Aktif</p>
              <PulseDot className="text-[var(--forest-700)]" pulsing label="Telemetri aktif" />
            </div>
            <p className="xb-numeric mt-1 text-[23px] font-bold text-[var(--forest-700)]">
              <LiveNumber value={sensors.length} format={(val: number) => `${Math.round(val)} sensor`} />
            </p>
            <p className="mt-0.5 text-[12.5px] text-[var(--ink-muted)]">Pembaruan telemetri tiap 4 detik</p>
          </BotanicalCard>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "all", label: "Semua antrean" },
              { id: "pending", label: "Menunggu" },
              { id: "verified", label: "Disahkan" },
              { id: "flagged", label: "Ditahan" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setFilter(tab.id); setRecordPage(1); }}
              className={`xbm-pressable inline-flex min-h-[38px] items-center rounded-full border px-4 text-[13.5px] font-semibold transition ${
                filter === tab.id
                  ? "border-[var(--forest-700)] bg-[var(--forest-700)] text-white"
                  : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-soft)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <PageStatePanel
          state={pageState}
          onRetry={() => setRetryKey((k) => k + 1)}
          emptyTitle="Tidak ada antrean pemeriksaan pada filter ini"
          emptyDescription="Coba pilih tab 'Semua antrean' untuk melihat seluruh catatan verifikasi."
        >
          {feedback && (
            <div
              role="status"
              className={`rounded-2xl border p-3.5 text-[14.5px] font-medium ${
                feedback.ok
                  ? "border-[var(--status-verified-line)] bg-[var(--status-verified-bg)] text-[var(--status-verified-ink)]"
                  : "border-[var(--status-blocked-line)] bg-[var(--status-blocked-bg)] text-[var(--status-blocked-ink)]"
              }`}
            >
              {feedback.message}
            </div>
          )}

          {activeRecord && (
            <div className="grid gap-4 lg:grid-cols-12">
              <BotanicalCard className="flex flex-col justify-between p-4 lg:col-span-4 lg:sticky lg:top-20 lg:self-start">
                <div>
                  <h2 className="xb-display text-[17.5px] font-bold text-[var(--ink)]">
                    Daftar Catatan ({filteredRecords.length})
                  </h2>
                  <div className="mt-2.5 space-y-2">
                    {visibleRecords.map((rec) => {
                      const parcel = parcels.find((p) => p.id === rec.parcel_id);
                      const selected = rec.record_id === activeRecord.record_id;
                      const recStatus = getRecordReviewStatus(rec);
                      const badgeStyle =
                        recStatus === "verified"
                          ? {
                              label: "Disahkan",
                              cls: "bg-[var(--status-verified-bg)] text-[var(--status-verified-ink)]",
                            }
                          : recStatus === "flagged"
                          ? {
                              label: "Ditahan",
                              cls: "bg-[var(--status-blocked-bg)] text-[var(--status-blocked-ink)]",
                            }
                          : {
                              label: "Menunggu",
                              cls: "bg-[var(--status-warning-bg)] text-[var(--status-warning-ink)]",
                            };
                      return (
                        <button
                          key={rec.record_id}
                          type="button"
                          onClick={() => selectRecord(rec.record_id)}
                          className={`xbm-pressable w-full rounded-2xl border p-3.5 text-left transition ${
                            selected
                              ? "border-[var(--forest-700)] bg-[var(--leaf-100)]/65"
                              : "border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-soft)]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="xb-mono text-[13px] font-bold text-[var(--ink)]">
                              Blok #{rec.block_index}
                            </span>
                            <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${badgeStyle.cls}`}>
                              {badgeStyle.label}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[14.5px] font-semibold text-[var(--ink)]">
                            {parcel?.name ?? rec.parcel_id}
                          </p>
                          <p className="xb-mono mt-0.5 text-[12.5px] text-[var(--ink-muted)]">
                            {shortHash(rec.hash)} · {formatWibDateTime(rec.timestamp)}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  <Pagination
                    page={safeRecordPage}
                    pageSize={REVIEW_PAGE_SIZE}
                    totalItems={filteredRecords.length}
                    onPageChange={setRecordPage}
                    label="Halaman antrean audit"
                    className="mt-3"
                  />
                </div>
                <p className="mt-3 border-t border-[var(--line-subtle)] pt-2.5 text-[12.5px] text-[var(--ink-muted)]">
                  Pilih blok pada antrean untuk meninjau bukti sensor, NDVI, dan rantai segel sebelum keputusan.
                </p>
              </BotanicalCard>

              <div className="space-y-4 lg:col-span-8">
                <BotanicalCard className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="xb-mono text-[13px] font-semibold text-[var(--seal-700)]">
                          Blok #{activeRecord.block_index} · {activeRecord.record_id}
                        </span>
                        {activeParcel && (
                          <CanonicalStatusBadge
                            status={toCanonicalStatus(activeParcel.verificationStatus)}
                            compact
                          />
                        )}
                      </div>
                      <h2 className="xb-display mt-1 text-[20px] font-bold text-[var(--ink)]">
                        {activeParcel?.name ?? activeRecord.parcel_id}
                      </h2>
                    </div>
                    {activeConsent && <ConsentStatusBadge status={activeConsent.status} compact />}
                  </div>

                  <div className="mt-4 grid gap-3.5 md:grid-cols-2">
                    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-3.5">
                      <div className="flex items-center gap-2 text-[14px] font-bold text-[var(--ink)]">
                        <Radio className="h-4 w-4 text-[var(--forest-700)]" aria-hidden="true" />
                        <span>Bukti Telemetri Sensor ({activeSensors.length} node)</span>
                      </div>
                      <div className="mt-2.5 space-y-2 text-[13.5px]">
                        {activeSensors.length > 0 ? (
                          activeSensors.map((s) => (
                            <div
                              key={s.sensor_id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--line-subtle)] bg-[var(--surface)] px-3 py-2"
                            >
                              <span className="xb-mono font-semibold text-[var(--ink)]">
                                {s.sensor_id}
                              </span>
                              <span className="xb-numeric text-[var(--ink-muted)]">
                                <LiveNumber
                                  value={s.temperature}
                                  format={(val: number) => `${val.toFixed(1)}°C`}
                                />{" "}
                                · RH{" "}
                                <LiveNumber
                                  value={s.humidity}
                                  format={(val: number) => `${Math.round(val)}%`}
                                />{" "}
                                · Tanah{" "}
                                <LiveNumber
                                  value={s.soil_moisture}
                                  format={(val: number) => `${Math.round(val)}%`}
                                />
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-[var(--ink-muted)]">Belum ada bacaan sensor terkait.</p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-3.5">
                      <div className="flex items-center gap-2 text-[14px] font-bold text-[var(--ink)]">
                        <Satellite className="h-4 w-4 text-[var(--forest-700)]" aria-hidden="true" />
                        <span>Satelit NDVI & Catatan AI</span>
                      </div>
                      <p className="mt-2 text-[14px] text-[var(--ink)]">
                        NDVI terkini:{" "}
                        <span className="xb-numeric font-bold">
                          {typeof activeParcel?.ndvi === "number" ? (
                            <LiveNumber
                              value={activeParcel.ndvi}
                              format={(val: number) => val.toFixed(2)}
                            />
                          ) : (
                            "-"
                          )}
                        </span>{" "}
                        <span className="text-[var(--ink-muted)]">(ambang sehat ≥ 0,70)</span>
                      </p>
                      {activeAi && (
                        <div className="mt-2 rounded-xl border border-[var(--seal-line)] bg-[var(--seal-100)]/60 p-2.5 text-[13px] leading-relaxed text-[var(--ink)]">
                          <p className="flex items-center gap-1.5 font-semibold text-[var(--seal-700)]">
                            <Cpu className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Catatan AI (hanya pembantu, keputusan milik Auditor):</span>
                          </p>
                          <p className="mt-0.5 text-[var(--ink-muted)]">{activeAi.ai1_summary}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3.5">
                    <div className="flex items-center gap-2 text-[14px] font-bold text-[var(--ink)]">
                      <ShieldCheck className="h-4 w-4 text-[var(--seal-600)]" aria-hidden="true" />
                      <span>Hasil Pemeriksaan Rantai Segel</span>
                    </div>
                    <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                      {integrityChecks.map((check) => {
                        const checkBadge =
                          check.state === "ok"
                            ? {
                                label: "Cocok",
                                cls: "bg-[var(--status-verified-bg)] text-[var(--status-verified-ink)]",
                              }
                            : check.state === "info"
                            ? {
                                label: "Info",
                                cls: "bg-[var(--seal-100)] text-[var(--seal-700)]",
                              }
                            : {
                                label: "Periksa",
                                cls: "bg-[var(--status-warning-bg)] text-[var(--status-warning-ink)]",
                              };
                        return (
                          <div
                            key={check.id}
                            className="flex items-start justify-between gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-2.5"
                          >
                            <div className="min-w-0">
                              <p className="text-[13.5px] font-semibold text-[var(--ink)]">
                                {check.label}
                              </p>
                              <p className="text-[12.5px] text-[var(--ink-muted)]">{check.detail}</p>
                            </div>
                            <span
                              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[12px] font-bold ${checkBadge.cls}`}
                            >
                              {checkBadge.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 border-t border-[var(--line)] pt-4">
                    <label
                      htmlFor="auditor-decision-note"
                      className="block text-[13.5px] font-semibold text-[var(--ink)]"
                    >
                      Catatan pemeriksaan Auditor MRV
                    </label>
                    <textarea
                      id="auditor-decision-note"
                      rows={2}
                      value={auditNote}
                      onChange={(e) => setAuditNote(e.target.value)}
                      placeholder="Tuliskan hasil pemeriksaan sensor, foto lapangan, atau alasan keputusan..."
                      className="mt-1.5 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-2.5 text-[14px] text-[var(--ink)] focus:border-[var(--forest-700)] focus:bg-[var(--surface)] focus:outline-none"
                    />

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setConfirmDecision("verified")}
                        className="xbm-pressable inline-flex min-h-[42px] items-center gap-2 rounded-full bg-[var(--forest-700)] px-5 text-[14px] font-semibold text-white transition hover:bg-[var(--forest-800)]"
                      >
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        <span>Sahkan & segel blok</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDecision("flagged")}
                        className="xbm-pressable inline-flex min-h-[42px] items-center gap-2 rounded-full border border-[var(--status-blocked-line)] bg-[var(--status-blocked-bg)] px-5 text-[14px] font-semibold text-[var(--status-blocked-ink)] transition hover:brightness-95"
                      >
                        <Lock className="h-4 w-4" aria-hidden="true" />
                        <span>Tahan & tandai catatan</span>
                      </button>
                    </div>
                  </div>
                </BotanicalCard>

                <BotanicalReceiptCard
                  title={`Segel Blok #${activeRecord.block_index}`}
                  receiptId={activeRecord.record_id}
                  hash={activeRecord.hash}
                  timestampWib={formatWibDateTime(activeRecord.timestamp)}
                  details={`Status saat ini: ${
                    getRecordReviewStatus(activeRecord) === "verified"
                      ? "Disahkan oleh Auditor"
                      : getRecordReviewStatus(activeRecord) === "flagged"
                      ? "Ditahan untuk verifikasi lanjut"
                      : "Menunggu pengesahan"
                  }`}
                  verifyHref={`/verifikasi/${activeRecord.block_index}`}
                />
              </div>
            </div>
          )}
        </PageStatePanel>

        <DialogPrimitive.Root
          open={confirmDecision !== null}
          onOpenChange={(open) => {
            if (!open) setConfirmDecision(null);
          }}
        >
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="xb-botanical fixed inset-0 z-50 bg-[var(--overlay-scrim)]" />
            <DialogPrimitive.Content
              aria-label="Konfirmasi keputusan auditor"
              className="xb-botanical fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl focus:outline-none"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
                      confirmDecision === "flagged" || hasWarnIntegrity
                        ? "bg-[var(--status-blocked-bg)] text-[var(--status-blocked-ink)]"
                        : "bg-[var(--status-verified-bg)] text-[var(--status-verified-ink)]"
                    }`}
                  >
                    {confirmDecision === "flagged" ? (
                      <AlertTriangle className="h-6 w-6" aria-hidden="true" />
                    ) : (
                      <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <DialogPrimitive.Title className="xb-display text-[20px] font-bold text-[var(--ink)]">
                      {confirmDecision === "verified"
                        ? "Sahkan bukti blok ini?"
                        : "Tahan bukti untuk verifikasi ulang?"}
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Description className="text-[14px] text-[var(--ink-muted)]">
                      {activeRecord?.record_id} · {activeParcel?.name}
                    </DialogPrimitive.Description>
                  </div>
                </div>
                <DialogPrimitive.Close
                  aria-label="Tutup dialog"
                  className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] text-[var(--ink)] hover:bg-[var(--leaf-100)]"
                >
                  <X className="h-5 w-5" />
                </DialogPrimitive.Close>
              </div>

              <p className="mt-4 text-[15px] leading-relaxed text-[var(--ink-muted)]">
                {confirmDecision === "verified"
                  ? "Keputusan ini mencatat nama Anda sebagai Auditor pengesah pada rantai bukti simulasi."
                  : "Menahan blok akan menandai lahan perlu pemeriksaan lanjut dan mencegah simulasi alokasi baru."}
              </p>

              {confirmDecision === "verified" && (hasWarnIntegrity || activeConsent?.status !== "granted") && (
                <div className="mt-3 rounded-2xl border border-[var(--status-blocked-line)] bg-[var(--status-blocked-bg)] p-3.5 text-[14.5px] font-medium text-[var(--status-blocked-ink)]">
                  Perhatian: Terdapat pemeriksaan integritas yang perlu ditinjau atau izin warga belum aktif pada lahan ini. Pastikan pengesahan memang disengaja.
                </div>
              )}

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <DialogPrimitive.Close className="inline-flex min-h-[44px] items-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 text-[14.5px] font-semibold text-[var(--ink)] hover:bg-[var(--surface-soft)]">
                  Batal
                </DialogPrimitive.Close>
                <button
                  type="button"
                  onClick={handleConfirmDecision}
                  className={`inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 text-[14.5px] font-semibold text-white transition ${
                    confirmDecision === "flagged"
                      ? "bg-[var(--status-blocked-ink)] hover:brightness-95"
                      : "bg-[var(--forest-700)] hover:bg-[var(--forest-800)]"
                  }`}
                >
                  <span>
                    {confirmDecision === "verified" ? "Ya, sahkan blok" : "Ya, tahan catatan"}
                  </span>
                </button>
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </div>
    </BotanicalAppShell>
  );
}
