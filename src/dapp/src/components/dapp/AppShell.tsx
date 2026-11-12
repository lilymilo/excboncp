"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Clock,
  FileCheck2,
  GitCommitHorizontal,
  Home,
  LayoutDashboard,
  LogOut,
  Map as MapIcon,
  Menu,
  RotateCcw,
  ShieldCheck,
  TreePine,
  TrendingUp,
  Users,
  Wallet,
  X,
  ChevronDown,
} from "lucide-react";
import { normalizeUserRole, type UserRole } from "@/context/DappContext";
import { useDashboardState } from "./useDashboardStore";
import "./dashboard.css";
import {
  AccountDropdown,
  NavDrawerSheet,
  TestnetBadge,
  cx,
} from "./phantom-ui";

interface NavItem {
  href: string;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  group: "Utama" | "MRV & Tata Kelola";
  auditorOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/app", label: "Dashboard", hint: "Ringkasan aset & hutan", icon: LayoutDashboard, group: "Utama" },
  { href: "/market", label: "Carbon Market", hint: "Beli unit & simulasi split", icon: TrendingUp, group: "Utama" },
  { href: "/map", label: "Forest Intelligence", hint: "Peta GeoJSON & sensor IoT", icon: MapIcon, group: "Utama" },
  { href: "/portfolio", label: "Portfolio", hint: "Kepemilikan & alokasi dana", icon: Wallet, group: "Utama" },
  { href: "/activity", label: "Activity", hint: "Riwayat order & peristiwa MRV", icon: Clock, group: "Utama" },
  { href: "/verify", label: "Verification", hint: "Ledger SHA-256 & EAS", icon: GitCommitHorizontal, group: "MRV & Tata Kelola" },
  { href: "/consent", label: "Community Consent", hint: "Izin warga & hak veto FPIC", icon: Users, group: "MRV & Tata Kelola" },
  {
    href: "/approve",
    label: "Auditor Cockpit",
    hint: "Pemeriksaan bukti & segel",
    icon: ShieldCheck,
    group: "MRV & Tata Kelola",
    auditorOnly: true,
  },
];

const QUICK_ROLES: { role: UserRole; label: string; tag: string }[] = [
  { role: "recipient", label: "Pembeli / Penerima", tag: "Order pasar" },
  { role: "community", label: "Komunitas Adat", tag: "Veto · 60%" },
  { role: "manager", label: "Pengelola Hutan", tag: "Operasi · 40%" },
  { role: "auditor", label: "Auditor MRV", tag: "Segel bukti" },
];

const ROLE_LABEL: Record<UserRole, string> = {
  community: "Komunitas",
  manager: "Pengelola",
  auditor: "Auditor MRV",
  recipient: "Pembeli",
  guest: "Tamu",
};

function makeHandle(email?: string, role?: UserRole) {
  if (email && email.includes("@")) {
    const local = email.split("@")[0].replace(/[^a-zA-Z0-9_.-]/g, "");
    if (local) return `@${local}`;
  }
  if (role && role !== "guest") return `@${role}_demo`;
  return "@guest_demo";
}

