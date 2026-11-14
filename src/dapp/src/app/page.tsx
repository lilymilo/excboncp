import { Navbar } from "@/components/Navbar";
import { ScrollStorySection } from "@/components/landing/ScrollStorySection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Full-Page Cinematic Scroll-Driven Storytelling (Bumi -> Awan -> Indonesia -> Kanopi Rimba -> Orangutan & Node IoT -> Panorama Rimba & CTA Utama) */}
        <ScrollStorySection />
      </main>
      <Footer />
    </>
  );
}
