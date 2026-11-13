"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  AlertTriangle,
  Lock,
  RefreshCw,
  Search,
  ShieldAlert,
  ArrowUpRight,
} from "lucide-react";
import { BotanicalAppShell } from "@/components/dapp/BotanicalAppShell";
import { CarbonMap } from "@/components/dapp/CarbonMap";
import { ParcelInspectionPanel } from "@/components/dapp/ParcelInspectionPanel";
import {
  BotanicalCard,
  BotanicalPageHeader,
  CanonicalStatusBadge,
  PageStatePanel,
} from "@/components/dapp/BotanicalPrimitives";
import { useDashboardState } from "@/components/dapp/useDashboardStore";
import { normalizeUserRole, type SensorData } from "@/context/DappContext";
import { toCanonicalStatus, type CanonicalStatus } from "@/lib/dashboard-helpers";
import { formatNumber } from "@/components/dapp/phantom-ui";
import { LiveClock } from "@/components/motion";

type StatusFilter = "ALL" | CanonicalStatus;

const STATUS_FILTER_OPTIONS: { id: StatusFilter; label: string }[] = [
  { id: "ALL", label: "Semua lahan" },
  { id: "VERIFIED", label: "Terverifikasi" },
  { id: "WARNING", label: "Perlu perhatian" },
  { id: "DISPUTE", label: "Keberatan warga" },
  { id: "BLOCKED", label: "Ditahan" },
];

