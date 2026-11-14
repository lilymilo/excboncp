"use client";

import { motion } from "framer-motion";
import { Compass, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { StoryChapter } from "./types";

interface StoryCardProps {
  chapter: StoryChapter;
  isActive: boolean;
}

export function StoryCard({ chapter, isActive }: StoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{
        opacity: isActive ? 1 : 0,
        y: isActive ? 0 : 20,
        scale: isActive ? 1 : 0.97,
        pointerEvents: isActive ? "auto" : "none",
      }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-xl mx-auto rounded-2xl bg-[#0c130d]/88 border border-[#233121]/90 p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl relative overflow-hidden"
    >
      {/* Ambient Botanical Glass Accent */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#AEDA2D]/12 to-transparent rounded-full blur-2xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-[#1f4d2e]/20 to-transparent rounded-full blur-xl pointer-events-none"
      />

      {/* Header Eyebrow & Camera Info */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#162215]/90 border border-[#2b3e28] text-[0.68rem] font-mono text-[#AEDA2D] tracking-wider uppercase font-semibold shadow-inner">
          <span className="w-1.5 h-1.5 rounded-full bg-[#AEDA2D] shadow-[0_0_8px_#AEDA2D] animate-pulse" />
          <span>{chapter.badge}</span>
        </div>

        <div className="flex items-center gap-1.5 text-[0.68rem] font-mono text-[#798871]">
          <Compass className="w-3.5 h-3.5 text-[#5e7057]" />
          <span>{chapter.cameraInfo}</span>
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="relative z-10">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium tracking-tight text-[#F0F2EC] leading-tight">
          {chapter.title}
        </h2>
        <p className="mt-2 text-xs sm:text-sm font-medium text-[#C8D4BF] leading-relaxed">
          {chapter.subtitle}
        </p>
      </div>

      {/* Narrative Prose */}
      <p className="relative z-10 mt-3 text-xs sm:text-[0.875rem] text-[#93A18B] leading-relaxed">
        {chapter.narrative}
      </p>

      {/* Live Telemetry Pill Strip */}
      {chapter.telemetry && chapter.telemetry.length > 0 && (
        <div className="relative z-10 mt-4 pt-3.5 border-t border-[#1c2819] flex flex-wrap gap-2">
          {chapter.telemetry.map((t, idx) => {
            const isVerified = t.status === "verified";
            const isWarning = t.status === "warning";
            return (
              <div
                key={idx}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[0.7rem] font-mono border ${
                  isVerified
                    ? "bg-[#142317]/80 border-[#2b4d30] text-[#8fcb97]"
                    : isWarning
                    ? "bg-[#291e0f]/80 border-[#533f1f] text-[#ebd18a]"
                    : "bg-[#111912]/80 border-[#223321] text-[#b6c5af]"
                }`}
              >
                {isVerified && <CheckCircle2 className="w-3 h-3 text-[#64c975]" />}
                {isWarning && <AlertTriangle className="w-3 h-3 text-[#dca034]" />}
                {!isVerified && !isWarning && <ShieldCheck className="w-3 h-3 text-[#779271]" />}
                <span className="text-[#72826a]">{t.label}:</span>
                <span className="font-semibold text-white/90">{t.value}</span>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