function initials(name?: string) {
  if (!name) return "XB";
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, switchDemoRole, overrides, resetSimulation } = useDashboardState();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const normalizedRole = normalizeUserRole(user?.role, user?.email);
  const roleLabel = ROLE_LABEL[normalizedRole] ?? "Tamu";
  const isGuest = !user || normalizedRole === "guest";
  const handle = makeHandle(user?.email, normalizedRole);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const isRouteActive = (href: string) => {
    if (href === "/verify") return pathname === "/verify" || pathname === "/audit";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const visibleNav = NAV_ITEMS.filter((item) => !item.auditorOnly || normalizedRole === "auditor");
  const groups = (["Utama", "MRV & Tata Kelola"] as const).map((groupName) => ({
    name: groupName,
    items: visibleNav.filter((item) => item.group === groupName),
  }));

  const currentNav =
    NAV_ITEMS.find((item) => isRouteActive(item.href)) ??
    (pathname.startsWith("/audit") ? { label: "Verification" } : undefined);

  const hasSessionEdits =
    overrides.orders.length > 0 ||
    Object.keys(overrides.consentOverrides).length > 0 ||
    Object.keys(overrides.verificationReviewOverrides).length > 0;

  return (
    <div className="xb-dashboard min-h-screen bg-[#090B0A] text-[#F4F5F2]">
      {/* Keyboard shortcut past the navigation rail; hidden until tabbed to. */}
      <a
        href="#main-konten"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:border focus:border-[#72C99A]/50 focus:bg-[#0F1411] focus:px-4 focus:py-3 focus:text-[13px] focus:font-semibold focus:text-[#F4F5F2]"
      >
        Lompat ke konten utama
      </a>

      {/* Left-side Navigation Drawer (Desktop & Mobile) */}
      <NavDrawerSheet open={drawerOpen} onOpenChange={setDrawerOpen} title="Navigasi EXBON CP">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#252B27] px-4">
          <Link
            href="/app"
            onClick={() => setDrawerOpen(false)}
            className="flex min-h-[44px] items-center gap-2.5 rounded-xl pr-2 text-[#F4F5F2]"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#72C99A]/30 bg-[#23865A]/20">
              <TreePine className="h-4 w-4 text-[#72C99A]" aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <span className="block text-[14px] font-semibold tracking-[-0.01em] text-[#F4F5F2]">
                EXBON CP
              </span>
              <span className="block text-[11.5px] font-medium text-[#A6ADA7]">
                Botanical ReFi &amp; dMRV
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Tutup menu navigasi"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#39423C] bg-[#1D211E] text-[#A6ADA7] hover:bg-[#242925] hover:text-[#F4F5F2]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <nav className="xb-scroll flex-1 space-y-6 overflow-y-auto px-3 py-4" aria-label="Menu aplikasi">
          {groups.map((group) => (
            <div key={group.name}>
              <p className="px-3 pb-2 text-[11.5px] font-medium text-[#8B948D]">{group.name}</p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = isRouteActive(item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setDrawerOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cx(
                          "flex min-h-[48px] items-center gap-3 rounded-xl border px-3 py-2",
                          active
                            ? "border-[#AA9AF5]/40 bg-[#AA9AF5]/14 text-[#F4F5F2]"
                            : "border-transparent text-[#A6ADA7] hover:bg-[#1D211E] hover:text-[#F4F5F2]"
                        )}
                      >
                        <Icon
                          className={cx(
                            "h-4 w-4 shrink-0",
                            active ? "text-[#AA9AF5]" : "text-[#8B948D]"
                          )}
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13.5px] font-medium">
                            {item.label}
                          </span>
                          <span className="block truncate text-[11.5px] text-[#8B948D]">
                            {item.hint}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 space-y-2 border-t border-[#252B27] p-3">
          {hasSessionEdits && (
            <button
              type="button"
              onClick={() => {
                resetSimulation();
                setDrawerOpen(false);
              }}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[#39423C] bg-[#1D211E] px-3 text-[12.5px] font-medium text-[#A6ADA7] hover:bg-[#242925] hover:text-[#F4F5F2]"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#AA9AF5]" aria-hidden="true" />
              Reset simulasi sesi
            </button>
          )}

          <div className="flex items-center justify-between gap-2 rounded-xl border border-[#252B27] bg-[#1D211E] px-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-[#F4F5F2]">{handle}</p>
              <p className="text-[11.5px] text-[#72C99A]">{roleLabel}</p>
            </div>
            {!isGuest ? (
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  logout();
                  router.push("/login");
                }}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#39423C] bg-[#151816] px-3 text-[12px] font-medium text-[#A6ADA7] hover:border-[#ED7770] hover:text-[#ED7770]"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Keluar
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setDrawerOpen(false)}
                className="inline-flex min-h-[44px] items-center rounded-xl bg-[#AA9AF5] px-3.5 text-[12.5px] font-semibold text-[#090B0A] hover:bg-[#B8AAFA]"
              >
                Masuk
              </Link>
            )}
          </div>

          <Link
            href="/"
            onClick={() => setDrawerOpen(false)}
            className="flex min-h-[44px] items-center justify-between rounded-xl px-3 text-[12.5px] font-medium text-[#A6ADA7] hover:bg-[#1D211E] hover:text-[#F4F5F2]"
          >
            <span className="inline-flex items-center gap-2">
              <Home className="h-4 w-4 text-[#8B948D]" aria-hidden="true" />
              Kembali ke Beranda Publik
            </span>
            <FileCheck2 className="h-3.5 w-3.5 text-[#8B948D]" aria-hidden="true" />
          </Link>
        </div>
      </NavDrawerSheet>

      {/* Top Header Bar: Left Hamburger Drawer Trigger | Right Profile & Network Status */}
      <header className="sticky top-0 z-30 border-b border-[#252B27] bg-[#090B0A]/95">
        <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Buka menu navigasi"
              aria-expanded={drawerOpen}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-xl border border-[#39423C] bg-[#151816] px-3 text-[13px] font-medium text-[#F4F5F2] hover:bg-[#1D211E]"
            >
              <Menu className="h-4 w-4 text-[#AA9AF5]" aria-hidden="true" />
              <span className="hidden sm:inline">Menu</span>
            </button>

            <Link
              href="/app"
              className="flex min-h-[44px] items-center gap-2.5 rounded-xl px-1.5"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-[#72C99A]/30 bg-[#23865A]/20">
                <TreePine className="h-4 w-4 text-[#72C99A]" aria-hidden="true" />
              </span>
              <span className="hidden text-[14px] font-semibold tracking-[-0.01em] text-[#F4F5F2] md:inline">
                EXBON CP
              </span>
            </Link>

            <span className="hidden text-[#39423C] md:inline">/</span>
            <span className="truncate text-[14px] font-semibold text-[#F4F5F2]">
              {currentNav?.label ?? "Dashboard"}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <TestnetBadge className="hidden md:inline-flex" />

            <AccountDropdown.Root>
              <AccountDropdown.Trigger asChild>
                <button
                  type="button"
                  className="inline-flex min-h-[44px] items-center gap-2.5 rounded-xl border border-[#39423C] bg-[#151816] px-2.5 text-left hover:bg-[#1D211E]"
                  aria-label="Profil akun dan peran aktif"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#AA9AF5]/20 text-[11px] font-semibold text-[#AA9AF5]">
                    {initials(user?.name)}
                  </span>
                  <span className="hidden min-w-0 leading-tight sm:block">
                    <span className="block truncate text-[12.5px] font-semibold text-[#F4F5F2]">
                      {handle}
                    </span>
                    <span className="block text-[11px] text-[#72C99A]">{roleLabel}</span>
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-[#8B948D]" aria-hidden="true" />
                </button>
              </AccountDropdown.Trigger>

              <AccountDropdown.Content>
                <div className="border-b border-[#252B27] px-2.5 py-2">
                  <p className="truncate text-[13px] font-semibold text-[#F4F5F2]">
                    {user?.name ?? "Tamu Demo"}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-[#A6ADA7]">
                    {handle} · {roleLabel}
                  </p>
                  <p className="mt-1 text-[11px] text-[#8B948D]">Mode simulasi testnet</p>
                </div>

                <AccountDropdown.Label>Ganti peran demo</AccountDropdown.Label>
                {QUICK_ROLES.map((item) => (
                  <AccountDropdown.RadioItem
                    key={item.role}
                    selected={normalizedRole === item.role}
                    label={item.label}
                    tag={item.tag}
                    onSelect={() => switchDemoRole(item.role)}
                  />
                ))}

                <AccountDropdown.Separator />
                <AccountDropdown.LinkItem onSelect={() => router.push("/portfolio")}>
                  <span>Buka Portfolio</span>
                  <Wallet className="h-3.5 w-3.5 text-[#8B948D]" aria-hidden="true" />
                </AccountDropdown.LinkItem>
                <AccountDropdown.LinkItem onSelect={() => router.push("/login")}>
                  <span>Halaman Masuk / Daftar</span>
                  <FileCheck2 className="h-3.5 w-3.5 text-[#8B948D]" aria-hidden="true" />
                </AccountDropdown.LinkItem>
              </AccountDropdown.Content>
            </AccountDropdown.Root>
          </div>
        </div>
      </header>

      <main id="main-konten" tabIndex={-1} className="min-w-0 px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-[1320px]">{children}</div>
      </main>
    </div>
  );
}
