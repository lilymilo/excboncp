"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Leaf,
  Radio,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/dapp/AppShell";
import { CarbonMap } from "@/components/dapp/CarbonMap";
import { ParcelPanel } from "@/components/dapp/ParcelPanel";
import {
  Card,
  Metric,
  ScrollArea,
  SectionLabel,
  StatusPill,
  TestnetBadge,
  buttonClass,
  cx,
  formatNumber,
} from "@/components/dapp/phantom-ui";
import { useDapp, type UserRole } from "@/context/DappContext";

const STATUS_LABEL = {
  verified: "Terverifikasi",
  warning: "Peringatan",
  pending: "Menunggu",
  blocked: "Diblokir",
  dispute: "Sengketa",
} as const;

const STATUS_DOT = {
  verified: "bg-xb-verified",
  warning: "bg-xb-warning",
  pending: "bg-xb-pending",
  blocked: "bg-xb-blocked",
  dispute: "bg-xb-dispute",
} as const;

const ROLE_NOTE: Record<UserRole, { title: string; body: string; href: string; cta: string }> = {
  community: {
    title: "Hak veto komunitas",
    body: "Izin warga menentukan apakah kredit karbon boleh dijual. Kas komunitas menerima 60% dari nilai bersih.",
    href: "/consent",
    cta: "Buka persetujuan warga",
  },
  manager: {
    title: "Monitoring operasi",
    body: "Anda memantau telemetri, anomali lapangan, dan porsi operasi 40% dari setiap settlement.",
    href: "/market",
    cta: "Buka screener pasar",
  },
  auditor: {
    title: "Otorisasi auditor",
    body: "Bukti lapangan dan citra satelit harus cocok sebelum segel verifikasi diterbitkan.",
    href: "/approve",
    cta: "Tinjau antrean verifikasi",
  },
  recipient: {
    title: "Ledger penerima manfaat",
    body: "Setiap pembelian tercatat dengan pembagian 2% biaya sandbox, 60% komunitas, dan 40% operasi.",
    href: "/verify",
    cta: "Lihat ledger verifikasi",
  },
  guest: {
    title: "Akses terbatas",
    body: "Akun tamu hanya dapat melihat ringkasan. Hubungi pengelola untuk akses operasi penuh.",
    href: "/login",
    cta: "Ganti akun demo",
  },
};

