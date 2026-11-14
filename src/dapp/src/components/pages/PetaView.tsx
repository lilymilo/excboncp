"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Crosshair,
  Globe2,
  Lock,
  MapPinned,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  Upload,
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
import { Pagination } from "@/components/ui/Pagination";
import { useDashboardState } from "@/components/dapp/useDashboardStore";
import { normalizeUserRole, type ParcelItem, type SensorData } from "@/context/DappContext";
import { toCanonicalStatus, type CanonicalStatus } from "@/lib/dashboard-helpers";
import {
  type GeoJsonFeature,
  type GeoJsonFeatureCollection,
} from "@/lib/exbon-api";
import { formatNumber } from "@/components/dapp/phantom-ui";
import { LiveClock } from "@/components/motion";

type StatusFilter = "ALL" | CanonicalStatus;
type RegionId = "bogor" | "kaltim" | "sumatera" | "jateng" | "semua" | "kustom";
type PresetRegionId = Exclude<RegionId, "kustom">;

interface RegionPreset {
  id: PresetRegionId;
  label: string;
  shortLabel: string;
  detail: string;
  match: (parcel: ParcelItem) => boolean;
}

const STATUS_FILTER_OPTIONS: { id: StatusFilter; label: string; dot?: string }[] = [
  { id: "ALL", label: "Semua lahan" },
  { id: "VERIFIED", label: "Terverifikasi", dot: "bg-[#2e6b3f]" },
  { id: "WARNING", label: "Perlu perhatian", dot: "bg-[#e8b33c]" },
  { id: "DISPUTE", label: "Keberatan warga", dot: "bg-[#e8863c]" },
  { id: "BLOCKED", label: "Ditahan", dot: "bg-[#ef5d6b]" },
];

const REGION_PRESETS: RegionPreset[] = [
  {
    id: "bogor",
    label: "Bogor",
    shortLabel: "Bogor",
    detail: "Jawa Barat",
    match: (parcel) => /bogor|sentul|cijeruk|citeureup|cibinong/i.test(parcel.region),
  },
  {
    id: "kaltim",
    label: "IKN & Kaltim",
    shortLabel: "IKN",
    detail: "Kalimantan Timur",
    match: (parcel) => /kalimantan timur/i.test(parcel.region),
  },
  {
    id: "sumatera",
    label: "Sumatera",
    shortLabel: "Sumatera",
    detail: "Sumatera Utara",
    match: (parcel) => /sumatera/i.test(parcel.region),
  },
  {
    id: "jateng",
    label: "Jawa Tengah",
    shortLabel: "Jateng",
    detail: "Kendal",
    match: (parcel) => /jawa tengah/i.test(parcel.region),
  },
  {
    id: "semua",
    label: "Semua wilayah",
    shortLabel: "Semua",
    detail: "Seluruh data demo",
    match: () => true,
  },
];

const PARCEL_PAGE_SIZE = 4;

function regionForParcel(parcel: ParcelItem): PresetRegionId {
  return REGION_PRESETS.find((preset) => preset.id !== "semua" && preset.match(parcel))?.id ?? "bogor";
}

function makeCircleBoundary(lat: number, lon: number, radiusKm: number): GeoJsonFeatureCollection {
  const points = 64;
  const earthRadiusKm = 6371;
  const coordinates: number[][] = [];

  for (let index = 0; index <= points; index += 1) {
    const angle = (index / points) * Math.PI * 2;
    const deltaLat = (radiusKm / earthRadiusKm) * Math.cos(angle);
    const deltaLon =
      (radiusKm / (earthRadiusKm * Math.cos((lat * Math.PI) / 180))) * Math.sin(angle);
    coordinates.push([
      lon + (deltaLon * 180) / Math.PI,
      lat + (deltaLat * 180) / Math.PI,
    ]);
  }

  return {
    type: "FeatureCollection",
    name: "Wilayah uji",
    features: [
      {
        type: "Feature",
        properties: { name: "Wilayah uji" },
        geometry: { type: "Polygon", coordinates: [coordinates] },
      },
    ],
  };
}

function isBoundaryGeometry(value: unknown): value is GeoJsonFeature["geometry"] {
  if (!value || typeof value !== "object") return false;
  const geometry = value as { type?: unknown; coordinates?: unknown };
  return (
    (geometry.type === "Polygon" || geometry.type === "MultiPolygon") &&
    Array.isArray(geometry.coordinates)
  );
}

