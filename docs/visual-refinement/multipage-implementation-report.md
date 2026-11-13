# EXBON CP — Laporan Implementasi Multi-Page DApp

Dokumen ini merangkum perluasan desain *Soft Botanical Intelligence* (`#EEF5EC`, `#FFFFFF`, `#D8E5D4`, `#14261A`, `#2E6B3F`, `#1F5A94`) dari Dashboard `/app` ke seluruh halaman aplikasi multipage di `src/dapp`.

---

## 1. Arsitektur Bersama & Navigasi Shell

- **Salinan Bahasa Indonesia & Aturan Peran:** [copy.ts](file:///c:/excboncp/src/dapp/src/lib/copy.ts) menyediakan daftar status kanonik (`VERIFIED`, `WARNING`, `DISPUTE`, `BLOCKED`), status izin warga (`CONSENT_DISPLAY`), deskripsi peran (`ROLE_TITLES`), matriks visibilitas rute (`ROUTE_ACCESS_RULES` & `isRouteAllowedForRole`), serta helper kalender WIB dan pekan dimulai Senin (`getMondayOfWibWeek`, `shiftPeriodDate`, `formatPeriodHeading`).
- **Lapisan Data & Fallback Offline:** [exbon-api.ts](file:///c:/excboncp/src/dapp/src/lib/exbon-api.ts) dan [dashboard-api.ts](file:///c:/excboncp/src/dapp/src/lib/dashboard-api.ts) menjaga agar panggilan backend opsional (`NEXT_PUBLIC_API_URL`) hanya berjalan jika dikonfigurasi, sementara GeoJSON (`/data/bogor-forest.geojson`), WebCrypto SHA-256 (`sha256HexBrowser`, `lookupVerificationRecord`), dan metrik sensor (`fetchMonitoringMetrics`) bekerja mandiri tanpa error 404 saat frontend dijalankan terpisah.
- **Primitif Antarmuka:** [BotanicalPrimitives.tsx](file:///c:/excboncp/src/dapp/src/components/dapp/BotanicalPrimitives.tsx) menyediakan `BotanicalCard`, `BotanicalPageHeader`, `SimulasiBadge` (`Simulasi, testnet`), `CanonicalStatusBadge`, `ConsentStatusBadge`, `RoleRestrictedNotice`, `PageStatePanel` (status *loading*, *empty*, *error*, *ready*), `BotanicalReceiptCard`, dan `BotanicalDrawer`.
- **Navigasi Terkelompok:** [BotanicalAppShell.tsx](file:///c:/excboncp/src/dapp/src/components/dapp/BotanicalAppShell.tsx) mengelompokkan sidebar menjadi empat grup (`Pantau`, `Laporan`, `Izin dan bukti`, `Bawah`), mendukung penandaan aktif untuk route Bahasa Indonesia dan route kompatibilitas Bahasa Inggris, pencarian global lahan/segel, laci mobile, serta pengalih peran demo cepat.
- **Slot Pose Maskot:** [Mascot.tsx](file:///c:/excboncp/src/dapp/src/components/mascot/Mascot.tsx) mendukung rasio `1:1` dan fallback SVG botani ketika pose spesifik belum tersedia, sambil meniadakan maskot di halaman transaksional, tabel, grafik, `/pasar`, `/zona`, dan `/tinjau`.

---

## 2. Daftar Halaman & Komponen Terpasang

### Batch A — Geospasial & Pemantauan
- **Peta (`/peta`, `/peta/[parcelId]`, `/map`):** [PetaView.tsx](file:///c:/excboncp/src/dapp/src/components/pages/PetaView.tsx), [CarbonMap.tsx](file:///c:/excboncp/src/dapp/src/components/dapp/CarbonMap.tsx), dan [ParcelInspectionPanel.tsx](file:///c:/excboncp/src/dapp/src/components/dapp/ParcelInspectionPanel.tsx) (tab Ringkasan, Sensor, Satelit & AI pembantu, serta Segel).
- **Screener Lahan (`/screener`, `/market`):** [ScreenerView.tsx](file:///c:/excboncp/src/dapp/src/components/pages/ScreenerView.tsx) dengan chip filter, pengurutan, dan transformasi tabel menjadi kartu mobile responsif.
- **Aktivitas Langsung (`/langsung`, `/activity`):** [LangsungView.tsx](file:///c:/excboncp/src/dapp/src/components/pages/LangsungView.tsx) dengan kontrol jeda/lanjut umpan, filter kategori, dan tautan silang ke lahan atau verifikasi.

### Batch B — Simulasi Pasar & Pelaporan
- **Pasar Simulasi (`/pasar`, `/pasar/[parcelId]`):** [PasarView.tsx](file:///c:/excboncp/src/dapp/src/components/pages/PasarView.tsx) menampilkan penanda eksplisit `Simulasi, testnet`, donat pembagian hasil `60/40` (`ResultSplitDonut`), pemblokiran otomatis ketika izin warga dicabut atau status bermasalah, serta tanpa istilah perdagangan spekulatif.
- **Rekap Laporan (`/rekap`, `/rekap/[periode]`, `/portfolio`):** [RekapView.tsx](file:///c:/excboncp/src/dapp/src/components/pages/RekapView.tsx) mendukung tab `Harian`, `Mingguan` (WIB Senin-Minggu), dan `Bulanan`, navigasi periode maju/mundur, grafik batang Recharts, serta ekspor CSV.
- **Zona & Pembagian Hasil (`/zona`, `/zona/[zoneId]`):** [ZonaView.tsx](file:///c:/excboncp/src/dapp/src/components/pages/ZonaView.tsx) untuk Pengelola Hutan, Penerima Zona (`ZONE-DEMO-A`), dan Auditor MRV dengan rincian alokasi 60/40.

### Batch C — Komunitas, Keaslian & Audit
- **Izin Warga FPIC (`/izin`, `/izin/[parcelId]`, `/consent`):** [IzinView.tsx](file:///c:/excboncp/src/dapp/src/components/pages/IzinView.tsx) dibatasi khusus peran `community` untuk lahan terhubung (`PARCEL-A`), dilengkapi modal konfirmasi `@radix-ui/react-dialog` sebelum memberi atau mencabut izin (hak veto) serta tanda terima hash SHA-256.
- **Verifikasi Segel & Rantai Hash (`/verifikasi`, `/verifikasi/[id]`, `/verify`):** [VerifikasiView.tsx](file:///c:/excboncp/src/dapp/src/components/pages/VerifikasiView.tsx) terbuka publik dengan pencarian nomor blok/ID/hash, pembandingan hash stored vs recomputed berbasis `HashSeal`, aksen biru segel `#1F5A94`, dan kotak uji *"Ubah 1 huruf, segel langsung berbeda"* secara langsung di peramban.
- **Indikator Sistem & Sensor (`/indikator`):** [IndikatorView.tsx](file:///c:/excboncp/src/dapp/src/components/pages/IndikatorView.tsx) terbuka publik menampilkan kecepatan proses, kondisi node ESP32 (`S-001`..`S-003`), indeks NDVI terhadap ambang `0,70`, serta status rantai segel.
- **Tinjau & Sahkan Bukti (`/tinjau`, `/approve`, `/audit`):** [TinjauView.tsx](file:///c:/excboncp/src/dapp/src/components/pages/TinjauView.tsx) dibatasi khusus peran `auditor`, menyandingkan telemetri sensor, NDVI, status izin warga, catatan AI yang dilabeli hanya pembantu (*advisory*), dan pemeriksaan `runIntegrityChecks` dengan modal konfirmasi sebelum pengesahan atau penahanan blok.

### Batch D — Pendukung & 404
- **Bantuan (`/bantuan`):** [BantuanView.tsx](file:///c:/excboncp/src/dapp/src/components/pages/BantuanView.tsx) menjelaskan EXBON CP, alur tiga langkah, arti empat status lahan, batas peran, cara kerja verifikasi SHA-256, dan pengungkapan mode simulasi testnet.
- **Akun & Peran (`/akun`):** [AkunView.tsx](file:///c:/excboncp/src/dapp/src/components/pages/AkunView.tsx) menampilkan detail sesi, lahan/zona terkait, pengalih peran demo cepat, tombol reset simulasi sesi, serta konfirmasi dialog keluar sesi.
- **Halaman Tidak Ditemukan (404):** [not-found.tsx](file:///c:/excboncp/src/dapp/src/app/not-found.tsx) dengan gaya Soft Botanical, pose maskot `mencari`, dan tautan aman menuju `/peta`, `/app`, dan `/bantuan`.

---

## 3. Hasil Verifikasi Teknis & Cakupan Pemeriksaan

- **TypeScript (`npx tsc --noEmit`):** Lolos dengan exit code `0`.
- **Unit Test (`node --test tests/*.mjs`):** `11/11` pengujian lolos ([dashboard.test.mjs](file:///c:/excboncp/src/dapp/tests/dashboard.test.mjs) 6 test + [multipage-helpers.test.mjs](file:///c:/excboncp/src/dapp/tests/multipage-helpers.test.mjs) 5 test), mencakup pemetaan periode, minggu Senin WIB, matriks peran rute, dan pemeriksaan ketiadaan istilah terlarang maupun *em-dash* di halaman baru.
- **Production Build (`npm run build`):** Lolos dengan exit code `0`, menghasilkan seluruh `29/29` entri App Router Next.js (`/` hingga `/zona/[zoneId]`).
- **Impeccable Automated Detector (`impeccable detect --json`):** `0` temuan pada `src/components/pages` dan `src/components/dapp`. Pada `src/app` hanya ada 1 catatan *advisory* pra-eksisting di [globals.css](file:///c:/excboncp/src/dapp/src/app/globals.css#L121) yang dipertahankan sesuai batasan agar landing page tetap utuh.
- **Pemeriksaan Visual Browser (Chrome DevTools MCP):** **Terblokir pada sesi ini** karena MCP `chrome_devtools` tidak dapat terhubung ke instans Chrome host (`Could not find DevToolsActivePort` / remote debugging `chrome://inspect/#remote-debugging` belum aktif pada profil default Chrome). Oleh karena itu, rendering visual langsung, muat tile `openstreetmap.org` di peramban nyata, dan pemeriksaan `scrollWidth` viewport `360px`–`1440px` belum dapat dieksekusi di peramban nyata pada sesi ini dan perlu diinspeksi setelah remote debugging Chrome diaktifkan.

