# EXBON CP — Dashboard Visual Recovery & Quality Audit Report

Laporan audit teknis dan visual implementasi Dashboard EXBON CP (`/app`) berdasarkan acuan desain `referensi-dashboard-exboncp.png` dan dokumen kebutuhan [Excboncp Brief Frontend dan Prompt Claude.md](../Excboncp%20Brief%20Frontend%20dan%20Prompt%20Claude.md).

---

## 1. Akar Masalah Visual Sebelumnya (Root Cause Analysis)

1. **Hierarki Visual Lemah & Elemen Bertabrakan**:
   - Seluruh kartu dan badge memiliki bobot visual yang sama kuat sehingga mata pengguna tidak diarahkan ke informasi utama dalam 5 detik pertama.
   - Terlalu banyak badge pengisi (*filler badges*) berbentuk pil di berbagai kartu yang mengaburkan data operasional riil.
2. **Proporsi Grid Kaku**:
   - Kolom tengah dan kanan tertekan saat resolusi layar berada di 1280px–1366px akibat penetapan lebar statis yang tidak elastis.
   - Grafik analitik utama (`Pendapatan Simulasi`) terkompresi sehingga sumbu nilai dan tanggal sulit dibaca.
3. **Tipografi Tidak Konsisten**:
   - Jejak font serif lama (`Source Serif 4`) masih tersisa di beberapa bagian sebelum dihapus total.
   - Ukuran font metrik utama terlalu kecil atau tidak menggunakan angka tabular (`tabular-nums`), menyebabkan pergeseran tata letak saat data simulasi diperbarui.
4. **Maskot Orangutan Kurang Poles**:
   - Maskot sebelumnya menggunakan gambar semi-realistis AI terpotong dengan latar kotak mint kaku, bukan karakter maskot kartun yang ramah dan konsisten.
   - Tidak ada animasi Lottie riil (sebelumnya hanya gambar statis JPEG).
5. **Kurangnya Pemisahan State dan Animasi Reaktif**:
   - Kartu transaksi baru tidak memberikan umpan balik visual saat transaksi simulasi bertambah.
   - Verifikasi segel di kartu *Cek Keaslian* belum memperbarui representasi cincin `HashSeal` secara reaktif saat pengguna mengetik input.

---

## 2. Rincian Perbaikan yang Telah Diimplementasikan

### 2.1. Tipografi & Sistem Font
- Menghapus seluruh ketergantungan font serif (`Source Serif 4`, `Georgia`).
- Memasang paket font mandiri (*self-hosted*) melalui Fontsource:
  - **Sora** (600, 700, 800) untuk judul utama `Dashboard EXBON CP`, angka KPI utama, dan nilai total pendapatan.
  - **Geist Sans** (400, 500, 600, 700) untuk teks navigasi, deskripsi kartu, tombol, label, dan sumbu grafik (14px).
  - **Geist Mono** (400, 500, 600) untuk hash 32-byte SHA-256, ID rekaman segel, nomor blok, dan input pencarian.
- Mengaktifkan fitur CSS tabular numerals (`font-variant-numeric: tabular-nums lining-nums; font-feature-settings: "tnum" 1, "lnum" 1;`).

### 2.2. Maskot Kartun Orisinal & Animasi Lottie Riil
- **Art Direction Maskot**:
  - Karakter kartun orangutan muda orisinal dengan bulu oranye kemerahan hangat (`#DF6D2E`), wajah krem lembut (`#FFF0D4`), pipi merona (`#F2A08A`), mata bulat ekspresif, dan dedaunan tropis terpadu.
- **Implementasi Lottie (`lottie-react` + `/animations/orangutan-mascot.json`)**:
  - **Idle Loop (0–120 frame / 4 detik)**: Gerakan napas lembut, kepala sedikit mengangguk, kedipan mata natural.
  - **Hover Interaction (120–160 frame)**: Gerakan kepala tertarik ramah, alis terangkat, telinga bergerak halus.
  - **Click Reaction (160–220 frame)**: Lambaian tangan ceria, mulut terbuka tersenyum riang, lalu kembali mulus ke siklus idle.
  - **Aksesibilitas & Fallback**: Kepatuhan terhadap `prefers-reduced-motion: reduce` (berhenti di pose statis), dan fallback instan SVG vektor murni (`/illustrations/orangutan-mascot.svg`) tanpa pergeseran layout.
  - **Avatar Konsisten**: Avatar profil di *Kartu Saya* dan topbar menggunakan karakter kartun yang identik.

