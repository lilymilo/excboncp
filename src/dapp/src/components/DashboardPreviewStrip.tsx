"use client";

import MagicBento, { type MagicBentoItem } from "@/components/MagicBento";

export function DashboardPreviewStrip() {
  const bentoItems: MagicBentoItem[] = [
    {
      id: "analytics",
      label: "Sentinel-2 & Biomassa",
      title: "Indeks NDVI & Serapan Karbon",
      description: "600 tCO2e terverifikasi dari data spektral satelit dengan kenaikan +4.2% tutupan hijau kanopi.",
      visual: "analytics",
      colSpan: 1,
      rowSpan: 1,
    },
    {
      id: "telemetry",
      label: "Node Fisik ESP32",
      title: "Telemetri IoT Kanopi Lapangan",
      description: "Suhu kanopi 31.4°C stabil, sensor api KY-026 aman, dan kelembapan kapasitif tanah 57%.",
      visual: "dashboard",
      colSpan: 1,
      rowSpan: 1,
    },
    {
      id: "community",
      label: "Mahakam Ulu • Petak #01",
      title: "Konsensus Masyarakat Adat",
      description: "Persetujuan tertulis FPIC 600 Ha sah dan terkunci. 60% pembagian hasil dialirkan langsung ke kas adat.",
      visual: "collaboration",
      colSpan: 2,
      rowSpan: 2,
    },
    {
      id: "pipeline",
      label: "Aturan Deterministik R5",
      title: "Pipa Otomasi MRV Tanpa Celah",
      description: "Alur kode otomatis: validasi telemetri, kalkulasi CO2e, hingga verifikasi silang tanpa intervensi manual.",
      visual: "automation",
      colSpan: 2,
      rowSpan: 2,
    },
    {
      id: "integration",
      label: "Arsitektur Terbuka",
      title: "Integrasi Multi-Sumber Terpercaya",
      description: "Menghubungkan citra satelit ESA, sensor IoT di pepohonan, serta platform audit publik.",
      visual: "integration",
      colSpan: 1,
      rowSpan: 1,
    },
    {
      id: "security",
      label: "Segel Kriptografi R9",
      title: "Buku Catatan SHA-256 & EAS",
      description: "Setiap laporan disegel ke dalam rantai hash permanen di Base Sepolia, kebal pemalsuan audit.",
      visual: "security",
      colSpan: 1,
      rowSpan: 1,
    },
  ];

  return (
    <section id="dashboard" className="pt-6 pb-16 sm:pb-24">
      <div className="page-shell">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-[#171C16] border border-[#252D22] text-[0.75rem] font-medium text-[#A8AFA2] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#AEDA2D] animate-pulse" />
            <span>Kanvas Interaktif Bukti Lapangan</span>
          </div>
          <h2 className="text-[clamp(1.8rem,3.2vw,2.75rem)] font-normal text-[#F0F2EC] tracking-tight leading-[1.18]">
            Seluruh dimensi bukti hutan,{" "}
            <span className="text-[#AEDA2D]">terhubung secara deterministik.</span>
          </h2>
          <p className="mt-3 text-[0.92rem] text-[#A8AFA2] leading-relaxed max-w-[62ch]">
            Dekatkan kursor Anda ke setiap panel bento untuk merasakan interaksi cahaya tepi (*edge glow*),
            partikel hidup, dan bukti berlapis yang saling mengunci status verifikasi.
          </p>
        </div>

        {/* Magic Bento Grid from React Bits */}
        <div className="w-full">
          <MagicBento
            items={bentoItems}
            glowColor="#AEDA2D"
            columns={3}
            gap={16}
            radius={18}
            enableBorderGlow={true}
            enableSpotlight={true}
            enableStars={true}
            enableTilt={true}
            clickEffect={true}
            theme="dark"
            className="w-full"
          />
        </div>
      </div>
    </section>
  );
}
