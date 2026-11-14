"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, useAnimationFrame } from "framer-motion";

export function EarthGlobe() {
  const [rotationX, setRotationX] = useState(10);
  const [rotationY, setRotationY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastRotRef = useRef({ x: 10, y: 0 });
  const autoRotRef = useRef(0);
  const inertiaDeltaRef = useRef({ x: 0, y: 0 });
  const lastMoveRef = useRef({ x: 0, y: 0 });

  // Auto-rotate when not dragging
  useAnimationFrame((_, delta) => {
    if (isDragging) return;

    // Inertia coast after drag
    if (Math.abs(inertiaDeltaRef.current.x) > 0.05 || Math.abs(inertiaDeltaRef.current.y) > 0.05) {
      inertiaDeltaRef.current.x *= 0.92;
      inertiaDeltaRef.current.y *= 0.92;
      lastRotRef.current.x += inertiaDeltaRef.current.x * 0.4;
      lastRotRef.current.y += inertiaDeltaRef.current.y * 0.4;
      setRotationX(lastRotRef.current.x);
      setRotationY(lastRotRef.current.y);
    } else {
      // Gentle auto-rotate
      autoRotRef.current += delta * 0.012;
      const baseY = lastRotRef.current.y + autoRotRef.current;
      setRotationY(baseY % 360);
    }
  });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    lastMoveRef.current = { x: e.clientX, y: e.clientY };
    inertiaDeltaRef.current = { x: 0, y: 0 };
    // Freeze auto-rotate offset
    lastRotRef.current = { x: rotationX, y: rotationY };
    autoRotRef.current = 0;
    setIsDragging(true);
    setShowHint(false);
  }, [rotationX, rotationY]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;

    const dx = e.clientX - lastMoveRef.current.x;
    const dy = e.clientY - lastMoveRef.current.y;
    lastMoveRef.current = { x: e.clientX, y: e.clientY };

    inertiaDeltaRef.current = { x: dy * 0.5, y: dx * 0.5 };

    lastRotRef.current.x += dy * 0.4;
    lastRotRef.current.y += dx * 0.4;

    // Clamp X tilt so earth doesn't flip upside-down
    lastRotRef.current.x = Math.max(-45, Math.min(45, lastRotRef.current.x));

    setRotationX(lastRotRef.current.x);
    setRotationY(lastRotRef.current.y);
  }, [isDragging]);

  const onPointerUp = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  // Hide hint after 4s
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#010409]">
      {/* Deep space star field background */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 25% 35%, rgba(30,50,90,0.45) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 75% 65%, rgba(10,30,60,0.35) 0%, transparent 70%), #010409",
        }}
      />

      {/* Subtle star dots via box-shadow trick */}
      <StarField />

      {/* Globe wrapper — drag target */}
      <motion.div
        className="relative z-10 select-none"
        style={{
          width: "min(72vmin, 580px)",
          height: "min(72vmin, 580px)",
          cursor: isDragging ? "grabbing" : "grab",
          perspective: "900px",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* Outer atmosphere glow */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow:
              "0 0 60px 20px rgba(80,160,255,0.18), 0 0 120px 40px rgba(40,100,200,0.10), inset 0 0 60px 10px rgba(0,0,0,0.6)",
            borderRadius: "50%",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        {/* Specular light patch */}
        <div
          aria-hidden="true"
          className="absolute rounded-full"
          style={{
            width: "35%",
            height: "35%",
            top: "12%",
            left: "14%",
            background: "radial-gradient(circle, rgba(255,255,255,0.14) 0%, transparent 80%)",
            filter: "blur(8px)",
            zIndex: 3,
            pointerEvents: "none",
          }}
        />

        {/* The rotating sphere */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            borderRadius: "50%",
            transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
            transformStyle: "preserve-3d",
            transition: isDragging ? "none" : "transform 0.08s linear",
            zIndex: 1,
            boxShadow: "inset 0 0 40px 8px rgba(0,0,0,0.75)",
          }}
        >
          {/* Double-wrap texture so it appears to wrap around */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: "200%",
              left: "-50%",
              height: "100%",
            }}
          >
            <Image
              src="/landing-story/01-earth.jpg"
              alt="Earth globe texture"
              fill
              priority
              sizes="150vmin"
              className="object-cover object-center"
              style={{ userSelect: "none", pointerEvents: "none" }}
              draggable={false}
            />
          </div>
        </div>

        {/* Drag hint tooltip */}
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-[0.72rem] font-medium text-white/80">
              <svg className="w-3.5 h-3.5 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M5 9l-3 3 3 3M19 9l3 3-3 3M9 5l3-3 3 3M9 19l3 3 3-3" />
              </svg>
              Drag untuk memutar Bumi
            </span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function StarField() {
  // Static star positions — deterministic so no hydration mismatch
  const stars = [
    { x: 5, y: 8, r: 1.2, o: 0.7 }, { x: 15, y: 22, r: 0.8, o: 0.5 },
    { x: 28, y: 5, r: 1.0, o: 0.8 }, { x: 42, y: 15, r: 0.6, o: 0.4 },
    { x: 55, y: 3, r: 1.4, o: 0.9 }, { x: 68, y: 18, r: 0.9, o: 0.6 },
    { x: 78, y: 7, r: 0.7, o: 0.5 }, { x: 90, y: 25, r: 1.1, o: 0.7 },
    { x: 95, y: 10, r: 0.8, o: 0.6 }, { x: 10, y: 40, r: 0.6, o: 0.4 },
    { x: 22, y: 55, r: 1.3, o: 0.8 }, { x: 35, y: 72, r: 0.7, o: 0.5 },
    { x: 48, y: 85, r: 1.0, o: 0.7 }, { x: 60, y: 60, r: 0.5, o: 0.3 },
    { x: 75, y: 45, r: 1.2, o: 0.9 }, { x: 85, y: 78, r: 0.8, o: 0.6 },
    { x: 92, y: 55, r: 0.6, o: 0.4 }, { x: 3, y: 70, r: 1.0, o: 0.7 },
    { x: 18, y: 88, r: 0.7, o: 0.5 }, { x: 50, y: 92, r: 1.1, o: 0.8 },
  ];

  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={`${s.x}%`}
          cy={`${s.y}%`}
          r={s.r}
          fill="white"
          opacity={s.o}
        />
      ))}
    </svg>
  );
}
