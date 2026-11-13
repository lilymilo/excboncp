"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { LottieHandle } from "lottie-react";

const Lottie = dynamic(() => import("lottie-react").then((m) => m.Lottie), {
  ssr: false,
});

export type MascotVariant = "sidebar" | "avatar";
export type MascotPose =
  | "potret"
  | "duduk-menunjuk"
  | "menunjuk-peta"
  | "mengangguk"
  | "mengintip"
  | "berayun"
  | "memegang-papan"
  | "mencari";

interface MascotProps {
  variant?: MascotVariant;
  pose?: MascotPose;
  size?: number;
  alt?: string;
  className?: string;
}

/** Placeholder botani netral saat file SVG pose tertentu belum diisi oleh ilustrator. */
function BotanicalPosePlaceholder({
  size,
  decorative,
  alt,
  className,
}: {
  size: number;
  decorative: boolean;
  alt: string;
  className: string;
}) {
  return (
    <div
      style={{ width: size, height: size, aspectRatio: "1 / 1" }}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : alt}
      className={`grid shrink-0 place-items-center rounded-full border border-[#D8E5D4] bg-[#8FCB97]/45 select-none ${className}`}
    >
      <svg
        viewBox="0 0 64 64"
        width={Math.round(size * 0.56)}
        height={Math.round(size * 0.56)}
        aria-hidden="true"
      >
        <path
          d="M49 15C33 15 20 26 17 44c14-3 28-14 32-29Z"
          fill="#2E6B3F"
          fillOpacity="0.88"
        />
        <path
          d="M16 48c7-9 17-18 28-26"
          fill="none"
          stroke="#14261A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/**
 * Maskot resmi Orangutan Penjaga Hutan EXBON CP:
 * - Mendukung mode sidebar/avatar eksisting serta slot `pose` terstandar dari Brief Maskot.
 * - Menghargai `prefers-reduced-motion` dan memakai kotak `aspect-ratio` tetap tanpa pergeseran layout.
 */
export function Mascot({
  variant = "sidebar",
  pose,
  size = variant === "avatar" ? 56 : 180,
  alt = "",
  className = "",
}: MascotProps) {
  const decorative = alt.trim().length === 0;
  const lottieRef = useRef<LottieHandle>(null);
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [activeSegment, setActiveSegment] = useState<readonly [number, number]>([0, 120]);
  const [isLooping, setIsLooping] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);

    const onMqChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", onMqChange);
    return () => mq.removeEventListener("change", onMqChange);
  }, []);

  if (pose) {
    if (pose === "potret") {
      return (
        <div
          style={{ width: size, height: size, aspectRatio: "1 / 1" }}
          className={`relative shrink-0 overflow-hidden rounded-full border border-[#D8E5D4] bg-[#EEF5EC] select-none ${className}`}
          aria-hidden={decorative ? true : undefined}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/maskot/potret.svg"
            alt={alt}
            width={size}
            height={size}
            loading="eager"
            decoding="async"
            className="h-full w-full object-contain"
          />
        </div>
      );
    }

    if (pose === "menunjuk-peta" || pose === "duduk-menunjuk") {
      return (
        <div
          style={{ width: size, height: size, aspectRatio: "1 / 1" }}
          className={`relative shrink-0 overflow-hidden rounded-2xl border border-[#D8E5D4] bg-[#EEF5EC] p-1 select-none ${className}`}
          aria-hidden={decorative ? true : undefined}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/orangutan-mascot.svg"
            alt={alt}
            width={size}
            height={size}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain"
          />
        </div>
      );
    }

    return (
      <BotanicalPosePlaceholder
        size={size}
        decorative={decorative}
        alt={alt}
        className={className}
      />
    );
  }

  const handleMouseEnter = () => {
    if (prefersReducedMotion) return;
    setIsLooping(false);
    setActiveSegment([120, 160]);
  };

  const handleMouseLeave = () => {
    if (prefersReducedMotion) return;
    setIsLooping(true);
    setActiveSegment([0, 120]);
  };

  const handleClick = () => {
    if (prefersReducedMotion) return;
    setIsLooping(false);
    setActiveSegment([160, 220]);
    setTimeout(() => {
      setIsLooping(true);
      setActiveSegment([0, 120]);
    }, 2000);
  };

  if (variant === "avatar") {
    return (
      <div
        style={{ width: size, height: size, aspectRatio: "1 / 1" }}
        className={`relative shrink-0 overflow-hidden rounded-full border border-[#D8E5D4] bg-[#EEF5EC] select-none ${className}`}
        aria-hidden={decorative ? true : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/illustrations/orangutan-mascot.svg"
          alt={alt}
          width={size}
          height={size}
          loading="eager"
          decoding="async"
          className="h-full w-full scale-[1.38] object-cover object-[50%_36%]"
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: Math.round(size * 0.94),
        aspectRatio: "1.06 / 1",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : alt || "Maskot Orangutan EXBON CP"}
      title="Klik untuk menyapa maskot"
      className={`group relative mx-auto shrink-0 cursor-pointer overflow-hidden select-none transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] ${className}`}
    >
      {mounted && !prefersReducedMotion ? (
        <Lottie
          src="/animations/orangutan-mascot.json"
          lottieRef={lottieRef}
          loop={isLooping}
          autoplay={true}
          segment={activeSegment}
          className="h-full w-full"
        />
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src="/illustrations/orangutan-mascot.svg"
          alt={alt}
          width={size}
          height={Math.round(size * 0.94)}
          loading="eager"
          decoding="async"
          className="h-full w-full object-contain"
        />
      )}
    </div>
  );
}
