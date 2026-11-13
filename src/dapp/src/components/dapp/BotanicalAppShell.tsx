"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import {
  BarChart3,
  Bell,
  ChevronDown,
  FileCheck2,
  Gauge,
  HelpCircle,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Map as MapIcon,
  Menu,
  PieChart,
  Radio,
  RotateCcw,
  Search,
  ShieldCheck,
  Sprout,
  Store,
  UserCircle2,
  Users,
  X,
} from "lucide-react";
import { normalizeUserRole, type UserRole } from "@/context/DappContext";
import { useDashboardState } from "./useDashboardStore";
import { useDashboardData } from "@/lib/dashboard-api";
import { Mascot } from "@/components/mascot/Mascot";
import { LiveClock } from "@/components/motion";
import "@/styles/fonts";
import "./dashboard-botanical.css";

type NavGroupId = "Pantau" | "Laporan" | "Izin dan bukti" | "Bawah";

interface NavEntry {
  id: string;
  group: NavGroupId;
  href: string;
  matchPrefixes: string[];
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
}

const AUTH_ROLES: UserRole[] = ["community", "manager", "recipient", "auditor"];

const NAV_GROUPS: NavGroupId[] = ["Pantau", "Laporan", "Izin dan bukti", "Bawah"];

const NAV_ENTRIES: NavEntry[] = [
  {
    id: "dasbor",
    group: "Pantau",
    href: "/app",
    matchPrefixes: ["/app"],
    label: "Dasbor",
    icon: LayoutDashboard,
    roles: AUTH_ROLES,
  },
  {
    id: "peta",
    group: "Pantau",
    href: "/peta",
    matchPrefixes: ["/peta", "/map"],
    label: "Peta",
    icon: MapIcon,
  },
  {
    id: "screener",
    group: "Pantau",
    href: "/screener",
    matchPrefixes: ["/screener", "/market"],
    label: "Screener",
    icon: BarChart3,
  },
  {
    id: "langsung",
    group: "Pantau",
    href: "/langsung",
    matchPrefixes: ["/langsung", "/activity"],
    label: "Langsung",
    icon: Radio,
    roles: AUTH_ROLES,
  },
  {
    id: "pasar",
    group: "Laporan",
    href: "/pasar/PARCEL-A",
    matchPrefixes: ["/pasar"],
    label: "Pasar",
    icon: Store,
    roles: AUTH_ROLES,
  },
  {
    id: "rekap",
    group: "Laporan",
    href: "/rekap/harian",
    matchPrefixes: ["/rekap", "/portfolio"],
    label: "Rekap",
    icon: PieChart,
    roles: AUTH_ROLES,
  },
  {
    id: "zona",
    group: "Laporan",
    href: "/zona/ZONE-DEMO-A",
    matchPrefixes: ["/zona"],
    label: "Zona",
    icon: Home,
    roles: ["manager", "recipient", "auditor"],
  },
  {
    id: "consent",
    group: "Izin dan bukti",
    href: "/izin/PARCEL-A",
    matchPrefixes: ["/izin", "/consent"],
    label: "Izin Warga",
    icon: Users,
    roles: ["community"],
  },
  {
    id: "verifikasi",
    group: "Izin dan bukti",
    href: "/verifikasi/1",
    matchPrefixes: ["/verifikasi", "/verify"],
    label: "Verifikasi",
    icon: FileCheck2,
  },
  {
    id: "indikator",
    group: "Izin dan bukti",
    href: "/indikator",
    matchPrefixes: ["/indikator"],
    label: "Indikator",
    icon: Gauge,
  },
  {
    id: "tinjau",
    group: "Izin dan bukti",
    href: "/tinjau",
    matchPrefixes: ["/tinjau", "/approve", "/audit"],
    label: "Tinjau",
    icon: ShieldCheck,
    roles: ["auditor"],
  },
  {
    id: "bantuan",
    group: "Bawah",
    href: "/bantuan",
    matchPrefixes: ["/bantuan"],
    label: "Bantuan",
    icon: HelpCircle,
  },
  {
    id: "akun",
    group: "Bawah",
    href: "/akun",
    matchPrefixes: ["/akun"],
    label: "Akun",
    icon: UserCircle2,
  },
];

export const ROLE_META: Record<
  UserRole,
  { label: string; badgeBg: string; badgeInk: string; badgeBorder: string }
