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
  ShieldCheck,
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
    role: "Komunitas Adat",
    name: "Sari Dewi",
    email: "komunitas.a@demo.excboncp.test",
    password: "demo123",
    badge: "Hak Veto & Kas 70%",
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
    badge: "Monitoring & Operasi 20%",
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

  // UI States (Idle, Loading, Error, Success)
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
        badge: "Sesi Aktif",
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
      {/* Top Floating Attribution & Theme Pill */}
      <BlurFade delay={0.05} inView>
        <div className="flex flex-wrap items-center justify-center gap-3 mb-4 sm:mb-6">
          <div
            className={`inline-flex items-center gap-2.5 pl-2.5 pr-4 py-1.5 rounded-full border shadow-xs transition-colors ${
              isLight
                ? "bg-white/80 border-[#d8e5d4] text-[#14261a]"
                : "bg-[#161b22] border-[#30363d] text-[#FAF8F5]"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span className="text-xs font-bold tracking-tight uppercase font-ui">
              excboncp.id
            </span>
            <span className="text-[10px] text-[#10b981] font-semibold border border-[#10b981]/40 px-2 py-0.5 rounded-full">
              Portal MRV
            </span>
          </div>

          {/* Theme Switcher Toggle (Soft Botanical vs Forest Dark) */}
          <button
            type="button"
            onClick={() =>
              setCardTheme((prev) => (prev === "light" ? "dark" : "light"))
            }
            aria-label={
              isLight
                ? "Ubah tampilan ke mode Forest Dark"
                : "Ubah tampilan ke mode Soft Botanical"
            }
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 min-h-[38px] rounded-full text-xs font-semibold border transition-all ${
              isLight
                ? "bg-white text-[#1f4d2e] border-[#d8e5d4] hover:bg-[#f5f9f3]"
                : "bg-[#161b22] text-[#10b981] border-[#30363d] hover:border-[#10b981]/50"
            }`}
          >
            {isLight ? (
              <>
                <Sun
                  className="w-3.5 h-3.5 text-amber-600"
                  aria-hidden="true"
                />
                <span>Soft Botanical</span>
              </>
            ) : (
              <>
                <Moon
                  className="w-3.5 h-3.5 text-[#10b981]"
                  aria-hidden="true"
                />
                <span>Forest Dark</span>
              </>
            )}
          </button>
        </div>
      </BlurFade>

      {/* Main Split Botanical Card */}
      <BlurFade delay={0.12} inView>
        <div
          className={`relative rounded-[28px] sm:rounded-[36px] p-3 sm:p-5 transition-colors duration-300 border ${
            isLight
              ? "bg-[#FFFFFF] text-[#14261a] border-[#d8e5d4] shadow-[0_20px_60px_rgba(20,38,26,0.06)]"
              : "bg-[#101610] text-[#FAF8F5] border-[#1f2937] shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1.08fr_1fr] gap-4 sm:gap-6 lg:gap-8 items-stretch">
            {/* LEFT COLUMN: Official Orangutan Mascot Stage */}
            <div className="w-full h-full">
              <LottieMascotStage
                activeField={activeField}
                showPassword={showPassword}
                isSubmitting={status === "loading"}
                cardTheme={cardTheme}
                paused={paused}
                onTogglePause={() => setPaused((p) => !p)}
                selectedRole={activeAccount.role}
              />
            </div>

            {/* RIGHT COLUMN: Minimalist Botanical Form Area */}
            <div className="flex flex-col justify-between px-4 sm:px-8 lg:px-9 py-6 sm:py-8">
              {/* Top Brand Mark */}
              <div className="flex items-center justify-center gap-2 mb-5 sm:mb-6">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
                <span
                  className={`text-[17px] font-bold tracking-tight uppercase font-ui ${
                    isLight ? "text-[#14261a]" : "text-[#FAF8F5]"
                  }`}
                >
                  Excboncp
                </span>
                <span className="text-[11px] font-ui font-medium px-2 py-0.5 rounded-full border border-[#10b981]/40 text-[#10b981]">
                  MRV Hutan
                </span>
              </div>

              {/* Center Form Block */}
              <div className="w-full max-w-[380px] mx-auto my-auto">
                {/* Title & Subtitle */}
                <div className="text-center mb-5 sm:mb-6">
                  <h1
                    className={`font-ui text-2xl sm:text-3xl font-bold tracking-tight leading-tight ${
                      isLight ? "text-[#14261a]" : "text-[#FAF8F5]"
                    }`}
                  >
                    {authMode === "login"
                      ? "Selamat Datang"
                      : authMode === "register"
                        ? "Daftar Akun Baru"
                        : "Pemulihan Akses"}
                  </h1>
                  <p
                    className={`font-ui mt-1 text-xs sm:text-[13px] leading-relaxed ${
                      isLight ? "text-[#4a5e4f]" : "text-[#FAF8F5]/70"
                    }`}
                  >
                    {authMode === "forgot"
                      ? "Masukkan email terdaftar untuk menerima petunjuk akses sandbox."
                      : authMode === "register"
                        ? "Daftarkan peran pemantauan hutan Anda pada jaringan Base Sepolia."
                        : "Pilih peran demo di bawah untuk masuk instan, atau isi kredensial."}
                  </p>
                </div>

                {/* Quick Demo Role Selector Pills (Shown on Login mode) */}
                {authMode === "login" && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wider font-ui ${
                          isLight ? "text-[#4a5e4f]" : "text-[#FAF8F5]/65"
                        }`}
                      >
                        Pilih Cepat Akun Demo:
                      </span>
                      <button
                        type="button"
                        onClick={handleClearFields}
                        className={`text-[11px] font-semibold underline underline-offset-2 transition-colors min-h-[28px] px-1 ${
                          isLight
                            ? "text-[#4a5e4f] hover:text-[#1f4d2e]"
                            : "text-[#FAF8F5]/70 hover:text-[#10b981]"
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
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all min-h-[34px] ${
                              isSelected
                                ? isLight
                                  ? "bg-[#1f4d2e] text-white border-[#1f4d2e] shadow-xs"
                                  : "bg-[#10b981] text-[#0d1117] border-[#10b981] shadow-xs"
                                : isLight
                                  ? "bg-[#f5f9f3] text-[#14261a] border-[#d8e5d4] hover:border-[#1f4d2e]/40"
                                  : "bg-[#161b22] text-[#FAF8F5]/80 border-[#30363d] hover:border-[#10b981]/50"
                            }`}
                          >
                            {acc.role}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SUCCESS STATE */}
                {status === "success" ? (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`rounded-2xl p-5 border ${
                      isLight
                        ? "bg-[#f5f9f3] border-[#d8e5d4] text-[#14261a]"
                        : "bg-[#161b22] border-[#30363d] text-[#FAF8F5]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        className="w-5 h-5 shrink-0 mt-0.5 text-[#10b981]"
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
                                ? "bg-[#e2f3e6] text-[#17692f]"
                                : "bg-[#10b981]/20 text-[#10b981]"
                            }`}
                          >
                            {activeAccount.badge}
                          </span>
                        </div>
                        <p
                          className={`text-xs mt-0.5 truncate ${
                            isLight ? "text-[#4a5e4f]" : "text-[#FAF8F5]/70"
                          }`}
                        >
                          {activeAccount.email} • {activeAccount.role}
                        </p>
                        <p
                          className={`mt-3 text-xs leading-relaxed ${
                            isLight ? "text-[#14261a]" : "text-[#FAF8F5]/85"
                          }`}
                        >
                          {authMode === "register"
                            ? "Pendaftaran akun berhasil! Sesi peran Anda telah aktif di jaringan sandbox ExcbonCP."
                            : "Sesi autentikasi berhasil diverifikasi. Hak akses sesuai peran telah diaktifkan pada jaringan sandbox Base Sepolia."}
                        </p>

                        <div className="mt-4 flex flex-col sm:flex-row gap-2">
                          <Link
                            href={activeAccount.destinationHref}
                            className={`flex-1 min-h-[44px] px-4 py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                              isLight
                                ? "bg-[#1f4d2e] hover:bg-[#143520] text-white shadow-xs"
                                : "bg-[#10b981] hover:bg-[#059669] text-[#0d1117] shadow-xs"
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
                                ? "bg-white text-[#14261a] border-[#d8e5d4] hover:bg-[#f5f9f3]"
                                : "bg-[#161b22] text-[#FAF8F5] border-[#30363d] hover:bg-[#1c222b]"
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
                        ? "bg-[#f5f9f3] border-[#d8e5d4] text-[#14261a]"
                        : "bg-[#161b22] border-[#30363d] text-[#FAF8F5]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <KeyRound
                        className="w-5 h-5 shrink-0 mt-0.5 text-[#10b981]"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-sm font-bold">
                          Pemulihan Akses Sandbox
                        </p>
                        <p
                          className={`text-xs mt-1 leading-relaxed ${
                            isLight ? "text-[#4a5e4f]" : "text-[#FAF8F5]/70"
                          }`}
                        >
                          Seluruh akun demo telah dikonfigurasi dengan kata sandi tetap{" "}
                          <strong className="font-semibold text-[#10b981]">
                            demo123
                          </strong>
                          . Silakan kembali ke halaman masuk dan pilih salah satu peran yang tersedia.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("login");
                            setStatus("idle");
                          }}
                          className={`mt-4 min-h-[40px] px-5 py-2 rounded-full text-xs font-bold ${
                            isLight
                              ? "bg-[#1f4d2e] text-white"
                              : "bg-[#10b981] text-[#0d1117]"
                          }`}
                        >
                          Kembali ke Halaman Masuk
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
                        ? "bg-[#f5f9f3] border-[#d8e5d4] text-[#14261a]"
                        : "bg-[#161b22] border-[#30363d] text-[#FAF8F5]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        className="w-5 h-5 shrink-0 mt-0.5 text-[#10b981]"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-sm font-bold">
                          Pendaftaran Akun Terbuka
                        </p>
                        <p
                          className={`text-xs mt-1 leading-relaxed ${
                            isLight ? "text-[#4a5e4f]" : "text-[#FAF8F5]/70"
                          }`}
                        >
                          Permintaan akun baru Anda telah dicatat. Untuk menguji
                          alur pemantauan langsung, Anda dapat masuk instan
                          menggunakan salah satu akun demo.
                        </p>
                        <Link
                          href="/login"
                          className={`mt-4 inline-flex min-h-[40px] px-5 py-2 rounded-full text-xs font-bold items-center gap-1.5 ${
                            isLight
                              ? "bg-[#1f4d2e] text-white"
                              : "bg-[#10b981] text-[#0d1117]"
                          }`}
                        >
                          Buka Halaman Masuk
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
                        className="flex items-start gap-2.5 p-3 rounded-xl border text-xs font-medium bg-[#fde3e1] border-[#f0b4ae] text-[#b3261e]"
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
                            className={`block text-xs font-semibold mb-1.5 ${
                              isLight ? "text-[#4a5e4f]" : "text-[#FAF8F5]/80"
                            }`}
                          >
                            Nama Lengkap
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
                            placeholder="Contoh: Budi Santoso"
                            className={`w-full rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all focus:outline-none border ${
                              isLight
                                ? "bg-[#f5f9f3] border-[#d8e5d4] text-[#14261a] focus:bg-white focus:border-[#1f4d2e] focus:ring-2 focus:ring-[#1f4d2e]/10"
                                : "bg-[#161b22] border-[#30363d] text-[#FAF8F5] focus:bg-[#1c222b] focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/15"
                            }`}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="excbon-register-role"
                            className={`block text-xs font-semibold mb-1.5 ${
                              isLight ? "text-[#4a5e4f]" : "text-[#FAF8F5]/80"
                            }`}
                          >
                            Peran dalam Ekosistem
                          </label>
                          <select
                            id="excbon-register-role"
                            value={selectedRoleLabel}
                            onChange={(e) =>
                              setSelectedRoleLabel(e.target.value)
                            }
                            className={`w-full rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all focus:outline-none border cursor-pointer ${
                              isLight
                                ? "bg-[#f5f9f3] border-[#d8e5d4] text-[#14261a] focus:bg-white focus:border-[#1f4d2e]"
                                : "bg-[#161b22] border-[#30363d] text-[#FAF8F5] focus:bg-[#1c222b] focus:border-[#10b981]"
                            }`}
                          >
                            <option value="Komunitas Adat">
                              Komunitas Adat (Hak Veto &amp; Kas 70%)
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
                        className={`block text-xs font-semibold mb-1.5 ${
                          isLight ? "text-[#4a5e4f]" : "text-[#FAF8F5]/80"
                        }`}
                      >
                        Alamat Email
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
                        placeholder="komunitas.a@demo.excboncp.test"
                        className={`w-full rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all focus:outline-none border ${
                          isLight
                            ? "bg-[#f5f9f3] border-[#d8e5d4] text-[#14261a] focus:bg-white focus:border-[#1f4d2e] focus:ring-2 focus:ring-[#1f4d2e]/10"
                            : "bg-[#161b22] border-[#30363d] text-[#FAF8F5] focus:bg-[#1c222b] focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/15"
                        }`}
                      />
                    </div>

                    {/* Password Input + Eye Visibility Toggle */}
                    {authMode !== "forgot" && (
                      <div>
                        <label
                          htmlFor="excbon-login-password"
                          className={`block text-xs font-semibold mb-1.5 ${
                            isLight ? "text-[#4a5e4f]" : "text-[#FAF8F5]/80"
                          }`}
                        >
                          Kata Sandi
                        </label>
                        <div className="relative flex items-center">
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
                            placeholder="demo123"
                            className={`w-full rounded-xl pl-3.5 pr-11 py-2.5 text-sm font-medium transition-all focus:outline-none border ${
                              isLight
                                ? "bg-[#f5f9f3] border-[#d8e5d4] text-[#14261a] focus:bg-white focus:border-[#1f4d2e] focus:ring-2 focus:ring-[#1f4d2e]/10"
                                : "bg-[#161b22] border-[#30363d] text-[#FAF8F5] focus:bg-[#1c222b] focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/15"
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
                            className={`absolute right-1.5 w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                              isLight
                                ? "text-[#4a5e4f] hover:text-[#14261a] hover:bg-black/5"
                                : "text-[#FAF8F5]/70 hover:text-[#FAF8F5] hover:bg-white/5"
                            }`}
                          >
                            {showPassword ? (
                              <EyeOff
                                className="w-4 h-4"
                                aria-hidden="true"
                              />
                            ) : (
                              <Eye
                                className="w-4 h-4"
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
                        <label className="inline-flex items-center gap-2 cursor-pointer min-h-[36px] py-1 select-none">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded border-[#d8e5d4] text-[#1f4d2e] focus:ring-2 focus:ring-[#1f4d2e] cursor-pointer accent-[#1f4d2e]"
                          />
                          <span
                            className={`text-xs font-medium ${
                              isLight ? "text-[#4a5e4f]" : "text-[#FAF8F5]/75"
                            }`}
                          >
                            {authMode === "register"
                              ? "Setujui aturan verifikasi terbuka"
                              : "Ingat saya di perangkat ini"}
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
                            className={`text-xs font-medium min-h-[36px] px-1 transition-colors ${
                              isLight
                                ? "text-[#4a5e4f] hover:text-[#1f4d2e]"
                                : "text-[#FAF8F5]/75 hover:text-[#10b981]"
                            }`}
                          >
                            Lupa kata sandi?
                          </button>
                        )}
                      </div>
                    )}

                    {/* Action Buttons Stack */}
                    <div className="pt-2 space-y-2.5">
                      <ShimmerButton
                        type="submit"
                        disabled={status === "loading"}
                        background={isLight ? "#1f4d2e" : "#10b981"}
                        shimmerColor="rgba(255,255,255,0.45)"
                        borderRadius="9999px"
                        className={`w-full min-h-[48px] text-sm font-semibold tracking-tight shadow-md transition-all hover:scale-[1.01] active:scale-95 ${
                          isLight ? "text-white" : "!text-[#0d1117]"
                        }`}
                      >
                        {status === "loading" ? (
                          <>
                            <Loader2
                              className="w-4 h-4 animate-spin mr-2"
                              aria-hidden="true"
                            />
                            <span>Memproses Masuk...</span>
                          </>
                        ) : authMode === "login" ? (
                          <span>Masuk ke Dashboard</span>
                        ) : authMode === "register" ? (
                          <span>Daftarkan Akun</span>
                        ) : (
                          <span>Kirim Tautan Pemulihan</span>
                        )}
                      </ShimmerButton>

                      {authMode !== "forgot" && (
                        <RippleButton
                          type="button"
                          disabled={status === "loading"}
                          onClick={handleGoogleLogin}
                          rippleColor={isLight ? "#d8e5d4" : "#2E3B2B"}
                          className={`w-full min-h-[46px] rounded-full text-xs sm:text-sm font-semibold border transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 ${
                            isLight
                              ? "bg-white hover:bg-[#f5f9f3] text-[#14261a] border-[#d8e5d4] shadow-xs"
                              : "bg-[#161b22] hover:bg-[#1c222b] text-[#FAF8F5] border-[#30363d] shadow-xs"
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
                          <span>Masuk dengan Google</span>
                        </RippleButton>
                      )}
                    </div>
                  </form>
                )}
              </div>

              {/* Bottom Footer Prompt */}
              <div className="mt-6 text-center">
                {authMode === "login" ? (
                  <p
                    className={`text-xs font-medium ${
                      isLight ? "text-[#4a5e4f]" : "text-[#FAF8F5]/70"
                    }`}
                  >
                    Belum memiliki akun peran?{" "}
                    <Link
                      href="/register"
                      className={`font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity ${
                        isLight ? "text-[#1f4d2e]" : "text-[#10b981]"
                      }`}
                    >
                      Daftar Akun
                    </Link>
                  </p>
                ) : (
                  <p
                    className={`text-xs font-medium ${
                      isLight ? "text-[#4a5e4f]" : "text-[#FAF8F5]/70"
                    }`}
                  >
                    Sudah memiliki akun?{" "}
                    <Link
                      href="/login"
                      className={`font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity ${
                        isLight ? "text-[#1f4d2e]" : "text-[#10b981]"
                      }`}
                    >
                      Masuk ke Akun
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
