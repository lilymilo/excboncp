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
}: StoryTimelineNavProps) {
  return (
    <nav
      aria-label="Navigasi Cerita"
      className="hidden md:flex flex-col items-center gap-2 z-30 pointer-events-auto p-2 rounded-full bg-[#070d08]/70 border border-white/10 backdrop-blur-md shadow-lg"
    >
      {chapters.map((ch, idx) => {
        const isActive = idx === activeChapterIndex;
        return (
          <button
            key={ch.id}
            onClick={() => onSelectChapter(idx)}
            title={ch.title}
            className="group relative flex items-center justify-center p-1.5 rounded-full transition-transform hover:scale-125 focus:outline-none cursor-pointer"
          >
            <div
              className={`relative flex items-center justify-center transition-all duration-300 ${
                isActive ? "w-4 h-4" : "w-2.5 h-2.5"
              }`}
            >
              {isActive && (
                <span className="absolute inset-0 rounded-full bg-[#AEDA2D]/35 animate-ping" />
              )}
              <span
                className={`rounded-full transition-all duration-200 ${
                  isActive
                    ? "w-3 h-3 bg-[#AEDA2D] shadow-[0_0_12px_#AEDA2D]"
                    : "w-2 h-2 bg-[#31442d] group-hover:bg-[#AEDA2D]/70"
                }`}
              />
            </div>
          </button>
        );
      })}
    </nav>
  );
}
