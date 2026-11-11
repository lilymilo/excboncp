"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  ChevronDown,
  FileCheck2,
  LayoutDashboard,
  LogOut,
  Map as MapIcon,
  Menu,
  ShieldCheck,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { GUEST_USER, normalizeUserRole, useDapp, type UserRole } from "@/context/DappContext";
import { TestnetBadge, cx } from "./phantom-ui";

const ROLE_LABEL: Record<UserRole, string> = {
  community: "Komunitas",
  manager: "Pengelola",
  auditor: "Auditor",
  recipient: "Penerima Manfaat",
  guest: "Tamu Publik",
};

const QUICK_ROLES: { role: UserRole; label: string; sub: string }[] = [
  { role: "recipient", label: "PT. GreenCorp", sub: "Pembeli / Penerima Manfaat" },
  { role: "community", label: "Sari Dewi", sub: "Komunitas Adat (PARCEL-A)" },
  { role: "manager", label: "Ahmad Fauzi", sub: "Pengelola Hutan" },
  { role: "auditor", label: "Dr. Hendra", sub: "Auditor MRV Independen" },
  { role: "guest", label: "Tamu Publik", sub: "Akses baca tanpa login" },
];

type NavItem = {
  label: string;
  short: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  group: string;
};

const NAV: NavItem[] = [
  {
    label: "Dashboard",
    short: "Ringkasan kondisi lahan, telemetri, dan status verifikasi.",
    href: "/app",
    icon: LayoutDashboard,
    roles: ["community", "manager", "auditor", "recipient", "guest"],
    group: "Operasi",
  },
  {
    label: "Peta Lahan",
    short: "Batas parcel, sensor lapangan, dan tutupan kanopi.",
    href: "/map",
    icon: MapIcon,
    roles: ["community", "manager", "auditor", "recipient", "guest"],
    group: "Operasi",
  },
  {
    label: "Market Karbon",
    short: "Screener unit kredit, harga, dan simulasi settlement.",
    href: "/market",
    icon: TrendingUp,
    roles: ["community", "manager", "auditor", "recipient", "guest"],
    group: "Pasar",
  },
  {
    label: "Persetujuan Warga",
    short: "Izin komunitas atas pemanfaatan kredit karbon.",
    href: "/consent",
    icon: Users,
    roles: ["community", "manager", "auditor"],
    group: "Tata kelola",
  },
  {
    label: "Otorisasi Auditor",
    short: "Tinjau bukti dan sahkan segel verifikasi.",
    href: "/approve",
    icon: ShieldCheck,
    roles: ["auditor", "manager"],
    group: "Tata kelola",
  },
  {
    label: "Ledger Verifikasi",
    short: "Rantai hash, attestation EAS, dan jejak audit.",
    href: "/verify",
    icon: FileCheck2,
    roles: ["community", "manager", "auditor", "recipient", "guest"],
    group: "Tata kelola",
  },
];

