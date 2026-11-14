"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  FileCheck2,
  Lock,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";
import { BotanicalAppShell } from "@/components/dapp/BotanicalAppShell";
import {
  BotanicalCard,
  BotanicalPageHeader,
  BotanicalReceiptCard,
  CanonicalStatusBadge,
  ConsentStatusBadge,
  PageStatePanel,
  RoleRestrictedNotice,
} from "@/components/dapp/BotanicalPrimitives";
import { LiveNumber, PulseDot } from "@/components/motion";
import { Mascot } from "@/components/mascot/Mascot";
import { useDashboardState } from "@/components/dapp/useDashboardStore";
import { normalizeUserRole, type ConsentStatus } from "@/context/DappContext";
import { formatWibDateTime, toCanonicalStatus } from "@/lib/dashboard-helpers";
import { sha256HexBrowser } from "@/lib/exbon-api";
import { CONSENT_DISPLAY } from "@/lib/copy";

const OWN_COMMUNITY_PARCEL_IDS = ["PARCEL-A", "PARCEL-C"];

const FPIC_POINTS = [
  {
    title: "Porsi manfaat komunitas 60%",
    body: "Setiap simulasi alokasi unit dari lahan ini memisahkan 60% bagian langsung untuk kas komunitas pengelola.",
  },
  {
    title: "Hak veto atau cabut izin kapan saja",
    body: "Bila terjadi keberatan warga atau ketidaksesuaian di lapangan, Anda dapat menghentikan perdagangan simulasi seketika.",
  },
  {
    title: "Data terbuka untuk diaudit bersama",
    body: "Pembacaan sensor, pantauan satelit, dan catatan persetujuan dapat diperiksa secara terbuka melalui rantai segel.",
  },
];

