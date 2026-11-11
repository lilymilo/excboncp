"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Layers, MapPin, Radio, Satellite, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/dapp/AppShell";
import { CarbonMap } from "@/components/dapp/CarbonMap";
import { ParcelPanel } from "@/components/dapp/ParcelPanel";
import {
  Card,
  SectionLabel,
  StatusPill,
  TestnetBadge,
  buttonClass,
  cx,
  formatNumber,
} from "@/components/dapp/phantom-ui";
import { useDapp, type VerificationStatus } from "@/context/DappContext";

const STATUS_LABEL: Record<VerificationStatus, string> = {
  verified: "Terverifikasi",
  warning: "Peringatan",
  pending: "Menunggu",
  blocked: "Diblokir",
  dispute: "Sengketa",
};

const STATUS_DOT: Record<VerificationStatus, string> = {
  verified: "bg-xb-verified",
  warning: "bg-xb-warning",
  pending: "bg-xb-pending",
  blocked: "bg-xb-blocked",
  dispute: "bg-xb-dispute",
};

export default function ParcelMapPage() {
  const { parcels, sensors, aiAssessments, consentRecords, verificationRecords } = useDapp();
  const [selectedId, setSelectedId] = useState<string | null>(parcels[0]?.id ?? null);

  const selected = useMemo(
    () => parcels.find((parcel) => parcel.id === selectedId) ?? parcels[0],
    [parcels, selectedId]
  );

  const selectedSensors = selected
    ? sensors.filter((sensor) => sensor.parcel_id === selected.id)
    : [];
  const selectedAssessment = selected
    ? aiAssessments.find((item) => item.parcel_id === selected.id)
    : undefined;
  const selectedVerification = selected
    ? verificationRecords.find((item) => item.parcel_id === selected.id)
    : undefined;
  const selectedConsent = selected
    ? consentRecords.find((item) => item.parcel_id === selected.id)
    : undefined;

  const stats = useMemo(() => {
    const anomalies = sensors.filter((sensor) => sensor.anomaly).length;
    const flames = sensors.filter((sensor) => sensor.flameDetected).length;
    const area = parcels.reduce((sum, parcel) => sum + parcel.area, 0);
    return { anomalies, flames, area };
  }, [parcels, sensors]);

  return (
    <AppShell>
      <div className="space-y-4">
        <section className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <SectionLabel>Peta lahan</SectionLabel>
              <TestnetBadge />
            </div>
            <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-xb-text sm:text-[25px]">
              Batas parcel &amp; sensor lapangan
            </h1>
            <p className="mt-1 max-w-[62ch] text-[12.5px] leading-relaxed text-xb-mute">
              {formatNumber(stats.area)} hektare terpantau di Bogor, Jawa Barat. Pilih polygon untuk
              membuka inspektur parcel di samping.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-xb-line/70 bg-xb-surface px-3 py-2 text-[11.5px] text-xb-mute">
              <Radio className="h-3.5 w-3.5 text-xb-tech" aria-hidden="true" />
              {formatNumber(sensors.length)} sensor
              {stats.anomalies > 0 && (
                <span className="ml-1 font-semibold text-xb-warning">
                  · {stats.anomalies} anomali
                </span>
              )}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-xb-line/70 bg-xb-surface px-3 py-2 text-[11.5px] text-xb-mute">
              <Satellite className="h-3.5 w-3.5 text-xb-forest" aria-hidden="true" />
              {formatNumber(parcels.length)} polygon
            </span>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_392px]">
          <div className="min-w-0 space-y-3">
            <Card className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-xb-line/70 px-4 py-3">
                <div>
                  <SectionLabel>Kanopi &amp; status</SectionLabel>
                  <p className="mt-0.5 text-[11.5px] text-xb-dim">
                    Basemap Esri Dark Gray · GeoJSON lokal
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

              <CarbonMap
                parcels={parcels}
                sensors={sensors}
                selectedId={selected?.id ?? null}
                onSelect={setSelectedId}
                className="h-[420px] w-full sm:h-[520px] xl:h-[640px]"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-xb-line/70 px-4 py-2.5">
                <p className="flex items-center gap-1.5 text-[11px] text-xb-dim">
                  <Layers className="h-3 w-3" aria-hidden="true" />
                  Klik polygon atau titik sensor untuk inspeksi
                </p>
                <Link
                  href="/market"
                  className="inline-flex items-center gap-1 text-[11.5px] font-medium text-xb-forest hover:underline"
                >
                  Buka screener pasar
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="border-b border-xb-line/70 px-4 py-2.5">
                <SectionLabel>Daftar parcel</SectionLabel>
              </div>
              <ul className="divide-y divide-xb-line/50">
                {parcels.map((parcel) => {
                  const active = parcel.id === selected?.id;
                  const parcelSensors = sensors.filter((sensor) => sensor.parcel_id === parcel.id);
                  const anomalies = parcelSensors.filter((sensor) => sensor.anomaly).length;
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
                            STATUS_DOT[parcel.verificationStatus]
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
                            <span>{formatNumber(parcel.area)} ha</span>
                            <span className="inline-flex items-center gap-1">
                              <Radio className="h-3 w-3" aria-hidden="true" />
                              {parcelSensors.length} sensor
                            </span>
                            {anomalies > 0 && (
                              <span className="font-semibold text-xb-warning">
                                {anomalies} anomali
                              </span>
                            )}
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <StatusPill
                            status={parcel.verificationStatus}
                            label={STATUS_LABEL[parcel.verificationStatus]}
                          />
                          <span className="mt-1 block text-[10.5px] text-xb-dim xb-numeric">
                            {formatNumber(parcel.availableUnits)} unit
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Card>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-xb-line/60 bg-xb-surface px-4 py-3">
              <p className="flex items-center gap-2 text-[11.5px] text-xb-dim">
                <ShieldCheck className="h-3.5 w-3.5 text-xb-forest" aria-hidden="true" />
                Geometri parcel dan telemetri adalah data simulasi testnet.
              </p>
              <Link
                href="/consent"
                className={buttonClass("secondary", "min-h-[36px] px-3 text-[12px]")}
              >
                Persetujuan warga
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </Link>
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
      </div>
    </AppShell>
  );
}
