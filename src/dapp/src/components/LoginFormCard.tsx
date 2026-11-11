"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LottieMascotStage } from "@/components/LottieMascotStage";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { RippleButton } from "@/components/ui/ripple-button";
import { BlurFade } from "@/components/ui/blur-fade";
import { useDapp } from "@/context/DappContext";
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sun,
  Moon,
  LogOut,
  ArrowUpRight,
  KeyRound,
} from "lucide-react";

export interface DemoAccount {
  id: string;
  role: string;
  name: string;
  email: string;
  password: string;
  badge: string;
  destinationHref: string;
  destinationLabel: string;
}

export const EXCBON_DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "komunitas",
    role: "Komunitas",
    name: "Sari Dewi",
    email: "komunitas.a@demo.excboncp.test",
    password: "demo123",
    badge: "Hak Veto & Kas 60%",
    destinationHref: "/app",
    destinationLabel: "Buka Dashboard (/app)",
  },
  {
    id: "komunitas_b",
    role: "Komunitas Lahan B",
    name: "Budi Santoso",
    email: "komunitas.b@demo.excboncp.test",
    password: "demo123",
    badge: "Parcel B Diblokir",
    destinationHref: "/consent",
    destinationLabel: "Tinjau Izin Warga (/consent)",
  },
  {
    id: "pengelola",
    role: "Pengelola Hutan",
    name: "Ahmad Fauzi",
    email: "pengelola.a@demo.excboncp.test",
    password: "demo123",
    badge: "Monitoring & Operasi 40%",
    destinationHref: "/app",
    destinationLabel: "Buka Dashboard (/app)",
  },
  {
    id: "penerima",
    role: "Penerima / Pembeli",
    name: "PT. GreenCorp",
    email: "penerima.a@demo.excboncp.test",
    password: "demo123",
    badge: "Akun Pembeli",
    destinationHref: "/market",
    destinationLabel: "Buka Market Karbon (/market)",
  },
  {
    id: "auditor",
    role: "Auditor MRV",
    name: "Dr. Hendra",
    email: "auditor@demo.excboncp.test",
    password: "demo123",
    badge: "Base Sepolia EAS",
    destinationHref: "/approve",
    destinationLabel: "Tinjau Otorisasi (/approve)",
  },
];

interface LoginFormCardProps {
  initialRole?: string;
  defaultMode?: "login" | "register";
}

