"use client";

import React, { useEffect, useRef, useState } from "react";
import type * as LeafletNS from "leaflet";
import { AlertTriangle, Layers, Radio, RefreshCw } from "lucide-react";
import type { ParcelItem, SensorData, VerificationStatus } from "@/context/DappContext";
import { cx } from "./phantom-ui";

const STATUS_COLOR: Record<VerificationStatus, string> = {
  verified: "#72C99A",
  warning: "#F2B84B",
  pending: "#AA9AF5",
  blocked: "#ED7770",
  dispute: "#F2B84B",
};

type MapStyle = "dark" | "satellite";

const BASEMAPS: Record<
  MapStyle,
  { url: string; refUrl?: string; attribution: string; maxZoom: number; label: string }
> = {
  dark: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    refUrl:
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles © Esri Dark Canvas · OpenStreetMap contributors",
    maxZoom: 16,
    label: "Gelap",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Imagery © Esri, Maxar, Earthstar Geographics",
    maxZoom: 17,
    label: "Satelit",
  },
};

interface CarbonMapProps {
  parcels: ParcelItem[];
  sensors: SensorData[];
  selectedId?: string | null;
  onSelect?: (parcelId: string) => void;
  className?: string;
}

export function CarbonMap({
  parcels,
  sensors,
  selectedId = null,
  onSelect,
  className,
}: CarbonMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);
  const baseLayerRef = useRef<LeafletNS.TileLayer | null>(null);
  const refLayerRef = useRef<LeafletNS.TileLayer | null>(null);
  const geoRef = useRef<LeafletNS.GeoJSON | null>(null);
  const sensorLayerRef = useRef<LeafletNS.LayerGroup | null>(null);
  const centersRef = useRef<Record<string, [number, number]>>({});
  const leafletRef = useRef<typeof LeafletNS | null>(null);

  const parcelsRef = useRef(parcels);
  const selectedRef = useRef<string | null>(selectedId);
  const selectRef = useRef(onSelect);
  parcelsRef.current = parcels;
  selectedRef.current = selectedId;
  selectRef.current = onSelect;

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [tileDegraded, setTileDegraded] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapStyle>("dark");
  const [reloadNonce, setReloadNonce] = useState(0);

  const styleFor = (parcelId: string): LeafletNS.PathOptions => {
    const parcel = parcelsRef.current.find((item) => item.id === parcelId);
    const state = parcel?.verificationStatus ?? "pending";
    const isSelected = selectedRef.current === parcelId;
    return {
      color: STATUS_COLOR[state],
      weight: isSelected ? 2.5 : 1.5,
      opacity: isSelected ? 1 : 0.85,
      fillColor: STATUS_COLOR[state],
      fillOpacity: isSelected ? 0.34 : 0.16,
      dashArray: state === "blocked" ? "5 4" : undefined,
    };
  };

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setTileDegraded(false);

    (async () => {
      try {
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

        map.createPane("labelsPane");
        const labelsPane = map.getPane("labelsPane");
        if (labelsPane) {
          labelsPane.style.zIndex = "250";
          labelsPane.style.pointerEvents = "none";
        }

        const response = await fetch("/data/bogor-forest.geojson");
        if (!response.ok) throw new Error(`GeoJSON ${response.status}`);
        const geojson = await response.json();
        if (cancelled) return;

        const layer = L.geoJSON(geojson, {
          style: (feature) => styleFor(String(feature?.properties?.parcel_id ?? "")),
          onEachFeature: (feature, pathLayer) => {
            const parcelId = String(feature.properties?.parcel_id ?? "");
            const name = String(feature.properties?.name ?? parcelId);

            pathLayer.bindTooltip(name, {
              className: "xb-parcel-tooltip",
              direction: "top",
              offset: [0, -6],
              sticky: true,
            });

            pathLayer.on("click", () => selectRef.current?.(parcelId));
            pathLayer.on("mouseover", () => {
              const path = pathLayer as LeafletNS.Path;
              path.setStyle({ weight: 2.5, fillOpacity: 0.28 });
              path.bringToFront();
            });
            pathLayer.on("mouseout", () => {
              const path = pathLayer as LeafletNS.Path;
              path.setStyle(styleFor(parcelId));
            });

            const polygon = pathLayer as LeafletNS.Polygon;
            if (typeof polygon.getBounds === "function") {
              const center = polygon.getBounds().getCenter();
              centersRef.current[parcelId] = [center.lat, center.lng];
            }
          },
        }).addTo(map);

        geoRef.current = layer;
        sensorLayerRef.current = L.layerGroup().addTo(map);

        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [36, 36], maxZoom: 14, animate: false });
        }

        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      baseLayerRef.current = null;
      refLayerRef.current = null;
      geoRef.current = null;
      sensorLayerRef.current = null;
      centersRef.current = {};
    };
  }, [reloadNonce]);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map || status !== "ready") return;

    if (baseLayerRef.current) {
      map.removeLayer(baseLayerRef.current);
      baseLayerRef.current = null;
    }
    if (refLayerRef.current) {
      map.removeLayer(refLayerRef.current);
      refLayerRef.current = null;
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

    if (spec.refUrl) {
      const refLayer = L.tileLayer(spec.refUrl, {
        maxZoom: spec.maxZoom,
        pane: "labelsPane",
      }).addTo(map);
      refLayerRef.current = refLayer;
    }
  }, [mapStyle, status]);

  useEffect(() => {
    const layer = geoRef.current;
    if (!layer) return;
    layer.setStyle((feature) => styleFor(String(feature?.properties?.parcel_id ?? "")));
  }, [parcels, selectedId]);

  useEffect(() => {
    const L = leafletRef.current;
    const group = sensorLayerRef.current;
    if (!L || !group) return;

    group.clearLayers();
    const perParcel: Record<string, number> = {};

    sensors.forEach((sensor) => {
      const center = centersRef.current[sensor.parcel_id];
      if (!center) return;

      const index = perParcel[sensor.parcel_id] ?? 0;
      perParcel[sensor.parcel_id] = index + 1;

      const angle = index * 2.4 + 0.6;
      const radius = 0.0022 + index * 0.0009;
      const position: [number, number] = [
        center[0] + Math.cos(angle) * radius,
        center[1] + Math.sin(angle) * radius * 1.4,
      ];

      const tone = sensor.flameDetected
        ? "#ED7770"
        : sensor.anomaly
          ? "#F2B84B"
          : "#AA9AF5";

      const marker = L.circleMarker(position, {
        radius: 6,
        color: tone,
        weight: 2,
        fillColor: "#090B0A",
        fillOpacity: 0.96,
      });

      marker.bindTooltip(
        `<strong>${sensor.sensor_id}</strong> · ${sensor.type}<br/>` +
          `${sensor.temperature.toFixed(1)}°C · RH ${sensor.humidity}%<br/>` +
          `Tanah ${sensor.soil_moisture}% · ${sensor.co2e_tonPerDay.toFixed(3)} tCO₂e/hari` +
          (sensor.flameDetected ? "<br/><span style='color:#ED7770'>Deteksi api aktif</span>" : ""),
        { className: "xb-parcel-tooltip", direction: "top", offset: [0, -6] }
      );

      marker.on("click", () => selectRef.current?.(sensor.parcel_id));
      marker.addTo(group);
    });
  }, [sensors, status]);

  const selected = parcels.find((item) => item.id === selectedId);

  return (
    <div className={cx("relative flex w-full flex-col", className)}>
      <div className="relative h-full min-h-[320px] flex-1 overflow-hidden bg-[#0D100E]">
        <div ref={containerRef} className="absolute inset-0 z-0" aria-label="Peta batas parcel hutan" />

        {status === "loading" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#090B0A]/90">
            <span className="text-[13px] font-medium text-[#A6ADA7]">Memuat peta GeoJSON…</span>
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#090B0A]/95 p-6 text-center">
            <AlertTriangle className="h-5 w-5 text-[#F2B84B]" aria-hidden="true" />
            <p className="text-[13px] font-medium text-[#F4F5F2]">Batas GeoJSON gagal dimuat.</p>
            <button
              type="button"
              onClick={() => setReloadNonce((n) => n + 1)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#39423C] bg-[#1D211E] px-4 text-[12.5px] font-medium text-[#F4F5F2] hover:bg-[#242925]"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Muat ulang peta
            </button>
          </div>
        )}

        {/* Map layer selector (Esri Dark Gray vs Esri Satellite — both key-free) */}
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-xl border border-[#39423C] bg-[#151816]/95 p-1">
          <Layers className="ml-2 mr-1 h-3.5 w-3.5 text-[#8B948D]" aria-hidden="true" />
          {(["dark", "satellite"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setMapStyle(mode)}
              aria-pressed={mapStyle === mode}
              className={cx(
                "min-h-[36px] rounded-lg px-2.5 text-[12px] font-medium",
                mapStyle === mode
                  ? "bg-[#AA9AF5] text-[#090B0A]"
                  : "text-[#A6ADA7] hover:bg-[#1D211E] hover:text-[#F4F5F2]"
              )}
            >
              {BASEMAPS[mode].label}
            </button>
          ))}
        </div>

        <div className="pointer-events-none absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-xl border border-[#39423C] bg-[#151816]/95 px-3 py-2">
          <Radio className="h-3.5 w-3.5 text-[#AA9AF5]" aria-hidden="true" />
          <span className="text-[12px] font-medium text-[#F4F5F2]">
            {sensors.length} sensor aktif
          </span>
        </div>

        {tileDegraded && (
          <div className="absolute left-3 top-16 z-10 rounded-xl border border-[#F2B84B]/45 bg-[#151816]/95 px-3 py-1.5 text-[11.5px] text-[#F2B84B]">
            Lapisan peta latar offline. Batas poligon &amp; sensor tetap interaktif.
          </div>
        )}

        {selected && (
          <div className="pointer-events-none absolute bottom-6 left-3 z-10 max-w-[240px] rounded-xl border border-[#39423C] bg-[#151816]/95 px-3.5 py-2.5">
            <p className="font-mono text-[11px] font-medium text-[#72C99A]">{selected.id}</p>
            <p className="mt-0.5 truncate text-[13.5px] font-semibold text-[#F4F5F2]">
              {selected.name}
            </p>
            <p className="mt-0.5 text-[12px] text-[#A6ADA7]">
              {selected.region} · {selected.area} ha
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
