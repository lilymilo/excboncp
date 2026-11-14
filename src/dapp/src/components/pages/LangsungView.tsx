"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpRight,
  Pause,
  Play,
  Radio,
  ShieldCheck,
  Wifi,
  WifiOff,
} from "lucide-react";
import { BotanicalAppShell } from "@/components/dapp/BotanicalAppShell";
import { MarketTrendAreaChart } from "@/components/charts/ChartPrimitives";
import {
  BotanicalCard,
  BotanicalPageHeader,
  PageStatePanel,
  RoleRestrictedNotice,
} from "@/components/dapp/BotanicalPrimitives";
import { useDashboardState } from "@/components/dapp/useDashboardStore";
import { PRICE_PER_TON, normalizeUserRole } from "@/context/DappContext";
import {
  buildLiveTradeRows,
  getApiBaseUrl,
  mapParcelZoneId,
  type LiveTradeRow,
} from "@/lib/exbon-api";
import { ZONES_CATALOG } from "@/lib/copy";
import { formatWibTime } from "@/lib/dashboard-helpers";
import { formatIdr, formatNumber } from "@/components/dapp/phantom-ui";
import { LiveNumber, LiveClock } from "@/components/motion";
import { Pagination } from "@/components/ui/Pagination";

type StreamStatus = "live" | "reconnecting" | "polling";
const FEED_PAGE_SIZE = 10;

