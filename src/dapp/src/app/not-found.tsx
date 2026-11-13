import React from "react";
import Link from "next/link";
import { HelpCircle, LayoutDashboard, Map as MapIcon } from "lucide-react";
import { Mascot } from "@/components/mascot/Mascot";
import "@/styles/fonts";
import "@/components/dapp/dashboard-botanical.css";

export default function NotFound() {
  return (
    <main className="xb-botanical grid min-h-screen place-items-center bg-[#EEF5EC] px-4 py-12">
      <section className="xb-card w-full max-w-xl p-8 text-center">
        <div className="mx-auto flex justify-center">
          <Mascot pose="mencari" size={116} alt="Halaman tidak ditemukan" />
        </div>
        <p className="xb-mono mt-4 text-[14px] font-semibold text-[#2E6B3F]">KODE 404</p>
        <h1 className="xb-display mt-1 text-[28px] font-bold tracking-[-0.02em] text-[#14261A]">
          Halaman tidak ditemukan
        </h1>
        <p className="mx-auto mt-2 max-w-[46ch] text-[16px] leading-relaxed text-[#4A5E4F]">
          Tautan yang Anda buka mungkin sudah dipindahkan, salah ketik, atau belum tersedia pada
          proyek simulasi ini.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/peta"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#2E6B3F] px-5 text-[15px] font-semibold text-white hover:bg-[#1F4D2E]"
          >
            <MapIcon className="h-4 w-4" aria-hidden="true" />
            <span>Buka Peta</span>
          </Link>
          <Link
            href="/app"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#D8E5D4] bg-white px-5 text-[15px] font-semibold text-[#14261A] hover:bg-[#F5F9F3]"
          >
            <LayoutDashboard className="h-4 w-4 text-[#2E6B3F]" aria-hidden="true" />
            <span>Ke Dasbor</span>
          </Link>
          <Link
            href="/bantuan"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#D8E5D4] bg-[#F5F9F3] px-5 text-[15px] font-semibold text-[#14261A] hover:bg-[#E2F2E5]"
          >
            <HelpCircle className="h-4 w-4 text-[#2E6B3F]" aria-hidden="true" />
            <span>Bantuan</span>
          </Link>
        </div>
      </section>
    </main>
  );
}