function initials(name?: string | null) {
  const safeName = typeof name === "string" && name.trim() ? name.trim() : "Tamu Publik";
  return safeName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout, switchDemoRole } = useDapp();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!profileOpen) return;
    const onClick = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [profileOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const activeUser = user ?? GUEST_USER;
  const role: UserRole = normalizeUserRole(activeUser.role, activeUser.email);
  const roleLabel = ROLE_LABEL[role] ?? ROLE_LABEL.guest;
  const visible = NAV.filter((item) => item.roles.includes(role));
  const groups = Array.from(new Set(visible.map((item) => item.group)));
  // /audit is the auditor-first view of the same ledger page
  const active = NAV.find(
    (item) =>
      pathname === item.href ||
      pathname.startsWith(`${item.href}/`) ||
      (item.href === "/verify" && pathname === "/audit"),
  );

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    router.push("/login");
  };

  const navBody = (
    <>
      <div className="flex h-[60px] items-center gap-2.5 border-b border-xb-line/60 px-4">
        <Link href="/" className="flex items-center gap-2.5 min-w-0 group">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-xb-forest to-xb-forest-dim text-xb-forest-ink transition-transform group-hover:scale-105">
            <Activity className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold leading-tight tracking-[-0.01em] text-xb-text">
              EXBON CP
            </p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-xb-dim">dMRV Terminal</p>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="ml-auto rounded p-1.5 text-xb-mute hover:bg-xb-raised hover:text-xb-text lg:hidden"
          aria-label="Tutup menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav aria-label="Navigasi utama" className="xb-scroll flex-1 overflow-y-auto px-2.5 py-4">
        {groups.map((group) => (
          <div key={group} className="mb-5 last:mb-0">
            <p className="px-2 pb-2 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-xb-dim/80">
              {group}
            </p>
            <ul className="space-y-0.5">
              {visible
                .filter((item) => item.group === group)
                .map((item) => {
                  const isActive = active?.href === item.href;
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className={cx(
                          "group relative flex min-h-[38px] items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium transition-colors",
                          isActive
                            ? "bg-xb-forest/10 text-xb-forest"
                            : "text-xb-mute hover:bg-xb-raised hover:text-xb-text"
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cx(
                            "absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r",
                            isActive ? "bg-xb-forest" : "bg-transparent"
                          )}
                        />
                        <Icon className="h-4 w-4 shrink-0 opacity-80" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-xb-line/60 p-2.5">
        <div className="rounded-lg border border-xb-line/60 bg-xb-raised/60 p-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-xb-forest/15 text-[11px] font-bold text-xb-forest">
              {initials(activeUser.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-medium text-xb-text">{activeUser.name}</p>
              <p className="truncate text-[10.5px] text-xb-dim">{roleLabel}</p>
            </div>
          </div>
          {role === "guest" ? (
            <Link
              href="/login"
              className="mt-2.5 flex min-h-[32px] w-full items-center justify-center gap-1.5 rounded-md border border-xb-forest/40 bg-xb-forest/10 text-[11.5px] font-medium text-xb-forest transition-colors hover:bg-xb-forest/20"
            >
              Masuk Akun Demo
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="mt-2.5 flex min-h-[32px] w-full items-center justify-center gap-1.5 rounded-md border border-xb-line/70 text-[11.5px] font-medium text-xb-mute transition-colors hover:border-xb-blocked/40 hover:text-xb-blocked"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Keluar sesi
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-xb-bg">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[236px] flex-col border-r border-xb-line/60 bg-xb-surface lg:flex">
        {navBody}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <aside className="absolute inset-y-0 left-0 flex w-[264px] flex-col border-r border-xb-line bg-xb-surface shadow-2xl">
            {navBody}
          </aside>
        </div>
      )}

      <div className="lg:pl-[236px]">
        <header className="sticky top-0 z-20 flex h-[60px] items-center gap-3 border-b border-xb-line/60 bg-xb-bg/85 px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg border border-xb-line/70 p-2 text-xb-mute hover:text-xb-text lg:hidden"
            aria-label="Buka menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-semibold tracking-[-0.01em] text-xb-text">
              {active?.label ?? "EXBON CP"}
            </p>
            <p className="hidden truncate text-[11px] text-xb-dim sm:block">
              {active?.short ?? "Terminal dMRV & asuransi karbon"}
            </p>
          </div>

          <TestnetBadge className="hidden md:inline-flex" />

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((value) => !value)}
              aria-expanded={profileOpen}
              className="flex items-center gap-2 rounded-full border border-xb-line/70 bg-xb-surface py-1 pl-1 pr-2 transition-colors hover:border-xb-forest/40"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-xb-forest/15 text-[10.5px] font-bold text-xb-forest">
                {initials(activeUser.name)}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block max-w-[130px] truncate text-[12px] font-medium leading-tight text-xb-text">
                  {activeUser.name}
                </span>
                <span className="block text-[10px] leading-tight text-xb-dim">
                  {roleLabel}
                </span>
              </span>
              <ChevronDown
                className={cx(
                  "h-3.5 w-3.5 text-xb-dim transition-transform",
                  profileOpen && "rotate-180"
                )}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-[264px] overflow-hidden rounded-xl border border-xb-line bg-xb-raised shadow-[0_24px_48px_-24px_rgba(0,0,0,0.9)]">
                <div className="border-b border-xb-line/70 px-3.5 py-3">
                  <p className="text-[12.5px] font-semibold text-xb-text">{activeUser.name}</p>
                  <p className="mt-0.5 truncate text-[11px] text-xb-mute">{activeUser.email}</p>
                  <p className="mt-1.5 inline-flex rounded border border-xb-forest/25 bg-xb-forest/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-xb-forest">
                    {roleLabel}
                  </p>
                </div>

                <div className="border-b border-xb-line/70 px-2 py-2">
                  <p className="px-2 pb-1 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-xb-dim">
                    Quick Switch Peran Demo
                  </p>
                  {QUICK_ROLES.map((item) => {
                    const isCurrent = role === item.role;
                    return (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => {
                          switchDemoRole(item.role);
                          setProfileOpen(false);
                        }}
                        className={cx(
                          "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors",
                          isCurrent
                            ? "bg-xb-forest/15 text-xb-forest"
                            : "text-xb-mute hover:bg-xb-soft hover:text-xb-text"
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-[11.5px] font-medium">
                            {item.label}
                          </span>
                          <span className="block truncate text-[10px] text-xb-dim">
                            {item.sub}
                          </span>
                        </span>
                        {isCurrent && (
                          <span className="ml-2 h-1.5 w-1.5 shrink-0 rounded-full bg-xb-forest" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[12.5px] text-xb-mute transition-colors hover:bg-xb-soft hover:text-xb-blocked"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  {role === "guest" ? "Halaman Login" : "Keluar sesi"}
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="px-3 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">{children}</main>
      </div>
    </div>
  );
}

export default AppShell;
