"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Heart, Trees, MapPin } from "lucide-react";

export interface HotspotItem {
  id: string;
  x: string; // percentage from left, e.g. "45%"
  y: string; // percentage from top, e.g. "50%"
  title: string;
  subtitle: string;
  icon?: "heart" | "cpu" | "trees" | "pin";
  color?: string; // e.g. "#AEDA2D"
}

interface StoryHotspotsProps {
  hotspots: HotspotItem[];
  isVisible: boolean;
}

export function StoryHotspots({ hotspots, isVisible }: StoryHotspotsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  if (!isVisible || !hotspots || hotspots.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-25 overflow-hidden">
      {hotspots.map((item) => {
        const isHovered = activeId === item.id;
        const color = item.color || "#AEDA2D";

        return (
          <div
            key={item.id}
            style={{ left: item.x, top: item.y }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          >
            {/* Interactive Pulse Pin */}
            <button
              onClick={() => setActiveId(isHovered ? null : item.id)}
              onMouseEnter={() => setActiveId(item.id)}
              onMouseLeave={() => setActiveId(null)}
              className="group relative flex items-center justify-center p-2 cursor-pointer focus:outline-none"
              aria-label={item.title}
            >
              {/* Pulsing Ripple Rings */}
              <span
                style={{ backgroundColor: color }}
                className="absolute w-8 h-8 rounded-full opacity-35 animate-ping"
              />
              <span
                style={{ backgroundColor: color }}
                className="absolute w-5 h-5 rounded-full opacity-60"
              />
              <span className="relative w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] flex items-center justify-center">
                <span
                  style={{ backgroundColor: color }}
                  className="w-2 h-2 rounded-full"
                />
              </span>

              {/* Always-on compact tag for quick recognition */}
              <div className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0c130d]/85 border border-white/20 backdrop-blur-md shadow-lg transition-transform group-hover:scale-105">
                {item.icon === "heart" && <Heart className="w-3 h-3 text-[#ff6b6b]" />}
                {item.icon === "cpu" && <Cpu className="w-3 h-3 text-[#AEDA2D]" />}
                {item.icon === "trees" && <Trees className="w-3 h-3 text-[#64c975]" />}
                {(!item.icon || item.icon === "pin") && (
                  <MapPin className="w-3 h-3 text-[#AEDA2D]" />
                )}
                <span className="text-[0.68rem] font-semibold text-white/95">
                  {item.title}
                </span>
              </div>
            </button>

            {/* Expanded Detailed Popover Tooltip */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-1/2 bottom-full mb-3 -translate-x-1/2 w-56 sm:w-64 p-3 rounded-xl bg-[#0c130d]/95 border border-[#2e422a] backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.7)] text-left z-30 pointer-events-none"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      style={{ backgroundColor: color }}
                      className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
                    />
                    <span className="text-[0.72rem] font-semibold text-white tracking-wide">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-[0.68rem] text-[#A8B7A1] leading-relaxed">
                    {item.subtitle}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
