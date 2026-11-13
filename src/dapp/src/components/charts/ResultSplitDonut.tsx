"use client";

import React from "react";
import { formatIdr } from "@/components/dapp/phantom-ui";
import { BOTANICAL_CHART_COLORS } from "@/components/charts/ChartPrimitives";

interface ResultSplitDonutProps {
  communityIdr: number;
  managerIdr: number;
  sandboxFeeIdr: number;
}

/**
 * Full 2-segment donut for the 60/40 revenue simulation split.
 */
export function ResultSplitDonut({
  communityIdr,
  managerIdr,
  sandboxFeeIdr,
}: ResultSplitDonutProps) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const communityDash = 0.6 * c;
  const managerDash = 0.4 * c;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative h-[120px] w-[120px] shrink-0">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={BOTANICAL_CHART_COLORS.leaf100}
              strokeWidth="16"
            />
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={BOTANICAL_CHART_COLORS.forest700}
              strokeWidth="16"
              strokeDasharray={`${communityDash.toFixed(2)} ${c.toFixed(2)}`}
              strokeLinecap="butt"
            />
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={BOTANICAL_CHART_COLORS.leaf300}
              strokeWidth="16"
              strokeDasharray={`${managerDash.toFixed(2)} ${c.toFixed(2)}`}
              strokeDashoffset={(-communityDash).toFixed(2)}
              strokeLinecap="butt"
            />
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="xb-display xb-numeric text-[24px] font-bold leading-none text-[var(--ink)]">
              60%
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <div className="flex items-center gap-2 text-[14px] font-medium text-[var(--ink-muted)]">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm bg-[var(--forest-700)]"
                aria-hidden="true"
              />
              <span>Komunitas (60%)</span>
            </div>
            <p className="xb-numeric mt-0.5 truncate text-[16px] font-bold text-[var(--ink)]">
              {formatIdr(communityIdr)}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[14px] font-medium text-[var(--ink-muted)]">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm bg-[var(--leaf-300)]"
                aria-hidden="true"
              />
              <span>Pengelola (40%)</span>
            </div>
            <p className="xb-numeric mt-0.5 truncate text-[16px] font-bold text-[var(--ink)]">
              {formatIdr(managerIdr)}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-[13.5px] text-[var(--ink-muted)]">
        Biaya sandbox 2% (
        <strong className="xb-numeric font-semibold text-[var(--ink)]">
          {formatIdr(sandboxFeeIdr)}
        </strong>
        )
      </div>
    </div>
  );
}

