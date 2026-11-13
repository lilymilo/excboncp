"use client";

import React, { useEffect, useRef, useState } from "react";
import Ballpit from "@/components/Ballpit";
import { Floating3DParticles } from "@/components/ui/floating-3d-particles";
import { Pause, Play } from "lucide-react";

declare global {
  interface Window {
    lottie?: {
      loadAnimation: (params: {
        container: HTMLElement;
        renderer: "svg" | "canvas" | "html";
        loop: boolean;
        autoplay: boolean;
        path?: string;
        animationData?: unknown;
        rendererSettings?: Record<string, unknown>;
      }) => {
        destroy: () => void;
        play: () => void;
        pause: () => void;
        setSpeed: (speed: number) => void;
        setDirection: (dir: 1 | -1) => void;
      };
    };
  }
}

export interface MascotPreset {
  id: string;
  label: string;
  path: string;
  renderMode: "clay-3d" | "keyed-3d" | "portal-3d";
  caption: string;
}

export const MASCOT_PRESETS: MascotPreset[] = [
  {
    id: "violet-flower",
    label: "Violet Flower",
    path: "/animations/violet-flower-mascot.json",
    renderMode: "clay-3d",
    caption: "LottieFiles • 3D Clay Flower Mascot",
  },
  {
    id: "cobalt-monster",
    label: "Cobalt Buddy",
    path: "/animations/cobalt-monster-mascot.json",
    renderMode: "clay-3d",
    caption: "LottieFiles • 3D Periwinkle Mascot",
  },
  {
    id: "violet-3d",
    label: "3D Character",
    path: "/animations/char-3d-2.json",
    renderMode: "keyed-3d",
    caption: "LottieFiles • 3D Rendered Character",
  },
  {
    id: "guardian-3d",
    label: "3D Guardian",
    path: "/animations/char-3d-8.json",
    renderMode: "portal-3d",
    caption: "LottieFiles • 3D Forest Guardian",
  },
];

interface LottieMascotStageProps {
  activeField: "none" | "email" | "password" | "name";
  showPassword: boolean;
  isSubmitting: boolean;
  cardTheme: "light" | "dark";
  paused: boolean;
  onTogglePause: () => void;
}

