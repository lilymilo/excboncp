"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { FastForward, Volume2, VolumeX } from "lucide-react";
import { STORY_CHAPTERS } from "./story-data";
import { StoryCard } from "./StoryCard";
import { StoryTimelineNav } from "./StoryTimelineNav";
import { StoryCtaOverlay } from "./StoryCtaOverlay";
import { StoryHotspots } from "./StoryHotspots";

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
    if (latest >= 0.88) {
      nextIndex = 5;
    } else if (latest >= 0.70) {
      nextIndex = 4;
    } else if (latest >= 0.52) {
      nextIndex = 3;
    } else if (latest >= 0.34) {
      nextIndex = 2;
    } else if (latest >= 0.16) {
      nextIndex = 1;
    } else {
      nextIndex = 0;
    }

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

    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  };

  const handleSkipAnimation = () => {
    handleSelectChapter(STORY_CHAPTERS.length - 1);
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[600vh] bg-[#070b08] select-none"
    >
      {/* Sticky Stage Container (Full-bleed 100vh viewport) */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        {/* Layered Keyframe Images — Full visual prominence, no obscuring black masks */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          {STORY_CHAPTERS.map((ch, idx) => (
            <StoryLayer
              key={ch.id}
              chapterIndex={idx}
              image={ch.image}
              totalChapters={STORY_CHAPTERS.length}
              scrollYProgress={scrollYProgress}
            />
          ))}

          {/* Minimal Top Atmospheric Vignette (purely for navbar contrast) */}
          <div
            aria-hidden="true"
            className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#070b08]/60 to-transparent z-10 pointer-events-none"
          />
        </div>

        {/* Interactive Hotspots for the active chapter (e.g. Orangutan, IoT Node, Archipelago) */}
        {STORY_CHAPTERS.map((ch, idx) => (
          <StoryHotspots
            key={`hotspot-${ch.id}`}
            hotspots={ch.hotspots || []}
            isVisible={idx === activeChapterIndex}
          />
        ))}

        {/* Top Control Strip */}
        <div className="relative z-30 pt-20 sm:pt-24 px-4 sm:px-8 flex items-center justify-between pointer-events-none">
          {/* Chapter indicator */}
          <div className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0c130d]/80 border border-white/12 backdrop-blur-md text-[0.72rem] font-mono text-[#AEDA2D] shadow-md">
            <span className="w-2 h-2 rounded-full bg-[#AEDA2D] animate-ping" />
            <span className="font-semibold">
              SCENE {activeChapterIndex + 1} OF {STORY_CHAPTERS.length}
            </span>
          </div>

          <div className="pointer-events-auto flex items-center gap-2.5">
            {/* Audio Toggle */}
            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              title={isAudioMuted ? "Bunyikan Ambiance Rimba" : "Bisukan Ambiance"}
              className="p-2 rounded-full bg-[#0c130d]/80 border border-white/12 text-[#AEDA2D] hover:bg-[#162215] transition-colors backdrop-blur-md shadow-md cursor-pointer"
            >
              {isAudioMuted ? (
                <VolumeX className="w-4 h-4 text-[#84947d]" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#AEDA2D] animate-pulse" />
              )}
            </button>

            {/* Skip to final chapter CTA */}
            {activeChapterIndex < 5 && (
              <button
                onClick={handleSkipAnimation}
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0c130d]/80 border border-white/12 hover:border-[#AEDA2D]/50 hover:bg-[#162215] text-[0.72rem] font-medium text-[#C8D4BF] hover:text-[#AEDA2D] transition-all backdrop-blur-md shadow-md cursor-pointer"
              >
                <span>Ke Babak Akhir &amp; CTA</span>
                <FastForward className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
          </div>
        </div>

        {/* Story Narrative & Navigation Area */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 pb-6 sm:pb-10 flex items-end justify-between">
          {/* Chapters 0-4: Left-aligned narrative card leaving right side visually free */}
          {activeChapterIndex < 5 ? (
            <div className="w-full max-w-lg">
              <StoryCard
                chapter={STORY_CHAPTERS[activeChapterIndex]}
                isActive={activeChapterIndex < 5}
              />
            </div>
          ) : (
            /* Chapter 5: Grand Finale Center-staged CTA */
            <div className="w-full flex justify-center">
              <StoryCtaOverlay isVisible={activeChapterIndex === 5} />
            </div>
          )}

          {/* Right-side timeline navigation dots */}
          <StoryTimelineNav
            chapters={STORY_CHAPTERS}
            activeChapterIndex={activeChapterIndex}
            onSelectChapter={handleSelectChapter}
            scrollProgress={currentProgress}
          />
        </div>
      </div>
    </section>
  );
}

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

  const fadeInStart = Math.max(0, center - step * 0.7);
  const fadeOutEnd = Math.min(1, center + step * 0.7);

  let inputRanges: number[];
  let outputOpacities: number[];

  if (chapterIndex === 0) {
    inputRanges = [0, center + step * 0.35, fadeOutEnd];
    outputOpacities = [1, 1, 0];
  } else if (chapterIndex === totalChapters - 1) {
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
    [1.03, 1.07, 1.12]
  );

  return (
    <motion.div
      style={{
        opacity,
        scale,
      }}
      className="absolute inset-0 w-full h-full transform-gpu will-change-transform will-change-opacity"
    >
      <Image
        src={image}
        alt={`Keyframe ${chapterIndex + 1}`}
        fill
        priority={chapterIndex < 2}
        sizes="100vw"
        className="object-cover object-center"
      />
    </motion.div>
  );
}
