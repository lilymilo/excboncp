import ExcbonScrollCanvas from "@/components/ExcbonScrollCanvas";
import "@/styles/fonts";

export const metadata = {
  title: "ExcbonCP | Decentralized Forest MRV & Telemetry",
  description:
    "Protecting global carbon sinks through verifiable ground-truth telemetry and on-chain integrity on Base Sepolia EAS.",
};

export default function Home() {
  return (
    <main className="w-full bg-[#0d1117] text-[#FAF8F5] min-h-screen selection:bg-[#10b981]/25 selection:text-[#FAF8F5]">
      <ExcbonScrollCanvas />
    </main>
  );
}