> = {
  community: {
    label: "Komunitas",
    badgeBg: "#E2F3E6",
    badgeInk: "#17692F",
    badgeBorder: "#B7DEC0",
  },
  manager: {
    label: "Pengelola",
    badgeBg: "#E2F2E5",
    badgeInk: "#1F4D2E",
    badgeBorder: "#8FCB97",
  },
  recipient: {
    label: "Penerima Zona",
    badgeBg: "#FFF0C7",
    badgeInk: "#7A5600",
    badgeBorder: "#E8CE82",
  },
  auditor: {
    label: "Auditor MRV",
    badgeBg: "#E3EEF9",
    badgeInk: "#1F5A94",
    badgeBorder: "#BDD6EE",
  },
  guest: {
    label: "Tamu Publik",
    badgeBg: "#F5F9F3",
    badgeInk: "#4A5E4F",
    badgeBorder: "#D8E5D4",
  },
};

const QUICK_ROLES: { role: UserRole; label: string; sub: string }[] = [
  { role: "community", label: "Komunitas Adat", sub: "Izin warga & bagian 60%" },
  { role: "manager", label: "Pengelola Hutan", sub: "Pantau lahan & bagian 40%" },
  { role: "recipient", label: "Penerima Zona", sub: "Laporan unit terpakai" },
  { role: "auditor", label: "Auditor MRV", sub: "Tinjau bukti & kunci segel" },
];

export function BotanicalRoleBadge({ role }: { role: UserRole }) {
  const meta = ROLE_META[role] ?? ROLE_META.guest;
  return (
    <span
      style={{
        backgroundColor: meta.badgeBg,
        color: meta.badgeInk,
        borderColor: meta.badgeBorder,
      }}
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13.5px] font-semibold leading-none"
    >
      <span>{meta.label}</span>
    </span>
  );
}

