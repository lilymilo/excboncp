"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { GeoJsonObject } from "geojson";
import type * as LeafletNS from "leaflet";
import { AlertTriangle, Layers, Maximize2, Radio, RefreshCw } from "lucide-react";
import type { ParcelItem, SensorData } from "@/context/DappContext";
import { toCanonicalStatus, type CanonicalStatus } from "@/lib/dashboard-helpers";
import { safeJsonFetch, type GeoJsonFeatureCollection } from "@/lib/exbon-api";
import { cx } from "./phantom-ui";

const STATUS_STYLE: Record<
  CanonicalStatus,
  { stroke: string; fill: string; dashed?: string; label: string }
> = {
  VERIFIED: { stroke: "#17692F", fill: "#8FCB97", label: "Terverifikasi" },
  WARNING: { stroke: "#7A5600", fill: "#F5C451", label: "Perlu perhatian" },
  DISPUTE: { stroke: "#9A4400", fill: "#F49A5E", dashed: "6 4", label: "Keberatan warga" },
  BLOCKED: { stroke: "#B3261E", fill: "#ED8A84", dashed: "5 4", label: "Ditahan sistem" },
};

type MapStyle = "osm" | "satellite";

const BASEMAPS: Record<
  MapStyle,
  { url: string; attribution: string; maxZoom: number; label: string }
> = {
  osm: {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19,
    label: "Peta OSM",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Citra © Esri, Maxar · Batas © OpenStreetMap contributors",
    maxZoom: 17,
    label: "Citra Satelit",
  },
};

interface CarbonMapProps {
  parcels: ParcelItem[];
  allParcels?: ParcelItem[];
  sensors: SensorData[];
  selectedId?: string | null;
  onSelect?: (parcelId: string) => void;
  forceError?: boolean;
  onRefreshExternal?: () => void;
  className?: string;
  boundary?: GeoJsonFeatureCollection | null;
  boundaryLabel?: string;
  showParcels?: boolean;
  picking?: boolean;
  onMapClick?: (point: { lat: number; lng: number }) => void;
  mapAriaLabel?: string;
}

