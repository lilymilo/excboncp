"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  CircleAlert,
  FileCheck2,
  Info,
  Lock,
  MapPin,
  PenLine,
  ShieldCheck,
  Undo2,
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
import { runIntegrityChecks, summarizeChecks, type IntegrityCheck } from "@/lib/verification";
import { useDapp, type UserRole, type VerificationRecord } from "@/context/DappContext";

const ROLE_LABEL: Record<UserRole, string> = {
  community: "Komunitas",
  manager: "Pengelola",
  auditor: "Auditor",
  recipient: "Penerima Manfaat",
  guest: "Tamu",
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

function truncateMiddle(value: string, head = 10, tail = 8) {
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

type VerdictState = "ok" | "warn" | "info";

type VerdictItem = {
  id: string;
  label: string;
  state: VerdictState;
  detail: string;
};

type Evaluation = {
  record: VerificationRecord;
  integrity: IntegrityCheck[];
  business: VerdictItem[];
  warns: number;
  blocked: boolean;
};

function VerdictList({ items }: { items: Array<IntegrityCheck | VerdictItem> }) {
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

export default function ApprovePage() {
  const { parcels, sensors, aiAssessments, consentRecords, verificationRecords, user } = useDapp();

  const [selectedId, setSelectedId] = useState<string | null>(
    verificationRecords[0]?.record_id ?? null
  );
  const [reviewed, setReviewed] = useState<string[]>([]);

  const canReview = user?.role === "auditor";

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
              ? "Parcel berstatus terverifikasi."
              : `Status parcel saat ini ${parcel.verificationStatus}, belum bisa disegel.`
            : "Parcel tidak ditemukan di dataset demo.",
        },
        {
          id: "consent",
          label: "Persetujuan komunitas",
          state: consent?.status === "granted" ? "ok" : "warn",
          detail:
            consent?.status === "granted"
              ? `${consent.receipt_id} atas nama ${consent.community}.`
              : "Belum ada persetujuan aktif untuk parcel ini.",
        },
        {
          id: "units",
          label: "Unit tersedia",
          state: parcel && parcel.availableUnits > 0 ? "ok" : "warn",
          detail: parcel
            ? `${formatNumber(parcel.availableUnits)} unit tersedia, ${formatNumber(parcel.frozenUnits)} unit dibekukan.`
            : "Data unit tidak tersedia.",
        },
        {
          id: "ai",
          label: "Hasil penilaian AI",
          state: assessment?.status === "passed" ? "ok" : "warn",
          detail: assessment
            ? assessment.status === "passed"
              ? `Ambang normal, skor anomali ${assessment.ai2_score.toFixed(2)}.`
              : `Anomali ${assessment.ai2_anomaly} dengan skor ${assessment.ai2_score.toFixed(2)}.`
            : "Penilaian AI belum dijalankan.",
        },
        {
          id: "telemetry",
          label: "Sensor yang melapor",
          state: parcelSensors.length > 0 ? "ok" : "warn",
          detail:
            parcelSensors.length > 0
              ? `${parcelSensors.length} sensor: ${parcelSensors.map((item) => item.sensor_id).join(", ")}.`
              : "Tidak ada telemetri lapangan untuk parcel ini.",
        },
      ];

      const warns = [...integrity, ...business].filter((item) => item.state === "warn").length;

      return { record, integrity, business, warns, blocked: warns > 0 };
    });
  }, [aiAssessments, consentRecords, parcels, sensors, verificationRecords]);

  const selected = useMemo(
    () => evaluations.find((item) => item.record.record_id === selectedId) ?? evaluations[0],
    [evaluations, selectedId]
  );

  const stats = useMemo(() => {
    const total = evaluations.length;
    const ready = evaluations.filter((item) => !item.blocked).length;
    return { total, ready, needsAttention: total - ready };
  }, [evaluations]);

  const selectedParcel = selected
    ? parcels.find((item) => item.id === selected.record.parcel_id)
    : undefined;
  const selectedIntegrity = selected ? summarizeChecks(selected.integrity) : null;
  const isReviewed = selected ? reviewed.includes(selected.record.record_id) : false;

  const toggleReview = () => {
    if (!selected) return;
    setReviewed((prev) =>
      prev.includes(selected.record.record_id)
        ? prev.filter((id) => id !== selected.record.record_id)
        : [...prev, selected.record.record_id]
    );
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <section className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <SectionLabel>Otorisasi auditor</SectionLabel>
              <TestnetBadge />
            </div>
            <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-xb-text sm:text-[25px]">
              Persetujuan segel verifikasi
            </h1>
            <p className="mt-1 max-w-[64ch] text-[12.5px] leading-relaxed text-xb-mute">
              Auditor memeriksa dua lapis: integritas record on-chain dan kelayakan bisnis parcel.
              Halaman ini menjalankan pemeriksaan secara lokal terhadap data demo — tidak menandatangani
              dan tidak menulis apa pun ke chain.
            </p>
          </div>

          <Link
            href="/verify"
            className={buttonClass("secondary", "min-h-[38px] px-3 text-[12px]")}
          >
            Buka ledger lengkap
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <Card className="px-4 py-3.5">
            <Metric label="Record tersedia" value={formatNumber(stats.total)} unit="record" />
          </Card>
          <Card className="px-4 py-3.5">
            <Metric
              label="Siap disegel"
              value={formatNumber(stats.ready)}
              unit="record"
              tone="forest"
              sub="Semua pemeriksaan lolos tanpa peringatan."
            />
          </Card>
          <Card className="px-4 py-3.5">
            <Metric
              label="Perlu perhatian"
              value={formatNumber(stats.needsAttention)}
              unit="record"
              tone={stats.needsAttention > 0 ? "warning" : "default"}
              sub="Ada pemeriksaan yang belum lolos."
            />
          </Card>
        </section>

        <Card className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-xb-forest" aria-hidden="true" />
            <div>
              <p className="text-[12.5px] font-semibold text-xb-text">
                Kamu masuk sebagai {ROLE_LABEL[user?.role ?? "guest"]}
              </p>
              <p className="mt-0.5 max-w-[70ch] text-[11.5px] leading-relaxed text-xb-mute">
                {canReview
                  ? "Sebagai auditor kamu bisa menandai tinjauan selesai. Penandaan hanya berlaku di sesi ini dan tidak mengubah status parcel."
                  : "Halaman ini baca-saja untuk peranmu. Hanya auditor yang bisa menandai tinjauan selesai."}
              </p>
            </div>
          </div>
          <Chip>
            {reviewed.length} dari {stats.total} ditinjau
          </Chip>
        </Card>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0 space-y-3">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between gap-2 border-b border-xb-line/70 px-4 py-2.5">
                <SectionLabel>Antrean record verifikasi</SectionLabel>
                <span className="text-[10.5px] text-xb-dim">Pilih record untuk ditinjau</span>
              </div>

              {evaluations.length === 0 ? (
                <EmptyState
                  title="Belum ada record verifikasi"
                  body="Antrean otorisasi akan terisi setelah sistem MRV menerbitkan record untuk sebuah parcel."
                />
              ) : (
                <ul className="divide-y divide-xb-line/50">
                  {evaluations.map((item) => {
                    const parcel = parcels.find((p) => p.id === item.record.parcel_id);
                    const active = item.record.record_id === selected?.record.record_id;
                    const done = reviewed.includes(item.record.record_id);
                    return (
                      <li key={item.record.record_id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(item.record.record_id)}
                          aria-pressed={active}
                          className={cx(
                            "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                            active ? "bg-xb-forest/[0.07]" : "hover:bg-xb-raised/50"
                          )}
                        >
                          <span
                            className={cx(
                              "h-2 w-2 shrink-0 rounded-full",
                              item.blocked ? "bg-xb-warning" : "bg-xb-verified"
                            )}
                            aria-hidden="true"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className="truncate text-[12.5px] font-semibold text-xb-text">
                                {parcel?.name ?? item.record.parcel_id}
                              </span>
                              <span className="shrink-0 font-mono text-[10.5px] text-xb-dim">
                                {item.record.record_id}
                              </span>
                            </span>
                            <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10.5px] text-xb-dim">
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3 w-3" aria-hidden="true" />
                                {item.record.parcel_id}
                              </span>
                              <span>Blok #{item.record.block_index}</span>
                              <span>{formatDateTime(item.record.timestamp)}</span>
                            </span>
                          </span>
                          <span className="flex shrink-0 flex-col items-end gap-1">
                            {item.blocked ? (
                              <StatusPill status="warning" label={`${item.warns} cek`} />
                            ) : (
                              <StatusPill status="verified" label="Lolos" />
                            )}
                            {done && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-xb-forest">
                                <Check className="h-2.5 w-2.5" aria-hidden="true" />
                                ditinjau
                              </span>
                            )}
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
                <SectionLabel>Batas otorisasi demo</SectionLabel>
              </div>
              <ul className="mt-2.5 space-y-2">
                {[
                  "Pemeriksaan dijalankan di browser terhadap data seed, bukan query langsung ke node Base Sepolia.",
                  "Tanda tangan auditor belum tersambung — tidak ada kunci privat, tidak ada transaksi attestation baru.",
                  "Status parcel tidak berubah saat halaman ini dibuka atau saat tinjauan ditandai selesai.",
                ].map((note) => (
                  <li
                    key={note}
                    className="flex items-start gap-2 text-[11.5px] leading-relaxed text-xb-mute"
                  >
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-xb-dim" aria-hidden="true" />
                    {note}
                  </li>
                ))}
              </ul>
            </Card>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-xb-line/60 bg-xb-surface px-4 py-3">
              <p className="flex items-center gap-2 text-[11.5px] text-xb-dim">
                <FileCheck2 className="h-3.5 w-3.5 text-xb-tech" aria-hidden="true" />
                Segel hanya sah bila integritas dan kelayakan bisnis sama-sama lolos.
              </p>
              <Link
                href="/consent"
                className={buttonClass("secondary", "min-h-[36px] px-3 text-[12px]")}
              >
                Cek persetujuan
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
                      <SectionLabel>Verdict tinjauan</SectionLabel>
                      <p className="mt-1 truncate text-[14px] font-semibold text-xb-text">
                        {selectedParcel?.name ?? selected.record.parcel_id}
                      </p>
                      <p className="mt-0.5 text-[11px] text-xb-dim">
                        {selected.record.record_id} · blok #{selected.record.block_index}
                      </p>
                    </div>
                    {selected.blocked ? (
                      <StatusPill status="warning" label="Tertahan" />
                    ) : (
                      <StatusPill status="verified" label="Layak" />
                    )}
                  </div>
                </div>

                <div className="space-y-3 px-4 py-3">
                  <div className="grid grid-cols-3 gap-2 rounded-lg border border-xb-line/60 bg-xb-bg px-3 py-2.5 text-center">
                    <div>
                      <p className="text-[15px] font-semibold leading-none text-xb-verified xb-numeric">
                        {selectedIntegrity?.ok ?? 0}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-xb-dim">Lolos</p>
                    </div>
                    <div className="border-x border-xb-line/50">
                      <p className="text-[15px] font-semibold leading-none text-xb-warning xb-numeric">
                        {selected.warns}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-xb-dim">
                        Peringatan
                      </p>
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold leading-none text-xb-tech xb-numeric">
                        {selectedIntegrity?.info ?? 0}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-xb-dim">Info</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-xb-dim">
                      Integritas record
                    </p>
                    <div className="mt-1.5">
                      <VerdictList items={selected.integrity} />
                    </div>
                  </div>

                  <div>
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-xb-dim">
                      Kelayakan bisnis
                    </p>
                    <div className="mt-1.5">
                      <VerdictList items={selected.business} />
                    </div>
                  </div>

                  <div className="rounded-lg border border-xb-line/60 bg-xb-bg px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-xb-dim">
                        Jejak on-chain
                      </p>
                      <span className="font-mono text-[10px] text-xb-dim">EAS</span>
                    </div>
                    <dl className="mt-1.5 space-y-1.5 text-[11px]">
                      <div>
                        <dt className="text-xb-dim">Block hash</dt>
                        <dd className="font-mono text-xb-text" title={selected.record.hash}>
                          {truncateMiddle(selected.record.hash, 12, 10)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xb-dim">prev_hash</dt>
                        <dd className="font-mono text-xb-mute" title={selected.record.prev_hash}>
                          {truncateMiddle(selected.record.prev_hash, 12, 10)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xb-dim">Attestation UID</dt>
                        <dd className="font-mono text-xb-text" title={selected.record.eas_uid}>
                          {truncateMiddle(selected.record.eas_uid, 12, 10)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xb-dim">Tx hash</dt>
                        <dd className="font-mono text-xb-mute" title={selected.record.tx_hash}>
                          {truncateMiddle(selected.record.tx_hash, 12, 10)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="border-t border-xb-line/70 px-4 py-3">
                  {canReview ? (
                    <>
                      <Button
                        variant={isReviewed ? "secondary" : "primary"}
                        onClick={toggleReview}
                        className="w-full"
                      >
                        {isReviewed ? (
                          <>
                            <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Batalkan tanda tinjauan
                          </>
                        ) : (
                          <>
                            <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
                            Tandai tinjauan selesai
                          </>
                        )}
                      </Button>
                      <p className="mt-2 text-[11px] leading-relaxed text-xb-dim">
                        {isReviewed
                          ? "Ditandai di sesi ini. Status parcel dan record on-chain tetap seperti semula."
                          : "Penandaan bersifat catatan sesi, bukan tanda tangan kriptografis."}
                      </p>
                    </>
                  ) : (
                    <p className="flex items-start gap-2 text-[11.5px] leading-relaxed text-xb-mute">
                      <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-xb-dim" aria-hidden="true" />
                      Tombol tinjauan hanya aktif untuk akun auditor.
                    </p>
                  )}
                </div>
              </Card>

              <Card className="px-4 py-3">
                <p className="text-[11.5px] leading-relaxed text-xb-mute">
                  {selected.blocked
                    ? "Ada pemeriksaan yang belum lolos. Segel tidak bisa diterbitkan sampai semua peringatan dibereskan."
                    : "Semua pemeriksaan lolos. Di sistem produksi langkah berikutnya adalah menandatangani attestation dengan kunci auditor."}
                </p>
                <Link
                  href="/verify"
                  className="mt-2.5 inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-xb-line bg-xb-raised px-2.5 text-[11.5px] font-medium text-xb-text transition-colors hover:border-xb-forest/40"
                >
                  Lihat rantai penuh
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              </Card>
            </div>
          ) : (
            <Card>
              <EmptyState
                title="Belum ada record dipilih"
                body="Pilih salah satu record di antrean untuk melihat hasil pemeriksaan integritas dan kelayakan."
              />
            </Card>
          )}
        </section>

        <Disclosure />
      </div>
    </AppShell>
  );
}
