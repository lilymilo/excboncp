"use client";

import { ArrowRight, ShieldCheck } from "lucide-react";
import SpecularButton from "@/components/SpecularButton";

export function ClosingCtaPanel() {
  return (
    <section className="py-20 sm:py-28">
      <div className="page-shell">
        {/* Wide Centered Panel with Green Vignette (Section 4.8) */}
        <div className="relative rounded-card bg-[#101610] border border-[#252D22] p-8 sm:p-16 text-center overflow-hidden shadow-panel">
          {/* Subtle Side Vignette Gradients */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#64753E]/12 to-transparent pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#64753E]/12 to-transparent pointer-events-none"
          />

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <span className="text-[0.75rem] font-semibold text-[#AEDA2D] uppercase tracking-wider block mb-3">
              Mulai Uji Coba Sekarang
            </span>
            <h2 className="text-[clamp(2.1rem,3.8vw,3.5rem)] font-normal text-[#F0F2EC] leading-[1.14] tracking-tight">
              Buktikan integritas karbon hutan,{" "}
              <span className="text-[#AEDA2D]">langsung di browser</span> kamu.
            </h2>
            <p className="mt-5 text-[0.95rem] text-[#A8AFA2] leading-relaxed max-w-[50ch]">
              Tanpa unduh aplikasi dan tanpa uang sungguhan. Masuk dengan empat akun contoh
              untuk memeriksa seluruh alur dari sensor hingga segel digital.
            </p>

            <div className="mt-8">
              {/* Primary CTA — SpecularButton from React Bits */}
              <SpecularButton
                size="lg"
                radius={999}
                lineColor="#FFFFFF"
                baseColor="#D8F57A"
                textColor="#11160B"
                tint="#AEDA2D"
                tintOpacity={1}
                intensity={1.65}
                idleIntensity={0.7}
                glow={1.5}
                thickness={1.8}
                shineSize={16}
                shineFade={30}
                autoAnimate={true}
                onClick={() => {
                  const el = document.getElementById("demo");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  backgroundColor: "#AEDA2D",
                  color: "#11160B",
                  boxShadow: "0 0 40px rgba(174,218,45,0.35), inset 0 1px 1px rgba(255,255,255,0.45)",
                }}
              >
                Coba 4 Akun Demo
                <ArrowRight className="w-5 h-5" />
              </SpecularButton>
            </div>

            <div className="mt-6 flex items-center gap-1.5 text-[0.75rem] text-[#747D70]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#64753E]" />
              <span>Jalur pengujian 5 menit siap saji untuk juri dan panitia</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
