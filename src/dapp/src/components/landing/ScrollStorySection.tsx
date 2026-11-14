"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { FastForward, Volume2, VolumeX } from "lucide-react";
import { STORY_CHAPTERS } from "./story-data";
import { StoryNarrativeRibbon } from "./StoryNarrativeRibbon";
import { StoryTimelineNav } from "./StoryTimelineNav";
import { EarthGlobe } from "./EarthGlobe";
import { AtmosphereStage } from "./AtmosphereStage";
import { NusantaraMapStage } from "./NusantaraMapStage";
import { CanopyBiomassStage } from "./CanopyBiomassStage";
import { IotHardwareStage } from "./IotHardwareStage";
import { ClosingEcosystemStage } from "./ClosingEcosystemStage";

export function ScrollStorySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(true);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setCurrentProgress(latest);
    let nextIndex = 0;
    if (latest >= 0.88) nextIndex = 5;
    else if (latest >= 0.70) nextIndex = 4;
    else if (latest >= 0.52) nextIndex = 3;
    else if (latest >= 0.34) nextIndex = 2;
    else if (latest >= 0.16) nextIndex = 1;
    else nextIndex = 0;

    if (nextIndex !== activeChapterIndex) {
      setActiveChapterIndex(nextIndex);
    }
  });

  const handleSelectChapter = (index: number) => {
    if (!containerRef.current) return;
    const containerTop = containerRef.current.offsetTop;
    const containerHeight = containerRef.current.offsetHeight;
    const viewportHeight = window.innerHeight;
    const maxScroll = containerHeight - viewportHeight;
    const targetScroll =
      containerTop + (index / (STORY_CHAPTERS.length - 1)) * maxScroll;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[600vh] bg-[#010408] select-none"
    >
      {/* Sticky full-viewport stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">

        {/* ── 6 Interactive Diorama Stages (No static JPG/PNG images) ── */}
        <div className="absolute inset-0 w-full h-full">

          {/* Stage 0: 3D Global Perspective (Orbit Bumi) */}
          <StageContainer
            index={0}
            total={6}
            activeIndex={activeChapterIndex}
            scrollYProgress={scrollYProgress}
          >
            <EarthGlobe />
          </StageContainer>

          {/* Stage 1: Penetrasi Atmosfer & Sensor Iklim */}
          <StageContainer
            index={1}
            total={6}
            activeIndex={activeChapterIndex}
            scrollYProgress={scrollYProgress}
          >
            <AtmosphereStage />
          </StageContainer>

          {/* Stage 2: Nusantara Geospatial Sentinel & Poligon Hutan */}
          <StageContainer
            index={2}
            total={6}
            activeIndex={activeChapterIndex}
            scrollYProgress={scrollYProgress}
          >
            <NusantaraMapStage />
          </StageContainer>

          {/* Stage 3: Kanopi Rimba & Arsitektur Biomassa */}
          <StageContainer
            index={3}
            total={6}
            activeIndex={activeChapterIndex}
            scrollYProgress={scrollYProgress}
          >
            <CanopyBiomassStage />
          </StageContainer>

          {/* Stage 4: Simbiosis Satwa & Sensor Edge IoT */}
          <StageContainer
            index={4}
            total={6}
            activeIndex={activeChapterIndex}
            scrollYProgress={scrollYProgress}
          >
            <IotHardwareStage />
          </StageContainer>

          {/* Stage 5: Ekosistem ExcbonCP & Pasar Karbon DEX */}
          <StageContainer
            index={5}
            total={6}
            activeIndex={activeChapterIndex}
            scrollYProgress={scrollYProgress}
          >
            <ClosingEcosystemStage />
          </StageContainer>

          {/* Top atmospheric vignette */}
          <div
            aria-hidden="true"
            className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#010408]/80 via-[#010408]/30 to-transparent z-20 pointer-events-none"
          />

          {/* Bottom vignette */}
          <div
            aria-hidden="true"
            className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#010408]/90 via-[#010408]/40 to-transparent z-20 pointer-events-none"
          />
        </div>

        {/* ── Top Control Bar (Clean: Audio toggle & Skip to CTA only) ── */}
        <div className="absolute top-0 inset-x-0 z-30 pt-20 sm:pt-24 px-5 sm:px-10 flex items-center justify-end pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2.5">
            {/* Audio toggle */}
            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              title={isAudioMuted ? "Bunyikan Ambiance Rimba" : "Bisukan Ambiance"}
              className="p-2.5 rounded-full bg-black/60 border border-white/12 hover:bg-white/10 transition-colors backdrop-blur-md shadow-lg cursor-pointer"
            >
              {isAudioMuted ? (
                <VolumeX className="w-4 h-4 text-white/50" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#AEDA2D] animate-pulse" />
              )}
            </button>

            {/* Skip to CTA */}
            {activeChapterIndex < 5 && (
              <button
                onClick={() => handleSelectChapter(5)}
                className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/12 hover:border-[#AEDA2D]/40 hover:bg-white/10 text-[0.72rem] font-medium text-white/70 hover:text-[#AEDA2D] transition-all backdrop-blur-md shadow-lg cursor-pointer"
              >
                <span>Ke Babak Akhir</span>
                <FastForward className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── Bottom Narrative Ribbon & Timeline Navigation (Chapters 0-4 only) ── */}
        {activeChapterIndex < 5 && (
          <div className="absolute bottom-0 inset-x-0 z-30 pointer-events-none">
            <div className="flex items-end justify-between px-5 sm:px-10 pb-7 sm:pb-9 gap-6">
              {/* Narrative ribbon — left/center */}
              <div className="flex-1 min-w-0 max-w-2xl pointer-events-auto">
                <StoryNarrativeRibbon
                  chapter={STORY_CHAPTERS[activeChapterIndex]}
                  chapterIndex={activeChapterIndex}
                />
              </div>

              {/* Minimal vertical timeline nav dots — right edge */}
              <div className="flex-shrink-0 pointer-events-auto mb-2">
                <StoryTimelineNav
                  chapters={STORY_CHAPTERS}
                  activeChapterIndex={activeChapterIndex}
                  onSelectChapter={handleSelectChapter}
                  scrollProgress={currentProgress}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Stage Container with Scroll-Driven Fade & Parallax ──────────────────────
function StageContainer({
  index,
  total,
  activeIndex,
  scrollYProgress,
  children,
}: {
  index: number;
  total: number;
  activeIndex: number;
  scrollYProgress: any;
  children: React.ReactNode;
}) {
  const step = 1 / (total - 1);
  const center = index * step;
  const fadeInStart = Math.max(0, center - step * 0.8);
  const fadeOutEnd = Math.min(1, center + step * 0.8);

  let inputRanges: number[];
  let outputOpacities: number[];

  if (index === 0) {
    inputRanges = [0, center + step * 0.35, fadeOutEnd];
    outputOpacities = [1, 1, 0];
  } else if (index === total - 1) {
    inputRanges = [fadeInStart, center - step * 0.35, 1];
    outputOpacities = [0, 1, 1];
  } else {
    inputRanges = [fadeInStart, center - step * 0.3, center + step * 0.3, fadeOutEnd];
    outputOpacities = [0, 1, 1, 0];
  }

  const opacity = useTransform(scrollYProgress, inputRanges, outputOpacities);
  const scale = useTransform(
    scrollYProgress,
    [fadeInStart, center, fadeOutEnd],
    [0.98, 1, 1.02]
  );
  const y = useTransform(
    scrollYProgress,
    [fadeInStart, center, fadeOutEnd],
    ["2%", "0%", "-2%"]
  );

  const isCurrent = activeIndex === index;

  return (
    <motion.div
      style={{
        opacity,
        scale,
        y,
        pointerEvents: isCurrent ? "auto" : "none",
        zIndex: isCurrent ? 15 : index,
      }}
      className="absolute inset-0 w-full h-full transform-gpu will-change-transform will-change-opacity overflow-hidden"
    >
      {children}
    </motion.div>
  );
}