function normalizeBoundary(input: unknown): GeoJsonFeatureCollection | null {
  if (!input || typeof input !== "object") return null;
  const value = input as {
    type?: unknown;
    features?: unknown;
    geometry?: unknown;
    properties?: unknown;
  };

  if (value.type === "FeatureCollection" && Array.isArray(value.features)) {
    const features = value.features.filter((feature): feature is GeoJsonFeature => {
      if (!feature || typeof feature !== "object") return false;
      const candidate = feature as { type?: unknown; geometry?: unknown };
      return candidate.type === "Feature" && isBoundaryGeometry(candidate.geometry);
    });

    if (features.length === 0 || features.length > 100) return null;
    return { type: "FeatureCollection", features };
  }

  if (value.type === "Feature" && isBoundaryGeometry(value.geometry)) {
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: (value.properties as Record<string, unknown>) ?? {},
          geometry: value.geometry,
        },
      ],
    };
  }

  if (isBoundaryGeometry(value)) {
    return {
      type: "FeatureCollection",
      features: [{ type: "Feature", properties: {}, geometry: value }],
    };
  }

  return null;
}

export function PetaView({ initialParcelId }: { initialParcelId?: string }) {
  const searchParams = useSearchParams();
  const { user, parcels, sensors, aiAssessments, consentRecords, verificationRecords, isLoading } =
    useDashboardState();

  const role = normalizeUserRole(user?.role, user?.email);
  const queryParcel = searchParams.get("parcel");
  const stateParam = searchParams.get("state");
  const regionParam = searchParams.get("region");
  const requestedParcel = initialParcelId || queryParcel;

  const initialRegion = useMemo<RegionId>(() => {
    const queryRegion = REGION_PRESETS.find((preset) => preset.id === regionParam)?.id;
    if (queryRegion) return queryRegion;

    const requested = requestedParcel?.trim().toUpperCase();
    const parcel = requested
      ? parcels.find((item) => item.id.toUpperCase() === requested)
      : undefined;
    return parcel ? regionForParcel(parcel) : "bogor";
  }, [parcels, regionParam, requestedParcel]);

  const [regionId, setRegionId] = useState<RegionId>(initialRegion);
  const [selectedId, setSelectedId] = useState<string>(
    initialParcelId || queryParcel || parcels[0]?.id || "PARCEL-A"
  );
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [forceMapDataError, setForceMapDataError] = useState(stateParam === "gagal");
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>("Baru saja");
  const [mapRefreshKey, setMapRefreshKey] = useState(0);
  const [driftSensors, setDriftSensors] = useState<SensorData[]>(sensors);
  const [parcelPage, setParcelPage] = useState(1);
  const [regionToolsOpen, setRegionToolsOpen] = useState(false);
  const [pickingCenter, setPickingCenter] = useState(false);
  const [customLat, setCustomLat] = useState("-6.5995");
  const [customLon, setCustomLon] = useState("106.7985");
  const [customRadius, setCustomRadius] = useState("2");
  const [customBoundary, setCustomBoundary] = useState<GeoJsonFeatureCollection | null>(null);
  const [customLabel, setCustomLabel] = useState("");
  const [regionError, setRegionError] = useState<string | null>(null);

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
    if (!requestedParcel) return;
    const exact = parcels.find(
      (parcel) => parcel.id.toLowerCase() === requestedParcel.toLowerCase()
    );
    if (!exact) return;

    setSelectedId(exact.id);
    setRegionId((current) => {
      if (current === "kustom" || current === "semua") return current;
      return regionForParcel(exact);
    });
  }, [requestedParcel, parcels]);

  useEffect(() => {
    setForceMapDataError(stateParam === "gagal");
  }, [stateParam]);

  const activePreset = REGION_PRESETS.find((preset) => preset.id === regionId);

  const regionParcels = useMemo(() => {
    if (regionId === "kustom") return [];
    if (regionId === "semua") return parcels;
    return parcels.filter((parcel) => activePreset?.match(parcel) ?? false);
  }, [activePreset, parcels, regionId]);

  const filteredParcels = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return regionParcels.filter((parcel) => {
      const canonical = toCanonicalStatus(parcel.verificationStatus);
      if (statusFilter !== "ALL" && canonical !== statusFilter) return false;
      if (!query) return true;
      return (
        parcel.id.toLowerCase().includes(query) ||
        parcel.name.toLowerCase().includes(query) ||
        parcel.region.toLowerCase().includes(query) ||
        parcel.community.toLowerCase().includes(query)
      );
    });
  }, [regionParcels, searchText, statusFilter]);

  const selected = useMemo(() => {
    if (regionId === "kustom") return null;
    return (
      filteredParcels.find((parcel) => parcel.id === selectedId) ??
      filteredParcels[0] ??
      regionParcels.find((parcel) => parcel.id === selectedId) ??
      regionParcels[0] ??
      null
    );
  }, [filteredParcels, regionId, regionParcels, selectedId]);

  const regionCounts = useMemo(() => {
    const counts: Record<PresetRegionId, number> = {
      bogor: 0,
      kaltim: 0,
      sumatera: 0,
      jateng: 0,
      semua: parcels.length,
    };
    parcels.forEach((parcel) => {
      counts[regionForParcel(parcel)] += 1;
    });
    return counts;
  }, [parcels]);

  const regionSensors = useMemo(() => {
    const ids = new Set(regionParcels.map((parcel) => parcel.id));
    return driftSensors.filter((sensor) => ids.has(sensor.parcel_id));
  }, [driftSensors, regionParcels]);

  const totalArea = useMemo(
    () => regionParcels.reduce((sum, item) => sum + item.area, 0),
    [regionParcels]
  );

  const totalParcelPages = Math.max(1, Math.ceil(filteredParcels.length / PARCEL_PAGE_SIZE));
  const safeParcelPage = Math.min(parcelPage, totalParcelPages);
  const visibleParcels = filteredParcels.slice(
    (safeParcelPage - 1) * PARCEL_PAGE_SIZE,
    safeParcelPage * PARCEL_PAGE_SIZE
  );

  useEffect(() => {
    setParcelPage(1);
  }, [searchText, statusFilter, regionId]);

  useEffect(() => {
    const index = filteredParcels.findIndex((parcel) => parcel.id === selectedId);
    if (index >= 0) {
      setParcelPage(Math.floor(index / PARCEL_PAGE_SIZE) + 1);
    }
  }, [filteredParcels, selectedId]);

  useEffect(() => {
    if (parcelPage > totalParcelPages) setParcelPage(totalParcelPages);
  }, [parcelPage, totalParcelPages]);

  const pageState: "loading" | "empty" | "ready" = isLoading || stateParam === "memuat"
    ? "loading"
    : parcels.length === 0 || stateParam === "kosong"
    ? "empty"
    : "ready";

  const activeRegionLabel =
    regionId === "kustom"
      ? customLabel || "Wilayah uji kustom"
      : activePreset?.label ?? "Bogor";

  const replaceUrl = (path: string) => {
    // URL tetap berubah untuk deep link, tetapi state peta tidak di-remount.
    if (typeof window !== "undefined") window.history.replaceState(null, "", path);
  };

  const handleSelectParcel = (parcelId: string) => {
    setSelectedId(parcelId);
    const regionQuery = regionId !== "kustom" ? `?region=${regionId}` : "";
    replaceUrl(`/peta/${encodeURIComponent(parcelId)}${regionQuery}`);
  };

  const handleRefresh = () => {
    setForceMapDataError(false);
    setMapRefreshKey((key) => key + 1);
    const now = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date());
    setLastRefreshedAt(`${now.replaceAll(".", ":")} WIB`);
  };

  const applyPreset = (nextRegion: PresetRegionId) => {
    const preset = REGION_PRESETS.find((item) => item.id === nextRegion);
    const list =
      nextRegion === "semua" ? parcels : parcels.filter((parcel) => preset?.match(parcel));

    setRegionId(nextRegion);
    setCustomBoundary(null);
    setCustomLabel("");
    setRegionError(null);
    setPickingCenter(false);
    setParcelPage(1);
    setRegionToolsOpen(false);

    const first = list[0];
    if (first) {
      setSelectedId(first.id);
      if (nextRegion === "semua") {
        // Jangan deep-link ke satu parcel: rute parcel akan mengembalikan
        // filter ke region pemiliknya saat halaman dimuat ulang.
        replaceUrl("/peta?region=semua");
      } else {
        replaceUrl(`/peta/${encodeURIComponent(first.id)}?region=${nextRegion}`);
      }
    }
  };

  const applyCustomRegion = () => {
    const lat = Number(customLat);
    const lon = Number(customLon);
    const radius = Number(customRadius);

    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      setRegionError("Latitude harus berada di antara -90 dan 90.");
      return;
    }
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
      setRegionError("Longitude harus berada di antara -180 dan 180.");
      return;
    }
    if (!Number.isFinite(radius) || radius < 0.1 || radius > 200) {
      setRegionError("Radius wilayah harus 0,1–200 km.");
      return;
    }

    setCustomBoundary(makeCircleBoundary(lat, lon, radius));
    setCustomLabel(`Kustom ${lat.toFixed(3)}, ${lon.toFixed(3)} · ${radius} km`);
    setRegionId("kustom");
    setRegionError(null);
    setPickingCenter(false);
    setParcelPage(1);
    setRegionToolsOpen(false);
    replaceUrl("/peta");
  };

  const handleBoundaryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setRegionError("Ukuran berkas GeoJSON maksimal 2 MB.");
      return;
    }

    try {
      const parsed = JSON.parse(await file.text());
      const boundary = normalizeBoundary(parsed);
      if (!boundary) {
        setRegionError("GeoJSON harus berisi geometri Polygon atau MultiPolygon.");
        return;
      }

      setCustomBoundary(boundary);
      setCustomLabel(file.name.replace(/\.(geojson|json)$/i, ""));
      setRegionId("kustom");
      setRegionError(null);
      setPickingCenter(false);
      setParcelPage(1);
      setRegionToolsOpen(false);
      replaceUrl("/peta");
    } catch {
      setRegionError("Berkas tidak dapat dibaca sebagai GeoJSON yang valid.");
    }
  };

  const handleMapClick = (point: { lat: number; lng: number }) => {
    if (!pickingCenter) return;
    setCustomLat(point.lat.toFixed(5));
    setCustomLon(point.lng.toFixed(5));
    setPickingCenter(false);
    setRegionError(null);
  };

  return (
    <BotanicalAppShell>
      <div className="space-y-5">
        <BotanicalPageHeader
          title="Peta & Kondisi Lahan"
          description={
            regionId === "kustom"
              ? "Mode uji wilayah: boundary kustom aktif, pilih layer OSM atau citra satelit. Data lahan demo tetap tersedia di Bogor, IKN/Kaltim, Sumatera, dan Jawa Tengah."
              : `${formatNumber(totalArea)} hektare pada ${activeRegionLabel} · ${regionParcels.length} lahan demo · ${regionSensors.length} sensor. Pilih wilayah lain atau uji wilayah sendiri lewat panel Uji wilayah.`
          }
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/bantuan"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-[14.5px] font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-soft)]"
              >
                <BookOpen className="h-4 w-4 text-[var(--forest-700)]" aria-hidden="true" />
                <span>Panduan</span>
              </Link>
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
          {/* Search and canonical status filter bar — Apple HIG Inset Layout */}
          <BotanicalCard className="p-3.5 sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative min-w-0 flex-1 lg:max-w-[340px]">
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
                  placeholder="Cari lahan, blok, komunitas..."
                  className="h-10 w-full rounded-[10px] border border-[var(--line-subtle)] bg-[var(--surface-sunken)] pl-10 pr-8 text-[14px] text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:border-[var(--forest-700)] focus:bg-[var(--surface)] focus:outline-none transition-colors"
                />
                {searchText && (
                  <button
                    type="button"
                    onClick={() => setSearchText("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[var(--ink-muted)]/20 text-[var(--ink-muted)] flex items-center justify-center text-[10px] hover:bg-[var(--ink-muted)]/40 transition-colors"
                    aria-label="Bersihkan pencarian"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Status Segmented Filter Pills with Integrated Apple Indicator Dots */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 lg:flex-wrap lg:overflow-visible" role="group" aria-label="Saring status lahan">
                {STATUS_FILTER_OPTIONS.map((opt) => {
                  const active = statusFilter === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setStatusFilter(opt.id)}
                      aria-pressed={active}
                      className={`inline-flex items-center gap-1.5 min-h-[36px] shrink-0 rounded-full px-3.5 text-[13px] font-semibold transition-all active:scale-[0.97] ${
                        active
                          ? "bg-[var(--forest-700)] text-white shadow-xs"
                          : "bg-[var(--surface-sunken)] border border-[var(--line-subtle)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--leaf-100)]"
                      }`}
                    >
                      {opt.dot && (
                        <span
                          className={`w-2 h-2 rounded-full transition-colors ${
                            active ? "bg-white" : opt.dot
                          }`}
                        />
                      )}
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </BotanicalCard>

          {/* Main Geospatial Grid: Map (Left) + Parcel Detail Inspector (Right) */}
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="min-w-0 space-y-4">
              <BotanicalCard className="overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] bg-[var(--surface)] px-5 py-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-[16px] font-bold tracking-tight text-[var(--ink)]">
                        Peta Interaktif Wilayah
                      </p>
                      <span className="inline-flex max-w-full items-center gap-1.5 rounded-[8px] border border-[var(--line-subtle)] bg-[var(--surface-sunken)] px-2.5 py-0.5 text-[12px] font-semibold text-[var(--ink-muted)]">
                        <MapPinned className="h-3.5 w-3.5 shrink-0 text-[var(--forest-700)]" aria-hidden="true" />
                        <span className="truncate">{activeRegionLabel}</span>
                      </span>
                    </div>
                    <p className="text-[13px] text-[var(--ink-muted)]">
                      {regionId === "kustom"
                        ? "Boundary wilayah uji aktif. Klik peta untuk memindahkan pusat, atau buka Uji wilayah untuk mengubah radius."
                        : "Pilih poligon atau titik sensor, atau uji wilayah lain di panel Uji wilayah."}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRegionToolsOpen((open) => !open)}
                      aria-expanded={regionToolsOpen}
                      className="inline-flex min-h-[36px] items-center gap-1.5 rounded-[10px] border border-[var(--line-subtle)] bg-[var(--leaf-100)] px-3 text-[13px] font-semibold text-[var(--forest-800)] transition-all hover:bg-[var(--leaf-200)] active:scale-[0.97]"
                    >
                      <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Uji wilayah</span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform ${regionToolsOpen ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      />
                    </button>
                    <Link
                      href="/screener"
                      className="inline-flex min-h-[36px] items-center gap-1.5 rounded-[10px] border border-[var(--line-subtle)] bg-[var(--surface-soft)] px-3 text-[13px] font-semibold text-[var(--ink)] transition-all hover:bg-[var(--surface-sunken)] active:scale-[0.97]"
                    >
                      <span>Lihat tabel Screener</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-[var(--forest-700)]" aria-hidden="true" />
                    </Link>
                  </div>
                </div>

                {regionToolsOpen && (
                  <div className="border-b border-[var(--line)] bg-[var(--surface-soft)] px-4 py-4 sm:px-5">
                    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Pilih wilayah peta">
                      {REGION_PRESETS.map((preset) => {
                        const active = regionId === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => applyPreset(preset.id)}
                            aria-pressed={active}
                            className={`inline-flex min-h-[36px] items-center gap-2 rounded-[10px] border px-3 text-[13px] font-semibold transition-all active:scale-[0.97] ${
                              active
                                ? "border-[var(--forest-700)] bg-[var(--forest-700)] text-white shadow-xs"
                                : "border-[var(--line-subtle)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--leaf-100)]"
                            }`}
                          >
                            <span>{preset.label}</span>
                            <span
                              className={`rounded-[6px] px-1.5 py-0.5 text-[11px] ${
                                active
                                  ? "bg-white/20 text-white"
                                  : "bg-[var(--surface-sunken)] text-[var(--ink-muted)]"
                              }`}
                            >
                              {regionCounts[preset.id]} lahan
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div
                      className={`mt-3 rounded-2xl border p-3.5 ${
                        regionId === "kustom"
                          ? "border-[#5B4B8A]/35 bg-[#F4F0FB]"
                          : "border-[var(--line)] bg-[var(--surface)]"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-[14px] font-bold text-[var(--ink)]">Wilayah kustom</p>
                          <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--ink-muted)]">
                            Tentukan pusat + radius, ambil titik dari peta, atau unggah GeoJSON. Data lahan demo tidak ikut berpindah.
                          </p>
                        </div>
                        {regionId === "kustom" && (
                          <span className="rounded-full bg-[#5B4B8A] px-2.5 py-0.5 text-[11.5px] font-semibold text-white">
                            Aktif
                          </span>
                        )}
                      </div>

                      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
                        <label className="block">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-dim)]">
                            Latitude
                          </span>
                          <input
                            type="number"
                            inputMode="decimal"
                            step="any"
                            min={-90}
                            max={90}
                            value={customLat}
                            onChange={(e) => setCustomLat(e.target.value)}
                            className="mt-1 h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-[13.5px] text-[var(--ink)] focus:border-[var(--forest-700)] focus:outline-none"
                          />
                        </label>
                        <label className="block">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-dim)]">
                            Longitude
                          </span>
                          <input
                            type="number"
                            inputMode="decimal"
                            step="any"
                            min={-180}
                            max={180}
                            value={customLon}
                            onChange={(e) => setCustomLon(e.target.value)}
                            className="mt-1 h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-[13.5px] text-[var(--ink)] focus:border-[var(--forest-700)] focus:outline-none"
                          />
                        </label>
                        <label className="block">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-dim)]">
                            Radius (km)
                          </span>
                          <input
                            type="number"
                            inputMode="decimal"
                            step="0.1"
                            min={0.1}
                            max={200}
                            value={customRadius}
                            onChange={(e) => setCustomRadius(e.target.value)}
                            className="mt-1 h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-[13.5px] text-[var(--ink)] focus:border-[var(--forest-700)] focus:outline-none"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={applyCustomRegion}
                          className="mt-auto inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl bg-[#5B4B8A] px-4 text-[13.5px] font-semibold text-white transition hover:bg-[#4A3B73] active:scale-[0.98]"
                        >
                          <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Terapkan</span>
                        </button>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPickingCenter((picking) => !picking)}
                          aria-pressed={pickingCenter}
                          className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-semibold transition ${
                            pickingCenter
                              ? "border-[#5B4B8A] bg-[#5B4B8A] text-white"
                              : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--leaf-100)]"
                          }`}
                        >
                          <Crosshair className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{pickingCenter ? "Klik peta untuk pusat..." : "Ambil dari peta"}</span>
                        </button>

                        <label className="inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 text-[12.5px] font-semibold text-[var(--ink)] transition hover:bg-[var(--leaf-100)]">
                          <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Unggah GeoJSON</span>
                          <input
                            type="file"
                            accept=".geojson,.json,application/geo+json,application/json"
                            onChange={handleBoundaryUpload}
                            className="sr-only"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => applyPreset("bogor")}
                          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 text-[12.5px] font-semibold text-[var(--ink-muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]"
                        >
                          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Kembali ke Bogor</span>
                        </button>
                      </div>

                      {regionError && (
                        <p role="alert" className="mt-2 rounded-xl border border-[var(--status-blocked-line)] bg-[var(--status-blocked-bg)] px-3 py-2 text-[12.5px] font-medium text-[var(--status-blocked-ink)]">
                          {regionError}
                        </p>
                      )}
                    </div>

                    <details className="mt-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5">
                      <summary className="cursor-pointer text-[13.5px] font-semibold text-[var(--ink)]">
                        Cara uji peta & wilayah lain
                      </summary>
                      <ol className="mt-2 list-decimal space-y-1 pl-4 text-[13px] leading-relaxed text-[var(--ink-muted)]">
                        <li>Pilih wilayah preset, atau isi pusat + radius lalu tekan Terapkan.</li>
                        <li>Ganti layer OSM ↔ Citra Satelit, lalu geser dan zoom peta.</li>
                        <li>Klik poligon atau titik sensor untuk membuka detail lahan.</li>
                        <li>Unggah GeoJSON Polygon/MultiPolygon untuk menguji batas wilayah sendiri.</li>
                      </ol>
                    </details>
                  </div>
                )}

                <CarbonMap
                  key={mapRefreshKey}
                  parcels={regionId === "kustom" ? [] : filteredParcels}
                  allParcels={regionId === "kustom" ? [] : regionParcels}
                  sensors={regionId === "kustom" ? [] : regionSensors}
                  selectedId={regionId === "kustom" ? null : selected?.id ?? null}
                  onSelect={handleSelectParcel}
                  forceError={forceMapDataError}
                  onRefreshExternal={handleRefresh}
                  boundary={regionId === "kustom" ? customBoundary : null}
                  boundaryLabel={customLabel || "Wilayah uji kustom"}
                  showParcels={regionId !== "kustom"}
                  picking={pickingCenter}
                  onMapClick={pickingCenter ? handleMapClick : undefined}
                  mapAriaLabel={
                    regionId === "kustom"
                      ? "Peta wilayah uji kustom"
                      : `Peta lahan ${activeRegionLabel}`
                  }
                  className="h-[400px] sm:h-[470px] xl:h-[540px]"
                />
              </BotanicalCard>

              {regionId !== "kustom" && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                    <p className="text-[13px] font-semibold text-[var(--ink-muted)]">
                      Lahan demo di {activeRegionLabel}
                    </p>
                    <span className="xb-numeric text-[12.5px] font-semibold text-[var(--ink-dim)]">
                      {filteredParcels.length} hasil
                    </span>
                  </div>

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
                      visibleParcels.map((parcel, idx) => {
                        const active = parcel.id === selected?.id;
                        const canonical = toCanonicalStatus(parcel.verificationStatus);
                        const isOddTail =
                          visibleParcels.length % 2 === 1 && idx === visibleParcels.length - 1;
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

                  <Pagination
                    page={safeParcelPage}
                    pageSize={PARCEL_PAGE_SIZE}
                    totalItems={filteredParcels.length}
                    onPageChange={setParcelPage}
                    label="Navigasi lahan pada peta"
                    className="px-1"
                  />
                </>
              )}
            </div>

            {/* Right contextual inspection panel */}
            <div className="min-w-0">
              {regionId === "kustom" ? (
                <BotanicalCard className="p-5">
                  <div className="flex items-start gap-3">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#F4F0FB] text-[#5B4B8A]">
                      <Globe2 className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="xb-eyebrow">Mode uji</p>
                      <h2 className="xb-display mt-1 text-[18px] font-bold text-[var(--ink)]">
                        Wilayah uji kustom
                      </h2>
                      <p className="mt-1 break-words text-[13px] font-medium text-[#5B4B8A]">
                        {customLabel || "Boundary belum ditentukan"}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-[13.5px] leading-relaxed text-[var(--ink-muted)]">
                    Peta sudah di-fit ke batas wilayah ini. Data lahan demo hanya tersedia di
                    Bogor, IKN/Kaltim, Sumatera, dan Jawa Tengah; kembali ke salah satu wilayah
                    tersebut untuk membuka detail lahan.
                  </p>

                  <div className="mt-4 grid gap-2">
                    <button
                      type="button"
                      onClick={() => applyPreset("bogor")}
                      className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full bg-[var(--forest-700)] px-4 text-[13.5px] font-semibold text-white transition hover:bg-[var(--forest-800)] active:scale-[0.98]"
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                      <span>Kembali ke Bogor</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegionToolsOpen(true)}
                      className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-[13.5px] font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-soft)]"
                    >
                      <Globe2 className="h-4 w-4 text-[var(--forest-700)]" aria-hidden="true" />
                      <span>Ubah wilayah uji</span>
                    </button>
                  </div>

                  <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-3.5">
                    <p className="text-[12px] font-semibold uppercase tracking-wider text-[var(--ink-dim)]">
                      Yang bisa diuji
                    </p>
                    <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-[var(--ink-muted)]">
                      <li>• Layer OSM dan citra satelit</li>
                      <li>• Zoom dan geser ke lokasi mana pun</li>
                      <li>• Boundary dari koordinat atau GeoJSON</li>
                    </ul>
                  </div>

                  <p className="mt-3 text-[12px] leading-relaxed text-[var(--ink-dim)]">
                    Mode uji wilayah tidak mengubah data pasar, sensor, atau verifikasi.
                  </p>
                </BotanicalCard>
              ) : selected ? (
                <ParcelInspectionPanel
                  parcel={selected}
                  sensors={driftSensors}
                  assessment={aiAssessments.find((a) => a.parcel_id === selected.id)}
                  verification={verificationRecords.find((v) => v.parcel_id === selected.id)}
                  consent={consentRecords.find((c) => c.parcel_id === selected.id)}
                  role={role}
                />
              ) : (
                <BotanicalCard className="p-5">
                  <p className="text-[15.5px] font-semibold text-[var(--ink)]">
                    Tidak ada lahan pada wilayah ini.
                  </p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--ink-muted)]">
                    Pilih wilayah lain atau tampilkan semua lahan untuk melihat detail.
                  </p>
                </BotanicalCard>
              )}
            </div>
          </div>
        </PageStatePanel>
      </div>
    </BotanicalAppShell>
  );
}
