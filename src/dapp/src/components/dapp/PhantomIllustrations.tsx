import React from "react";

type SvgProps = { className?: string };

function Sparkle({ x, y, s = 1, fill = "#FFFFFF" }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 -6 C0.6 -2 2 -0.6 6 0 C2 0.6 0.6 2 0 6 C-0.6 2 -2 0.6 -6 0 C-2 -0.6 -0.6 -2 0 -6Z"
      fill={fill}
    />
  );
}

/** Maskot utama: biji hutan yang sedang tidur, dipakai di kartu sambutan. */
export function ForestSpirit({ className = "" }: SvgProps) {
  return (
    <svg viewBox="0 0 160 120" fill="none" className={className} aria-hidden="true">
      <ellipse cx="80" cy="92" rx="34" ry="5" fill="#141414" />
      <path d="M50 40 H110 C110 64 97 82 80 82 C63 82 50 64 50 40Z" fill="#FFFFFF" />
      <ellipse cx="80" cy="40" rx="30" ry="7" fill="#F1EEFF" />
      <path d="M80 34 C80 25 87 20 95 20 C95 28 89 34 80 34Z" fill="#AB9FF2" />
      <path d="M66 55 Q71 61 76 55" stroke="#1C1C1C" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M84 55 Q89 61 94 55" stroke="#1C1C1C" strokeWidth="2.4" strokeLinecap="round" />
      <g transform="translate(30 72) rotate(-24)">
        <rect width="50" height="21" rx="10.5" fill="#FFFFFF" />
        <text x="25" y="14.5" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#1C1C1C">
          halo!
        </text>
        <rect x="-5" y="6" width="9" height="9" rx="2" transform="rotate(45 -0.5 10.5)" fill="#AB9FF2" />
      </g>
      <Sparkle x={116} y={52} s={1.1} />
      <Sparkle x={42} y={44} s={0.8} />
      <Sparkle x={122} y={78} s={0.6} fill="#9B9B9B" />
    </svg>
  );
}

/** Ikon kosong untuk daftar order: dua koin dengan tanda tambah. */
export function CoinsPlusIcon({ className = "" }: SvgProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="14" stroke="#AB9FF2" strokeWidth="4" />
      <circle cx="39" cy="39" r="14" fill="#000" stroke="#AB9FF2" strokeWidth="4" />
      <path d="M39 33 V45 M33 39 H45" stroke="#AB9FF2" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/** Ilustrasi kosong untuk segel EAS: daun, bingkai foto, dan segitiga. */
export function SealsIllustration({ className = "" }: SvgProps) {
  return (
    <svg viewBox="0 0 120 96" fill="none" className={className} aria-hidden="true">
      <path
        d="M52 18 C52 8 64 4 76 6 C76 18 66 24 52 18Z"
        fill="#FFFDD8"
      />
      <path d="M52 18 L46 34" stroke="#FFFDD8" strokeWidth="4" strokeLinecap="round" />
      <g transform="rotate(-12 38 62)">
        <rect x="16" y="40" width="44" height="44" rx="5" fill="#AB9FF2" />
        <rect x="23" y="47" width="30" height="26" rx="2" fill="#1C1C1C" />
      </g>
      <path d="M84 46 L98 70 H70Z" fill="#FF7243" stroke="#FF7243" strokeWidth="4" strokeLinejoin="round" />
      <Sparkle x={26} y={22} s={0.8} fill="#4A4A4A" />
      <Sparkle x={100} y={30} s={0.7} fill="#4A4A4A" />
    </svg>
  );
}

