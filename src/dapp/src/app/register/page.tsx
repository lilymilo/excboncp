import React, { Suspense } from "react";
import Link from "next/link";
import { LoginFormCard } from "@/components/LoginFormCard";
import { ArrowLeft, LogIn } from "lucide-react";

export const metadata = {
  title: "Register | ExcbonCP MRV Portal",
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
    <main className="min-h-dvh w-full bg-[#E3E4E8] text-[#18191D] flex flex-col justify-between py-5 sm:py-8 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
      {/* Top Navigation Bar */}
      <header className="w-full max-w-[1080px] mx-auto flex items-center justify-between gap-3 mb-3 sm:mb-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-full bg-white/90 hover:bg-white text-[#18191D] text-xs font-bold border border-black/10 shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Kembali ke Beranda</span>
        </Link>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-full bg-[#18191D] hover:bg-[#2A2C32] text-white text-xs font-bold shadow-sm transition-all"
        >
          <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Halaman Log In</span>
        </Link>
      </header>

      {/* Center Register Card Showcase */}
      <div className="my-auto py-1 w-full">
        <LoginFormCard initialRole={initialRole} defaultMode="register" />
      </div>

      {/* Bottom Legal / Sandbox Notice */}
      <footer className="w-full max-w-[1080px] mx-auto mt-5 text-center text-xs font-medium text-[#4B5563]">
        Sistem Pemantauan Hutan &amp; Verifikasi Karbon Terbuka • Base Sepolia
        Sandbox
      </footer>
    </main>
  );
}

