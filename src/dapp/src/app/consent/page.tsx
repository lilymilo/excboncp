"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  Info,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/dapp/AppShell";
import {
  Button,
  Card,
  Disclosure,
  StatusPill,
  buttonClass,
  cx,
  formatNumber,
} from "@/components/dapp/phantom-ui";
import { useDashboardState } from "@/components/dapp/useDashboardStore";
import { normalizeUserRole, type ConsentStatus } from "@/context/DappContext";

type ConsentFilter = "all" | "granted" | "missing";

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function consentPill(status: ConsentStatus) {
  if (status === "granted") return <StatusPill status="verified" label="Izin Aktif" />;
  if (status === "revoked") return <StatusPill status="blocked" label="Izin Dicabut" />;
  return <StatusPill status="pending" label="Belum Ada Izin" />;
}

export default function ConsentPage() {
  const {
    user,
    parcels,
    sensors,
    aiAssessments,
    consentRecords,
    verificationRecords,
    toggleConsentDecision,
    switchDemoRole,
  } = useDashboardState();

  const [selectedId, setSelectedId] = useState<string | null>(parcels[0]?.id ?? null);
  const [filter, setFilter] = useState<ConsentFilter>("all");
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const role = normalizeUserRole(user?.role, user?.email);
  const isCommunity = role === "community";

  const visibleParcels = useMemo(() => {
    if (filter === "all") return parcels;
    return parcels.filter((parcel) => {
      const record = consentRecords.find((item) => item.parcel_id === parcel.id);
      const isGranted = record?.status === "granted";
      return filter === "granted" ? isGranted : !isGranted;
    });
  }, [consentRecords, filter, parcels]);

  const selected = useMemo(
    () =>
      visibleParcels.find((p) => p.id === selectedId) ??
      visibleParcels[0] ??
      parcels[0],
    [parcels, selectedId, visibleParcels]
  );

  const consent = selected
    ? consentRecords.find((record) => record.parcel_id === selected.id)
    : undefined;

  const stats = useMemo(() => {
    const granted = consentRecords.filter((item) => item.status === "granted").length;
    const total = parcels.length;
    return {
      granted,
      total,
      coveragePct: total > 0 ? Math.round((granted / total) * 100) : 0,
    };
  }, [consentRecords, parcels.length]);

  const coverage = useMemo(() => {
    if (!selected) return [];
    const parcelSensors = sensors.filter((s) => s.parcel_id === selected.id);
    const assessment = aiAssessments.find((a) => a.parcel_id === selected.id);
    const verification = verificationRecords.find((v) => v.parcel_id === selected.id);

    return [
      {
        id: "fpic",
        label: "Status persetujuan tertulis FPIC",
        state: consent?.status === "granted" ? "ok" : "warn",
        detail:
          consent?.status === "granted"
            ? `Aktif atas nama ${consent.community}.`
            : "Belum aktif; hak veto komunitas menahan perdagangan kredit.",
      },
      {
        id: "receipt",
        label: "Nomor tanda terima dokumen",
        state: consent?.receipt_id ? "ok" : "warn",
        detail: consent?.receipt_id
          ? `${consent.receipt_id} · tercatat ${formatDateTime(consent.timestamp)}.`
          : "Tanda terima belum diterbitkan.",
      },
      {
        id: "telemetry",
        label: "Ketersediaan node IoT",
        state: parcelSensors.length > 0 ? "ok" : "info",
        detail:
          parcelSensors.length > 0
            ? `${parcelSensors.length} node melapor (${parcelSensors.map((s) => s.sensor_id).join(", ")}).`
            : "Belum ada node sensor terpasang.",
      },
      {
        id: "ai",
        label: "Validasi citra satelit & AI",
        state: assessment?.status === "passed" ? "ok" : "warn",
        detail: assessment
          ? `${assessment.status === "passed" ? "Lolos" : "Peringatan"} · skor ${assessment.ai2_score.toFixed(2)}.`
          : "Evaluasi AI belum tercatat.",
      },
      {
        id: "ledger",
        label: "Catatan SHA-256 & EAS",
        state: verification ? "ok" : "info",
        detail: verification
          ? `Blok #${verification.block_index} tercatat di ledger.`
          : "Menunggu penerbitan blok verifikasi.",
      },
    ];
  }, [aiAssessments, consent, selected, sensors, verificationRecords]);

  const handleToggleConsent = (nextStatus: "granted" | "revoked") => {
    if (!selected) return;
    const res = toggleConsentDecision(selected.id, nextStatus);
    setFeedback(res);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-semibold tracking-[-0.025em] text-[#F4F5F2] sm:text-[30px]">
              Community Consent (FPIC)
            </h1>
            <p className="mt-1.5 max-w-[64ch] text-[14px] leading-relaxed text-[#A6ADA7]">
              Komunitas adat memegang kendali atas hak izin lahan. Pencabutan izin otomatis
              membekukan perdagangan kredit dan alokasi settlement pada parcel terkait.
            </p>
          </div>

          <div className="rounded-2xl border border-[#252B27] bg-[#151816] px-4 py-3">
            <p className="text-[12px] text-[#A6ADA7]">Cakupan izin aktif</p>
            <p className="mt-0.5 text-[20px] font-semibold text-[#72C99A] xb-numeric">
              {stats.granted}/{stats.total} parcel ({stats.coveragePct}%)
            </p>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          {/* Left Parcel Consent List */}
          <Card className="overflow-hidden">
            <div className="flex flex-wrap gap-1.5 border-b border-[#252B27] p-4">
              {[
                { id: "all" as const, label: "Semua" },
                { id: "granted" as const, label: "Aktif" },
                { id: "missing" as const, label: "Tertahan" },
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

            <div className="divide-y divide-[#252B27]">
              {visibleParcels.map((parcel) => {
                const record = consentRecords.find((item) => item.parcel_id === parcel.id);
                const active = selected?.id === parcel.id;
                return (
                  <button
                    key={parcel.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(parcel.id);
                      setFeedback(null);
                    }}
                    aria-pressed={active}
                    className={cx(
                      "flex min-h-[76px] w-full items-start justify-between gap-3 px-4 py-3.5 text-left",
                      active ? "bg-[#1D211E]" : "hover:bg-[#1D211E]"
                    )}
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-[12px] font-semibold text-[#72C99A]">
                        {parcel.id}
                      </p>
                      <p className="mt-0.5 truncate text-[14.5px] font-semibold text-[#F4F5F2]">
                        {parcel.name}
                      </p>
                      <p className="mt-0.5 truncate text-[12px] text-[#A6ADA7]">
                        {parcel.community} · {formatNumber(parcel.area)} ha
                      </p>
                    </div>
                    {consentPill(record?.status ?? "none")}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Right FPIC Inspector & Veto Controls */}
          {selected && (
            <Card className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#252B27] pb-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#72C99A]">
                    <Users className="h-4 w-4" aria-hidden="true" />
                    {selected.community}
                  </span>
                  <h2 className="mt-1 text-[20px] font-semibold text-[#F4F5F2]">{selected.name}</h2>
                </div>
                {consentPill(consent?.status ?? "none")}
              </div>

              <ul className="mt-5 divide-y divide-[#252B27] rounded-xl border border-[#252B27] bg-[#090B0A]">
                {coverage.map((item) => {
                  const Icon =
                    item.state === "ok" ? CheckCircle2 : item.state === "warn" ? CircleAlert : Info;
                  return (
                    <li key={item.id} className="flex items-start gap-3 px-4 py-3">
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
                        <p className="text-[13px] font-medium text-[#F4F5F2]">{item.label}</p>
                        <p className="mt-0.5 text-[12.5px] text-[#A6ADA7]">{item.detail}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {feedback && (
                <div
                  className={cx(
                    "mt-4 flex items-start gap-3 rounded-xl border px-4 py-3.5 text-[13px]",
                    feedback.ok
                      ? "border-[#72C99A]/40 bg-[#23865A]/18"
                      : "border-[#ED7770]/45 bg-[#ED7770]/12"
                  )}
                >
                  {feedback.ok ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#72C99A]" aria-hidden="true" />
                  ) : (
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#ED7770]" aria-hidden="true" />
                  )}
                  <p className={feedback.ok ? "text-[#72C99A]" : "text-[#ED7770]"}>
                    {feedback.message}
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#252B27] pt-5">
                {isCommunity ? (
                  <div className="flex flex-wrap gap-2.5">
                    {consent?.status === "granted" ? (
                      <Button
                        variant="danger"
                        onClick={() => handleToggleConsent("revoked")}
                        className="rounded-full px-5"
                      >
                        Gunakan Hak Veto (Cabut Izin)
                      </Button>
                    ) : (
                      <Button
                        variant="lavender"
                        onClick={() => handleToggleConsent("granted")}
                        className="rounded-full px-6"
                      >
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                        Aktifkan Persetujuan FPIC
                      </Button>
                    )}
                    <Link
                      href="/market"
                      className={buttonClass("secondary", "rounded-full px-5")}
                    >
                      Cek Efek di Pasar
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                    <p className="text-[12.5px] text-[#A6ADA7]">
                      Anda masuk sebagai <strong className="text-[#F4F5F2]">{role}</strong> (mode baca).
                      Ubah ke peran Komunitas untuk mencoba hak veto.
                    </p>
                    <Button
                      variant="secondary"
                      onClick={() => switchDemoRole("community")}
                      className="rounded-full"
                    >
                      Coba Peran Komunitas
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}
        </section>

        <Disclosure />
      </div>
    </AppShell>
  );
}
