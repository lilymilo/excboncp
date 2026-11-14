"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  ArrowRight,
  Map as MapIcon,
  BarChart3,
  Layers,
  FlaskConical,
  ShieldCheck,
  LayoutDashboard,
  LogIn,
} from "lucide-react";
import { Mascot } from "@/components/mascot/Mascot";
import { LiveClock } from "@/components/motion";
import { SimulasiBadge } from "@/components/dapp/BotanicalPrimitives";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Peta Hutan", href: "/peta", icon: MapIcon },
    { label: "Screener", href: "/screener", icon: BarChart3 },
    { label: "Multi-Lapis", href: "#fitur", icon: Layers },
    { label: "Simulasi", href: "#simulasi", icon: FlaskConical },
    { label: "Auditor", href: "/tinjau", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--line)] bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Mascot */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-transform active:scale-95"
          aria-label="ExcbonCP Beranda"
        >
          <div className="relative flex shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-soft)] p-0.5 shadow-xs transition-colors group-hover:border-[var(--leaf-300)]">
            <Mascot variant="avatar" size={34} alt="Maskot ExcbonCP" />
          </div>
          <div className="flex flex-col">
            <span className="xb-display text-[17px] font-bold tracking-tight text-[var(--ink)]">
              excboncp
            </span>
            <span className="text-[10.5px] font-medium uppercase tracking-wider text-[var(--forest-700)]">
              MRV &amp; Pasar Karbon
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Navigasi Utama">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13.5px] font-medium text-[var(--ink-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)] transition-colors"
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right Action & Status Group */}
        <div className="hidden lg:flex items-center gap-2.5">
          {/* Clock Pill */}
          <span
            className="xb-numeric hidden xl:inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-white px-3 py-1 text-[12.5px] font-semibold text-[var(--ink-muted)] shadow-xs"
            aria-label="Waktu WIB"
          >
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--forest-700)] opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--forest-700)]" />
            </span>
            <LiveClock className="xb-numeric" />
          </span>

          <SimulasiBadge className="hidden xl:inline-flex" />

          <Link
            href="/login"
            className="inline-flex min-h-[40px] items-center gap-1 rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold text-[var(--forest-800)] hover:bg-[var(--surface-soft)] transition-colors"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            <span>Masuk</span>
          </Link>

          <Link
            href="/app"
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[var(--forest-800)] px-4 py-1.5 text-[13.5px] font-semibold text-white shadow-xs hover:bg-[var(--forest-900)] transition-transform active:scale-95"
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            <span>Buka Dasbor</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/app"
            className="inline-flex min-h-[36px] items-center rounded-full bg-[var(--forest-800)] px-3 py-1 text-[12.5px] font-semibold text-white shadow-xs"
          >
            Dasbor
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu navigasi"}
            aria-expanded={mobileMenuOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--ink)] shadow-xs hover:bg-[var(--surface-soft)] active:scale-95"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-[var(--line)] bg-white px-4 pt-3 pb-6 shadow-md md:hidden">
          <nav className="flex flex-col gap-1.5" aria-label="Navigasi Menu Mobile">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2 text-[14.5px] font-medium text-[var(--ink)] hover:bg-[var(--surface-soft)]"
                >
                  <Icon className="h-4 w-4 text-[var(--forest-700)]" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="my-2 border-t border-[var(--line)]" />
            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/app"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[var(--forest-800)] px-4 py-2 text-[14.5px] font-semibold text-white shadow-xs"
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                <span>Buka Dasbor Pemantauan</span>
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2 text-[14.5px] font-semibold text-[var(--forest-800)]"
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                <span>Halaman Masuk &amp; Akun Demo</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
