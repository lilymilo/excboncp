"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronDown, Compass, ShieldCheck, Sparkles } from "lucide-react";
import SpecularButton from "@/components/SpecularButton";

interface StoryCtaOverlayProps {
  isVisible: boolean;
  onExploreMore?: () => void;
}

export function StoryCtaOverlay({ isVisible, onExploreMore }: StoryCtaOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 25,
        pointerEvents: isVisible ? "auto" : "none",
      }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: isVisible ? 0.15 : 0 }}
      className="relative z-30 max-w-2xl mx-auto text-center px-4"
    >
      {/* Eyebrow Pill */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#162215]/90 border border-[#2b4129] text-[0.75rem] font-semibold text-[#AEDA2D] mb-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-md">
        <Sparkles className="w-3.5 h-3.5 text-[#AEDA2D]" />
        <span>Ekosistem Terdesentralisasi Terbuka</span>
      </div>

      {/* Main Headline */}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#F0F2EC] leading-[1.14]">
        Wujudkan Integritas Karbon{" "}
        <span className="text-[#AEDA2D]">Bersama ExcbonCP</span>
      </h2>

      {/* Subtitle */}
      <p className="mt-4 text-xs sm:text-sm text-[#A8B7A1] max-w-xl mx-auto leading-relaxed">
        Satu-satunya platform yang mengunci fakta fisik sensor di pepohonan, citra satelit,
        dan persetujuan masyarakat adat 70% ke dalam buku catatan publik tanpa perantara.
      </p>

      {/* Action Buttons */}
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
          <span>Jelajahi Peta Poligon &amp; IoT</span>
        </Link>
      </div>

      {/* Trust Badge */}
      <div className="mt-5 flex items-center justify-center gap-2 text-[0.72rem] text-[#788871]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#5f8f55]" />
        <span>Terkunci secara kriptografis di Base Sepolia EAS &amp; SHA-256 Ledger</span>
      </div>

      {/* Downward Scroll Prompt */}
      {onExploreMore && (
        <button
          onClick={onExploreMore}
          className="mt-6 inline-flex items-center gap-1.5 text-xs text-[#95A58E] hover:text-[#AEDA2D] transition-colors group cursor-pointer"
        >
          <span>Lanjut ke Eksplorasi Fitur Lengkap</span>
          <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
        </button>
      )}
    </motion.div>
  );
}
