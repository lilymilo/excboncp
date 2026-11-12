"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Lock,
  Radio,
  Search,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/dapp/AppShell";
import { ParcelNdviChart, ParcelSupplyChart } from "@/components/dapp/CarbonCharts";
import {
  Button,
  Card,
  Disclosure,
  EmptyState,
  ScrollArea,
  StatusPill,
  Tabs,
  buttonClass,
  cx,
  formatIdr,
  formatIdrShort,
  formatNumber,
} from "@/components/dapp/phantom-ui";
import { useDashboardState } from "@/components/dapp/useDashboardStore";
import {
  PRICE_PER_TON,
  calculateSettlement,
  normalizeUserRole,
  type ConsentRecord,
  type ParcelItem,
  type SensorData,
  type VerificationStatus,
} from "@/context/DappContext";

type ScreenerFilter = "all" | "eligible" | "held";
type SortMode = "available" | "ndvi" | "stock";
type DetailTab = "profile" | "risk";

function buildRisk(
  parcel: ParcelItem,
  sensors: SensorData[],
  consent?: ConsentRecord
): { score: number; factors: { label: string; weight: number; detail: string }[] } {
  const factors: { label: string; weight: number; detail: string }[] = [];
  const statusWeight: Record<VerificationStatus, number> = {
    verified: 6,
    pending: 30,
    warning: 52,
    blocked: 74,
    dispute: 62,
  };

  factors.push({
    label: "Status verifikasi MRV",
    weight: statusWeight[parcel.verificationStatus] ?? 30,
    detail: parcel.verificationStatus.toUpperCase(),
  });

  const anomalies = sensors.filter((s) => s.anomaly || s.flameDetected).length;
  if (anomalies > 0) {
    factors.push({
      label: "Anomali sensor IoT",
      weight: Math.min(24, anomalies * 12),
      detail: `${anomalies} node di luar ambang`,
    });
  }

  if (parcel.ndvi !== undefined && parcel.ndvi < 0.7) {
    factors.push({
      label: "Kerapatan kanopi di bawah ambang",
      weight: parcel.ndvi < 0.6 ? 20 : 14,
      detail: `NDVI ${parcel.ndvi.toFixed(2)} (< 0.70)`,
    });
  }

  if (consent?.status !== "granted") {
    factors.push({
      label: "Persetujuan komunitas (FPIC)",
      weight: 18,
      detail: consent?.status === "revoked" ? "Izin dicabut" : "Belum tercatat",
    });
  }

  const score = Math.min(100, factors.reduce((sum, f) => sum + f.weight, 0));
  return { score, factors };
}

