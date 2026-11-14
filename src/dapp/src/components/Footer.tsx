import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border-subtle)] py-16 text-[0.8rem] text-[var(--color-text-muted)]">
      <div className="page-shell flex flex-col gap-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 sm:gap-10">
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 font-semibold text-[var(--color-text-primary)]">
              <span className="h-2 w-2 rounded-full bg-[var(--color-accent)] shadow-[var(--shadow-glow-accent)]" />
              <span className="text-sm font-semibold tracking-tight">excboncp</span>
            </div>
            <p className="text-[0.8rem] leading-relaxed text-[var(--color-text-secondary)]">
              Platform pembuktian integritas karbon hutan dan simulasi pasar terbuka di jaringan uji
              coba Base Sepolia.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-[var(--color-accent)]">
              <Link href="/screener" className="xbm-link-inline">
                Pasar &amp; Screener Ekosistem
              </Link>
              <span>&bull;</span>
              <Link href="#verifikasi" className="xbm-link-inline">
                Base Sepolia EAS
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <span className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-primary)]">
              Navigasi Halaman
            </span>
            <ul className="space-y-2 text-[var(--color-text-secondary)]">
              <li>
                <Link href="/screener" className="xbm-link-inline hover:text-[var(--color-text-primary)]">
                  Pasar &amp; Screener (/screener)
                </Link>
              </li>
              <li>
                <Link href="/peta" className="xbm-link-inline hover:text-[var(--color-text-primary)]">
                  Peta Petak Hutan (/peta)
                </Link>
              </li>
              <li>
                <Link href="/app" className="xbm-link-inline hover:text-[var(--color-text-primary)]">
                  Ringkasan Dasbor (/app)
                </Link>
              </li>
              <li>
                <Link href="#simulasi" className="xbm-link-inline hover:text-[var(--color-text-primary)]">
                  Lab Simulasi &amp; SHA-256
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-primary)]">
              Komponen Sistem
            </span>
            <ul className="space-y-2 text-[var(--color-text-secondary)]">
              <li>
                <Link href="/indikator" className="xbm-link-inline hover:text-[var(--color-text-primary)]">
                  Sentinel-1 &amp; Sentinel-2 (GEE)
                </Link>
              </li>
              <li>
                <Link href="/langsung" className="xbm-link-inline hover:text-[var(--color-text-primary)]">
                  Sensor Lapangan ESP32 (IoT)
                </Link>
              </li>
              <li>
                <Link href="/verifikasi/1" className="xbm-link-inline hover:text-[var(--color-text-primary)]">
                  Ledger Berantai SHA-256
                </Link>
              </li>
              <li>
                <Link href="/izin/PARCEL-A" className="xbm-link-inline hover:text-[var(--color-text-primary)]">
                  Konsensus Izin Warga (FPIC)
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-primary)]">
              Informasi &amp; Kontak
            </span>
            <p className="text-[0.8rem] leading-relaxed text-[var(--color-text-secondary)]">
              Proyek kompetisi rekayasa perangkat lunak untuk membuktikan kelayakan dMRV hutan tropis.
            </p>
            <div className="font-mono text-xs text-[var(--color-text-muted)]">
              Lokasi Percontohan: Mahakam Ulu &amp; Bogor
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t border-[var(--color-border-subtle)] pt-8">
          <div className="rounded-[var(--radius-panel)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4 text-[0.72rem] leading-relaxed text-[var(--color-text-muted)]">
            <strong className="text-[var(--color-text-secondary)]">Catatan Kepatuhan Sandbox:</strong>{" "}
            Seluruh transaksi, angka uang, dan penerbitan unit di Excboncp bersifat simulasi di
            jaringan uji coba (testnet). Proyek ini tidak menjual token kripto dan belum memiliki
            afiliasi komersial dengan instansi negara manapun.
          </div>

          <div className="flex flex-col items-center justify-between gap-2 text-xs text-[var(--color-text-muted)] sm:flex-row">
            <span>&copy; {new Date().getFullYear()} Excboncp &bull; Sistem Verifikasi Karbon Terbuka.</span>
            <div className="flex items-center gap-4">
              <span>Aturan Status R5</span>
              <span>&bull;</span>
              <span>Formula Settle R7</span>
              <span>&bull;</span>
              <span>Audit EAS R9</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
