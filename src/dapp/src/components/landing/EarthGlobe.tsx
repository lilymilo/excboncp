"use client";

import dynamic from "next/dynamic";

const Globe3DDemo = dynamic(() => import("@/components/3d-globe-demo"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 rounded-full border-2 border-[#AEDA2D]/30 border-t-[#AEDA2D] animate-spin" />
      <span className="text-[0.72rem] font-mono text-white/50 tracking-wider">
        MEMUAT MODEL 3D BUMI...
      </span>
    </div>
  ),
});

export function EarthGlobe() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#010409] overflow-hidden">
      {/* Deep space radial glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(20,55,30,0.25) 0%, rgba(10,25,18,0.1) 50%, transparent 100%)",
        }}
      />

      {/* 3D Globe from @aceternity/3d-globe-demo */}
      <div className="relative w-full h-full flex items-center justify-center">
        <Globe3DDemo className="w-full h-full min-h-[500px] max-h-[85vh]" />

        {/* Interaction Hint */}
        <div
          className="absolute bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 pointer-events-none z-10"
          style={{ animation: "fadeOut 1s ease 4s forwards" }}
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/15 backdrop-blur-md text-[0.72rem] font-medium text-white/80 shadow-lg whitespace-nowrap">
            <svg
              className="w-3.5 h-3.5 text-[#AEDA2D] opacity-80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M5 9l-3 3 3 3M19 9l3 3-3 3M9 5l3-3 3 3M9 19l3 3 3-3" />
            </svg>
            Drag untuk memutar Bumi secara interaktif dalam 3D
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeOut {
          to {
            opacity: 0;
            visibility: hidden;
          }
        }
      `}</style>
    </div>
  );
}
