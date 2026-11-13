"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  CheckCircle2,
  LogIn,
  LogOut,
  MapPin,
  RotateCcw,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react";
import {
  BotanicalAppShell,
  BotanicalRoleBadge,
} from "@/components/dapp/BotanicalAppShell";
import {
  BotanicalCard,
  BotanicalPageHeader,
  LiveTelemetryPill,
  SimulasiBadge,
} from "@/components/dapp/BotanicalPrimitives";
import { LiveNumber, PulseDot } from "@/components/motion";
import { useDashboardState } from "@/components/dapp/useDashboardStore";
import { normalizeUserRole, type UserRole } from "@/context/DappContext";
import { ROLE_TITLES, ZONES_CATALOG } from "@/lib/copy";
import { logoutAccountApi, mapParcelZoneId } from "@/lib/exbon-api";

const DEMO_ROLES: { role: UserRole; hint: string }[] = [
  { role: "community", hint: "Kelola izin warga (FPIC) untuk Lahan A Bogor & lihat porsi 60%" },
  { role: "manager", hint: "Pantau seluruh lahan, simulasi pasar, & laporan pendapatan" },
  { role: "recipient", hint: "Pantau Zona contoh A (KEK) & penerimaan unit terverifikasi" },
  { role: "auditor", hint: "Buka antrean Tinjau Auditor & segel rantai SHA-256" },
  { role: "guest", hint: "Mode pembaca publik tanpa hak ubah persetujuan atau audit" },
];

