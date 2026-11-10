import { Radio, Users, ShieldCheck, CheckCircle2 } from "lucide-react";

export function FeatureModules() {
  return (
    <section id="cara-kerja" className="py-24 sm:py-36 px-4 relative">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-2xl mb-14 sm:mb-20">
          <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-widest">
            Prinsip Kerja Sistem
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mt-2">
            Tiga pilar yang mengunci keaslian data.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-400 leading-relaxed">
            Sistem bekerja otomatis dengan aturan kode yang jelas, tanpa ada data yang
            bisa diubah diam-diam oleh pihak pengelola.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1: Data Lapangan & Satelit */}
          <div className="p-8 rounded-3xl sm:rounded-4xl bg-obsidian-850 border border-white/10 hover:border-emerald-500/30 shadow-card flex flex-col justify-between transition-all group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Data langsung dari pohon dan satelit
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Sensor di batang pohon memantau panas dan kelembapan setiap beberapa detik.
                Satelit radar dari antariksa menembus awan tebal untuk memeriksa kerapatan dedaunan secara berkala.
              </p>
            </div>
            <ul className="mt-8 space-y-2.5 text-xs text-neutral-300 border-t border-white/10 pt-5">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Peringatan instan jika suhu melonjak</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Radar satelit tidak terhalang awan</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Izin Warga */}
          <div className="p-8 rounded-3xl sm:rounded-4xl bg-obsidian-850 border border-white/10 hover:border-emerald-500/30 shadow-card flex flex-col justify-between transition-all group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Izin warga menentukan segalanya
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Tanpa persetujuan dari warga yang merawat hutan, lahan terkunci otomatis dan
                tidak dapat masuk ke simulasi pasar. Warga juga berhak mencabut izin kapan saja jika terjadi sengketa.
              </p>
            </div>
            <ul className="mt-8 space-y-2.5 text-xs text-neutral-300 border-t border-white/10 pt-5">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tanpa izin, status lahan tertahan</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Hak veto dan sengketa di tangan warga</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Segel Digital */}
          <div className="p-8 rounded-3xl sm:rounded-4xl bg-obsidian-850 border border-white/10 hover:border-emerald-500/30 shadow-card flex flex-col justify-between transition-all group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Bisa diperiksa siapa saja
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Setelah diperiksa auditor independen, data dikunci dengan rumus matematika berantai (hash).
                Satu angka saja diubah, segel digital akan rusak dan ketahuan oleh publik saat itu juga.
              </p>
            </div>
            <ul className="mt-8 space-y-2.5 text-xs text-neutral-300 border-t border-white/10 pt-5">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tersimpan di catatan publik Base Sepolia</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pemeriksaan mandiri langsung di browser</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