export function LottieMascotStage({
  activeField,
  showPassword,
  isSubmitting,
  cardTheme,
  paused,
  onTogglePause,
}: LottieMascotStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const lottieContainerRef = useRef<HTMLDivElement>(null);
  const animInstanceRef = useRef<{
    destroy: () => void;
    play: () => void;
    pause: () => void;
    setSpeed: (speed: number) => void;
    setDirection: (dir: 1 | -1) => void;
  } | null>(null);

  const [selectedPreset, setSelectedPreset] = useState<MascotPreset>(
    MASCOT_PRESETS[0]
  );
  const [lottieReady, setLottieReady] = useState(false);
  const [lottieError, setLottieError] = useState<string | null>(null);
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });

  // Load official lottie-web script from local /vendor/lottie.min.js
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.lottie) {
      setLottieReady(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="/vendor/lottie.min.js"]'
    ) as HTMLScriptElement | null;

    if (existingScript) {
      const handleLoad = () => setLottieReady(true);
      existingScript.addEventListener("load", handleLoad);
      if (window.lottie) setLottieReady(true);
      return () => existingScript.removeEventListener("load", handleLoad);
    }

    const script = document.createElement("script");
    script.src = "/vendor/lottie.min.js";
    script.async = true;
    script.onload = () => setLottieReady(true);
    script.onerror = () =>
      setLottieError("Gagal memuat pemutar animasi Lottie.");
    document.body.appendChild(script);
  }, []);

  // Mount / switch Lottie animation when preset or lottieReady changes
  useEffect(() => {
    if (!lottieReady || !window.lottie || !lottieContainerRef.current) return;

    setLottieError(null);
    animInstanceRef.current?.destroy();

    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const instance = window.lottie.loadAnimation({
      container: lottieContainerRef.current,
      renderer: "svg",
      loop: true,
      autoplay: !paused && !prefersReducedMotion,
      path: selectedPreset.path,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid meet",
        progressiveLoad: false,
      },
    });

    animInstanceRef.current = instance;

    return () => {
      instance.destroy();
      animInstanceRef.current = null;
    };
  }, [lottieReady, selectedPreset]);

  // React to pause/play toggle
  useEffect(() => {
    const inst = animInstanceRef.current;
    if (!inst) return;
    if (paused) {
      inst.pause();
    } else {
      inst.play();
    }
  }, [paused]);

  // React to form field focus, password visibility, and submission speed
  useEffect(() => {
    const inst = animInstanceRef.current;
    if (!inst || paused) return;

    if (isSubmitting) {
      inst.setSpeed(1.8);
    } else if (activeField === "password") {
      inst.setSpeed(showPassword ? 1.45 : 0.75);
    } else if (activeField === "email" || activeField === "name") {
      inst.setSpeed(1.25);
    } else {
      inst.setSpeed(1);
    }
  }, [activeField, showPassword, isSubmitting, paused]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (paused) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 2;
    setPointerOffset({ x: nx * 16, y: ny * 14 });
  };

  const handlePointerLeave = () => {
    setPointerOffset({ x: 0, y: 0 });
  };

  const focusTiltX =
    activeField === "email" || activeField === "name"
      ? 8
      : activeField === "password"
        ? 5
        : 0;
  const focusScale = isSubmitting
    ? 1.06
    : activeField !== "none"
      ? 1.03
      : 1;

  const isLight = cardTheme === "light";

  return (
    <div
      ref={stageRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-[590px] rounded-[24px] overflow-hidden select-none flex flex-col justify-between transition-colors duration-300 ${
        isLight
          ? "bg-[radial-gradient(circle_at_35%_30%,#ECEEF4_0%,#DCDDE4_52%,#CFD1DC_100%)] text-[#18191D]"
          : "bg-[radial-gradient(circle_at_35%_30%,#1E271D_0%,#151B14_55%,#0F140E_100%)] text-[#F0F2EC] border border-[#252E23]"
      }`}
    >
      {/* Hidden SVG Filters for 3D Soft-Body Clay Specular Lighting & White Background Keying */}
      <svg
        width="0"
        height="0"
        className="absolute pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          {/* Turns flat 2D Lottie vector shapes into glossy 3D clay/vinyl forms */}
          <filter
            id="lottie-3d-clay"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur
              in="SourceAlpha"
              stdDeviation="4.5"
              result="blurAlpha"
            />
            <feSpecularLighting
              in="blurAlpha"
              surfaceScale="5.5"
              specularConstant="0.75"
              specularExponent="20"
              lightingColor="#ffffff"
              result="specOut"
            >
              <fePointLight x="-140" y="-200" z="260" />
            </feSpecularLighting>
            <feComposite
              in="specOut"
              in2="SourceAlpha"
              operator="in"
              result="specMask"
            />
            <feComposite
              in="SourceGraphic"
              in2="specMask"
              operator="arithmetic"
              k1="0"
              k2="1"
              k3="0.65"
              k4="0"
              result="litGraphic"
            />
            <feDropShadow
              in="litGraphic"
              dx="0"
              dy="14"
              stdDeviation="10"
              floodColor="#2D2363"
              floodOpacity="0.28"
            />
          </filter>

          {/* Keys out solid white background on 3D WebP frame sequences so character blends into stage */}
          <filter
            id="lottie-3d-key-white"
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
            colorInterpolationFilters="sRGB"
          >
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -12 -12 -5 27.2 0"
              result="keyed"
            />
            <feDropShadow
              in="keyed"
              dx="0"
              dy="16"
              stdDeviation="12"
              floodColor="#231B54"
              floodOpacity="0.32"
            />
          </filter>
        </defs>
      </svg>

      {/* =================================================================== */}
      {/* LAYER 0: Persistent 3D Studio Backdrop Objects (Matches Reference!) */}
      {/* =================================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        {/* Top-Left Giant 3D Striped Golden-Yellow Sphere */}
        <div
          style={{
            transform: `translate3d(${pointerOffset.x * -0.45}px, ${pointerOffset.y * -0.45}px, 0) rotate(-22deg)`,
            transition: "transform 350ms cubic-bezier(0.22, 1, 0.36, 1)",
            background:
              "radial-gradient(circle at 32% 28%, #FFFDF5 0%, #F7CE46 28%, #E2A612 68%, #9E6B04 100%)",
            boxShadow:
              "inset -18px -22px 36px rgba(92,58,0,0.42), inset 14px 14px 28px rgba(255,255,255,0.75), 12px 24px 44px rgba(30,25,60,0.22)",
          }}
          className="absolute -top-12 -left-12 w-[210px] h-[210px] sm:w-[255px] sm:h-[255px] rounded-full overflow-hidden"
        >
          {/* 3D Curved White Stripes */}
          <div
            className="absolute inset-0 opacity-85"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(255,255,255,0.88) 0px, rgba(255,255,255,0.88) 18px, transparent 18px, transparent 40px)",
              maskImage:
                "radial-gradient(circle at 42% 38%, black 45%, rgba(0,0,0,0.35) 100%)",
            }}
          />
          {/* Top-left glossy highlight */}
          <div className="absolute top-6 left-8 w-20 h-10 rounded-full bg-white/65 blur-[4px] -rotate-12" />
        </div>

        {/* Top-Right Giant 3D Cobalt-Blue Glossy Sphere */}
        <div
          style={{
            transform: `translate3d(${pointerOffset.x * -0.55}px, ${pointerOffset.y * -0.4}px, 0)`,
            transition: "transform 350ms cubic-bezier(0.22, 1, 0.36, 1)",
            background:
              "radial-gradient(circle at 30% 28%, #9EB5FF 0%, #4E6BFF 34%, #2541E5 72%, #132185 100%)",
            boxShadow:
              "inset -22px -24px 40px rgba(10,18,84,0.55), inset 12px 14px 28px rgba(255,255,255,0.45), -14px 24px 48px rgba(28,45,170,0.28)",
          }}
          className="absolute top-4 -right-14 w-[205px] h-[205px] sm:w-[250px] sm:h-[250px] rounded-full"
        />

        {/* Mid-Left 3D Pearlescent Lavender Cluster */}
        <div
          style={{
            transform: `translate3d(${pointerOffset.x * -0.3}px, ${pointerOffset.y * -0.3}px, 0)`,
            transition: "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
            background:
              "radial-gradient(circle at 35% 30%, #FFFFFF 0%, #D2CBE8 45%, #8E84B8 90%)",
            boxShadow:
              "inset -10px -12px 22px rgba(55,48,88,0.45), 8px 14px 28px rgba(30,28,55,0.18)",
          }}
          className="absolute top-[30%] -left-8 w-[88px] h-[110px] rounded-[44px] rotate-12"
        />

        {/* Bottom-Right Deep Violet 3D Sphere */}
        <div
          style={{
            transform: `translate3d(${pointerOffset.x * -0.35}px, ${pointerOffset.y * -0.35}px, 0)`,
            transition: "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
            background:
              "radial-gradient(circle at 32% 28%, #C4A9FF 0%, #865DFF 42%, #4B24C7 88%)",
            boxShadow:
              "inset -16px -18px 32px rgba(32,12,96,0.55), -8px 12px 34px rgba(75,36,199,0.28)",
          }}
          className="absolute -bottom-8 -right-10 w-[180px] h-[180px] sm:w-[210px] sm:h-[210px] rounded-full"
        />

        {/* Center 3D Studio Ambient Halo & Grounded Plinth Pedestal under the Mascot */}
        <div
          style={{
            transform: `translate3d(${pointerOffset.x * 0.25}px, ${pointerOffset.y * 0.15}px, 0)`,
            transition: "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        >
          {/* Soft 3D Lavender Aura behind the mascot so it integrates with background */}
          <div
            className="w-[270px] h-[270px] sm:w-[320px] sm:h-[320px] rounded-full blur-[28px]"
            style={{
              background: isLight
                ? "radial-gradient(circle, rgba(132,101,255,0.34) 0%, rgba(78,107,255,0.16) 52%, transparent 75%)"
                : "radial-gradient(circle, rgba(174,218,45,0.22) 0%, rgba(78,107,255,0.18) 52%, transparent 75%)",
            }}
          />
          {/* 3D Studio Pedestal / Grounding Shadow Disc so mascot never floats in mid-air */}
          <div
            className="-mt-10 w-[190px] sm:w-[220px] h-[42px] rounded-full"
            style={{
              background: isLight
                ? "radial-gradient(ellipse at center, rgba(58,46,125,0.36) 0%, rgba(58,46,125,0.14) 52%, transparent 78%)"
                : "radial-gradient(ellipse at center, rgba(0,0,0,0.65) 0%, rgba(174,218,45,0.12) 55%, transparent 80%)",
              boxShadow: isLight
                ? "0 8px 24px rgba(58,46,125,0.18)"
                : "0 8px 24px rgba(0,0,0,0.45)",
            }}
          />
        </div>
      </div>

      {/* =================================================================== */}
      {/* LAYER 1: Magic UI 3D Perspective Particles                          */}
      {/* =================================================================== */}
      <Floating3DParticles
        quantity={75}
        color={isLight ? "#5B46E5" : "#AEDA2D"}
        size={3.5}
        opacity={isLight ? 0.22 : 0.28}
        drift={paused ? 0 : 0.4}
        depth={0.65}
      />

      {/* =================================================================== */}
      {/* LAYER 2: React Bits 3D WebGL Ballpit (ZERO GRAVITY = Never Sinks!)  */}
      {/* =================================================================== */}
      <div className="absolute inset-0 z-10">
        <Ballpit
          count={20}
          colors={
            isLight
              ? ["#3B5BFF", "#F4C22C", "#8E69FF", "#F5F7FF", "#5F78FF"]
              : ["#AEDA2D", "#3B5BFF", "#F4C22C", "#8E69FF", "#283824"]
          }
          material="gloss"
          minSize={0.75}
          maxSize={1.65}
          gravity={0}
          friction={0.996}
          wallBounce={0.95}
          bounce={0.9}
          depth={3.2}
          drift={paused ? 0 : 0.9}
          followCursor={!paused}
          cursorSize={1.2}
          grab={!paused}
          clickEffect={paused ? "none" : "burst"}
          lightColor="#ffffff"
          lightIntensity={1.3}
          exposure={1.1}
          shadows={0.55}
          intro={true}
        />
      </div>

      {/* =================================================================== */}
      {/* LAYER 3: Centerpiece LottieFiles Mascot (Embedded inside 3D Scene!) */}
      {/* =================================================================== */}
      <div className="relative z-20 flex-1 flex items-center justify-center pointer-events-none px-4 pt-10 pb-6">
        <div
          style={{
            transform: `translate3d(${pointerOffset.x * 0.75 + focusTiltX}px, ${pointerOffset.y * 0.75}px, 0) scale(${focusScale})`,
            transition: "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)",
            filter:
              selectedPreset.renderMode === "clay-3d"
                ? "url(#lottie-3d-clay)"
                : selectedPreset.renderMode === "keyed-3d"
                  ? "url(#lottie-3d-key-white)"
                  : undefined,
          }}
          className={`relative flex items-center justify-center ${
            selectedPreset.renderMode === "portal-3d"
              ? "w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] rounded-full overflow-hidden shadow-[0_24px_54px_rgba(32,26,74,0.32),inset_0_2px_6px_rgba(255,255,255,0.65)] ring-4 ring-white/45"
              : "w-[270px] h-[270px] sm:w-[325px] sm:h-[325px]"
          }`}
        >
          {!lottieReady && !lottieError && (
            <div className="text-xs font-semibold opacity-75 animate-pulse">
              Memuat maskot 3D Lottie...
            </div>
          )}
          {lottieError && (
            <div className="text-xs font-semibold text-red-600 px-4 text-center">
              {lottieError}
            </div>
          )}
          <div
            ref={lottieContainerRef}
            aria-label={selectedPreset.caption}
            role="img"
            className="w-full h-full flex items-center justify-center"
          />
        </div>
      </div>

      {/* =================================================================== */}
      {/* LAYER 4: Foreground Overlapping 3D Shapes (Cradles the Mascot!)     */}
      {/* =================================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-25 overflow-hidden"
      >
        {/* Top-Center Translucent 3D Glass Bubble */}
        <div
          style={{
            transform: `translate3d(${pointerOffset.x * 1.1}px, ${pointerOffset.y * 1.1}px, 0)`,
            transition: "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
            background:
              "radial-gradient(circle at 30% 28%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.22) 38%, rgba(165,180,252,0.18) 72%, rgba(255,255,255,0.55) 100%)",
            boxShadow:
              "inset 0 2px 6px rgba(255,255,255,0.9), inset -6px -8px 16px rgba(79,70,229,0.18), 0 12px 24px rgba(24,25,29,0.12)",
          }}
          className="absolute top-[11%] left-[34%] w-[68px] h-[68px] sm:w-[82px] sm:h-[82px] rounded-full border border-white/60 backdrop-blur-[1.5px]"
        >
          <div className="absolute top-2.5 left-3.5 w-5 h-3 rounded-full bg-white/90 blur-[0.5px] -rotate-25" />
        </div>

        {/* Bottom-Left 3D Periwinkle Torus / Donut Shape */}
        <div
          style={{
            transform: `translate3d(${pointerOffset.x * 1.25}px, ${pointerOffset.y * 1.15}px, 0) rotate(-14deg)`,
            transition: "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
            background:
              "radial-gradient(circle at 35% 25%, #9DB0FF 0%, #5B73FF 48%, #3448C5 95%)",
            boxShadow:
              "inset -10px -12px 20px rgba(20,30,110,0.55), inset 6px 8px 14px rgba(255,255,255,0.55), 10px 18px 32px rgba(28,38,115,0.28)",
          }}
          className="absolute bottom-[12%] left-[4%] w-[72px] h-[118px] sm:w-[84px] sm:h-[136px] rounded-[48px] flex items-center justify-center"
        >
          <div
            className="w-[22px] h-[54px] rounded-full"
            style={{
              background: isLight ? "#CFD1DC" : "#151B14",
              boxShadow: "inset 4px 4px 10px rgba(0,0,0,0.38)",
            }}
          />
        </div>

        {/* Bottom-Center-Left 3D Golden-Yellow Organic Capsule */}
        <div
          style={{
            transform: `translate3d(${pointerOffset.x * 1.35}px, ${pointerOffset.y * 1.25}px, 0) rotate(-24deg)`,
            transition: "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
            background:
              "radial-gradient(circle at 34% 26%, #FFF5B8 0%, #F5C324 38%, #D99307 78%, #9B6100 100%)",
            boxShadow:
              "inset -12px -14px 24px rgba(110,64,0,0.48), inset 8px 10px 18px rgba(255,255,255,0.65), 8px 18px 32px rgba(80,50,0,0.25)",
          }}
          className="absolute -bottom-3 left-[21%] w-[94px] h-[126px] sm:w-[110px] sm:h-[144px] rounded-[56px]"
        >
          <div className="absolute top-4 left-5 w-7 h-4 rounded-full bg-white/65 blur-[1px] -rotate-12" />
        </div>

        {/* Bottom-Right Large Translucent 3D Glass Bubble (Overlaps Mascot Edge!) */}
        <div
          style={{
            transform: `translate3d(${pointerOffset.x * 1.4}px, ${pointerOffset.y * 1.3}px, 0)`,
            transition: "transform 200ms cubic-bezier(0.22, 1, 0.36, 1)",
            background:
              "radial-gradient(circle at 28% 26%, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.16) 42%, rgba(139,92,246,0.22) 78%, rgba(255,255,255,0.6) 100%)",
            boxShadow:
              "inset 0 3px 8px rgba(255,255,255,0.92), inset -10px -12px 24px rgba(88,28,135,0.22), 0 18px 36px rgba(24,25,29,0.18)",
          }}
          className="absolute bottom-[13%] right-[8%] w-[112px] h-[112px] sm:w-[138px] sm:h-[138px] rounded-full border border-white/65 backdrop-blur-[2px]"
        >
          <div className="absolute top-4 left-6 w-9 h-4 rounded-full bg-white/90 blur-[0.5px] -rotate-20" />
          <div className="absolute bottom-4 right-5 w-5 h-2.5 rounded-full bg-white/65 blur-[0.5px]" />
        </div>

        {/* Bottom-Right 3D Cobalt-Blue Beveled Prism */}
        <div
          style={{
            transform: `translate3d(${pointerOffset.x * 1.2}px, ${pointerOffset.y * 1.2}px, 0) rotate(22deg)`,
            transition: "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
            background:
              "linear-gradient(135deg, #6E89FF 0%, #314EE8 52%, #192B9E 100%)",
            boxShadow:
              "inset 3px 3px 8px rgba(255,255,255,0.5), inset -8px -8px 16px rgba(10,18,75,0.55), 0 14px 28px rgba(25,43,158,0.32)",
          }}
          className="absolute -bottom-4 right-[22%] w-[78px] h-[78px] sm:w-[92px] sm:h-[92px] rounded-[20px]"
        />
      </div>

      {/* =================================================================== */}
      {/* LAYER 5: Interactive Controls Overlay (Preset Tabs & Pause Button)  */}
      {/* =================================================================== */}
      <div className="relative z-30 p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-2">
        <div
          role="tablist"
          aria-label="Pilih animasi maskot Lottie"
          className={`inline-flex flex-wrap items-center gap-1 p-1 rounded-full backdrop-blur-md border ${
            isLight
              ? "bg-white/80 border-black/5 shadow-sm"
              : "bg-[#101510]/85 border-white/10"
          }`}
        >
          {MASCOT_PRESETS.map((preset) => {
            const active = preset.id === selectedPreset.id;
            return (
              <button
                key={preset.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedPreset(preset)}
                className={`px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-all min-h-[32px] ${
                  active
                    ? isLight
                      ? "bg-[#18191D] text-white shadow-sm"
                      : "bg-[#AEDA2D] text-[#111610]"
                    : isLight
                      ? "text-[#4E5159] hover:text-[#18191D] hover:bg-black/5"
                      : "text-[#A8AFA2] hover:text-white hover:bg-white/5"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Overlay: Asset Caption + Pause/Play Control */}
      <div className="relative z-30 p-3.5 sm:p-4 flex items-center justify-between gap-2">
        <span
          className={`px-3 py-1.5 rounded-full text-[11px] font-semibold backdrop-blur-md border ${
            isLight
              ? "bg-white/80 border-black/5 text-[#363940]"
              : "bg-[#101510]/85 border-white/10 text-[#C6CEC0]"
          }`}
        >
          {isSubmitting
            ? "Memverifikasi sesi..."
            : activeField === "password"
              ? showPassword
                ? "Maskot melihat sandi"
                : "Mode sandi aman"
              : activeField === "email" || activeField === "name"
                ? "Menyimak input..."
                : selectedPreset.caption}
        </span>

        <button
          type="button"
          onClick={onTogglePause}
          aria-label={paused ? "Putar animasi 3D" : "Jeda animasi 3D"}
          title={paused ? "Putar animasi 3D" : "Jeda animasi 3D"}
          className="w-11 h-11 rounded-full bg-[#4A4C52]/90 hover:bg-[#18191D] text-white flex items-center justify-center shadow-md backdrop-blur-md transition-all hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B5BFF]"
        >
          {paused ? (
            <Play className="w-4 h-4 fill-current ml-0.5" aria-hidden="true" />
          ) : (
            <Pause className="w-4 h-4 fill-current" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}
