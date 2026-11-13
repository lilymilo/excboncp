"use client";

import React from "react";
import { parseHexBytes } from "@/lib/dashboard-helpers";

interface HashSealProps {
  hash?: string;
  size?: number;
  className?: string;
}

/**
 * Cincin radial deterministik dari 32 byte hash SHA-256 (32 segmen busur; panjang & kepekatan
 * mengikuti nilai byte memakai warna --seal-600 #1F5A94). Hanya representasi visual;
 * verifikasi keaslian tetap mengandalkan pembandingan hash server/ledger.
 */
export function HashSeal({ hash, size = 88, className = "" }: HashSealProps) {
  const bytes = parseHexBytes(hash);
  const center = 50;
  const innerR = 20;
  const maxSpan = 24;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      <circle cx={center} cy={center} r={44} fill="#E3EEF9" fillOpacity="0.65" />
      <circle cx={center} cy={center} r={14} fill="#FFFFFF" stroke="#1F5A94" strokeWidth="1.5" />
      <circle cx={center} cy={center} r={5} fill="#1F5A94" />
      {bytes.map((byteVal, idx) => {
        const angle = (idx / 32) * Math.PI * 2 - Math.PI / 2;
        const norm = byteVal / 255;
        const outerR = innerR + 5 + norm * maxSpan;
        const x1 = center + Math.cos(angle) * innerR;
        const y1 = center + Math.sin(angle) * innerR;
        const x2 = center + Math.cos(angle) * outerR;
        const y2 = center + Math.sin(angle) * outerR;
        const opacity = 0.25 + norm * 0.72;
        return (
          <line
            key={idx}
            x1={x1.toFixed(2)}
            y1={y1.toFixed(2)}
            x2={x2.toFixed(2)}
            y2={y2.toFixed(2)}
            stroke="#1F5A94"
            strokeWidth={size < 48 ? 2.4 : 2.1}
            strokeLinecap="round"
            strokeOpacity={opacity.toFixed(2)}
          />
        );
      })}
    </svg>
  );
}

