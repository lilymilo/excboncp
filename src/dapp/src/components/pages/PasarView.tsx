"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpRight,
  Flame,
  Lock,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { BotanicalAppShell } from "@/components/dapp/BotanicalAppShell";
import { MarketTrendAreaChart } from "@/components/charts/ChartPrimitives";
import { ResultSplitDonut } from "@/components/charts/ResultSplitDonut";
import {
  BotanicalCard,
  BotanicalPageHeader,
  CanonicalStatusBadge,
  ConsentStatusBadge,
  PageStatePanel,
  RoleRestrictedNotice,
} from "@/components/dapp/BotanicalPrimitives";
import { useDashboardState } from "@/components/dapp/useDashboardStore";
import {
  PRICE_PER_TON,
  calculateSettlement,
  normalizeUserRole,
} from "@/context/DappContext";
import { toCanonicalStatus } from "@/lib/dashboard-helpers";
import { buildScreenerData, getApiBaseUrl, safeJsonFetch } from "@/lib/exbon-api";
import { formatIdr, formatNumber } from "@/components/dapp/phantom-ui";

const PARCEL_TREND_LABELS = ["H-6", "H-5", "H-4", "H-3", "H-2", "Kemarin", "Hari ini"];

export function PasarView({ initialParcelId }: { initialParcelId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stateParam = searchParams.get("state");
  const {
    user,
    parcels,
    sensors,
    consentRecords,
    verificationRecords,
    transactions,
    updateParcel,
    updateSensors,
    isLoading,
  } = useDashboardState();

  const role = normalizeUserRole(user?.role, user?.email);
  const isGuest = role === "guest";
  const canRunScenario = role === "manager" || role === "auditor";

  const [selectedId, setSelectedId] = useState<string>(
    initialParcelId || parcels[0]?.id || "PARCEL-A"
  );
  const [simUnits, setSimUnits] = useState<number>(10);
  const [scenarioFeedback, setScenarioFeedback] = useState<string | null>(null);
  const [serverSettlement, setServerSettlement] = useState<{
    units: number;
    gross: number;
    fee: number;
    net: number;
    community: number;
    manager: number;
  } | null>(null);

  useEffect(() => {
    if (initialParcelId && parcels.some((p) => p.id.toLowerCase() === initialParcelId.toLowerCase())) {
      const exact = parcels.find((p) => p.id.toLowerCase() === initialParcelId.toLowerCase());
      if (exact) setSelectedId(exact.id);
    }
  }, [initialParcelId, parcels]);

  const selected = useMemo(
    () => parcels.find((p) => p.id === selectedId) ?? parcels[0],
    [parcels, selectedId]
  );

  useEffect(() => {
    if (!selected) return;
    setSimUnits(Math.min(Math.max(selected.availableUnits, 10), 100));
    const apiBase = getApiBaseUrl();
    if (!apiBase) {
      setServerSettlement(null);
      return;
    }
    safeJsonFetch<{
      settlement?: {
        units: number;
        gross: number;
        fee: number;
        net: number;
        community: number;
        manager: number;
      };
    }>(`${apiBase}/api/market/parcels/${encodeURIComponent(selected.id)}/settlement`).then(
      (res) => {
        if (res?.settlement) {
          setServerSettlement(res.settlement);
        }
      }
    );
  }, [selected]);

  if (isGuest) {
    return (
      <BotanicalAppShell>
        <RoleRestrictedNotice reason="Simulasi pembagian hasil dan parameter pasar hanya dapat dibuka setelah masuk ke akun demo atau terdaftar." />
      </BotanicalAppShell>
    );
  }

  const pageState: "loading" | "empty" | "error" | "ready" =
    isLoading || stateParam === "memuat"
      ? "loading"
      : stateParam === "gagal"
      ? "error"
      : !selected || stateParam === "kosong"
      ? "empty"
      : "ready";

  const canonical = selected ? toCanonicalStatus(selected.verificationStatus) : "BLOCKED";
  const isVerified = canonical === "VERIFIED";
  const effectiveUnits = isVerified
    ? Math.min(Math.max(simUnits, 1), Math.max(selected?.availableUnits ?? 1, 1))
    : 0;

  const grossIdr = effectiveUnits * PRICE_PER_TON;
  const computed = calculateSettlement(grossIdr);
  const displaySplit = serverSettlement ?? {
    units: effectiveUnits,
    gross: computed.gross_idr,
    fee: computed.sandbox_fee_idr,
    net: computed.net_idr,
    community: computed.community_idr,
    manager: computed.operations_idr,
  };

  const consent = selected
    ? consentRecords.find((c) => c.parcel_id === selected.id)
    : undefined;
  const ledger = selected
    ? verificationRecords.find((v) => v.parcel_id === selected.id)
    : undefined;
  const parcelSensors = selected
    ? sensors.filter((s) => s.parcel_id === selected.id)
    : [];

  const parcelTrendSeries = useMemo(() => {
    if (!selected) return [];
    const screener = buildScreenerData({
      role,
      parcels,
      sensors,
      consentRecords,
      verificationRecords,
      transactions,
    });
    const row = screener.rows.find((r) => r.parcel_id === selected.id);
    const vals = row?.trend_7d ?? [0, 0, 0, 0, 0, 0, 0];
    return PARCEL_TREND_LABELS.map((label, idx) => {
      const units = vals[idx] ?? 0;
      return {
        label,
        units,
        grossIdr: units * PRICE_PER_TON,
      };
    });
  }, [selected, role, parcels, sensors, consentRecords, verificationRecords, transactions]);

  const handleSelectParcel = (parcelId: string) => {
    setSelectedId(parcelId);
    setScenarioFeedback(null);
    router.replace(`/pasar/${encodeURIComponent(parcelId)}`, { scroll: false });
  };

  const triggerFireScenario = () => {
    if (!selected) return;
    updateSensors(selected.id, {
      temperature: 44.5,
      soil_moisture: 18,
      anomaly: true,
      flameDetected: true,
      timestamp: new Date().toISOString(),
    });
    updateParcel(selected.id, {
      verificationStatus: "warning",
      eligibility: false,
      frozenUnits: Math.max(selected.frozenUnits, 100),
      availableUnits: 0,
      lastUpdate: new Date().toISOString(),
    });
    setScenarioFeedback(
      `Skenario api aktif di ${selected.id}: sensor memicu status Perlu perhatian dan membekukan unit secara otomatis.`
    );
  };

  const resetParcelScenario = () => {
    if (!selected) return;
    updateSensors(selected.id, {
      temperature: 27.6,
      soil_moisture: 58,
      anomaly: false,
      flameDetected: false,
      timestamp: new Date().toISOString(),
    });
    updateParcel(selected.id, {
      verificationStatus: "verified",
      eligibility: true,
      frozenUnits: 0,
      availableUnits: selected.id === "PARCEL-A" ? 234 : 180,
      lastUpdate: new Date().toISOString(),
    });
    setScenarioFeedback(
      `Kondisi ${selected.id} dipulihkan ke Terverifikasi. Unit kembali siap dialokasikan dalam simulasi.`
    );
  };

  return (
    <BotanicalAppShell>
      <div className="space-y-5">
        <BotanicalPageHeader
          title="Pasar & Simulasi Pembagian Hasil"
          description="Periksa kelayakan unit lahan, rincian pembagian hasil simulasi (60% komunitas, 40% pengelola setelah biaya sandbox 2%), dan uji respons sistem saat terjadi gangguan."
          showSimulation
        />

        {/* Parcel Selector Pills */}
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Pilih lahan">
          {parcels.map((p) => {
            const active = p.id === selected?.id;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={active}
                onClick={() => handleSelectParcel(p.id)}
                className={`min-h-[44px] rounded-full border px-4 text-[14.5px] font-semibold ${
                  active
                    ? "border-[var(--forest-700)] bg-[var(--forest-700)] text-white"
                    : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-soft)]"
                }`}
              >
                {p.name} ({p.id})
              </button>
            );
          })}
        </div>

        <PageStatePanel state={pageState} emptyTitle="Data lahan tidak ditemukan">
          {selected && (
            <div className="space-y-5">
              {/* Eligibility & Status Guardrail Banner */}
              <BotanicalCard className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="xb-display text-[20px] font-bold text-[var(--ink)]">
                        {selected.name}
                      </h2>
                      <CanonicalStatusBadge status={canonical} />
                      <ConsentStatusBadge status={consent?.status ?? selected.consentStatus} />
                    </div>
                    <p className="mt-1.5 text-[15.5px] text-[var(--ink-muted)]">
                      {isVerified
                        ? `Sebanyak ${formatNumber(selected.availableUnits)} tCO2e memenuhi seluruh syarat izin warga, kanopi, dan telemetri.`
                        : `Lahan berstatus ${canonical}: ${formatNumber(selected.frozenUnits)} tCO2e ditahan dan belum bisa dibuka ke simulasi distribusi.`}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/peta/${encodeURIComponent(selected.id)}`}
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 text-[14.5px] font-semibold text-[var(--ink)] hover:bg-[var(--leaf-100)]"
                    >
                      <span>Lihat di Peta</span>
                      <ArrowUpRight className="h-4 w-4 text-[var(--forest-700)]" aria-hidden="true" />
                    </Link>
                    {ledger && (
                      <Link
                        href={`/verifikasi/${encodeURIComponent(String(ledger.block_index))}`}
                        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-[var(--seal-100)] px-4 text-[14.5px] font-semibold text-[var(--seal-600)] transition hover:bg-[var(--seal-200)]"
                      >
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                        <span>Periksa Segel #{ledger.block_index}</span>
                      </Link>
                    )}
                  </div>
                </div>
              </BotanicalCard>

              <div className="grid gap-5 lg:grid-cols-12">
                {/* Left Column: Breakdown Calculator + 7-Day Parcel Simulation Chart */}
                <div className="space-y-5 lg:col-span-7">
                  <BotanicalCard className="p-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="xb-display text-[18px] font-bold text-[var(--ink)]">
                        Rincian Perhitungan Pembagian Hasil
                      </h3>
                      <span className="xb-numeric text-[13.5px] font-medium text-[var(--ink-muted)]">
                        Referensi {formatIdr(PRICE_PER_TON)}/tCO2e
                      </span>
                    </div>

                    {!isVerified ? (
                      <div className="mt-4 rounded-2xl border border-[var(--status-blocked-line)] bg-[var(--status-blocked-bg)]/60 p-5">
                        <p className="flex items-center gap-2 text-[16px] font-bold text-[var(--status-blocked-ink)]">
                          <Lock className="h-5 w-5" aria-hidden="true" />
                          <span>Distribusi Simulasi Terkunci Otomatis</span>
                        </p>
                        <p className="mt-1.5 text-[15px] text-[var(--ink)]">
                          Aturan pengamanan menghentikan simulasi alokasi unit ketika status bukan
                          Terverifikasi. Tinjau izin warga, baca sensor lapangan, atau tunggu
                          pengesahan auditor sebelum melanjutkan.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2.5">
                          <Link
                            href="/screener"
                            className="inline-flex min-h-[44px] items-center rounded-full bg-[var(--surface)] px-4 text-[14.5px] font-semibold text-[var(--ink)] hover:bg-[var(--surface-soft)]"
                          >
                            Bandingkan di Screener
                          </Link>
                          {role === "auditor" && (
                            <Link
                              href="/tinjau"
                              className="inline-flex min-h-[44px] items-center rounded-full bg-[var(--seal-600)] px-4 text-[14.5px] font-semibold text-white hover:bg-[var(--seal-700)]"
                            >
                              Buka Tinjau Auditor
                            </Link>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 space-y-5">
                        <div>
                          <div className="flex items-center justify-between gap-2 text-[15px]">
                            <label htmlFor="sim-unit-range" className="font-semibold text-[var(--ink)]">
                              Jumlah unit untuk simulasi perhitungan
                            </label>
                            <span className="xb-display xb-numeric text-[18px] font-bold text-[var(--status-verified-ink)]">
                              {formatNumber(effectiveUnits)} / {formatNumber(selected.availableUnits)}{" "}
                              tCO2e
                            </span>
                          </div>
                          <input
                            id="sim-unit-range"
                            type="range"
                            min={1}
                            max={Math.max(selected.availableUnits, 1)}
                            value={effectiveUnits}
                            onChange={(e) => setSimUnits(Number(e.target.value))}
                            className="mt-2 h-2 w-full cursor-pointer accent-[var(--forest-700)]"
                          />
                          <div className="mt-2 flex flex-wrap gap-2">
                            {[10, 50, 100, selected.availableUnits]
                              .filter(
                                (val, idx, arr) =>
                                  val > 0 && val <= selected.availableUnits && arr.indexOf(val) === idx
                              )
                              .map((presetVal) => (
                                <button
                                  key={presetVal}
                                  type="button"
                                  onClick={() => setSimUnits(presetVal)}
                                  className={`min-h-[38px] rounded-full border px-3.5 text-[13.5px] font-semibold ${
                                    effectiveUnits === presetVal
                                      ? "border-[var(--forest-700)] bg-[var(--leaf-100)] text-[var(--forest-800)]"
                                      : "border-[var(--line)] bg-[var(--surface-soft)] text-[var(--ink-muted)] hover:text-[var(--ink)]"
                                  }`}
                                >
                                  {presetVal} unit
                                </button>
                              ))}
                          </div>
                        </div>

                        <div className="divide-y divide-[var(--line)] rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 text-[15.5px]">
                          <div className="flex items-center justify-between py-3">
                            <span className="text-[var(--ink-muted)]">Harga referensi simulasi per unit</span>
                            <span className="xb-numeric font-semibold text-[var(--ink)]">
                              {formatIdr(PRICE_PER_TON)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-3">
                            <span className="text-[var(--ink-muted)]">Nilai kotor ({effectiveUnits} unit)</span>
                            <span className="xb-numeric font-bold text-[var(--ink)]">
                              {formatIdr(displaySplit.gross)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-3">
                            <span className="text-[var(--ink-muted)]">Biaya operasional sandbox (2%)</span>
                            <span className="xb-numeric font-semibold text-[var(--seal-600)]">
                              - {formatIdr(displaySplit.fee)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-3">
                            <span className="font-semibold text-[var(--ink)]">Hasil bersih terbagi</span>
                            <span className="xb-numeric font-bold text-[var(--ink)]">
                              {formatIdr(displaySplit.net)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-3">
                            <span className="font-semibold text-[var(--status-verified-ink)]">
                              Alokasi Komunitas (60%)
                            </span>
                            <span className="xb-numeric font-bold text-[var(--status-verified-ink)]">
                              {formatIdr(displaySplit.community)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-3">
                            <span className="font-semibold text-[var(--forest-800)]">
                              Alokasi Pengelola (40%)
                            </span>
                            <span className="xb-numeric font-bold text-[var(--forest-800)]">
                              {formatIdr(displaySplit.manager)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </BotanicalCard>

                  {/* Parcel Simulation Trend Chart (matches Reference 2 and eliminates vertical imbalance) */}
                  <BotanicalCard className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="xb-display text-[17px] font-bold text-[var(--ink)]">
                          Tren Nilai Simulasi Lahan ({selected.id})
                        </h3>
                        <p className="mt-0.5 text-[14px] text-[var(--ink-muted)]">
                          Pergerakan nilai simulasi 7 hari terakhir untuk lahan terpilih.
                        </p>
                      </div>
                      <span className="text-[13px] font-medium text-[var(--ink-muted)]">
                        {isVerified ? "Aktif simulasi" : "Alokasi ditahan sementara"}
                      </span>
                    </div>
                    <div className="mt-4">
                      <MarketTrendAreaChart
                        data={parcelTrendSeries}
                        heightClassName="h-[195px]"
                        contextTag={selected.id}
                      />
                    </div>
                  </BotanicalCard>
                </div>

                {/* Right Column: Donut Split Visual + Fire Scenario Simulator */}
                <div className="space-y-5 lg:col-span-5">
                  <BotanicalCard className="p-6">
                    <h3 className="xb-display mb-4 text-[18px] font-bold text-[var(--ink)]">
                      Proporsi Pembagian Bersih
                    </h3>
                    <ResultSplitDonut
                      communityIdr={displaySplit.community}
                      managerIdr={displaySplit.manager}
                      sandboxFeeIdr={displaySplit.fee}
                    />
                  </BotanicalCard>

                  <BotanicalCard className="p-6">
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--status-warning-bg)] text-[var(--status-warning-ink)]">
                        <Flame className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="xb-display text-[17px] font-bold text-[var(--ink)]">
                          Uji Skenario Gangguan Sensor
                        </h3>
                        <p className="mt-1 text-[14.5px] leading-relaxed text-[var(--ink-muted)]">
                          Simulasikan deteksi api atau lonjakan suhu untuk memastikan pembekuan
                          otomatis berjalan pada lahan{" "}
                          <span className="font-semibold text-[var(--ink)]">{selected.id}</span>.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-3.5 text-[14px]">
                      <p className="font-semibold text-[var(--ink)]">
                        Kondisi sensor aktif ({parcelSensors[0]?.sensor_id ?? "S-001"}):
                      </p>
                      <p className="xb-numeric mt-0.5 text-[var(--ink-muted)]">
                        Suhu {parcelSensors[0]?.temperature ?? 27.4} °C · Kelembapan tanah{" "}
                        {parcelSensors[0]?.soil_moisture ?? 58}%
                      </p>
                    </div>

                    {scenarioFeedback && (
                      <div
                        role="status"
                        className="mt-3 flex items-start gap-2 rounded-xl border border-[var(--status-warning-line)] bg-[var(--status-warning-bg)] p-3 text-[14px] font-medium text-[var(--status-warning-ink)]"
                      >
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>{scenarioFeedback}</span>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2.5">
                      {canRunScenario ? (
                        <>
                          <button
                            type="button"
                            onClick={triggerFireScenario}
                            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--status-dispute-ink)] px-4 text-[14.5px] font-semibold text-white hover:opacity-90"
                          >
                            <Flame className="h-4 w-4" aria-hidden="true" />
                            <span>Putar skenario api</span>
                          </button>
                          <button
                            type="button"
                            onClick={resetParcelScenario}
                            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-[14.5px] font-semibold text-[var(--ink)] hover:bg-[var(--surface-soft)]"
                          >
                            <RotateCcw className="h-4 w-4 text-[var(--forest-700)]" aria-hidden="true" />
                            <span>Pulihkan normal</span>
                          </button>
                        </>
                      ) : (
                        <p className="text-[14px] text-[var(--ink-muted)]">
                          Uji skenario sensor hanya aktif untuk peran Pengelola Hutan atau Auditor.
                        </p>
                      )}
                    </div>
                  </BotanicalCard>
                </div>
              </div>
            </div>
          )}
        </PageStatePanel>
      </div>
    </BotanicalAppShell>
  );
}

