"use client";

import React, { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, Radio, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/dapp/AppShell";
import {
  Card,
  DetailModal,
  Disclosure,
  EmptyState,
  cx,
} from "@/components/dapp/phantom-ui";
import {
  useDashboardState,
  type DashboardActivityEvent,
} from "@/components/dapp/useDashboardStore";

type CategoryFilter = "all" | DashboardActivityEvent["category"];

const FILTERS: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "market", label: "Pasar Karbon" },
  { id: "verification", label: "Ledger & EAS" },
  { id: "consent", label: "Izin Komunitas" },
  { id: "sensor", label: "Sensor IoT" },
];

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function EventIcon({ category }: { category: DashboardActivityEvent["category"] }) {
  if (category === "market") return <CheckCircle2 className="h-4 w-4 text-[#72C99A]" aria-hidden="true" />;
  if (category === "verification") return <ShieldCheck className="h-4 w-4 text-[#AA9AF5]" aria-hidden="true" />;
  if (category === "sensor") return <Radio className="h-4 w-4 text-[#F2B84B]" aria-hidden="true" />;
  return <AlertTriangle className="h-4 w-4 text-[#72C99A]" aria-hidden="true" />;
}

export default function ActivityPage() {
  const { activities } = useDashboardState();
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [inspectEvent, setInspectEvent] = useState<DashboardActivityEvent | null>(null);

  const visibleEvents = useMemo(() => {
    if (filter === "all") return activities;
    return activities.filter((ev) => ev.category === filter);
  }, [activities, filter]);

  return (
    <AppShell>
      <div className="space-y-6">
        <section>
          <h1 className="text-[26px] font-semibold tracking-[-0.025em] text-[#F4F5F2] sm:text-[30px]">
            Activity Timeline
          </h1>
          <p className="mt-1.5 max-w-[62ch] text-[14px] leading-relaxed text-[#A6ADA7]">
            Linimasa peristiwa dMRV, eksekusi order karbon, perubahan izin FPIC, dan sinyal sensor
            lapangan secara kronologis.
          </p>
        </section>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              aria-pressed={filter === opt.id}
              onClick={() => setFilter(opt.id)}
              className={cx(
                "min-h-[44px] rounded-xl border px-4 text-[13px] font-medium",
                filter === opt.id
                  ? "border-[#AA9AF5]/60 bg-[#AA9AF5]/16 text-[#F4F5F2]"
                  : "border-[#39423C] bg-[#151816] text-[#A6ADA7] hover:bg-[#1D211E] hover:text-[#F4F5F2]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <Card className="overflow-hidden">
          {visibleEvents.length === 0 ? (
            <EmptyState
              illustration={<Clock className="h-10 w-10 text-[#8B948D]" />}
              title="Belum ada aktivitas di kategori ini"
              body="Pilih filter Semua atau jalankan simulasi order / persetujuan warga terlebih dahulu."
            />
          ) : (
            <div className="divide-y divide-[#252B27]">
              {visibleEvents.map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => setInspectEvent(ev)}
                  className="flex min-h-[68px] w-full flex-col justify-between gap-2 px-5 py-4 text-left hover:bg-[#1D211E] sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 items-start gap-3.5">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#252B27] bg-[#1D211E]">
                      <EventIcon category={ev.category} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[14.5px] font-semibold text-[#F4F5F2]">
                        {ev.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-[13px] text-[#A6ADA7]">
                        {ev.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 pl-12 text-left sm:pl-0 sm:text-right">
                    <p className="text-[12px] font-medium text-[#A6ADA7]">
                      {formatDateTime(ev.timestamp)}
                    </p>
                    {ev.refHash && (
                      <p className="mt-0.5 font-mono text-[11.5px] text-[#AA9AF5]">
                        {ev.refHash.length > 18
                          ? `${ev.refHash.slice(0, 10)}…${ev.refHash.slice(-6)}`
                          : ev.refHash}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        <DetailModal
          open={Boolean(inspectEvent)}
          onOpenChange={(open) => {
            if (!open) setInspectEvent(null);
          }}
          title={inspectEvent?.title ?? "Detail Aktivitas"}
          description={inspectEvent ? formatDateTime(inspectEvent.timestamp) : undefined}
        >
          {inspectEvent && (
            <div className="space-y-3 text-[13px]">
              <p className="leading-relaxed text-[#A6ADA7]">{inspectEvent.description}</p>
              <div className="space-y-2 rounded-xl border border-[#252B27] bg-[#1D211E] p-4">
                <div className="flex justify-between gap-4">
                  <span className="text-[#A6ADA7]">Kategori</span>
                  <span className="font-semibold text-[#F4F5F2]">{inspectEvent.category}</span>
                </div>
                {inspectEvent.parcelId && (
                  <div className="flex justify-between gap-4">
                    <span className="text-[#A6ADA7]">Parcel</span>
                    <span className="font-mono text-[#72C99A]">{inspectEvent.parcelId}</span>
                  </div>
                )}
                {inspectEvent.refHash && (
                  <div className="space-y-1 border-t border-[#252B27] pt-2">
                    <span className="block text-[#A6ADA7]">Referensi / Hash</span>
                    <p className="break-all font-mono text-[12px] text-[#AA9AF5]">
                      {inspectEvent.refHash}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DetailModal>

        <Disclosure />
      </div>
    </AppShell>
  );
}