export function LangsungView() {
  const searchParams = useSearchParams();
  const stateParam = searchParams.get("state");
  const {
    user,
    parcels,
    sensors,
    verificationRecords,
    transactions,
    isLoading,
  } = useDashboardState();

  const role = normalizeUserRole(user?.role, user?.email);
  const isGuest = role === "guest";

  const initialRows = useMemo(
    () => buildLiveTradeRows({ transactions, parcels, verificationRecords, role }),
    [transactions, parcels, verificationRecords, role]
  );

  const [feedRows, setFeedRows] = useState<LiveTradeRow[]>(initialRows);
  const [queuedRows, setQueuedRows] = useState<LiveTradeRow[]>([]);
  const [paused, setPaused] = useState(false);
  const [streamStatus, setStreamStatus] = useState<StreamStatus>("live");
  const [flashIds, setFlashIds] = useState<Record<string, boolean>>({});
  const [lastSensorSec, setLastSensorSec] = useState(6);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const [feedPage, setFeedPage] = useState(1);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    setFeedRows((prev) => {
      const seen = new Set(prev.map((r) => r.id));
      const merged = [...initialRows.filter((r) => !seen.has(r.id)), ...prev];
      return merged.slice(0, 200);
    });
  }, [initialRows]);

  useEffect(() => {
    if (isGuest) return;
    const apiBase = getApiBaseUrl();

    if (apiBase && streamStatus === "live") {
      try {
        const source = new EventSource(`${apiBase}/market/stream`);
        source.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data) as Partial<LiveTradeRow>;
            if (!parsed.id || !parsed.parcel_id) return;
            const zoneId = mapParcelZoneId(parsed.parcel_id);
            const row: LiveTradeRow = {
              id: parsed.id,
              ts: parsed.ts ?? new Date().toISOString(),
              parcel_id: parsed.parcel_id,
              parcel_name: parsed.parcel_name ?? parsed.parcel_id,
              zone_id: parsed.zone_id ?? zoneId,
              zone_name: ZONES_CATALOG[zoneId].name,
              units: Number(parsed.units ?? 4),
              unit_price_idr: Number(parsed.unit_price_idr ?? PRICE_PER_TON),
              total_idr: Number(parsed.total_idr ?? 600_000),
              community_idr: Number(parsed.community_idr ?? 352_800),
              manager_idr: Number(parsed.manager_idr ?? 235_200),
              source: parsed.source === "scenario" ? "scenario" : "order",
              ledger_id: parsed.ledger_id ?? "1",
            };
            if (pausedRef.current) {
              setQueuedRows((q) => [row, ...q].slice(0, 50));
            } else {
              setFeedRows((prev) => [row, ...prev].slice(0, 200));
              setFlashIds((prev) => ({ ...prev, [row.id]: true }));
              setTimeout(() => {
                setFlashIds((prev) => {
                  const copy = { ...prev };
                  delete copy[row.id];
                  return copy;
                });
              }, 1250);
            }
          } catch {
            // Ignore malformed stream frame cleanly without failing screen
          }
        };
        source.onerror = () => {
          setStreamStatus("polling");
          source.close();
        };
        return () => source.close();
      } catch {
        setStreamStatus("polling");
      }
    }

    // Mock stream / fallback polling cadence
    const intervalMs = streamStatus === "polling" ? 10_000 : 4_500;
    const timer = setInterval(() => {
      if (streamStatus === "reconnecting") return;
      const targetParcel =
        role === "community" ? parcels[0] : parcels.find((p) => p.verificationStatus === "verified") ?? parcels[0];
      if (!targetParcel) return;
      const zoneId = mapParcelZoneId(targetParcel.id);
      if (role === "recipient" && zoneId !== "ZONE-DEMO-A") return;

      const units = Math.floor(Math.random() * 4) + 2;
      const total = units * PRICE_PER_TON;
      const row: LiveTradeRow = {
        id: `STREAM-${Date.now().toString(36).toUpperCase()}`,
        ts: new Date().toISOString(),
        parcel_id: targetParcel.id,
        parcel_name: targetParcel.name,
        zone_id: zoneId,
        zone_name: ZONES_CATALOG[zoneId].name,
        units,
        unit_price_idr: PRICE_PER_TON,
        total_idr: total,
        community_idr: Math.round(total * 0.98 * 0.6),
        manager_idr: Math.round(total * 0.98 * 0.4),
        source: "order",
        ledger_id: verificationRecords[0] ? String(verificationRecords[0].block_index) : "1",
      };

      if (pausedRef.current) {
        setQueuedRows((prev) => [row, ...prev].slice(0, 50));
      } else {
        setFeedRows((prev) => [row, ...prev].slice(0, 200));
        setFlashIds((prev) => ({ ...prev, [row.id]: true }));
        setTimeout(() => {
          setFlashIds((prev) => {
            const copy = { ...prev };
            delete copy[row.id];
            return copy;
          });
        }, 1250);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isGuest, streamStatus, role, parcels, verificationRecords]);

  // Announce polite summary every 10s, never each row
  useEffect(() => {
    const tick = setInterval(() => {
      setLastSensorSec((prev) => (prev >= 28 ? 3 : prev + 2));
    }, 2000);
    const ariaTimer = setInterval(() => {
      setLiveAnnouncement(
        `Pembaruan umpan langsung: ${feedRows.length} catatan transaksi simulasi tercatat hari ini.`
      );
    }, 10_000);
    return () => {
      clearInterval(tick);
      clearInterval(ariaTimer);
    };
  }, [feedRows.length]);

  const handleTogglePause = () => {
    if (paused) {
      setFeedRows((prev) => [...queuedRows, ...prev].slice(0, 200));
      setQueuedRows([]);
      setPaused(false);
    } else {
      setPaused(true);
    }
  };

  const totalsSummary = useMemo(() => {
    const available = parcels.reduce((sum, p) => sum + p.availableUnits, 0);
    const frozen = parcels.reduce((sum, p) => sum + p.frozenUnits, 0);
    const todayGross = feedRows.reduce((sum, r) => sum + r.total_idr, 0);
    const todayUnits = feedRows.reduce((sum, r) => sum + r.units, 0);
    const todayCommunity = feedRows.reduce((sum, r) => sum + r.community_idr, 0);
    return {
      available,
      frozen,
      totalPool: Math.max(available + frozen, 1),
      todayGross,
      todayUnits,
      todayCommunity,
    };
  }, [parcels, feedRows]);
  const totalFeedPages = Math.max(1, Math.ceil(feedRows.length / FEED_PAGE_SIZE));
  const safeFeedPage = Math.min(feedPage, totalFeedPages);
  const paginatedFeed = feedRows.slice((safeFeedPage - 1) * FEED_PAGE_SIZE, safeFeedPage * FEED_PAGE_SIZE);
  useEffect(() => {
    if (feedPage > totalFeedPages) setFeedPage(totalFeedPages);
  }, [feedPage, totalFeedPages]);

  const cumulativeSeries = useMemo(() => {
    const ordered = [...feedRows].reverse();
    let running = 0;
    const slots = ordered.slice(-8).map((row) => {
      running += row.total_idr;
      return {
        label: formatWibTime(row.ts).replace(" WIB", ""),
        grossIdr: running,
        units: row.units,
      };
    });
    if (slots.length < 2) {
      return [
        { label: "09:00", grossIdr: 600_000, units: 4 },
        { label: "11:00", grossIdr: 1_500_000, units: 6 },
        { label: "13:00", grossIdr: 2_100_000, units: 4 },
        { label: "15:00", grossIdr: Math.max(totalsSummary.todayGross, 2_700_000), units: 4 },
      ];
    }
    return slots;
  }, [feedRows, totalsSummary.todayGross]);

  const recentStatusEvents = useMemo(() => {
    return sensors.slice(0, 3).map((s) => ({
      id: `ev-${s.sensor_id}`,
      parcel_id: s.parcel_id,
      text: s.flameDetected
        ? `${s.parcel_id}: Perlu perhatian, deteksi api (${formatWibTime(s.timestamp)})`
        : `${s.parcel_id}: Telemetri ${s.sensor_id} normal (${formatWibTime(s.timestamp)})`,
      tone: s.flameDetected ? "warn" : "ok",
    }));
  }, [sensors]);

  const statusMeta =
    streamStatus === "live"
      ? {
          label: "Langsung",
          cls: "bg-[var(--status-verified-bg)] text-[var(--status-verified-ink)]",
          Icon: Wifi,
        }
      : streamStatus === "reconnecting"
      ? {
          label: "Menyambung ulang...",
          cls: "bg-[var(--status-warning-bg)] text-[var(--status-warning-ink)]",
          Icon: Radio,
        }
      : {
          label: "Terputus, menyegarkan tiap 10 detik",
          cls: "bg-[var(--status-dispute-bg)] text-[var(--status-dispute-ink)]",
          Icon: WifiOff,
        };

  if (isGuest) {
    return (
      <BotanicalAppShell>
        <RoleRestrictedNotice reason="Umpan transaksi simulasi langsung hanya dibuka untuk akun yang telah masuk (Komunitas, Pengelola, Penerima Zona, atau Auditor)." />
      </BotanicalAppShell>
    );
  }

  const pageState: "loading" | "empty" | "error" | "ready" =
    isLoading || stateParam === "memuat"
      ? "loading"
      : stateParam === "gagal"
      ? "error"
      : feedRows.length === 0 || stateParam === "kosong"
      ? "empty"
      : "ready";

  return (
    <BotanicalAppShell>
      <div className="space-y-5">
        <div aria-live="polite" className="sr-only">
          {liveAnnouncement}
        </div>

        <BotanicalPageHeader
          title="Transaksi & Kejadian Langsung"
          description="Pantau aliran alokasi unit simulasi, perubahan status sensor lapangan, dan akumulasi pendapatan simulasi secara waktu nyata."
          showSimulation
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setStreamStatus((prev) => (prev === "live" ? "polling" : "live"))
                }
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-[14px] font-semibold text-[var(--ink)] transition-transform duration-150 hover:scale-[1.01] active:scale-95 hover:bg-[var(--surface-soft)]"
              >
                <span>{streamStatus === "live" ? "Uji mode polling" : "Aktifkan stream"}</span>
              </button>
              <span className="xb-numeric hidden items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2 text-[13px] font-semibold text-[var(--ink-muted)] md:inline-flex">
                <span aria-hidden="true" className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--forest-700)] opacity-55" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--forest-700)]" />
                </span>
                <LiveClock />
              </span>
            </div>
          }
        />

        <PageStatePanel
          state={pageState}
          emptyTitle="Belum ada transaksi hari ini"
          emptyDescription="Umpan akan terisi otomatis saat ada alokasi simulasi atau peristiwa skenario baru."
          emptyActionHref={role === "manager" ? "/screener?lahan=PARCEL-A" : undefined}
          emptyActionLabel={
            role === "manager" ? "Buka Pasar & Screener" : undefined
          }
        >
          {/* Live Stream Telemetry Strip */}
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            <BotanicalCard interactive className="p-4">
              <p className="text-[13px] font-medium text-[var(--ink-muted)]">Transaksi sesi aktif</p>
              <p className="xb-display xb-numeric mt-1 text-[23px] font-bold text-[var(--ink)]">
                <LiveNumber value={feedRows.length} format={(v) => String(Math.round(v))} />{" "}
                <span className="text-[13.5px] font-medium text-[var(--ink-muted)]">catatan</span>
              </p>
              <p className="mt-1 text-[12px] text-[var(--status-verified-ink)]">
                Stream {streamStatus === "live" ? "aktif (tiap 4,5 dtk)" : "mode polling"}
              </p>
            </BotanicalCard>

            <BotanicalCard interactive className="p-4">
              <p className="text-[13px] font-medium text-[var(--ink-muted)]">Volume mengalir hari ini</p>
              <p className="xb-display xb-numeric mt-1 text-[23px] font-bold text-[var(--status-verified-ink)]">
                <LiveNumber
                  value={totalsSummary.todayUnits}
                  format={(v) => formatNumber(Math.round(v))}
                />{" "}
                <span className="text-[13.5px] font-medium text-[var(--ink-muted)]">tCO2e</span>
              </p>
              <p className="mt-1 text-[12px] text-[var(--ink-muted)]">
                Dari {parcels.filter((p) => p.verificationStatus === "verified").length} lahan terverifikasi
              </p>
            </BotanicalCard>

            <BotanicalCard interactive className="p-4">
              <p className="text-[13px] font-medium text-[var(--ink-muted)]">Hak komunitas (60%)</p>
              <p className="xb-display xb-numeric mt-1 text-[23px] font-bold text-[var(--ink)]">
                <LiveNumber value={totalsSummary.todayCommunity} format={formatIdr} />
              </p>
              <p className="mt-1 text-[12px] text-[var(--ink-muted)]">
                Setelah biaya sandbox 2%
              </p>
            </BotanicalCard>

            <BotanicalCard interactive className="p-4">
              <p className="text-[13px] font-medium text-[var(--ink-muted)]">Detak sensor lapangan</p>
              <p className="xb-display xb-numeric mt-1 text-[23px] font-bold text-[var(--seal-600)]">
                <LiveNumber value={lastSensorSec} format={(v) => `${Math.round(v)} dtk`} />
              </p>
              <p className="mt-1 text-[12px] text-[var(--ink-muted)]">
                {sensors.length} titik telemetri Bogor
              </p>
            </BotanicalCard>
          </div>

          <div className="grid gap-4 xl:grid-cols-12">
            {/* Left 2/3 Column: Live Feed */}
            <BotanicalCard className="flex h-full flex-col justify-between overflow-hidden xl:col-span-8">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="xb-display text-[18px] font-bold text-[var(--ink)]">
                      Umpan Transaksi Simulasi
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13.5px] font-semibold transition-transform duration-150 hover:scale-[1.02] ${statusMeta.cls}`}
                    >
                      <span aria-hidden="true" className="relative flex h-1.5 w-1.5">
                        <span
                          className={`absolute inline-flex h-full w-full rounded-full opacity-55 ${
                            streamStatus === "live" ? "animate-ping bg-[var(--forest-700)]" : ""
                          }`}
                        />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
                      </span>
                      <span>{statusMeta.label}</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleTogglePause}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 text-[14.5px] font-semibold text-[var(--ink)] hover:bg-[var(--leaf-100)]"
                  >
                    {paused ? (
                      <>
                        <Play className="h-4 w-4 text-[var(--status-verified-ink)]" aria-hidden="true" />
                        <span>Lanjutkan ({queuedRows.length} baru)</span>
                      </>
                    ) : (
                      <>
                        <Pause className="h-4 w-4 text-[var(--status-warning-ink)]" aria-hidden="true" />
                        <span>Jeda umpan</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Desktop Table (>= 768px) */}
                <div className="hidden max-h-[420px] overflow-auto md:block">
                  <table className="w-full border-collapse text-left">
                    <thead className="sticky top-0 z-10">
                      <tr className="border-b border-[var(--line)] bg-[var(--surface-soft)] text-[13.5px] font-semibold text-[var(--ink-muted)]">
                        <th scope="col" className="px-4 py-3">Jam</th>
                        <th scope="col" className="px-4 py-3">Lahan ke Zona</th>
                        <th scope="col" className="px-4 py-3 text-right">Unit</th>
                        <th scope="col" className="px-4 py-3 text-right">Harga</th>
                        <th scope="col" className="px-4 py-3 text-right">Total</th>
                        <th scope="col" className="px-4 py-3">Jenis</th>
                        <th scope="col" className="px-4 py-3">Segel</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--line)] text-[14.5px]">
                      {paginatedFeed.map((row) => (
                        <tr
                          key={row.id}
                          className={
                            flashIds[row.id] ? "xb-tx-flash" : "hover:bg-[var(--surface-soft)]"
                          }
                        >
                          <td className="xb-numeric whitespace-nowrap px-4 py-3 font-medium text-[var(--ink-muted)]">
                            {formatWibTime(row.ts)}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-[var(--ink)]">
                              {row.parcel_id} ke {row.zone_name}
                            </p>
                            <p className="xb-mono text-[12.5px] text-[var(--ink-muted)]">{row.id}</p>
                          </td>
                          <td className="xb-numeric whitespace-nowrap px-4 py-3 text-right font-semibold text-[var(--status-verified-ink)]">
                            +{formatNumber(row.units)} t
                          </td>
                          <td className="xb-numeric whitespace-nowrap px-4 py-3 text-right text-[var(--ink-muted)]">
                            {formatIdr(row.unit_price_idr)}
                          </td>
                          <td className="xb-numeric whitespace-nowrap px-4 py-3 text-right font-bold text-[var(--ink)]">
                            {formatIdr(row.total_idr)}
                          </td>
                          <td className="px-4 py-3">
                            {row.source === "scenario" ? (
                              <span className="inline-flex items-center rounded-full bg-[var(--status-warning-bg)] px-2.5 py-0.5 text-[12.5px] font-semibold text-[var(--status-warning-ink)]">
                                Skenario
                              </span>
                            ) : (
                              <span className="text-[13.5px] font-medium text-[var(--ink-muted)]">
                                Simulasi
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {row.ledger_id ? (
                              <Link
                                href={`/verifikasi/${encodeURIComponent(row.ledger_id)}`}
                                className="inline-flex min-h-[34px] items-center gap-1 rounded-full bg-[var(--seal-100)] px-3 py-1 text-[13px] font-semibold text-[var(--seal-600)] transition hover:bg-[var(--seal-200)]"
                              >
                                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>Periksa</span>
                              </Link>
                            ) : (
                              <span className="text-[13.5px] text-[var(--ink-muted)]">Menunggu</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Stacked Feed Cards (< 768px) */}
                <div className="divide-y divide-[var(--line)] md:hidden">
                  {paginatedFeed.map((row) => (
                    <div
                      key={row.id}
                      className={`p-4 ${flashIds[row.id] ? "xb-tx-flash" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-[var(--ink)]">
                            {row.parcel_id} ke {row.zone_name}
                          </p>
                          <p className="xb-numeric text-[13px] text-[var(--ink-muted)]">
                            {formatWibTime(row.ts)} · {row.source === "scenario" ? "Skenario" : "Simulasi"}
                          </p>
                        </div>
                        <span className="xb-numeric shrink-0 font-bold text-[var(--status-verified-ink)]">
                          +{formatNumber(row.units)} t
                        </span>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <span className="xb-numeric text-[15px] font-bold text-[var(--ink)]">
                          {formatIdr(row.total_idr)}
                        </span>
                        {row.ledger_id ? (
                          <Link
                            href={`/verifikasi/${encodeURIComponent(row.ledger_id)}`}
                            className="inline-flex min-h-[36px] items-center gap-1 rounded-full bg-[var(--seal-100)] px-3 text-[13px] font-semibold text-[var(--seal-600)]"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Periksa segel</span>
                          </Link>
                        ) : (
                          <span className="text-[13px] text-[var(--ink-muted)]">Menunggu segel</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Pagination
                page={safeFeedPage}
                pageSize={FEED_PAGE_SIZE}
                totalItems={feedRows.length}
                onPageChange={setFeedPage}
                label="Halaman umpan transaksi langsung"
                className="mx-5 mb-3"
              />
              <p className="border-t border-[var(--line)] bg-[var(--surface-soft)] px-5 py-2.5 text-[13.5px] text-[var(--ink-muted)]">
                Halaman {safeFeedPage} dari {totalFeedPages} · riwayat maksimal 200 baris.
              </p>
            </BotanicalCard>

            {/* Right 1/3 Column: Market Condition & Status Alerts */}
            <div className="xl:col-span-4">
              <BotanicalCard className="flex h-full flex-col justify-between p-5">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="xb-display text-[18px] font-bold text-[var(--ink)]">
                      Kondisi Pasar
                    </h2>
                    <span className="rounded-full bg-[var(--status-verified-bg)] px-3 py-1 text-[13.5px] font-semibold text-[var(--status-verified-ink)]">
                      Aktif simulasi
                    </span>
                  </div>

                  <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-4 transition-transform duration-200 hover:-translate-y-0.5">
                    <p className="text-[13.5px] font-medium text-[var(--ink-muted)]">
                      Pendapatan hari ini
                    </p>
                    <div className="mt-1">
                      <LiveNumber
                        value={totalsSummary.todayGross}
                        format={formatIdr}
                        className="xb-display xb-numeric text-[26px] font-bold text-[var(--ink)]"
                        durationMs={700}
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-[14px] font-semibold">
                      <span className="xb-numeric text-[var(--status-verified-ink)]">
                        Tersedia {formatNumber(totalsSummary.available)} t
                      </span>
                      <span className="xb-numeric text-[var(--status-blocked-ink)]">
                        Beku {formatNumber(totalsSummary.frozen)} t
                      </span>
                    </div>
                    <div
                      className="flex h-3 w-full overflow-hidden rounded-full bg-[var(--status-blocked-bg)]"
                      role="img"
                      aria-label={`Perbandingan unit tersedia ${totalsSummary.available} tCO2e dan beku ${totalsSummary.frozen} tCO2e`}
                    >
                      <div
                        style={{
                          width: `${Math.round(
                            (totalsSummary.available / totalsSummary.totalPool) * 100
                          )}%`,
                        }}
                        className="h-full bg-[var(--forest-700)]"
                      />
                    </div>
                  </div>

                  <div className="mt-5 border-t border-[var(--line)] pt-4">
                    <p className="text-[14.5px] font-bold text-[var(--ink)]">
                      3 Kejadian status terbaru
                    </p>
                    <ul className="mt-2.5 space-y-2">
                      {recentStatusEvents.map((ev) => (
                        <li key={ev.id}>
                          <Link
                            href={`/peta/${encodeURIComponent(ev.parcel_id)}`}
                            className="flex min-h-[44px] items-start justify-between gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 text-[14px] hover:bg-[var(--surface-soft)]"
                          >
                            <span className="flex items-start gap-2 text-[var(--ink)]">
                              <AlertTriangle
                                className={`mt-0.5 h-4 w-4 shrink-0 ${
                                  ev.tone === "warn"
                                    ? "text-[var(--status-warning-ink)]"
                                    : "text-[var(--status-verified-ink)]"
                                }`}
                                aria-hidden="true"
                              />
                              <span>{ev.text}</span>
                            </span>
                            <ArrowUpRight
                              className="h-4 w-4 shrink-0 text-[var(--ink-muted)]"
                              aria-hidden="true"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <p className="xb-numeric mt-4 flex items-center gap-1.5 border-t border-[var(--line-subtle)] pt-3 text-[13.5px] text-[var(--ink-muted)]">
                  <span aria-hidden="true" className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--forest-700)] opacity-55" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--forest-700)]" />
                  </span>
                  <span>
                    Sensor terakhir diterima {lastSensorSec} detik lalu
                  </span>
                </p>
              </BotanicalCard>
            </div>
          </div>

          {/* Bottom Full-Width Cumulative Revenue Chart */}
          <BotanicalCard className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="xb-display text-[17px] font-bold text-[var(--ink)]">
                  Pendapatan Kumulatif Hari Ini per Jam
                </h2>
                <p className="text-[13.5px] text-[var(--ink-muted)]">
                  Akumulasi nilai transaksi simulasi yang tercatat pada sesi berjalan
                </p>
              </div>
              <Link
                href="/rekap/harian"
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-4 text-[13.5px] font-semibold text-[var(--ink)] hover:bg-[var(--leaf-100)]"
              >
                <span>Buka Rekap Harian</span>
                <ArrowUpRight className="h-4 w-4 text-[var(--forest-700)]" aria-hidden="true" />
              </Link>
            </div>

            <div
              className="mt-3"
              aria-label={`Grafik pendapatan kumulatif hari ini total ${formatIdr(totalsSummary.todayGross)}`}
            >
              <MarketTrendAreaChart
                data={cumulativeSeries}
                heightClassName="h-[190px]"
                contextTag="Kumulatif Sesi"
              />
            </div>
          </BotanicalCard>
        </PageStatePanel>
      </div>
    </BotanicalAppShell>
  );
}