export function IzinView({ initialParcelId }: { initialParcelId?: string }) {
  const searchParams = useSearchParams();
  const stateParam = searchParams.get("state");
  const {
    user,
    parcels,
    consentRecords,
    verificationRecords,
    isLoading,
    toggleConsentDecision,
  } = useDashboardState();

  const role = normalizeUserRole(user?.role, user?.email);
  const [selectedParcelId, setSelectedParcelId] = useState(
    initialParcelId?.trim().toUpperCase() || OWN_COMMUNITY_PARCEL_IDS[0]
  );

  const [confirmTarget, setConfirmTarget] = useState<ConsentStatus | null>(null);
  const [reasonNote, setReasonNote] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [receiptDigest, setReceiptDigest] = useState<string>("");
  const [retryKey, setRetryKey] = useState(0);

  const parcel = useMemo(
    () => parcels.find((item) => item.id.toUpperCase() === selectedParcelId) ?? parcels[0],
    [parcels, selectedParcelId]
  );

  const consentRecord = useMemo(
    () => consentRecords.find((item) => item.parcel_id === parcel?.id),
    [consentRecords, parcel]
  );

  const latestSeal = useMemo(
    () => verificationRecords.find((item) => item.parcel_id === parcel?.id) ?? verificationRecords[0],
    [verificationRecords, parcel]
  );

  const isOwnParcel = parcel ? OWN_COMMUNITY_PARCEL_IDS.includes(parcel.id.toUpperCase()) : false;
  const pageState: "loading" | "empty" | "error" | "ready" =
    stateParam === "loading" || isLoading
      ? "loading"
      : stateParam === "error"
      ? "error"
      : stateParam === "empty" || !parcel
      ? "empty"
      : "ready";

  const activeConsent: ConsentStatus = consentRecord?.status ?? parcel?.consentStatus ?? "none";
  const canonicalStatus = parcel ? toCanonicalStatus(parcel.verificationStatus) : "BLOCKED";

  const handleConfirmAction = async () => {
    if (!parcel || !confirmTarget) return;
    const result = toggleConsentDecision(parcel.id, confirmTarget);
    setFeedback(result);

    if (result.ok) {
      const digestInput = `${parcel.id}|${confirmTarget}|${reasonNote.trim()}|${new Date().toISOString()}`;
      const computed = await sha256HexBrowser(digestInput);
      setReceiptDigest(
        computed ||
          latestSeal?.hash ||
          "a4b9c2d1e8f7045692a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4"
      );
    }
    setConfirmTarget(null);
    setReasonNote("");
  };

  if (role !== "community") {
    return (
      <BotanicalAppShell>
        <div className="space-y-4">
          <BotanicalPageHeader
            title="Izin Warga (FPIC)"
            description="Pengesahan persetujuan awal tanpa paksaan dan hak menghentikan penjualan unit oleh perwakilan komunitas."
          />
          <RoleRestrictedNotice
            title="Khusus Akun Komunitas Pemilik Lahan"
            reason="Keputusan persetujuan maupun hak veto warga hanya dapat dijalankan oleh akun dengan peran Komunitas Adat agar kedaulatan masyarakat tetap terlindungi."
          />
        </div>
      </BotanicalAppShell>
    );
  }

  if (!isOwnParcel) {
    return (
      <BotanicalAppShell>
        <div className="space-y-4">
          <BotanicalPageHeader
            title="Izin Warga (FPIC)"
            description="Pengelolaan persetujuan komunitas pada lahan yang terhubung dengan akun Anda."
          />
          <RoleRestrictedNotice
            title="Lahan di luar kelolaan akun ini"
            reason={`Akun ${user?.name ?? "Komunitas"} hanya berwenang mengelola Lahan A & Lahan C (${OWN_COMMUNITY_PARCEL_IDS.join(", ")}). Lahan ${selectedParcelId} dikelola oleh komunitas wilayah lain.`}
          />
        </div>
      </BotanicalAppShell>
    );
  }

  return (
    <BotanicalAppShell>
      <div key={retryKey} className="space-y-4">
        <BotanicalPageHeader
          title="Izin Warga (FPIC)"
          description="Persetujuan atas dasar informasi awal tanpa paksaan untuk lahan kelolaan komunitas. Perubahan Anda langsung menentukan terbuka atau bekunya unit di pasar simulasi."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {OWN_COMMUNITY_PARCEL_IDS.map((pid) => (
                <button
                  key={pid}
                  type="button"
                  onClick={() => setSelectedParcelId(pid)}
                  className={`xbm-pressable inline-flex min-h-[38px] items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold transition ${
                    selectedParcelId === pid
                      ? "border-[var(--forest-700)] bg-[var(--forest-700)] text-white"
                      : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-soft)]"
                  }`}
                >
                  <PulseDot
                    className={selectedParcelId === pid ? "text-white" : "text-[var(--forest-700)]"}
                    pulsing={selectedParcelId === pid}
                    label={`Pilih ${pid}`}
                  />
                  <span>{pid}</span>
                </button>
              ))}
              <Link
                href={`/peta/${parcel.id}`}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 text-[13px] font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-soft)]"
              >
                <span>Lihat di peta</span>
                <ArrowUpRight className="h-4 w-4 text-[var(--forest-700)]" aria-hidden="true" />
              </Link>
            </div>
          }
        />

        <PageStatePanel
          state={pageState}
          onRetry={() => setRetryKey((k) => k + 1)}
          emptyTitle="Data lahan komunitas belum ditemukan"
          emptyDescription="Coba muat ulang halaman atau buka Dasbor untuk memilih lahan aktif."
          emptyActionHref="/app"
          emptyActionLabel="Kembali ke Dasbor"
        >
          {parcel && (
            <>
              {feedback && (
                <div
                  role="status"
                  className={`rounded-2xl border p-3.5 text-[14.5px] font-medium ${
                    feedback.ok
                      ? "border-[var(--status-verified-line)] bg-[var(--status-verified-bg)] text-[var(--status-verified-ink)]"
                      : "border-[var(--status-blocked-line)] bg-[var(--status-blocked-bg)] text-[var(--status-blocked-ink)]"
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              <BotanicalCard className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    {activeConsent === "granted" ? (
                      <Mascot
                        pose="mengangguk"
                        size={72}
                        alt="Izin warga aktif"
                        className="shrink-0"
                      />
                    ) : (
                      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[var(--status-blocked-bg)] text-[var(--status-blocked-ink)]">
                        <ShieldAlert className="h-8 w-8" aria-hidden="true" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="xb-mono text-[13px] font-semibold text-[var(--ink-muted)]">
                          {parcel.id}
                        </span>
                        <ConsentStatusBadge status={activeConsent} compact />
                        <CanonicalStatusBadge status={canonicalStatus} compact />
                      </div>
                      <h2 className="xb-display mt-1 text-[20px] font-bold text-[var(--ink)]">
                        {parcel.name}
                      </h2>
                      <p className="mt-0.5 text-[14px] leading-relaxed text-[var(--ink-muted)]">
                        {CONSENT_DISPLAY[activeConsent].detail}
                      </p>
                      <p className="mt-1 text-[13px] text-[var(--ink-muted)]">
                        Pengampu tercatat:{" "}
                        <span className="font-semibold text-[var(--ink)]">
                          {consentRecord?.community ?? parcel.community}
                        </span>{" "}
                        · Pembaruan:{" "}
                        {formatWibDateTime(consentRecord?.timestamp ?? parcel.lastUpdate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {activeConsent !== "granted" ? (
                      <button
                        type="button"
                        onClick={() => setConfirmTarget("granted")}
                        className="xbm-pressable inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[var(--forest-700)] px-5 text-[14.5px] font-semibold text-white transition hover:bg-[var(--forest-800)]"
                      >
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        <span>Berikan izin pemantauan</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmTarget("revoked")}
                        className="xbm-pressable inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[var(--status-blocked-line)] bg-[var(--status-blocked-bg)] px-5 text-[14.5px] font-semibold text-[var(--status-blocked-ink)] transition hover:brightness-95"
                      >
                        <Lock className="h-4 w-4" aria-hidden="true" />
                        <span>Gunakan hak henti (Cabut izin)</span>
                      </button>
                    )}
                  </div>
                </div>
              </BotanicalCard>

              <div className="grid gap-4 lg:grid-cols-12">
                <BotanicalCard className="flex h-full flex-col justify-between p-5 lg:col-span-7">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <Users className="h-5 w-5 text-[var(--forest-700)]" aria-hidden="true" />
                      <h2 className="xb-display text-[18px] font-bold text-[var(--ink)]">
                        Ringkasan Hak dan Aturan FPIC
                      </h2>
                    </div>
                    <p className="mt-1 text-[14px] text-[var(--ink-muted)]">
                      Tiga prinsip utama yang menjaga suara warga sebelum hasil lahan dapat disimulasikan.
                    </p>
                    <div className="mt-3 space-y-2.5">
                      {FPIC_POINTS.map((item, idx) => (
                        <div
                          key={item.title}
                          className="rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-3.5"
                        >
                          <p className="text-[14.5px] font-bold text-[var(--ink)]">
                            {idx + 1}. {item.title}
                          </p>
                          <p className="mt-0.5 text-[13.5px] leading-relaxed text-[var(--ink-muted)]">
                            {item.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 border-t border-[var(--line-subtle)] pt-2.5 text-[12.5px] text-[var(--ink-muted)]">
                    Catatan persetujuan maupun pencabutan tersimpan bersama jejak hash waktu WIB untuk keperluan audit bersama.
                  </p>
                </BotanicalCard>

                <BotanicalCard className="flex h-full flex-col justify-between p-5 lg:col-span-5">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <FileCheck2 className="h-5 w-5 text-[var(--seal-600)]" aria-hidden="true" />
                      <h2 className="xb-display text-[18px] font-bold text-[var(--ink)]">
                        Dampak Keputusan Saat Ini
                      </h2>
                    </div>
                    <div className="mt-3 space-y-2.5 text-[14.5px]">
                      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3.5">
                        <p className="text-[13px] font-medium text-[var(--ink-muted)]">Status pasar simulasi</p>
                        <p className="mt-0.5 font-bold text-[var(--ink)]">
                          {activeConsent === "granted"
                            ? "Terbuka untuk alokasi unit terverifikasi"
                            : "Dibekukan otomatis oleh sistem (0 unit tersedia)"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3.5">
                        <p className="text-[13px] font-medium text-[var(--ink-muted)]">Luas area & cadangan</p>
                        <p className="xb-numeric mt-0.5 font-bold text-[var(--ink)]">
                          <LiveNumber
                            value={parcel.area}
                            format={(val: number) => `${Math.round(val)} ha`}
                          />{" "}
                          ·{" "}
                          <LiveNumber
                            value={parcel.availableUnits}
                            format={(val: number) => `${Math.round(val).toLocaleString("id-ID")} tCO2e`}
                          />
                        </p>
                      </div>
                      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3.5">
                        <p className="text-[13px] font-medium text-[var(--ink-muted)]">Tautan pemeriksaan</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Link
                            href={`/screener?lahan=${encodeURIComponent(parcel.id)}`}
                            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 text-[13.5px] font-semibold text-[var(--ink)] transition hover:bg-[var(--leaf-100)]"
                          >
                            <span>Cek status di Pasar</span>
                          </Link>
                          <Link
                            href="/screener"
                            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 text-[13.5px] font-semibold text-[var(--ink)] transition hover:bg-[var(--leaf-100)]"
                          >
                            <span>Lihat di Screener</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 border-t border-[var(--line-subtle)] pt-2.5 text-[12.5px] text-[var(--ink-muted)]">
                    Hak suara warga bersifat mengikat dan selalu mengalahkan izin simulasi komersial.
                  </p>
                </BotanicalCard>
              </div>

              {(consentRecord?.receipt_id || receiptDigest) && (
                <BotanicalReceiptCard
                  title={
                    activeConsent === "granted"
                      ? "Tanda Terima Persetujuan Warga (FPIC)"
                      : "Catatan Pencabutan Izin & Pembekuan Unit"
                  }
                  receiptId={consentRecord?.receipt_id ?? `FPIC-${parcel.id}`}
                  hash={
                    receiptDigest ||
                    latestSeal?.hash ||
                    "a4b9c2d1e8f7045692a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4"
                  }
                  timestampWib={formatWibDateTime(consentRecord?.timestamp ?? parcel.lastUpdate)}
                  details={`Dicatat oleh ${consentRecord?.granted_by ?? user?.name ?? "Warga"} untuk ${parcel.name}`}
                  verifyHref={latestSeal ? `/verifikasi/${latestSeal.block_index}` : "/verifikasi"}
                />
              )}
            </>
          )}
        </PageStatePanel>

        <DialogPrimitive.Root
          open={confirmTarget !== null}
          onOpenChange={(open) => {
            if (!open) setConfirmTarget(null);
          }}
        >
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="xb-botanical fixed inset-0 z-50 bg-[var(--overlay-scrim)]" />
            <DialogPrimitive.Content
              aria-label="Konfirmasi keputusan izin warga"
              className="xb-botanical fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl focus:outline-none"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
                      confirmTarget === "revoked"
                        ? "bg-[var(--status-blocked-bg)] text-[var(--status-blocked-ink)]"
                        : "bg-[var(--status-verified-bg)] text-[var(--status-verified-ink)]"
                    }`}
                  >
                    {confirmTarget === "revoked" ? (
                      <AlertTriangle className="h-6 w-6" aria-hidden="true" />
                    ) : (
                      <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <DialogPrimitive.Title className="xb-display text-[20px] font-bold text-[var(--ink)]">
                      {confirmTarget === "revoked"
                        ? "Cabut izin dan bekukan unit?"
                        : "Aktifkan persetujuan warga?"}
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Description className="text-[14px] text-[var(--ink-muted)]">
                      {parcel?.name} ({parcel?.id})
                    </DialogPrimitive.Description>
                  </div>
                </div>
                <DialogPrimitive.Close
                  aria-label="Batal"
                  className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] text-[var(--ink)] hover:bg-[var(--leaf-100)]"
                >
                  <X className="h-5 w-5" />
                </DialogPrimitive.Close>
              </div>

              <p className="mt-4 text-[15px] leading-relaxed text-[var(--ink-muted)]">
                {confirmTarget === "revoked"
                  ? "Mengaktifkan hak veto akan langsung membekukan seluruh unit pada Lahan A Bogor. Simulasi pemesanan di halaman Pasar dan daftar Screener akan tertolak sampai izin dibuka kembali."
                  : "Dengan memberikan izin, Anda menyatakan komunitas setuju melanjutkan pemantauan hutan dan pembagian hasil simulasi sebesar 60% ke kas komunitas."}
              </p>

              <div className="mt-4">
                <label
                  htmlFor="fpic-note-input"
                  className="block text-[14px] font-semibold text-[var(--ink)]"
                >
                  Catatan rapat warga (opsional)
                </label>
                <textarea
                  id="fpic-note-input"
                  rows={2}
                  value={reasonNote}
                  onChange={(e) => setReasonNote(e.target.value)}
                  placeholder={
                    confirmTarget === "revoked"
                      ? "Misal: Perlu klarifikasi batas lahan sebelum penjualan dilanjutkan."
                      : "Misal: Disetujui berdasarkan musyawarah warga minggu ini."
                  }
                  className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-3 text-[15px] text-[var(--ink)] focus:border-[var(--forest-700)] focus:bg-[var(--surface)] focus:outline-none"
                />
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <DialogPrimitive.Close className="inline-flex min-h-[44px] items-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 text-[14.5px] font-semibold text-[var(--ink)] hover:bg-[var(--surface-soft)]">
                  Kembali
                </DialogPrimitive.Close>
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  className={`inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 text-[14.5px] font-semibold text-white transition ${
                    confirmTarget === "revoked"
                      ? "bg-[var(--status-blocked-ink)] hover:brightness-95"
                      : "bg-[var(--forest-700)] hover:bg-[var(--forest-800)]"
                  }`}
                >
                  <span>
                    {confirmTarget === "revoked" ? "Ya, cabut izin sekarang" : "Ya, sahkan izin"}
                  </span>
                </button>
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </div>
    </BotanicalAppShell>
  );
}