export function CarbonMap({
  parcels,
  allParcels,
  sensors,
  selectedId = null,
  onSelect,
  forceError = false,
  onRefreshExternal,
  className,
  boundary = null,
  boundaryLabel = "Wilayah uji",
  showParcels = true,
  picking = false,
  onMapClick,
  mapAriaLabel = "Peta interaktif batas lahan dan titik sensor",
}: CarbonMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);
  const baseLayerRef = useRef<LeafletNS.TileLayer | null>(null);
  const geoRef = useRef<LeafletNS.GeoJSON | null>(null);
  const boundaryRef = useRef<LeafletNS.GeoJSON | null>(null);
  const featureBoundsRef = useRef<Record<string, LeafletNS.LatLngBounds>>({});
  const centersRef = useRef<Record<string, [number, number]>>({});
  const sensorLayerRef = useRef<LeafletNS.LayerGroup | null>(null);
  const leafletRef = useRef<typeof LeafletNS | null>(null);

  const visibleIdsRef = useRef<Set<string>>(new Set());
  const allParcelsRef = useRef<ParcelItem[]>(allParcels ?? parcels);
  const selectedRef = useRef<string | null>(selectedId);
  const selectRef = useRef(onSelect);
  const mapClickRef = useRef(onMapClick);
  const showParcelsRef = useRef(showParcels);
  const boundaryActiveRef = useRef(Boolean(boundary));

  visibleIdsRef.current = new Set(parcels.map((p) => p.id));
  allParcelsRef.current = allParcels ?? parcels;
  selectedRef.current = selectedId;
  selectRef.current = onSelect;
  mapClickRef.current = onMapClick;
  showParcelsRef.current = showParcels;
  boundaryActiveRef.current = Boolean(boundary);

  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [dataLoadError, setDataLoadError] = useState(false);
  const [tileDegraded, setTileDegraded] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapStyle>("osm");
  const [reloadNonce, setReloadNonce] = useState(0);

  const styleFor = useCallback((parcelId: string): LeafletNS.PathOptions => {
    const isVisible = visibleIdsRef.current.has(parcelId);
    const parcel = allParcelsRef.current.find((item) => item.id === parcelId);
    const canonical = toCanonicalStatus(parcel?.verificationStatus ?? "blocked");
    const theme = STATUS_STYLE[canonical];
    const isSelected = selectedRef.current === parcelId;

    if (!isVisible) {
      return {
        color: "#8EA192",
        weight: 1,
        opacity: 0.35,
        fillColor: "#D8E5D4",
        fillOpacity: 0.12,
        dashArray: "3 4",
      };
    }

    return {
      color: isSelected ? "#14261A" : theme.stroke,
      weight: isSelected ? 3 : 2,
      opacity: 0.95,
      fillColor: theme.fill,
      fillOpacity: isSelected ? 0.56 : 0.36,
      dashArray: theme.dashed,
    };
  }, []);

  const getVisibleBounds = useCallback(() => {
    const L = leafletRef.current;
    if (!L) return null;
    const bounds = L.latLngBounds([]);
    visibleIdsRef.current.forEach((id) => {
      const parcelBounds = featureBoundsRef.current[id];
      if (parcelBounds) bounds.extend(parcelBounds);
    });
    return bounds.isValid() ? bounds : null;
  }, []);

  const handleFitAll = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const boundaryLayer = boundaryRef.current;
    if (boundaryLayer) {
      const boundaryBounds = boundaryLayer.getBounds();
      if (boundaryBounds.isValid()) {
        map.fitBounds(boundaryBounds, { padding: [48, 48], maxZoom: 14, animate: false });
        return;
      }
    }

    const visibleBounds = getVisibleBounds();
    if (visibleBounds) {
      map.fitBounds(visibleBounds, { padding: [40, 40], maxZoom: 15, animate: false });
      return;
    }

    const layer = geoRef.current;
    if (layer) {
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14, animate: false });
        return;
      }
    }

    map.setView([-6.5995, 106.7985], 13, { animate: false });
  }, [getVisibleBounds]);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setDataLoadError(false);
    setTileDegraded(false);

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;
      leafletRef.current = L;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(containerRef.current, {
        center: [-6.5995, 106.7985],
        zoom: 13,
        zoomControl: false,
        attributionControl: true,
        fadeAnimation: false,
        zoomAnimation: false,
        markerZoomAnimation: false,
        inertia: false,
      });
      mapRef.current = map;
      L.control.zoom({ position: "bottomright" }).addTo(map);
      sensorLayerRef.current = L.layerGroup().addTo(map);

      map.on("click", (event) => {
        mapClickRef.current?.({ lat: event.latlng.lat, lng: event.latlng.lng });
      });

      const geojson = forceError
        ? null
        : await safeJsonFetch<GeoJsonFeatureCollection>("/data/bogor-forest.geojson", {
            cache: "no-store",
          });

      if (cancelled) return;

      if (!geojson || !Array.isArray(geojson.features) || geojson.features.length === 0) {
        setDataLoadError(true);
        setStatus("ready");
        return;
      }

      const layer = L.geoJSON(geojson, {
        style: (feature) => styleFor(String(feature?.properties?.parcel_id ?? "")),
        onEachFeature: (feature, pathLayer) => {
          const parcelId = String(feature.properties?.parcel_id ?? "");
          const name = String(feature.properties?.name ?? parcelId);

          pathLayer.bindTooltip(
            `<strong>${name}</strong><br/><span style="color:#4A5E4F">${parcelId} · Klik untuk detail</span>`,
            {
              className: "xb-botanical-tooltip",
              direction: "top",
              offset: [0, -6],
              sticky: true,
            }
          );

          pathLayer.on("click", () => selectRef.current?.(parcelId));
          pathLayer.on("mouseover", () => {
            const path = pathLayer as LeafletNS.Path;
            path.setStyle({ weight: 3, fillOpacity: 0.6 });
            path.bringToFront();
          });
          pathLayer.on("mouseout", () => {
            const path = pathLayer as LeafletNS.Path;
            path.setStyle(styleFor(parcelId));
          });

          const polygon = pathLayer as LeafletNS.Polygon;
          if (typeof polygon.getBounds === "function") {
            const pBounds = polygon.getBounds();
            featureBoundsRef.current[parcelId] = pBounds;
            const center = pBounds.getCenter();
            centersRef.current[parcelId] = [center.lat, center.lng];
          }
        },
      }).addTo(map);

      geoRef.current = layer;

      const selectedBounds = selectedRef.current
        ? featureBoundsRef.current[selectedRef.current]
        : null;
      const visibleBounds = getVisibleBounds();
      const fullBounds = layer.getBounds();

      if (!boundaryActiveRef.current && showParcelsRef.current) {
        if (selectedBounds && selectedBounds.isValid()) {
          map.fitBounds(selectedBounds, { padding: [52, 52], maxZoom: 14, animate: false });
        } else if (visibleBounds) {
          map.fitBounds(visibleBounds, { padding: [40, 40], maxZoom: 14, animate: false });
        } else if (fullBounds.isValid()) {
          map.fitBounds(fullBounds, { padding: [40, 40], maxZoom: 14, animate: false });
        }
      }

      setStatus("ready");
    })();

    const targetEl = containerRef.current;
    let ro: ResizeObserver | null = null;
    if (targetEl && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        mapRef.current?.invalidateSize({ animate: false });
      });
      ro.observe(targetEl);
    }

    return () => {
      cancelled = true;
      ro?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      baseLayerRef.current = null;
      geoRef.current = null;
      boundaryRef.current = null;
      sensorLayerRef.current = null;
      featureBoundsRef.current = {};
      centersRef.current = {};
    };
  }, [reloadNonce, forceError, styleFor, getVisibleBounds]);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map || status !== "ready") return;

    if (boundaryRef.current) {
      map.removeLayer(boundaryRef.current);
      boundaryRef.current = null;
    }

    if (!boundary) {
      if (showParcels) {
        const visibleBounds = getVisibleBounds();
        if (visibleBounds) {
          map.fitBounds(visibleBounds, { padding: [40, 40], maxZoom: 15, animate: false });
        }
      }
      return;
    }

    const layer = L.geoJSON(boundary as unknown as GeoJsonObject, {
      style: () => ({
        color: "#5B4B8A",
        weight: 2.5,
        opacity: 0.95,
        fillColor: "#B9A7E8",
        fillOpacity: 0.1,
        dashArray: "8 5",
      }),
      onEachFeature: (_feature, pathLayer) => {
        pathLayer.bindTooltip(boundaryLabel, {
          className: "xb-botanical-tooltip",
          direction: "top",
          sticky: true,
        });
      },
    }).addTo(map);

    boundaryRef.current = layer;
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14, animate: false });
    }
  }, [boundary, boundaryLabel, status, showParcels, parcels, getVisibleBounds]);

  useEffect(() => {
    const map = mapRef.current;
    const layer = geoRef.current;
    if (!map || !layer || status !== "ready") return;

    if (showParcels) {
      if (!map.hasLayer(layer)) layer.addTo(map);
    } else if (map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  }, [showParcels, status]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.getContainer().style.cursor = picking ? "crosshair" : "";
  }, [picking, status]);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map || status !== "ready") return;

    if (baseLayerRef.current) {
      map.removeLayer(baseLayerRef.current);
      baseLayerRef.current = null;
    }

    setTileDegraded(false);
    let errorCount = 0;

    const spec = BASEMAPS[mapStyle];
    const base = L.tileLayer(spec.url, {
      maxZoom: spec.maxZoom,
      attribution: spec.attribution,
    });

    base.on("tileerror", () => {
      errorCount += 1;
      if (errorCount >= 4) {
        setTileDegraded(true);
      }
    });

    base.addTo(map);
    baseLayerRef.current = base;
  }, [mapStyle, status]);

  useEffect(() => {
    const layer = geoRef.current;
    if (!layer) return;
    layer.setStyle((feature) => styleFor(String(feature?.properties?.parcel_id ?? "")));
  }, [parcels, allParcels, selectedId, styleFor]);

  useEffect(() => {
    const L = leafletRef.current;
    const group = sensorLayerRef.current;
    if (!L || !group || status !== "ready") return;

    group.clearLayers();
    if (!showParcels) return;

    const perParcel: Record<string, number> = {};

    sensors.forEach((sensor) => {
      const center = centersRef.current[sensor.parcel_id];
      if (!center || !visibleIdsRef.current.has(sensor.parcel_id)) return;

      const index = perParcel[sensor.parcel_id] ?? 0;
      perParcel[sensor.parcel_id] = index + 1;

      const angle = index * 2.2 + 0.6;
      const radius = 0.002 + index * 0.0009;
      const position: [number, number] = [
        center[0] + Math.cos(angle) * radius,
        center[1] + Math.sin(angle) * radius * 1.4,
      ];

      const badgeColor = sensor.flameDetected
        ? "#B3261E"
        : sensor.anomaly
        ? "#9A4400"
        : "#1F5A94";

      const badgeBg = sensor.flameDetected
        ? "#FDE3E1"
        : sensor.anomaly
        ? "#FFF0C7"
        : "#E3EEF9";

      const symbol = sensor.flameDetected ? "!" : sensor.anomaly ? "~" : "S";

      const icon = L.divIcon({
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        html: `<div style="width:28px;height:28px;border-radius:999px;background:${badgeBg};border:2px solid ${badgeColor};color:${badgeColor};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;box-shadow:0 2px 6px rgba(20,38,26,0.22);">${symbol}</div>`,
      });

      const marker = L.marker(position, {
        icon,
        title: `${sensor.sensor_id} (${sensor.parcel_id})`,
      });

      marker.bindTooltip(
        `<strong>${sensor.sensor_id}</strong> (${sensor.type})<br/>` +
          `${sensor.temperature.toFixed(1)} C · Kelembapan ${sensor.humidity}%<br/>` +
          `Tanah ${sensor.soil_moisture}% · ${sensor.co2e_tonPerDay.toFixed(3)} tCO2e/hari` +
          (sensor.flameDetected ? "<br/><strong style='color:#B3261E'>Api terdeteksi aktif</strong>" : ""),
        { className: "xb-botanical-tooltip", direction: "top", offset: [0, -10] }
      );

      marker.on("click", () => selectRef.current?.(sensor.parcel_id));
      marker.addTo(group);
    });
  }, [sensors, parcels, status, showParcels]);

  const selected = (allParcels ?? parcels).find((item) => item.id === selectedId);
  const selectedStatus = selected ? toCanonicalStatus(selected.verificationStatus) : null;

  return (
    <div className={cx("relative isolate z-[1] flex w-full flex-col", className)}>
      <div className="relative h-full min-h-[380px] flex-1 overflow-hidden bg-[#E3EFE1]">
        <div
          ref={containerRef}
          className="absolute inset-0 z-0"
          aria-label={mapAriaLabel}
        />

        {status === "loading" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#EEF5EC]/85">
            <span className="text-[15px] font-medium text-[#14261A]">
              Memuat peta dasar dan batas lahan...
            </span>
          </div>
        )}

        {picking && (
          <div className="pointer-events-none absolute left-1/2 top-16 z-20 w-[min(92%,340px)] -translate-x-1/2 rounded-2xl border border-[#5B4B8A]/30 bg-white/95 px-4 py-2.5 text-center text-[13.5px] font-semibold text-[#4A3B73] shadow-md">
            Klik peta untuk menentukan pusat wilayah uji
          </div>
        )}

        {dataLoadError && (
          <div
            role="alert"
            className="absolute inset-x-3 bottom-12 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E8CE82] bg-[#FFF0C7] px-4 py-3 text-[#7A5600] shadow-md sm:inset-x-4"
          >
            <div className="flex items-center gap-2.5 text-[14.5px] font-semibold">
              <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>Peta dasar tersedia, tetapi data lahan belum dapat dimuat.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setReloadNonce((n) => n + 1);
                onRefreshExternal?.();
              }}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[#7A5600]/40 bg-white px-4 text-[14px] font-semibold text-[#7A5600] hover:bg-[#FFF8E5]"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Coba lagi</span>
            </button>
          </div>
        )}

        {/* Map layer selector + Fit bounds control */}
        <div className="absolute left-3 top-3 z-10 flex flex-wrap items-center gap-1.5 rounded-2xl border border-[#D8E5D4] bg-white/95 p-1 shadow-sm">
          <span className="ml-2 inline-flex items-center gap-1 text-[13.5px] font-medium text-[#4A5E4F]">
            <Layers className="h-4 w-4 text-[#2E6B3F]" aria-hidden="true" />
          </span>
          {(["osm", "satellite"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setMapStyle(mode)}
              aria-pressed={mapStyle === mode}
              className={cx(
                "min-h-[38px] rounded-xl px-3 text-[13.5px] font-semibold",
                mapStyle === mode
                  ? "bg-[#2E6B3F] text-white"
                  : "text-[#4A5E4F] hover:bg-[#F5F9F3] hover:text-[#14261A]"
              )}
            >
              {BASEMAPS[mode].label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleFitAll}
            title={boundary ? "Sesuaikan tampilan ke wilayah uji" : "Sesuaikan tampilan ke semua poligon lahan"}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-[#D8E5D4] bg-[#F5F9F3] px-3 text-[13.5px] font-semibold text-[#14261A] hover:bg-[#E2F2E5]"
          >
            <Maximize2 className="h-3.5 w-3.5 text-[#2E6B3F]" aria-hidden="true" />
            <span className="hidden sm:inline">Sesuaikan batas</span>
          </button>
        </div>

        <div className="pointer-events-none absolute right-3 top-3 z-10 hidden max-w-[min(48%,320px)] items-center gap-2 rounded-2xl border border-[#D8E5D4] bg-white/95 px-3.5 py-2 shadow-sm sm:flex">
          <Radio className="h-4 w-4 shrink-0 text-[#1F5A94]" aria-hidden="true" />
          <span className="xb-numeric truncate text-[13.5px] font-semibold text-[#14261A]">
            {boundary ? boundaryLabel : `${sensors.length} titik sensor`}
          </span>
        </div>

        {tileDegraded && (
          <div className="absolute left-3 top-16 z-10 rounded-xl border border-[#E8CE82] bg-[#FFF0C7] px-3 py-1.5 text-[13px] font-medium text-[#7A5600]">
            Tile peta latar sedang terganggu. Poligon lahan tetap interaktif.
          </div>
        )}

        {showParcels && selected && !dataLoadError && selectedStatus && (
          <div className="pointer-events-none absolute bottom-7 left-3 z-10 max-w-[260px] rounded-2xl border border-[#D8E5D4] bg-white/95 px-3.5 py-2.5 shadow-sm">
            <p className="xb-mono text-[12px] font-semibold text-[#1F4D2E]">
              {selected.id} · {STATUS_STYLE[selectedStatus].label}
            </p>
            <p className="mt-0.5 truncate text-[15px] font-bold text-[#14261A]">
              {selected.name}
            </p>
            <p className="xb-numeric mt-0.5 text-[13px] text-[#4A5E4F]">
              {selected.region} · {selected.area} ha
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
