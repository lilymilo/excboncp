"use client";

import { useEffect, useState } from "react";
import CardNav, { CardNavItem } from "@/components/CardNav";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems: CardNavItem[] = [
    {
      label: "DApp & Peta",
      description: "Terminal DEX Karbon, Peta Poligon & Telemetri IoT",
      bgColor: "var(--color-surface)",
      textColor: "var(--color-text-primary)",
      links: [
        { label: "Pasar & Screener (/screener)", href: "/screener" },
        { label: "Ringkasan Dasbor (/app)", href: "/app" },
        { label: "Peta Poligon & IoT (/peta)", href: "/peta" },
      ],
    },
    {
      label: "Audit & EAS",
      description: "Konsensus warga 60% & segel Base Sepolia EAS",
      bgColor: "var(--color-surface-raised)",
      textColor: "var(--color-text-primary)",
      links: [
        { label: "Portal Verifikasi (/verifikasi/1)", href: "/verifikasi/1" },
        { label: "Screener Lahan (/screener)", href: "/screener" },
        { label: "Simulasi & Segel SHA-256", href: "#simulasi" },
      ],
    },
    {
      label: "Akun & Peran",
      description: "Eksplorasi 4 akun demo peran & autentikasi",
      bgColor: "var(--color-surface-soft)",
      textColor: "var(--color-text-primary)",
      links: [
        { label: "Halaman Log In (/login)", href: "/login" },
        { label: "Halaman Register (/register)", href: "/register" },
        { label: "Pilih 4 Peran Demo", href: "#demo" },
      ],
    },
  ];

  const brandLogo = (
    <div className="flex items-center gap-2.5 group cursor-pointer">
      <div className="relative w-8 h-8 rounded-[10px] bg-gradient-to-b from-[#3898FF] via-[#1E70F5] to-[#0A5CFF] shadow-[0_3px_12px_rgba(10,92,255,0.4)] border border-white/30 flex items-center justify-center overflow-hidden">
        <div className="absolute top-[2px] left-[3px] right-[3px] h-[8px] rounded-t-[7px] rounded-b-[3px] bg-gradient-to-b from-white/95 via-white/50 to-transparent pointer-events-none" />
        <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
      </div>
      <span className="text-[16px] font-bold tracking-tight text-white">
        excboncp
      </span>
    </div>
  );

  return (
    <header className="fixed top-3 sm:top-5 left-0 right-0 z-50 px-4 pointer-events-none">
      <div
        data-scrolled={scrolled ? "true" : "false"}
        className="xbm-nav-shell pointer-events-auto max-w-5xl mx-auto"
      >
        <CardNav
          logo={brandLogo}
          logoHref="/"
          items={navItems}
          cta={{
            label: "Coba Demo",
            href: "#demo",
          }}
          theme="dark"
          surface="glass"
          cardEffect="rise"
          accentColor="#AEDA2D"
          maxWidth={820}
        />
      </div>
    </header>
  );
}
