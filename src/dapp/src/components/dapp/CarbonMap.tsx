"use client";

import React, { useEffect, useRef, useState } from "react";
import type * as LeafletNS from "leaflet";
import { AlertTriangle, Loader2, Radio } from "lucide-react";
import type { ParcelItem, SensorData, VerificationStatus } from "@/context/DappContext";

const STATUS_COLOR: Record<VerificationStatus, string> = {
  verified: "#3DD68C",
  warning: "#E8B33C",
  pending: "#82B7D9",
  blocked: "#EF5D6B",
  dispute: "#E8863C",
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

  const styleFor = (parcelId: string): LeafletNS.PathOptions => {
    const parcel = parcelsRef.current.find((item) => item.id === parcelId);
    const state = parcel?.verificationStatus ?? "pending";
    const isSelected = selectedRef.current === parcelId;
    return {
      color: STATUS_COLOR[state],
      weight: isSelected ? 2.5 : 1.2,
      opacity: isSelected ? 1 : 0.8,
      fillColor: STATUS_COLOR[state],
      fillOpacity: isSelected ? 0.32 : 0.13,
      dashArray: state === "blocked" ? "4 3" : undefined,
    };
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;
      leafletRef.current = L;

      const map = L.map(containerRef.current, {
        center: [-6.5995, 106.7985],
        zoom: 13,
        zoomControl: false,
        attributionControl: true,
      });
      mapRef.current = map;

      L.control.zoom({ position: "bottomright" }).addTo(map);

      map.createPane("labelsPane");
      const labelsPane = map.getPane("labelsPane");
      if (labelsPane) {
        labelsPane.style.zIndex = "250";
        labelsPane.style.pointerEvents = "none";
      }

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 16,
          attribution:
            "Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors",
        }
      ).addTo(map);

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 16, pane: "labelsPane" }
      ).addTo(map);

      try {
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
              const layerPath = pathLayer as LeafletNS.Path;
              layerPath.setStyle({ weight: 2.4, fillOpacity: 0.26 });
              layerPath.bringToFront();
            });
            pathLayer.on("mouseout", () => {
              const layerPath = pathLayer as LeafletNS.Path;
              layerPath.setStyle(styleFor(parcelId));
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
          map.fitBounds(bounds, { padding: [36, 36], maxZoom: 14 });
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
      geoRef.current = null;
      sensorLayerRef.current = null;
      centersRef.current = {};
    };
  }, []);

  // Restyle parcels when status or selection changes.
  useEffect(() => {
    const layer = geoRef.current;
    if (!layer) return;
    layer.setStyle((feature) => styleFor(String(feature?.properties?.parcel_id ?? "")));
  }, [parcels, selectedId]);

  // Sensor overlay.
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

      const angle = (index * 2.4) + 0.6;
      const radius = 0.0022 + index * 0.0009;
      const position: [number, number] = [
        center[0] + Math.cos(angle) * radius,
        center[1] + Math.sin(angle) * radius * 1.4,
      ];

      const tone = sensor.flameDetected
        ? "#EF5D6B"
        : sensor.anomaly
          ? "#E8B33C"
          : "#82B7D9";

      const marker = L.circleMarker(position, {
        radius: 5,
        color: tone,
        weight: 2,
        fillColor: "#0B0D0C",
        fillOpacity: 0.95,
      });

      marker.bindTooltip(
        `<strong>${sensor.sensor_id}</strong> · ${sensor.type}<br/>` +
          `${sensor.temperature.toFixed(1)}°C · RH ${sensor.humidity}%<br/>` +
          `Tanah ${sensor.soil_moisture}% · ${sensor.co2e_tonPerDay.toFixed(3)} tCO₂e/hari` +
          (sensor.flameDetected ? "<br/><span style='color:#EF5D6B'>Sensor api aktif</span>" : ""),
        { className: "xb-parcel-tooltip", direction: "top", offset: [0, -6] }
      );

      marker.addTo(group);
    });
  }, [sensors, status]);

  const selected = parcels.find((item) => item.id === selectedId);

  return (
    <div className={className}>
      <div className="relative h-full min-h-[300px] overflow-hidden rounded-xl border border-xb-line/70 bg-[#0A0D0B]">
        <div ref={containerRef} className="absolute inset-0 z-0" aria-label="Peta parcel hutan" />

        {status === "loading" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-xb-bg/60 backdrop-blur-[2px]">
            <span className="flex items-center gap-2 text-[12px] text-xb-mute">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Memuat batas parcel…
            </span>
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-xb-bg/80">
            <span className="flex items-center gap-2 text-[12px] text-xb-warning">
              <AlertTriangle className="h-3.5 w-3.5" />
              Batas parcel gagal dimuat.
            </span>
          </div>
        )}

        <div className="pointer-events-none absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-lg border border-xb-line/70 bg-xb-bg/85 px-2.5 py-1.5 backdrop-blur-md">
          <Radio className="h-3 w-3 text-xb-tech" aria-hidden="true" />
          <span className="text-[10px] font-medium text-xb-mute">
            {sensors.length} sensor lapangan
          </span>
        </div>

        {selected && (
          <div className="pointer-events-none absolute bottom-3 left-3 z-10 max-w-[220px] rounded-lg border border-xb-line/70 bg-xb-bg/90 px-3 py-2 backdrop-blur-md">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-xb-dim">
              Parcel aktif
            </p>
            <p className="mt-0.5 truncate text-[12.5px] font-medium text-xb-text">
              {selected.name}
            </p>
            <p className="mt-0.5 text-[10.5px] text-xb-mute">
              {selected.region} · {selected.area} ha
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
