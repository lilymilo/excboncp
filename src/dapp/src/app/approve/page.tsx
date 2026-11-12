"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  Info,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "@/components/dapp/AppShell";
import {
  Button,
  Card,
  Disclosure,
  EmptyState,
  StatusPill,
  buttonClass,
  cx,
  formatNumber,
} from "@/components/dapp/phantom-ui";
import { useDashboardState } from "@/components/dapp/useDashboardStore";
import { runIntegrityChecks, summarizeChecks, type IntegrityCheck } from "@/lib/verification";
import { normalizeUserRole, type VerificationRecord } from "@/context/DappContext";

type QueueFilter = "all" | "ready" | "blocked";
type VerdictItem = {
  id: string;
  label: string;
  state: "ok" | "warn" | "info";
  detail: string;
};

type Evaluation = {
  record: VerificationRecord;
  integrity: IntegrityCheck[];
  business: VerdictItem[];
  warns: number;
  blocked: boolean;
};

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export default function ApprovePage() {
  const {
    user,
    parcels,
    sensors,
    aiAssessments,
    consentRecords,
    verificationRecords,
    switchDemoRole,
    reviewVerification,
  } = useDashboardState();

  const [selectedId, setSelectedId] = useState<string | null>(
    verificationRecords[0]?.record_id ?? null
  );
  const [filter, setFilter] = useState<QueueFilter>("all");
  const [noteInput, setNoteInput] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const role = normalizeUserRole(user?.role, user?.email);
  const isAuditor = role === "auditor";

  const evaluations = useMemo<Evaluation[]>(() => {
    return verificationRecords.map((record) => {
      const parcel = parcels.find((item) => item.id === record.parcel_id);
      const consent = consentRecords.find((item) => item.parcel_id === record.parcel_id);
      const assessment = aiAssessments.find((item) => item.parcel_id === record.parcel_id);
      const parcelSensors = sensors.filter((item) => item.parcel_id === record.parcel_id);
      const integrity = runIntegrityChecks(record, verificationRecords);

      const business: VerdictItem[] = [
        {
          id: "status",
          label: "Status verifikasi parcel",
          state: parcel?.verificationStatus === "verified" ? "ok" : "warn",
          detail: parcel
            ? parcel.verificationStatus === "verified"
              ? "Parcel lolos syarat awal terverifikasi."
              : `Status saat ini ${parcel.verificationStatus.toUpperCase()}.`
            : "Parcel tidak ditemukan.",
        },
        {
          id: "consent",
          label: "Persetujuan komunitas (FPIC)",
          state: consent?.status === "granted" ? "ok" : "warn",
          detail:
            consent?.status === "granted"
              ? `${consent.receipt_id} · ${consent.community}.`
              : "Belum ada persetujuan aktif dari warga.",
        },
        {
          id: "ai",
          label: "Penilaian AI MRV",
          state: assessment?.status === "passed" ? "ok" : "warn",
          detail: assessment
            ? assessment.status === "passed"
              ? `Normal · skor anomali ${assessment.ai2_score.toFixed(2)}.`
              : `${assessment.ai2_anomaly} · skor ${assessment.ai2_score.toFixed(2)}.`
            : "Evaluasi AI belum dijalankan.",
        },
        {
          id: "iot",
          label: "Kesehatan sensor IoT",
          state:
            parcelSensors.length > 0 && !parcelSensors.some((s) => s.anomaly || s.flameDetected)
              ? "ok"
              : "warn",
          detail:
            parcelSensors.length > 0
              ? `${parcelSensors.length} sensor melapor`
              : "Tidak ada data sensor lapangan.",
        },
      ];

      const warns = [...integrity, ...business].filter((item) => item.state === "warn").length;
      return { record, integrity, business, warns, blocked: warns > 0 };
    });
  }, [aiAssessments, consentRecords, parcels, sensors, verificationRecords]);

  const visibleEvaluations = useMemo(() => {
    if (filter === "all") return evaluations;
    return evaluations.filter((item) => (filter === "ready" ? !item.blocked : item.blocked));
  }, [evaluations, filter]);

  const selected = useMemo(
    () =>
      visibleEvaluations.find((item) => item.record.record_id === selectedId) ??
      visibleEvaluations[0] ??
      evaluations[0],
    [evaluations, selectedId, visibleEvaluations]
  );

  const selectedParcel = selected
    ? parcels.find((item) => item.id === selected.record.parcel_id)
    : undefined;
  const selectedIntegrity = selected ? summarizeChecks(selected.integrity) : null;

  const handleDecision = (decision: "verified" | "flagged") => {
    if (!selected) return;
    const res = reviewVerification(selected.record.record_id, decision, noteInput);
    setFeedback(res);
    if (res.ok) setNoteInput("");
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-semibold tracking-[-0.025em] text-[#F4F5F2] sm:text-[30px]">
              Auditor Cockpit
            </h1>
            <p className="mt-1.5 max-w-[62ch] text-[14px] leading-relaxed text-[#A6ADA7]">
              Verifikasi kecocokan rantai hash, bukti satelit, telemetri IoT, dan persetujuan FPIC
              sebelum mengesahkan attestation Base Sepolia.
            </p>
          </div>
          <Link href="/verify" className={buttonClass("secondary", "rounded-xl")}>
            Buka Ledger Hash
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>

        {!isAuditor ? (
          <Card className="p-8">
            <div className="mx-auto flex max-w-[460px] flex-col items-center text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl border border-[#F2B84B]/40 bg-[#F2B84B]/12 text-[#F2B84B]">
                <Lock className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-[18px] font-semibold text-[#F4F5F2]">
                Akses Khusus Peran Auditor MRV
              </h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[#A6ADA7]">
                Saat ini Anda aktif sebagai <strong className="text-[#F4F5F2]">{role}</strong>. Hanya
                Auditor MRV yang dapat meninjau dan menyegel bukti verifikasi.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                <Button
                  variant="lavender"
                  onClick={() => switchDemoRole("auditor")}
                  className="rounded-full px-6"
                >
                  Aktifkan Demo Auditor MRV
                </Button>
                <Link href="/app" className={buttonClass("secondary", "rounded-full px-5")}>
                  Kembali ke Dashboard
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <section className="grid gap-5 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
            {/* Queue List */}
            <Card className="overflow-hidden">
              <div className="border-b border-[#252B27] p-4">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "all" as const, label: "Semua" },
                    { id: "ready" as const, label: "Siap Disegel" },
                    { id: "blocked" as const, label: "Perlu Cek" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      aria-pressed={filter === opt.id}
                      onClick={() => setFilter(opt.id)}
                      className={cx(
                        "min-h-[40px] rounded-xl border px-3 text-[12px] font-medium",
                        filter === opt.id
                          ? "border-[#AA9AF5]/60 bg-[#AA9AF5]/16 text-[#F4F5F2]"
                          : "border-[#39423C] bg-[#1D211E] text-[#A6ADA7] hover:text-[#F4F5F2]"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {visibleEvaluations.length === 0 ? (
                <EmptyState
                  title="Antrean kosong"
                  body="Tidak ada record verifikasi pada filter yang dipilih."
                />
              ) : (
                <div className="divide-y divide-[#252B27]">
                  {visibleEvaluations.map((ev) => {
                    const p = parcels.find((item) => item.id === ev.record.parcel_id);
                    const active = selected?.record.record_id === ev.record.record_id;
                    return (
                      <button
                        key={ev.record.record_id}
                        type="button"
                        onClick={() => {
                          setSelectedId(ev.record.record_id);
                          setFeedback(null);
                        }}
                        aria-pressed={active}
                        className={cx(
                          "flex min-h-[72px] w-full items-start justify-between gap-3 px-4 py-3.5 text-left",
                          active ? "bg-[#1D211E]" : "hover:bg-[#1D211E]"
                        )}
                      >
                        <div className="min-w-0">
                          <p className="font-mono text-[12px] font-semibold text-[#AA9AF5]">
                            Blok #{ev.record.block_index} · {ev.record.parcel_id}
                          </p>
                          <p className="mt-0.5 truncate text-[14px] font-semibold text-[#F4F5F2]">
                            {p?.name ?? ev.record.parcel_id}
                          </p>
                          <p className="mt-0.5 text-[12px] text-[#A6ADA7]">
                            {formatDateTime(ev.record.timestamp)}
                          </p>
                        </div>
                        <StatusPill
                          status={ev.blocked ? "warning" : "verified"}
                          label={ev.blocked ? `${ev.warns} catatan` : "Lolos"}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Evidence Evaluation & Seal Action */}
            {selected ? (
              <Card className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#252B27] pb-4">
                  <div>
                    <p className="font-mono text-[12px] font-medium text-[#AA9AF5]">
                      Blok #{selected.record.block_index} · {selected.record.record_id}
                    </p>
                    <h2 className="mt-1 text-[19px] font-semibold text-[#F4F5F2]">
                      {selectedParcel?.name ?? selected.record.parcel_id}
                    </h2>
                  </div>
                  <StatusPill
                    status={selected.blocked ? "warning" : "verified"}
                    label={selected.blocked ? "Butuh Verifikasi" : "Siap Segel EAS"}
                  />
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div>
                    <p className="mb-2.5 text-[13px] font-semibold text-[#F4F5F2]">
                      Kepatuhan Bisnis &amp; Lapangan
                    </p>
                    <ul className="divide-y divide-[#252B27] rounded-xl border border-[#252B27] bg-[#090B0A]">
                      {selected.business.map((item) => {
                        const Icon = item.state === "ok" ? CheckCircle2 : CircleAlert;
                        return (
                          <li key={item.id} className="flex items-start gap-2.5 px-3.5 py-3">
                            <Icon
                              className={cx(
                                "mt-0.5 h-4 w-4 shrink-0",
                                item.state === "ok" ? "text-[#72C99A]" : "text-[#F2B84B]"
                              )}
                              aria-hidden="true"
                            />
                            <div className="min-w-0">
                              <p className="text-[13px] font-medium text-[#F4F5F2]">{item.label}</p>
                              <p className="text-[12px] text-[#A6ADA7]">{item.detail}</p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div>
                    <p className="mb-2.5 text-[13px] font-semibold text-[#F4F5F2]">
                      Integritas Rantai SHA-256 ({selectedIntegrity?.ok ?? 0}/{selected.integrity.length})
                    </p>
                    <ul className="divide-y divide-[#252B27] rounded-xl border border-[#252B27] bg-[#090B0A]">
                      {selected.integrity.map((item) => {
                        const Icon =
                          item.state === "ok"
                            ? CheckCircle2
                            : item.state === "warn"
                              ? CircleAlert
                              : Info;
                        return (
                          <li key={item.id} className="flex items-start gap-2.5 px-3.5 py-2.5">
                            <Icon
                              className={cx(
                                "mt-0.5 h-4 w-4 shrink-0",
                                item.state === "ok"
                                  ? "text-[#72C99A]"
                                  : item.state === "warn"
                                    ? "text-[#F2B84B]"
                                    : "text-[#AA9AF5]"
                              )}
                              aria-hidden="true"
                            />
                            <div className="min-w-0">
                              <p className="text-[12.5px] font-medium text-[#F4F5F2]">{item.label}</p>
                              <p className="text-[12px] text-[#A6ADA7]">{item.detail}</p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                {/* Auditor Decision Controls */}
                <div className="mt-6 space-y-3 border-t border-[#252B27] pt-5">
                  <label htmlFor="audit-note" className="block text-[13px] font-medium text-[#A6ADA7]">
                    Catatan Auditor (opsional)
                  </label>
                  <input
                    id="audit-note"
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Contoh: Citra Sentinel & tanda terima FPIC terkonfirmasi…"
                    className="min-h-[44px] w-full rounded-xl border border-[#39423C] bg-[#090B0A] px-3.5 text-[13px] text-[#F4F5F2] placeholder:text-[#8B948D]"
                  />

                  {feedback && (
                    <div
                      className={cx(
                        "flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[13px]",
                        feedback.ok
                          ? "border-[#72C99A]/40 bg-[#23865A]/18 text-[#72C99A]"
                          : "border-[#ED7770]/40 bg-[#ED7770]/12 text-[#ED7770]"
                      )}
                    >
                      {feedback.ok ? (
                        <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                      )}
                      <span>{feedback.message}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 pt-1">
                    <Button
                      variant="lavender"
                      onClick={() => handleDecision("verified")}
                      className="rounded-full px-6"
                    >
                      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                      Sahkan &amp; Segel Verifikasi
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleDecision("flagged")}
                      className="rounded-full px-5"
                    >
                      Tandai Pemeriksaan Ulang
                    </Button>
                  </div>
                </div>
              </Card>
            ) : null}
          </section>
        )}

        <Disclosure />
      </div>
    </AppShell>
  );
}
