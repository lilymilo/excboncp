"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { FastForward, Volume2, VolumeX } from "lucide-react";
import { STORY_CHAPTERS } from "./story-data";
import { StoryCard } from "./StoryCard";
import { StoryTimelineNav } from "./StoryTimelineNav";
import { StoryCtaOverlay } from "./StoryCtaOverlay";

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
    // 6 chapters partitioned across 0..1
    // 0: [0.00, 0.17), 1: [0.17, 0.35), 2: [0.35, 0.53), 3: [0.53, 0.71), 4: [0.71, 0.88), 5: [0.88, 1.00]
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

  // Smooth scroll to chapter index
  const handleSelectChapter = (index: number) => {
    if (!containerRef.current) return;
    const containerTop = containerRef.current.offsetTop;
    const containerHeight = containerRef.current.offsetHeight;
    const viewportHeight = window.innerHeight;
    const maxScroll = containerHeight - viewportHeight;
    const targetScroll = containerTop + (index / (STORY_CHAPTERS.length - 1)) * maxScroll;

    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  };

  // Skip animation completely
  const handleSkipAnimation = () => {
    if (!containerRef.current) return;
    const containerBottom =
      containerRef.current.offsetTop + containerRef.current.offsetHeight;
    window.scrollTo({
      top: containerBottom,
      behavior: "smooth",
    });
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[600vh] bg-[#070b08] select-none"
    >
      {/* Sticky Stage Container (Fixed 100vh viewport) */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        {/* Layered Keyframe Images with Cross-fading and Ken Burns zoom */}
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

          {/* Top Atmospheric Gradient (ensures Navbar text remains clear) */}
          <div
            aria-hidden="true"
            className="absolute top-0 inset-x-0 h-36 bg-gradient-to-b from-[#070b08]/90 via-[#070b08]/50 to-transparent z-10 pointer-events-none"
          />

          {/* Bottom Grounding Vignette (provides high contrast for narrative cards) */}
          <div
            aria-hidden="true"
            className="absolute bottom-0 inset-x-0 h-[460px] bg-gradient-to-t from-[#070b08] via-[#070b08]/80 to-transparent z-10 pointer-events-none"
          />
        </div>

        {/* Floating Quick Action Bar (Top Right below Navbar) */}
        <div className="relative z-30 pt-24 sm:pt-28 px-4 sm:px-8 flex items-center justify-between pointer-events-none">
          {/* Chapter indicator pill */}
          <div className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0c130d]/80 border border-[#233321]/80 backdrop-blur-md text-[0.72rem] font-mono text-[#AEDA2D] shadow-md">
            <span className="w-2 h-2 rounded-full bg-[#AEDA2D] animate-ping" />
            <span className="font-semibold">
              SCENE {activeChapterIndex + 1} OF {STORY_CHAPTERS.length}
            </span>
          </div>

          <div className="pointer-events-auto flex items-center gap-2.5">
            {/* Audio Toggle button */}
            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              title={isAudioMuted ? "Bunyikan Audio Rimba" : "Bisukan Audio"}
              className="p-2 rounded-full bg-[#0c130d]/80 border border-[#233321]/80 text-[#AEDA2D] hover:bg-[#162215] transition-colors backdrop-blur-md shadow-md"
            >
              {isAudioMuted ? (
                <VolumeX className="w-4 h-4 text-[#84947d]" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#AEDA2D] animate-pulse" />
              )}
            </button>

            {/* Skip Story Button */}
            <button
              onClick={handleSkipAnimation}
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0c130d]/80 border border-[#233321]/80 hover:border-[#AEDA2D]/50 hover:bg-[#162215] text-[0.72rem] font-medium text-[#C8D4BF] hover:text-[#AEDA2D] transition-all backdrop-blur-md shadow-md cursor-pointer"
            >
              <span>Lewati Animasi</span>
              <FastForward className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        {/* Story Content & Timeline Navigation Area */}
        <div className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 pb-8 sm:pb-12 flex items-end justify-between gap-6">
          {/* Story Card or Final Scene CTA Overlay */}
          <div className="w-full flex justify-center">
            {activeChapterIndex === 5 ? (
              <StoryCtaOverlay
                isVisible={activeChapterIndex === 5}
                onExploreMore={handleSkipAnimation}
              />
            ) : (
              <StoryCard
                chapter={STORY_CHAPTERS[activeChapterIndex]}
                isActive={activeChapterIndex < 5}
              />
            )}
          </div>

          {/* Interactive Right-side Scrubber Dots */}
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

// Sub-component for individual layer transforms
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

  // Opacity window: fade in before center, fade out after center
  const fadeInStart = Math.max(0, center - step * 0.7);
  const fadeOutEnd = Math.min(1, center + step * 0.7);

  // If first image (index 0), it starts fully visible at scroll 0
  // If last image (index 5), it stays fully visible at scroll 1
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

  // Ken-Burns subtle zoom (1.04 to 1.14)
  const scale = useTransform(
    scrollYProgress,
    [fadeInStart, center, fadeOutEnd],
    [1.04, 1.09, 1.15]
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
