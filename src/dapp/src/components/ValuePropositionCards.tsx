export function ValuePropositionCards() {
  return (
    <section className="py-20 sm:py-28 border-t border-[#1B211A]">
      <div className="page-shell">
        {/* Centered Heading (2 lines, Section 4.6) */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-18">
          <span className="text-[0.75rem] font-semibold text-[#AEDA2D] uppercase tracking-wider block mb-2">
            Nilai &amp; Manfaat Sistem
          </span>
          <h2 className="text-[clamp(2.1rem,3.5vw,3.2rem)] font-normal text-[#F0F2EC] leading-[1.18] tracking-tight">
            Transparansi untuk komunitas,{" "}
            <br className="hidden sm:inline" />
            <span className="text-[#AEDA2D]">kepastian data</span> untuk pasar.
          </h2>
          <p className="mt-4 text-[0.95rem] text-[#A8AFA2]">
            Tiga keunggulan terukur yang dibuktikan secara langsung oleh sistem kami.
          </p>
        </div>

        {/* Three Cards Grid (1 Featured Lime Card + 2 Dark Visualization Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 items-stretch">
          
          {/* Card 1: Featured Lime Card (Section 4.6 & 5.2) */}
          <div className="rounded-card bg-[#AEDA2D] p-7 text-[#11160B] shadow-[0_12px_40px_rgba(174,218,45,0.2)] flex flex-col justify-between">
            <div>
              <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-[#11160B]/70 block mb-3">
                Kedaulatan Warga &bull; 60% Bagi Hasil
              </span>
              <h3 className="text-[1.35rem] font-bold text-[#11160B] leading-snug tracking-tight">
                Hak veto mutlak bagi masyarakat adat.
              </h3>
              <p className="mt-3 text-[0.85rem] text-[#11160B]/85 leading-relaxed">
                Tanpa persetujuan tertulis dari warga yang merawat hutan, sistem menolak penerbitan
                unit karbon. Bagian hasil terbesar (60%) langsung tercatat ke kas komunitas.
              </p>
            </div>

            {/* Simple Bar Chart Illustration (Section 4.6 item 1) */}
            <div className="mt-8 pt-5 border-t border-[#11160B]/15">
              <div className="flex items-end justify-between h-20 gap-2 px-2">
                <div className="w-1/4 flex flex-col items-center gap-1">
                  <div className="w-full bg-[#11160B]/25 rounded-t" style={{ height: "35%" }} />
                  <span className="text-[0.65rem] font-mono text-[#11160B]/70">Lama</span>
                </div>
                <div className="w-1/4 flex flex-col items-center gap-1">
                  <div className="w-full bg-[#11160B]/40 rounded-t" style={{ height: "55%" }} />
                  <span className="text-[0.65rem] font-mono text-[#11160B]/70">Draft</span>
                </div>
                <div className="w-1/4 flex flex-col items-center gap-1">
                  <div className="w-full bg-[#11160B] rounded-t" style={{ height: "90%" }} />
                  <span className="text-[0.65rem] font-mono font-bold text-[#11160B]">Adat 60%</span>
                </div>
                <div className="w-1/4 flex flex-col items-center gap-1">
                  <div className="w-full bg-[#11160B]/60 rounded-t" style={{ height: "65%" }} />
                  <span className="text-[0.65rem] font-mono text-[#11160B]/70">Kelola 40%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Dark Card with Performance Line Chart (Section 4.6 item 2) */}
          <div className="surface-card p-7 flex flex-col justify-between">
            <div>
              <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-[#747D70] block mb-3">
                Kecepatan Data &bull; Detik ke Status
              </span>
              <h3 className="text-[1.35rem] font-medium text-[#F0F2EC] leading-snug tracking-tight">
                Dari getaran sensor ke status terbuka.
              </h3>
              <p className="mt-3 text-[0.85rem] text-[#A8AFA2] leading-relaxed">
                Menghilangkan proses audit manual 12&ndash;18 bulan. Sensor mengirim data tiap 5 detik
                dan satelit memperbarui kerapatan daun otomatis via Google Earth Engine.
              </p>
            </div>

            {/* Line Chart Illustration (Section 4.6 item 2) */}
            <div className="mt-8 pt-5 border-t border-[#1B211A]">
              <div className="h-20 w-full relative">
                <svg viewBox="0 0 240 70" className="w-full h-full overflow-visible">
                  <line x1="0" y1="15" x2="240" y2="15" stroke="#1B211A" strokeWidth="1" />
                  <line x1="0" y1="45" x2="240" y2="45" stroke="#1B211A" strokeWidth="1" />
                  <path
                    d="M 0,55 L 40,48 L 80,50 L 120,32 L 160,28 L 200,18 L 240,12"
                    fill="none"
                    stroke="#AEDA2D"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="240" cy="12" r="3.5" fill="#AEDA2D" />
                </svg>
              </div>
              <div className="flex items-center justify-between text-[0.72rem] text-[#747D70] font-mono mt-1">
                <span>0.1 Detik Ingest</span>
                <span className="text-[#AEDA2D]">Status Deterministik</span>
              </div>
            </div>
          </div>

          {/* Card 3: Dark Card with Donut Chart (Section 4.6 item 3) */}
          <div className="surface-card p-7 flex flex-col justify-between">
            <div>
              <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-[#747D70] block mb-3">
                Integritas Segel &bull; Kriptografi Publik
              </span>
              <h3 className="text-[1.35rem] font-medium text-[#F0F2EC] leading-snug tracking-tight">
                Buku catatan berantai dan EAS Sepolia.
              </h3>
              <p className="mt-3 text-[0.85rem] text-[#A8AFA2] leading-relaxed">
                Setiap persetujuan auditor disegel dengan rumus SHA-256 dan dicatat ke Ethereum Attestation
                Service. Tidak ada otoritas tunggal yang dapat menghapus jejak audit.
              </p>
            </div>

            {/* Donut Chart Illustration (Section 4.6 item 3) */}
            <div className="mt-8 pt-5 border-t border-[#1B211A] flex items-center justify-around">
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  {/* Background Circle */}
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#1D231B" strokeWidth="4" />
                  {/* Primary Lime Arc (75%) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#AEDA2D"
                    strokeWidth="4"
                    strokeDasharray="66 100"
                    strokeLinecap="round"
                  />
                  {/* Secondary Muted Arc (25%) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#64753E"
                    strokeWidth="4"
                    strokeDasharray="22 100"
                    strokeDashoffset="-68"
                  />
                </svg>
              </div>
              <div className="text-[0.75rem] space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#AEDA2D]" />
                  <span className="text-[#F0F2EC]">Unit Sah: 600 tCO2e</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#64753E]" />
                  <span className="text-[#747D70]">Buffer Resiko: 0%</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

