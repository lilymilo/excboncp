"use client";

import { StoryChapter } from "./types";

interface StoryTimelineNavProps {
  chapters: StoryChapter[];
  activeChapterIndex: number;
  onSelectChapter: (index: number) => void;
  scrollProgress: number;
}

export function StoryTimelineNav({
  chapters,
  activeChapterIndex,
  onSelectChapter,
  scrollProgress,
}: StoryTimelineNavProps) {
  return (
    <nav
      aria-label="Navigasi Cerita"
      className="hidden md:flex flex-col items-end gap-3 z-30 pointer-events-auto"
    >
      {/* Chapter Steps */}
      <div className="flex flex-col gap-2.5 p-2 rounded-2xl bg-[#0c130d]/80 border border-[#223321]/80 backdrop-blur-md shadow-lg">
        {chapters.map((ch, idx) => {
          const isActive = idx === activeChapterIndex;
          return (
            <button
              key={ch.id}
              onClick={() => onSelectChapter(idx)}
              className="group relative flex items-center gap-2.5 px-2 py-1 rounded-lg text-left transition-colors hover:bg-white/5"
            >
              {/* Tooltip Label */}
              <span
                className={`text-[0.68rem] font-mono tracking-wider transition-all duration-200 ${
                  isActive
                    ? "opacity-100 text-[#AEDA2D] font-semibold translate-x-0"
                    : "opacity-0 group-hover:opacity-100 text-[#85947d] translate-x-1"
                }`}
              >
                {ch.title.split(",")[0]}
              </span>

              {/* Indicator Dot */}
              <div
                className={`relative flex items-center justify-center transition-all duration-300 ${
                  isActive ? "w-5 h-5" : "w-3 h-3"
                }`}
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-full bg-[#AEDA2D]/25 animate-ping" />
                )}
                <span
                  className={`rounded-full transition-all duration-200 ${
                    isActive
                      ? "w-3 h-3 bg-[#AEDA2D] shadow-[0_0_10px_#AEDA2D]"
                      : "w-2 h-2 bg-[#31442d] group-hover:bg-[#5b7554]"
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Progress Counter Pill */}
      <div className="px-2.5 py-1 rounded-full bg-[#0c130d]/80 border border-[#223321]/80 text-[0.68rem] font-mono text-[#85947d] backdrop-blur-md">
        <span>Story Progress: </span>
        <span className="text-[#AEDA2D] font-semibold">
          {Math.min(100, Math.round(scrollProgress * 100))}%
        </span>
      </div>
    </nav>
  );
}
