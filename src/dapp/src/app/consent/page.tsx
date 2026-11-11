"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  CircleAlert,
  Copy,
  Info,
  Lock,
  MapPin,
  Radio,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/dapp/AppShell";
import {
  Button,
  Card,
  Chip,
  Disclosure,
  EmptyState,
  Metric,
  SectionLabel,
  StatusPill,
  TestnetBadge,
  buttonClass,
  cx,
  formatNumber,
} from "@/components/dapp/phantom-ui";
import {
  useDapp,
  type ConsentStatus,
  type UserRole,
} from "@/context/DappContext";

const ROLE_LABEL: Record<UserRole, string> = {
  community: "Komunitas",
  manager: "Pengelola",
  auditor: "Auditor",
  recipient: "Penerima Manfaat",
  guest: "Tamu",
};

type CoverageState = "ok" | "warn" | "info";

type CoverageItem = {
  id: string;
  label: string;
  state: CoverageState;
  detail: string;
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

function consentPill(status: ConsentStatus) {
  if (status === "granted") return <StatusPill status="verified" label="Diberikan" />;
  if (status === "revoked") return <StatusPill status="blocked" label="Dicabut" />;
  return <StatusPill status="pending" label="Belum ada" />;
}

function CoverageList({ items }: { items: CoverageItem[] }) {
  return (
    <ul className="divide-y divide-xb-line/40 rounded-lg border border-xb-line/60 bg-xb-bg">
      {items.map((item) => {
        const Icon =
          item.state === "ok" ? CheckCircle2 : item.state === "warn" ? CircleAlert : Info;
        const tone =
          item.state === "ok"
            ? "text-xb-verified"
            : item.state === "warn"
              ? "text-xb-warning"
              : "text-xb-tech";
        return (
          <li key={item.id} className="flex items-start gap-2 px-3 py-2.5">
            <Icon className={cx("mt-0.5 h-3.5 w-3.5 shrink-0", tone)} aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[11.5px] font-medium text-xb-text">{item.label}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-xb-mute">{item.detail}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function ConsentPage() {
  const { parcels, sensors, aiAssessments, consentRecords, verificationRecords, user } = useDapp();

  const [selectedId, setSelectedId] = useState<string | null>(parcels[0]?.id ?? null);
  const [copied, setCopied] = useState(false);

  const selected = useMemo(
    () => parcels.find((parcel) => parcel.id === selectedId) ?? parcels[0],
    [parcels, selectedId]
  );
  const consent = selected
    ? consentRecords.find((record) => record.parcel_id === selected.id)
    : undefined;

  const stats = useMemo(() => {
    const granted = consentRecords.filter((record) => record.status === "granted").length;
    const total = parcels.length;
    return {
      granted,
      total,
      coveragePct: total > 0 ? Math.round((granted / total) * 100) : 0,
    };
  }, [consentRecords, parcels.length]);

  const coverage = useMemo<CoverageItem[]>(() => {
    if (!selected) return [];

    const parcelSensors = sensors.filter((sensor) => sensor.parcel_id === selected.id);
    const assessment = aiAssessments.find((item) => item.parcel_id === selected.id);
    const verification = verificationRecords.find((item) => item.parcel_id === selected.id);

    return [
      {
        id: "consent",
        label: "Persetujuan tertulis",
        state: consent?.status === "granted" ? "ok" : "warn",
        detail:
          consent?.status === "granted"
            ? `Tercatat atas nama ${consent.community}.`
            : consent?.status === "revoked"
              ? "Persetujuan dicabut, unit tidak boleh diperdagangkan."
              : "Belum ada persetujuan tercatat untuk parcel ini.",
      },
      {
        id: "receipt",
        label: "Nomor tanda terima",
        state: consent?.receipt_id ? "ok" : "warn",
        detail: consent?.receipt_id
          ? `${consent.receipt_id} · diterbitkan ${formatDateTime(consent.timestamp)}.`
          : "Tanpa nomor tanda terima, persetujuan tidak bisa diaudit.",
      },
      {
        id: "verification",
        label: "Status verifikasi parcel",
        state: selected.verificationStatus === "verified" ? "ok" : "warn",
        detail:
          selected.verificationStatus === "verified"
            ? "Parcel sudah lolos verifikasi MRV."
            : `Status saat ini ${selected.verificationStatus}. Persetujuan belum cukup untuk membuka pasar.`,
      },
      {
        id: "units",
        label: "Unit yang bisa dialokasikan",
        state: selected.eligibility && selected.availableUnits > 0 ? "ok" : "warn",
        detail:
          selected.eligibility && selected.availableUnits > 0
            ? `${formatNumber(selected.availableUnits)} unit tersedia untuk pasar.`
            : `${formatNumber(selected.availableUnits)} unit tersedia, ${formatNumber(selected.frozenUnits)} unit dibekukan.`,
      },
      {
        id: "telemetry",
        label: "Bukti telemetri lapangan",
        state: parcelSensors.length > 0 ? "ok" : "info",
        detail:
          parcelSensors.length > 0
            ? `${parcelSensors.length} sensor melapor: ${parcelSensors
                .map((sensor) => sensor.sensor_id)
                .join(", ")}.`
            : "Belum ada sensor yang melapor untuk parcel ini.",
      },
      {
        id: "ai",
        label: "Penilaian AI",
        state: assessment && assessment.status === "passed" ? "ok" : "info",
        detail: assessment
          ? assessment.status === "passed"
            ? `Ambang normal, skor anomali ${assessment.ai2_score.toFixed(2)}.`
            : `Anomali ${assessment.ai2_anomaly} dengan skor ${assessment.ai2_score.toFixed(2)}.`
          : "Penilaian AI belum dijalankan.",
      },
      {
        id: "chain",
        label: "Record verifikasi on-chain",
        state: verification ? "ok" : "info",
        detail: verification
          ? `Blok #${verification.block_index} · ${verification.record_id}.`
          : "Belum ada record verifikasi untuk parcel ini.",
      },
    ];
  }, [aiAssessments, consent, selected, sensors, verificationRecords]);

  const warningCount = coverage.filter((item) => item.state === "warn").length;

  const copyReceipt = async () => {
    if (!consent) return;
    try {
      await navigator.clipboard.writeText(consent.receipt_id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <section className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <SectionLabel>Persetujuan komunitas</SectionLabel>
              <TestnetBadge />
            </div>
            <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-xb-text sm:text-[25px]">
              Register izin warga
            </h1>
            <p className="mt-1 max-w-[64ch] text-[12.5px] leading-relaxed text-xb-mute">
              Unit karbon hanya boleh masuk pasar setelah komunitas memberi izin tertulis. Halaman
              ini menampilkan register persetujuan yang tercatat, lengkap dengan nomor tanda terima
              dan pemeriksaan cakupan per parcel.
            </p>
          </div>

          <Link href="/verify" className={buttonClass("secondary", "min-h-[38px] px-3 text-[12px]")}>
            Lihat bukti ledger
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <Card className="px-4 py-3.5">
            <Metric label="Parcel terdaftar" value={formatNumber(stats.total)} unit="parcel" />
          </Card>
          <Card className="px-4 py-3.5">
            <Metric
              label="Persetujuan aktif"
              value={formatNumber(stats.granted)}
              unit="parcel"
              tone="forest"
              sub="Hanya yang berstatus diberikan."
            />
          </Card>
          <Card className="px-4 py-3.5">
            <Metric
              label="Cakupan"
              value={`${stats.coveragePct}%`}
              tone={stats.coveragePct === 100 ? "forest" : "warning"}
              sub="Perbandingan persetujuan aktif terhadap total parcel."
            />
          </Card>
        </section>

        <Card className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <Users className="mt-0.5 h-4 w-4 shrink-0 text-xb-forest" aria-hidden="true" />
            <div>
              <p className="text-[12.5px] font-semibold text-xb-text">
                Kamu masuk sebagai {ROLE_LABEL[user?.role ?? "guest"]}
              </p>
              <p className="mt-0.5 max-w-[70ch] text-[11.5px] leading-relaxed text-xb-mute">
                {user?.role === "community"
                  ? "Persetujuan yang tercatat atas namamu tampil di daftar ini. Penarikan izin belum tersambung ke sistem, jadi hubungi pengelola kalau ingin mencabut."
                  : "Register ini baca-saja untuk peranmu. Izin hanya bisa diberikan oleh perwakilan komunitas pemilik parcel."}
              </p>
            </div>
          </div>
          <Chip>{stats.granted} dari {stats.total} parcel</Chip>
        </Card>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_392px]">
          <div className="min-w-0 space-y-3">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between gap-2 border-b border-xb-line/70 px-4 py-2.5">
                <SectionLabel>Daftar persetujuan</SectionLabel>
                <span className="text-[10.5px] text-xb-dim">Pilih parcel untuk detail</span>
              </div>

              {parcels.length === 0 ? (
                <EmptyState
                  title="Belum ada parcel"
                  body="Register persetujuan akan terisi setelah parcel didaftarkan oleh pengelola."
                />
              ) : (
                <ul className="divide-y divide-xb-line/50">
                  {parcels.map((parcel) => {
                    const record = consentRecords.find((item) => item.parcel_id === parcel.id);
                    const active = parcel.id === selected?.id;
                    const status = record?.status ?? "none";
                    return (
                      <li key={parcel.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(parcel.id)}
                          aria-pressed={active}
                          className={cx(
                            "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                            active ? "bg-xb-forest/[0.07]" : "hover:bg-xb-raised/50"
                          )}
                        >
                          <span
                            className={cx(
                              "h-2 w-2 shrink-0 rounded-full",
                              status === "granted"
                                ? "bg-xb-verified"
                                : status === "revoked"
                                  ? "bg-xb-blocked"
                                  : "bg-xb-dim"
                            )}
                            aria-hidden="true"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[12.5px] font-semibold text-xb-text">
                              {parcel.name}
                            </span>
                            <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10.5px] text-xb-dim">
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3 w-3" aria-hidden="true" />
                                {parcel.id}
                              </span>
                              <span className="truncate">{record?.community ?? parcel.community}</span>
                            </span>
                          </span>
                          <span className="shrink-0 text-right">
                            {consentPill(status)}
                            <span className="mt-1 block font-mono text-[10px] text-xb-dim">
                              {record?.receipt_id ?? "—"}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <Card className="px-4 py-3.5">
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-xb-tech" aria-hidden="true" />
                <SectionLabel>Batas sistem demo</SectionLabel>
              </div>
              <ul className="mt-2.5 space-y-2">
                {[
                  "Tanda tangan digital warga belum tersambung — nomor tanda terima dibuat oleh seed data, bukan hasil tanda tangan kriptografis.",
                  "Belum ada alur penarikan izin. Status revoked hanya bisa muncul dari data awal.",
                  "Persetujuan tidak menulis apa pun ke chain atau backend saat halaman ini dibuka.",
                ].map((note) => (
                  <li key={note} className="flex items-start gap-2 text-[11.5px] leading-relaxed text-xb-mute">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-xb-dim" aria-hidden="true" />
                    {note}
                  </li>
                ))}
              </ul>
            </Card>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-xb-line/60 bg-xb-surface px-4 py-3">
              <p className="flex items-center gap-2 text-[11.5px] text-xb-dim">
                <Radio className="h-3.5 w-3.5 text-xb-tech" aria-hidden="true" />
                Persetujuan tidak menggantikan verifikasi MRV.
              </p>
              <Link href="/market" className={buttonClass("secondary", "min-h-[36px] px-3 text-[12px]")}>
                Cek kesiapan pasar
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {selected ? (
            <div className="space-y-3 xl:sticky xl:top-[76px] xl:self-start">
              <Card className="overflow-hidden">
                <div className="border-b border-xb-line/70 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <SectionLabel>Tanda terima</SectionLabel>
                      <p className="mt-1 truncate text-[14px] font-semibold text-xb-text">
                        {selected.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-xb-dim">
                        {selected.id} · {selected.community}
                      </p>
                    </div>
                    {consentPill(consent?.status ?? "none")}
                  </div>
                </div>

                <div className="space-y-3 px-4 py-3">
                  <div className="rounded-lg border border-xb-line/60 bg-xb-bg px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-xb-dim">
                        Nomor tanda terima
                      </p>
                      <button
                        type="button"
                        onClick={copyReceipt}
                        disabled={!consent}
                        className="inline-flex items-center gap-1 rounded border border-xb-line/70 bg-xb-raised px-1.5 py-0.5 text-[10.5px] font-medium text-xb-mute transition-colors hover:border-xb-forest/40 hover:text-xb-text disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {copied ? (
                          <Check className="h-3 w-3 text-xb-verified" aria-hidden="true" />
                        ) : (
                          <Copy className="h-3 w-3" aria-hidden="true" />
                        )}
                        {copied ? "Tersalin" : "Salin"}
                      </button>
                    </div>
                    <p className="mt-1.5 font-mono text-[12.5px] font-semibold text-xb-forest">
                      {consent?.receipt_id ?? "Belum diterbitkan"}
                    </p>
                    <p className="mt-1 text-[11px] text-xb-dim">
                      {consent
                        ? `Diberikan oleh ${consent.granted_by}`
                        : "Parcel ini belum punya catatan persetujuan."}
                    </p>
                    {consent && (
                      <p className="mt-0.5 text-[11px] text-xb-dim">
                        {formatDateTime(consent.timestamp)}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-xb-dim">
                        Pemeriksaan cakupan
                      </p>
                      <span
                        className={cx(
                          "text-[10.5px] font-semibold xb-numeric",
                          warningCount === 0 ? "text-xb-verified" : "text-xb-warning"
                        )}
                      >
                        {warningCount === 0 ? "Lengkap" : `${warningCount} perlu perhatian`}
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <CoverageList items={coverage} />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="px-4 py-3">
                <p className="text-[11.5px] leading-relaxed text-xb-mute">
                  Cakupan menilai kelengkapan berkas, bukan kualitas ekologis. Hasil verifikasi MRV
                  ada di halaman bukti ledger.
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <Link
                    href="/verify"
                    className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-xb-line bg-xb-raised px-2.5 text-[11.5px] font-medium text-xb-text transition-colors hover:border-xb-forest/40"
                  >
                    Bukti ledger
                    <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                  <Link
                    href={`/map`}
                    className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-xb-line bg-xb-raised px-2.5 text-[11.5px] font-medium text-xb-text transition-colors hover:border-xb-forest/40"
                  >
                    Lihat di peta
                    <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </div>
              </Card>
            </div>
          ) : (
            <Card>
              <EmptyState
                title="Belum ada parcel dipilih"
                body="Pilih salah satu parcel di daftar untuk melihat tanda terima dan cakupan persetujuan."
              />
            </Card>
          )}
        </section>

        <Disclosure />
      </div>
    </AppShell>
  );
}
