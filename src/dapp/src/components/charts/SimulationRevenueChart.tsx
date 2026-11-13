"use client";

import React, { useMemo } from "react";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import type { MarketSeriesPoint, ReportPeriod } from "@/lib/dashboard-api";
import { formatIdr, formatNumber } from "@/components/dapp/phantom-ui";
import {
  MarketTrendAreaChart,
} from "@/components/charts/ChartPrimitives";

interface SimulationRevenueChartProps {
  period: ReportPeriod;
  onPeriodChange: (next: ReportPeriod) => void;
  points: MarketSeriesPoint[];
  unitsSold: number;
  grossIdr: number;
  deltaPct: number;
  marketState: string;
}

export function SimulationRevenueChart({
  period,
  onPeriodChange,
  points,
  unitsSold,
  grossIdr,
  deltaPct,
  marketState,
}: SimulationRevenueChartProps) {
  const chartPoints = useMemo(
    () =>
      points.map((p) => ({
        label: p.label,
        grossIdr: p.grossIdr,
        units: p.units,
        timestamp: p.timestamp,
      })),
    [points]
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--leaf-100)] text-[var(--forest-700)]">
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2 className="xb-display text-[18px] font-bold tracking-[-0.015em] text-[var(--ink)]">
            Pendapatan Simulasi
          </h2>
        </div>

        <div
          role="tablist"
          aria-label="Pilih rentang waktu grafik"
          className="inline-flex rounded-full border border-[var(--line)] bg-[var(--surface-soft)] p-1"
        >
          {(["Harian", "Mingguan", "Bulanan"] as ReportPeriod[]).map((tab) => {
            const selected = period === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onPeriodChange(tab)}
                className={`min-h-[36px] rounded-full px-3.5 text-[14px] font-medium transition-colors ${
                  selected
                    ? "bg-[var(--forest-700)] font-semibold text-white shadow-xs"
                    : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary KPI metric & market state context matching Reference 2 */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <p className="xb-display xb-numeric text-[28px] font-bold tracking-[-0.025em] text-[var(--ink)] sm:text-[34px]">
            {formatIdr(grossIdr)}
          </p>
          <span className="xb-numeric inline-flex items-center gap-1 rounded-full bg-[var(--status-verified-bg)] px-3 py-1 text-[14px] font-semibold text-[var(--status-verified-ink)]">
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />+{deltaPct}% dari kemarin
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[14px]">
          <span className="xb-numeric rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 font-medium text-[var(--ink)]">
            {formatNumber(unitsSold)} tCO2e terjual
          </span>
          <span className="rounded-full bg-[var(--seal-100)] px-3 py-1 font-semibold text-[var(--seal-600)]">
            Kondisi Pasar: {marketState}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <MarketTrendAreaChart data={chartPoints} heightClassName="h-[245px]" />
      </div>
    </div>
  );
}


