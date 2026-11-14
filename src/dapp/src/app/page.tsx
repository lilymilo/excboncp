import { Navbar } from "@/components/Navbar";
import { ScrollStorySection } from "@/components/landing/ScrollStorySection";
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
        {/* 1. Cinematic Scroll-Driven Storytelling (Bumi -> Awan -> Indonesia -> Hutan -> Orangutan -> Panorama Hutan & CTA) */}
        <ScrollStorySection />

        {/* 2. Platform Interactive Modules & Sandboxes */}
        <div id="fitur" className="relative z-10 bg-[#0c120d]">
          {/* Dashboard Preview Strip (1fr 1fr 1.55fr, overview cards + lime area chart) */}
          <DashboardPreviewStrip />

          {/* Feature Spotlight (Editorial narrative + interactive mini-interface with filter chips) */}
          <FeatureSpotlight />

          {/* Value Proposition Cards (1 Featured Lime card + 2 dark data viz cards) */}
          <ValuePropositionCards />

          {/* Process Journey Section (2-column intro + 5 numbered horizontal rows 01-05) */}
          <ProcessJourneySection />

          {/* Interactive Geospatial Parcel Verification Sandbox */}
          <InteractiveMapPreview />

          {/* Live Economic Revenue Sharing & Fire Sensor Freeze Simulation */}
          <LiveSimulationSection />

          {/* Cryptographic Public Tamper Verification Demo (SHA-256) */}
          <TamperVerificationDemo />

          {/* 4-Role Exploration Sandbox */}
          <GetStartedSection />

          {/* Closing CTA Panel */}
          <ClosingCtaPanel />
        </div>
      </main>
      <Footer />
    </>
  );
}
