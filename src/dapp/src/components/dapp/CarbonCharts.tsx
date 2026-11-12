"use client";

import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ParcelItem, SensorData } from "@/context/DappContext";
import { XbChartTooltip, formatNumber } from "./phantom-ui";

/** Parcel vegetation density (NDVI) bar chart against minimum 0.70 threshold (zero animation). */
export function ParcelNdviChart({ parcels }: { parcels: ParcelItem[] }) {
  const data = parcels.map((parcel) => ({
    name: parcel.id,
    ndvi: Number((parcel.ndvi ?? 0).toFixed(2)),
    status: parcel.verificationStatus,
  }));

  return (
    <div className="h-[210px] w-full min-w-0" aria-label="Grafik indeks kanopi NDVI per parcel">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="#252B27" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#8B948D"
            tick={{ fill: "#A6ADA7", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#252B27" }}
          />
          <YAxis
            domain={[0, 1]}
            ticks={[0, 0.35, 0.7, 1.0]}
            stroke="#8B948D"
            tick={{ fill: "#8B948D", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(170, 154, 245, 0.08)" }}
            content={<XbChartTooltip />}
            isAnimationActive={false}
          />
          <ReferenceLine
            y={0.7}
            stroke="#AA9AF5"
            strokeDasharray="4 4"
            label={{
              value: "Ambang 0.70",
              position: "insideTopRight",
              fill: "#AA9AF5",
              fontSize: 11,
            }}
          />
          <Bar dataKey="ndvi" name="NDVI Kanopi" radius={[8, 8, 0, 0]} maxBarSize={52} isAnimationActive={false}>
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={
                  entry.status === "verified"
                    ? "#72C99A"
                    : entry.status === "blocked"
                      ? "#ED7770"
                      : "#F2B84B"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Stacked bar chart showing available vs frozen tCO2e units per parcel (zero animation). */
export function ParcelSupplyChart({ parcels }: { parcels: ParcelItem[] }) {
  const data = parcels.map((parcel) => ({
    name: parcel.id,
    tersedia: parcel.availableUnits,
    dibekukan: parcel.frozenUnits,
  }));

  return (
    <div className="h-[210px] w-full min-w-0" aria-label="Grafik suplai unit tCO2e tersedia dan beku">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="#252B27" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#8B948D"
            tick={{ fill: "#A6ADA7", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#252B27" }}
          />
          <YAxis
            stroke="#8B948D"
            tick={{ fill: "#8B948D", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatNumber(Number(v))}
          />
          <Tooltip
            cursor={{ fill: "rgba(114, 201, 154, 0.08)" }}
            content={<XbChartTooltip unit="tCO₂e" />}
            isAnimationActive={false}
          />
          <Bar
            dataKey="tersedia"
            name="Unit Siap Jual"
            fill="#72C99A"
            radius={[6, 6, 0, 0]}
            maxBarSize={42}
            isAnimationActive={false}
          />
          <Bar
            dataKey="dibekukan"
            name="Unit Dibekukan"
            fill="#ED7770"
            radius={[6, 6, 0, 0]}
            maxBarSize={42}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Sensor field telemetry profile chart for selected parcel (zero animation). */
export function SensorTelemetryChart({ sensors }: { sensors: SensorData[] }) {
  const data = sensors.map((sensor) => ({
    name: sensor.sensor_id,
    suhu: Number(sensor.temperature.toFixed(1)),
    kelembapan: sensor.humidity,
    tanah: sensor.soil_moisture,
  }));

  if (data.length === 0) return null;

  return (
    <div className="h-[190px] w-full min-w-0" aria-label="Grafik pembacaan sensor lapangan">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="#252B27" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#8B948D"
            tick={{ fill: "#A6ADA7", fontSize: 11.5 }}
            tickLine={false}
            axisLine={{ stroke: "#252B27" }}
          />
          <YAxis
            domain={[0, 100]}
            stroke="#8B948D"
            tick={{ fill: "#8B948D", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(170, 154, 245, 0.08)" }}
            content={<XbChartTooltip />}
            isAnimationActive={false}
          />
          <Bar dataKey="suhu" name="Suhu (°C)" fill="#F2B84B" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="kelembapan" name="Kelembapan (%)" fill="#AA9AF5" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="tanah" name="Kelembapan Tanah (%)" fill="#72C99A" radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

