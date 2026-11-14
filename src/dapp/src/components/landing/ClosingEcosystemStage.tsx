"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Compass, ShieldCheck, Users, FileCheck, Landmark, KeyRound, TrendingUp, BarChart3 } from "lucide-react";
import SpecularButton from "@/components/SpecularButton";

export function ClosingEcosystemStage() {
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
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#020704] via-[#041209] to-[#010408] px-4 sm:px-8">
      {/* Background Subtle Cyber Glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30"
      >
        <div className="w-[600px] h-[600px] rounded-full bg-[#AEDA2D]/10 blur-3xl" />
      </div>

      {/* Main Interactive CTA Terminal */}
      <div className="relative z-10 w-full max-w-5xl rounded-3xl bg-[#060e07]/92 border border-white/15 backdrop-blur-2xl p-6 sm:p-10 shadow-[0_25px_80px_rgba(0,0,0,0.85)] pointer-events-auto text-center">
        {/* Main Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-[1.14] drop-shadow-md">
          Wujudkan Integritas Karbon{" "}
          <span className="text-[#AEDA2D] drop-shadow-[0_0_24px_rgba(174,218,45,0.45)]">
            Bersama ExcbonCP
          </span>
        </h2>

        {/* Subtitle */}
        <p className="mt-4 text-xs sm:text-base text-[#D4DEC9] max-w-2xl mx-auto leading-relaxed font-medium">
          Satu-satunya ekosistem yang menyatukan bukti fisik sensor di pepohonan, citra satelit,
          dan persetujuan warga adat 70% ke dalam buku catatan publik tanpa perantara.
        </p>

        {/* Simulated DEX Market Ticker Strip */}
        <div className="my-6 p-4 rounded-2xl bg-black/60 border border-white/10 max-w-3xl mx-auto flex flex-wrap items-center justify-around gap-4 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#AEDA2D]/15 text-[#AEDA2D]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[0.68rem] font-mono text-white/50 block">HARGA INDEX KARBON</span>
              <span className="text-lg font-mono font-bold text-white">$24.50 <span className="text-xs text-[#AEDA2D]">/ tCO2e</span></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#38bdf8]/15 text-[#38bdf8]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[0.68rem] font-mono text-white/50 block">LIKUIDITAS POOL DEX</span>
              <span className="text-lg font-mono font-bold text-[#38bdf8]">$1,420,000</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#34d399]/15 text-[#34d399]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[0.68rem] font-mono text-white/50 block">VERIFIKASI FISIK</span>
              <span className="text-lg font-mono font-bold text-[#34d399]">100% On-Chain</span>
            </div>
          </div>
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-7">
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
              boxShadow: "0 0 32px rgba(174,218,45,0.45), inset 0 1px 1px rgba(255,255,255,0.45)",
            }}
          >
            Bergabung dengan Kami di ExcbonCP
            <ArrowRight className="w-4 h-4 ml-2" />
          </SpecularButton>

          <Link
            href="/map"
            className="button-touch w-full sm:w-auto px-6 py-3 rounded-full text-xs sm:text-sm font-semibold bg-[#152014]/90 text-[#F0F2EC] border border-[#2e472c] hover:bg-[#1f311e] hover:border-[#AEDA2D]/60 flex items-center justify-center gap-2 transition-all backdrop-blur-md shadow-md"
          >
            <Compass className="w-4 h-4 text-[#AEDA2D]" />
            <span>Buka Peta Poligon &amp; IoT</span>
          </Link>
        </div>

        {/* 4-Role Quick Access Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-4xl mx-auto">
          {roleCards.map((r, i) => {
            const Icon = r.icon;
            return (
              <Link
                key={i}
                href={r.href}
                className="group p-3 rounded-xl bg-[#0c130d]/90 border border-white/12 hover:border-[#AEDA2D]/60 hover:bg-[#142013] transition-all text-left backdrop-blur-md shadow-sm"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Icon className="w-4 h-4 text-[#AEDA2D] group-hover:scale-110 transition-transform" />
                  <span className="text-[0.6rem] font-mono text-[#9bb093] uppercase tracking-wider">
                    {r.badge}
                  </span>
                </div>
                <div className="text-xs font-semibold text-white group-hover:text-[#AEDA2D] transition-colors">
                  {r.title}
                </div>
                <div className="text-[0.68rem] text-[#9bb093] mt-0.5 line-clamp-1">
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
            className="inline-flex items-center gap-1.5 text-xs text-[#C2D1BC] hover:text-[#AEDA2D] transition-colors font-medium bg-[#111a12]/90 px-3.5 py-1.5 rounded-full border border-white/12"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#AEDA2D]" />
            <span>Quick Switch 6 Akun Seed Demo (/login)</span>
          </Link>
        </div>

        {/* Trust Badge */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[0.72rem] text-[#8ea087]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#64c975]" />
          <span>Tersegel Kriptografis Base Sepolia EAS • Hash Chain SHA-256 Terverifikasi</span>
        </div>
      </div>
    </div>
  );
}
