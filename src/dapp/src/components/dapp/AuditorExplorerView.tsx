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
import type { VerificationRecord } from "@/context/DappContext";
import { runIntegrityChecks, summarizeChecks, type IntegrityCheck } from "@/lib/verification";
import { AppShell } from "./AppShell";
import { SealsIllustration } from "./PhantomIllustrations";
import {
  Button,
  Card,
  Disclosure,
  EmptyState,
  StatusPill,
  Tabs,
  buttonClass,
  cx,
  formatNumber,
} from "./phantom-ui";
import { useDashboardState } from "./useDashboardStore";

type ViewTab = "auditor" | "explorer";
type RecordFilter = "all" | "flagged";

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
    <div className="mt-4 border-t border-[#252B27] pt-3.5">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <p className="text-[12px] font-semibold text-[#F4F5F2]">Hasil Pemeriksaan Hash</p>
        <p className="text-[12px] text-[#A6ADA7] xb-numeric">
          {summary.ok} lolos
          {summary.warn > 0 && <span className="text-[#F2B84B]"> · {summary.warn} gagal</span>}
        </p>
      </div>
      <ul className="divide-y divide-[#252B27] rounded-xl border border-[#252B27] bg-[#090B0A]">
        {items.map((item) => {
          const Icon =
            item.state === "ok" ? CheckCircle2 : item.state === "warn" ? CircleAlert : Info;
          const tone =
            item.state === "ok"
              ? "text-[#72C99A]"
              : item.state === "warn"
                ? "text-[#F2B84B]"
                : "text-[#AA9AF5]";
          return (
            <li key={item.id} className="flex items-start gap-2.5 px-3.5 py-2.5">
              <Icon className={cx("mt-0.5 h-4 w-4 shrink-0", tone)} aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-[12.5px] font-medium text-[#F4F5F2]">{item.label}</p>
                <p className="text-[12px] leading-snug text-[#A6ADA7]">{item.detail}</p>
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
    { label: "prev_hash", value: record.prev_hash, tone: "text-[#A6ADA7]" },
    { label: "hash", value: record.hash, tone: "text-[#72C99A]" },
    { label: "eas_uid", value: record.eas_uid, tone: "text-[#AA9AF5]" },
    { label: "tx_hash", value: record.tx_hash, tone: "text-[#A6ADA7]" },
  ];
  return (
    <div className="min-w-0 space-y-1.5 rounded-xl border border-[#252B27] bg-[#090B0A] px-3.5 py-3">
      {rows.map((row) => (
        <p
          key={row.label}
          className="grid grid-cols-[72px_minmax(0,1fr)] items-baseline gap-2 font-mono text-[11.5px]"
        >
          <span className="text-[#8B948D]">{row.label}</span>
          <span className={cx("truncate", row.tone)} title={row.value}>
            {row.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export function AuditorExplorerView({ defaultTab }: { defaultTab: ViewTab }) {
  const { user, parcels, verificationRecords, consentRecords } = useDashboardState();

  const [tab, setTab] = useState<ViewTab>(defaultTab);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<RecordFilter>("all");
  const [checks, setChecks] = useState<Record<string, IntegrityCheck[]>>({});

  const atRisk = verificationRecords.filter(
    (record) => record.tampered || record.reasons.length > 0
  );
  const chainOk = atRisk.length === 0;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return verificationRecords.filter((record) => {
      if (filter === "flagged" && !record.tampered && record.reasons.length === 0) return false;
      if (!q) return true;
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
  }, [filter, parcels, query, verificationRecords]);

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
      <div className="space-y-6">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-semibold tracking-[-0.025em] text-[#F4F5F2] sm:text-[30px]">
              Ledger Verifikasi
            </h1>
            <p className="mt-1.5 max-w-[64ch] text-[14px] leading-relaxed text-[#A6ADA7]">
              {formatNumber(verificationRecords.length)} blok verifikasi tersimpan. Uji keterkaitan{" "}
              <span className="font-mono text-[12.5px] text-[#F4F5F2]">prev_hash → hash</span>{" "}
              dan attestation EAS secara transparan.
            </p>
          </div>

          <span
            className={cx(
              "inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-3.5 text-[12.5px] font-semibold",
              chainOk
                ? "border-[#72C99A]/35 bg-[#23865A]/20 text-[#72C99A]"
                : "border-[#F2B84B]/40 bg-[#F2B84B]/12 text-[#F2B84B]"
            )}
          >
            {chainOk ? (
              <Link2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            {chainOk ? "Rantai hash utuh" : `${atRisk.length} blok memiliki catatan`}
          </span>
        </section>

        <Tabs
          variant="phantom"
          label="Mode verifikasi ledger"
          value={tab}
          onChange={setTab}
          items={[
            { id: "explorer", label: "Penelusuran Hash", count: verificationRecords.length },
            { id: "auditor", label: "Tinjauan Bukti", count: verificationRecords.length },
          ]}
        />

        <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B948D]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari parcel, nomor blok, hash SHA-256, atau EAS UID…"
              aria-label="Cari record verifikasi"
              className="min-h-[44px] w-full rounded-xl border border-[#39423C] bg-[#090B0A] pl-10 pr-3.5 text-[13px] text-[#F4F5F2] placeholder:text-[#8B948D]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "all" as const, label: "Semua Blok" },
              { id: "flagged" as const, label: "Dengan Catatan" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                aria-pressed={filter === opt.id}
                onClick={() => setFilter(opt.id)}
                className={cx(
                  "min-h-[44px] rounded-xl border px-3.5 text-[12.5px] font-medium",
                  filter === opt.id
                    ? "border-[#AA9AF5]/60 bg-[#AA9AF5]/16 text-[#F4F5F2]"
                    : "border-[#39423C] bg-[#1D211E] text-[#A6ADA7] hover:text-[#F4F5F2]"
                )}
              >
                {opt.label}
              </button>
            ))}

            {user?.role === "auditor" && (
              <Link href="/approve" className={buttonClass("lavender", "rounded-xl")}>
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Auditor Cockpit
              </Link>
            )}
          </div>
        </Card>

        {filtered.length === 0 ? (
          <Card>
            <EmptyState
              illustration={<SealsIllustration className="h-20 w-28" />}
              title="Blok tidak ditemukan"
              body="Tidak ada record hash atau EAS UID yang cocok dengan pencarian Anda."
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((record) => {
              const parcel = parcels.find((item) => item.id === record.parcel_id);
              const consent = consentRecords.find((item) => item.parcel_id === record.parcel_id);
              const verified = !record.tampered && record.reasons.length === 0;
              const openChecks = checks[record.record_id];

              return (
                <Card key={record.record_id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[13px] font-semibold text-[#AA9AF5]">
                          Blok #{record.block_index}
                        </span>
                        <span className="text-[16px] font-semibold text-[#F4F5F2]">
                          {parcel?.name ?? record.parcel_id}
                        </span>
                        <StatusPill
                          status={verified ? "verified" : "warning"}
                          label={verified ? "Hash Valid" : "Perlu Tinjauan"}
                        />
                      </div>
                      <p className="mt-1 text-[12.5px] text-[#A6ADA7]">
                        Auditor: {record.approved_by} · FPIC:{" "}
                        {consent?.status === "granted" ? "Aktif" : "Belum tercatat"} ·{" "}
                        {formatDateTime(record.timestamp)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={openChecks ? "secondary" : "lavender"}
                        onClick={() => toggleChecks(record)}
                        className="rounded-xl text-[12.5px]"
                      >
                        {openChecks ? "Tutup Hasil Cek" : "Uji Integritas Hash"}
                      </Button>
                      <Link
                        href="/map"
                        className={buttonClass("secondary", "rounded-xl text-[12.5px]")}
                      >
                        Lihat di Peta
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>

                  {record.reasons.length > 0 && (
                    <div className="mt-3 rounded-xl border border-[#F2B84B]/40 bg-[#F2B84B]/10 px-3.5 py-2.5 text-[12.5px] text-[#F2B84B]">
                      Catatan penolakan/peringatan: {record.reasons.join("; ")}
                    </div>
                  )}

                  <div className="mt-4">
                    <RecordHashes record={record} />
                  </div>

                  {openChecks && <CheckList items={openChecks} />}
                </Card>
              );
            })}
          </div>
        )}

        <Disclosure />
      </div>
    </AppShell>
  );
}
