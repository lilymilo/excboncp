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
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full pointer-events-auto rounded-2xl bg-[#060c07]/88 border border-white/12 backdrop-blur-xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
      >
        {/* Title + subtitle row */}
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3 mb-2">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold tracking-tight text-white leading-tight drop-shadow-sm">
            {chapter.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#D4DEC9] leading-relaxed sm:truncate sm:max-w-sm lg:max-w-md font-medium">
            {chapter.subtitle}
          </p>
        </div>

        {/* Narrative line */}
        <p className="text-xs sm:text-[0.84rem] text-[#B5C4B0] leading-relaxed mb-3 max-w-2xl line-clamp-2">
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
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[0.7rem] font-mono border ${
                    isVerified
                      ? "bg-[#142317]/85 border-[#2b4d30] text-[#8fcb97]"
                      : isWarning
                      ? "bg-[#291e0f]/85 border-[#533f1f] text-[#ebd18a]"
                      : "bg-[#0d160e]/85 border-[#243522] text-[#c2d1bd]"
                  }`}
                >
                  {isVerified && <CheckCircle2 className="w-3 h-3 text-[#64c975]" />}
                  {isWarning && <AlertTriangle className="w-3 h-3 text-[#dca034]" />}
                  {!isVerified && !isWarning && <ShieldCheck className="w-3 h-3 text-[#799273]" />}
                  <span className="text-[#899c83]">{t.label}:</span>
                  <span className="font-semibold text-white">{t.value}</span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
