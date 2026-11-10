import Link from "next/link";
import {
  Users,
  Trees,
  Factory,
  ClipboardCheck,
  ArrowRight,
  LogIn,
  UserPlus,
} from "lucide-react";

export function GetStartedSection() {
  const roles = [
    {
      id: "komunitas",
      title: "Komunitas Adat",
      desc: "Melihat laporan lahan sendiri, memberikan atau mencabut izin, dan mengecek bagian kas 60%.",
      icon: Users,
      badge: "Hak Veto",
    },
    {
      id: "pengelola",
      title: "Pengelola Hutan",
      desc: "Memantau kondisi sensor pohon, status radar satelit, dan unit yang siap masuk pasar.",
      icon: Trees,
      badge: "Monitoring",
    },
    {
      id: "penerima",
      title: "Kawasan Industri (KEK)",
      desc: "Melihat laporan pemakaian unit karbon untuk kawasan industri hijau tanpa klaim fiktif.",
      icon: Factory,
      badge: "Penerima",
    },
    {
      id: "auditor",
      title: "Auditor Independen",
      desc: "Meninjau seluruh bukti fisik sebelum menyetujui penguncian segel digital permanen.",
      icon: ClipboardCheck,
      badge: "Penyetuju",
    },
  ];

  return (
    <section id="demo" className="py-20 sm:py-28 border-t border-[#1B211A]">
      <div className="page-shell">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-[0.75rem] font-semibold text-[#AEDA2D] uppercase tracking-wider block mb-2">
            Akses Eksplorasi 4 Peran
          </span>
          <h2 className="text-[clamp(2.1rem,3.5vw,3.2rem)] font-normal text-[#F0F2EC] leading-[1.18] tracking-tight">
            Coba langsung lewat{" "}
            <span className="text-[#AEDA2D]">browser kamu</span>.
          </h2>
          <p className="mt-4 text-[0.95rem] text-[#A8AFA2] leading-relaxed">
            Tidak perlu unduh aplikasi dan tidak perlu dompet kripto. Pilih
            salah satu peran contoh untuk masuk otomatis ke halaman Login, atau
            buat akun baru di halaman Register.
          </p>

          {/* Direct Links to Dedicated /login and /register Pages */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="button-touch inline-flex items-center gap-2 px-5 py-2.5 rounded-pill text-xs font-semibold bg-[#AEDA2D] text-[#11160B] hover:brightness-105 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Halaman Log In</span>
            </Link>
            <Link
              href="/register"
              className="button-touch inline-flex items-center gap-2 px-5 py-2.5 rounded-pill text-xs font-semibold bg-[#171C16] text-[#F0F2EC] border border-[#252D22] hover:bg-[#1D231B] hover:border-[#64753E] transition-all"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#AEDA2D]" aria-hidden="true" />
              <span>Halaman Register</span>
            </Link>
          </div>
        </div>

        {/* 4 Roles Grid linking directly to /login?role=... */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <Link
                key={r.title}
                href={`/login?role=${r.id}`}
                className="surface-card p-6 sm:p-7 flex flex-col justify-between transition-all hover:border-[#AEDA2D]/40 group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-panel bg-[#171C16] border border-[#252D22] flex items-center justify-center text-[#AEDA2D] group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#171C16] border border-[#252D22] text-[10px] font-mono text-[#A8AFA2]">
                      {r.badge}
                    </span>
                  </div>

                  <h3 className="text-[1.1rem] font-medium text-[#F0F2EC] tracking-tight group-hover:text-[#AEDA2D] transition-colors">
                    {r.title}
                  </h3>
                  <p className="mt-2.5 text-xs text-[#9CA596] leading-relaxed">
                    {r.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#1B211A] flex items-center justify-between text-xs font-medium text-[#A8AFA2] group-hover:text-[#F0F2EC] transition-colors">
                  <span>Masuk Akun Demo</span>
                  <ArrowRight
                    className="w-3.5 h-3.5 text-[#AEDA2D] group-hover:translate-x-1 transition-transform"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