export function AkunView() {
  const router = useRouter();
  const { user, parcels, sensors, switchDemoRole, logout, resetSimulation, overrides } =
    useDashboardState();

  const role = normalizeUserRole(user?.role, user?.email);
  const isGuest = !user || role === "guest";
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [busyLogout, setBusyLogout] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const linkedParcels =
    role === "community"
      ? parcels.filter((p) => p.id === "PARCEL-A" || p.id === "PARCEL-C")
      : role === "recipient"
      ? parcels.filter((p) => mapParcelZoneId(p.id) === "ZONE-DEMO-A")
      : parcels;

  const changeCount =
    overrides.orders.length +
    Object.keys(overrides.consentOverrides).length +
    Object.keys(overrides.verificationReviewOverrides).length;

  const hasChanges = changeCount > 0;

  const handleConfirmLogout = async () => {
    setBusyLogout(true);
    await logoutAccountApi(user);
    logout();
    setBusyLogout(false);
    setConfirmLogoutOpen(false);
    router.push("/login");
  };

  return (
    <BotanicalAppShell>
      <div className="space-y-4">
        <BotanicalPageHeader
          title="Akun & Peran Sesi"
          description="Ringkasan identitas aktif, cakupan lahan yang terhubung, pergantian peran uji coba, serta pengaturan keluar sesi."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <LiveTelemetryPill label="Sesi Aktif" />
              <SimulasiBadge />
            </div>
          }
        />

        {notice && (
          <div
            role="status"
            className="rounded-2xl border border-[var(--status-verified-line)] bg-[var(--status-verified-bg)] p-3.5 text-[14.5px] font-medium text-[var(--status-verified-ink)]"
          >
            {notice}
          </div>
        )}

        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          <BotanicalCard interactive className="p-4">
            <p className="text-[12.5px] font-semibold text-[var(--ink-muted)]">Peran Aktif</p>
            <p className="xb-display mt-1 text-[19px] font-bold text-[var(--ink)]">
              {ROLE_TITLES[role].label}
            </p>
            <p className="mt-0.5 text-[12.5px] text-[var(--ink-muted)]">
              {user?.name ?? "Tamu Publik"}
            </p>
          </BotanicalCard>

          <BotanicalCard interactive className="p-4">
            <p className="text-[12.5px] font-semibold text-[var(--ink-muted)]">Lahan Terhubung</p>
            <p className="xb-numeric mt-1 text-[22px] font-bold text-[var(--forest-700)]">
              <LiveNumber
                value={linkedParcels.length}
                format={(val: number) => `${Math.round(val)} lahan`}
              />
            </p>
            <p className="mt-0.5 text-[12.5px] text-[var(--ink-muted)]">
              Total luas{" "}
              <LiveNumber
                value={linkedParcels.reduce((acc, p) => acc + p.area, 0)}
                format={(val: number) => `${Math.round(val)} ha`}
              />
            </p>
          </BotanicalCard>

          <BotanicalCard interactive className="p-4">
            <p className="text-[12.5px] font-semibold text-[var(--ink-muted)]">Perubahan Sesi</p>
            <p className="xb-numeric mt-1 text-[22px] font-bold text-[var(--ink)]">
              <LiveNumber value={changeCount} format={(val: number) => `${Math.round(val)} aksi`} />
            </p>
            <p className="mt-0.5 text-[12.5px] text-[var(--ink-muted)]">
              {hasChanges ? "Tersimpan di peramban" : "Kondisi awal sandbox"}
            </p>
          </BotanicalCard>

          <BotanicalCard interactive className="p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[12.5px] font-semibold text-[var(--ink-muted)]">Node Lapangan Aktif</p>
              <PulseDot className="text-[var(--forest-700)]" pulsing label="Jaringan sensor aktif" />
            </div>
            <p className="xb-numeric mt-1 text-[22px] font-bold text-[var(--seal-700)]">
              <LiveNumber value={sensors.length} format={(val: number) => `${Math.round(val)} sensor`} />
            </p>
            <p className="mt-0.5 text-[12.5px] text-[var(--ink-muted)]">
              Sinkronisasi telemetri otomatis
            </p>
          </BotanicalCard>
        </div>

        <div className="grid gap-4 lg:grid-cols-12">
          <BotanicalCard className="flex h-full flex-col justify-between p-5 lg:col-span-7">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="grid h-13 w-13 shrink-0 place-items-center rounded-2xl bg-[var(--leaf-100)] text-[var(--forest-700)]">
                    <UserCheck className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="xb-display text-[20px] font-bold text-[var(--ink)]">
                        {user?.name ?? "Tamu Publik"}
                      </h2>
                      <BotanicalRoleBadge role={role} />
                    </div>
                    <p className="xb-mono mt-0.5 text-[13px] text-[var(--ink-muted)]">
                      {user?.email ?? "Belum masuk dengan akun demonstrasi"}
                    </p>
                  </div>
                </div>

                {isGuest ? (
                  <Link
                    href="/login"
                    className="xbm-pressable inline-flex min-h-[40px] items-center gap-2 rounded-full bg-[var(--forest-700)] px-4 text-[13.5px] font-semibold text-white transition hover:bg-[var(--forest-800)]"
                  >
                    <LogIn className="h-4 w-4" aria-hidden="true" />
                    <span>Masuk akun</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmLogoutOpen(true)}
                    className="xbm-pressable inline-flex min-h-[40px] items-center gap-2 rounded-full border border-[var(--status-blocked-line)] bg-[var(--status-blocked-bg)] px-4 text-[13.5px] font-semibold text-[var(--status-blocked-ink)] transition hover:brightness-95"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    <span>Keluar dari akun</span>
                  </button>
                )}
              </div>

              <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-3.5">
                <p className="text-[12.5px] font-semibold text-[var(--ink-muted)]">Wewenang peran saat ini</p>
                <p className="mt-0.5 text-[14px] leading-relaxed text-[var(--ink)]">{ROLE_TITLES[role].scopeSummary}</p>
              </div>

              <div className="mt-4">
                <h3 className="xb-display text-[16.5px] font-bold text-[var(--ink)]">
                  Lahan & Zona Terkait
                </h3>
                <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
                  {linkedParcels.map((parcel, idx) => {
                    const zoneId = mapParcelZoneId(parcel.id);
                    const isOddTail =
                      linkedParcels.length > 2 &&
                      linkedParcels.length % 2 === 1 &&
                      idx === linkedParcels.length - 1;
                    return (
                      <Link
                        key={parcel.id}
                        href={`/peta/${parcel.id}`}
                        className={`xbm-pressable rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3.5 transition hover:border-[var(--forest-600)] hover:bg-[var(--surface-soft)] ${
                          isOddTail ? "sm:col-span-2" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="xb-mono text-[13px] font-bold text-[var(--ink)]">
                            {parcel.id}
                          </span>
                          <MapPin className="h-4 w-4 text-[var(--forest-700)]" aria-hidden="true" />
                        </div>
                        <p className="mt-1 text-[14.5px] font-semibold text-[var(--ink)]">
                          {parcel.name}
                        </p>
                        <p className="mt-0.5 text-[12.5px] text-[var(--ink-muted)]">
                          {ZONES_CATALOG[zoneId].name} · {parcel.area} ha
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {hasChanges ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-3.5">
                <p className="text-[13.5px] text-[var(--ink)]">
                  Terdapat perubahan simulasi pada sesi peramban ini (order pasar, persetujuan,
                  atau audit).
                </p>
                <button
                  type="button"
                  onClick={() => {
                    resetSimulation();
                    setNotice("Data simulasi sesi berhasil dikembalikan ke kondisi awal.");
                  }}
                  className="xbm-pressable inline-flex min-h-[38px] items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 text-[13.5px] font-semibold text-[var(--ink)] transition hover:bg-[var(--leaf-100)]"
                >
                  <RotateCcw className="h-4 w-4 text-[var(--forest-700)]" aria-hidden="true" />
                  <span>Reset simulasi sesi</span>
                </button>
              </div>
            ) : (
              <div className="mt-4 border-t border-[var(--line-subtle)] pt-3 text-[12.5px] text-[var(--ink-muted)]">
                Sesi berada dalam kondisi awal simulasi sandbox. Perubahan persetujuan, audit, atau transaksi akan tersimpan sementara di peramban.
              </div>
            )}
          </BotanicalCard>

          <BotanicalCard className="flex h-full flex-col justify-between p-5 lg:col-span-5">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[var(--forest-700)]" aria-hidden="true" />
                <h2 className="xb-display text-[18px] font-bold text-[var(--ink)]">
                  Ganti Peran Demo Cepat
                </h2>
              </div>
              <p className="mt-1 text-[13.5px] text-[var(--ink-muted)]">
                Uji alur aplikasi sebagai pihak berbeda tanpa perlu mengetik ulang kata sandi.
              </p>

              <div className="mt-3 space-y-2">
                {DEMO_ROLES.map((item) => {
                  const active = role === item.role;
                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => {
                        switchDemoRole(item.role);
                        setNotice(`Sesi aktif beralih ke peran ${ROLE_TITLES[item.role].label}.`);
                      }}
                      className={`xbm-pressable flex min-h-[52px] w-full items-start justify-between gap-3 rounded-2xl border p-3 text-left transition ${
                        active
                          ? "border-[var(--forest-700)] bg-[var(--leaf-100)]/70"
                          : "border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-soft)]"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-[14.5px] font-bold text-[var(--ink)]">
                          {ROLE_TITLES[item.role].label}
                        </p>
                        <p className="mt-0.5 text-[12.5px] text-[var(--ink-muted)]">{item.hint}</p>
                      </div>
                      {active && (
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 shrink-0 text-[var(--forest-700)]"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="mt-3 border-t border-[var(--line-subtle)] pt-2.5 text-[12.5px] text-[var(--ink-muted)]">
              Hak akses menu samping dan tombol aksi langsung menyesuaikan peran yang sedang dipilih.
            </p>
          </BotanicalCard>
        </div>

        <DialogPrimitive.Root open={confirmLogoutOpen} onOpenChange={setConfirmLogoutOpen}>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="xb-botanical fixed inset-0 z-50 bg-[var(--overlay-scrim)]" />
            <DialogPrimitive.Content
              aria-label="Konfirmasi keluar akun"
              className="xb-botanical fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl focus:outline-none"
            >
              <div className="flex items-start justify-between gap-3">
                <DialogPrimitive.Title className="xb-display text-[20px] font-bold text-[var(--ink)]">
                  Keluar dari sesi ini?
                </DialogPrimitive.Title>
                <DialogPrimitive.Close
                  aria-label="Tutup dialog"
                  className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] text-[var(--ink)] hover:bg-[var(--leaf-100)]"
                >
                  <X className="h-5 w-5" />
                </DialogPrimitive.Close>
              </div>

              <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink-muted)]">
                Anda akan keluar dari akun <span className="font-semibold text-[var(--ink)]">{user?.name}</span> dan kembali ke layar masuk. Halaman publik seperti Peta, Screener, dan Verifikasi tetap dapat diakses kapan saja.
              </p>

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <DialogPrimitive.Close className="inline-flex min-h-[44px] items-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 text-[14.5px] font-semibold text-[var(--ink)] hover:bg-[var(--surface-soft)]">
                  Batal
                </DialogPrimitive.Close>
                <button
                  type="button"
                  disabled={busyLogout}
                  onClick={handleConfirmLogout}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--status-blocked-ink)] px-5 text-[14.5px] font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span>{busyLogout ? "Mengeluarkan..." : "Ya, keluar sekarang"}</span>
                </button>
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </div>
    </BotanicalAppShell>
  );
}