export function BotanicalAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, switchDemoRole, overrides, resetSimulation } = useDashboardState();
  const { parcels, verificationRecords, kabarEvents } = useDashboardData();

  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [kabarOpen, setKabarOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const role = normalizeUserRole(user?.role, user?.email);
  const isGuest = !user || role === "guest";
  const displayName = user?.name ?? "Tamu Publik";
  const firstName = displayName.split(/\s+/)[0] || displayName;

  const visibleNav = useMemo(
    () => NAV_ENTRIES.filter((item) => !item.roles || item.roles.includes(role)),
    [role]
  );

  useEffect(() => {
    setNavDrawerOpen(false);
  }, [pathname]);

  const hasSessionEdits =
    overrides.orders.length > 0 ||
    Object.keys(overrides.consentOverrides).length > 0 ||
    Object.keys(overrides.verificationReviewOverrides).length > 0;

  const searchResults = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return [];
    const matchedParcels = parcels
      .filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.region.toLowerCase().includes(q)
      )
      .map((p) => ({
        key: `p-${p.id}`,
        title: p.name,
        sub: `Lahan (${p.id}), ${p.region}`,
        href: `/peta/${encodeURIComponent(p.id)}`,
      }));
    const matchedSeals = verificationRecords
      .filter(
        (v) =>
          v.record_id.toLowerCase().includes(q) ||
          v.hash.toLowerCase().includes(q) ||
          v.parcel_id.toLowerCase().includes(q)
      )
      .map((v) => ({
        key: `v-${v.record_id}`,
        title: `Segel ${v.record_id}`,
        sub: `${v.hash.slice(0, 12)}... Blok #${v.block_index}`,
        href: `/verifikasi/${encodeURIComponent(String(v.block_index))}`,
      }));
    return [...matchedParcels, ...matchedSeals].slice(0, 6);
  }, [searchText, parcels, verificationRecords]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchText.trim();
    if (!q) return;
    if (searchResults.length > 0) {
      router.push(searchResults[0].href);
      setSearchFocused(false);
      return;
    }
    if (/^vr-|^0x|^\d+$|^[0-9a-f]{8,}$/i.test(q)) {
      router.push(`/verifikasi/${encodeURIComponent(q)}`);
    } else {
      router.push(`/peta/${encodeURIComponent(q)}`);
    }
    setSearchFocused(false);
  };

  const isNavActive = (entry: NavEntry) =>
    entry.matchPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

  const groupedNav = useMemo(
    () =>
      NAV_GROUPS.map((groupName) => ({
        groupName,
        items: visibleNav.filter((item) => item.group === groupName),
      })).filter((g) => g.items.length > 0),
    [visibleNav]
  );

  return (
    <div className="xb-botanical min-h-screen">
      <a
        href="#main-konten"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:border focus:border-[#1F4D2E] focus:bg-white focus:px-4 focus:py-3 focus:text-[15px] focus:font-semibold focus:text-[#14261A]"
      >
        Lompat ke konten utama
      </a>

      {/* Navigation Drawer (Tablet & Mobile) */}
      <DialogPrimitive.Root open={navDrawerOpen} onOpenChange={setNavDrawerOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="xb-botanical fixed inset-0 z-50 bg-[#14261A]/35 backdrop-blur-[1px]" />
          <DialogPrimitive.Content
            aria-label="Menu navigasi EXBON CP"
            className="xb-botanical fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col border-r border-[#D8E5D4] bg-white p-4 shadow-xl focus:outline-none"
          >
            <div className="flex items-center justify-between border-b border-[#D8E5D4] pb-3">
              <Link
                href="/app"
                onClick={() => setNavDrawerOpen(false)}
                className="flex min-h-[44px] items-center gap-2.5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/illustrations/exboncp-brand-mark.svg"
                  alt=""
                  width={36}
                  height={36}
                  className="h-9 w-9 shrink-0"
                />
                <span>
                  <span className="xb-display block text-[16px] font-bold leading-tight text-[#14261A]">
                    EXBON CP
                  </span>
                  <span className="block text-[13px] text-[#4A5E4F]">Forest Intelligence</span>
                </span>
              </Link>
              <DialogPrimitive.Close
                aria-label="Tutup menu"
                className="grid h-11 w-11 place-items-center rounded-xl border border-[#D8E5D4] bg-[#F5F9F3] text-[#14261A] hover:bg-[#E2F2E5]"
              >
                <X className="h-5 w-5" />
              </DialogPrimitive.Close>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#D8E5D4] bg-[#EEF5EC] p-3">
              <Mascot variant="avatar" size={48} alt="" />
              <div className="min-w-0">
                <p className="xb-display truncate text-[15px] font-bold text-[#14261A]">
                  Selamat datang, {firstName}!
                </p>
                <div className="mt-1">
                  <BotanicalRoleBadge role={role} />
                </div>
              </div>
            </div>

            <nav aria-label="Menu utama" className="mt-4 flex-1 space-y-3 overflow-y-auto">
              {groupedNav.map((group) => (
                <div key={group.groupName} className="space-y-1">
                  <p className="px-3 pt-1 text-[13px] font-semibold text-[#4A5E4F]">
                    {group.groupName}
                  </p>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isNavActive(item);
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setNavDrawerOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2 text-[15.5px] font-medium transition-all duration-150 hover:translate-x-0.5 ${
                          active
                            ? "border-l-[3px] border-[#2E6B3F] bg-[#E2F2E5] font-semibold text-[#1F4D2E]"
                            : "text-[#4A5E4F] hover:bg-[#F5F9F3] hover:text-[#14261A]"
                        }`}
                      >
                        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {/* Bantuan Drawer */}
      <DialogPrimitive.Root open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="xb-botanical fixed inset-0 z-50 bg-[#14261A]/35" />
          <DialogPrimitive.Content
            aria-label="Panduan dan bantuan EXBON CP"
            className="xb-botanical fixed inset-y-0 right-0 z-50 flex w-full max-w-[400px] flex-col border-l border-[#D8E5D4] bg-white p-6 shadow-2xl focus:outline-none"
          >
            <div className="flex items-center justify-between border-b border-[#D8E5D4] pb-4">
              <DialogPrimitive.Title className="xb-display text-[20px] font-bold text-[#14261A]">
                Apa itu EXBON CP?
              </DialogPrimitive.Title>
              <DialogPrimitive.Close
                aria-label="Tutup panduan"
                className="grid h-11 w-11 place-items-center rounded-xl border border-[#D8E5D4] bg-[#F5F9F3] text-[#14261A] hover:bg-[#E2F2E5]"
              >
                <X className="h-5 w-5" />
              </DialogPrimitive.Close>
            </div>
            <div className="mt-5 flex-1 space-y-5 overflow-y-auto text-[15.5px] text-[#14261A]">
              <div className="flex items-center gap-4 rounded-2xl border border-[#D8E5D4] bg-[#EEF5EC] p-4">
                <Mascot variant="avatar" size={64} alt="Maskot EXBON CP" />
                <p className="text-[14.5px] leading-relaxed text-[#14261A]">
                  Excboncp mengumpulkan bukti kondisi hutan (foto satelit, sensor di lapangan, dan
                  izin warga) di satu tempat, lalu mengunci hasilnya dengan segel digital supaya
                  siapa pun bisa memeriksanya.
                </p>
              </div>
              <div className="rounded-2xl border border-[#BDD6EE] bg-[#E3EEF9] p-4 text-[#1F5A94]">
                <p className="font-semibold">Semua uang bersifat simulasi</p>
                <p className="mt-1 text-[14.5px]">
                  Aplikasi ini berjalan di jaringan uji testnet tanpa transaksi uang sungguhan atau
                  akun kripto pribadi.
                </p>
              </div>
              <div className="space-y-2.5">
                <p className="xb-display font-semibold text-[#14261A]">Panduan singkat</p>
                <Link
                  href="/peta"
                  onClick={() => setHelpOpen(false)}
                  className="flex min-h-[44px] items-center justify-between rounded-xl border border-[#D8E5D4] bg-[#F5F9F3] px-4 py-2.5 font-medium text-[#14261A] hover:bg-[#E2F2E5]"
                >
                  <span>1. Pantau peta dan sensor lahan</span>
                  <span aria-hidden="true">-&gt;</span>
                </Link>
                <Link
                  href="/izin/PARCEL-A"
                  onClick={() => setHelpOpen(false)}
                  className="flex min-h-[44px] items-center justify-between rounded-xl border border-[#D8E5D4] bg-[#F5F9F3] px-4 py-2.5 font-medium text-[#14261A] hover:bg-[#E2F2E5]"
                >
                  <span>2. Periksa status izin warga</span>
                  <span aria-hidden="true">-&gt;</span>
                </Link>
                <Link
                  href="/verifikasi/1"
                  onClick={() => setHelpOpen(false)}
                  className="flex min-h-[44px] items-center justify-between rounded-xl border border-[#D8E5D4] bg-[#F5F9F3] px-4 py-2.5 font-medium text-[#14261A] hover:bg-[#E2F2E5]"
                >
                  <span>3. Uji segel keaslian SHA-256</span>
                  <span aria-hidden="true">-&gt;</span>
                </Link>
                <Link
                  href="/bantuan"
                  onClick={() => setHelpOpen(false)}
                  className="mt-2 inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-[#2E6B3F] px-4 text-[15px] font-semibold text-white hover:bg-[#1F4D2E]"
                >
                  <span>Buka panduan lengkap</span>
                </Link>
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {/* Kabar Drawer */}
      <DialogPrimitive.Root open={kabarOpen} onOpenChange={setKabarOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="xb-botanical fixed inset-0 z-50 bg-[#14261A]/35" />
          <DialogPrimitive.Content
            aria-label="Kabar kejadian terbaru"
            className="xb-botanical fixed inset-y-0 right-0 z-50 flex w-full max-w-[400px] flex-col border-l border-[#D8E5D4] bg-white p-6 shadow-2xl focus:outline-none"
          >
            <div className="flex items-center justify-between border-b border-[#D8E5D4] pb-4">
              <div>
                <DialogPrimitive.Title className="xb-display text-[20px] font-bold text-[#14261A]">
                  Kabar Terbaru
                </DialogPrimitive.Title>
                <p className="text-[14px] text-[#4A5E4F]">
                  Maksimal 10 kejadian sensor, izin, dan segel terbaru.
                </p>
              </div>
              <DialogPrimitive.Close
                aria-label="Tutup kabar"
                className="grid h-11 w-11 place-items-center rounded-xl border border-[#D8E5D4] bg-[#F5F9F3] text-[#14261A] hover:bg-[#E2F2E5]"
              >
                <X className="h-5 w-5" />
              </DialogPrimitive.Close>
            </div>
            <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
              {kabarEvents.length === 0 ? (
                <p className="rounded-2xl border border-[#D8E5D4] bg-[#F5F9F3] p-4 text-[15px] text-[#4A5E4F]">
                  Belum ada kejadian baru saat ini.
                </p>
              ) : (
                kabarEvents.map((ev) => (
                  <Link
                    key={ev.id}
                    href={ev.href}
                    onClick={() => setKabarOpen(false)}
                    className="block rounded-2xl border border-[#D8E5D4] bg-white p-4 hover:border-[#2E6B3F] hover:bg-[#F5F9F3]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${
                          ev.tone === "warning"
                            ? "bg-[#FFF0C7] text-[#7A5600]"
                            : ev.tone === "seal"
                            ? "bg-[#E3EEF9] text-[#1F5A94]"
                            : "bg-[#E2F3E6] text-[#17692F]"
                        }`}
                      >
                        {ev.parcelId}
                      </span>
                      <span className="xb-numeric text-[13.5px] text-[#4A5E4F]">{ev.tsWib}</span>
                    </div>
                    <p className="mt-2 text-[15px] font-semibold text-[#14261A]">{ev.title}</p>
                    <p className="mt-0.5 text-[14px] text-[#4A5E4F]">{ev.detail}</p>
                  </Link>
                ))
              )}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {/* Main Three-Part Layout Shell (Left ~236px Sidebar + Center/Right Workspace) */}
      <div className="mx-auto flex min-h-screen w-full max-w-[1480px] gap-5 px-4 py-4 pb-24 sm:px-6 md:pb-8 xl:gap-6 xl:py-5">
        {/* LEFT PERSISTENT SIDEBAR (>=1280px) */}
        <aside
          aria-label="Navigasi dan maskot EXBON CP"
          className="hidden xl:flex xl:w-[236px] xl:shrink-0 xl:flex-col xl:justify-between xl:rounded-[24px] xl:border xl:border-[#D8E5D4] xl:bg-white xl:p-4 xl:shadow-[0_4px_20px_rgba(20,38,26,0.04)]"
        >
          <div>
            {/* 1. Brand Mark & Forest Intelligence Descriptor */}
            <Link href="/app" className="flex items-center gap-2.5 rounded-xl px-1 py-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/illustrations/exboncp-brand-mark.svg"
                alt=""
                width={38}
                height={38}
                className="h-9 w-9 shrink-0"
              />
              <div>
                <span className="xb-display block text-[17px] font-bold leading-tight tracking-[-0.02em] text-[#14261A]">
                  EXBON CP
                </span>
                <span className="block text-[13px] font-medium text-[#4A5E4F]">
                  Forest Intelligence
                </span>
              </div>
            </Link>

            {/* 2. Prominent Orangutan Mascot Illustration + Greeting + Informational Role */}
            <div className="mt-3 text-center">
              <Mascot
                variant="sidebar"
                size={184}
                alt="Maskot Orangutan penjaga hutan EXBON CP"
              />
              <p className="xb-display mt-2 text-[18px] font-bold leading-snug tracking-[-0.02em] text-[#14261A]">
                Selamat datang,
                <br />
                {firstName}!
              </p>
              <div className="mt-2.5 flex justify-center">
                <BotanicalRoleBadge role={role} />
              </div>
            </div>

            <div className="my-4 border-t border-[#D8E5D4]" />

            {/* 3. Role-Filtered Grouped Navigation Links */}
            <nav aria-label="Menu samping" className="space-y-3">
              {groupedNav.map((group) => (
                <div key={group.groupName} className="space-y-0.5">
                  <p className="px-3 pt-1 text-[13px] font-semibold text-[#4A5E4F]">
                    {group.groupName}
                  </p>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isNavActive(item);
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`flex min-h-[42px] items-center gap-3 rounded-xl px-3 py-2 text-[15.5px] font-medium transition-all duration-150 hover:translate-x-0.5 ${
                          active
                            ? "border-l-[3px] border-[#2E6B3F] bg-[#E2F2E5] font-semibold text-[#1F4D2E]"
                            : "text-[#4A5E4F] hover:bg-[#F5F9F3] hover:text-[#14261A]"
                        }`}
                      >
                        <Icon
                          className={`h-[18px] w-[18px] shrink-0 ${
                            active ? "text-[#1F4D2E]" : "text-[#4A5E4F]"
                          }`}
                          aria-hidden="true"
                        />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>

          {/* 4. Bottom Botanical Support Panel */}
          <div className="relative mt-5 overflow-hidden rounded-2xl border border-[#D8E5D4] bg-[#EEF5EC] p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/illustrations/botanical-support.svg"
              alt=""
              className="pointer-events-none absolute -bottom-1 -right-1 h-20 w-24 select-none object-contain"
              aria-hidden="true"
            />
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#2E6B3F] text-white">
              <Sprout className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="xb-display relative mt-2.5 text-[15px] font-bold text-[#14261A]">
              Jaga Hutan Kita
            </p>
            <p className="relative mt-0.5 text-[14px] leading-snug text-[#4A5E4F]">
              Bersama untuk bumi yang lebih hijau.
            </p>
          </div>
        </aside>

        {/* CENTER & RIGHT CONTENT WORKSPACE */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {/* Single Topbar Row: Pill Search + Help + Notification + Orangutan Avatar Menu */}
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <button
                type="button"
                aria-label="Buka menu navigasi"
                onClick={() => setNavDrawerOpen(true)}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#D8E5D4] bg-white text-[#14261A] shadow-xs hover:bg-[#F5F9F3] xl:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="relative min-w-0 flex-1 max-w-[540px]">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4A5E4F]"
                    aria-hidden="true"
                  />
                  <label htmlFor="xb-top-search" className="sr-only">
                    Cari lahan, hash, atau informasi
                  </label>
                  <input
                    id="xb-top-search"
                    type="search"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
                    placeholder="Cari lahan, hash, atau informasi..."
                    className="h-11 w-full rounded-full border border-[#D8E5D4] bg-white pl-11 pr-4 text-[15px] text-[#14261A] shadow-[0_1px_6px_rgba(20,38,26,0.03)] placeholder:text-[#4A5E4F] focus:border-[#2E6B3F] focus:outline-none"
                  />
                </form>

                {searchFocused && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-12 z-40 rounded-2xl border border-[#D8E5D4] bg-white p-2 shadow-xl">
                    {searchResults.map((hit) => (
                      <Link
                        key={hit.key}
                        href={hit.href}
                        className="flex min-h-[44px] flex-col justify-center rounded-xl px-3 py-2 hover:bg-[#F5F9F3]"
                      >
                        <span className="text-[14.5px] font-semibold text-[#14261A]">
                          {hit.title}
                        </span>
                        <span className="text-[13.5px] text-[#4A5E4F]">{hit.sub}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className="xbm-clock hidden items-center gap-1.5 rounded-full border border-[#D8E5D4] bg-white px-3.5 py-2 text-[13.5px] font-semibold text-[#14261A] shadow-xs lg:inline-flex"
                aria-label="Jam WIB"
              >
                <span
                  aria-hidden="true"
                  className="relative flex h-2 w-2"
                >
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2E6B3F] opacity-55" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2E6B3F]" />
                </span>
                <LiveClock className="xb-numeric text-[13.5px]" />
              </span>
              <button
                type="button"
                aria-label="Buka panduan Bantuan"
                onClick={() => setHelpOpen(true)}
                className="grid h-11 w-11 place-items-center rounded-full border border-[#D8E5D4] bg-white text-[#14261A] shadow-xs hover:bg-[#F5F9F3] active:scale-95"
              >
                <HelpCircle className="h-5 w-5 text-[#2E6B3F]" aria-hidden="true" />
              </button>

              <button
                type="button"
                aria-label="Kabar kejadian terbaru"
                onClick={() => setKabarOpen(true)}
                className="relative grid h-11 w-11 place-items-center rounded-full border border-[#D8E5D4] bg-white text-[#14261A] shadow-xs hover:bg-[#F5F9F3] active:scale-95"
              >
                <Bell className="h-5 w-5 text-[#14261A]" aria-hidden="true" />
                {kabarEvents.length > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute right-2.5 top-2.5 h-2 w-2 animate-ping rounded-full bg-[#B3261E]"
                    style={{ animationDuration: "1.6s" }}
                  />
                )}
              </button>

              {/* Profile & Demo Role Account Menu with Small Orangutan Avatar */}
              <DropdownMenuPrimitive.Root>
                <DropdownMenuPrimitive.Trigger asChild>
                  <button
                    type="button"
                    aria-label="Akun dan ganti peran demo"
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[#D8E5D4] bg-white p-1 pr-2.5 shadow-xs hover:bg-[#F5F9F3]"
                  >
                    <Mascot variant="avatar" size={36} alt="" />
                    <ChevronDown className="h-4 w-4 text-[#4A5E4F]" aria-hidden="true" />
                  </button>
                </DropdownMenuPrimitive.Trigger>
                <DropdownMenuPrimitive.Portal>
                  <DropdownMenuPrimitive.Content
                    align="end"
                    sideOffset={8}
                    className="xb-botanical z-50 w-[264px] rounded-2xl border border-[#D8E5D4] bg-white p-2 shadow-xl"
                  >
                    <div className="border-b border-[#D8E5D4] px-3 py-2">
                      <p className="xb-display text-[14.5px] font-bold text-[#14261A]">
                        {displayName}
                      </p>
                      <p className="truncate text-[13px] text-[#4A5E4F]">
                        {user?.email ?? "publik@excboncp.test"}
                      </p>
                    </div>
                    <p className="px-3 pb-1 pt-2 text-[12.5px] font-semibold text-[#4A5E4F]">
                      Akun Demo Pengujian
                    </p>
                    {QUICK_ROLES.map((r) => (
                      <DropdownMenuPrimitive.Item
                        key={r.role}
                        onSelect={() => switchDemoRole(r.role)}
                        className={`flex min-h-[44px] cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-[14px] outline-none ${
                          role === r.role
                            ? "bg-[#E2F2E5] font-semibold text-[#1F4D2E]"
                            : "text-[#14261A] hover:bg-[#F5F9F3]"
                        }`}
                      >
                        <div>
                          <div className="font-medium">{r.label}</div>
                          <div className="text-[12.5px] text-[#4A5E4F]">{r.sub}</div>
                        </div>
                      </DropdownMenuPrimitive.Item>
                    ))}
                    <div className="my-1.5 border-t border-[#D8E5D4]" />
                    {hasSessionEdits && (
                      <DropdownMenuPrimitive.Item
                        onSelect={resetSimulation}
                        className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-[14px] font-medium text-[#1F5A94] outline-none hover:bg-[#E3EEF9]"
                      >
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        <span>Reset data simulasi</span>
                      </DropdownMenuPrimitive.Item>
                    )}
                    {isGuest ? (
                      <DropdownMenuPrimitive.Item
                        onSelect={() => router.push("/login")}
                        className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-[14px] font-semibold text-[#1F4D2E] outline-none hover:bg-[#E2F2E5]"
                      >
                        <LogIn className="h-4 w-4" aria-hidden="true" />
                        <span>Masuk akun</span>
                      </DropdownMenuPrimitive.Item>
                    ) : (
                      <DropdownMenuPrimitive.Item
                        onSelect={() => {
                          logout();
                          router.push("/login");
                        }}
                        className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-[14px] font-medium text-[#B3261E] outline-none hover:bg-[#FDE3E1]"
                      >
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                        <span>Keluar</span>
                      </DropdownMenuPrimitive.Item>
                    )}
                  </DropdownMenuPrimitive.Content>
                </DropdownMenuPrimitive.Portal>
              </DropdownMenuPrimitive.Root>
            </div>
          </header>

          <main
            id="main-konten"
            tabIndex={-1}
            key={pathname}
            className="xbm-route min-w-0 flex-1 focus:outline-none"
          >
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Sticky Bottom Navigation (<768px) */}
      <nav
        aria-label="Navigasi cepat bawah"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[#D8E5D4] bg-white/95 backdrop-blur-xs md:hidden"
      >
        {[
          { href: isGuest ? "/indikator" : "/app", label: isGuest ? "Indikator" : "Dasbor", icon: isGuest ? Gauge : LayoutDashboard, prefixes: isGuest ? ["/indikator"] : ["/app"] },
          { href: "/peta", label: "Peta", icon: MapIcon, prefixes: ["/peta", "/map"] },
          { href: "/screener", label: "Screener", icon: BarChart3, prefixes: ["/screener", "/market"] },
          { href: "/verifikasi/1", label: "Segel", icon: FileCheck2, prefixes: ["/verifikasi", "/verify"] },
        ].map((item) => {
          const Icon = item.icon;
          const active = item.prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[12px] font-medium transition-all duration-150 active:scale-95 ${
                active ? "font-semibold text-[#1F4D2E]" : "text-[#4A5E4F] hover:text-[#14261A]"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setNavDrawerOpen(true)}
          className="flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[12px] font-medium text-[#4A5E4F]"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
          <span>Lainnya</span>
        </button>
      </nav>
    </div>
  );
}
