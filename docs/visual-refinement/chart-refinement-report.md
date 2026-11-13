# EXBON CP — Chart & Financial Analytics Refinement Report

Laporan teknis penyempurnaan visual dan arsitektur grafik analitik pada dashboard dan halaman operasional EXBON CP berdasarkan sistem warna Soft Botanical serta standar keterbacaan analitik keuangan yang tenang.

Semua grafik mempertahankan prinsip produk non-spekulatif: hanya menampilkan nilai simulasi, tren transaksi proyek karbon komunitas, pembagian 60/40, serta rekap periodik tanpa komponen *candlestick*, *order book*, tombol *beli/jual*, atau bahasa *exchange/token*.

---

## 1. Arsitektur Primitif Grafik Bersama (`ChartPrimitives.tsx`)

Untuk menghentikan duplikasi konfigurasi Recharts antar halaman dan menyamakan presisi visual di seluruh route analitik, seluruh primitif terpusat dibuat di [ChartPrimitives.tsx](file:///c:/excboncp/src/dapp/src/components/charts/ChartPrimitives.tsx):

1. **`BOTANICAL_CHART_COLORS`**: Palet terkendali yang tersinkron dengan `tokens.css` untuk atribut SVG/Recharts (`line: #245E35`, `lineActive: #1F4D2E`, `forest700: #2E6B3F`, `leaf300: #8FCB97`, `leaf100: #E2F2E5`, `grid: #E4EFE1`, `inkMuted: #4A5E4F`, `surface: #FFFFFF`).
2. **`formatCompactIdrAxis`**: Pemformat sumbu Y ringkas berbahasa Indonesia (`M`, `jt`, `rb`) sehingga angka Rupiah jutaan tetap muat pada sumbu `width={64}` tanpa memotong area plot grafik.
3. **`computeSeriesBenchmarks` & `ChartBenchmarkBar`**: Menghitung nilai *Tertinggi*, *Terendah*, *Rata-rata*, serta jumlah titik observasi (`xb-numeric tabular-nums`) secara deterministik di strip footer berbatas `--line-subtle` tepat di bawah grafik.
4. **`FinancialChartTooltip`**: Tooltip terbungkus kelas `.xb-chart-tooltip` (elevasi lembut, batas tipis `--line`) yang menampilkan tanggal/waktu titik observasi, nominal `formatIdr` besar, jumlah `tCO2e`, serta konteks `Simulasi`.
5. **`MarketTrendAreaChart`**:
   - ID gradien SVG unik melalui `useId()` (`xbTrendFill_<uid>`) guna mencegah tabrakan DOM ketika beberapa grafik tampil di DOM/transisi berbeda.
   - Kurva halus (`type="monotone"`, `strokeWidth={2.5}`, `#245E35`) dengan isian gradien 3-henti (`22%` -> `5%` -> `0%`).
   - Garis kisi horizontal putus-putus saja (`CartesianGrid`, `stroke="#E4EFE1"`, `strokeDasharray="3 3"`, `vertical={false}`) agar bidang plot tidak penuh garis vertikal.
   - Kursor *crosshair* vertikal putus-putus (`#2E6B3F`) serta titik aktif tegas (`r: 5.5`, isi `#1F4D2E`, cincin putih `2.5px`).
6. **`MarketSparkline`**: Grafik mini SVG `104x30` dengan ID gradien unik `xbSpark_<uid>`, area tint mint lembut, garis terkalibrasi min-maks, serta penanda titik terakhir untuk baris tabel di `/screener`.

---

## 2. Cakupan Penerapan per Halaman & Komponen

| Komponen / Halaman | Peningkatan Sebelum -> Sesudah |
|---|---|
| **Dasbor — Pendapatan Simulasi** ([SimulationRevenueChart.tsx](file:///c:/excboncp/src/dapp/src/components/charts/SimulationRevenueChart.tsx)) | Direfaktor menjadi pembungkus bersih `MarketTrendAreaChart` dengan tetap menjaga pengendali tab periode (Harian, Mingguan, Bulanan) dan pengguliran tanggal WIB. |
| **Dasbor — Pembagian Hasil 60/40** ([ResultSplitDonut.tsx](file:///c:/excboncp/src/dapp/src/components/charts/ResultSplitDonut.tsx)) | Menggunakan `BOTANICAL_CHART_COLORS` & CSS variables untuk warna segmen dan label; menghilangkan titik dekoratif berlebih di catatan biaya sandbox 2%. |
| **Screener Pasar** ([ScreenerView.tsx](file:///c:/excboncp/src/dapp/src/components/pages/ScreenerView.tsx)) | Menambahkan grafik utama *Tren Nilai 7 Hari Terakhir* (`MarketTrendAreaChart`) pada strip Bento atas berdampingan dengan metrik pasar (sekaligus menghilangkan lubang grid pada peran tamu), serta mengganti sparkline lama dengan `MarketSparkline`. |
| **Detail Lahan / Pasar** ([PasarView.tsx](file:///c:/excboncp/src/dapp/src/components/pages/PasarView.tsx)) | Menambahkan `MarketTrendAreaChart` (*Tren Nilai Simulasi Lahan*) di bawah kalkulator rincian menggunakan data riil `buildScreenerData` & transaksi, mengisi celah kosong ~400px saat lahan belum terverifikasi sekaligus memperkaya konteks harga lahan. |
| **Rekap Periodik** ([RekapView.tsx](file:///c:/excboncp/src/dapp/src/components/pages/RekapView.tsx)) | Memperbarui Recharts `BarChart` dengan gradien batang vertikal, kisi horizontal `#E4EFE1` putus-putus, `FinancialChartTooltip`, dan `ChartBenchmarkBar` di bawah plot agar setara kualitasnya dengan grafik area utama. |
| **Pantauan Langsung** ([LangsungView.tsx](file:///c:/excboncp/src/dapp/src/components/pages/LangsungView.tsx)) | Mengganti grafik area kumulatif sebelumnya menjadi `MarketTrendAreaChart` konsisten bergradien 3-henti dan *benchmark bar*, sejajar tingginya dengan kartu *Kondisi Pasar*. |

---

## 3. Verifikasi Grafik & Kesesuaian Kepatuhan Produk

- **Kepatuhan Bahasa & Produk**: Seluruh judul grafik, legenda, *tooltip*, dan label konteks diuji ulang melalui `node --test tests/multipage-helpers.test.mjs` — bebas dari kata spekulatif (*bursa*, *exchange*, *DEX*, *token*, *dompet*) maupun *em-dash* (`—`).
- **Stabilitas Tipe & Build**: Seluruh pembaruan tipe grafik lulus `npx tsc --noEmit` (0 error) dan `npm run build` (29 route sukses dibangun).
- **Catatan Batasan QA Visual Browser**: Pengujian interaktif *hover tooltip* dan pembuktian proporsi piksel di peramban Chrome pada `http://localhost:3005` belum dapat dijalankan langsung karena sub-agen browser mengalami kegagalan koneksi Chrome DevTools (`ENOENT` pada `DevToolsActivePort`) serta keterbatasan daftar tool MCP pada sesi tersebut (`navigate_page`/`take_screenshot` tidak tersedia).

