import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeatureSpotlight } from "@/components/FeatureSpotlight";
import { ProcessJourneySection } from "@/components/ProcessJourneySection";
import { InteractiveMapPreview } from "@/components/InteractiveMapPreview";
import { LiveSimulationSection } from "@/components/LiveSimulationSection";
import { ClosingCtaPanel } from "@/components/ClosingCtaPanel";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="xb-home">
      <Navbar />
      <main className="flex-1">
        {/* 1. Anchor Pembuka: Hero Section + Live Metric Strip */}
        <HeroSection />

        {/* 2. Tiga Lapis Bukti & Keunggulan Deterministik (Gabungan DashboardPreviewStrip + FeatureSpotlight + ValueProposition) */}
        <FeatureSpotlight />

        {/* 3. Alur Verifikasi 5 Tahap */}
        <ProcessJourneySection />

        {/* 4. Pratinjau Geospasial & Status Izin Petak */}
        <InteractiveMapPreview />

        {/* 5. Laboratorium Simulasi Bagi Hasil, Sensor Api & Uji Segel SHA-256 (Gabungan LiveSimulation + TamperVerification) */}
        <LiveSimulationSection />

        {/* 6. Anchor Penutup: Eksplorasi 4 Peran Demo & CTA Utama */}
        <ClosingCtaPanel />
      </main>
      <Footer />
    </div>
  );
}