export default function DashboardPage() {
  const { user, parcels, sensors, aiAssessments, consentRecords, verificationRecords } = useDapp();
  const [selectedId, setSelectedId] = useState<string | null>(parcels[0]?.id ?? null);

  const selected = useMemo(
    () => parcels.find((parcel) => parcel.id === selectedId) ?? parcels[0],
    [parcels, selectedId]
  );

  const totals = useMemo(() => {
    const area = parcels.reduce((sum, parcel) => sum + parcel.area, 0);
    const stock = parcels.reduce((sum, parcel) => sum + parcel.carbonStock, 0);
    const available = parcels.reduce((sum, parcel) => sum + parcel.availableUnits, 0);
    const frozen = parcels.reduce((sum, parcel) => sum + parcel.frozenUnits, 0);
    const verified = parcels.filter((parcel) => parcel.verificationStatus === "verified").length;
    const anomalies = sensors.filter((sensor) => sensor.anomaly).length;
    return { area, stock, available, frozen, verified, anomalies };
  }, [parcels, sensors]);

  const roleNote = (user ? ROLE_NOTE[user.role] : undefined) ?? ROLE_NOTE.guest;
  const selectedSensors = selected ? sensors.filter((sensor) => sensor.parcel_id === selected.id) : [];
  const selectedAssessment = selected
    ? aiAssessments.find((item) => item.parcel_id === selected.id)
    : undefined;
  const selectedVerification = selected
    ? verificationRecords.find((item) => item.parcel_id === selected.id)
    : undefined;
  const selectedConsent = selected
    ? consentRecords.find((item) => item.parcel_id === selected.id)
    : undefined;

  return (
    <AppShell>
      <div className="space-y-4">
        <section>
          <div className="flex flex-wrap items-center gap-2">
            <SectionLabel>Dashboard</SectionLabel>
            <TestnetBadge />
          </div>
          <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-xb-text sm:text-[25px]">
            Ringkasan operasi &amp; status verifikasi
          </h1>
          <p className="mt-1 max-w-[66ch] text-[12.5px] leading-relaxed text-xb-mute">
            {parcels.length} parcel terpantau di Bogor, Jawa Barat. Telemetri lapangan, anomali
            sensor, dan kelayakan kredit dirangkum sebelum masuk pasar.
          </p>
        </section>

        <section className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_336px]">
          <Card className="overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-y divide-xb-line/60 sm:grid-cols-3 xl:grid-cols-5 xl:divide-y-0">
              <div className="p-3.5">
                <Metric
                  label="Luas terpantau"
                  value={formatNumber(totals.area)}
                  unit="ha"
                  sub={`${parcels.length} parcel aktif`}
                />
              </div>
              <div className="p-3.5">
                <Metric
                  label="Stok karbon"
                  value={formatNumber(totals.stock)}
                  unit="tCO₂e"
                  tone="forest"
                  sub="Estimasi biomassa"
                />
              </div>
              <div className="p-3.5">
                <Metric
                  label="Unit siap jual"
                  value={formatNumber(totals.available)}
                  unit="unit"
                  sub={totals.frozen > 0 ? `${formatNumber(totals.frozen)} dibekukan` : "Tidak ada unit dibekukan"}
                />
              </div>
              <div className="p-3.5">
                <Metric
                  label="Terverifikasi"
                  value={`${totals.verified}/${parcels.length}`}
                  tone={totals.verified === parcels.length ? "forest" : "warning"}
                  sub="Lolos segel auditor"
                />
              </div>
              <div className="col-span-2 p-3.5 sm:col-span-1">
                <Metric
                  label="Sensor anomali"
                  value={formatNumber(totals.anomalies)}
                  unit={`/ ${sensors.length}`}
                  tone={totals.anomalies > 0 ? "blocked" : "forest"}
                  sub="Dari telemetri terakhir"
                />
              </div>
            </div>
          </Card>

          <Card className="flex flex-col justify-between gap-3 border-xb-forest/25 bg-gradient-to-br from-xb-forest/10 via-xb-surface to-xb-surface p-4">
            <div>
              <SectionLabel className="text-xb-forest">{roleNote.title}</SectionLabel>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-xb-mute">{roleNote.body}</p>
            </div>
            <Link href={roleNote.href} className={buttonClass("secondary", "w-full justify-between")}>
              {roleNote.cta}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Card>
        </section>

        {totals.anomalies > 0 && (
          <div className="flex items-start gap-2.5 rounded-xl border border-xb-warning/30 bg-xb-warning/[0.07] px-4 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-xb-warning" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold text-xb-warning">
                {totals.anomalies} sensor melaporkan anomali
              </p>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-xb-mute">
                Unit pada lahan terkait dibekukan sampai auditor menyelesaikan tinjauan bukti.
              </p>
            </div>
          </div>
        )}

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_392px]">
          <div className="min-w-0 space-y-3">
            <Card className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-xb-line/70 px-4 py-3">
                <div>
                  <SectionLabel>Peta operasi</SectionLabel>
                  <p className="mt-0.5 text-[12px] text-xb-mute">
                    Bogor, Jawa Barat · {formatNumber(sensors.length)} sensor lapangan
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 text-[10.5px] text-xb-dim">
                  {(["verified", "warning", "pending", "blocked", "dispute"] as const).map((status) => (
                    <span key={status} className="inline-flex items-center gap-1.5">
                      <span className={cx("h-1.5 w-1.5 rounded-full", STATUS_DOT[status])} />
                      {STATUS_LABEL[status]}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative">
                <CarbonMap
                  parcels={parcels}
                  sensors={sensors}
                  selectedId={selected?.id ?? null}
                  onSelect={setSelectedId}
                  className="h-[380px] w-full sm:h-[460px] xl:h-[520px]"
                />
              </div>

              <div className="xb-scroll flex gap-2 overflow-x-auto border-t border-xb-line/70 p-3">
                {parcels.map((parcel) => {
                  const active = parcel.id === selected?.id;
                  return (
                    <button
                      key={parcel.id}
                      type="button"
                      onClick={() => setSelectedId(parcel.id)}
                      aria-pressed={active}
                      className={cx(
                        "min-w-[208px] flex-1 rounded-lg border p-2.5 text-left transition-colors",
                        active
                          ? "border-xb-forest/45 bg-xb-forest/[0.08]"
                          : "border-xb-line/60 bg-xb-raised/40 hover:border-xb-forest/30"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-xb-text">
                          <span
                            className={cx("h-1.5 w-1.5 rounded-full", STATUS_DOT[parcel.verificationStatus])}
                            aria-hidden="true"
                          />
                          {parcel.id}
                        </span>
                        <StatusPill
                          status={parcel.verificationStatus}
                          label={STATUS_LABEL[parcel.verificationStatus]}
                        />
                      </div>
                      <p className="mt-1.5 truncate text-[12px] text-xb-mute">{parcel.name}</p>
                      <p className="mt-1 flex items-center gap-2 text-[10.5px] text-xb-dim">
                        <Leaf className="h-3 w-3" aria-hidden="true" />
                        {formatNumber(parcel.availableUnits)} unit
                        <Radio className="ml-1 h-3 w-3" aria-hidden="true" />
                        {parcel.sensors?.length ?? 0} sensor
                      </p>
                    </button>
                  );
                })}
              </div>
            </Card>

            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="p-3.5">
                <SectionLabel>Aliran settlement</SectionLabel>
                <p className="mt-2 text-[12px] leading-relaxed text-xb-mute">
                  Biaya sandbox 2% dipotong lebih dulu, lalu nilai bersih dibagi 60% kas komunitas
                  dan 40% operasi pengelola.
                </p>
                <Link
                  href="/market"
                  className="mt-2.5 inline-flex items-center gap-1 text-[11.5px] font-medium text-xb-forest hover:underline"
                >
                  Buka screener
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              </Card>
              <Card className="p-3.5">
                <SectionLabel>Audit trail</SectionLabel>
                <p className="mt-2 text-[12px] leading-relaxed text-xb-mute">
                  Rantai hash dan attestation EAS disimpan per parcel untuk memastikan data tidak
                  berubah setelah disegel.
                </p>
                <Link
                  href="/verify"
                  className="mt-2.5 inline-flex items-center gap-1 text-[11.5px] font-medium text-xb-tech hover:underline"
                >
                  Lihat ledger
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              </Card>
              <Card className="p-3.5">
                <SectionLabel>Kelayakan pasar</SectionLabel>
                <p className="mt-2 text-[12px] leading-relaxed text-xb-mute">
                  {totals.verified} dari {parcels.length} parcel boleh masuk screener. Sisanya
                  menunggu perbaikan bukti dan persetujuan warga.
                </p>
                <Link
                  href="/approve"
                  className="mt-2.5 inline-flex items-center gap-1 text-[11.5px] font-medium text-xb-warning hover:underline"
                >
                  Antrean auditor
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              </Card>
            </div>
          </div>

          {selected ? (
            <ParcelPanel
              parcel={selected}
              sensors={selectedSensors}
              assessment={selectedAssessment}
              verification={selectedVerification}
              consent={selectedConsent}
              className="xl:sticky xl:top-[76px] xl:h-[720px]"
            />
          ) : (
            <Card className="p-6 text-center text-[12.5px] text-xb-mute">
              Belum ada parcel untuk ditampilkan.
            </Card>
          )}
        </section>

        <section className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-xb-line/60 bg-xb-surface px-4 py-3">
          <p className="flex items-center gap-2 text-[11.5px] text-xb-dim">
            <ShieldCheck className="h-3.5 w-3.5 text-xb-forest" aria-hidden="true" />
            Sumber: telemetri IoT, citra satelit, dan attestation auditor. Semua angka simulasi
            testnet.
          </p>
          <Link
            href="/market"
            className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-xb-forest hover:underline"
          >
            <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
            Lihat harga &amp; settlement
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
