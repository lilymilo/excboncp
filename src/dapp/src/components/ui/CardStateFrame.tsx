"use client";

import React from "react";
import { RefreshCw } from "lucide-react";

export type CardLoadState = "ready" | "loading" | "empty" | "error";

interface CardStateFrameProps {
  state: CardLoadState;
  onRetry: () => void;
  emptyMessage: string;
  skeletonHeight?: string;
  children: React.ReactNode;
}

/**
 * Pembungkus status per-kartu agar kondisi loading, empty, atau error satu kartu
 * tidak merusak kartu dashboard lainnya dan tetap menyediakan tombol Coba lagi.
 */
export function CardStateFrame({
  state,
  onRetry,
  emptyMessage,
  skeletonHeight = "h-36",
  children,
}: CardStateFrameProps) {
  if (state === "loading") {
    return (
      <div className={`flex flex-col justify-between gap-3 ${skeletonHeight}`} aria-busy="true">
        <div className="xb-skeleton h-5 w-1/2" />
        <div className="xb-skeleton h-9 w-3/4" />
        <div className="xb-skeleton h-4 w-full" />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-[#F0B9B5] bg-[#FDE3E1]/70 p-4">
        <div>
          <p className="text-[15px] font-semibold text-[#B3261E]">Data kartu gagal dimuat</p>
          <p className="mt-1 text-[14px] text-[#14261A]">
            Sambungan data terputus sementara. Kartu lain tetap berjalan normal.
          </p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#B3261E] bg-white px-4 text-[14px] font-semibold text-[#B3261E] hover:bg-[#FDE3E1]"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          <span>Coba lagi</span>
        </button>
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className="flex items-center rounded-2xl border border-[#D8E5D4] bg-[#F5F9F3] p-4">
        <p className="text-[15px] text-[#4A5E4F]">{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
}

