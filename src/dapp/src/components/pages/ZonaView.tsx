"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, CheckCircle2, MapPin, ShieldCheck } from "lucide-react";
import { BotanicalAppShell } from "@/components/dapp/BotanicalAppShell";
import {
  BotanicalCard,
  BotanicalPageHeader,
  CanonicalStatusBadge,
  PageStatePanel,
  RoleRestrictedNotice,
} from "@/components/dapp/BotanicalPrimitives";
import { useDashboardState } from "@/components/dapp/useDashboardStore";
import { normalizeUserRole } from "@/context/DappContext";
import { ZONES_CATALOG } from "@/lib/copy";
import { mapParcelZoneId } from "@/lib/exbon-api";
import { formatWibDateTime, toCanonicalStatus } from "@/lib/dashboard-helpers";
import { formatIdr, formatNumber } from "@/components/dapp/phantom-ui";
import { LiveNumber } from "@/components/motion";
import { Pagination } from "@/components/ui/Pagination";

const ZONE_PAGE_SIZE = 5;

export function ZonaView({ initialZoneId }: { initialZoneId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stateParam = searchParams.get("state");
  const { user, parcels, verificationRecords, transactions, isLoading } = useDashboardState();

  const role = normalizeUserRole(user?.role, user?.email);
  const allowed = role === "manager" || role === "recipient" || role === "auditor";

  const requestedKey = (initialZoneId ?? "ZONE-DEMO-A").toUpperCase();
  const defaultZoneId =
    role === "recipient"
      ? "ZONE-DEMO-A"
      : ZONES_CATALOG[requestedKey]
      ? requestedKey
      : "ZONE-DEMO-A";

  const [selectedZoneId, setSelectedZoneId] = useState<string>(defaultZoneId);
  const [parcelPage, setParcelPage] = useState(1);
  const [transactionPage, setTransactionPage] = useState(1);
  const zone = ZONES_CATALOG[role === "recipient" ? "ZONE-DEMO-A" : selectedZoneId] ?? ZONES_CATALOG["ZONE-DEMO-A"];

  const zoneParcels = useMemo(
    () => parcels.filter((p) => mapParcelZoneId(p.id) === zone.id),
    [parcels, zone.id]
  );

  const zoneTransactions = useMemo(
    () =>
      transactions.filter((tx) => {
        const parcelZone = mapParcelZoneId(tx.parcel_id);
        return parcelZone === zone.id;
      }),
    [transactions, zone.id]
  );
  const safeParcelPage = Math.min(parcelPage, Math.max(1, Math.ceil(zoneParcels.length / ZONE_PAGE_SIZE)));
  const safeTransactionPage = Math.min(transactionPage, Math.max(1, Math.ceil(zoneTransactions.length / ZONE_PAGE_SIZE)));
  const visibleParcels = zoneParcels.slice((safeParcelPage - 1) * ZONE_PAGE_SIZE, safeParcelPage * ZONE_PAGE_SIZE);
  const visibleTransactions = zoneTransactions.slice((safeTransactionPage - 1) * ZONE_PAGE_SIZE, safeTransactionPage * ZONE_PAGE_SIZE);
  React.useEffect(() => {
    if (parcelPage > Math.max(1, Math.ceil(zoneParcels.length / ZONE_PAGE_SIZE))) setParcelPage(1);
    if (transactionPage > Math.max(1, Math.ceil(zoneTransactions.length / ZONE_PAGE_SIZE))) setTransactionPage(1);
  }, [parcelPage, transactionPage, zone.id, zoneParcels.length, zoneTransactions.length]);

  const stats = useMemo(() => {
    const usedUnits = zoneTransactions.reduce((sum, tx) => sum + tx.volume_tco2e, 0);
    const grossIdr = zoneTransactions.reduce((sum, tx) => sum + tx.gross_amount_idr, 0);
    const communityIdr = zoneTransactions.reduce(
      (sum, tx) => sum + tx.community_allocation_idr,
      0
    );
    return { usedUnits, grossIdr, communityIdr };
  }, [zoneTransactions]);

  if (!allowed) {
    return (
      <BotanicalAppShell>
        <RoleRestrictedNotice reason="Ringkasan zona penerima hanya dapat dibuka oleh peran Pengelola Hutan, Penerima Zona, atau Auditor MRV." />
      </BotanicalAppShell>
    );
  }

  const pageState: "loading" | "empty" | "error" | "ready" =
    isLoading || stateParam === "memuat"
      ? "loading"
      : stateParam === "gagal"
      ? "error"
      : stateParam === "kosong"
      ? "empty"
      : "ready";

  const switchZone = (id: string) => {
    setSelectedZoneId(id);
    setParcelPage(1);
    setTransactionPage(1);
    router.replace(`/zona/${encodeURIComponent(id)}`, { scroll: false });
  };

  return (
    <BotanicalAppShell>
      <div className="space-y-5">
        <BotanicalPageHeader
          title={`Laporan ${zone.name}`}
          description={`${zone.description} (${zone.jurisdiction})`}
          showSimulation
        />

        {role !== "recipient" ? (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Pilih zona penerima">
            {Object.values(ZONES_CATALOG).map((item) => {
              const active = item.id === zone.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => switchZone(item.id)}
                  className={`min-h-[44px] rounded-full border px-4 text-[14.5px] font-semibold ${
                    active
                      ? "border-[var(--forest-700)] bg-[var(--forest-700)] text-white"
                      : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-soft)]"
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--seal-line)] bg-[var(--seal-100)] px-4 py-2 text-[14px] font-semibold text-[var(--seal-600)]">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            <span>Akun penerima dibatasi hanya pada zona tertaut: {zone.name}</span>
          </div>
        )}

        <PageStatePanel state={pageState} emptyTitle="Belum ada catatan untuk zona ini">
          <div className="grid gap-4 sm:grid-cols-3">
            <BotanicalCard interactive className="flex flex-col justify-between p-4 sm:p-5">
              <p className="text-[13.5px] font-medium text-[var(--ink-muted)]">Unit terpakai zona</p>
              <p className="xb-display xb-numeric mt-1.5 text-[26px] font-bold text-[var(--status-verified-ink)]">
                <LiveNumber
                  value={stats.usedUnits}
                  format={(v) => formatNumber(Math.round(v))}
                />{" "}
                <span className="text-[14px] font-medium text-[var(--ink-muted)]">tCO2e</span>
              </p>
              <p className="mt-1 text-[13px] text-[var(--ink-muted)]">
                Berasal dari lahan terverifikasi
              </p>
            </BotanicalCard>

            <BotanicalCard interactive className="flex flex-col justify-between p-4 sm:p-5">
              <p className="text-[13.5px] font-medium text-[var(--ink-muted)]">
                Nilai simulasi terserap
              </p>
              <p className="xb-display xb-numeric mt-1.5 text-[24px] font-bold text-[var(--ink)]">
                <LiveNumber value={stats.grossIdr} format={formatIdr} />
              </p>
              <p className="mt-1 text-[13px] text-[var(--ink-muted)]">
                Bagian komunitas{" "}
                <LiveNumber value={stats.communityIdr} format={formatIdr} />
              </p>
            </BotanicalCard>

            <BotanicalCard interactive className="flex flex-col justify-between p-4 sm:p-5">
              <p className="text-[13.5px] font-medium text-[var(--ink-muted)]">
                Status penyaluran zona
              </p>
              <p className="xb-display mt-1.5 flex items-center gap-2 text-[20px] font-bold text-[var(--status-verified-ink)]">
                <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{zone.kind}</span>
              </p>
              <p className="mt-1 text-[13px] text-[var(--ink-muted)]">
                {zoneParcels.length} lahan penyuplai terhubung · {zone.jurisdiction}
              </p>
            </BotanicalCard>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Supply Parcels linked to this Zone */}
            <BotanicalCard className="flex h-full flex-col justify-between p-5">
              <div>
                <h2 className="xb-display text-[18px] font-bold text-[var(--ink)]">
                  Lahan Penyuplai Zona
                </h2>
                <p className="mt-0.5 text-[14.5px] text-[var(--ink-muted)]">
                  Lahan binaan yang menyuplai unit serapan ke zona ini
                </p>
                <div className="mt-4 space-y-3">
                  {visibleParcels.map((parcel) => {
                    const canonical = toCanonicalStatus(parcel.verificationStatus);
                    const rec = verificationRecords.find((v) => v.parcel_id === parcel.id);
                    return (
                      <div
                        key={parcel.id}
                        className="rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="xb-display font-bold text-[var(--ink)]">{parcel.name}</p>
                            <p className="xb-numeric text-[13.5px] text-[var(--ink-muted)]">
                              {parcel.id} · {formatNumber(parcel.area)} ha
                            </p>
                          </div>
                          <CanonicalStatusBadge status={canonical} compact />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Link
                            href={`/peta/${encodeURIComponent(parcel.id)}`}
                            className="inline-flex min-h-[40px] items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 text-[13.5px] font-semibold text-[var(--ink)] hover:bg-[var(--leaf-100)]"
                          >
                            <span>Lihat peta</span>
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </Link>
                          {rec && (
                            <Link
                              href={`/verifikasi/${encodeURIComponent(String(rec.block_index))}`}
                              className="inline-flex min-h-[40px] items-center gap-1 rounded-full bg-[var(--seal-100)] px-3.5 text-[13.5px] font-semibold text-[var(--seal-600)] transition hover:bg-[var(--seal-200)]"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Segel #{rec.block_index}</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Pagination page={safeParcelPage} pageSize={ZONE_PAGE_SIZE} totalItems={zoneParcels.length} onPageChange={setParcelPage} label="Halaman lahan penyuplai" className="mt-3" />
              </div>
              <p className="mt-4 border-t border-[var(--line-subtle)] pt-3 text-[13px] text-[var(--ink-muted)]">
                Penyaluran otomatis mengikuti batas kelayakan tiap lahan.
              </p>
            </BotanicalCard>

            {/* Zone Recorded Ledger Consumption */}
            <BotanicalCard className="flex h-full flex-col justify-between p-5">
              <div>
                <h2 className="xb-display text-[18px] font-bold text-[var(--ink)]">
                  Catatan Pemakaian Zona
                </h2>
                <p className="mt-0.5 text-[14.5px] text-[var(--ink-muted)]">
                  Riwayat penerimaan unit dan bukti penelusuran segel
                </p>

                {zoneTransactions.length === 0 ? (
                  <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-4 text-[15px] text-[var(--ink-muted)]">
                    Belum ada catatan transaksi tercatat langsung ke zona {zone.name}.
                  </div>
                ) : (
                  <div className="mt-4 space-y-2.5">
                    {visibleTransactions.map((tx) => (
                      <div
                        key={tx.tx_id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-4"
                      >
                        <div>
                          <p className="xb-mono text-[13px] font-bold text-[var(--seal-600)]">
                            {tx.tx_id}
                          </p>
                          <p className="font-semibold text-[var(--ink)]">
                            Dari {tx.parcel_id} · {formatNumber(tx.volume_tco2e)} tCO2e
                          </p>
                          <p className="xb-numeric text-[13.5px] text-[var(--ink-muted)]">
                            {formatWibDateTime(tx.timestamp)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="xb-display xb-numeric font-bold text-[var(--ink)]">
                            {formatIdr(tx.gross_amount_idr)}
                          </p>
                          <p className="xb-numeric text-[13.5px] font-semibold text-[var(--status-verified-ink)]">
                            Komunitas {formatIdr(tx.community_allocation_idr)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Pagination page={safeTransactionPage} pageSize={ZONE_PAGE_SIZE} totalItems={zoneTransactions.length} onPageChange={setTransactionPage} label="Halaman transaksi zona" className="mt-3" />
              </div>
              <p className="mt-4 border-t border-[var(--line-subtle)] pt-3 text-[13px] text-[var(--ink-muted)]">
                Menampilkan {visibleTransactions.length} dari {zoneTransactions.length} catatan transaksi zona.
              </p>
            </BotanicalCard>
          </div>
        </PageStatePanel>
      </div>
    </BotanicalAppShell>
  );
}
