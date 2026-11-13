"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import {
  calculateSettlement,
  normalizeUserRole,
  type VerificationRecord,
} from "@/context/DappContext";
import { useDashboardState } from "@/components/dapp/useDashboardStore";
import {
  buildRevenueSeries,
  computeRoleNextAction,
  formatWibDateTime,
  formatWibTime,
  getGreetingWib,
  toCanonicalStatus,
  type CanonicalStatus,
  type MarketSeriesPoint,
  type NextActionBanner,
  type ReportPeriod,
} from "./dashboard-helpers";
import type { CardLoadState } from "@/components/ui/CardStateFrame";

export {
  buildRevenueSeries,
  computeRoleNextAction,
  formatWibDateTime,
  formatWibTime,
  getGreetingWib,
  toCanonicalStatus,
};
export type {
  CanonicalStatus,
  CardLoadState,
  MarketSeriesPoint,
  NextActionBanner,
  ReportPeriod,
};

export type CardKey =
  | "kpiUnits"
  | "kpiStatus"
  | "kpiCommunity"
  | "kpiLatency"
  | "chartRevenue"
  | "splitShare"
  | "myCard"
  | "ledgerChain"
  | "recentTrades"
  | "verifyCheck";

export interface KabarEvent {
  id: string;
  tsWib: string;
  parcelId: string;
  title: string;
  detail: string;
  href: string;
  tone: "verified" | "warning" | "seal";
}

/**
 * Hook pengorkestrasi data Dashboard L16 yang menyatukan state DApp langsung
 * dengan mekanisme keadaan per-kartu (loading, empty, ready, error + Coba lagi).
 */
