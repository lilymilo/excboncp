"use client";

import React, { useId, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatIdr, formatNumber } from "@/components/dapp/phantom-ui";

export const BOTANICAL_CHART_COLORS = {
  line: "#245E35",
  lineActive: "#1F4D2E",
  forest700: "#2E6B3F",
  leaf300: "#8FCB97",
  leaf100: "#E2F2E5",
  grid: "#E4EFE1",
  inkMuted: "#4A5E4F",
  surface: "#FFFFFF",
} as const;

export interface ChartPoint {
  label: string;
  grossIdr: number;
  units?: number;
  timestamp?: string;
}

export function formatCompactIdrAxis(val: number): string {
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)} M`;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)} jt`;
  if (val >= 1_000) return `${Math.round(val / 1_000)} rb`;
  return `${val}`;
}

export function computeSeriesBenchmarks(points: Array<{ grossIdr: number }>) {
  if (!points.length) return null;
  const vals = points.map((p) => p.grossIdr);
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const avg = Math.round(vals.reduce((acc, v) => acc + v, 0) / vals.length);
  return { max, min, avg, count: vals.length };
}

export function FinancialChartTooltip({
  active,
  payload,
  label,
  unitSuffix = "tCO2e",
  contextTag = "Simulasi",
}: {
  active?: boolean;
  payload?: Array<{
    value?: number;
    payload?: {
      timestamp?: string;
      units?: number;
      grossIdr?: number;
      cumulativeIdr?: number;
    };
  }>;
  label?: string;
  unitSuffix?: string;
  contextTag?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  const first = payload[0];
  const point = first?.payload;
  const value = typeof first?.value === "number" ? first.value : 0;

  return (
    <div className="xb-chart-tooltip">
      <p className="text-[12px] font-medium text-[var(--ink-muted)]">
        {point?.timestamp ? `${label} · ${point.timestamp}` : label}
      </p>
      <p className="xb-display xb-numeric mt-0.5 text-[17px] font-bold text-[var(--ink)]">
        {formatIdr(value)}
      </p>
      <div className="mt-1 flex items-center gap-2 text-[12px] text-[var(--ink-muted)]">
        {typeof point?.units === "number" && (
          <span className="xb-numeric font-semibold text-[var(--status-verified-ink)]">
            {point.units > 0 ? `+${formatNumber(point.units)}` : formatNumber(point.units)} {unitSuffix}
          </span>
        )}
        <span>·</span>
        <span>{contextTag}</span>
      </div>
    </div>
  );
}

export function ChartBenchmarkBar({
  stats,
  extraRightLabel,
}: {
  stats: { max: number; min: number; avg: number; count: number } | null;
  extraRightLabel?: string;
}) {
  if (!stats) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line-subtle)] pt-2.5 text-[12.5px] text-[var(--ink-muted)]">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span>
          Tertinggi:{" "}
          <strong className="xb-numeric font-semibold text-[var(--ink)]">
            {formatIdr(stats.max)}
          </strong>
        </span>
        <span>
          Terendah:{" "}
          <strong className="xb-numeric font-semibold text-[var(--ink)]">
            {formatIdr(stats.min)}
          </strong>
        </span>
        <span>
          Rata-rata:{" "}
          <strong className="xb-numeric font-semibold text-[var(--ink)]">
            {formatIdr(stats.avg)}
          </strong>
        </span>
      </div>
      <span className="xb-numeric text-[12px] text-[var(--ink-dim)]">
        {extraRightLabel ?? `${stats.count} titik observasi`}
      </span>
    </div>
  );
}

export function MarketTrendAreaChart({
  data,
  heightClassName = "h-[235px]",
  contextTag = "Simulasi",
  unitSuffix = "tCO2e",
  showStatsFooter = true,
  emptyLabel = "Belum ada rangkaian data simulasi pada rentang ini.",
}: {
  data: ChartPoint[];
  heightClassName?: string;
  contextTag?: string;
  unitSuffix?: string;
  showStatsFooter?: boolean;
  emptyLabel?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const gradientId = `xbTrendFill_${uid}`;

  const stats = useMemo(() => computeSeriesBenchmarks(data), [data]);

  if (!data.length) {
    return (
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-8 text-center text-[14.5px] text-[var(--ink-muted)]">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="xb-financial-chart">
      <div className={`${heightClassName} w-full`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BOTANICAL_CHART_COLORS.line} stopOpacity={0.22} />
                <stop offset="60%" stopColor={BOTANICAL_CHART_COLORS.leaf300} stopOpacity={0.05} />
                <stop offset="100%" stopColor={BOTANICAL_CHART_COLORS.leaf300} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke={BOTANICAL_CHART_COLORS.grid}
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: BOTANICAL_CHART_COLORS.inkMuted, fontSize: 12.5 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: BOTANICAL_CHART_COLORS.inkMuted, fontSize: 12.5 }}
              axisLine={false}
              tickLine={false}
              width={64}
              tickFormatter={formatCompactIdrAxis}
            />
            <Tooltip
              content={<FinancialChartTooltip contextTag={contextTag} unitSuffix={unitSuffix} />}
              cursor={{
                stroke: BOTANICAL_CHART_COLORS.forest700,
                strokeWidth: 1.5,
                strokeDasharray: "3 3",
              }}
            />
            <Area
              type="monotone"
              dataKey="grossIdr"
              isAnimationActive={false}
              stroke={BOTANICAL_CHART_COLORS.line}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              dot={{
                r: 3.5,
                fill: BOTANICAL_CHART_COLORS.surface,
                stroke: BOTANICAL_CHART_COLORS.forest700,
                strokeWidth: 2,
              }}
              activeDot={{
                r: 5.5,
                fill: BOTANICAL_CHART_COLORS.lineActive,
                stroke: BOTANICAL_CHART_COLORS.surface,
                strokeWidth: 2.5,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {showStatsFooter && <ChartBenchmarkBar stats={stats} />}
    </div>
  );
}

export function MarketSparkline({
  points,
  label,
}: {
  points: number[];
  label?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const gradId = `xbSpark_${uid}`;

  if (!points || points.length === 0) {
    return (
      <span className="xb-mono text-[13px] text-[var(--ink-muted)]" aria-label={label}>
        Belum ada
      </span>
    );
  }

  const w = 104;
  const h = 30;
  const padX = 3;
  const padY = 4;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(max - min, 1);

  const coords = points.map((val, idx) => {
    const x =
      padX +
      (points.length === 1 ? (w - padX * 2) / 2 : (idx / (points.length - 1)) * (w - padX * 2));
    const y = h - padY - ((val - min) / range) * (h - padY * 2);
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  });

  const linePath = coords.map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x} ${pt.y}`).join(" ");
  const last = coords[coords.length - 1];
  const first = coords[0];
  const areaPath = `${linePath} L${last.x} ${h - 1} L${first.x} ${h - 1} Z`;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={label ?? "Tren nilai simulasi lahan"}
      className="shrink-0 overflow-visible"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BOTANICAL_CHART_COLORS.line} stopOpacity={0.22} />
          <stop offset="100%" stopColor={BOTANICAL_CHART_COLORS.leaf300} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={BOTANICAL_CHART_COLORS.line}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={last.x}
        cy={last.y}
        r="2.6"
        fill={BOTANICAL_CHART_COLORS.surface}
        stroke={BOTANICAL_CHART_COLORS.forest700}
        strokeWidth="1.6"
      />
    </svg>
  );
}