### 2.3. Tata Letak & Komposisi Tiga Bagian (Desktop 1440px / 1280px)
- **Sidebar Kiri (`xl:w-[236px]`)**:
  - Logo EXBON CP dengan teks "Forest Intelligence".
  - Maskot Lottie interaktif dengan sapaan nama pengguna dan lencana peran.
  - Menu navigasi terfilter peran (`Dasbor`, `Peta`, `Screener`, `Langsung`, `Pasar`, `Rekap`, `Zona`, `Izin Warga` [khusus komunitas], `Tinjau` [khusus auditor], `Verifikasi`, `Bantuan`, `Akun`).
  - Panel bawah "Jaga Hutan Kita" dengan dedaunan botani.
- **Ruang Kerja Tengah (`min-w-0 flex-1`)**:
  - Header dengan ilustrasi kanopi kabut hutan tropis dan pil status `Simulasi, testnet`.
  - Strip *Next Action* kontekstual sesuai peran pengguna.
  - 4 kartu KPI horizontal (Unit Terverifikasi, Status Lahan dengan 4 hitungan kanonik, Bagian Komunitas Hari Ini, dan satu kartu kontras tinggi *Dari Data ke Status*).
  - Grafik analitik utama Recharts `Pendapatan Simulasi` dengan tab rentang waktu (Harian, Mingguan, Bulanan), garis hijau presisi, gradien mint transparan, dan tooltip informatif.
  - Panel bawah ganda: *Rantai Segel* (garis vertikal tipis, hash, tanggal/jam WIB lengkap, status terkunci/menunggu) dan *Transaksi Simulasi Terakhir* (animasi sorot baris baru `.xb-tx-flash`).
- **Kolom Kontekstual Kanan (`xl:w-[348px]`)**:
  - *Pembagian Hasil*: Donut 2-segmen proporsional (Komunitas 60% vs Pengelola 40%) beserta nilai Rupiah dan penjelasan biaya sandbox 2%.
  - *Kartu Saya*: Avatar maskot kartun, nama, peran, lahan terkait, dan 3 metrik dengan ikon semantik.
  - *Cek Keaslian*: Formulir nomor segel, tombol periksa, dan pratinjau reaktif cincin radial `HashSeal` 32-byte.

### 2.4. Pembersihan Badge & Kontrol Kebisingan Visual
- Mengurangi penggunaan badge pil berulang.
- Mempertahankan penanda mandatori `Simulasi, testnet` di header utama tanpa menduplikasi label peringatan di setiap kartu.
- Menghapus istilah yang dilarang (*bursa, exchange, DEX, token, dompet*) dan memastikan tidak ada tombol tindakan spekulatif (*beli, jual, tukar*).

---

## 3. Hasil Pengujian & Verifikasi Teknis

- **Pemeriksaan Tipe TypeScript (`npx tsc --noEmit`)**: Lulus (`TSC_EXIT:0`, tanpa error).
- **Unit Test Dashboard (`node --test tests/dashboard.test.mjs`)**: 6/6 test lulus (`TEST_EXIT:0`):
  1. `toCanonicalStatus` normalisasi status lahan kanonik.
  2. `formatWibTime` dan `formatWibDateTime` pemformatan waktu WIB Indonesia.
  3. `getGreetingWib` pemilihan salam waktu Jakarta.
  4. `computeRoleNextAction` kepatuhan hak akses & kondisi lahan per peran.
  5. `buildRevenueSeries` agregasi metrik pendapatan per periode (Harian/Mingguan/Bulanan).
  6. `parseHexBytes` determinisme parsing 32-byte SHA-256 untuk cincin `HashSeal`.
