"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  Info,
  Link2,
  Search,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useDapp, type UserRole, type VerificationRecord } from "@/context/DappContext";
import { AppShell } from "./AppShell";
import { SealsIllustration } from "./PhantomIllustrations";
import {
  Button,
  Card,
  Disclosure,
  EmptyState,
  SectionLabel,
  StatusPill,
  Tabs,
  cx,
  formatNumber,
} from "./phantom-ui";
import { runIntegrityChecks, summarizeChecks, type IntegrityCheck } from "@/lib/verification";

type ViewTab = "auditor" | "explorer";

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

function CheckList({ items }: { items: IntegrityCheck[] }) {
  const summary = summarizeChecks(items);
  return (
    <div className="mt-3 rounded-lg border border-xb-line/60 bg-xb-bg">
      <div className="flex items-center justify-between gap-2 border-b border-xb-line/60 px-3 py-2">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-xb-dim">
          Hasil pemeriksaan
        </p>
        <p className="text-[10.5px] text-xb-dim xb-numeric">
          {summary.ok} lolos
          {summary.warn > 0 && <span className="text-xb-warning"> · {summary.warn} gagal</span>}
          {summary.info > 0 && <span className="text-xb-tech"> · {summary.info} catatan</span>}
        </p>
      </div>
      <ul className="divide-y divide-xb-line/40">
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
            <li key={item.id} className="flex items-start gap-2 px-3 py-2">
              <Icon className={cx("mt-0.5 h-3.5 w-3.5 shrink-0", tone)} aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-[11.5px] font-medium text-xb-text">{item.label}</p>
                <p className="text-[11px] leading-snug text-xb-mute">{item.detail}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RecordHashes({ record }: { record: VerificationRecord }) {
  const rows = [
    { label: "prev_hash", value: record.prev_hash, tone: "text-xb-mute" },
    { label: "hash", value: record.hash, tone: "text-xb-forest" },
    { label: "eas_uid", value: record.eas_uid, tone: "text-xb-tech" },
    { label: "tx_hash", value: record.tx_hash, tone: "text-xb-mute" },
  ];
  return (
    <div className="min-w-0 space-y-1 rounded-lg border border-xb-line/60 bg-xb-bg px-3 py-2.5">
      {rows.map((row) => (
        <p
          key={row.label}
          className="grid grid-cols-[58px_minmax(0,1fr)] items-baseline gap-2 font-mono text-[10.5px]"
        >
          <span className="text-xb-dim">{row.label}</span>
          <span className={cx("truncate", row.tone)} title={row.value}>
            {row.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export function AuditorExplorerView({ defaultTab }: { defaultTab: ViewTab }) {
  const { parcels, sensors, aiAssessments, consentRecords, verificationRecords, user } = useDapp();

  const [tab, setTab] = useState<ViewTab>(defaultTab);
  const [query, setQuery] = useState("");
  const [checks, setChecks] = useState<Record<string, IntegrityCheck[]>>({});

  const atRisk = verificationRecords.filter(
    (record) => record.tampered || record.reasons.length > 0
  );
  const chainState = atRisk.length === 0 ? "ok" : "warn";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return verificationRecords;
    return verificationRecords.filter((record) => {
      const parcel = parcels.find((item) => item.id === record.parcel_id);
      return (
        record.record_id.toLowerCase().includes(q) ||
        record.parcel_id.toLowerCase().includes(q) ||
        (parcel?.name.toLowerCase().includes(q) ?? false) ||
        String(record.block_index) === q ||
        record.hash.toLowerCase().includes(q) ||
        record.prev_hash.toLowerCase().includes(q) ||
        record.eas_uid.toLowerCase().includes(q) ||
        record.tx_hash.toLowerCase().includes(q)
      );
    });
  }, [parcels, query, verificationRecords]);

  const toggleChecks = (record: VerificationRecord) => {
    setChecks((prev) => {
      if (prev[record.record_id]) {
        const next = { ...prev };
        delete next[record.record_id];
        return next;
      }
      return {
        ...prev,
        [record.record_id]: runIntegrityChecks(record, verificationRecords),
      };
    });
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <section className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <SectionLabel>Ledger verifikasi</SectionLabel>
            <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-xb-text sm:text-[25px]">
              Rantai hash &amp; attestation
            </h1>
            <p className="mt-1 max-w-[64ch] text-[12.5px] leading-relaxed text-xb-mute">
              {formatNumber(verificationRecords.length)} record verifikasi tersimpan. Setiap record
              membawa hash blok, prev_hash, dan UID attestation EAS sebagai bukti integritas data.
            </p>
          </div>

          <span
            className={cx(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11.5px] font-semibold",
              chainState === "ok"
                ? "border-xb-verified/30 bg-xb-verified/10 text-xb-verified"
                : "border-xb-warning/30 bg-xb-warning/10 text-xb-warning"
            )}
          >
            {chainState === "ok" ? (
              <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {chainState === "ok" ? "Tidak ada penanda rusak" : `${atRisk.length} record bermasalah`}
          </span>
        </section>

        <Tabs
          label="Mode ledger"
          value={tab}
          onChange={setTab}
          items={[
            { id: "auditor", label: "Tinjauan bukti", count: verificationRecords.length },
            { id: "explorer", label: "Penelusuran", count: verificationRecords.length },
          ]}
        />

        {tab === "auditor" && (
          <div className="space-y-3">
            {user?.role !== "auditor" && (
              <Card className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-[12.5px] font-semibold text-xb-text">
                    Kamu masuk sebagai {ROLE_LABEL[user?.role ?? "guest"]}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-xb-mute">
                    Tinjauan bukti bersifat baca-saja. Keputusan segel dijalankan di Otorisasi Auditor.
                  </p>
                </div>
                <Link
                  href="/approve"
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-xb-line bg-xb-raised px-3 text-[12px] font-medium text-xb-text transition-colors hover:border-xb-forest/40"
                >
                  Buka otorisasi
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              </Card>
            )}

            {verificationRecords.length === 0 ? (
              <Card>
                <EmptyState
                  illustration={<SealsIllustration className="h-16 w-auto" />}
                  title="Belum ada record"
                  body="Verifikasi akan muncul di sini setelah auditor menyegel blok pertama."
                />
              </Card>
            ) : (
              <div className="grid gap-3 xl:grid-cols-2">
                {verificationRecords.map((record) => {
                  const parcel = parcels.find((item) => item.id === record.parcel_id);
                  const parcelSensors = sensors.filter((sensor) => sensor.parcel_id === record.parcel_id);
                  const assessment = aiAssessments.find((item) => item.parcel_id === record.parcel_id);
                  const consent = consentRecords.find((item) => item.parcel_id === record.parcel_id);
                  const recordChecks = checks[record.record_id];
                  const flagged = record.tampered || record.reasons.length > 0;

                  return (
                    <Card key={record.record_id} className="flex min-w-0 flex-col">
                      <div className="flex items-start justify-between gap-3 border-b border-xb-line/60 px-4 py-3">
                        <div className="min-w-0">
                          <SectionLabel>
                            Blok #{record.block_index} · {record.record_id}
                          </SectionLabel>
                          <p className="mt-1 truncate text-[13.5px] font-semibold text-xb-text">
                            {parcel?.name ?? record.parcel_id}
                          </p>
                          <p className="mt-0.5 text-[11px] text-xb-dim">
                            {record.parcel_id} · {formatDateTime(record.timestamp)}
                          </p>
                        </div>
                        <StatusPill
                          status={flagged ? "warning" : "verified"}
                          label={flagged ? "Perlu tinjau" : "Siap ditinjau"}
                        />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col gap-3 px-4 py-3">
                        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-xb-line/60 bg-xb-line/40 sm:grid-cols-4">
                          {[
                            {
                              label: "Sensor",
                              value: `${parcelSensors.length}`,
                              tone: "text-xb-text",
                            },
                            {
                              label: "AI score",
                              value: assessment ? assessment.ai2_score.toFixed(2) : "—",
                              tone:
                                assessment && assessment.ai2_score >= 0.5
                                  ? "text-xb-warning"
                                  : "text-xb-text",
                            },
                            {
                              label: "Anomali",
                              value: assessment?.ai2_anomaly ?? "—",
                              tone:
                                assessment?.status === "failed"
                                  ? "text-xb-warning"
                                  : "text-xb-verified",
                            },
                            {
                              label: "Izin warga",
                              value: consent?.status ?? "—",
                              tone:
                                consent?.status === "granted"
                                  ? "text-xb-verified"
                                  : "text-xb-dim",
                            },
                          ].map((item) => (
                            <div key={item.label} className="bg-xb-bg px-2.5 py-2">
                              <p className="text-[9.5px] uppercase tracking-[0.12em] text-xb-dim">
                                {item.label}
                              </p>
                              <p className={cx("mt-0.5 text-[12px] font-semibold xb-numeric", item.tone)}>
                                {item.value}
                              </p>
                            </div>
                          ))}
                        </div>

                        <RecordHashes record={record} />

                        <div className="rounded-lg border border-xb-line/60 bg-xb-bg px-3 py-2.5">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-xb-dim">
                            Ringkasan AI
                          </p>
                          <p className="mt-1 text-[11.5px] leading-relaxed text-xb-mute">
                            {assessment?.ai1_summary ?? "Belum ada penilaian AI untuk parcel ini."}
                          </p>
                          {parcelSensors.length > 0 && (
                            <p className="mt-1.5 font-mono text-[10.5px] text-xb-dim">
                              evidence: {parcelSensors.map((sensor) => sensor.sensor_id).join(", ")}
                            </p>
                          )}
                        </div>

                        <div className="mt-auto flex flex-wrap items-center gap-2">
                          <Button
                            variant="secondary"
                            className="min-h-[36px] px-3 text-[12px]"
                            aria-expanded={Boolean(recordChecks)}
                            onClick={() => toggleChecks(record)}
                          >
                            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                            {recordChecks ? "Tutup hasil" : "Periksa integritas"}
                          </Button>
                          <Link
                            href="/approve"
                            className="inline-flex min-h-[36px] items-center gap-1 text-[12px] font-medium text-xb-forest hover:underline"
                          >
                            Otorisasi auditor
                            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                          </Link>
                        </div>

                        {recordChecks && <CheckList items={recordChecks} />}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "explorer" && (
          <div className="space-y-3">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-xb-dim"
                aria-hidden="true"
              />
              <label htmlFor="ledger-search" className="sr-only">
                Cari record, parcel, hash, atau UID attestation
              </label>
              <input
                id="ledger-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari record, parcel, nomor blok, hash, atau EAS UID"
                className="min-h-[40px] w-full rounded-lg border border-xb-line/70 bg-xb-surface pl-9 pr-3 text-[12.5px] text-xb-text placeholder:text-xb-dim focus:border-xb-forest/50 focus:outline-none focus:ring-1 focus:ring-xb-forest/30"
              />
            </div>

            {filtered.length === 0 ? (
              <Card>
                <EmptyState
                  illustration={<SealsIllustration className="h-16 w-auto" />}
                  title="Tidak ada hasil"
                  body="Coba nomor blok, ID parcel, atau potongan hash yang lain."
                />
              </Card>
            ) : (
              <div className="space-y-2.5">
                {filtered.map((record) => {
                  const parcel = parcels.find((item) => item.id === record.parcel_id);
                  const recordChecks = checks[record.record_id];
                  return (
                    <Card key={record.record_id} className="px-4 py-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-xb-line/70 bg-xb-raised font-mono text-[11px] font-semibold text-xb-forest">
                            {record.block_index}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[12.5px] font-semibold text-xb-text">
                              {record.record_id} · {parcel?.name ?? record.parcel_id}
                            </p>
                            <p className="mt-0.5 text-[11px] text-xb-dim">
                              {formatDateTime(record.timestamp)} · {record.parcel_id}
                            </p>
                          </div>
                        </div>
                        <StatusPill
                          status={record.tampered ? "warning" : "verified"}
                          label={record.tampered ? "Ditandai rusak" : "Utuh"}
                        />
                      </div>

                      <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                        <RecordHashes record={record} />
                        <Button
                          variant="secondary"
                          className="min-h-[36px] px-3 text-[12px] sm:self-start"
                          aria-expanded={Boolean(recordChecks)}
                          onClick={() => toggleChecks(record)}
                        >
                          <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
                          {recordChecks ? "Tutup hasil" : "Cek tautan rantai"}
                        </Button>
                      </div>

                      {recordChecks && <CheckList items={recordChecks} />}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <Disclosure className="pt-2" />
      </div>
    </AppShell>
  );
}
