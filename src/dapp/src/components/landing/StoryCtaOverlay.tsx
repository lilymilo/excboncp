"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Compass, ShieldCheck, Sparkles, Users, FileCheck, Landmark, KeyRound } from "lucide-react";
import SpecularButton from "@/components/SpecularButton";

interface StoryCtaOverlayProps {
  isVisible: boolean;
}

export function StoryCtaOverlay({ isVisible }: StoryCtaOverlayProps) {
  const roleCards = [
    {
      title: "Warga Adat & Desa",
      desc: "Konsensus 70% FPIC & bagi hasil",
      href: "/consent",
      icon: Users,
      badge: "Kedaulatan",
    },
    {
      title: "Pengembang Hutan",
      desc: "Pendaftaran poligon & IoT sensor",
      href: "/screener",
      icon: Landmark,
      badge: "Inisiasi",
    },
    {
      title: "Auditor Independen",
      desc: "Verifikasi EAS & segel Base Sepolia",
      href: "/verify",
      icon: FileCheck,
      badge: "Validasi",
    },
    {
      title: "Pembeli Karbon",
      desc: "Terminal transaksi DEX terverifikasi",
      href: "/market",
      icon: Compass,
      badge: "Pasar",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 25,
        pointerEvents: isVisible ? "auto" : "none",
      }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: isVisible ? 0.15 : 0 }}
      className="relative z-30 max-w-4xl mx-auto text-center px-4 py-8"
    >
      {/* Eyebrow Pill */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#162215]/90 border border-[#2b4129] text-[0.75rem] font-semibold text-[#AEDA2D] mb-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-md">
        <Sparkles className="w-3.5 h-3.5 text-[#AEDA2D]" />
        <span>06 / 06 • GERBANG UTAMA PLATFORM</span>
      </div>

      {/* Main Headline */}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#F0F2EC] leading-[1.12]">
        Wujudkan Integritas Karbon{" "}
        <span className="text-[#AEDA2D]">Bersama ExcbonCP</span>
      </h2>

      {/* Subtitle */}
      <p className="mt-4 text-xs sm:text-base text-[#C2D1BC] max-w-2xl mx-auto leading-relaxed">
        Satu-satunya ekosistem yang menyatukan bukti fisik sensor di pepohonan, citra satelit,
        dan persetujuan warga adat 70% ke dalam buku catatan publik tanpa perantara.
      </p>

      {/* Primary CTA Buttons */}
      <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3.5">
        <SpecularButton
          size="lg"
          radius={999}
          lineColor="#FFFFFF"
          baseColor="#D8F57A"
          textColor="#11160B"
          tint="#AEDA2D"
          tintOpacity={1}
          intensity={1.6}
          idleIntensity={0.7}
          glow={1.4}
          thickness={1.8}
          shineSize={16}
          shineFade={30}
          autoAnimate={true}
          onClick={() => {
            window.location.href = "/market";
          }}
          className="w-full sm:w-auto font-semibold px-8"
          style={{
            backgroundColor: "#AEDA2D",
            color: "#11160B",
            boxShadow: "0 0 32px rgba(174,218,45,0.38), inset 0 1px 1px rgba(255,255,255,0.45)",
          }}
        >
          Bergabung dengan Kami di ExcbonCP
          <ArrowRight className="w-4 h-4 ml-2" />
        </SpecularButton>

        <Link
          href="/map"
          className="button-touch w-full sm:w-auto px-6 py-3 rounded-full text-xs sm:text-sm font-semibold bg-[#152014]/90 text-[#F0F2EC] border border-[#273d25] hover:bg-[#1f311e] hover:border-[#AEDA2D]/60 flex items-center justify-center gap-2 transition-all backdrop-blur-md shadow-md"
        >
          <Compass className="w-4 h-4 text-[#AEDA2D]" />
          <span>Buka Peta Poligon &amp; IoT</span>
        </Link>
      </div>

      {/* 4-Role Quick Access Strip */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-3xl mx-auto">
        {roleCards.map((r, i) => {
          const Icon = r.icon;
          return (
            <Link
              key={i}
              href={r.href}
              className="group p-3 rounded-xl bg-[#0c130d]/80 border border-white/10 hover:border-[#AEDA2D]/50 hover:bg-[#142013]/90 transition-all text-left backdrop-blur-md shadow-sm"
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon className="w-4 h-4 text-[#AEDA2D] group-hover:scale-110 transition-transform" />
                <span className="text-[0.6rem] font-mono text-[#8ca084] uppercase tracking-wider">
                  {r.badge}
                </span>
              </div>
              <div className="text-xs font-semibold text-[#F0F2EC] group-hover:text-[#AEDA2D] transition-colors">
                {r.title}
              </div>
              <div className="text-[0.68rem] text-[#8ca084] mt-0.5 line-clamp-1">
                {r.desc}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Demo Seed Accounts Strip */}
      <div className="mt-5 flex items-center justify-center gap-3">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-[#A8B7A1] hover:text-[#AEDA2D] transition-colors font-medium bg-[#0c130d]/70 px-3.5 py-1.5 rounded-full border border-white/10"
        >
          <KeyRound className="w-3.5 h-3.5 text-[#AEDA2D]" />
          <span>Quick Switch 6 Akun Seed Demo (/login)</span>
        </Link>
      </div>

      {/* Trust Badge */}
      <div className="mt-4 flex items-center justify-center gap-2 text-[0.72rem] text-[#869780]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#64c975]" />
        <span>Tersegel Kriptografis Base Sepolia EAS • Hash Chain SHA-256 Terverifikasi</span>
      </div>
    </motion.div>
  );
}