export function PetaView({ initialParcelId }: { initialParcelId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, parcels, sensors, aiAssessments, consentRecords, verificationRecords, isLoading } =
    useDashboardState();

  const role = normalizeUserRole(user?.role, user?.email);
  const queryParcel = searchParams.get("parcel");
  const stateParam = searchParams.get("state");

  const [selectedId, setSelectedId] = useState<string>(
    initialParcelId || queryParcel || parcels[0]?.id || "PARCEL-A"
  );
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [forceMapDataError, setForceMapDataError] = useState(stateParam === "gagal");
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>("Baru saja");
  const [driftSensors, setDriftSensors] = useState<SensorData[]>(sensors);

  // Telemetri simulasi: nilai sensor menggeser halus tiap 4 detik supaya
  // peta dan panel inspeksi terasa hidup tanpa menyentuh source context.
  useEffect(() => {
    setDriftSensors(sensors);
  }, [sensors]);

  useEffect(() => {
    const timer = setInterval(() => {
      setDriftSensors((prev) =>
        prev.map((s) => ({
          ...s,
          temperature: Math.round(Math.max(16, Math.min(34, s.temperature + (Math.random() - 0.5) * 0.8)) * 10) / 10,
          humidity: Math.round(Math.max(52, Math.min(98, s.humidity + (Math.random() - 0.5) * 2.4)) * 10) / 10,
          soil_moisture: Math.round(Math.max(30, Math.min(88, s.soil_moisture + (Math.random() - 0.5) * 1.8)) * 10) / 10,
          co2e_tonPerDay: Math.max(0, Math.round((s.co2e_tonPerDay + (Math.random() - 0.5) * 0.02) * 1000) / 1000),
        }))
      );
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const requested = initialParcelId || queryParcel;
    if (requested && parcels.some((p) => p.id.toLowerCase() === requested.toLowerCase())) {
      const exact = parcels.find((p) => p.id.toLowerCase() === requested.toLowerCase());
      if (exact) setSelectedId(exact.id);
    }
  }, [initialParcelId, queryParcel, parcels]);

  useEffect(() => {
    setForceMapDataError(stateParam === "gagal");
  }, [stateParam]);

  const filteredParcels = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return parcels.filter((parcel) => {
      const canonical = toCanonicalStatus(parcel.verificationStatus);
      if (statusFilter !== "ALL" && canonical !== statusFilter) return false;
      if (!q) return true;
      return (
        parcel.id.toLowerCase().includes(q) ||
        parcel.name.toLowerCase().includes(q) ||
        parcel.region.toLowerCase().includes(q) ||
        parcel.community.toLowerCase().includes(q)
      );
    });
  }, [parcels, searchText, statusFilter]);

  const selected = useMemo(() => {
    return (
      filteredParcels.find((p) => p.id === selectedId) ??
      filteredParcels[0] ??
      parcels.find((p) => p.id === selectedId) ??
      parcels[0]
    );
  }, [filteredParcels, parcels, selectedId]);

  const pageState: "loading" | "empty" | "ready" = isLoading || stateParam === "memuat"
    ? "loading"
    : parcels.length === 0 || stateParam === "kosong"
    ? "empty"
    : "ready";

  const totalArea = useMemo(
    () => parcels.reduce((sum, item) => sum + item.area, 0),
    [parcels]
  );

  const handleSelectParcel = (parcelId: string) => {
    setSelectedId(parcelId);
    router.replace(`/peta/${encodeURIComponent(parcelId)}`, { scroll: false });
  };

  const handleRefresh = () => {
    setForceMapDataError(false);
    const now = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date());
    setLastRefreshedAt(`${now.replaceAll(".", ":")} WIB`);
  };

  return (
    <BotanicalAppShell>
      <div className="space-y-5">
        <BotanicalPageHeader
          title="Peta & Kondisi Lahan"
          description={`Memantau ${formatNumber(totalArea)} hektare hutan binaan di Bogor melalui peta dasar OpenStreetMap, batas poligon GeoJSON, dan ${sensors.length} sensor lapangan.`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <span className="xb-numeric hidden items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2 text-[13px] font-semibold text-[var(--ink-muted)] sm:inline-flex">
                <span aria-hidden="true" className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--forest-700)] opacity-55" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--forest-700)]" />
                </span>
                <LiveClock />
              </span>
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-[14.5px] font-semibold text-[var(--ink)] transition-transform duration-150 hover:scale-[1.01] active:scale-95 hover:bg-[var(--surface-soft)]"
              >
                <RefreshCw className="h-4 w-4 text-[var(--forest-700)]" aria-hidden="true" />
                <span className="xb-numeric">Segarkan ({lastRefreshedAt})</span>
              </button>
            </div>
          }
        />

        <PageStatePanel
          state={pageState}
          onRetry={handleRefresh}
          emptyTitle="Belum ada poligon lahan terdaftar"
          emptyDescription="Tambahkan berkas GeoJSON lahan atau periksa sambungan ke layanan data lapangan."
        >
          {/* Search and canonical status filter bar */}
          <BotanicalCard className="p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative min-w-0 flex-1 lg:max-w-[360px]">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]"
                  aria-hidden="true"
                />
                <label htmlFor="peta-search" className="sr-only">
                  Cari nama atau kode lahan
                </label>
                <input
                  id="peta-search"
                  type="search"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Cari kode lahan, nama blok, atau komunitas..."
                  className="h-11 w-full rounded-full border border-[var(--line)] bg-[var(--surface-soft)] pl-10 pr-4 text-[15px] text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:border-[var(--forest-700)] focus:bg-[var(--surface)] focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Saring status lahan">
                {STATUS_FILTER_OPTIONS.map((opt) => {
                  const active = statusFilter === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setStatusFilter(opt.id)}
                      aria-pressed={active}
                      className={`min-h-[40px] rounded-full border px-3.5 text-[14px] font-semibold ${
                        active
                          ? "border-[var(--forest-700)] bg-[var(--forest-700)] text-white"
                          : "border-[var(--line)] bg-[var(--surface-soft)] text-[var(--ink-muted)] hover:bg-[var(--leaf-100)] hover:text-[var(--ink)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accessible legend pairing color + icon + label */}
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--line-subtle)] pt-3 text-[13.5px] font-medium text-[var(--ink-muted)]">
              <span className="inline-flex items-center gap-1.5 text-[var(--status-verified-ink)]">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                <span>Terverifikasi (siap)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[var(--status-warning-ink)]">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                <span>Perlu perhatian (peringatan)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[var(--status-dispute-ink)]">
                <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                <span>Keberatan warga</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[var(--status-blocked-ink)]">
                <Lock className="h-4 w-4" aria-hidden="true" />
                <span>Ditahan sistem</span>
              </span>
            </div>
          </BotanicalCard>

          {/* Main Geospatial Grid: Map (Left) + Parcel Detail Inspector (Right) */}
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="min-w-0 space-y-4">
              <BotanicalCard className="overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] bg-[var(--surface)] px-5 py-3">
                  <div>
                    <p className="xb-display text-[16px] font-bold text-[var(--ink)]">
                      Peta Interaktif Poligon Hutan
                    </p>
                    <p className="text-[13.5px] text-[var(--ink-muted)]">
                      Klik area poligon atau ikon sensor (S) untuk memilih lahan
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/screener"
                      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 text-[13.5px] font-semibold text-[var(--ink)] hover:bg-[var(--leaf-100)]"
                    >
                      <span>Lihat tabel Screener</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-[var(--forest-700)]" aria-hidden="true" />
                    </Link>
                  </div>
                </div>

                <CarbonMap
                  parcels={filteredParcels}
                  allParcels={parcels}
                  sensors={driftSensors}
                  selectedId={selected?.id ?? null}
                  onSelect={handleSelectParcel}
                  forceError={forceMapDataError}
                  onRefreshExternal={handleRefresh}
                  className="h-[400px] sm:h-[470px] xl:h-[540px]"
                />
              </BotanicalCard>

              {/* Quick parcel switcher cards (fills odd trailing row cleanly) */}
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredParcels.length === 0 ? (
                  <BotanicalCard className="col-span-full p-5">
                    <p className="text-[15.5px] font-semibold text-[var(--ink)]">
                      Tidak ada lahan yang sesuai dengan saringan ini.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchText("");
                        setStatusFilter("ALL");
                      }}
                      className="mt-3 inline-flex min-h-[42px] items-center rounded-full bg-[var(--forest-700)] px-4 text-[14px] font-semibold text-white transition-transform duration-150 hover:scale-[1.02] active:scale-95 hover:bg-[var(--forest-800)]"
                    >
                      Tampilkan semua lahan
                    </button>
                  </BotanicalCard>
                ) : (
                  filteredParcels.map((parcel, idx) => {
                    const active = parcel.id === selected?.id;
                    const canonical = toCanonicalStatus(parcel.verificationStatus);
                    const isOddTail =
                      filteredParcels.length % 2 === 1 && idx === filteredParcels.length - 1;
                    return (
                      <button
                        key={parcel.id}
                        type="button"
                        onClick={() => handleSelectParcel(parcel.id)}
                        className={`flex min-h-[44px] flex-col items-start justify-between gap-2 rounded-2xl border p-4 text-left transition-all duration-200 active:scale-[0.98] ${
                          isOddTail ? "sm:col-span-2" : ""
                        } ${
                          active
                            ? "border-[var(--forest-700)] bg-[var(--leaf-100)]/70 shadow-sm"
                            : "border-[var(--line)] bg-[var(--surface)] hover:-translate-y-0.5 hover:bg-[var(--surface-soft)]"
                        }`}
                      >
                        <div className="flex w-full items-center justify-between gap-2">
                          <span className="xb-mono text-[13px] font-semibold text-[var(--forest-700)]">
                            {parcel.id}
                          </span>
                          <CanonicalStatusBadge status={canonical} compact />
                        </div>
                        <p className="xb-display text-[16px] font-bold text-[var(--ink)]">
                          {parcel.name}
                        </p>
                        <p className="xb-numeric text-[14px] text-[var(--ink-muted)]">
                          {formatNumber(parcel.area)} ha · {formatNumber(parcel.availableUnits)} tCO2e siap
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right contextual inspection panel */}
            <div className="min-w-0">
              {selected && (
                <ParcelInspectionPanel
                  parcel={selected}
                  sensors={driftSensors}
                  assessment={aiAssessments.find((a) => a.parcel_id === selected.id)}
                  verification={verificationRecords.find((v) => v.parcel_id === selected.id)}
                  consent={consentRecords.find((c) => c.parcel_id === selected.id)}
                  role={role}
                />
              )}
            </div>
          </div>
        </PageStatePanel>
      </div>
    </BotanicalAppShell>
  );
}

