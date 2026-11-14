"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Satellite,
  Flame,
  Trees,
  Cpu,
  CheckCircle2,
} from "lucide-react";

const TOTAL_FRAMES = 240;

const CHAPTERS = [
  { id: 1, progress: 0.04, label: "Ikhtisar", badge: "01 • Ikhtisar Hutan" },
  { id: 2, progress: 0.22, label: "Krisis", badge: "02 • Krisis Pasar" },
  { id: 3, progress: 0.40, label: "Satelit", badge: "03 • Pantauan Satelit" },
  { id: 4, progress: 0.58, label: "Adat", badge: "04 • Hak Masyarakat" },
  { id: 5, progress: 0.76, label: "Sensor", badge: "05 • Telemetri IoT" },
  { id: 6, progress: 0.94, label: "Segel", badge: "06 • Segel On-Chain" },
];

const getFramePath = (index: number) => {
  const padded = String(index + 1).padStart(3, "0");
  return `/keyframe-animation/frame-${padded}.webp`;
};

export default function ExcbonScrollCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const renderFrame = useCallback((progress: number) => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.8);
    const canvasWidth = canvas.width / dpr;
    const canvasHeight = canvas.height / dpr;

    const floatIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, progress * (TOTAL_FRAMES - 1)));
    const frameA = Math.floor(floatIndex);
    const frameB = Math.min(frameA + 1, TOTAL_FRAMES - 1);
    const blendFactor = floatIndex - frameA;

    const imgA = images[frameA];
    const imgB = images[frameB];
    if (!imgA || !imgA.complete || imgA.naturalWidth === 0) return;

    const imgWidth = imgA.naturalWidth;
    const imgHeight = imgA.naturalHeight;
    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth = canvasWidth;
    let drawHeight = canvasHeight;
    let drawX = 0;
    let drawY = 0;

    if (canvasRatio > imgRatio) {
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imgRatio;
      drawX = 0;
      drawY = (canvasHeight - drawHeight) / 2;
    } else {
      drawHeight = canvasHeight;
      drawWidth = canvasHeight * imgRatio;
      drawY = 0;
      drawX = (canvasWidth - drawWidth) / 2;

      if (canvasWidth < 768) {
        if (progress >= 0.48 && progress <= 0.68) {
          const t = Math.min(1, Math.max(0, (progress - 0.48) / 0.12));
          const leftBias = 0.14;
          drawX = (canvasWidth - drawWidth) * (0.50 - t * (0.50 - leftBias));
        } else if (progress > 0.68 && progress <= 0.86) {
          const t = Math.min(1, Math.max(0, (progress - 0.68) / 0.12));
          const leftBias = 0.14;
          const rightBias = 0.78;
          drawX = (canvasWidth - drawWidth) * (leftBias + t * (rightBias - leftBias));
        } else if (progress > 0.86) {
          // Scene 6 (Finale): Pan back to the Orangutan guardian looking directly at the user
          const t = Math.min(1, Math.max(0, (progress - 0.86) / 0.10));
          const rightBias = 0.78;
          const finalBias = 0.14;
          drawX = (canvasWidth - drawWidth) * (rightBias - t * (rightBias - finalBias));
        }
      }
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "medium";

    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.globalAlpha = 1;
    ctx.drawImage(imgA, drawX, drawY, drawWidth, drawHeight);

    if (blendFactor > 0.05 && frameB !== frameA && imgB && imgB.complete && imgB.naturalWidth > 0) {
      ctx.globalAlpha = blendFactor;
      ctx.drawImage(imgB, drawX, drawY, drawWidth, drawHeight);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }, [images]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.8);
    const width = window.innerWidth;
    const height = window.innerHeight;

    const targetWidth = Math.round(width * dpr);
    const targetHeight = Math.round(height * dpr);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    renderFrame(currentProgressRef.current);
  }, [renderFrame]);

  useEffect(() => {
    let loadedCount = 0;
    const loadedImages: HTMLImageElement[] = [];

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);

      const handleImageDone = () => {
        loadedCount++;
        setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));

        if (loadedCount === TOTAL_FRAMES) {
          setImages(loadedImages);
          setIsLoaded(true);
        }
      };

      img.onload = handleImageDone;
      img.onerror = handleImageDone;
      loadedImages.push(img);
    }

    return () => {
      loadedImages.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const animationLoop = () => {
      const target = targetProgressRef.current;
      const current = currentProgressRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.00005) {
        currentProgressRef.current += diff * 0.14;
        renderFrame(currentProgressRef.current);
      }

      rafIdRef.current = requestAnimationFrame(animationLoop);
    };

    rafIdRef.current = requestAnimationFrame(animationLoop);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [isLoaded, resizeCanvas, renderFrame]);

  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  const scrollToProgress = useCallback((p: number) => {
    if (!containerRef.current) return;
    const maxScroll = containerRef.current.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: containerRef.current.offsetTop + p * maxScroll,
      behavior: "smooth",
    });
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    targetProgressRef.current = progress;
    if (progress < 0.15) setActiveChapterIndex(0);
    else if (progress < 0.33) setActiveChapterIndex(1);
    else if (progress < 0.51) setActiveChapterIndex(2);
    else if (progress < 0.69) setActiveChapterIndex(3);
    else if (progress < 0.86) setActiveChapterIndex(4);
    else setActiveChapterIndex(5);
  });

  const scene1Opacity = useTransform(scrollYProgress, [0, 0.08, 0.16], [1, 1, 0]);
  const scene1Y = useTransform(scrollYProgress, [0, 0.16], [0, -15]);

  const scene2Opacity = useTransform(scrollYProgress, [0.12, 0.17, 0.28, 0.34], [0, 1, 1, 0]);
  const scene2Y = useTransform(scrollYProgress, [0.12, 0.17, 0.28, 0.34], [15, 0, 0, -15]);

  const scene3Opacity = useTransform(scrollYProgress, [0.30, 0.35, 0.46, 0.52], [0, 1, 1, 0]);
  const scene3Y = useTransform(scrollYProgress, [0.30, 0.35, 0.46, 0.52], [15, 0, 0, -15]);

  const scene4Opacity = useTransform(scrollYProgress, [0.48, 0.53, 0.64, 0.70], [0, 1, 1, 0]);
  const scene4Y = useTransform(scrollYProgress, [0.48, 0.53, 0.64, 0.70], [15, 0, 0, -15]);

  const scene5Opacity = useTransform(scrollYProgress, [0.66, 0.71, 0.82, 0.88], [0, 1, 1, 0]);
  const scene5Y = useTransform(scrollYProgress, [0.66, 0.71, 0.82, 0.88], [15, 0, 0, -15]);

  const scene6Opacity = useTransform(scrollYProgress, [0.85, 0.91, 1.0], [0, 1, 1]);
  const scene6Y = useTransform(scrollYProgress, [0.85, 0.91], [15, 0]);

  return (
    <>
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0d1117] text-[#FAF8F5] px-6 select-none"
          >
            <div className="w-full max-w-sm flex flex-col items-center text-center">
              <div className="flex items-center gap-2.5 mb-6">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
                <span className="font-telemetry text-xs font-semibold tracking-wider text-[#FAF8F5] uppercase">
                  EXCBONCP • MEMUAT ANIMASI
                </span>
              </div>

              <div className="w-full bg-[#1f2937] h-[2px] rounded-full overflow-hidden mb-4">
                <motion.div
                  className="bg-[#FAF8F5] h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${loadProgress}%` }}
                  transition={{ ease: "easeOut", duration: 0.15 }}
                />
              </div>

              <div className="flex items-center justify-between w-full font-telemetry text-xs text-[#FAF8F5]/60 mb-6">
                <span>Memuat gambar resolusi tinggi</span>
                <span className="text-[#FAF8F5] font-bold">{loadProgress}%</span>
              </div>

              <p className="font-ui text-xs text-[#FAF8F5]/45 leading-relaxed">
                Menyiapkan visual orbit bumi, kanopi hutan tropis, dan telemetri sensor
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="fixed top-0 left-0 right-0 z-40 border-b border-[#1f2937]/50 bg-[#0d1117]/70 backdrop-blur-md transition-colors duration-200">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span className="font-ui text-sm font-bold tracking-tight uppercase text-[#FAF8F5]">
              excboncp
            </span>
            <span className="hidden sm:inline-block font-ui text-[11px] text-[#10b981] border border-[#10b981]/40 px-2 py-0.5 rounded-full">
              MRV Hutan
            </span>
          </Link>

          {/* Mobile Current Chapter Indicator (Embedded cleanly in header, no floating clutter) */}
          <div className="sm:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-ui text-[#FAF8F5]/90">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            <span>{CHAPTERS[activeChapterIndex].label}</span>
            <span className="text-white/40">({activeChapterIndex + 1}/6)</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/peta"
              className="hidden md:inline-flex items-center gap-1.5 font-ui text-xs px-3.5 py-1.5 rounded-full border border-[#1f2937] bg-[#161b22]/80 text-[#FAF8F5] hover:border-[#10b981] transition-colors"
            >
              <Satellite className="w-3.5 h-3.5 text-[#10b981]" />
              <span>Peta &amp; Telemetri</span>
            </Link>

            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 font-ui text-xs px-3.5 sm:px-4 py-1.5 rounded-full bg-[#10b981] text-[#0d1117] font-semibold hover:bg-[#059669] transition-colors"
            >
              <span>Buka Dasbor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Ambient Reading Progress Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
          <div
            className="h-full bg-[#10b981] transition-all duration-300"
            style={{ width: `${((activeChapterIndex + 1) / 6) * 100}%` }}
          />
        </div>
      </header>

      {/* Desktop Vertical Chapter Rail (Right Edge) */}
      <div className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 z-30 flex-col gap-3 pointer-events-none">
        {CHAPTERS.map((ch, idx) => {
          const isActive = idx === activeChapterIndex;
          return (
            <button
              key={ch.id}
              onClick={() => scrollToProgress(ch.progress)}
              className="group pointer-events-auto flex items-center justify-end gap-3 text-right"
              aria-label={`Lompat ke Bab ${ch.id}: ${ch.label}`}
            >
              <span
                className={`font-ui text-xs font-medium tracking-wide transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                  isActive ? "!opacity-100 text-[#10b981] font-semibold" : "text-[#FAF8F5]/60 hover:text-[#FAF8F5]"
                }`}
              >
                {ch.badge}
              </span>
              <span
                className={`h-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? "w-6 bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                    : "w-2 bg-white/20 group-hover:bg-white/50 group-hover:w-3"
                }`}
              />
            </button>
          );
        })}
      </div>

      <div
        ref={containerRef}
        className="relative h-[800vh] w-full bg-[#0d1117]"
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full block object-cover contrast-[1.04] brightness-[1.02] saturate-[1.03]"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(13,17,23,0.3)_100%)]"
          />

          {/* Floating Immersive Text Overlays */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Scene 1 (0% Scroll) - Centered Hero */}
            <motion.div
              style={{ opacity: scene1Opacity, y: scene1Y }}
              className="absolute inset-x-3 bottom-6 sm:bottom-10 md:inset-0 md:flex md:flex-col md:items-center md:justify-center text-center px-0 md:px-6 pointer-events-none"
            >
              <div className="max-w-2xl mx-auto flex flex-col items-center bg-[#0d1117]/85 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-5 sm:p-6 md:p-0 rounded-2xl md:rounded-none border border-white/10 md:border-transparent shadow-2xl md:shadow-none pointer-events-auto">
                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-2.5 sm:mb-4 drop-shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                  01 • Sistem Pemantauan Hutan Terbuka
                </span>

                <h1 className="font-ui text-xl sm:text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#FAF8F5] leading-tight text-balance drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                  Membuktikan Kondisi Hutan, Sebelum Menghitung Nilai.
                </h1>

                <p className="font-ui mt-2 sm:mt-4 text-xs sm:text-base md:text-lg text-[#FAF8F5]/90 max-w-xl font-normal leading-relaxed drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
                  ExcbonCP menggabungkan citra satelit dan sensor di pepohonan langsung ke buku catatan publik, memastikan klaim penyerapan karbon benar-benar nyata dan dapat diperiksa siapa saja.
                </p>

                <div className="mt-4 sm:mt-8 flex items-center gap-2 font-ui text-[11px] sm:text-xs text-[#FAF8F5]/60 drop-shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                  <span>Gulir ke bawah untuk memulai perjalanan</span>
                </div>
              </div>
            </motion.div>

            {/* Scene 2 (Krisis Pasar Karbon Lama) */}
            <motion.div
              style={{ opacity: scene2Opacity, y: scene2Y }}
              className="absolute inset-x-3 bottom-6 sm:bottom-10 md:inset-0 md:flex md:items-center px-0 md:px-14 lg:px-24 pointer-events-none"
            >
              <div className="max-w-xl text-left bg-[#0d1117]/85 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-5 sm:p-6 md:p-0 rounded-2xl md:rounded-none border border-white/10 md:border-transparent shadow-2xl md:shadow-none pointer-events-auto">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-2.5 sm:mb-4 drop-shadow-sm">
                  <Flame className="w-3.5 h-3.5" />
                  02 • Krisis Pasar Karbon Lama
                </span>

                <h2 className="font-ui text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#FAF8F5] leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                  Banyak Sertifikat, Minim Bukti Lapangan.
                </h2>

                <p className="font-ui mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-[#FAF8F5]/90 leading-relaxed drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
                  Pasar karbon konvensional kerap bermasalah karena klaim sepihak di atas kertas. Saat terjadi kebakaran hutan atau kerusakan pohon, proses audit manual butuh waktu berbulan-bulan hingga terlambat bertahun-tahun.
                </p>

                <div className="mt-3.5 sm:mt-5 flex items-center gap-3 sm:gap-4 font-ui text-[11px] sm:text-xs text-[#FAF8F5]/80 drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
                  <span className="flex items-center gap-1.5 text-[#ef4444]">
                    <span>•</span> Audit manual lambat
                  </span>
                  <span className="flex items-center gap-1.5 text-[#10b981]">
                    <span>•</span> Solusi: Data sensor otomatis
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Scene 3 (Pantauan dari Antariksa) */}
            <motion.div
              style={{ opacity: scene3Opacity, y: scene3Y }}
              className="absolute inset-x-3 bottom-6 sm:bottom-10 md:inset-0 md:flex md:items-center md:justify-end px-0 md:px-14 lg:px-24 pointer-events-none"
            >
              <div className="max-w-xl text-left bg-[#0d1117]/85 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-5 sm:p-6 md:p-0 rounded-2xl md:rounded-none border border-white/10 md:border-transparent shadow-2xl md:shadow-none pointer-events-auto">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-2.5 sm:mb-4 drop-shadow-sm">
                  <Satellite className="w-3.5 h-3.5" />
                  03 • Pantauan dari Antariksa
                </span>

                <h2 className="font-ui text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#FAF8F5] leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                  Melihat Tutupan Hijau Menembus Awan.
                </h2>

                <p className="font-ui mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-[#FAF8F5]/90 leading-relaxed drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
                  Radar satelit Copernicus mengamati kerapatan daun dan biomassa hutan Kalimantan dari orbit bumi secara berkala. Analisis spektral memastikan data kondisi vegetasi tidak bisa dimanipulasi dari kejauhan.
                </p>

                <div className="mt-3.5 sm:mt-5 flex flex-wrap items-center gap-2 sm:gap-4 font-ui text-[11px] sm:text-xs text-[#FAF8F5]/80 drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
                  <span className="text-[#10b981] font-semibold">Resolusi 10 Meter</span>
                  <span>•</span>
                  <span>Indeks NDVI 0.81</span>
                  <span>•</span>
                  <span>Petak 600 Ha Terverifikasi</span>
                </div>
              </div>
            </motion.div>

            {/* Scene 4 (Penjaga Alami di Bawah Kanopi) */}
            <motion.div
              style={{ opacity: scene4Opacity, y: scene4Y }}
              className="absolute inset-x-3 bottom-6 sm:bottom-10 md:inset-0 md:flex md:items-center md:justify-end px-0 md:px-14 lg:px-24 pointer-events-none"
            >
              <div className="max-w-xl text-left bg-[#0d1117]/85 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-5 sm:p-6 md:p-0 rounded-2xl md:rounded-none border border-white/10 md:border-transparent shadow-2xl md:shadow-none pointer-events-auto">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-2.5 sm:mb-4 drop-shadow-sm">
                  <Trees className="w-3.5 h-3.5" />
                  04 • Penjaga Alami di Bawah Kanopi
                </span>

                <h2 className="font-ui text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#FAF8F5] leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                  Warga Adat Memegang Hak Penuh.
                </h2>

                <p className="font-ui mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-[#FAF8F5]/90 leading-relaxed drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
                  Di bawah lebatnya hutan tropis, masyarakat desa merawat lingkungan bersama satwa liar seperti orangutan. Tanpa izin tertulis 70% kuorum warga adat, sistem menolak penerbitan sertifikat karbon apapun.
                </p>

                <div className="mt-3.5 sm:mt-5 flex flex-wrap items-center gap-2 sm:gap-4 font-ui text-[11px] sm:text-xs text-[#FAF8F5]/80 drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
                  <span className="text-[#10b981] font-semibold">Hak Veto Komunitas</span>
                  <span>•</span>
                  <span>Konsensus Musyawarah Sah</span>
                  <span>•</span>
                  <span>Perlindungan Habitat Asli</span>
                </div>
              </div>
            </motion.div>

            {/* Scene 5 (Saksi Fisik di Pepohonan) */}
            <motion.div
              style={{ opacity: scene5Opacity, y: scene5Y }}
              className="absolute inset-x-3 bottom-6 sm:bottom-10 md:inset-0 md:flex md:items-center px-0 md:px-14 lg:px-24 pointer-events-none"
            >
              <div className="max-w-xl text-left bg-[#0d1117]/85 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-5 sm:p-6 md:p-0 rounded-2xl md:rounded-none border border-white/10 md:border-transparent shadow-2xl md:shadow-none pointer-events-auto">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#60a5fa]/15 text-[#60a5fa] border border-[#60a5fa]/30 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-2.5 sm:mb-4 drop-shadow-sm">
                  <Cpu className="w-3.5 h-3.5" />
                  05 • Saksi Fisik di Pepohonan
                </span>

                <h2 className="font-ui text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#FAF8F5] leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                  Sensor yang Bekerja Tanpa Kompromi.
                </h2>

                <p className="font-ui mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-[#FAF8F5]/90 leading-relaxed drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
                  Perangkat kecil bertenaga mandiri terpasang di batang pohon untuk memantau suhu, kelembapan tanah, dan titik api tiap 5 detik. Jika ada bahaya nyala api, sistem otomatis membekukan unit karbon saat itu juga.
                </p>

                <div className="mt-3.5 sm:mt-5 flex flex-wrap items-center gap-2 font-ui text-[11px] sm:text-xs text-[#FAF8F5]/80 drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
                  <span className="px-2.5 py-1 rounded-full bg-[#161b22]/70 border border-[#1f2937]">
                    Suhu: 31.4°C
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#161b22]/70 border border-[#1f2937] text-[#10b981]">
                    Api: Aman (0)
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#161b22]/70 border border-[#1f2937]">
                    Tanah: 57%
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#161b22]/70 border border-[#1f2937]">
                    Tiap 5 detik
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Scene 6 (Terbuka & Tersegel Permanen) */}
            <motion.div
              style={{ opacity: scene6Opacity, y: scene6Y }}
              className="absolute inset-x-0 bottom-0 md:pb-8 lg:pb-10 px-0 md:px-6 flex flex-col items-center justify-end pointer-events-none"
            >
              {/* Soft atmospheric floor gradient on desktop to cleanly anchor buttons */}
              <div
                aria-hidden="true"
                className="hidden md:block absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#0d1117]/90 via-[#0d1117]/40 to-transparent pointer-events-none -z-10"
              />

              {/* Mobile: Flush Bottom Sheet | Desktop: Floating Center-Balanced Typography (STRICTLY NO CARD BOX) */}
              <div className="relative w-full md:max-w-lg lg:max-w-xl text-left md:text-center bg-gradient-to-t from-[#0d1117] via-[#0d1117]/95 to-[#0d1117]/85 md:bg-none md:bg-transparent backdrop-blur-xl md:backdrop-blur-none px-5 pt-3.5 pb-6 sm:pb-8 md:p-0 rounded-t-3xl md:rounded-none border-t border-white/10 md:border-none shadow-2xl md:shadow-none pointer-events-auto flex flex-col md:items-center">
                {/* Desktop soft natural vignette behind text (invisible edges, pure legibility) */}
                <div
                  aria-hidden="true"
                  className="hidden md:block absolute -inset-x-8 -inset-y-6 -z-10 rounded-full bg-[#0d1117]/65 blur-3xl pointer-events-none"
                />

                {/* Mobile Drag Indicator Handle */}
                <div className="md:hidden w-8 h-1 rounded-full bg-white/20 mx-auto mb-2.5" />

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161b22]/90 text-[#10b981] border border-[#10b981]/40 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-2.5 w-fit md:mx-auto shadow-md backdrop-blur-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
                  06 • Terbuka &amp; Tersegel Permanen
                </span>

                <h2 className="font-ui text-lg sm:text-2xl md:text-3xl lg:text-[32px] font-bold tracking-tight text-[#FAF8F5] leading-snug drop-shadow-[0_2px_16px_rgba(0,0,0,1)] max-w-lg md:mx-auto md:text-center">
                  Dari Akar Pohon ke Buku Catatan Publik.
                </h2>

                <p className="font-ui mt-1.5 sm:mt-2 text-xs sm:text-sm text-[#FAF8F5]/90 max-w-md md:mx-auto leading-relaxed drop-shadow-[0_1px_10px_rgba(0,0,0,1)] md:text-center">
                  Seluruh riwayat bukti disegel secara digital di jaringan Base Sepolia EAS. Terbuka diaudit siapa saja, dengan 70% bagian hasil mengalir langsung ke kas masyarakat adat yang menjaga hutan.
                </p>

                <div className="mt-2.5 sm:mt-3 flex flex-wrap items-center md:justify-center gap-x-3.5 gap-y-1.5 font-ui text-[11px] sm:text-xs text-[#FAF8F5]/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full md:bg-[#161b22]/70 md:border md:border-[#1f2937]">
                    <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                    <strong className="text-[#10b981] font-semibold">70%</strong>
                    <span>Kas Desa Adat</span>
                  </span>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full md:bg-[#161b22]/70 md:border md:border-[#1f2937]">
                    <span className="w-2 h-2 rounded-full bg-[#60a5fa]" />
                    <strong className="text-[#FAF8F5] font-semibold">20%</strong>
                    <span>Pengelola Hutan</span>
                  </span>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full md:bg-[#161b22]/70 md:border md:border-[#1f2937]">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <strong className="text-[#FAF8F5] font-semibold">10%</strong>
                    <span>Dana Cadangan</span>
                  </span>
                </div>

                <div className="mt-3.5 sm:mt-4 flex flex-col sm:flex-row items-stretch sm:items-center md:justify-center gap-2.5 sm:gap-3">
                  <Link
                    href="/app"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 rounded-full bg-[#10b981] hover:bg-[#059669] text-[#0d1117] font-ui font-semibold text-xs sm:text-sm shadow-lg shadow-[#10b981]/25 transition-all hover:scale-[1.02] active:scale-95 text-center"
                  >
                    <span>Buka Dasbor Platform</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/verifikasi"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 rounded-full bg-[#161b22]/90 hover:bg-[#21262d] text-[#FAF8F5] border border-[#30363d] hover:border-[#10b981]/50 font-ui font-semibold text-xs sm:text-sm backdrop-blur-sm shadow-md transition-all hover:scale-[1.02] active:scale-95 text-center"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                    <span>Periksa Segel Verifikasi</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
