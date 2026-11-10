import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { DashboardPreviewStrip } from "@/components/DashboardPreviewStrip";
import { FeatureSpotlight } from "@/components/FeatureSpotlight";
import { ValuePropositionCards } from "@/components/ValuePropositionCards";
import { ProcessJourneySection } from "@/components/ProcessJourneySection";
import { InteractiveMapPreview } from "@/components/InteractiveMapPreview";
import { LiveSimulationSection } from "@/components/LiveSimulationSection";
import { TamperVerificationDemo } from "@/components/TamperVerificationDemo";
import { GetStartedSection } from "@/components/GetStartedSection";
import { ClosingCtaPanel } from "@/components/ClosingCtaPanel";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* 1. Hero Section (Centered, Eyebrow, 2-tone headline, dual CTA, halo) */}
        <HeroSection />

        {/* 2. Dashboard Preview Strip (1fr 1fr 1.55fr, overview cards + lime area chart) */}
        <DashboardPreviewStrip />

        {/* 3. Feature Spotlight (Editorial narrative + interactive mini-interface with filter chips) */}
        <FeatureSpotlight />

        {/* 4. Value Proposition Cards (1 Featured Lime card + 2 dark data viz cards) */}
        <ValuePropositionCards />

        {/* 5. Process Journey Section (2-column intro + 5 numbered horizontal rows 01-05) */}
        <ProcessJourneySection />

        {/* 6. Interactive Geospatial Parcel Verification Sandbox */}
        <InteractiveMapPreview />

        {/* 7. Live Economic Revenue Sharing & Fire Sensor Freeze Simulation */}
        <LiveSimulationSection />

        {/* 8. Cryptographic Public Tamper Verification Demo (SHA-256) */}
        <TamperVerificationDemo />

        {/* 9. 4-Role Exploration Sandbox */}
        <GetStartedSection />

        {/* 10. Closing CTA Panel (Wide centered panel with side green vignettes) */}
        <ClosingCtaPanel />
      </main>
      <Footer />
    </>
  );
}
