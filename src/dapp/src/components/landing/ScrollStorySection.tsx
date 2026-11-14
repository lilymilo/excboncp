"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { FastForward, Volume2, VolumeX } from "lucide-react";
import { STORY_CHAPTERS } from "./story-data";
import { StoryNarrativeRibbon } from "./StoryNarrativeRibbon";
import { StoryTimelineNav } from "./StoryTimelineNav";
import { StoryCtaOverlay } from "./StoryCtaOverlay";
import { StoryHotspots } from "./StoryHotspots";
import { EarthGlobe } from "./EarthGlobe";
import Image from "next/image";

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
      className="relative w-full h-[600vh] bg-[#010409] select-none"
    >
      {/* Sticky full-viewport stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">

        {/* ── Visual Layer Stack ───────────────────────────────────── */}
        <div className="absolute inset-0 w-full h-full">

          {/* Chapter 0: Interactive Earth Globe */}
          <ChapterEarthLayer scrollYProgress={scrollYProgress} />

          {/* Chapters 1-5: photographic keyframes (pure visual, never intercepts mouse events) */}
          {STORY_CHAPTERS.slice(1).map((ch, i) => (
            <StoryLayer
              key={ch.id}
              chapterIndex={i + 1}
              image={ch.image}
              totalChapters={STORY_CHAPTERS.length}
              scrollYProgress={scrollYProgress}
            />
          ))}

          {/* Top atmospheric gradient — enhances navbar contrast */}
          <div
            aria-hidden="true"
            className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#010409]/80 via-[#010409]/40 to-transparent z-20 pointer-events-none"
          />

          {/* Bottom gradient ramp — gives strong contrast backing to narrative text */}
          <div
            aria-hidden="true"
            className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-[#010409]/95 via-[#010409]/65 to-transparent z-20 pointer-events-none"
          />
        </div>

        {/* ── Interactive Hotspots ─────────────────────────────────── */}
        {STORY_CHAPTERS.map((ch, idx) => (
          <StoryHotspots
            key={`hotspot-${ch.id}`}
            hotspots={ch.hotspots || []}
            isVisible={idx === activeChapterIndex}
          />
        ))}

        {/* ── Top HUD strip (Audio toggle & Skip button only — Scene tags removed) ── */}
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
                onClick={() => handleSelectChapter(STORY_CHAPTERS.length - 1)}
                className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/12 hover:border-[#AEDA2D]/40 hover:bg-white/10 text-[0.72rem] font-medium text-white/70 hover:text-[#AEDA2D] transition-all backdrop-blur-md shadow-lg cursor-pointer"
              >
                <span>Ke Babak Akhir</span>
                <FastForward className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── Bottom content area ──────────────────────────────────── */}
        <div className="absolute bottom-0 inset-x-0 z-30 pointer-events-none">

          {/* Chapter 5 (CTA finale): full-width centered overlay with zero overlap from timeline nav */}
          {activeChapterIndex === 5 && (
            <div className="flex justify-center pb-6 sm:pb-8 px-4 pointer-events-auto">
              <StoryCtaOverlay isVisible={activeChapterIndex === 5} />
            </div>
          )}

          {/* Chapters 0-4: bottom narrative ribbon + right timeline nav */}
          {activeChapterIndex < 5 && (
            <div className="flex items-end justify-between px-5 sm:px-10 pb-8 sm:pb-10 gap-6">
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
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Chapter 0: Earth globe with scroll-driven fade-out ──────────────────────
function ChapterEarthLayer({ scrollYProgress }: { scrollYProgress: any }) {
  const step = 1 / (STORY_CHAPTERS.length - 1);
  const opacity = useTransform(
    scrollYProgress,
    [0, step * 0.35, step * 0.85],
    [1, 1, 0]
  );
  const scale = useTransform(scrollYProgress, [0, step * 0.85], [1, 1.04]);

  return (
    <motion.div
      style={{ opacity, scale }}
      className="absolute inset-0 w-full h-full transform-gpu will-change-transform pointer-events-auto z-10"
    >
      <EarthGlobe />
    </motion.div>
  );
}

// ─── Chapters 1-5: photographic layers ──────────────────────────────────────
function StoryLayer({
  chapterIndex,
  image,
  totalChapters,
  scrollYProgress,
}: {
  chapterIndex: number;
  image: string;
  totalChapters: number;
  scrollYProgress: any;
}) {
  const step = 1 / (totalChapters - 1);
  const center = chapterIndex * step;

  const fadeInStart = Math.max(0, center - step * 0.85);
  const fadeOutEnd = Math.min(1, center + step * 0.85);

  let inputRanges: number[];
  let outputOpacities: number[];

  if (chapterIndex === totalChapters - 1) {
    inputRanges = [fadeInStart, center - step * 0.35, 1];
    outputOpacities = [0, 1, 1];
  } else {
    inputRanges = [fadeInStart, center - step * 0.3, center + step * 0.3, fadeOutEnd];
    outputOpacities = [0, 1, 1, 0];
  }

  const opacity = useTransform(scrollYProgress, inputRanges, outputOpacities);

  // Cinematic parallax: subtle Y drift as layer transitions
  const y = useTransform(
    scrollYProgress,
    [fadeInStart, center, fadeOutEnd],
    ["3%", "0%", "-3%"]
  );

  const scale = useTransform(
    scrollYProgress,
    [fadeInStart, center, fadeOutEnd],
    [1.04, 1.07, 1.11]
  );

  return (
    <motion.div
      style={{ opacity, scale, y }}
      className="absolute inset-0 w-full h-full transform-gpu will-change-transform pointer-events-none"
    >
      <Image
        src={image}
        alt={`Keyframe scene ${chapterIndex + 1}`}
        fill
        priority={chapterIndex <= 2}
        sizes="100vw"
        className="object-cover object-center pointer-events-none select-none"
      />
    </motion.div>
  );
}