- **Produksi Build (`next build`)**: Lulus (`BUILD_EXIT:0`, seluruh 17 rute terkompilasi optimal).
- **Integritas Halaman Publik (`git diff --exit-code`)**: Lolos (`LANDING_AUTH_EXIT:0`, halaman `/`, `/layout.tsx`, `/globals.css`, `/login`, dan `/register` tidak tersentuh).
- **Audit Istilah Terlarang & Font Serif**: 0 pelanggaran.

---

## 5. Pemulihan Visual & Penyelesaian 49 Error TypeScript (Iterasi Lanjut)

### 5.1. Resolusi 49 Error `tsconfig.json` (`.next/types/app/**/*.ts`)
- **Akar Masalah**: Kegagalan kompilasi sebelumnya menghentikan proses `next build` sebelum artefak tipe rute selesai di-_generate_. TypeScript Language Server di VS Code membaca `include: [".next/types/**/*.ts"]` dan melaporkan 49 file tipe rute hilang.
- **Tindakan Perbaikan**:
  1. Menambahkan deklarasi opsional `timestamp?: string;` pada `MarketSeriesPoint` di [src/lib/dashboard-helpers.ts](file:///c:/excboncp/src/dapp/src/lib/dashboard-helpers.ts).
  2. Memperbaiki impor `formatIdr` dari `@/components/dapp/phantom-ui` pada [DashboardOverview.tsx](file:///c:/excboncp/src/dapp/src/components/dapp/DashboardOverview.tsx).
  3. Menjalankan `next build` hingga tuntas mengompilasi ke-29 rute publik & aplikasi, men-_generate_ seluruh 49 berkas tipe rute di `.next/types/app/`.
  4. Memverifikasi kelulusan via `npx tsc --noEmit` (**0 error**).

### 5.2. Pemulihan 4 Kartu KPI Utama (Bebas Truncation)
- **Akar Masalah**: Pembagian grid 4 kolom kaku di resolusi desktop sedang (~810px ruang kerja tengah) memeras kartu menjadi ~170px, memotong judul kartu (`Unit Terv...`, `Status L...`, `Bagian K...`, `Dari Data ...`), memecah status lahan ke 2 baris, dan memotong angka rupiah menjadi `Rp 88...`.
- **Tindakan Perbaikan**:
  1. Mengatur grid dinamis `grid-cols-2 items-stretch gap-3 sm:gap-3.5 xl:grid-cols-4` dengan padding internal `p-3.5 sm:p-4` dan tinggi konsisten `min-h-[140px]`.
  2. Menghapus elipsis kaku pada judul dan mengadopsi ukuran teks harmonis `text-[13px] sm:text-[13.5px] font-semibold`.
  3. Menata ulang 4 indikator status lahan menjadi satu baris teratur (`● 1  ● 1  ● 0  ● 0` berjarak 8px) tanpa pemecahan baris.
  4. Menampilkan format ringkas `formatIdrShort` (`Rp 88,2 jt`) dengan atribut `title` yang memuat nominal penuh (`Rp 88.200.000`), bebas dari pemotongan elipsis.

### 5.3. Penyelarasan Kartu Rantai Segel & Transaksi Terakhir
- **Akar Masalah**: Judul panjang "Transaksi Simulasi Terakhir" dan tombol "Lihat Semua" bertabrakan dan terlipat ke 2 baris, nama lahan terpotong menjadi `PARCEL-A ...`, dan tanggal WIB terpecah menjadi 3 baris terpisah.
- **Tindakan Perbaikan**:
  1. Menyeragamkan judul header menjadi ringkas: **"Rantai Segel"** dan **"Transaksi Terakhir"** (`whitespace-nowrap text-[15px] sm:text-[16.5px] font-bold`).
  2. Memberikan `whitespace-nowrap shrink-0` pada tombol "Lihat Semua" sehingga selalu sejajar rapi di sisi kanan kartu.
  3. Menghapus `flex-wrap` dan menambahkan `whitespace-nowrap` pada tanggal WIB di entri Rantai Segel sehingga tercetak dalam satu baris bersih (`Terverifikasi · 15 Jan 2024, 17:05 WIB`).
  4. Mengatur label rute transaksi menjadi ringkas dan jelas (`Lahan A → Zona 1`) dengan badge `Simulasi` yang proporsional.


