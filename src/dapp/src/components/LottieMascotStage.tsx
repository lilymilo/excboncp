"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { LottieHandle } from "lottie-react";
import {
  Trees,
  Radio,
  ShieldCheck,
  Pause,
  Play,
  Sparkles,
} from "lucide-react";
import orangutanAnimationData from "../../public/animations/orangutan-mascot.json";

// Dynamic import of lottie-react component
const Lottie = dynamic(() => import("lottie-react").then((m) => m.Lottie), {
  ssr: false,
});

export interface LottieMascotStageProps {
  activeField: "none" | "email" | "password" | "name";
  showPassword: boolean;
  isSubmitting: boolean;
  cardTheme: "light" | "dark";
  paused: boolean;
  onTogglePause: () => void;
  selectedRole?: string;
}

export function LottieMascotStage({
  activeField,
  showPassword,
  isSubmitting,
  cardTheme,
  paused,
  onTogglePause,
  selectedRole,
}: LottieMascotStageProps) {
  const lottieRef = useRef<LottieHandle>(null);
  const [mounted, setMounted] = useState(false);
  const [lottieReady, setLottieReady] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [activeSegment, setActiveSegment] = useState<readonly [number, number]>([0, 120]);
  const [isLooping, setIsLooping] = useState(true);
  const isLight = cardTheme === "light";

  // Check prefers-reduced-motion
  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Reactive animation states based on user interaction
  useEffect(() => {
    if (prefersReducedMotion) return;

    if (isSubmitting) {
      // Wave / greeting cheerful animation: frames 160 -> 220
      setIsLooping(false);
      setActiveSegment([160, 220]);
    } else if (activeField === "password") {
      // If showing password, peek curiously [120, 160], else slow down attentive glance
      setIsLooping(true);
      setActiveSegment(showPassword ? [120, 160] : [0, 60]);
    } else if (activeField === "email" || activeField === "name") {
      // Attentive looking forward: frames 120 -> 160
      setIsLooping(true);
      setActiveSegment([120, 160]);
    } else {
      // Idle natural breathing and blinking: frames 0 -> 120
      setIsLooping(true);
      setActiveSegment([0, 120]);
    }
  }, [activeField, showPassword, isSubmitting, prefersReducedMotion]);

  // Interactive mascot click to greet
  const handleMascotClick = () => {
    if (prefersReducedMotion) return;
    setIsLooping(false);
    setActiveSegment([160, 220]);
    setTimeout(() => {
      setIsLooping(true);
      setActiveSegment([0, 120]);
    }, 2200);
  };

  // Dynamic contextual quote from the Orangutan guardian
  const contextualMessage = isSubmitting
    ? "Menghubungkan sesi aman ke sandbox Base Sepolia..."
    : activeField === "password"
      ? showPassword
        ? "Kata sandi terlihat. Pastikan layar Anda aman!"
        : "Kata sandi terlindungi dengan enkripsi SHA-256."
      : activeField === "email" || activeField === "name"
        ? "Pilih akun demo untuk menguji hak akses peran."
        : selectedRole
          ? `Peran aktif: ${selectedRole}. Siap memverifikasi.`
          : "Orangutan menjaga pohon, telemetri mencatat buktinya.";

  return (
    <div
      className={`relative w-full h-full min-h-[440px] sm:min-h-[520px] lg:min-h-[640px] rounded-[24px] overflow-hidden select-none flex flex-col justify-between p-5 sm:p-7 transition-colors duration-300 ${
        isLight
          ? "bg-gradient-to-br from-[#eaf4ea] via-[#f3f8f1] to-[#e3efe1] text-[#14261a] border border-[#d8e5d4]"
          : "bg-gradient-to-br from-[#121813] via-[#0d1117] to-[#141b15] text-[#FAF8F5] border border-[#232f25]"
      }`}
    >
      {/* Botanical Organic Background Ambient Foliage */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className={`absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-50 ${
            isLight ? "bg-[#8fcb97]/30" : "bg-[#10b981]/15"
          }`}
        />
        <div
          className={`absolute -bottom-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-40 ${
            isLight ? "bg-[#2e6b3f]/20" : "bg-[#60a5fa]/10"
          }`}
        />
        {/* Subtle sunbeam glow */}
        <div
          className={`absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(255,255,255,0.7)_0%,transparent_70%)] ${
            isLight ? "opacity-90" : "opacity-10"
          }`}
        />
      </div>

      {/* TOP BAR: Identity Badge & Motion Pause Control */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold shadow-xs transition-colors ${
            isLight
              ? "bg-white/85 text-[#1f4d2e] border border-[#d8e5d4]"
              : "bg-[#161b22]/90 text-[#10b981] border border-[#30363d]"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          <span>Penjaga Hutan Tropis</span>
          <span className="opacity-40">•</span>
          <span className="font-normal opacity-85">ExcbonCP</span>
        </div>

        <button
          type="button"
          onClick={onTogglePause}
          aria-label={paused ? "Putar animasi maskot" : "Jeda animasi maskot"}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isLight
              ? "bg-white/70 hover:bg-white text-[#4a5e4f] border border-[#d8e5d4]"
              : "bg-[#161b22]/80 hover:bg-[#161b22] text-[#FAF8F5]/80 border border-[#30363d]"
          }`}
        >
          {paused ? (
            <Play className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <Pause className="w-3.5 h-3.5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* CENTER: Official Orangutan Mascot & Interactive Bubble */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center py-4">
        {/* Dynamic Speech Bubble */}
        <div
          className={`mb-3 max-w-[280px] sm:max-w-[320px] px-3.5 py-1.5 rounded-full text-center text-xs font-medium transition-all duration-300 shadow-xs flex items-center justify-center gap-1.5 ${
            isLight
              ? "bg-white/90 text-[#14261a] border border-[#d8e5d4]"
              : "bg-[#161b22]/95 text-[#FAF8F5] border border-[#30363d]"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
          <span className="truncate">{contextualMessage}</span>
        </div>

        {/* Mascot Interactive Wrapper */}
        <div
          onClick={handleMascotClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleMascotClick();
          }}
          aria-label="Maskot Orangutan Penjaga Hutan. Klik untuk menyapa."
          title="Klik untuk menyapa maskot!"
          className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 cursor-pointer transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] focus:outline-hidden"
        >
          {/* Static SVG Fallback (Zero CLS) */}
          {(!lottieReady || prefersReducedMotion) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/illustrations/orangutan-mascot.svg"
              alt="Maskot Orangutan Penjaga Hutan"
              width={320}
              height={320}
              loading="eager"
              decoding="async"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />
          )}

          {/* Animated Lottie Mascot */}
          {mounted && !prefersReducedMotion && (
            <Lottie
              src={orangutanAnimationData}
              lottieRef={lottieRef}
              loop={isLooping}
              autoplay={!paused}
              segment={activeSegment}
              subscriptions={{
                ready: () => setLottieReady(true),
              }}
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                lottieReady ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
        </div>

        {/* Soft shadow anchor beneath Orangutan */}
        <div
          aria-hidden="true"
          className={`w-48 sm:w-56 h-6 rounded-full blur-md mx-auto -mt-2 transition-colors ${
            isLight ? "bg-[#14261a]/12" : "bg-black/50"
          }`}
        />
      </div>

      {/* BOTTOM: Ecosystem Telemetry Chips (Aligned with DApp) */}
      <div className="relative z-10 pt-2 space-y-2.5">
        <div className="grid grid-cols-3 gap-2">
          {/* Tile 1: Canopy NDVI */}
          <div
            className={`p-2.5 rounded-xl border text-center transition-colors ${
              isLight
                ? "bg-white/80 border-[#d8e5d4] text-[#14261a]"
                : "bg-[#161b22]/80 border-[#30363d] text-[#FAF8F5]"
            }`}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trees className="w-3.5 h-3.5 text-[#10b981]" />
              <span className="text-[10px] uppercase font-semibold opacity-70">
                Kanopi
              </span>
            </div>
            <p className="font-telemetry text-xs font-bold text-[#10b981]">
              NDVI 0.81
            </p>
            <p className="text-[10px] opacity-75 truncate">Petak A 600 Ha</p>
          </div>

          {/* Tile 2: IoT Sensor */}
          <div
            className={`p-2.5 rounded-xl border text-center transition-colors ${
              isLight
                ? "bg-white/80 border-[#d8e5d4] text-[#14261a]"
                : "bg-[#161b22]/80 border-[#30363d] text-[#FAF8F5]"
            }`}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Radio className="w-3.5 h-3.5 text-[#60a5fa]" />
              <span className="text-[10px] uppercase font-semibold opacity-70">
                Sensor
              </span>
            </div>
            <p className="font-telemetry text-xs font-bold">
              31.4°C
            </p>
            <p className="text-[10px] text-[#10b981] font-semibold truncate">
              Api: Aman (0)
            </p>
          </div>

          {/* Tile 3: Community Consensus */}
          <div
            className={`p-2.5 rounded-xl border text-center transition-colors ${
              isLight
                ? "bg-white/80 border-[#d8e5d4] text-[#14261a]"
                : "bg-[#161b22]/80 border-[#30363d] text-[#FAF8F5]"
            }`}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] uppercase font-semibold opacity-70">
                Adat
              </span>
            </div>
            <p className="font-telemetry text-xs font-bold text-amber-500">
              70%
            </p>
            <p className="text-[10px] opacity-75 truncate">Kas Desa Sah</p>
          </div>
        </div>

        <p className="text-center text-[11px] opacity-65 leading-tight font-ui">
          Telemetri pohon disegel kriptografis secara transparan di Base Sepolia.
        </p>
      </div>
    </div>
  );
}
