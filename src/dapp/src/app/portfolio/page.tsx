"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Leaf, ShieldCheck, Wallet } from "lucide-react";
import { AppShell } from "@/components/dapp/AppShell";
import {
  CoinsPlusIcon,
  CollectiblesEmptyIcon,
} from "@/components/dapp/PhantomIllustrations";
import {
  Card,
  Disclosure,
  EmptyState,
  StatusPill,
  Tabs,
  buttonClass,
  cx,
  formatIdr,
  formatIdrShort,
  formatNumber,
} from "@/components/dapp/phantom-ui";
import { useDashboardState } from "@/components/dapp/useDashboardStore";
import { normalizeUserRole } from "@/context/DappContext";

type PortfolioTab = "holdings" | "allocations" | "proofs";

const TABS: { id: PortfolioTab; label: string }[] = [
  { id: "holdings", label: "Carbon Units" },
  { id: "allocations", label: "Alokasi Hasil 60/40" },
  { id: "proofs", label: "Bukti EAS" },
];

export default function PortfolioPage() {
  const { user, parcels, transactions, verificationRecords } = useDashboardState();
  const [tab, setTab] = useState<PortfolioTab>("holdings");

  const role = normalizeUserRole(user?.role, user?.email);

  const portfolioSummary = useMemo(() => {
    const totalUnits = transactions.reduce((sum, tx) => sum + tx.volume_tco2e, 0);
    const totalGross = transactions.reduce((sum, tx) => sum + tx.gross_amount_idr, 0);
    const communityTotal = transactions.reduce((sum, tx) => sum + tx.community_allocation_idr, 0);
    const managerTotal = transactions.reduce((sum, tx) => sum + tx.manager_allocation_idr, 0);
    const mrvTotal = transactions.reduce((sum, tx) => sum + tx.mrv_allocation_idr, 0);

    const byParcelMap = new Map<
      string,
      { parcelId: string; volume: number; grossIdr: number; count: number; lastTimestamp: string }
    >();

    transactions.forEach((tx) => {
      const existing = byParcelMap.get(tx.parcel_id);
      if (!existing) {
        byParcelMap.set(tx.parcel_id, {
          parcelId: tx.parcel_id,
          volume: tx.volume_tco2e,
          grossIdr: tx.gross_amount_idr,
          count: 1,
          lastTimestamp: tx.timestamp,
        });
      } else {
        existing.volume += tx.volume_tco2e;
        existing.grossIdr += tx.gross_amount_idr;
        existing.count += 1;
        if (new Date(tx.timestamp) > new Date(existing.lastTimestamp)) {
          existing.lastTimestamp = tx.timestamp;
        }
      }
    });

    return {
      totalUnits,
      totalGross,
      communityTotal,
      managerTotal,
      mrvTotal,
      holdings: Array.from(byParcelMap.values()),
    };
  }, [transactions]);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Portfolio Wallet Header Card */}
        <Card className="p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-[12.5px] font-medium text-[#AA9AF5]">
                <Wallet className="h-4 w-4" aria-hidden="true" />
                Portfolio &amp; Kas Simulasi ({role})
              </span>
              <p className="mt-2 text-[34px] font-semibold tracking-[-0.03em] text-[#F4F5F2] xb-numeric sm:text-[38px]">
                {formatNumber(portfolioSummary.totalUnits)}{" "}
                <span className="text-[18px] font-medium text-[#8B948D]">tCO₂e</span>
              </p>
              <p className="mt-1 text-[14px] text-[#A6ADA7] xb-numeric">
                Total nilai simulasi {formatIdr(portfolioSummary.totalGross)} dari{" "}
                {transactions.length} settlement tercatat
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/market"
                className={buttonClass("lavender", "h-12 rounded-full px-6 text-[14px]")}
              >
                Beli Unit Karbon
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/verify"
                className={buttonClass("secondary", "h-12 rounded-full px-5 text-[14px]")}
              >
                Cek Rantai Hash
              </Link>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 border-t border-[#252B27] pt-5 sm:grid-cols-3">
            <div className="rounded-xl bg-[#1D211E] px-4 py-3">
              <p className="text-[12px] text-[#A6ADA7]">Kas Komunitas Adat (60%)</p>
              <p className="mt-1 text-[18px] font-semibold text-[#72C99A] xb-numeric">
                {formatIdrShort(portfolioSummary.communityTotal)}
              </p>
            </div>
            <div className="rounded-xl bg-[#1D211E] px-4 py-3">
              <p className="text-[12px] text-[#A6ADA7]">Operasi Pengelola (40%)</p>
              <p className="mt-1 text-[18px] font-semibold text-[#AA9AF5] xb-numeric">
                {formatIdrShort(portfolioSummary.managerTotal)}
              </p>
            </div>
            <div className="rounded-xl bg-[#1D211E] px-4 py-3">
              <p className="text-[12px] text-[#A6ADA7]">Biaya Sandbox MRV (2%)</p>
              <p className="mt-1 text-[18px] font-semibold text-[#F2B84B] xb-numeric">
                {formatIdrShort(portfolioSummary.mrvTotal)}
              </p>
            </div>
          </div>
        </Card>

        {/* Phantom Tabs Section */}
        <section className="space-y-4">
          <Tabs
            variant="phantom"
            items={TABS}
            value={tab}
            onChange={setTab}
            label="Kategori portfolio karbon"
          />

          {tab === "holdings" && (
            <Card className="overflow-hidden">
              {portfolioSummary.holdings.length === 0 ? (
                <EmptyState
                  illustration={<CoinsPlusIcon className="h-16 w-16" />}
                  title="Belum ada unit karbon dimiliki"
                  body="Ajukan pembelian simulasi di Carbon Market untuk membangun portofolio aset karbon."
                  action={
                    <Link href="/market" className={buttonClass("lavender", "rounded-full")}>
                      Jelajahi Carbon Market
                    </Link>
                  }
                />
              ) : (
                <div className="divide-y divide-[#252B27]">
                  {portfolioSummary.holdings.map((item) => {
                    const parcel = parcels.find((p) => p.id === item.parcelId);
                    return (
                      <Link
                        key={item.parcelId}
                        href="/market"
                        className="flex flex-col justify-between gap-3 px-5 py-4 hover:bg-[#1D211E] sm:flex-row sm:items-center"
                      >
                        <div className="flex min-w-0 items-center gap-3.5">
                          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#72C99A]/35 bg-[#23865A]/20 text-[#72C99A]">
                            <Leaf className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="truncate text-[15px] font-semibold text-[#F4F5F2]">
                                {parcel?.name ?? item.parcelId}
                              </span>
                              {parcel && <StatusPill status={parcel.verificationStatus} />}
                            </div>
                            <p className="mt-1 text-[12.5px] text-[#A6ADA7]">
                              {parcel?.region ?? "Bogor"} · {item.count} transaksi settlement
                            </p>
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-[16px] font-semibold text-[#F4F5F2] xb-numeric">
                            {formatNumber(item.volume)} tCO₂e
                          </p>
                          <p className="mt-0.5 text-[12.5px] text-[#72C99A] xb-numeric">
                            {formatIdr(item.grossIdr)}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

          {tab === "allocations" && (
            <Card className="overflow-hidden">
              {transactions.length === 0 ? (
                <EmptyState
                  illustration={<CoinsPlusIcon className="h-16 w-16" />}
                  title="Belum ada pembagian hasil"
                  body="Alokasi otomatis 60% komunitas, 40% operasi, dan 2% sandbox tampil setelah order pertama."
                />
              ) : (
                <div className="divide-y divide-[#252B27]">
                  {transactions.map((tx) => (
                    <div
                      key={tx.tx_id}
                      className="flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-[13px] font-semibold text-[#F4F5F2]">
                          {tx.tx_id} · {tx.parcel_id}
                        </p>
                        <p className="mt-0.5 text-[12.5px] text-[#A6ADA7] xb-numeric">
                          {formatNumber(tx.volume_tco2e)} tCO₂e · Bruto{" "}
                          {formatIdr(tx.gross_amount_idr)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3 text-[12.5px] xb-numeric">
                        <span className="font-semibold text-[#72C99A]">
                          Komunitas: {formatIdrShort(tx.community_allocation_idr)}
                        </span>
                        <span className="font-semibold text-[#AA9AF5]">
                          Operasi: {formatIdrShort(tx.manager_allocation_idr)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {tab === "proofs" && (
            <Card className="overflow-hidden">
              {verificationRecords.length === 0 ? (
                <EmptyState
                  illustration={<CollectiblesEmptyIcon className="h-16 w-20" />}
                  title="Belum ada bukti attestation"
                  body="Bukti SHA-256 & UID Base Sepolia EAS untuk unit yang Anda miliki akan tampil di sini."
                />
              ) : (
                <div className="divide-y divide-[#252B27]">
                  {verificationRecords.map((rec) => (
                    <Link
                      key={rec.record_id}
                      href="/verify"
                      className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-[#1D211E]"
                    >
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 font-mono text-[13px] font-semibold text-[#F4F5F2]">
                          <ShieldCheck className="h-4 w-4 text-[#72C99A]" aria-hidden="true" />
                          Blok #{rec.block_index} · {rec.parcel_id}
                        </p>
                        <p className="mt-1 truncate font-mono text-[12px] text-[#A6ADA7]">
                          EAS UID: {rec.eas_uid}
                        </p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-[#8B948D]" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          )}
        </section>

        <Disclosure />
      </div>
    </AppShell>
  );
}

