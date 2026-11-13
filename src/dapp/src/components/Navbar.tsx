"use client";

import CardNav, { CardNavItem } from "@/components/CardNav";

export function Navbar() {
  const navItems: CardNavItem[] = [
    {
      label: "DApp & Peta",
      description: "Terminal DEX Karbon, Peta Poligon & Telemetri IoT",
      bgColor: "#141A14",
      textColor: "#F0F2EC",
      links: [
        { label: "DEX Carbon Screener (/market)", href: "/market" },
        { label: "Peta Poligon & IoT (/map)", href: "/map" },
        { label: "Multi-Layer Verification", href: "#fitur" },
      ],
    },
    {
      label: "Audit & EAS",
      description: "Konsensus warga 70% & segel Base Sepolia EAS",
      bgColor: "#171D16",
      textColor: "#F0F2EC",
      links: [
        { label: "Portal Auditor (/verify)", href: "/verify" },
        { label: "Antrean Segel EAS (/audit)", href: "/audit" },
        { label: "Uji Nyala Api (KY-026)", href: "#simulasi" },
      ],
    },
    {
      label: "Akun & Peran",
      description: "Quick switch 6 akun seed demo & autentikasi",
      bgColor: "#1D231B",
      textColor: "#F0F2EC",
      links: [
        { label: "Halaman Log In (/login)", href: "/login" },
        { label: "Halaman Register (/register)", href: "/register" },
        { label: "Panduan 4 Peran Demo", href: "#demo" },
      ],
    },
  ];

  const brandLogo = (
    <div className="flex items-center gap-2.5 group cursor-pointer">
      {/* 3D Glossy Squircle App Icon */}
      <div className="relative w-8 h-8 rounded-[10px] bg-gradient-to-b from-[#3898FF] via-[#1E70F5] to-[#0A5CFF] shadow-[0_3px_12px_rgba(10,92,255,0.4)] border border-white/30 flex items-center justify-center overflow-hidden transition-transform duration-200 group-hover:scale-105">
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
      <div className="pointer-events-auto max-w-5xl mx-auto">
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
