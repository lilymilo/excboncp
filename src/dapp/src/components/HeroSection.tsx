"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import SpecularButton from "@/components/SpecularButton";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-12 sm:pt-40 sm:pb-16 overflow-hidden">
      {/* Background Soft Lime Halo */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[850px] h-[350px] sm:h-[450px] bg-[radial-gradient(ellipse_at_center,rgba(100,117,62,0.22)_0%,rgba(11,16,12,0)_70%)] blur-[80px] pointer-events-none -z-10"
      />

      <div className="page-shell flex flex-col items-center text-center">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-[#171C16] border border-[#252D22] text-[0.75rem] font-medium text-[#A8AFA2] mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#AEDA2D]" />
          <span>Sistem Pemantauan Hutan &amp; Verifikasi Karbon Terbuka</span>
        </div>

        {/* Two-Tone Headline */}
        <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-normal tracking-tight text-[#F0F2EC] max-w-4xl leading-[1.12]">
          Membangun bukti <span className="text-[#AEDA2D]">kondisi hutan</span>,
          <br className="hidden sm:inline" /> sebelum menghitung nilai.
        </h1>

        {/* Supporting Copy */}
        <p className="mt-5 text-[0.95rem] sm:text-[1.05rem] text-[#A8AFA2] max-w-[56ch] leading-relaxed">
          Excboncp menyatukan citra satelit, sensor di pepohonan, dan izin warga adat
          ke dalam buku catatan terbuka yang terkunci secara digital tanpa perantara.
        </p>

        {/* Dual CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          {/* Primary CTA: SpecularButton from React Bits */}
          <SpecularButton
            size="md"
            radius={999}
            lineColor="#FFFFFF"
            baseColor="#D8F57A"
            textColor="#11160B"
            tint="#AEDA2D"
            tintOpacity={1}
            intensity={1.55}
            idleIntensity={0.65}
            glow={1.35}
            thickness={1.8}
            shineSize={16}
            shineFade={32}
            autoAnimate={true}
            onClick={() => {
              window.location.href = "/market";
            }}
            className="w-full sm:w-auto font-semibold"
            style={{
              backgroundColor: "#AEDA2D",
              color: "#11160B",
              boxShadow: "0 0 28px rgba(174,218,45,0.32), inset 0 1px 1px rgba(255,255,255,0.45)",
            }}
          >
            Buka Terminal DEX Karbon
            <ArrowRight className="w-4 h-4" />
          </SpecularButton>

          {/* Secondary CTA: standard outline style */}
          <Link
            href="/map"
            className="button-touch w-full sm:w-auto px-6 py-2.5 rounded-pill text-[0.875rem] font-medium bg-[#171C16] text-[#F0F2EC] border border-[#252D22] hover:bg-[#1D231B] hover:border-[#64753E] flex items-center justify-center transition-colors"
          >
            Peta Poligon &amp; IoT
          </Link>
        </div>

        {/* Quick 5-Page Blueprint Navigation Strip */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
          <Link
            href="/market"
            className="px-3.5 py-1.5 rounded-full bg-[#171C16] border border-[#252D22] text-[#AEDA2D] hover:border-[#AEDA2D] transition-colors font-medium"
          >
            Pasar &amp; DEX Screener (/market)
          </Link>
          <Link
            href="/map"
            className="px-3.5 py-1.5 rounded-full bg-[#171C16] border border-[#252D22] text-[#C6CEC0] hover:border-[#AEDA2D] transition-colors font-medium"
          >
            Peta Lahan (/map)
          </Link>
          <Link
            href="/verify"
            className="px-3.5 py-1.5 rounded-full bg-[#171C16] border border-[#252D22] text-[#C6CEC0] hover:border-[#AEDA2D] transition-colors font-medium"
          >
            Portal Auditor &amp; EAS (/verify)
          </Link>
          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-full bg-[#171C16] border border-[#252D22] text-[#C6CEC0] hover:border-[#AEDA2D] transition-colors font-medium"
          >
            Log In (/login)
          </Link>
          <Link
            href="/register"
            className="px-3.5 py-1.5 rounded-full bg-[#171C16] border border-[#252D22] text-[#C6CEC0] hover:border-[#AEDA2D] transition-colors font-medium"
          >
            Register (/register)
          </Link>
        </div>

        {/* Subtle Sandbox Note */}
        <div className="mt-6 flex items-center gap-1.5 text-[0.75rem] text-[#747D70]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#64753E]" />
          <span>Simulasi sandbox di jaringan uji coba Base Sepolia &bull; Tanpa dompet kripto</span>
        </div>
      </div>
    </section>
  );
}
