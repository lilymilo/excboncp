"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Radio, Satellite, ShieldCheck, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/dapp/AppShell";
import { CarbonMap } from "@/components/dapp/CarbonMap";
import { ParcelNdviChart } from "@/components/dapp/CarbonCharts";
import { ParcelPanel } from "@/components/dapp/ParcelPanel";
import {
  Card,
  Disclosure,
  StatusPill,
  cx,
  formatNumber,
} from "@/components/dapp/phantom-ui";
import { useDashboardState } from "@/components/dapp/useDashboardStore";
import type { VerificationStatus } from "@/context/DappContext";

const STATUS_DOT: Record<VerificationStatus, string> = {
  verified: "bg-[#72C99A]",
  warning: "bg-[#F2B84B]",
  pending: "bg-[#AA9AF5]",
  blocked: "bg-[#ED7770]",
  dispute: "bg-[#F2B84B]",
};

const STATUS_LABEL: Record<VerificationStatus, string> = {
  verified: "Terverifikasi",
  warning: "Peringatan",
  pending: "Menunggu",
  blocked: "Diblokir",
  dispute: "Sengketa",
};

export default function ParcelMapPage() {
  const { parcels, sensors, aiAssessments, consentRecords, verificationRecords } = useDashboardState();
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
    const anomalies = sensors.filter((sensor) => sensor.anomaly || sensor.flameDetected).length;
    const area = parcels.reduce((sum, parcel) => sum + parcel.area, 0);
    return { anomalies, area };
  }, [parcels, sensors]);

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-semibold tracking-[-0.025em] text-[#F4F5F2] sm:text-[30px]">
              Forest Intelligence
            </h1>
            <p className="mt-1.5 max-w-[64ch] text-[14px] leading-relaxed text-[#A6ADA7]">
              {formatNumber(stats.area)} hektare terpantau di Bogor, Jawa Barat. Pilih batas poligon
              GeoJSON atau node sensor untuk memeriksa kelayakan unit ke pasar karbon.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#252B27] bg-[#151816] px-3.5 text-[12.5px] text-[#A6ADA7]">
              <Radio className="h-4 w-4 text-[#AA9AF5]" aria-hidden="true" />
              {formatNumber(sensors.length)} sensor IoT
              {stats.anomalies > 0 && (
                <span className="font-semibold text-[#F2B84B]">· {stats.anomalies} anomali</span>
              )}
            </span>
            <span className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#252B27] bg-[#151816] px-3.5 text-[12.5px] text-[#A6ADA7]">
              <Satellite className="h-4 w-4 text-[#72C99A]" aria-hidden="true" />
              {formatNumber(parcels.length)} poligon aktif
            </span>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_410px]">
          <div className="min-w-0 space-y-5">
            <Card className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#252B27] px-5 py-3.5">
                <p className="text-[13.5px] font-semibold text-[#F4F5F2]">
                  Peta Poligon GeoJSON &amp; Telemetry
                </p>
                <div className="flex flex-wrap items-center gap-3.5 text-[12px] text-[#A6ADA7]">
                  {(["verified", "warning", "pending", "blocked"] as const).map((status) => (
                    <span key={status} className="inline-flex items-center gap-1.5">
                      <span
                        className={cx("h-2 w-2 rounded-full", STATUS_DOT[status])}
                        aria-hidden="true"
                      />
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
                className="h-[420px] w-full sm:h-[520px] xl:h-[560px]"
              />

              <div className="grid grid-cols-1 gap-2.5 border-t border-[#252B27] p-3.5 sm:grid-cols-2">
                {parcels.map((parcel) => {
                  const active = parcel.id === selected?.id;
                  return (
                    <button
                      key={parcel.id}
                      type="button"
                      onClick={() => setSelectedId(parcel.id)}
                      aria-pressed={active}
                      className={cx(
                        "min-h-[44px] rounded-xl border px-4 py-3 text-left",
                        active
                          ? "border-[#AA9AF5]/60 bg-[#AA9AF5]/14"
                          : "border-[#252B27] bg-[#1D211E] hover:border-[#39423C]"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[12px] font-semibold text-[#F4F5F2]">
                          {parcel.id}
                        </span>
                        <StatusPill status={parcel.verificationStatus} />
                      </div>
                      <p className="mt-1 truncate text-[13.5px] font-medium text-[#F4F5F2]">
                        {parcel.name}
                      </p>
                      <p className="mt-1 text-[12px] text-[#A6ADA7] xb-numeric">
                        {formatNumber(parcel.area)} ha · {formatNumber(parcel.availableUnits)} unit siap
                        jual
                      </p>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card className="p-5">
              <div className="mb-3">
                <h2 className="text-[15px] font-semibold text-[#F4F5F2]">
                  Perbandingan Kanopi Satelit (NDVI)
                </h2>
                <p className="text-[12.5px] text-[#A6ADA7]">
                  Lahan di bawah ambang 0.70 memerlukan verifikasi ulang sebelum masuk pasar karbon.
                </p>
              </div>
              <ParcelNdviChart parcels={parcels} />
            </Card>
          </div>

          {selected ? (
            <ParcelPanel
              parcel={selected}
              sensors={selectedSensors}
              assessment={selectedAssessment}
              verification={selectedVerification}
              consent={selectedConsent}
              className="xl:sticky xl:top-24 xl:max-h-[calc(100vh-120px)]"
            />
          ) : (
            <Card className="p-6 text-center text-[13px] text-[#A6ADA7]">
              Pilih poligon di peta untuk membuka detail inspeksi.
            </Card>
          )}
        </section>

        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#252B27] bg-[#151816] px-5 py-3.5">
          <p className="flex items-center gap-2 text-[12.5px] text-[#A6ADA7]">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#72C99A]" aria-hidden="true" />
            Data spasial terintegrasi langsung dengan kelayakan perdagangan di Carbon Market.
          </p>
          <Link
            href="/market"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-2 text-[13px] font-semibold text-[#AA9AF5] hover:underline"
          >
            <TrendingUp className="h-4 w-4 shrink-0" aria-hidden="true" />
            Buka Carbon Market
            <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </Link>
        </section>

        <Disclosure />
      </div>
    </AppShell>
  );
}