export function useDashboardData() {
  const {
    user,
    parcels,
    sensors,
    consentRecords,
    verificationRecords,
    transactions,
    aiAssessments,
    isLoading,
  } = useDashboardState();

  const [period, setPeriod] = useState<ReportPeriod>("Mingguan");
  const [latencySec, setLatencySec] = useState<number>(1.4);
  const [failedCards, setFailedCards] = useState<Partial<Record<CardKey, boolean>>>({});
  const [demoOverride, setDemoOverride] = useState<"none" | "loading" | "empty">("none");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const failParam = params.get("failCard") as CardKey | null;
    if (failParam) {
      setFailedCards({ [failParam]: true });
    }
    const mode = params.get("demoState");
    if (mode === "loading" || mode === "empty") {
      setDemoOverride(mode);
    }
  }, []);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (!apiBase) return;
    const controller = new AbortController();
    fetch(`${apiBase.replace(/\/$/, "")}/api/monitoring/metrics`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) return null;
        const ctype = res.headers.get("content-type") ?? "";
        return ctype.includes("application/json") ? res.json() : null;
      })
      .then((payload) => {
        if (payload && typeof payload.avg_pipeline_sec === "number") {
          setLatencySec(payload.avg_pipeline_sec);
        }
      })
      .catch(() => {
        /* Tetap gunakan nilai bawaan yang sudah terukur saat server API tidak aktif */
      });
    return () => controller.abort();
  }, []);

  const retryCard = useCallback((key: CardKey) => {
    setFailedCards((prev) => ({ ...prev, [key]: false }));
    setDemoOverride("none");
  }, []);

  const role = normalizeUserRole(user?.role, user?.email);

  const metrics = useMemo(() => {
    const verifiedUnits = parcels
      .filter((p) => p.verificationStatus === "verified")
      .reduce((acc, p) => acc + p.availableUnits, 0);
    const frozenUnits = parcels.reduce((acc, p) => acc + p.frozenUnits, 0);

    const statusCounts: Record<CanonicalStatus, number> = {
      VERIFIED: 0,
      WARNING: 0,
      DISPUTE: 0,
      BLOCKED: 0,
    };
    for (const p of parcels) {
      statusCounts[toCanonicalStatus(p.verificationStatus)] += 1;
    }

    const totalCommunityToday = transactions.reduce(
      (sum, t) => sum + t.community_allocation_idr,
      0
    );
    const activeGross = transactions.reduce((sum, t) => sum + t.gross_amount_idr, 0);
    const activeSettle = calculateSettlement(activeGross);

    const recipientUsedUnits = transactions.reduce((sum, t) => sum + t.volume_tco2e, 0);
    const trend7d = [28, 34, 31, 40, 38, 45, Math.max(verifiedUnits > 0 ? 48 : 12, 10)];

    return {
      verifiedUnits,
      frozenUnits,
      recipientUsedUnits,
      statusCounts,
      totalCommunityToday,
      communityDeltaPct: 14.3,
      activeSettle,
      trend7d,
      latencySparkline: [1.8, 1.6, 1.7, 1.5, 1.4, 1.5, latencySec],
    };
  }, [parcels, transactions, latencySec]);

  const series = useMemo(() => buildRevenueSeries(period, transactions), [period, transactions]);

  const kabarEvents: KabarEvent[] = useMemo(() => {
    const items: KabarEvent[] = [];
    for (const s of sensors) {
      items.push({
        id: `sen-${s.sensor_id}-${s.parcel_id}`,
        tsWib: formatWibTime(s.timestamp),
        parcelId: s.parcel_id,
        title: s.flameDetected ? `Sensor api aktif di ${s.parcel_id}` : `Telemetri ${s.sensor_id} diterima`,
        detail: s.flameDetected
          ? `Suhu ${s.temperature}°C, unit ditahan otomatis.`
          : `Suhu ${s.temperature}°C, kelembapan tanah ${s.soil_moisture}%.`,
        href: `/peta/${encodeURIComponent(s.parcel_id)}`,
        tone: s.flameDetected ? "warning" : "verified",
      });
    }
    for (const v of verificationRecords) {
      items.push({
        id: `ver-${v.record_id}`,
        tsWib: formatWibTime(v.timestamp),
        parcelId: v.parcel_id,
        title: `Segel ${v.record_id} blok #${v.block_index}`,
        detail: v.eas_uid ? "Terkunci di Base Sepolia (testnet)." : "Menunggu penguncian.",
        href: `/verifikasi/${encodeURIComponent(String(v.block_index))}`,
        tone: "seal",
      });
    }
    for (const c of consentRecords) {
      items.push({
        id: `con-${c.receipt_id}`,
        tsWib: formatWibTime(c.timestamp),
        parcelId: c.parcel_id,
        title: `Izin komunitas ${c.parcel_id}`,
        detail: `${c.community} (${c.status === "granted" ? "disetujui" : c.status}).`,
        href: `/izin/${encodeURIComponent(c.parcel_id)}`,
        tone: c.status === "granted" ? "verified" : "warning",
      });
    }
    return items.slice(0, 10);
  }, [sensors, verificationRecords, consentRecords]);

  const roleCardStats = useMemo(() => {
    const activeConsentCount = consentRecords.filter((c) => c.status === "granted").length;
    const warningOrDispute = parcels.filter(
      (p) => p.verificationStatus === "warning" || p.verificationStatus === "dispute"
    ).length;
    const verifiedCount = parcels.filter((p) => p.verificationStatus === "verified").length;

    if (role === "community") {
      return {
        linkedLabel: parcels[0]?.name ?? "Lahan A",
        items: [
          { label: "Lahan", value: String(parcels.length) },
          { label: "Izin", value: String(activeConsentCount) },
          { label: "Keberatan", value: "0" },
        ],
      };
    }
    if (role === "manager") {
      return {
        linkedLabel: `${parcels.length} lahan aktif`,
        items: [
          { label: "Lahan", value: String(parcels.length) },
          { label: "Terverifikasi", value: String(verifiedCount) },
          { label: "Perhatian", value: String(warningOrDispute) },
        ],
      };
    }
    if (role === "recipient") {
      return {
        linkedLabel: "Zona Contoh A",
        items: [
          { label: "Zona", value: "1" },
          { label: "Unit dipakai", value: String(metrics.recipientUsedUnits) },
          { label: "Transaksi", value: String(transactions.length) },
        ],
      };
    }
    if (role === "auditor") {
      return {
        linkedLabel: "Registry Verifier (testnet)",
        items: [
          { label: "Tinjau", value: String(Math.max(warningOrDispute, 1)) },
          { label: "Terkunci", value: String(verificationRecords.filter((v) => v.eas_uid).length) },
          { label: "Ditahan", value: String(metrics.statusCounts.BLOCKED + metrics.statusCounts.DISPUTE) },
        ],
      };
    }
    return {
      linkedLabel: "Akses baca publik",
      items: [
        { label: "Lahan", value: String(parcels.length) },
        { label: "Terkunci", value: String(verificationRecords.length) },
        { label: "Anomali", value: String(aiAssessments.filter((a) => a.status === "failed").length) },
      ],
    };
  }, [role, parcels, consentRecords, transactions, verificationRecords, aiAssessments, metrics]);

  const getCardState = useCallback(
    (key: CardKey, hasData: boolean): CardLoadState => {
      if (failedCards[key]) return "error";
      if (isLoading || demoOverride === "loading") return "loading";
      if (demoOverride === "empty" || !hasData) return "empty";
      return "ready";
    },
    [failedCards, isLoading, demoOverride]
  );

  return {
    user,
    role,
    parcels,
    sensors,
    verificationRecords: verificationRecords.slice(0, 3) as VerificationRecord[],
    recentTrades: transactions.slice(0, 4),
    period,
    setPeriod,
    series,
    metrics,
    latencySec,
    kabarEvents,
    roleCardStats,
    getCardState,
    retryCard,
  };
}