export default function MarketPage() {
  const {
    user,
    parcels,
    sensors,
    consentRecords,
    transactions,
    submitCarbonOrder,
  } = useDashboardState();

  const [selectedId, setSelectedId] = useState<string | null>(parcels[0]?.id ?? null);
  const [filter, setFilter] = useState<ScreenerFilter>("all");
  const [sortBy, setSortBy] = useState<SortMode>("available");
  const [search, setSearch] = useState("");
  const [detailTab, setDetailTab] = useState<DetailTab>("profile");
  const [volumeInput, setVolumeInput] = useState("10");
  const [orderFeedback, setOrderFeedback] = useState<{
    ok: boolean;
    message: string;
    txId?: string;
  } | null>(null);

  const visibleParcels = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = parcels.filter((parcel) => {
      const consent = consentRecords.find((c) => c.parcel_id === parcel.id);
      const isEligible =
        parcel.verificationStatus === "verified" &&
        parcel.eligibility &&
        consent?.status === "granted" &&
        parcel.availableUnits > 0;

      if (filter === "eligible" && !isEligible) return false;
      if (filter === "held" && isEligible) return false;
      if (!q) return true;
      return (
        parcel.id.toLowerCase().includes(q) ||
        parcel.name.toLowerCase().includes(q) ||
        parcel.region.toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === "ndvi") return (b.ndvi ?? 0) - (a.ndvi ?? 0);
      if (sortBy === "stock") return b.carbonStock - a.carbonStock;
      return b.availableUnits - a.availableUnits;
    });
  }, [consentRecords, filter, parcels, search, sortBy]);

  const selected = useMemo(
    () =>
      visibleParcels.find((p) => p.id === selectedId) ??
      visibleParcels[0] ??
      parcels[0],
    [parcels, selectedId, visibleParcels]
  );

  const selectedSensors = selected
    ? sensors.filter((s) => s.parcel_id === selected.id)
    : [];
  const selectedConsent = selected
    ? consentRecords.find((c) => c.parcel_id === selected.id)
    : undefined;

  const available = selected?.availableUnits ?? 0;
  const eligible =
    !!selected &&
    selected.verificationStatus === "verified" &&
    selected.eligibility &&
    selectedConsent?.status === "granted" &&
    available > 0;

  const rawUnits = Number.parseInt(volumeInput, 10);
  const clampedUnits = Number.isFinite(rawUnits)
    ? Math.max(0, Math.min(rawUnits, available))
    : 0;

  const gross = clampedUnits * PRICE_PER_TON;
  const settlement = eligible ? calculateSettlement(gross) : calculateSettlement(0);
  const risk = selected ? buildRisk(selected, selectedSensors, selectedConsent) : null;
  const role = normalizeUserRole(user?.role, user?.email);

  const handleSelectParcel = (id: string) => {
    setSelectedId(id);
    setOrderFeedback(null);
    setVolumeInput("10");
  };

  const handleOrder = () => {
    if (!selected) return;
    const res = submitCarbonOrder(selected.id, clampedUnits);
    setOrderFeedback({ ok: res.ok, message: res.message, txId: res.tx?.tx_id });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Marketplace Header */}
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-semibold tracking-[-0.025em] text-[#F4F5F2] sm:text-[30px]">
              Carbon Market
            </h1>
            <p className="mt-1.5 max-w-[62ch] text-[14px] leading-relaxed text-[#A6ADA7]">
              Temukan kredit karbon hutan yang lolos verifikasi dMRV dan persetujuan warga, lalu uji
              simulasi settlement pembagian hasil.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#252B27] bg-[#151816] px-4 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#23865A]/20 text-[#72C99A]">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11.5px] font-medium text-[#A6ADA7]">Harga acuan simulasi</p>
              <p className="text-[17px] font-semibold text-[#F4F5F2] xb-numeric">
                {formatIdr(PRICE_PER_TON)}
                <span className="ml-1 text-[12px] font-normal text-[#8B948D]">/ tCO₂e</span>
              </p>
            </div>
          </div>
        </section>

        {/* Data Visualization Strip (Recharts zero animation) */}
        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-[14.5px] font-semibold text-[#F4F5F2]">Ketersediaan Unit Karbon</h2>
                <p className="text-[12px] text-[#A6ADA7]">Perbandingan unit siap jual vs unit dibekukan</p>
              </div>
            </div>
            <ParcelSupplyChart parcels={parcels} />
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-[14.5px] font-semibold text-[#F4F5F2]">Kerapatan Kanopi (NDVI)</h2>
                <p className="text-[12px] text-[#A6ADA7]">Standar minimal kelayakan hutan 0.70</p>
              </div>
            </div>
            <ParcelNdviChart parcels={parcels} />
          </Card>
        </section>

        {/* Screener Controls */}
        <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B948D]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari parcel atau wilayah (mis. PARCEL-A, Bogor)…"
              aria-label="Cari aset karbon"
              className="min-h-[44px] w-full rounded-xl border border-[#39423C] bg-[#090B0A] pl-10 pr-3.5 text-[13px] text-[#F4F5F2] placeholder:text-[#8B948D]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: "all", label: "Semua" },
                { id: "eligible", label: "Layak Jual" },
                { id: "held", label: "Tertahan" },
              ] as const
            ).map((opt) => (
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

            <select
              aria-label="Urutkan daftar parcel"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortMode)}
              className="min-h-[44px] rounded-xl border border-[#39423C] bg-[#1D211E] px-3 text-[12.5px] font-medium text-[#F4F5F2]"
            >
              <option value="available">Urutkan: Unit Siap Jual</option>
              <option value="ndvi">Urutkan: NDVI Tertinggi</option>
              <option value="stock">Urutkan: Stok Karbon</option>
            </select>
          </div>
        </Card>

        {/* Main Screener + Interactive Order Simulator */}
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="min-w-0 space-y-5">
            <Card className="overflow-hidden">
              {visibleParcels.length === 0 ? (
                <EmptyState
                  title="Tidak ada parcel yang cocok"
                  body="Ubah kata kunci pencarian atau pilih filter Semua."
                />
              ) : (
                <div className="divide-y divide-[#252B27]">
                  {visibleParcels.map((parcel) => {
                    const consent = consentRecords.find((c) => c.parcel_id === parcel.id);
                    const pEligible =
                      parcel.verificationStatus === "verified" &&
                      parcel.eligibility &&
                      consent?.status === "granted";
                    const isSelected = selected?.id === parcel.id;

                    return (
                      <button
                        key={parcel.id}
                        type="button"
                        onClick={() => handleSelectParcel(parcel.id)}
                        aria-pressed={isSelected}
                        className={cx(
                          "flex min-h-[68px] w-full flex-col justify-between gap-3 px-5 py-4 text-left sm:flex-row sm:items-center",
                          isSelected ? "bg-[#1D211E]" : "bg-[#151816] hover:bg-[#1D211E]"
                        )}
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[15px] font-semibold text-[#F4F5F2]">
                              {parcel.name}
                            </span>
                            <span className="font-mono text-[11.5px] text-[#8B948D]">
                              {parcel.id}
                            </span>
                            <StatusPill status={parcel.verificationStatus} />
                          </div>
                          <p className="mt-1 text-[12.5px] text-[#A6ADA7]">
                            {parcel.region} · {formatNumber(parcel.area)} ha · NDVI{" "}
                            {parcel.ndvi !== undefined ? parcel.ndvi.toFixed(2) : "N/A"} ·{" "}
                            {consent?.status === "granted" ? "FPIC Aktif" : "Belum Ada Izin Warga"}
                          </p>
                        </div>

                        <div className="shrink-0 text-left sm:text-right">
                          <p
                            className={cx(
                              "text-[15px] font-semibold xb-numeric",
                              pEligible ? "text-[#72C99A]" : "text-[#ED7770]"
                            )}
                          >
                            {pEligible
                              ? `${formatNumber(parcel.availableUnits)} tCO₂e`
                              : `${formatNumber(parcel.frozenUnits)} tCO₂e beku`}
                          </p>
                          <p className="mt-0.5 text-[12px] text-[#A6ADA7] xb-numeric">
                            {pEligible ? formatIdrShort(parcel.settlementEstimateIdr) : "Terkunci"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Selected Parcel Detail Card */}
            {selected && (
              <Card className="overflow-hidden p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#252B27] pb-4">
                  <div>
                    <h2 className="text-[16px] font-semibold text-[#F4F5F2]">
                      Inspeksi Aset · {selected.name}
                    </h2>
                    <p className="mt-0.5 text-[12.5px] text-[#A6ADA7]">
                      {selected.community} · Skor risiko{" "}
                      <span className="font-semibold text-[#F4F5F2] xb-numeric">
                        {risk?.score ?? 0}/100
                      </span>
                    </p>
                  </div>
                  <Tabs
                    value={detailTab}
                    onChange={setDetailTab}
                    label="Detail aset terpilih"
                    items={[
                      { id: "profile", label: "Profil & Sensor" },
                      { id: "risk", label: "Faktor Risiko" },
                    ]}
                  />
                </div>

                {detailTab === "profile" ? (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2.5 text-[13px]">
                      <div className="flex justify-between border-b border-[#252B27] py-2">
                        <span className="text-[#A6ADA7]">Stok Biomassa</span>
                        <span className="font-semibold text-[#F4F5F2] xb-numeric">
                          {formatNumber(selected.carbonStock)} tCO₂e
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-[#252B27] py-2">
                        <span className="text-[#A6ADA7]">Persetujuan FPIC</span>
                        <span
                          className={cx(
                            "font-semibold",
                            selectedConsent?.status === "granted"
                              ? "text-[#72C99A]"
                              : "text-[#ED7770]"
                          )}
                        >
                          {selectedConsent?.status === "granted" ? "Aktif" : "Belum Ada / Dicabut"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-[#A6ADA7]">Tanda Terima</span>
                        <span className="font-mono text-[12px] text-[#F4F5F2]">
                          {selectedConsent?.receipt_id || "Belum ada"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {selectedSensors.length === 0 ? (
                        <p className="text-[13px] text-[#A6ADA7]">Tidak ada sensor terhubung.</p>
                      ) : (
                        selectedSensors.map((s) => (
                          <div
                            key={s.sensor_id}
                            className="flex items-center justify-between rounded-xl border border-[#252B27] bg-[#1D211E] px-3.5 py-2.5"
                          >
                            <span className="flex items-center gap-2 font-mono text-[12px] text-[#F4F5F2]">
                              <Radio className="h-3.5 w-3.5 text-[#AA9AF5]" aria-hidden="true" />
                              {s.sensor_id}
                            </span>
                            <span className="text-[12px] text-[#A6ADA7] xb-numeric">
                              {s.temperature.toFixed(1)}°C · RH {s.humidity}%
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <ul className="mt-4 divide-y divide-[#252B27]">
                    {risk?.factors.map((factor) => (
                      <li key={factor.label} className="flex items-center justify-between gap-3 py-2.5">
                        <div>
                          <p className="text-[13px] font-medium text-[#F4F5F2]">{factor.label}</p>
                          <p className="text-[12px] text-[#A6ADA7]">{factor.detail}</p>
                        </div>
                        <span className="font-mono text-[12px] font-semibold text-[#F2B84B]">
                          +{factor.weight}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}
          </div>

          {/* Right Order & Settlement Calculator Card */}
          <Card className="flex flex-col justify-between p-6 xl:sticky xl:top-24">
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-2 border-b border-[#252B27] pb-4">
                <div>
                  <p className="text-[12px] font-medium text-[#A6ADA7]">Simulasi Order Karbon</p>
                  <h2 className="mt-1 text-[18px] font-semibold text-[#F4F5F2]">
                    {selected?.name ?? "Pilih Parcel"}
                  </h2>
                </div>
                {selected && <StatusPill status={selected.verificationStatus} />}
              </div>

              {!eligible ? (
                <div className="flex items-start gap-3 rounded-xl border border-[#ED7770]/40 bg-[#ED7770]/12 p-4">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#ED7770]" aria-hidden="true" />
                  <div className="text-[13px] leading-relaxed text-[#F4F5F2]">
                    <p className="font-semibold text-[#ED7770]">Pembelian Diblokir Sistem</p>
                    <p className="mt-1 text-[#A6ADA7]">
                      Hanya lahan berstatus TERVERIFIKASI dengan izin komunitas aktif yang boleh
                      ditransaksikan di Carbon Market.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex items-center justify-between text-[12.5px]">
                      <label htmlFor="order-units" className="font-medium text-[#A6ADA7]">
                        Jumlah Unit (tCO₂e)
                      </label>
                      <span className="text-[#72C99A] xb-numeric">
                        Tersedia: {formatNumber(available)} ton
                      </span>
                    </div>
                    <input
                      id="order-units"
                      type="number"
                      min={1}
                      max={available}
                      value={volumeInput}
                      onChange={(e) => {
                        setVolumeInput(e.target.value);
                        setOrderFeedback(null);
                      }}
                      className="mt-2 min-h-[48px] w-full rounded-xl border border-[#39423C] bg-[#090B0A] px-4 text-[18px] font-semibold text-[#F4F5F2] xb-numeric"
                    />
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {[5, 10, 25, available].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setVolumeInput(String(Math.min(preset, available)));
                            setOrderFeedback(null);
                          }}
                          className="min-h-[40px] rounded-xl border border-[#39423C] bg-[#1D211E] text-[12px] font-semibold text-[#A6ADA7] hover:bg-[#242925] hover:text-[#F4F5F2]"
                        >
                          {idx === 3 ? "Max" : preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Settlement Breakdown (2% / 60% / 40%) */}
                  <div className="space-y-2.5 rounded-xl border border-[#252B27] bg-[#1D211E] p-4 text-[13px]">
                    <div className="flex justify-between">
                      <span className="text-[#A6ADA7]">Total Bruto</span>
                      <span className="font-semibold text-[#F4F5F2] xb-numeric">
                        {formatIdr(settlement.gross_idr)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A6ADA7]">Biaya Sandbox MRV (2%)</span>
                      <span className="text-[#F2B84B] xb-numeric">-{formatIdr(settlement.sandbox_fee_idr)}</span>
                    </div>
                    <div className="border-t border-[#252B27] pt-2.5">
                      {/* Visual allocation bar — 60% community / 40% ops */}
                      <div className="mb-2.5 flex h-1.5 w-full overflow-hidden rounded-full">
                        <div className="h-full w-[60%] bg-[#72C99A]" />
                        <div className="h-full w-[40%] bg-[#AA9AF5]" />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A6ADA7]">Kas Komunitas (60%)</span>
                        <span className="font-semibold text-[#72C99A] xb-numeric">
                          {formatIdr(settlement.community_idr)}
                        </span>
                      </div>
                      <div className="mt-1.5 flex justify-between">
                        <span className="text-[#A6ADA7]">Operasi Pengelola (40%)</span>
                        <span className="font-semibold text-[#AA9AF5] xb-numeric">
                          {formatIdr(settlement.operations_idr)}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {orderFeedback && (
                <div
                  className={cx(
                    "flex items-start gap-2.5 rounded-xl border p-3.5 text-[12.5px]",
                    orderFeedback.ok
                      ? "border-[#72C99A]/40 bg-[#23865A]/18 text-[#72C99A]"
                      : "border-[#ED7770]/45 bg-[#ED7770]/12 text-[#ED7770]"
                  )}
                >
                  {orderFeedback.ok ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  )}
                  <div>
                    <p className="font-medium text-[#F4F5F2]">{orderFeedback.message}</p>
                    {orderFeedback.txId && (
                      <p className="mt-1 font-mono text-[11.5px] text-[#72C99A]">
                        ID: {orderFeedback.txId}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2.5 pt-1">
                <Button
                  variant="lavender"
                  disabled={!eligible || clampedUnits <= 0}
                  onClick={handleOrder}
                  className="h-12 w-full rounded-full text-[14px]"
                >
                  Ajukan Order Simulasi ({clampedUnits} tCO₂e)
                </Button>

                {orderFeedback?.ok ? (
                  <Link
                    href="/portfolio"
                    className={buttonClass("secondary", "h-11 w-full rounded-full text-[13px]")}
                  >
                    Lihat di Portfolio
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : (
                  <p className="text-center text-[12px] text-[#8B948D]">
                    Berperan aktif sebagai <span className="text-[#F4F5F2]">{role}</span> · Mode
                    testnet tanpa dana nyata
                  </p>
                )}
              </div>
            </div>
          </Card>
        </section>

        {/* Settlement History */}
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#252B27] px-5 py-4">
            <div>
              <h2 className="text-[16px] font-semibold text-[#F4F5F2]">Riwayat Settlement Simulasi</h2>
              <p className="mt-0.5 text-[12.5px] text-[#A6ADA7]">
                {transactions.length} order tercatat (fee 2% · komunitas 60% · operasi 40%)
              </p>
            </div>
            <Link
              href="/activity"
              className="inline-flex min-h-[44px] items-center gap-1 text-[13px] font-semibold text-[#AA9AF5] hover:underline"
            >
              Timeline Lengkap
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {transactions.length === 0 ? (
            <EmptyState
              title="Belum ada transaksi simulasi"
              body="Ajukan order simulasi pada parcel terverifikasi untuk melihat pembagian hasil."
            />
          ) : (
            <ScrollArea orientation="horizontal">
              <table className="w-full min-w-[680px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#252B27] text-[12px] font-medium text-[#8B948D]">
                    <th className="px-5 py-3">ID Order</th>
                    <th className="px-3 py-3">Parcel</th>
                    <th className="px-3 py-3 text-right">Volume</th>
                    <th className="px-3 py-3 text-right">Bruto</th>
                    <th className="px-3 py-3 text-right">Fee 2%</th>
                    <th className="px-3 py-3 text-right">Komunitas 60%</th>
                    <th className="px-5 py-3 text-right">Operasi 40%</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.tx_id} className="border-b border-[#252B27] last:border-0 hover:bg-[#1D211E]">
                      <td className="px-5 py-3.5 font-mono text-[12.5px] text-[#F4F5F2]">{tx.tx_id}</td>
                      <td className="px-3 py-3.5 font-mono text-[12.5px] text-[#A6ADA7]">
                        {tx.parcel_id}
                      </td>
                      <td className="px-3 py-3.5 text-right text-[13px] text-[#F4F5F2] xb-numeric">
                        {formatNumber(tx.volume_tco2e)} tCO₂e
                      </td>
                      <td className="px-3 py-3.5 text-right text-[13px] text-[#F4F5F2] xb-numeric">
                        {formatIdrShort(tx.gross_amount_idr)}
                      </td>
                      <td className="px-3 py-3.5 text-right text-[13px] text-[#F2B84B] xb-numeric">
                        {formatIdrShort(tx.mrv_allocation_idr)}
                      </td>
                      <td className="px-3 py-3.5 text-right text-[13px] font-semibold text-[#72C99A] xb-numeric">
                        {formatIdrShort(tx.community_allocation_idr)}
                      </td>
                      <td className="px-5 py-3.5 text-right text-[13px] font-semibold text-[#AA9AF5] xb-numeric">
                        {formatIdrShort(tx.manager_allocation_idr)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          )}
        </Card>

        <Disclosure />
      </div>
    </AppShell>
  );
}
