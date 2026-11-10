import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto py-16 border-t border-[#1B211A] text-[#747D70] text-[0.8rem]">
      <div className="page-shell flex flex-col gap-12">
        {/* Four-Column Layout (Section 4.9) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          
          {/* Column 1: Brand Mark & Summary */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 font-semibold text-[#F0F2EC]">
              <span className="w-2 h-2 rounded-full bg-[#AEDA2D] shadow-[0_0_6px_rgba(174,218,45,0.7)]" />
              <span className="text-sm font-semibold tracking-tight">excboncp</span>
            </div>
            <p className="text-[0.8rem] text-[#A8AFA2] leading-relaxed">
              Platform sistem modeling pembuktian integritas karbon hutan dan simulasi pasar
              terbuka di jaringan testnet.
            </p>
            <div className="flex items-center gap-3 pt-2 text-[0.75rem] text-[#AEDA2D]">
              <Link href="https://github.com" className="hover:underline">
                GitHub Repo
              </Link>
              <span>&bull;</span>
              <Link href="#verifikasi" className="hover:underline">
                Base Sepolia EAS
              </Link>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-3">
            <span className="text-[0.75rem] font-semibold text-[#F0F2EC] uppercase tracking-wider block">
              Navigasi Halaman
            </span>
            <ul className="space-y-2 text-[#A8AFA2]">
              <li>
                <Link href="#dashboard" className="hover:text-[#F0F2EC] transition-colors">
                  Dashboard Bukti
                </Link>
              </li>
              <li>
                <Link href="#peta" className="hover:text-[#F0F2EC] transition-colors">
                  Peta Petak Hutan
                </Link>
              </li>
              <li>
                <Link href="#fitur" className="hover:text-[#F0F2EC] transition-colors">
                  Multi-Layer Verification
                </Link>
              </li>
              <li>
                <Link href="#simulasi" className="hover:text-[#F0F2EC] transition-colors">
                  Simulasi Bagi Hasil
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Features & Services */}
          <div className="space-y-3">
            <span className="text-[0.75rem] font-semibold text-[#F0F2EC] uppercase tracking-wider block">
              Komponen Sistem
            </span>
            <ul className="space-y-2 text-[#A8AFA2]">
              <li>
                <Link href="#fitur" className="hover:text-[#F0F2EC] transition-colors">
                  Sentinel-1 &amp; Sentinel-2 (GEE)
                </Link>
              </li>
              <li>
                <Link href="#fitur" className="hover:text-[#F0F2EC] transition-colors">
                  Sensor Lapangan ESP32 (IoT)
                </Link>
              </li>
              <li>
                <Link href="#proses" className="hover:text-[#F0F2EC] transition-colors">
                  Ledger Berantai SHA-256
                </Link>
              </li>
              <li>
                <Link href="#proses" className="hover:text-[#F0F2EC] transition-colors">
                  EAS Schema Registry
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Info */}
          <div className="space-y-3">
            <span className="text-[0.75rem] font-semibold text-[#F0F2EC] uppercase tracking-wider block">
              Informasi &amp; Kontak
            </span>
            <p className="text-[0.8rem] text-[#A8AFA2] leading-relaxed">
              Proyek kompetisi rekayasa perangkat lunak. Dikembangkan untuk membuktikan kelayakan dMRV hutan tropis.
            </p>
            <div className="text-[0.75rem] text-[#747D70] font-mono">
              Lokasi Percontohan: Mahakam Ulu, Kalimantan Timur
            </div>
          </div>

        </div>

        {/* Legal & Compliance Notice Row (Section 4.9 & 9) */}
        <div className="pt-8 border-t border-[#1B211A] space-y-4">
          <div className="p-4 rounded-panel bg-[#101610] border border-[#1B211A] text-[0.72rem] text-[#747D70] leading-relaxed">
            <strong className="text-[#A8AFA2]">Catatan Kepatuhan Sandbox:</strong> Seluruh transaksi, angka uang, dan penerbitan unit di Excboncp bersifat simulasi di jaringan uji coba (testnet). Proyek ini tidak menjual token kripto dan belum memiliki afiliasi komersial dengan instansi negara manapun.
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[0.75rem] text-[#747D70]">
            <span>&copy; {new Date().getFullYear()} Excboncp &bull; Dark Lime Design System implementation.</span>
            <div className="flex items-center gap-4">
              <span className="hover:text-[#A8AFA2]">Aturan Status R5</span>
              <span>&bull;</span>
              <span className="hover:text-[#A8AFA2]">Formula Settle R7</span>
              <span>&bull;</span>
              <span className="hover:text-[#A8AFA2]">Audit EAS R9</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
