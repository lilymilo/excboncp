import React from "react";
import Link from "next/link";
import { LoginFormCard } from "@/components/LoginFormCard";
import { ArrowLeft, LogIn } from "lucide-react";

export const metadata = {
  title: "Daftar Akun Baru | ExcbonCP MRV Portal",
  description:
    "Daftarkan akun peran baru pada portal pemantauan hutan dan verifikasi karbon terbuka ExcbonCP.",
};

export default function RegisterPage({
  searchParams,
}: {
  searchParams?: { role?: string };
}) {
  const initialRole = searchParams?.role;

  return (
    <main className="min-h-dvh w-full bg-gradient-to-br from-[#eef5ec] via-[#f3f8f1] to-[#e3efe1] text-[#14261a] flex flex-col justify-between py-5 sm:py-8 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden transition-colors duration-300">
      {/* Top Navigation Bar */}
      <header className="w-full max-w-[1080px] mx-auto flex items-center justify-between gap-3 mb-3 sm:mb-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 min-h-[42px] rounded-full bg-white/85 hover:bg-white text-[#14261a] text-xs font-semibold border border-[#d8e5d4] shadow-xs transition-all hover:scale-[1.01] active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-[#10b981]" aria-hidden="true" />
          <span>Kembali ke Beranda</span>
        </Link>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-4 py-2 min-h-[42px] rounded-full bg-[#1f4d2e] hover:bg-[#143520] text-white text-xs font-semibold shadow-xs transition-all hover:scale-[1.01] active:scale-95"
        >
          <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Halaman Masuk</span>
        </Link>
      </header>

      {/* Center Register Card Showcase */}
      <div className="my-auto py-1 w-full">
        <LoginFormCard initialRole={initialRole} defaultMode="register" />
      </div>

      {/* Bottom Legal / Sandbox Notice */}
      <footer className="w-full max-w-[1080px] mx-auto mt-5 text-center text-xs font-medium text-[#4a5e4f]">
        Sistem Pemantauan Hutan &amp; Verifikasi Karbon Terbuka • Base Sepolia Sandbox
      </footer>
    </main>
  );
}