export function LoginFormCard({
  initialRole,
  defaultMode = "login",
}: LoginFormCardProps) {
  const { login } = useDapp();
  const [cardTheme, setCardTheme] = useState<"light" | "dark">("light");
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">(
    defaultMode
  );
  const [fullName, setFullName] = useState(
    defaultMode === "register" ? "" : "Komunitas Lahan A"
  );
  const [selectedRoleLabel, setSelectedRoleLabel] =
    useState("Komunitas Adat");
  const [email, setEmail] = useState(
    defaultMode === "register" ? "" : "komunitas.a@demo.excboncp.test"
  );
  const [password, setPassword] = useState(
    defaultMode === "register" ? "" : "demo123"
  );
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [activeField, setActiveField] = useState<
    "none" | "email" | "password" | "name"
  >("none");
  const [paused, setPaused] = useState(false);

  // UI States (R-27: Empty/Idle, Loading, Error, Success)
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "success" | "reset-sent" | "registered"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeAccount, setActiveAccount] = useState<DemoAccount>(
    EXCBON_DEMO_ACCOUNTS[0]
  );

  useEffect(() => {
    setAuthMode(defaultMode);
  }, [defaultMode]);

  useEffect(() => {
    if (!initialRole) return;
    const normalized = initialRole.toLowerCase() === "alex" ? "penerima" : initialRole.toLowerCase();
    const found = EXCBON_DEMO_ACCOUNTS.find(
      (a) => a.id.toLowerCase() === normalized
    );
    if (found) {
      setActiveAccount(found);
      setFullName(found.name);
      setEmail(found.email);
      setPassword(found.password);
      setSelectedRoleLabel(found.role);
      setStatus("idle");
      setErrorMessage(null);
    }
  }, [initialRole]);

  const handleSelectDemoAccount = (account: DemoAccount) => {
    setActiveAccount(account);
    setFullName(account.name);
    setEmail(account.email);
    setPassword(account.password);
    setSelectedRoleLabel(account.role);
    setStatus("idle");
    setErrorMessage(null);
  };

  const handleClearFields = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setStatus("idle");
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (authMode === "register" && fullName.trim().length < 2) {
      setStatus("error");
      setErrorMessage("Masukkan nama lengkap minimal 2 karakter.");
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setStatus("error");
      setErrorMessage(
        "Masukkan alamat email yang valid (contoh: komunitas.a@demo.excboncp.test)."
      );
      return;
    }

    if (authMode === "forgot") {
      setStatus("loading");
      window.setTimeout(() => setStatus("reset-sent"), 450);
      return;
    }

    if (!password || password.trim().length < 3) {
      setStatus("error");
      setErrorMessage("Kata sandi minimal terdiri dari 3 karakter.");
      return;
    }

    // Sandbox ini memakai akun yang sudah disediakan; pendaftaran mandiri
    // hanya mencatat permintaan, bukan membuat sesi baru.
    if (authMode === "register") {
      setStatus("loading");
      window.setTimeout(() => setStatus("registered"), 450);
      return;
    }

    setStatus("loading");
    const ok = await login(trimmedEmail, password);

    if (!ok) {
      setActiveAccount({
        id: "unknown",
        role: "Belum terverifikasi",
        name: trimmedEmail.split("@")[0],
        email: trimmedEmail,
        password: "",
        badge: "Akses Ditolak",
        destinationHref: "/login",
        destinationLabel: "Kembali ke Login",
      });
      setStatus("error");
      setErrorMessage(
        "Email atau kata sandi tidak cocok. Gunakan salah satu akun demo di bawah — semuanya memakai kata sandi demo123."
      );
      return;
    }

    const matched = EXCBON_DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === trimmedEmail.toLowerCase()
    );

    setActiveAccount(
      matched ?? {
        id: "custom",
        role: "Anggota Terverifikasi",
        name: trimmedEmail.split("@")[0],
        email: trimmedEmail,
        password: "",
        badge: "JWT Session Active",
        destinationHref: "/app",
        destinationLabel: "Buka Dashboard (/app)",
      }
    );
    setStatus("success");
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    const targetEmail =
      email.trim() || "komunitas.a@demo.excboncp.test";
    const demoAccount = EXCBON_DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === targetEmail.toLowerCase()
    );

    if (!demoAccount) {
      setStatus("error");
      setErrorMessage(
        "Google OAuth belum tersambung pada sandbox ini. Pakai salah satu akun demo di atas untuk masuk."
      );
      return;
    }

    setStatus("loading");
    const ok = await login(demoAccount.email, demoAccount.password);
    if (!ok) {
      setStatus("error");
      setErrorMessage("Sesi demo gagal dibuka. Coba pilih ulang akun demo.");
      return;
    }

    setActiveAccount(demoAccount);
    setEmail(demoAccount.email);
    setPassword(demoAccount.password);
    setStatus("success");
  };

  const isLight = cardTheme === "light";

  return (
    <div className="w-full max-w-[1080px] mx-auto">
      {/* Top Floating Attribution & Theme Pill (Matches reference pill above the card) */}
      <BlurFade delay={0.05} inView>
        <div className="flex flex-wrap items-center justify-center gap-3 mb-4 sm:mb-6">
          <div
            className={`inline-flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-full border shadow-sm transition-colors ${
              isLight
                ? "bg-[#F3F4F6] border-black/10 text-[#18191D]"
                : "bg-[#171D16] border-[#263024] text-[#F0F2EC]"
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#1D4ED8] via-[#3B5BFF] to-[#60A5FA] flex items-center justify-center text-white text-xs font-bold shadow-inner">
              E
            </div>
            <span className="text-[13px] font-semibold tracking-tight">
              excboncp.id
            </span>
          </div>

          {/* Working Card Theme Switcher (R-21 & R-34 compliant) */}
          <button
            type="button"
            onClick={() =>
              setCardTheme((prev) => (prev === "light" ? "dark" : "light"))
            }
            aria-label={
              isLight
                ? "Ubah kartu ke mode gelap"
                : "Ubah kartu ke mode terang (referensi)"
            }
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 min-h-[40px] rounded-full text-xs font-semibold border transition-all ${
              isLight
                ? "bg-white text-[#18191D] border-black/10 hover:bg-[#F3F4F6]"
                : "bg-[#171D16] text-[#AEDA2D] border-[#2B3529] hover:border-[#AEDA2D]/50"
            }`}
          >
            {isLight ? (
              <>
                <Sun
                  className="w-3.5 h-3.5 text-[#D97706]"
                  aria-hidden="true"
                />
                <span>Studio Light</span>
              </>
            ) : (
              <>
                <Moon
                  className="w-3.5 h-3.5 text-[#AEDA2D]"
                  aria-hidden="true"
                />
                <span>Forest Dark</span>
              </>
            )}
          </button>
        </div>
      </BlurFade>

      {/* Main Split Rounded Card (Matches reference image layout & proportions) */}
      <BlurFade delay={0.12} inView>
        <div
          className={`relative rounded-[28px] sm:rounded-[36px] p-3 sm:p-4 lg:p-5 transition-colors duration-300 shadow-[0_28px_80px_rgba(18,20,28,0.18)] border ${
            isLight
              ? "bg-[#FFFFFF] text-[#18191D] border-black/5"
              : "bg-[#121712] text-[#F0F2EC] border-[#252E23]"
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1.06fr_1fr] gap-4 sm:gap-6 lg:gap-8 items-stretch">
            {/* LEFT COLUMN: 3D Lottie Mascot & Interactive 3D Stage */}
            <div className="w-full h-full">
              <LottieMascotStage
                activeField={activeField}
                showPassword={showPassword}
                isSubmitting={status === "loading"}
                cardTheme={cardTheme}
                paused={paused}
                onTogglePause={() => setPaused((p) => !p)}
              />
            </div>

            {/* RIGHT COLUMN: Minimalist Editorial Form Area */}
            <div className="flex flex-col justify-between px-4 sm:px-8 lg:px-10 py-6 sm:py-9">
              {/* Top Brand Mark (Matches 'Kreative' cute squircle icon + wordmark in reference) */}
              <div className="flex items-center justify-center gap-2 mb-5 sm:mb-7">
                <div
                  className={`w-6 h-6 rounded-[7px] flex items-center justify-center shadow-sm ${
                    isLight
                      ? "bg-[#18191D] text-white"
                      : "bg-[#AEDA2D] text-[#111610]"
                  }`}
                  aria-hidden="true"
                >
                  <div className="flex flex-col items-center justify-center gap-[2px]">
                    <div className="flex items-center gap-[4px]">
                      <span className="w-[3.5px] h-[3.5px] rounded-full bg-current" />
                      <span className="w-[3.5px] h-[3.5px] rounded-full bg-current" />
                    </div>
                    <span className="w-2 h-[1.5px] rounded-full bg-current opacity-80" />
                  </div>
                </div>
                <span
                  className={`text-[15px] font-bold tracking-tight ${
                    isLight ? "text-[#18191D]" : "text-[#F0F2EC]"
                  }`}
                >
                  Excboncp
                </span>
              </div>

              {/* Center Form Block */}
              <div className="w-full max-w-[360px] mx-auto my-auto">
                {/* Title & Subtitle */}
                <div className="text-center mb-6 sm:mb-7">
                  <h1
                    className={`text-[28px] sm:text-[34px] font-extrabold tracking-[-0.03em] leading-[1.15] ${
                      isLight ? "text-[#18191D]" : "text-[#F0F2EC]"
                    }`}
                  >
                    {authMode === "login"
                      ? "Welcome Back!"
                      : authMode === "register"
                        ? "Create Account"
                        : "Reset Password"}
                  </h1>
                  <p
                    className={`mt-1.5 text-[12.5px] font-medium ${
                      isLight ? "text-[#5E626A]" : "text-[#9CA596]"
                    }`}
                  >
                    {authMode === "forgot"
                      ? "Masukkan email terdaftar untuk menerima tautan pemulihan"
                      : authMode === "register"
                        ? "Register Your Details Below"
                        : "Enter Your Details Below"}
                  </p>
                </div>

                {/* Quick Demo Role Selector Pills (Shown on Login mode) */}
                {authMode === "login" && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-[11px] font-semibold ${
                          isLight ? "text-[#5E626A]" : "text-[#9CA596]"
                        }`}
                      >
                        Isi Cepat Akun Demo:
                      </span>
                      <button
                        type="button"
                        onClick={handleClearFields}
                        className={`text-[11px] font-semibold underline underline-offset-2 transition-colors min-h-[28px] px-1 ${
                          isLight
                            ? "text-[#4B5563] hover:text-[#18191D]"
                            : "text-[#A8AFA2] hover:text-[#AEDA2D]"
                        }`}
                      >
                        Kosongkan
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {EXCBON_DEMO_ACCOUNTS.map((acc) => {
                        const isSelected =
                          email.toLowerCase() === acc.email.toLowerCase();
                        return (
                          <button
                            key={acc.id}
                            type="button"
                            onClick={() => handleSelectDemoAccount(acc)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all min-h-[32px] ${
                              isSelected
                                ? isLight
                                  ? "bg-[#18191D] text-white border-[#18191D]"
                                  : "bg-[#AEDA2D] text-[#111610] border-[#AEDA2D]"
                                : isLight
                                  ? "bg-[#F3F4F6] text-[#374151] border-[#D1D5DB] hover:border-[#18191D]"
                                  : "bg-[#1A2119] text-[#C6CEC0] border-[#2B3529] hover:border-[#AEDA2D]/60"
                            }`}
                          >
                            {acc.role}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SUCCESS STATE (Authenticated Session View) */}
                {status === "success" ? (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`rounded-2xl p-5 border ${
                      isLight
                        ? "bg-[#F8FAFC] border-[#CBD5E1] text-[#18191D]"
                        : "bg-[#171E16] border-[#2C3829] text-[#F0F2EC]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        className={`w-5 h-5 shrink-0 mt-0.5 ${
                          isLight ? "text-[#15803D]" : "text-[#AEDA2D]"
                        }`}
                        aria-hidden="true"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold truncate">
                            {activeAccount.name}
                          </p>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isLight
                                ? "bg-[#DCFCE7] text-[#166534]"
                                : "bg-[#AEDA2D]/20 text-[#AEDA2D]"
                            }`}
                          >
                            {activeAccount.badge}
                          </span>
                        </div>
                        <p
                          className={`text-xs mt-0.5 truncate ${
                            isLight ? "text-[#4B5563]" : "text-[#9CA596]"
                          }`}
                        >
                          {activeAccount.email} • {activeAccount.role}
                        </p>
                        <p
                          className={`mt-3 text-xs leading-relaxed ${
                            isLight ? "text-[#374151]" : "text-[#C6CEC0]"
                          }`}
                        >
                          {authMode === "register"
                            ? "Pendaftaran akun berhasil! Sesi peran kamu telah aktif di jaringan sandbox ExcbonCP."
                            : "Sesi autentikasi berhasil diverifikasi. Hak akses sesuai peran telah diaktifkan pada jaringan sandbox ExcbonCP."}
                        </p>

                        <div className="mt-4 flex flex-col sm:flex-row gap-2">
                          <Link
                            href={activeAccount.destinationHref}
                            className={`flex-1 min-h-[44px] px-4 py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                              isLight
                                ? "bg-[#18191D] text-white hover:bg-[#2B2D33]"
                                : "bg-[#AEDA2D] text-[#111610] hover:brightness-105"
                            }`}
                          >
                            <span>{activeAccount.destinationLabel}</span>
                            <ArrowUpRight
                              className="w-4 h-4"
                              aria-hidden="true"
                            />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setStatus("idle")}
                            className={`min-h-[44px] px-4 py-2.5 rounded-full text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                              isLight
                                ? "bg-white text-[#18191D] border-[#CBD5E1] hover:bg-[#F1F5F9]"
                                : "bg-[#121712] text-[#C6CEC0] border-[#2C3829] hover:text-white"
                            }`}
                          >
                            <LogOut
                              className="w-3.5 h-3.5"
                              aria-hidden="true"
                            />
                            <span>Ganti Akun</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : status === "reset-sent" ? (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`rounded-2xl p-5 border ${
                      isLight
                        ? "bg-[#F8FAFC] border-[#CBD5E1] text-[#18191D]"
                        : "bg-[#171E16] border-[#2C3829] text-[#F0F2EC]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <KeyRound
                        className={`w-5 h-5 shrink-0 mt-0.5 ${
                          isLight ? "text-[#2563EB]" : "text-[#AEDA2D]"
                        }`}
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-sm font-bold">
                          Pemulihan Kata Sandi Belum Aktif
                        </p>
                        <p
                          className={`text-xs mt-1 leading-relaxed ${
                            isLight ? "text-[#4B5563]" : "text-[#9CA596]"
                          }`}
                        >
                          Pengiriman email pemulihan belum tersambung pada
                          sandbox ini. Semua akun demo memakai kata sandi tetap{" "}
                          <strong className="font-semibold">demo123</strong> —
                          kembali ke Log in lalu pilih akun demo yang tersedia.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("login");
                            setStatus("idle");
                          }}
                          className={`mt-4 min-h-[44px] px-5 py-2 rounded-full text-xs font-bold ${
                            isLight
                              ? "bg-[#18191D] text-white"
                              : "bg-[#AEDA2D] text-[#111610]"
                          }`}
                        >
                          Kembali ke Log in
                        </button>
                      </div>
                    </div>
                  </div>
                ) : status === "registered" ? (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`rounded-2xl p-5 border ${
                      isLight
                        ? "bg-[#F8FAFC] border-[#CBD5E1] text-[#18191D]"
                        : "bg-[#171E16] border-[#2C3829] text-[#F0F2EC]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        className={`w-5 h-5 shrink-0 mt-0.5 ${
                          isLight ? "text-[#2563EB]" : "text-[#82B7D9]"
                        }`}
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-sm font-bold">
                          Permintaan Akun Tercatat
                        </p>
                        <p
                          className={`text-xs mt-1 leading-relaxed ${
                            isLight ? "text-[#4B5563]" : "text-[#9CA596]"
                          }`}
                        >
                          Pendaftaran mandiri belum membuka sesi di sandbox ini.
                          Akun peran dibuat oleh admin proyek — untuk mencoba
                          sekarang, masuk lewat salah satu akun demo.
                        </p>
                        <Link
                          href="/login"
                          className={`mt-4 inline-flex min-h-[44px] px-5 py-2 rounded-full text-xs font-bold items-center gap-1.5 ${
                            isLight
                              ? "bg-[#18191D] text-white"
                              : "bg-[#AEDA2D] text-[#111610]"
                          }`}
                        >
                          Buka Halaman Log in
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    {/* Error Alert Banner */}
                    {status === "error" && errorMessage && (
                      <div
                        role="alert"
                        className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs font-medium ${
                          isLight
                            ? "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]"
                            : "bg-[#2C1517] border-[#7F1D1D] text-[#FCA5A5]"
                        }`}
                      >
                        <AlertCircle
                          className="w-4 h-4 shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* Full Name + Role Selector in Register Mode */}
                    {authMode === "register" && (
                      <>
                        <div>
                          <label
                            htmlFor="excbon-login-name"
                            className={`block text-[11.5px] font-medium mb-1 ${
                              isLight ? "text-[#5E626A]" : "text-[#9CA596]"
                            }`}
                          >
                            Full Name
                          </label>
                          <input
                            id="excbon-login-name"
                            type="text"
                            required
                            value={fullName}
                            onFocus={() => setActiveField("name")}
                            onBlur={() => setActiveField("none")}
                            onChange={(e) => {
                              setFullName(e.target.value);
                              if (status === "error") setStatus("idle");
                            }}
                            placeholder="Enter your full name"
                            className={`w-full bg-transparent border-0 border-b-2 pb-2.5 pt-1 text-[14px] font-semibold transition-colors focus:outline-none ${
                              isLight
                                ? "border-[#9499A3] focus:border-[#18191D] text-[#18191D] placeholder:text-[#737780]"
                                : "border-[#546150] focus:border-[#AEDA2D] text-[#F0F2EC] placeholder:text-[#6E776A]"
                            }`}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="excbon-register-role"
                            className={`block text-[11.5px] font-medium mb-1 ${
                              isLight ? "text-[#5E626A]" : "text-[#9CA596]"
                            }`}
                          >
                            Role in Ecosystem
                          </label>
                          <select
                            id="excbon-register-role"
                            value={selectedRoleLabel}
                            onChange={(e) =>
                              setSelectedRoleLabel(e.target.value)
                            }
                            className={`w-full bg-transparent border-0 border-b-2 pb-2.5 pt-1 text-[14px] font-semibold transition-colors focus:outline-none cursor-pointer ${
                              isLight
                                ? "border-[#9499A3] focus:border-[#18191D] text-[#18191D]"
                                : "border-[#546150] focus:border-[#AEDA2D] text-[#F0F2EC] bg-[#121712]"
                            }`}
                          >
                            <option value="Komunitas Adat">
                              Komunitas Adat (Hak Veto &amp; Kas 60%)
                            </option>
                            <option value="Pengelola Hutan">
                              Pengelola Hutan (Monitoring IoT &amp; Satelit)
                            </option>
                            <option value="Kawasan Industri (KEK)">
                              Kawasan Industri / KEK (Penerima Unit)
                            </option>
                            <option value="Auditor Independen">
                              Auditor Independen (Verifikator MRV)
                            </option>
                          </select>
                        </div>
                      </>
                    )}

                    {/* Email Input */}
                    <div>
                      <label
                        htmlFor="excbon-login-email"
                        className={`block text-[11.5px] font-medium mb-1 ${
                          isLight ? "text-[#5E626A]" : "text-[#9CA596]"
                        }`}
                      >
                        Email
                      </label>
                      <input
                        id="excbon-login-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onFocus={() => setActiveField("email")}
                        onBlur={() => setActiveField("none")}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (status === "error") setStatus("idle");
                        }}
                        placeholder="hello.alex@gmail.com"
                        className={`w-full bg-transparent border-0 border-b-2 pb-2.5 pt-1 text-[14px] font-semibold transition-colors focus:outline-none ${
                          isLight
                            ? "border-[#9499A3] focus:border-[#18191D] text-[#18191D] placeholder:text-[#737780]"
                            : "border-[#546150] focus:border-[#AEDA2D] text-[#F0F2EC] placeholder:text-[#6E776A]"
                        }`}
                      />
                    </div>

                    {/* Password Input + Eye Visibility Toggle */}
                    {authMode !== "forgot" && (
                      <div>
                        <label
                          htmlFor="excbon-login-password"
                          className={`block text-[11.5px] font-medium mb-1 ${
                            isLight ? "text-[#5E626A]" : "text-[#9CA596]"
                          }`}
                        >
                          Password
                        </label>
                        <div
                          className={`relative flex items-center border-b-2 transition-colors ${
                            isLight
                              ? "border-[#9499A3] focus-within:border-[#18191D]"
                              : "border-[#546150] focus-within:border-[#AEDA2D]"
                          }`}
                        >
                          <input
                            id="excbon-login-password"
                            type={showPassword ? "text" : "password"}
                            autoComplete={
                              authMode === "register"
                                ? "new-password"
                                : "current-password"
                            }
                            required
                            value={password}
                            onFocus={() => setActiveField("password")}
                            onBlur={() => setActiveField("none")}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (status === "error") setStatus("idle");
                            }}
                            placeholder="Enter password"
                            className={`w-full bg-transparent border-0 pb-2.5 pt-1 pr-11 text-[14px] font-semibold focus:outline-none ${
                              isLight
                                ? "text-[#18191D] placeholder:text-[#737780]"
                                : "text-[#F0F2EC] placeholder:text-[#6E776A]"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={
                              showPassword
                                ? "Sembunyikan kata sandi"
                                : "Tampilkan kata sandi"
                            }
                            className={`-mr-2 w-11 h-11 flex items-center justify-center rounded-full transition-colors ${
                              isLight
                                ? "text-[#4E525A] hover:text-[#18191D] hover:bg-black/5"
                                : "text-[#9CA596] hover:text-[#F0F2EC] hover:bg-white/5"
                            }`}
                          >
                            {showPassword ? (
                              <EyeOff
                                className="w-[18px] h-[18px]"
                                aria-hidden="true"
                              />
                            ) : (
                              <Eye
                                className="w-[18px] h-[18px]"
                                aria-hidden="true"
                              />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Utility Row: Remember me checkbox + Forgot password? link */}
                    {authMode !== "forgot" && (
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <label className="inline-flex items-center gap-2 cursor-pointer min-h-[44px] py-1 select-none">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded border-[#6E737D] text-[#18191D] focus:ring-2 focus:ring-[#3B5BFF] cursor-pointer accent-[#18191D]"
                          />
                          <span
                            className={`text-[12px] font-medium ${
                              isLight ? "text-[#4E525A]" : "text-[#A8AFA2]"
                            }`}
                          >
                            {authMode === "register"
                              ? "Agree to open MRV ledger terms"
                              : "Remember me"}
                          </span>
                        </label>

                        {authMode === "login" && (
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode("forgot");
                              setStatus("idle");
                              setErrorMessage(null);
                            }}
                            className={`text-[12px] font-medium min-h-[44px] px-1 transition-colors ${
                              isLight
                                ? "text-[#5E626A] hover:text-[#18191D]"
                                : "text-[#9CA596] hover:text-[#AEDA2D]"
                            }`}
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                    )}

                    {/* Action Buttons Stack (Magic UI ShimmerButton + RippleButton) */}
                    <div className="pt-2 space-y-3">
                      <ShimmerButton
                        type="submit"
                        disabled={status === "loading"}
                        background={isLight ? "#18191D" : "#AEDA2D"}
                        shimmerColor={
                          isLight
                            ? "rgba(255,255,255,0.55)"
                            : "rgba(255,255,255,0.8)"
                        }
                        borderRadius="9999px"
                        className={`w-full min-h-[50px] text-[13.5px] font-bold tracking-tight shadow-md ${
                          isLight ? "text-white" : "!text-[#111610]"
                        }`}
                      >
                        {status === "loading" ? (
                          <>
                            <Loader2
                              className="w-4 h-4 animate-spin"
                              aria-hidden="true"
                            />
                            <span>Memproses...</span>
                          </>
                        ) : authMode === "login" ? (
                          <span>Log in</span>
                        ) : authMode === "register" ? (
                          <span>Sign Up</span>
                        ) : (
                          <span>Send Recovery Link</span>
                        )}
                      </ShimmerButton>

                      {authMode !== "forgot" && (
                        <RippleButton
                          type="button"
                          disabled={status === "loading"}
                          onClick={handleGoogleLogin}
                          rippleColor={isLight ? "#CBD5E1" : "#2E3B2B"}
                          className={`w-full min-h-[50px] rounded-full text-[13.5px] font-bold border transition-colors ${
                            isLight
                              ? "bg-[#F3F4F6] hover:bg-[#EAECEF] text-[#18191D] border-[#D1D5DB]"
                              : "bg-[#1A2119] hover:bg-[#222B21] text-[#F0F2EC] border-[#2E3A2C]"
                          }`}
                        >
                          <svg
                            className="w-4 h-4 shrink-0"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              fill="#EA4335"
                              d="M12 10.2v3.9h5.4c-.2 1.2-.9 2.3-2 3l3.2 2.5c1.9-1.7 3-4.3 3-7.3 0-.7-.1-1.4-.2-2.1H12z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.8-5.6-4.1l-3.3 2.6C4.7 19.8 8.1 22 12 22z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M6.4 13.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9L3.1 7.5C2.4 8.9 2 10.4 2 12s.4 3.1 1.1 4.5l3.3-2.6z"
                            />
                            <path
                              fill="#4285F4"
                              d="M12 5.8c1.5 0 2.8.5 3.8 1.5l2.9-2.9C16.9 2.8 14.7 2 12 2 8.1 2 4.7 4.2 3.1 7.5l3.3 2.6c.8-2.3 3-4.3 5.6-4.3z"
                            />
                          </svg>
                          <span>
                            {authMode === "register"
                              ? "Sign up with Google"
                              : "Log in with Google"}
                          </span>
                        </RippleButton>
                      )}
                    </div>
                  </form>
                )}
              </div>

              {/* Bottom Footer Prompt navigating between /login and /register */}
              <div className="mt-7 text-center">
                {authMode === "login" ? (
                  <p
                    className={`text-[12px] font-medium ${
                      isLight ? "text-[#5E626A]" : "text-[#9CA596]"
                    }`}
                  >
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/register"
                      className={`inline-flex items-center font-bold underline-offset-4 hover:underline min-h-[44px] px-1 ${
                        isLight ? "text-[#18191D]" : "text-[#AEDA2D]"
                      }`}
                    >
                      Sign Up
                    </Link>
                  </p>
                ) : (
                  <p
                    className={`text-[12px] font-medium ${
                      isLight ? "text-[#5E626A]" : "text-[#9CA596]"
                    }`}
                  >
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className={`inline-flex items-center font-bold underline-offset-4 hover:underline min-h-[44px] px-1 ${
                        isLight ? "text-[#18191D]" : "text-[#AEDA2D]"
                      }`}
                    >
                      Log in
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </BlurFade>
    </div>
  );
}
