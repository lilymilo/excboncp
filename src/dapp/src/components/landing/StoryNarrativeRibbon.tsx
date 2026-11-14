"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { StoryChapter } from "./types";

interface NarrativeRibbonProps {
  chapter: StoryChapter;
  chapterIndex: number;
}

export function StoryNarrativeRibbon({ chapter, chapterIndex }: NarrativeRibbonProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={chapter.id}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full"
      >
        {/* Badge row */}
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#AEDA2D]/12 border border-[#AEDA2D]/30 text-[0.65rem] font-mono text-[#AEDA2D] tracking-widest uppercase font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#AEDA2D] shadow-[0_0_6px_#AEDA2D] animate-pulse" />
            {chapter.badge}
          </span>
          <span className="text-[0.65rem] font-mono text-white/35 tracking-wide">
            {chapter.cameraInfo}
          </span>
        </div>

        {/* Title + subtitle row */}
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3 mb-2">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold tracking-tight text-white leading-tight">
            {chapter.title}
          </h2>
          <p className="text-xs sm:text-sm text-white/50 leading-relaxed sm:truncate sm:max-w-sm lg:max-w-md">
            {chapter.subtitle}
          </p>
        </div>

        {/* Narrative line */}
        <p className="text-xs sm:text-[0.8rem] text-white/55 leading-relaxed mb-3 max-w-2xl line-clamp-2">
          {chapter.narrative}
        </p>

        {/* Telemetry pills inline */}
        {chapter.telemetry && chapter.telemetry.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {chapter.telemetry.map((t, idx) => {
              const isVerified = t.status === "verified";
              const isWarning = t.status === "warning";
              return (
                <div
                  key={idx}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[0.68rem] font-mono border ${
                    isVerified
                      ? "bg-[#142317]/70 border-[#2b4d30]/80 text-[#8fcb97]"
                      : isWarning
                      ? "bg-[#291e0f]/70 border-[#533f1f]/80 text-[#ebd18a]"
                      : "bg-white/8 border-white/12 text-white/60"
                  }`}
                >
                  {isVerified && <CheckCircle2 className="w-3 h-3 text-[#64c975]" />}
                  {isWarning && <AlertTriangle className="w-3 h-3 text-[#dca034]" />}
                  {!isVerified && !isWarning && <ShieldCheck className="w-3 h-3 text-white/40" />}
                  <span className="text-white/35">{t.label}:</span>
                  <span className="font-semibold text-white/80">{t.value}</span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
