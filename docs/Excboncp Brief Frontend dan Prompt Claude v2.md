# Excboncp: Brief Frontend dan Prompt Claude (v2)

Nov 13, 2026 · @mauones · menggantikan versi 12 Nov

Dokumen ini memberi tim FE lima hal: daftar halaman beserta folder tempatnya; arah tampilan (hijau muda, putih, satu warna tambahan) berikut gambar referensi Beranda; rancangan Screener dan halaman Grafik lahan yang bergaya terminal grafik; sistem rasa dan gerak (micro-interaction) supaya web terasa seperti aplikasi di iPhone; dan sepuluh prompt (satu aturan tetap dan sembilan tugas) yang siap ditempel ke Claude Sonnet 5.5. Simpan berkas ini sebagai `docs/brief-frontend.md` supaya agen bisa membaca bagian yang dirujuk prompt.

## Yang berubah dari versi 12 Nov

| Bagian | Versi 12 Nov | Versi 13 Nov |
| --- | --- | --- |
| Screener | Satu halaman tabel; klik baris membuka drawer | Dua halaman: daftar (L17) dan Grafik lahan (L20), terminal grafik untuk satu lahan |
| Grafik | Maksimal dua seri, tanpa candlestick | Grafik besar dengan crosshair, rentang waktu, panel volume, jalur status, dan penanda kejadian. Candlestick harga tetap tidak dipakai (alasan di keputusan 10) |
| Gerak | Tiga gerak, tanpa animasi per kartu | Sistem rasa dan gerak: token, katalog interaksi, komponen bersama, dan halaman uji gerak |
| Prompt | 7 | 10. Baru: Prompt 2 (sistem gerak), 5 (Grafik lahan), 9 (audit gerak). Prompt Screener ditulis ulang; sisanya mendapat blok gerak |
| Endpoint baru | 4 | 5 (tambah `GET /screener/{parcel_id}/series`) |
| Keputusan tim | 9 | 14 (baris 10–14 baru) |
| Jadwal | Freeze besok (Hari 5) | Freeze hari ini (Jumat 13 Nov); lihat baris 14 |

## Keputusan yang perlu disetujui tim

Empat belas hal di bawah belum diputuskan blueprint atau bertabrakan dengannya; kalau tidak disepakati, FE akan menebak. Hari ini Jumat 13 Nov (Hari 5) dan freeze jatuh hari ini, jadi urutan kerja ada di baris 3 dan baris 14.

| # | Hal | Kenapa jadi masalah | Usulan | Pemegang |
| --- | --- | --- | --- | --- |
| 1 | Nama halaman “DEX” | Blueprint melarang menyebut ini bursa karbon dan tidak ada token yang dijual; DEX berarti bursa terdesentralisasi | Tampilan mengikuti screener, tetapi di layar bernama “Screener pasar” dan berlabel simulasi. Tanpa tombol beli, jual, atau tukar. Grafiknya di halaman terpisah (L20, baris 10). Tim boleh menyebutnya “DEX” secara lisan; di layar, kode, dan nama berkas selalu “Screener” | Malik, Revand |
| 2 | Layar awal setelah masuk | Diagram 8A dan 8B menetapkan L1 Peta sebagai layar awal | Tambah L16 Beranda sebagai layar awal; Peta tetap di menu. Ubah HOME di 8A dan catat di `docs/decisions.md` | Malik |
| 3 | Empat halaman baru = kebutuhan baru | Aturan blueprint: fitur baru berarti satu R baru dan model diperbarui; freeze Hari 5 | R30 Beranda dan R31 Screener (Should); R32 Transaksi langsung dan R33 Rekap (Could). Bangun dari mock dulu; kalau telat, potong Rekap, lalu Transaksi langsung, sebelum R18. R1–R14 dan R20–R24 tidak boleh terganggu. R34 dan R35 ada di baris 14 | Semua, di standup |
| 4 | Siapa boleh melihat angka uang | Matriks peran: Tamu tidak melihat L4 dan pembagian uang | Tamu hanya melihat Screener dan Grafik lahan ringkas (tanpa pendapatan, unit terjual, pembagian, dan data sensor; Davin memastikan batas sensor). Transaksi langsung dan Rekap hanya setelah masuk. Komunitas hanya lahannya, Penerima hanya zonanya, dicek di server | Davin, Bagus |
| 5 | Endpoint baru | Setiap endpoint harus punya pemilik dan masuk `docs/contract.md` | Lima endpoint di bagian Kontrak data; Bagus menulis, Davin menyuplai status, Revand mencatat di kontrak | Revand |
| 6 | Riwayat untuk Rekap bulanan dan tahunan | Data demo hanya beberapa hari, jadi rekap tahunan akan kosong | Skrip seed membuat riwayat transaksi simulasi beberapa bulan, berlabel simulasi | Bagus |
| 7 | Ukuran huruf | Prinsip 8: minimal 16 px, sedangkan Beranda padat | Semua teks 16 px; satu pengecualian: angka pada sumbu grafik 14 px | Malik |
| 8 | Framework FE | Blueprint hanya menyebut `web` yang dibangun dan disajikan di port 80 | Asumsi: React, Vite, TypeScript, hasil build statis. Kalau Malik memakai yang lain, ubah satu baris di Prompt 0 | Malik |
| 9 | Nama halaman “Dasbor” | AI membaca “dashboard” sebagai panel admin CRUD (tabel kelola data, tombol Tambah, Ubah, Hapus), bukan layar pembuka ringkas seperti gambar referensi | Halaman ini bernama Beranda (L16, /beranda) dan dijelaskan sebagai layar pembuka bergaya kartu yang hanya membaca. Beranda L0 di blueprint disebut Halaman depan (/) supaya tidak bentrok. Kalau tim lebih suka satu Beranda saja (Tamu melihat halaman depan, yang sudah masuk melihat kartu), gabungkan L0 dan L16 | Malik, Revand |
| 10 | Halaman grafik versus larangan candlestick | Referensi seperti DEX Screener dan TradingView berpusat pada candlestick harga. Di sini harga hanya placeholder tetap (Rp40.000 per ton), jadi candle harga akan datar dan menyesatkan; blueprint juga melarang kesan bursa | Ambil pola terminalnya (grafik besar, rentang waktu, crosshair, panel volume, penanda kejadian, panel detail), bukan candlestick harga. Isinya data proyek: unit tersedia dan beku, unit terjual, pendapatan kumulatif simulasi, suhu dan kelembapan tanah dengan ambang, dan jalur status. Tanpa buku order, indikator teknikal (RSI, MACD), alat gambar, atau tombol transaksi | Malik, Revand |
| 11 | Pustaka grafik untuk L20 | Recharts kurang nyaman untuk crosshair yang diseret jari, zoom, dan penanda kejadian | Rekomendasi: `lightweight-charts` (sumber terbuka dari TradingView) hanya di L20; Recharts tetap di halaman lain. Perlu dicek lisensi dan syarat atribusi, serta API versi yang terpasang (tidak saya buka dari sesi ini). Cadangan: Recharts dengan crosshair khusus | Malik |
| 12 | Pustaka gerak | Rasa iPhone butuh gerak berpegas dan gestur seret | CSS dulu (token, easing pegas lewat `linear()`); paket `motion` hanya untuk sheet yang bisa diseret dan transisi tata letak; View Transitions untuk pindah halaman bila didukung. Nama paket dan dukungan browser perlu dicek (lihat bagian belum diverifikasi) | Malik |
| 13 | Aturan lama “gerak hanya tiga” dan “tanpa animasi per kartu” | Bertabrakan dengan permintaan micro-interaction | Diganti sistem gerak yang berbasis anggaran: tiap interaksi dijawab dalam 100 ms, hanya transform dan opacity, maksimal 360 ms (grafik 600 ms sekali), satu hal bergerak sekali waktu, semuanya mati saat reduced motion | Malik |
| 14 | Waktu dan prioritas L20 serta gerak | Freeze hari ini; L20 dan gerak adalah tambahan | R34 Grafik lahan (Could) dan R35 Sistem rasa dan gerak (Should; lapisan tipis di komponen bersama, murah). Urutan potong bila telat: Prompt 9, lalu Rekap, lalu Transaksi langsung, lalu Grafik lahan, semuanya sebelum R18. Prompt 2 (dasar gerak) jangan dipotong karena semua layar memakainya. R1–R14 dan R20–R24 tetap dilindungi | Semua, di standup |

## Peta halaman

Ada 19 halaman: 14 dari blueprint (L0–L14, tanpa L8 yang hanya tombol) dan 5 baru (L16–L20), ditambah satu halaman 404. L15 juga hanya tombol, di dalam L4.

| Kode | Rute | Layar | Boleh dibuka | Data |
| --- | --- | --- | --- | --- |
| L0 | `/` | Halaman depan (landing) | Semua | `GET /parcels` untuk peta kecil |
| L10 | `/daftar` | Daftar | Tamu | `POST /auth/register` |
| L11 | `/masuk` | Masuk | Tamu | `POST /auth/login` |
| L12 | `/bantuan` | Bantuan “Apa ini?” dan tur 3 langkah | Semua | statis |
| L14 | `/panduan-juri` | Panduan juri dan panitia | Semua | statis |
| L7 | `/verifikasi/:id` | Verifikasi publik | Semua | `GET /verify/{id}` |
| L9 | `/indikator` | Papan indikator | Semua | `GET /metrics` |
| L1 | `/peta` | Peta lahan | Semua | `GET /parcels` |
| L2 | `/peta/:parcelId` | Panel status lahan, memuat tombol keberatan (L8) | Semua (Tamu ringkas) | `GET /parcels/{id}` |
| L17 baru | `/screener` | Screener pasar (daftar lahan) | Semua (Tamu ringkas) | `GET /screener` |
| L20 baru | `/screener/:parcelId` | Grafik lahan (terminal grafik satu lahan; memuat panel status L2) | Semua (Tamu ringkas) | `GET /screener/{id}/series`, `GET /parcels/{id}`, `GET /trades`, `GET /market/stream` |
| L16 baru | `/beranda` | Beranda | Setelah masuk | `GET /me`, `/screener`, `/reports/day`, `/trades`, `/metrics` |
| L18 baru | `/langsung` | Transaksi langsung | Setelah masuk | `GET /trades`, `GET /market/stream` |
| L19 baru | `/rekap/:periode` | Rekap harian, mingguan, bulanan, tahunan | Setelah masuk | `GET /reports/{periode}` |
| L4 | `/pasar/:parcelId` | Pasar simulasi, memuat tombol Putar skenario api (L15) | Komunitas, Pengelola, Penerima, Auditor | `GET /market/{id}` |
| L5 | `/zona/:zoneId` | Laporan zona penerima | Pengelola, Penerima, Auditor | `GET /zones/{id}/report` |
| L3 | `/izin/:parcelId` | Catat izin komunitas | Komunitas (lahan sendiri) | `POST /consent` |
| L6 | `/tinjau` | Tinjau dan setujui | Auditor | `POST /approve` |
| L13 | `/akun` | Akun dan keluar | Setelah masuk | `GET /me`, `POST /auth/logout` |

Menu utama dikelompokkan supaya tidak panjang, dan isinya menyesuaikan peran (cocok dengan matriks peran di blueprint).

| Grup | Menu | Tamu | Komunitas | Pengelola | Penerima | Auditor |
| --- | --- | --- | --- | --- | --- | --- |
| Pantau | Beranda | – | ya | ya | ya | ya |
| Pantau | Peta | ya | ya | ya | ya | ya |
| Pantau | Screener | ringkas | ya | ya | ya | ya |
| Pantau | Langsung | – | ya | ya | ya | ya |
| Laporan | Pasar | – | ya | ya | ya | ya |
| Laporan | Rekap | – | ya | ya | ya | ya |
| Laporan | Zona | – | – | ya | ya | ya |
| Bukti | Tinjau | – | – | – | – | ya |
| Bukti | Verifikasi | ya | ya | ya | ya | ya |
| Bukti | Indikator | ya | ya | ya | ya | ya |
| Bawah | Bantuan | ya | ya | ya | ya | ya |
| Bawah | Akun | – | ya | ya | ya | ya |

Grafik lahan (L20) tidak punya menu sendiri; ia dibuka dari baris Screener, panel lahan di Peta, dan kartu di Beranda.

Navigasi utama berupa sidebar berlabel di layar 1024 px ke atas dan tab bawah di HP. Blueprint menyebut “menu atas”; ini penyesuaian kecil karena ikon tanpa kata membingungkan pengguna awam.

**Halaman depan (landing, L0)** terdiri dari: judul dan satu paragraf penjelasan yang sudah ditulis di blueprint; peta kecil tanpa interaksi (Lahan A hijau, Lahan B merah, masing-masing dengan chip status); tiga tombol (Lihat peta sebagai tombol utama, Masuk, Daftar); tautan ke Panduan juri; dan pita “Simulasi, testnet. Belum ada dukungan resmi dari pihak mana pun.” Tidak ada deretan tiga kartu fitur berikon, dan tidak ada angka besar bergradien. Halaman depan adalah satu-satunya tempat maskot tampil besar.

## Struktur folder web/

Satu layar punya satu folder di `pages/`, logika data ada di `features/`, dan komponen yang dipakai banyak layar ada di `components/`. Dengan begitu fitur baru tidak perlu menyentuh layar lain.

```text
web/
├── CLAUDE.md                 aturan tetap untuk Claude (Prompt 0)
├── Dockerfile                build statis, disajikan nginx di port 80
├── nginx.conf
├── index.html                viewport-fit=cover (area aman iPhone)
├── vite.config.ts
├── package.json              termasuk skrip cek:gerak
├── .env.example              VITE_USE_MOCK, VITE_API_BASE=/api
├── public/
│   ├── favicon.svg
│   └── maskot/               SVG per pose (slot disiapkan, aset menyusul)
├── mock/                     JSON berbentuk persis docs/contract.md
│   ├── me.*.json             satu per peran (4 akun demo)
│   ├── parcels.json, parcel.A.json, parcel.B.json
│   ├── market.A.json, market.A.api.json
│   ├── screener.json, trades.json
│   ├── series.{A,B}.{24h,7d,30d,90d}.json   seri untuk Grafik lahan
│   ├── reports.{day,week,month,year}.json
│   └── stream.ts             pengirim peristiwa tiruan
└── src/
    ├── main.tsx
    ├── app/
    │   ├── router.tsx        satu tabel rute
    │   ├── nav.ts            menu per peran
    │   ├── guards.tsx        RequireLogin, RequireRole
    │   ├── AppShell.tsx      sidebar, tab bawah, bilah atas
    │   └── PublicLayout.tsx
    ├── pages/                satu folder per layar
    │   ├── depan/  daftar/  masuk/  bantuan/  panduan-juri/
    │   ├── verifikasi/  indikator/  tidak-ditemukan/
    │   ├── beranda/  peta/  izin/  screener/  grafik-lahan/  langsung/  rekap/
    │   ├── pasar/  zona/  tinjau/  akun/
    │   └── galeri-gerak/     hanya mode dev, tidak ikut build produksi
    ├── features/             api.ts dan hooks.ts per domain
    │   └── auth/  parcels/  market/  trades/  reports/  ledger/
    ├── components/
    │   ├── ui/               Button, Chip, Card, Tabs, Table, Drawer, Tooltip,
    │   │                     EmptyState, ErrorState, Skeleton
    │   ├── domain/           StatusBadge, SimulasiBadge, Money, Unit, SourceTag,
    │   │                     RoleBadge, PeriodTabs, HashSeal, Receipt
    │   ├── charts/           Sparkline, MiniBars, AreaChart, SplitRing,
    │   │                     TerminalChart, ChartToolbar, ChartReadout, StatusStrip
    │   ├── motion/           Pressable, Segmented, Sheet, Reveal, LiveNumber,
    │   │                     PulseDot, Shake, RouteTransition
    │   └── mascot/           Mascot.tsx
    ├── lib/                  api, format, time, copy, roles, sse, hash, motion, haptics
    ├── styles/               tokens.css, motion.css, base.css, fonts.ts
    └── types/contract.ts     cermin docs/contract.md
```

| Kalau mau menambah | Taruh di |
| --- | --- |
| Layar baru | `pages/<nama>/`, satu baris di `app/router.tsx`, satu baris di `app/nav.ts` |
| Panggilan ke API | `features/<domain>/api.ts` dan `hooks.ts`; layar tidak memanggil `fetch` sendiri |
| Teks istilah, label status, pesan gagal | `lib/copy.ts`, satu sumber supaya bahasa awam konsisten |
| Komponen yang dipakai dua layar atau lebih | `components/`; kalau satu layar saja, di folder layar itu |
| Angka, warna, dan status | Tidak ditulis di kode; datang dari API atau mock |
| Mock baru | `mock/` dengan bentuk persis kontrak, lalu cerminkan tipenya di `types/contract.ts` |
| Gerak, transisi, atau umpan balik sentuh baru | Token di `styles/motion.css`, komponen di `components/motion/`; durasi dan easing tidak ditulis di tempat lain (dicek `npm run cek:gerak`) |
| Tes | Di samping filenya; tiap layar menguji empat keadaan: memuat, kosong, berhasil, gagal |

## Arah desain

Latar hijau muda, kartu putih, dan satu aksen biru yang hanya muncul pada hal yang berkaitan dengan bukti, jadi biru selalu berarti “ini bisa diperiksa”. Gambar referensi tim ada tepat di bawah paragraf ini; simpan sebagai `docs/referensi-beranda.jpg`. Ia hanya acuan rasa dan tata letak, jangan disalin persis.

&#91;image: Gambar referensi tampilan Beranda: sapaan dan kolom cari di atas, rel ikon di kiri, empat kartu ringkasan, grafik Balance, pengukur 80 persen, kartu profil, tumpukan kartu kredit, daftar transfer, dan kartu keamanan\]

*Gambar referensi tim. Nama, angka, dan teks contoh di dalamnya tidak dipakai; bagian “Beranda” menjelaskan tiap kartu diganti apa.*

### Warna

Rasio kontras di tabel ini dihitung ulang pada 12 Nov dan cocok dengan angka yang tertulis.

| Nama | Token | Hex | Dipakai untuk | Kontras |
| --- | --- | --- | --- | --- |
| Hijau Pagi | `--canvas` | `#EEF5EC` | Latar halaman | Teks tinta 14,3:1 |
| Kertas | `--surface` | `#FFFFFF` | Kartu | Teks tinta 15,9:1 |
| Garis | `--line` | `#D8E5D4` | Garis tipis kartu dan tabel | Dekoratif |
| Hijau Daun | `--leaf-300` | `#8FCB97` | Isian grafik dan sorotan; bukan teks | 1,9:1 di putih, jadi tidak pernah satu-satunya penanda |
| Hijau Rimba | `--forest-700` | `#2E6B3F` | Tombol utama, ikon aktif, teks hijau | 6,4:1 di putih; 5,8:1 di Hijau Pagi |
| Hijau Tua | `--forest-800` | `#1F4D2E` | Kartu sorotan (gradien hijau ke hijau) | 9,7:1 untuk teks putih |
| Tinta Hutan | `--ink` | `#14261A` | Teks utama | 15,9:1 di putih |
| Abu Lumut | `--ink-muted` | `#4A5E4F` | Teks pendukung | 7,0:1 di putih; 6,3:1 di Hijau Pagi |
| Biru Segel (aksen) | `--seal-600` | `#1F5A94` | Segel digital, tautan verifikasi, fokus keyboard, seri Pengelola di grafik | 7,1:1 di putih |
| Biru Segel muda | `--seal-100` | `#E3EEF9` | Latar chip dan kartu segel | Teks biru 6,1:1 |

Alasan memilih biru: empat status memakai hijau, kuning, oranye, dan merah, jadi aksen tidak boleh berasal dari keluarga itu; blueprint juga sudah memakai biru untuk hal yang dikunci hash. Oranye maskot hanya ada di ilustrasi, tidak pernah di antarmuka.

Status selalu warna, ikon, dan kata sekaligus (prinsip 3 blueprint).

| Status | Teks | Latar | Kontras | Ikon (contoh Phosphor) | Kata di layar |
| --- | --- | --- | --- | --- | --- |
| VERIFIED | `#17692F` | `#E2F3E6` | 5,9:1 | `CheckCircle` | Terverifikasi |
| WARNING | `#7A5600` | `#FFF0C7` | 5,9:1 | `WarningCircle` | Perlu perhatian |
| DISPUTE | `#9A4400` | `#FFE5D0` | 5,4:1 | `PauseCircle` | Ditahan, ada sengketa |
| BLOCKED | `#B3261E` | `#FDE3E1` | 5,4:1 | `Lock` | Belum bisa dijual, menunggu izin komunitas |

Grafik dua seri memakai `#1E7F3F` untuk Komunitas (5,0:1 di putih) dan `#1F5A94` untuk Pengelola (7,1:1). Jarak warna untuk buta warna (ΔE 18,8) dan pemeriksaan lightness dan chroma berasal dari sesi sebelumnya dan belum saya jalankan ulang. Setiap seri diberi label langsung selain legenda.

**Warna di Grafik lahan (L20)** memakai token yang sudah ada, tanpa hex baru: Unit tersedia `#1E7F3F` (seri Komunitas), Unit beku `#7A5600` (teks status Perlu perhatian, 5,9:1 di putih), Unit terjual berupa batang `--leaf-300` (isian, bukan teks, selalu diberi label langsung), Pendapatan kumulatif `#1E7F3F`, garis ambang putus-putus `--ink-muted`, crosshair `--ink-muted`, grid `--line`. Biru segel hanya untuk penanda segel terkunci. Maksimal dua seri per panel; panel volume dan jalur status adalah panel terpisah di bawahnya.

### Font

| Peran | Font | Untuk | Alasan |
| --- | --- | --- | --- |
| Antarmuka dan teks | Atkinson Hyperlegible Next (400, 500, 600, 700) | Menu, label, tabel, tombol, paragraf | Dirancang Braille Institute agar huruf yang mirip tidak tertukar; cocok untuk HP di bawah matahari (prinsip 8) dan pengguna awam; jarang dipakai template |
| Judul dan angka besar | Source Serif 4 (600) | Sapaan, judul layar, angka KPI | Memberi nada laporan yang bisa dipercaya dan kontras jelas dengan teks sans |
| Kode dan segel | Atkinson Hyperlegible Mono | Hash, nomor resi, id catatan | Huruf O dan angka 0, serta 1, l, dan I dibedakan jelas, penting saat orang membandingkan segel |

Pasang lewat Fontsource ([Atkinson Hyperlegible Next](https://fontsource.org/fonts/atkinson-hyperlegible-next/install), [Atkinson Hyperlegible Mono](https://fontsource.org/fonts/atkinson-hyperlegible-mono/install), [Source Serif 4](https://fontsource.org/fonts/source-serif-4/install)), bukan dari CDN, supaya tetap tampil saat skenario internet mati di tangga cadangan blueprint. Ketiga halaman itu ada dan menandai fontnya *Variable* (7, 7, dan 8 bobot), tetapi nama paket npm dan nama family CSS tidak muncul pada hasil bacaan saya: buka tab Developer setup di tiap halaman dan pakai nama persis dari sana. Dukungan angka tabular pada Atkinson Next dan angka lining pada Source Serif 4 juga belum saya pastikan: uji kolom angka, dan jika tidak sejajar, pakai Atkinson Hyperlegible Mono untuk kolom itu.

Hindari sebagai font utama: Inter, Roboto, Arial atau system-ui, Poppins, Montserrat, Space Grotesk, DM Sans, Plus Jakarta Sans, Outfit, Manrope, Fraunces, dan Playfair Display. Itu yang paling sering muncul di antarmuka buatan AI.

| Gaya | Ukuran / tinggi baris | Bobot | Catatan |
| --- | --- | --- | --- |
| Paragraf | 16 / 24 | 400 | Minimal 16 px di mana pun |
| Label dan tombol | 16 / 20 | 600 |  |
| Judul kartu | 18 / 24 | 600 | Sans |
| Judul layar | 28 / 36 (HP 24 / 32) | 600 | Serif |
| Angka KPI | 36 / 40 (HP 28 / 32) | 600 | Serif, angka tabular lurus (lining) |
| Angka sumbu grafik | 14 / 20 | 400 | Satu-satunya pengecualian dari 16 px |

### Bentuk, jarak, gerak

- Radius 16 px untuk kartu, 10 px untuk elemen di dalamnya, bentuk pil untuk chip dan tombol. Referensi memakai satu radius besar yang seragam.
- Garis 1 px `--line` dan hampir tanpa bayangan; bayangan halus hanya untuk drawer, sheet, menu melayang, dan kartu yang bisa diklik pada saat hover (hanya perangkat dengan hover).
- Jarak kelipatan 4 px; antar kartu 20 px; isi kartu 20 sampai 24 px.
- Ikon: Phosphor, bobot regular, 20 px, satu set saja.
- Gerak: diatur penuh oleh bagian “Rasa dan gerak (micro-interaction)” di bawah, yang menggantikan aturan lama “gerak hanya tiga”. Semua mati bila pengguna memilih *reduced motion*. Tetap berlaku: tidak ada angka yang menghitung naik dari nol saat muat awal.
- Hanya tema terang. Warna memakai variabel CSS, jadi tema gelap bisa ditambah nanti.

### Teks layar

- Bahasa Indonesia sehari-hari dan kalimat aktif. Tombol berupa kata kerja: “Catat izin”, “Periksa segel”, “Lihat pasar”.
- Tanpa emoji, tanpa “Selamat datang kembali”, tanpa lorem ipsum, dan tanpa nama contoh seperti pada gambar referensi. Pakai angka dari blueprint (600 unit, Rp24.000.000, Rp14.112.000, Rp9.408.000).
- Format Indonesia: Rp24.000.000, 1.240 ton, 34,2%; waktu WIB, 24 jam.
- Setiap tindakan penting diakhiri resi berisi nomor referensi dan waktu.

### Beda dari gambar referensi

1. Warna: referensi memakai hijau sage di atas latar abu hangat; di sini hijau muda dan putih, ditambah biru segel, dan kartu sorotan hanya bergradien hijau.
2. Navigasi: referensi memakai rel ikon melayang; di sini sidebar berlabel dan tab bawah di HP.
3. Bentuk: kartu 16 px bergaris tipis, bukan kartu bulat besar berbayang lembut.
4. Pengukur setengah lingkaran menjadi cincin pembagian dua segmen.
5. Tumpukan kartu kredit isometrik menjadi rantai segel: tiga entri buku catatan tersambung garis.
6. Kartu sidik jari menjadi kartu cek keaslian dengan segel visual yang dibuat dari hash.
7. Judul dan angka besar memakai serif, bukan sans seragam.
8. Tambahan yang tidak ada di referensi: strip “Langkah berikutnya” per peran dan pil “Simulasi, testnet” yang selalu terlihat.
9. Screener dan Grafik lahan meminjam pola terminal grafik (DEX Screener, TradingView) hanya pada tata letak: daftar yang bisa diurutkan, grafik besar dengan crosshair dan rentang waktu, panel volume, dan panel detail di samping. Referensi semacam itu biasanya gelap, bernuansa neon, dan berpusat pada candlestick harga serta tombol transaksi; di sini tetap terang, hijau dan putih, tanpa candlestick harga, tanpa buku order, tanpa tombol transaksi.

## Rasa dan gerak (micro-interaction)

Tujuannya: web ini terasa seperti aplikasi di iPhone, yaitu menjawab sentuhan seketika, bergerak seperti benda nyata, dan tenang sehingga pengguna betah. Yang ditiru adalah perilakunya (respons cepat, pegas, seret, lepas), bukan tampilannya: tanpa font, ikon, atau komponen bawaan Apple. Bagian ini menggantikan aturan lama “gerak hanya tiga”.

### Enam prinsip

1. **Jawab dalam 100 ms.** Tekan, fokus, dan hover langsung terlihat tanpa menunggu jaringan. Hasil dari server menyusul.
2. **Gerak menjelaskan.** Sesuatu muncul dari tempat asalnya (drawer dari tepi, resi dari bawah) dan kembali ke sana. Tidak ada gerak yang hanya hiasan.
3. **Fisik, bukan mekanis.** Perlambatan dan pegas ringan, bukan linear. Semua gerak bisa dibatalkan di tengah jalan: tekan lagi atau seret balik tanpa menunggu selesai.
4. **Ringan.** Hanya `transform` dan `opacity` yang dianimasikan; tidak pernah `width`, `height`, `top`, atau `left`. Tidak ada yang lebih dari 360 ms, kecuali grafik tergambar sekali (600 ms).
5. **Tenang.** Satu hal bergerak pada satu waktu di titik perhatian pengguna. Maksimal satu elemen yang berdenyut per layar (titik “Langsung”). Tidak ada parallax, konfeti, pantulan berlebihan, atau animasi yang berputar tanpa henti.
6. **Aman.** Saat pengguna memilih *reduced motion*, gerak diganti perubahan seketika atau pudar 120 ms. Tidak ada informasi yang hanya hadir lewat gerak, dan tidak ada kedipan lebih dari tiga kali per detik.

### Token gerak (`src/styles/motion.css`)

Nilai awal adalah usulan; tim menyetelnya dengan merasakan di HP asli, lalu membekukannya. Komponen hanya boleh memakai token ini.

| Token | Nilai awal | Dipakai untuk |
| --- | --- | --- |
| `--dur-press` | 90 ms | Tekan dan lepas tombol, chip, kartu |
| `--dur-fast` | 160 ms | Hover, ikon, tooltip, pudar kecil |
| `--dur-base` | 240 ms | Pil geser pada tab, pergantian panel, perubahan status, crosshair |
| `--dur-slow` | 360 ms | Drawer, sheet, pindah halaman |
| `--dur-draw` | 600 ms | Grafik tergambar sekali dan HashSeal |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Sesuatu yang muncul |
| `--ease-ios` | `cubic-bezier(0.32, 0.72, 0, 1)` | Drawer, sheet, pindah halaman; kurva yang mendekati rasa iOS, disetel di perangkat |
| `--ease-inout` | `cubic-bezier(0.4, 0, 0.2, 1)` | Perpindahan di tempat |
| `--spring` | easing `linear()` dengan lonjakan sekitar 4% | Lepas tekan, ikon tab aktif, chip menyala. Daftar titiknya dibuat skrip kecil di repo; cadangan `--ease-out` lewat `@supports` |
| `--press-scale` | 0,97 (kartu besar 0,985) | Skala saat ditekan |
| `--lift` | -2 px ditambah bayangan halus | Hover kartu yang bisa diklik |
| `--stagger` | 40 ms, maksimal 6 elemen | Masuk berurutan saat muat awal |

Semua gaya hover dibungkus `@media (hover: hover) and (pointer: fine)`, karena di layar sentuh hover “menempel” setelah ketukan.

### Katalog interaksi

| Elemen | Saat hover (pointer halus) | Saat ditekan | Hasil dan umpan balik |
| --- | --- | --- | --- |
| Tombol utama dan pil | Warna sedikit lebih gelap (campuran warna lewat `color-mix`, tanpa hex baru) | Mengecil ke 0,97, lepas dengan pegas | Saat memuat: label berganti spinner di tempat dengan lebar tetap, tanpa loncat. Sukses: centang tergambar 240 ms, lalu resi |
| Kartu yang bisa diklik | Naik 2 px, bayangan halus, panah kecil di pojok bergeser 2 px | Mengecil ke 0,985 | Fokus keyboard memakai cincin biru segel, tanpa gerak tambahan |
| Baris tabel dan daftar | Latar leaf-300 transparan, chevron masuk dari kiri | Latar lebih pekat | Baris baru dari data langsung: disorot 1,2 detik |
| Segmented, Tabs, PeriodTabs | Latar pil bergeser mengikuti pilihan | Pil mengecil kecil | Pil penanda bergeser 240 ms (`--ease-ios`); isi panel berganti dengan pudar dan geser 8 px; panah kiri kanan berpindah pilihan |
| Chip filter | Garis lebih tegas | Mengecil ke 0,97 | Menyala dengan pegas, ikon centang masuk |
| Tab bawah (HP) | Tidak ada | Ikon mengecil | Ikon aktif melompat kecil (1, 1,12, 1; 280 ms), penanda aktif bergeser; tinggi 56 px ditambah area aman |
| Sidebar (desktop) | Latar item | Latar lebih pekat | Penanda aktif bergeser vertikal |
| Drawer dan sheet | – | – | Masuk dari tepinya dengan `--ease-ios` 360 ms, scrim memudar. Di HP bisa diseret: efek karet di batas, kecepatan lempar menentukan tutup, dua titik henti (setengah, penuh). Fokus terkunci di dalam, Esc menutup, latar `inert` |
| Tooltip | Muncul setelah 300 ms, pudar dan skala 0,96 ke 1 dalam 120 ms | Di layar sentuh lewat tekan lama | Hilang seketika saat pointer pergi |
| Grafik | Crosshair mengikuti pointer dan menempel ke titik terdekat; seri yang disorot menebal, lainnya 40% | Di HP: tekan lama lalu geser untuk menelusuri, lepas kembali ke terbaru | Digambar sekali saat pertama dimuat; ganti rentang waktu berubah bentuk 400 ms; titik terakhir berdenyut bila data langsung |
| Angka | – | – | Angka yang berubah karena data baru menggulirkan digitnya 200 ms (LiveNumber); tidak pernah menghitung naik dari nol saat muat awal |
| StatusBadge | – | – | Saat status berubah: warna dan ikon berganti pudar 240 ms, satu cincin sorot sekali |
| HashSeal | – | – | Saat pertama tampil, 32 busur muncul berurutan 10 ms (sekitar 320 ms); di resi ini satu-satunya momen perayaan, tanpa konfeti |
| Form (Masuk, Daftar, Catat izin) | – | – | Fokus: garis biru segel. Galat: kolom bergeser kecil 240 ms disertai pesan teks. Sukses: centang tergambar, resi naik dari bawah dengan pegas, maskot mengangguk |
| Pindah halaman | – | – | Pudar 160 ms dan geser 8 px; di HP maju bergeser ke kiri dan kembali ke kanan (View Transitions bila didukung, tanpa transisi bila tidak); posisi gulir dipulihkan saat kembali |
| Memuat | – | – | Kerangka dengan kilau pelan 1,4 detik, hanya muncul bila memuat lebih dari 200 ms (mencegah kedip); isi menggantikan kerangka dengan pudar tanpa loncat tinggi |
| Muat awal halaman | – | – | Maksimal 6 blok masuk berurutan (naik 8 px dan pudar, jeda 40 ms), hanya saat halaman pertama dimuat, bukan saat data diperbarui atau filter berubah |

### Perilaku sentuh dan perangkat

- Target sentuh minimal 44 × 44 px; jarak antar target cukup agar tidak salah ketuk.
- `touch-action: manipulation` pada kontrol (menghilangkan jeda ketukan dan zoom ketuk ganda); `-webkit-tap-highlight-color: transparent` karena sudah ada keadaan tekan sendiri.
- `viewport-fit=cover` dan padding `env(safe-area-inset-*)` di tab bawah, sheet, dan bilah atas (takik dan garis rumah iPhone); tinggi layar penuh memakai `100dvh`, bukan `100vh`.
- Ukuran huruf kolom isian 16 px agar Safari iOS tidak memperbesar layar saat fokus.
- `overscroll-behavior-y: contain` pada area gulir aplikasi; carousel kartu KPI di HP memakai `scroll-snap`.
- Getar (haptics) lewat `navigator.vibrate` hanya bekerja di Android; Safari iOS tidak mendukungnya, jadi jangan menjanjikan getar di iPhone. Pembungkus `lib/haptics.ts` tidak melakukan apa-apa bila tidak didukung, dan hanya dipakai untuk sukses dan gagal.
- Tarik untuk menyegarkan di HP bersifat opsional (Could); bila dibuat, hanya di Beranda, Screener, dan Langsung, dan tidak boleh bentrok dengan tarik-segarkan bawaan browser.
- Satu-satunya blur di aplikasi: bilah atas yang mendapat garis bawah dan latar surface 90% dengan blur tipis setelah halaman digulir. Glassmorphism dekoratif tetap dilarang.

### Tetap dilarang

Parallax, konfeti, pantulan besar, animasi yang berputar atau berdenyut tanpa henti di lebih dari satu elemen, animasi masuk yang menunda orang membaca, gerak yang tidak bisa dibatalkan, menganimasikan properti tata letak, dan angka yang menghitung naik dari nol saat muat awal.

### Cara menguji rasa

1. Halaman Galeri gerak (`/galeri-gerak`, hanya mode dev) berisi semua komponen gerak di satu tempat, dengan saklar *reduced motion* dan tombol perlambat 5 kali.
2. Buka di HP asli, iPhone dan Android bila ada; emulator tidak cukup untuk menilai rasa sentuh.
3. Nyalakan *reduced motion* di sistem dan pastikan tidak ada transform yang tersisa.
4. Jalankan `npm run cek:gerak`: gagal bila ada `transition`, `animation`, durasi, atau `cubic-bezier` di luar `motion.css` dan `components/motion/`.
5. Uji papan ketik: Tab, panah (Segmented, grafik), Esc (sheet dan tooltip).

## Beranda: kartu contoh diganti apa

Beranda (L16) adalah layar pembuka bergaya kartu seperti gambar referensi, bukan panel admin dan bukan CRUD: tidak ada tabel yang bisa ditambah, diubah, atau dihapus. Isinya ringkasan: tiap kartu mengambil data dari halaman asalnya dan membuka halaman itu saat diklik. Satu tombol besar per peran (“Langkah berikutnya”) menjaga prinsip blueprint satu layar, satu tujuan, satu tombol utama.

| Bagian pada gambar | Diganti menjadi | Isi | Klik menuju |
| --- | --- | --- | --- |
| Sapaan “Hello, Carlic!” | Sapaan peran | “Selamat siang, {nama}”, chip peran, subjudul “Kondisi hutan dan pasar simulasi, {jam} WIB” | – |
| Kolom cari | Cari lahan atau segel | Nama lahan atau nomor entri buku catatan | `/peta/:id` atau `/verifikasi/:id` |
| Ikon obrolan bertitik merah | Bantuan | Tombol “Apa ini?”, tanpa titik merah | `/bantuan` |
| Ikon lonceng | Kabar terbaru | Perubahan status dan resi, hanya di dalam aplikasi (notifikasi ke HP belum ada di blueprint) | `/peta/:id` atau `/verifikasi/:id` |
| Rel ikon di kiri | Sidebar berlabel | Menu per peran | – |
| Kartu “Spent this month” (batang kecil) | Unit terverifikasi | Total ton dan 7 batang harian | `/screener` |
| Kartu “New clients” (garis kecil) | Status lahan | Empat titik status dengan jumlah lahan | `/peta` |
| Kartu “Earnings” | Bagian komunitas hari ini | Rupiah simulasi dan selisih dari kemarin | `/rekap/harian` |
| Kartu “Activity” (bergradien) | Dari data ke status | Detik dari data sensor sampai status (R18) dan garis kecil | `/indikator` |
| Grafik “Balance” dan dua chip melayang | Pendapatan simulasi | Grafik area dengan tab Harian, Mingguan, Bulanan; chip melayang Unit terjual dan Pendapatan; chip kondisi pasar | `/rekap/:periode` |
| Pengukur “Earnings 80%” | Pembagian hasil | Cincin dua segmen: Komunitas 60% dan Pengelola 40% (dari hasil setelah biaya) beserta rupiahnya; biaya sandbox 2% ditulis di bawahnya | `/pasar/:id` |
| Kartu profil | Kartu saya | Avatar maskot, nama, peran, lahan atau zona tertaut, tiga angka sesuai peran | `/akun` |
| Tumpukan kartu kredit dan “Add New Card” | Rantai segel | Tiga entri buku catatan terakhir tersambung garis, hash pendek, status Terkunci atau Menunggu, tombol “Periksa segel” | `/verifikasi/:id` |
| “Your Transfers” | Transaksi simulasi terakhir | Empat baris: Lahan ke Zona, unit, rupiah, jam, tag Simulasi | `/langsung` |
| “Keep you safe!” dan sidik jari | Cek keaslian | Kolom nomor segel, tombol “Periksa”, segel visual dari hash | `/verifikasi/:id` |

Isi menyesuaikan peran, dan server yang membatasi datanya:

| Peran | Langkah berikutnya | Beda isi |
| --- | --- | --- |
| Komunitas | “Catat izin untuk Lahan X” bila izin belum ada; selain itu “Lihat bagian hasil saya” | Hanya lahan miliknya |
| Pengelola | “Lihat pasar Lahan A”; bila ada status Perlu perhatian, “Lihat alasan” | Semua lahan kelolaannya |
| Penerima | “Buka laporan zona” | Kartu unit menjadi “Unit terpakai zona”; transaksi hanya zonanya |
| Auditor | “Tinjau {n} lahan” | Rantai segel menyorot entri yang menunggu penguncian |

### Tata letak di layar 1280 px ke atas

Bilah atas berisi sapaan, kolom cari, Bantuan, dan Kabar; di bawahnya pil “Simulasi, testnet” dan strip Langkah berikutnya selebar penuh. Di kiri ada sidebar berlabel. Kartu disusun dalam grid 12 kolom:

| Baris | Kartu dan lebar kolomnya |
| --- | --- |
| 1 | Unit terverifikasi (3), Status lahan (3), Bagian komunitas hari ini (3), Dari data ke status (3, kartu hijau sorotan) |
| 2 | Pendapatan simulasi (6), Pembagian hasil (3), Kartu saya (3) |
| 3 | Rantai segel (4), Transaksi simulasi terakhir (4), Cek keaslian (4) |

- 768–1279 px: dua kolom. 360–767 px: satu kolom, dan empat kartu KPI menjadi 2×2.
- Tiap kartu punya keadaan memuat (kerangka kartu, bukan spinner satu halaman), kosong (misalnya “Belum ada transaksi hari ini”), dan gagal (pesan dan tombol “Coba lagi”). Satu kartu gagal tidak boleh mengosongkan Beranda.

## Halaman pantau dan laporan baru

Screener, Grafik lahan, Transaksi langsung, dan Rekap memakai data yang sama dengan Beranda, Peta, dan Pasar, jadi angka tidak bisa berbeda antar halaman. Semuanya berlabel “Simulasi, testnet”. Gerak dan umpan balik sentuh di semua halaman ini mengikuti bagian “Rasa dan gerak”.

### Screener pasar (`/screener`, L17): daftar lahan

Tujuannya: dalam lima detik orang tahu unit apa yang siap dijual, berapa nilainya, dan apa yang sedang tertahan, lalu bisa masuk ke grafik lahan yang dipilih. Pola tampilannya meniru halaman daftar pada screener dan terminal grafik (tabel yang bisa diurutkan, mini grafik di tiap baris, satu klik ke halaman grafik), tanpa fitur bursa. Tim boleh menyebutnya “DEX” secara lisan; di layar, kode, dan nama berkas selalu “Screener”.

- **Strip denyut pasar** di atas: Harga referensi (placeholder Rp40.000 per ton), Unit tersedia, Unit beku, Terjual hari ini, dan chip Kondisi pasar.
- **Perubahan terbaru**: baris chip yang bisa digeser (di HP dengan `scroll-snap`), satu chip per kejadian status, misalnya “Lahan A: Perlu perhatian, 14:12”. Klik membuka `/screener/:id`.
- **Filter cepat**: Siap dijual, Perlu perhatian, Menunggu auditor, Semua; filter zona; semua kolom bisa diurutkan. Pilihan ikut URL.
- **Kolom tabel**: Lahan (nama dan zona), Status, Unit tersedia, Unit beku, Nilai tersedia (Rp), Terjual 24 jam, Izin komunitas, Sensor terakhir (jam dan sumber ESP atau Simulasi), Segel (Terkunci atau Menunggu), Tren 7 hari (Sparkline). Header tabel menempel saat digulir; di 768–1279 px kolom Lahan menempel di kiri dan sisanya bisa digeser.
- **Klik baris** langsung membuka Grafik lahan (L20). Panel status lahan (L2) sudah ada di L20, jadi Screener tidak lagi memakai drawer.
- **Data segar**: diperbarui tiap 15 detik tanpa mengosongkan tabel; sel yang nilainya berubah disorot sebentar (1,2 detik) dan keterangan “diperbarui n detik lalu” ditulis dengan kata, jadi bukan hanya warna.
- **Pembanding statis** di bawah tabel, berlabel referensi dan bukan harga hutan: IDXCarbon Januari 2026 sekitar Rp40.000 per ton (hitungan tim; proyeknya mayoritas energi dan limbah) dari [Kabar Bursa](https://www.kabarbursa.com/carbon-trading/perdagangan-karbon-indonesia-januari-2026-turun-nilai-transaksi-rp47-miliar), dan kredit REDD+ yurisdiksi US$6–12 per ton (2024) dari [EDF](https://www.edf.org/media/average-prices-jurisdictional-redd-credits-reach-15-2028).
- **HP**: tabel menjadi satu kartu per lahan, lengkap dengan Sparkline; kartu bisa ditekan (skala 0,985) dan membuka L20.
- **Tamu** hanya melihat strip (harga referensi, unit tersedia, kondisi pasar) dan tabel tanpa kolom rupiah dan terjual; selnya bertuliskan “Masuk untuk melihat”.
- **Tidak ada**: tombol beli, jual, atau tukar; grafik candlestick; buku order; nama token; peringkat “paling naik”; daftar favorit (itu pengaturan pengguna yang belum ada di blueprint).

Kondisi pasar dihitung di server dengan kode, bukan AI. Urutan ini usulan; Davin memastikannya cocok dengan Model 5.

| Urut | Jika | Chip |
| --- | --- | --- |
| 1 | Tidak ada unit VERIFIED | Tidak ada unit dijual |
| 2 | Ada lahan DISPUTE | Sebagian ditahan |
| 3 | Ada lahan WARNING | Ada unit beku |
| 4 | Selain itu | Normal |

### Grafik lahan (`/screener/:parcelId`, L20)

Halaman terminal grafik untuk satu lahan. Tujuannya: dalam sekali lihat orang paham bagaimana unit lahan ini bergerak, kapan statusnya berubah, dan apa buktinya. Ini layar pantau yang hanya membaca, berlabel “Simulasi, testnet”. Pola tampilannya dari terminal grafik (grafik besar, rentang waktu, crosshair, panel volume, penanda kejadian, panel detail di samping), tetapi isinya data proyek ini, bukan harga.

**Tidak ada**: candlestick harga (harga hanya placeholder tetap), buku order, indikator teknikal (RSI, MACD, dan sejenisnya), alat gambar, tombol beli, jual, atau tukar, nama token, daftar pemegang, dan peringkat.

**Bilah judul**: tombol Kembali ke Screener (filter dan posisi gulir tetap), nama lahan, StatusBadge, SimulasiBadge, chip Kondisi pasar, dan “sensor terakhir n detik lalu” dengan SourceTag ESP atau Simulasi. Di bawahnya angka besar (serif): Unit tersedia, selisih terhadap awal rentang yang dipilih (panah, angka, dan kata), dan Nilai tersedia (Money) dengan keterangan “harga referensi, placeholder”.

**Grafik utama** (8 dari 12 kolom di layar 1280 px ke atas):

- **Bilah alat**: rentang waktu (24 jam, 7 hari, 30 hari, 90 hari; interval otomatis dari server dan ditulis, misalnya “tiap 15 menit”); metrik; jenis grafik (Area, Garis, Batang); sakelar “Rata-rata 7 hari”. Pilihan ikut URL: `?rentang=24j|7h|30h|90h&metrik=unit|terjual|pendapatan|suhu|tanah&jenis=area|garis|batang&ma=1`.
- **Metrik**:

| Metrik | Isi | Tampil |
| --- | --- | --- |
| Unit | Unit tersedia (hijau) dan Unit beku (kuning tua), dua seri | Area, garis, atau batang; metrik awal |
| Terjual | Unit terjual per interval | Batang saja (pilihan jenis nonaktif dengan penjelasan) |
| Pendapatan | Pendapatan kumulatif simulasi | Area atau garis |
| Suhu | Suhu lahan dengan garis ambang putus-putus berlabel “Ambang” | Garis |
| Tanah | Kelembapan tanah dengan garis ambang bila ada | Garis |

- **Crosshair dan pembacaan**: di desktop, garis vertikal dan horizontal mengikuti pointer dan menempel ke titik terdekat; panel pembacaan di pojok kiri atas grafik menuliskan waktu (WIB), nilai tiap seri, dan status pada saat itu. Di HP, tekan lama sekitar 250 ms lalu geser untuk menelusuri (seperti grafik saham di iPhone), dan lepas jari untuk kembali ke titik terbaru; gulir vertikal biasa tidak memicu penelusuran. Papan ketik: saat grafik fokus, panah kiri dan kanan memindahkan crosshair satu titik, Home dan End ke ujung.
- **Panel di bawah grafik utama** (waktu disinkronkan dengan crosshair): panel **Unit terjual** (batang volume) dan **Jalur status**, yaitu pita berwarna yang menunjukkan status lahan sepanjang waktu; tiap segmen berwarna, bertanda ikon di awalnya, dan diberi kata (“Terverifikasi”, “Perlu perhatian”, dan seterusnya).
- **Penanda kejadian** di grafik utama: ikon kecil untuk status berubah, izin dicabut, sensor melewati ambang, skenario api, dan segel terkunci. Klik atau ketuk membuka kartu kecil (popover di desktop, sheet di HP) berisi teks kejadian dan tautan “Periksa segel” ke `/verifikasi/:ledgerId` atau “Lihat di peta” ke `/peta/:id`. Bila terlalu rapat, penanda digabung dengan angka.
- **Data langsung**: titik baru dari `GET /market/stream` ditambahkan ke ujung kanan tanpa mengubah rentang yang sedang dilihat; titik terakhir berdenyut pelan (satu-satunya yang berdenyut di layar) dengan teks “Langsung”. Bila pengguna menggeser jauh dari ujung, muncul chip “Kembali ke terbaru”.
- **Riwayat seed**: rentang 30 dan 90 hari memakai riwayat simulasi dari skrip seed (keputusan 6). Batasnya ditandai garis tegak putus-putus bertuliskan “Riwayat simulasi”, dan judul grafik memuat SimulasiBadge.
- **Tampilan tabel**: tombol “Lihat sebagai tabel” menampilkan titik-titik yang sama sebagai tabel (alternatif untuk pembaca layar dan papan ketik). Grafik memiliki `role="img"` dan `aria-label` berisi angka utamanya; pembacaan crosshair diumumkan lewat `aria-live="polite"` yang diperlambat.

**Kolom kanan** (4 dari 12 kolom), tiga tab (Segmented):

| Tab | Isi |
| --- | --- |
| Ringkasan | Panel status lahan yang sama dengan L2 (komponen dipakai ulang): status, alasan, pembacaan sensor terakhir, izin komunitas. Di bawahnya cincin pembagian hasil lahan ini (SplitRing: Komunitas 60% dan Pengelola 40% dari hasil setelah biaya) dan tombol Buka peta dan Buka pasar |
| Transaksi | 20 transaksi terakhir lahan ini dari `GET /trades?parcel_id=` (Jam, Unit, Total, tag Simulasi), baris baru masuk dari atas dan disorot 1,2 detik; “Lihat semua” ke `/langsung` |
| Bukti | Rantai segel lahan ini: entri dengan HashSeal, hash pendek, Terkunci atau Menunggu, nomor catatan publik, dan tombol “Periksa segel” |

Di bawah grafik: daftar **Kejadian pada rentang ini** (jam, ikon, kata, teks) yang tiap barisnya menuju lahan atau halaman verifikasinya.

**Tamu**: grafik hanya metrik Unit dan Jalur status; metrik Terjual, Pendapatan, Suhu, dan Tanah serta tab Transaksi menampilkan “Masuk untuk melihat”. Batas data sensor untuk Tamu menunggu Davin. Pembatasan dilakukan server; FE hanya menyembunyikan kontrol. **Komunitas** hanya lahannya dan **Penerima** hanya zonanya; lahan lain menampilkan halaman “Belum bisa dibuka” beserta alasannya.

**HP (360 px)**: satu kolom. Urutannya bilah judul, angka besar, grafik utama setinggi sekitar 260 px (bilah alat berupa baris chip yang bisa digeser), panel Unit terjual, Jalur status, lalu tiga tab di bawahnya sebagai konten biasa (bukan sheet). Sheet dipakai untuk kartu penanda kejadian.

**Keadaan**: memuat (kerangka grafik berukuran tetap agar tidak ada loncatan); kosong (“Belum ada data untuk rentang ini”, pose mengintip, tombol “Pilih 30 hari”); gagal (pesan dan tombol “Coba lagi”); satu panel yang gagal tidak mengosongkan halaman. Satu seri berisi paling banyak 500 titik; server mengecilkan sampelnya.

**Perhitungan**: semua angka uang dan rata-rata 7 hari (`ma7_available`) dihitung server; FE tidak menjumlah atau merata-ratakan sendiri.

**Pustaka**: rekomendasi `lightweight-charts` untuk grafik utama (keputusan 11). Warna, font, dan ukuran huruf (14 px untuk sumbu) dibaca dari variabel CSS lewat `getComputedStyle`, jadi tidak ada hex di kode. Bila versi yang terpasang mendukung beberapa panel dalam satu grafik, pakai itu; bila tidak, pakai grafik terpisah dengan rentang waktu dan crosshair yang disinkronkan. Penuhi syarat atribusi pustaka dan catat di `docs/decisions.md`. Bila ada kendala (ukuran bundel, gaya, atribusi), cadangannya Recharts dengan crosshair khusus.

### Transaksi langsung (`/langsung`, L18)

- **Kiri (dua pertiga): umpan transaksi.** Kolom: Jam (WIB), Lahan ke Zona, Unit, Harga, Total, Tag (Simulasi, dan Skenario bila berasal dari tombol L15), Segel. Baris baru masuk dari atas dan disorot 1,2 detik; ada tombol “Jeda umpan”; baris yang sudah terkunci membuka `/verifikasi/:id`.
- **Kanan (sepertiga): panel Kondisi pasar.** Chip kondisi, batang unit tersedia dan beku, pendapatan hari ini, tiga kejadian status terbaru (misalnya “Lahan A: Perlu perhatian, 100 unit beku, 14:12”), dan “sensor terakhir diterima n detik lalu”.
- **Di bawah:** grafik pendapatan kumulatif hari ini per jam.
- **Penanda sambungan:** “Langsung”, “Menyambung ulang…”, dan “Terputus, menyegarkan tiap 10 detik”.
- **Cara kerja:** Server-Sent Events di `GET /market/stream`; bila putus, polling `GET /trades?since=`.
- **Peran:** Komunitas hanya melihat lahannya dan Penerima hanya zonanya, dibatasi di server.
- **Kosong:** “Belum ada transaksi hari ini.” Untuk Pengelola ditambah tautan “Putar skenario api di halaman Pasar”.

Catatan untuk Revand: aliran stream melewati dua perantara, dan keduanya bisa menahan peristiwa sampai buffer penuh. Di Caddy (server publik) atur `flush_interval -1` pada rute itu; di nginx kontainer `web` (jalan lokal) pakai `proxy_buffering off` untuk `/api/market/stream`.

### Rekap (`/rekap/:periode`, L19)

- **Tab** Harian, Mingguan, Bulanan, Tahunan, dengan panah Sebelumnya dan Berikutnya serta tombol kembali ke periode ini. Tanggal ada di URL (`?tanggal=2026-11-12`); minggu mulai hari Senin; zona waktu WIB.
- **Enam angka** dengan selisih terhadap periode sebelumnya: Transaksi, Unit terjual, Pendapatan, Bagian komunitas, Bagian pengelola, Unit beku.
- **Grafik batang**: per jam untuk harian, per hari untuk mingguan dan bulanan, per bulan untuk tahunan.
- **Kejadian penting**: daftar berjam untuk perubahan status, izin dicabut, dan segel terkunci; tiap baris membuka lahan atau halaman verifikasinya.
- **Rincian** per lahan dan per zona dalam tabel kecil.
- **Semua transaksi periode ini** sebagai daftar lipat berisi 50 baris dengan tombol “Muat lagi”.
- **Bukan PDF**: tidak ada unduhan; ini halaman yang dibaca di layar.
- **Dihitung server** dari tabel `trade` dan hasil status, bukan AI; masukan yang sama selalu menghasilkan angka yang sama.
- **Kosong:** “Belum ada transaksi pada periode ini.” disertai tautan ke periode terakhir yang berisi.

## Kontrak data dan sambungan antar halaman

Lima endpoint baru cukup untuk Beranda dan halaman baru lainnya; sisanya memakai endpoint yang sudah ada di blueprint (`/parcels`, `/parcels/{id}`, `/market/{id}`, `/metrics`, `/verify/{id}`, `/me`). Bentuk di bawah adalah usulan (nama kolom `series` mengikuti kolom sensor yang sudah ada di blueprint); Revand memasukkannya ke `docs/contract.md` dan menyamakan nama kolom dengan tabel `trade`.

| Endpoint | Dipakai | Isi minimal | Pemilik |
| --- | --- | --- | --- |
| `GET /screener` | L17, L16 | `as_of`, `reference_price_idr`, `price_is_placeholder` (selalu true), `totals` (`units_available`, `units_frozen`, `sold_today_units`, `market_state`), `rows[]` (`parcel_id`, `name`, `status`, `consent`, `units_available`, `units_frozen`, `value_idr`, `sold_24h_units`, `last_sensor_at`, `sensor_source`, `sealed`, `ledger_id`, `eas_uid`, `trend_7d[]`) | Bagus; Davin menyuplai status |
| `GET /trades` dengan `since`, `from`, `to`, `parcel_id`, `zone_id`, `limit` | L18, L19, L16 | `[{trade_id, ts, parcel_id, zone_id, units, price_idr, gross, fee, community, manager, source, ledger_id}]`; `source` berisi `simulator`, `scenario`, atau `seed` | Bagus |
| `GET /screener/{parcel_id}/series` dengan `range` (`24h`, `7d`, `30d`, `90d`) | L20 | `parcel_id`, `range`, `interval_s`, `as_of`, `seed_until` (kosong bila tidak ada riwayat seed), `points[]` (`ts`, `units_available`, `units_frozen`, `units_sold`, `revenue_cum_idr`, `status`, `ma7_available`, `temp_c`, `air_humidity`, `soil_moisture`, `fire_flag`), `thresholds` (ambang dari tabel aturan status, kosong bila tidak ada), `events[]` (`ts`, `type` yaitu `status`, `consent`, `seal`, `sensor_alert`, atau `scenario`, `status_after`, `text`, `ledger_id`, `eas_uid`); paling banyak 500 titik; untuk Tamu server menghapus kolom uang, unit terjual, dan sensor | Bagus; Davin menyuplai status, ambang, dan peristiwa |
| `GET /market/stream` (SSE) | L18, L16, L20 | Peristiwa `trade`, `status`, dan `sensor`; isi `trade` sama dengan satu elemen `/trades` | Bagus |
| `GET /reports/{periode}?tanggal=` | L19, L16 | `periode` (`day`, `week`, `month`, `year`), `from`, `to`, `totals` (`trades`, `units_sold`, `gross`, `fee`, `community`, `manager`, `units_frozen`), `prev_totals`, `buckets[]` (`label`, `ts`, `units`, `gross`), `by_parcel[]`, `by_zone[]`, `events[]` (`ts`, `type`, `parcel_id`, `text`) | Bagus; Davin menyuplai peristiwa status |

`rows[].ledger_id` saya tambahkan di sini karena kolom Segel di Screener menautkan ke `/verifikasi/:ledgerId`; isinya kosong bila lahan belum terkunci.

Aturan untuk semuanya: peran dibatasi di server (Komunitas hanya lahannya, Penerima hanya zonanya, Tamu hanya `/screener` dan `/screener/{id}/series` versi ringkas tanpa kolom uang dan sensor); angka uang berasal dari fungsi `settle` (R7) dan FE tidak menghitung ulang; `market_state` dihitung server.

### Supaya terasa satu sistem

1. **Satu sumber data.** Beranda tidak punya endpoint sendiri. Ia memakai hook yang sama dengan halaman lain (kunci cache TanStack Query yang sama), jadi angka di Beranda dan Screener tidak bisa berbeda.
2. **Setiap angka bisa diklik ke asalnya**, seperti pada tabel di bawah.
3. **Satu set komponen**: StatusBadge, Money, Unit, SimulasiBadge, SourceTag, dan HashSeal dipakai di semua halaman.
4. **Filter ikut URL** (`?zona=`, `?preset=`, `?tanggal=`), sehingga tautan bisa dibagikan dan tombol Kembali tetap bekerja.
5. **Satu pintu waktu dan format** (`lib/time.ts`, `lib/format.ts`): WIB dan format Indonesia di mana pun.
6. **Mock berbentuk kontrak** dengan satu saklar `VITE_USE_MOCK`, sehingga tidak ada yang menunggu API.
7. **Satu sistem gerak.** Durasi, easing, dan skala hanya dari `styles/motion.css` dan komponen di `components/motion/`; rasa tekan dan hover sama di semua layar.

| Dari | Klik | Ke |
| --- | --- | --- |
| Screener, baris lahan | Baris | `/screener/:id` (L20); panel status lahan ada di kolom kanan L20 |
| Screener, chip Perubahan terbaru | Chip | `/screener/:id` |
| L20, penanda kejadian | Penanda | Kartu kecil, lalu `/verifikasi/:ledgerId` atau `/peta/:id` |
| L20, tab Bukti | “Periksa segel” | `/verifikasi/:ledgerId` |
| L20, tab Ringkasan | Buka pasar | `/pasar/:id` |
| Screener, kolom Nilai tersedia | Angka | `/pasar/:id` |
| Screener atau Langsung, segel Terkunci | Segel | `/verifikasi/:ledgerId` |
| Beranda, chip Kondisi pasar | Chip | `/screener?preset=perhatian` |
| Beranda, Pendapatan simulasi | Grafik | `/rekap/:periode` |
| Beranda, Transaksi terakhir | “Lihat semua” | `/langsung` |
| Rekap, kejadian penting | Baris | `/peta/:id` atau `/verifikasi/:id` |
| Langsung, kejadian status | Baris | `/peta/:id` |
| Peta, panel lahan | “Lihat di pasar” | `/pasar/:id` |
| Peta, panel lahan | “Lihat grafik” | `/screener/:id` |

## Maskot orang utan

Siapkan slot maskot sekarang dan isi gambarnya nanti: tata letak tidak bergeser saat aset datang, dan tidak ada halaman yang bergantung padanya.

| Tempat | Pose | Ukuran | Catatan |
| --- | --- | --- | --- |
| Kartu saya (Beranda) | `potret` | 72 px, lingkaran | Menggantikan foto profil contoh |
| Halaman depan (L0) | `duduk-menunjuk`: duduk di dahan, menunjuk ke peta | 160–240 px | Satu-satunya tempat besar |
| Tur 3 langkah dan Bantuan (L12) | `menunjuk-peta`: memegang daun peta | 120 px | Langkah 1 dan 3 saja, bukan tiap langkah |
| Resi berhasil | `mengangguk`: mengangguk tenang | 96 px | Tanpa konfeti |
| Keadaan kosong (Rekap, Screener tanpa hasil) | `mengintip`: mengintip dari balik daun | 120 px | Pesan tetap menjelaskan apa yang bisa dilakukan |
| Memuat satu halaman penuh | `berayun`: berayun pelan di dahan | 64 px | Satu gerakan, mati saat *reduced motion* |
| Status Belum bisa dijual atau Ditahan | `memegang-papan`: berdiri netral memegang papan daun kosong | 96 px | Tidak sedih dan tidak menyalahkan |
| Halaman 404 | `mencari`: mencari di antara dahan | 160 px |  |

Aturan yang tidak boleh dilanggar:

- Tidak memegang koin, token, uang, atau dompet. Tidak ada token yang dijual, dan itu mencegah kesan investasi.
- Tidak memakai logo atau nama instansi, dan tidak diberi ucapan yang terdengar seperti dukungan.
- Tidak muncul di layar kerja yang serius: Pasar, Zona, Tinjau, tabel, dan grafik.
- Satu karakter dan satu gaya untuk semua pose: ilustrasi datar, dua sampai tiga warna ditambah garis tinta `#14261A`. Oranye kemerahan pada bulu hanya ada di ilustrasi.
- Karakter asli; jangan meniru maskot atau tokoh yang sudah ada.
- Nama maskot diputuskan tim.

Slot teknis yang disiapkan di Prompt 8:

- Komponen `<Mascot pose="potret" size={72} />` memuat `/maskot/<pose>.svg` dari `public/maskot/`.
- Kalau berkasnya belum ada, tampil placeholder netral (lingkaran hijau muda dengan siluet daun) di kotak berukuran tetap, jadi tata letak sama sebelum dan sesudah aset datang.
- Gambar dekoratif memakai `alt=""`; hanya Halaman depan dan tur yang diberi teks alternatif singkat.

Claude bisa membuat SVG kasar sebagai pengganti sementara, tetapi untuk maskot final pakai desainer atau alat gambar lalu simpan SVG-nya di `public/maskot/`. Menjaga satu gaya yang konsisten di delapan pose adalah bagian yang paling sulit bagi model.

Brief untuk desainer atau alat gambar: orangutan yang tenang dan ramah, bukan lucu berlebihan; ilustrasi vektor datar, latar transparan, bulu oranye kemerahan, wajah krem, garis tinta hijau gelap; proporsi yang sama di kedelapan pose; tidak memegang uang; tidak meniru karakter yang sudah ada.

## Prompt untuk Claude Sonnet 5.5

Sepuluh prompt: Prompt 0 berisi aturan tetap, lalu sembilan tugas yang dijalankan berurutan (1 fondasi, 2 sistem gerak, 3 Beranda, 4 Screener, 5 Grafik lahan, 6 Transaksi langsung, 7 Rekap, 8 maskot, 9 audit gerak). Pemisahan ini disengaja: satu prompt raksasa membuat model menyusutkan detail, sedangkan aturan yang disimpan di `web/CLAUDE.md` terbaca ulang di setiap sesi.

1. Taruh blueprint di `docs/blueprint.md`, berkas ini di `docs/brief-frontend.md`, dan gambar referensi (yang sama dengan di bagian Arah desain) di `docs/referensi-beranda.jpg`. Bila tim punya tangkapan layar terminal grafik yang disukai, simpan di `docs/referensi-terminal.jpg`; ia hanya acuan tata letak dan rasa, tidak untuk disalin, dan perlu diingat referensi semacam itu biasanya gelap sedangkan di sini tema terang.
2. Simpan Prompt 0 sebagai `web/CLAUDE.md`. Claude Code membacanya otomatis, jadi prompt 1 sampai 9 bisa pendek.
3. Jalankan Prompt 1 sampai 9 berurutan, satu sesi dan satu Pull Request per prompt (aturan kerja blueprint). Prompt 2 harus selesai sebelum layar mana pun diisi, dan Prompt 9 dijalankan paling akhir.
4. Sebelum menerima hasil, minta laporan “Cek mandiri” ditempel di PR, lalu buka halamannya di 360, 768, dan 1280 px.

Kenapa model akan mengerti: tiap prompt menyebut peran, konteks, aturan keras, larangan, dan kriteria selesai. Prompt 0 juga menyuruh Claude merangkum pemahamannya dan mendaftar konflik sebelum menulis kode, sehingga salah paham ketahuan di menit pertama. Prompt yang dirujuk ke berkas ini (2, 5, 9) membaca bagian bernama di `docs/brief-frontend.md`, jadi berkas itu harus ada di repo. Prompt ini belum saya jalankan; coba Prompt 1 dulu dan koreksi bila hasilnya melenceng.

### Prompt 0: aturan tetap (simpan sebagai `web/CLAUDE.md`)

```text
<peran>
Kamu engineer frontend senior sekaligus desainer produk untuk Excboncp. Kamu bekerja di folder web/. Kamu membangun langsung, bukan menawarkan rencana, dan menulis kode yang bisa dijalankan tim kecil dalam waktu sempit.
</peran>

<konteks>
Excboncp = CbonCP + simulasi pasar. Hutan yang buktinya terverifikasi (satelit, sensor ESP, izin komunitas, auditor) “dijual” di sandbox testnet tanpa uang sungguhan; hasilnya dibagi ke pengelola dan komunitas. Ini web app responsif (mulai 360 px), bukan app native, tanpa wallet. Peran pengguna: Tamu, Komunitas, Pengelola, Penerima (zona), Auditor.
Tiga kalimat pegangan: “Kami membangun bukti dulu, baru nilai.” “Kode memutuskan, AI menjelaskan, manusia menyetujui.” “Semua simulasi di testnet; belum ada dukungan resmi dari pihak mana pun.”
Sumber kebenaran: docs/blueprint.md dan docs/contract.md. Dari blueprint baca hanya bagian “Dapp ini apa?”, Model 8, “Bahasa di layar”, “Siapa melihat layar apa”, dan “Aturan ekonomi simulasi”; jangan membaca seluruh berkas. Gambar docs/referensi-beranda.jpg hanya acuan rasa dan tata letak; jangan menyalinnya persis. Beranda (L16) adalah layar pembuka ringkas bergaya kartu seperti gambar itu (sapaan, kartu angka kecil, satu grafik, daftar pendek), bukan panel admin dan bukan CRUD. Screener (L17) adalah daftar lahan dan Grafik lahan (L20) adalah halaman terminal grafik per lahan: meminjam pola screener dan terminal grafik hanya pada tata letak, bukan bursa. Brief lengkap ada di docs/brief-frontend.md; bagian “Rasa dan gerak” dan “Grafik lahan” menjadi acuan.
Stack (asumsi tim): React, Vite, TypeScript, React Router, TanStack Query, Recharts (gayanya ditimpa token) untuk grafik kecil dan menengah, lightweight-charts hanya untuk Grafik lahan L20 (baca dokumentasi versi yang terpasang di node_modules dan penuhi syarat atribusinya), paket motion hanya untuk sheet yang bisa diseret dan transisi tata letak (sisanya CSS), @phosphor-icons/react, Vitest dan Testing Library. Hasil build statis disajikan nginx di port 80; API lewat alamat relatif /api.
</konteks>

<aturan_keras>
1. Setiap layar yang menampilkan uang atau pasar (Beranda, Screener, Langsung, Rekap, Pasar, Zona, Tinjau) memuat pil “Simulasi, testnet”. Parameter tanpa sumber berlabel “placeholder”.
2. Jangan menulis kata bursa, exchange, DEX, token, atau dompet di teks layar. Jangan ada tombol atau tautan aksi beli, jual, atau tukar. Label status yang dipakai blueprint (“Belum bisa dijual”, “Siap dijual”, “Unit terjual”) tetap boleh. Jangan menyebut Danantara, OJK, BEI, atau komunitas mana pun sebagai pendukung atau pembeli. Zona hanya “Zona contoh A (KEK)” dan “Zona contoh B (kota hijau)”.
3. Status selalu warna + ikon + kata. Istilah teknis diganti kata awam persis seperti tabel “Bahasa di layar” di blueprint; semua teks itu tinggal di src/lib/copy.ts.
4. Teks minimal 16 px (satu pengecualian: angka sumbu grafik 14 px). Kontras teks minimal 4,5:1. Fokus keyboard selalu terlihat.
5. Warna status, status lahan, dan semua angka uang berasal dari API atau mock; jangan ditulis di kode. FE tidak menghitung ulang uang.
6. Peran dicek di server. FE hanya menyembunyikan menu; jangan menyaring data rahasia di sisi klien.
7. Tiap layar punya empat keadaan: memuat, kosong, berhasil, gagal. Pesan gagal menjelaskan apa yang terjadi dan apa yang bisa dilakukan, tanpa kode galat. Tidak ada jalan buntu: selalu ada Kembali, Bantuan, dan Keluar.
8. Satu layar, satu tujuan, satu tombol utama yang besar. Ini aplikasi pemeriksaan bukti, bukan panel admin: jangan membuat tabel kelola data, tombol Tambah, Ubah, atau Hapus, form CRUD, atau alur daftar-detail-edit. Aksi tulis hanya daftar, masuk, catat izin, buka keberatan, setujui, dan putar skenario api.
9. Data pribadi hanya nama, email, kata sandi, peran.
10. Mock berbentuk persis docs/contract.md, dengan satu saklar VITE_USE_MOCK.
11. Gerak hanya dari token di src/styles/motion.css dan komponen di src/components/motion; jangan menulis durasi, easing, atau skala di tempat lain. Hanya transform dan opacity yang dianimasikan. Setiap interaksi (hover, tekan, fokus) punya umpan balik dalam 100 ms. Semua gerak mati atau menjadi pudar 120 ms bila prefers-reduced-motion; tidak ada informasi yang hanya hadir lewat gerak.
12. Target sentuh minimal 44×44 px. Gaya hover hanya di dalam @media (hover: hover) and (pointer: fine). Area aman iPhone (env(safe-area-inset-*)) dihormati.
</aturan_keras>

<desain>
Tema terang saja. Tulis semua nilai ini sebagai variabel CSS di src/styles/tokens.css dan jangan menulis hex di tempat lain.
  canvas #EEF5EC, surface #FFFFFF, line #D8E5D4
  ink #14261A, ink-muted #4A5E4F
  leaf-300 #8FCB97 (isian grafik, bukan teks), forest-700 #2E6B3F (tombol utama), forest-800 #1F4D2E (kartu sorotan)
  seal-600 #1F5A94 (aksen: hanya untuk segel digital, verifikasi, fokus keyboard, seri Pengelola), seal-100 #E3EEF9
  status (teks / latar): ok #17692F / #E2F3E6; warn #7A5600 / #FFF0C7; hold #9A4400 / #FFE5D0; block #B3261E / #FDE3E1
  seri grafik: komunitas #1E7F3F, pengelola #1F5A94
  radius: kartu 16px, elemen dalam 10px, chip dan tombol 999px
Font (pasang lewat Fontsource, bukan CDN; pakai nama family persis seperti CSS yang dihasilkan Fontsource):
  UI dan paragraf: Atkinson Hyperlegible Next. Judul dan angka besar: Source Serif 4 bobot 600. Hash, nomor resi, id: Atkinson Hyperlegible Mono.
  Uji kolom angka; bila tidak tabular, pakai Mono untuk kolom angka.
  Jangan pakai Inter, Roboto, Arial, system-ui, Poppins, Montserrat, Space Grotesk, DM Sans, Plus Jakarta Sans, Outfit, Manrope, Fraunces, atau Playfair.
Skala: paragraf 16/24; label dan tombol 16/20 bobot 600; judul kartu 18/24 bobot 600; judul layar 28/36 serif (HP 24/32); angka KPI 36/40 serif (HP 28/32).
Bentuk: kartu bergaris 1 px line tanpa bayangan; bayangan halus hanya untuk drawer, sheet, menu melayang, dan kartu yang bisa diklik saat hover; jarak kelipatan 4 px, antar kartu 20 px. Ikon Phosphor regular 20 px.
Gerak: ikuti bagian “Rasa dan gerak” di docs/brief-frontend.md. Durasi: press 90, fast 160, base 240, slow 360 ms; grafik tergambar sekali 600 ms. Hanya transform dan opacity. Tekan mengecil ke 0,97; hover mengangkat 2 px hanya di perangkat berhover; drawer dan sheet memakai ease-ios 360 ms dan di HP bisa diseret; tab dan segmented memakai pil penanda yang bergeser; skeleton hanya tampil bila memuat lebih dari 200 ms; masuk berurutan maksimal 6 blok hanya saat muat awal halaman. Satu hal bergerak sekali waktu, maksimal satu elemen berdenyut per layar. Tidak ada angka menghitung naik dari nol saat muat awal.
Grafik: maksimal dua seri per panel, label langsung ditambah legenda, grid tipis, tooltip atau crosshair saat hover dan fokus, penelusuran dengan tekan lama di HP, angka sumbu 14 px, dan aria-label berisi angka utamanya. Warna grafik hanya dari token (unit tersedia #1E7F3F, unit beku #7A5600, batang terjual leaf-300), ditulis di tokens.css.
</desain>

<hindari>
- Gradien ungu atau biru-ungu, glassmorphism, blob dekoratif, ikon 3D koin atau kripto.
- Deretan tiga kartu berikon dengan judul dan satu kalimat; susunan serba tengah.
- Emoji, ikon kilau AI, sapaan generik seperti “Selamat datang kembali”.
- Label berhuruf kapital semua, dan label kecil di atas setiap judul.
- Lorem ipsum atau nama contoh. Pakai angka blueprint: 600 unit, Rp24.000.000, Rp14.112.000, Rp9.408.000; skenario api 500 unit terjual dan 100 unit beku.
- Komponen generik yang tidak dipakai layar mana pun. Kalau ragu suatu hiasan perlu, hapus.
- Candlestick harga, buku order, indikator teknikal (RSI, MACD, dan sejenisnya), alat gambar, daftar favorit, dan peringkat “paling naik” di Screener dan Grafik lahan.
- Parallax, konfeti, pantulan besar, animasi yang berputar atau berdenyut tanpa henti di lebih dari satu elemen, dan animasi yang menunda orang membaca.
- Tampilan konsol admin atau CRUD: tabel kelola data dengan kolom Aksi, tombol Tambah, Ubah, Hapus, form pengisian data, sidebar gelap berisi nama tabel. Beranda dan Screener adalah layar pantau bergaya kartu yang hanya membaca.
</hindari>

<cara_kerja>
0. Sebelum menulis kode: tulis ringkasan pemahamanmu (maksimal 12 baris) dan daftar konflik atau hal yang tidak jelas antara prompt, blueprint, dan kontrak. Jangan berhenti menunggu jawaban kecuali konflik itu membuat pekerjaan mustahil; pilih opsi yang mengikuti blueprint dan catat.
1. Kerjakan dalam langkah kecil. Satu tugas = satu PR, cabang r<nomor>-<singkat>.
2. Setelah selesai: jalankan build dan tes; ambil tangkapan layar di 360, 768, dan 1280 px (Playwright bila ada) dan periksa sendiri: tidak ada scroll horizontal, tidak ada teks terpotong, tidak ada teks di bawah 16 px.
3. Tutup dengan laporan: apa yang dibuat, apa yang belum, dan apa yang berbeda dari blueprint (satu baris siap tempel untuk docs/decisions.md).
</cara_kerja>

<cek_mandiri>
[ ] Semua rute di tabel rute terbuka sesuai peran; menu mengikuti matriks peran.
[ ] Pil “Simulasi, testnet” ada di semua layar uang.
[ ] Tidak ada kata terlarang di teks layar (bursa, exchange, DEX, token, dompet) dan tidak ada tombol atau tautan aksi beli, jual, atau tukar.
[ ] Tidak ada warna hex di luar tokens.css.
[ ] Status selalu warna + ikon + kata.
[ ] Empat keadaan tiap layar ada dan diuji.
[ ] 360 px tanpa scroll horizontal, fokus keyboard terlihat, reduced motion dihormati.
[ ] Tidak ada angka uang atau status yang ditulis di kode.
[ ] npm run cek:gerak lulus: tidak ada durasi, easing, transition, atau animation di luar motion.css dan components/motion.
[ ] Reduced motion mematikan semua transform; hover hanya di perangkat berhover; target sentuh minimal 44 px.
[ ] Tidak ada animasi pada width, height, top, atau left; tidak ada angka menghitung naik dari nol.
[ ] Screener dan Grafik lahan: tanpa candlestick harga, buku order, indikator teknikal, atau tombol transaksi; Tamu hanya melihat versi ringkas.
</cek_mandiri>
```

### Prompt 1: fondasi dan kerangka semua layar

```text
<tugas>
Siapkan fondasi web/ dan kerangka semua layar. Jika web/ sudah berisi kode, jangan menimpanya: baca dulu, pertahankan yang sudah jalan, sesuaikan strukturnya, dan laporkan bedanya. Belum ada isi layar kecuali Halaman depan; targetnya semua rute bisa dibuka dari menu sesuai peran dan memakai komponen dasar yang sama.

1. Proyek: React, Vite, TypeScript, React Router, TanStack Query, Recharts, @phosphor-icons/react, Vitest dan Testing Library. Susun folder persis begini:
   web/{Dockerfile, nginx.conf, index.html, .env.example, public/maskot/, mock/}
   web/src/app/{router.tsx, nav.ts, guards.tsx, AppShell.tsx, PublicLayout.tsx}
   web/src/pages/{depan, daftar, masuk, bantuan, panduan-juri, verifikasi, indikator, beranda, peta, izin, screener, grafik-lahan, langsung, rekap, pasar, zona, tinjau, akun, tidak-ditemukan}
   web/src/features/{auth, parcels, market, trades, reports, ledger} (api.ts dan hooks.ts)
   web/src/components/{ui, domain, charts, mascot}
   web/src/lib/{api, format, time, copy, roles, sse, hash}.ts
   web/src/styles/{tokens.css, base.css, fonts.ts}, web/src/types/contract.ts
   index.html memakai viewport-fit=cover. vite.config.ts meneruskan /api ke http://localhost:8000 (hapus awalan /api) untuk mode dev tanpa mock.
2. Gaya: tokens.css (nilai di aturan desain), fonts.ts (tiga font, self-host), base.css (dasar 16 px, touch-action: manipulation pada kontrol, tap highlight transparan, fokus 2 px seal-600 dengan offset 2 px, prefers-reduced-motion).
3. lib: api.ts (fetch ke /api dengan saklar VITE_USE_MOCK), format.ts (Intl id-ID: Rp24.000.000, 1.240 ton, 34,2%), time.ts (WIB, 24 jam), copy.ts (tabel Bahasa di layar dan label status), roles.ts, sse.ts (EventSource dengan cadangan polling 10 detik), hash.ts (sha256 di browser).
4. app: router.tsx berisi tabel rute di bawah; guards.tsx (RequireLogin, RequireRole; akses di luar peran menampilkan halaman “Belum bisa dibuka” berisi alasan dan tombol Kembali, bukan layar kosong); nav.ts memuat menu per peran; AppShell memuat sidebar berlabel di 1024 px ke atas, tab bawah di HP dengan lembar “Lainnya”, bilah atas (judul, cari, Bantuan, Kabar; kolom cari dan laci Kabar diisi di Prompt 3) dan pil “Simulasi, testnet” yang selalu terlihat.
5. components/ui: Button, Chip, Card, Tabs, Table (menjadi kartu di bawah 768 px), Drawer, Tooltip, EmptyState, ErrorState, Skeleton. components/domain: StatusBadge, SimulasiBadge, Money, Unit, SourceTag, RoleBadge, PeriodTabs, Receipt. Semuanya membaca token, tanpa hex di komponen.
6. mock/: JSON berbentuk persis kontrak (termasuk series.{A,B}.{24h,7d,30d,90d}.json untuk Grafik lahan; bentuknya ada di bagian Kontrak data docs/brief-frontend.md). Lahan A (hijau, izin granted, 600 unit), Lahan B (merah, tanpa izin, BLOCKED), dan skenario api (WARNING, 500 unit terjual, 100 unit beku) dengan angka settle dari blueprint; empat akun demo (komunitas, pengelola, penerima, auditor).
7. Setiap rute berisi halaman kerangka: judul layar dan empat keadaan, yang bisa dipicu lewat ?state=memuat, kosong, atau gagal saat mode mock.
8. Dockerfile bertahap (build dengan node, sajikan dengan nginx di port 80). nginx.conf: fallback ke index.html untuk rute React; teruskan /api/ ke http://api:8000/ (awalan /api dihapus) dengan proxy_buffering off, supaya alamat relatif /api jalan di docker compose lokal (di server publik, Caddy yang meneruskannya).
9. Halaman depan (L0) dibangun lengkap: judul; satu paragraf penjelasan yang disalin dari bagian “Dapp ini apa?” di blueprint; peta kecil tanpa interaksi (Lahan A hijau dan Lahan B merah, masing-masing dengan StatusBadge); tombol Lihat peta (utama), Masuk, Daftar; tautan Panduan juri; dan pita “Simulasi, testnet. Belum ada dukungan resmi dari pihak mana pun.” Tanpa deretan tiga kartu fitur dan tanpa angka besar bergradien.
</tugas>

<rute>
Publik: / (L0 Halaman depan), /daftar (L10), /masuk (L11), /bantuan (L12), /panduan-juri (L14), /verifikasi/:id (L7), /indikator (L9), /peta (L1), /peta/:parcelId (L2), /screener (L17, Tamu ringkas), /screener/:parcelId (L20 Grafik lahan, Tamu ringkas).
Setelah masuk: /beranda (L16), /langsung (L18), /rekap/:periode (L19; harian, mingguan, bulanan, tahunan), /pasar/:parcelId (L4), /akun (L13).
Peran tertentu: /zona/:zoneId (L5; Pengelola, Penerima, Auditor), /izin/:parcelId (L3; Komunitas), /tinjau (L6; Auditor).
Selain itu: halaman tidak ditemukan.
</rute>

<menu>
Pantau: Beranda (sudah masuk), Peta (semua), Screener (semua; Tamu ringkas), Langsung (sudah masuk).
Laporan: Pasar (sudah masuk), Rekap (sudah masuk), Zona (Pengelola, Penerima, Auditor).
Bukti: Tinjau (Auditor), Verifikasi (semua), Indikator (semua).
Bawah: Bantuan (semua), Akun (sudah masuk).
Tamu hanya melihat: Peta, Screener, Verifikasi, Indikator, Bantuan, Panduan juri.
</menu>

<selesai_jika>
- Build dan tes hijau; docker build berhasil.
- Masuk dengan tiap akun demo menampilkan menu yang sesuai matriks, dan rute di luar peran menampilkan penjelasan.
- 360 px tanpa scroll horizontal.
- Laporan akhir memuat hasil cek mandiri.
</selesai_jika>
```

### Prompt 2: sistem rasa dan gerak

```text
<tugas>
Bangun sistem rasa dan gerak (micro-interaction) sebelum layar apa pun diisi, supaya semua layar berikutnya memakainya. Baca bagian “Rasa dan gerak (micro-interaction)” di docs/brief-frontend.md (prinsip, katalog interaksi, larangan). Yang wajib ada:

1. src/styles/motion.css: token durasi (--dur-press 90ms, --dur-fast 160ms, --dur-base 240ms, --dur-slow 360ms, --dur-draw 600ms); easing (--ease-out cubic-bezier(0.22,1,0.36,1); --ease-ios cubic-bezier(0.32,0.72,0,1); --ease-inout cubic-bezier(0.4,0,0.2,1); --spring dari linear() dengan lonjakan sekitar 4%, daftar titiknya dibuat skrip kecil yang ikut di repo, dengan cadangan --ease-out lewat @supports); --press-scale 0.97 (kartu besar 0.985); --lift -2px; --stagger 40ms. Aturan global untuk prefers-reduced-motion: durasi menjadi 0 kecuali pudar 120 ms, tanpa transform. Semua gaya hover dibungkus @media (hover: hover) and (pointer: fine).
2. base.css: sempurnakan perilaku sentuh: target sentuh minimal 44×44 px, overscroll-behavior-y: contain pada area gulir aplikasi, padding env(safe-area-inset-*) pada tab bawah dan sheet, 100dvh bukan 100vh, kolom isian 16 px.
3. lib/motion.ts: useReducedMotion (matchMedia); pembaca token durasi dari CSS lewat getComputedStyle (jangan menyalin angkanya); useDelayedFlag(ms) agar skeleton hanya tampil bila memuat lebih dari 200 ms. lib/haptics.ts: pembungkus navigator.vibrate yang tidak melakukan apa-apa bila tidak didukung (Safari iOS tidak mendukungnya); dipakai hanya untuk sukses (10 ms) dan gagal (pola 20-10-20).
4. components/motion:
   - Pressable: tombol, tautan, dan kartu yang bisa diklik. Mengecil saat ditekan, lepas dengan --spring. Keadaan loading dengan lebar tetap (label berganti spinner di tempat), lalu centang tergambar 240 ms saat sukses.
   - Segmented: pil penanda yang bergeser antar pilihan (240 ms, --ease-ios), panah kiri kanan, roving tabindex; isi panel berganti dengan pudar dan geser 8 px. Dipakai Tabs, PeriodTabs, dan pilihan jenis grafik.
   - Sheet: di desktop drawer dari tepi kanan; di HP bottom sheet yang bisa diseret: efek karet di batas, kecepatan lempar menentukan tutup, dua titik henti (setengah dan penuh), scrim memudar. Fokus terkunci, Esc menutup, latar inert. Boleh memakai paket motion untuk gestur seretnya.
   - Reveal: masuk berurutan, naik 8 px dan pudar, maksimal 6 elemen dengan jeda --stagger, hanya saat muat awal halaman.
   - LiveNumber: digit yang berubah karena data baru menggulir 200 ms; tidak menghitung naik dari nol saat muat awal.
   - PulseDot (titik “Langsung”), Shake (galat form: geser kecil 240 ms, selalu disertai pesan teks), dan RouteTransition (pudar 160 ms dan geser 8 px; di HP maju ke kiri dan kembali ke kanan; pakai View Transitions bila didukung browser dan versi React Router yang terpasang, tanpa transisi bila tidak; pulihkan posisi gulir saat kembali).
5. Tingkatkan komponen dari Prompt 1: Button dan Chip (Pressable), Card (varian bisa diklik: naik 2 px dan bayangan halus saat hover, panah kecil bergeser), Table (hover berlatar leaf-300 transparan dan chevron masuk, tekan lebih pekat), Tabs dan PeriodTabs (Segmented), Drawer (Sheet), Tooltip (tunda 300 ms, pudar dan skala 0,96 ke 1 dalam 120 ms; di layar sentuh lewat tekan lama), Skeleton (kilau pelan 1,4 detik lewat useDelayedFlag; isi menggantikannya dengan pudar tanpa loncat tinggi).
6. AppShell: tab bawah dengan penanda aktif yang bergeser dan ikon aktif yang melompat kecil (1, 1,12, 1; 280 ms), tinggi 56 px ditambah area aman; sidebar dengan penanda aktif yang bergeser vertikal; bilah atas yang mendapat garis bawah dan blur tipis (latar surface 90%) setelah halaman digulir, satu-satunya blur di aplikasi; RouteTransition membungkus isi.
7. Halaman /galeri-gerak, hanya ada bila import.meta.env.DEV (tidak ikut build produksi): semua komponen di atas, saklar reduced motion, dan tombol perlambat 5 kali, supaya tim bisa merasakan dan menyetel di satu tempat.
8. Skrip npm run cek:gerak: gagal bila ada transition, animation, durasi, atau cubic-bezier yang ditulis di luar motion.css dan components/motion.
</tugas>

<selesai_jika>
- Galeri gerak berfungsi di 360 dan 1280 px; saklar reduced motion mematikan semua transform.
- cek:gerak lulus. Tes: Segmented bisa dipakai dengan papan ketik; Sheet mengunci fokus dan menutup dengan Esc; useReducedMotion mengubah perilaku komponen.
- Tidak ada animasi yang memakai width, height, top, atau left, dan tidak ada angka yang menghitung naik dari nol.
- Dibuka di HP asli (iPhone dan Android bila ada): tekan terasa seketika, seret sheet mengikuti jari, tidak ada loncatan tata letak. Tulis hasilnya di laporan; yang belum diuji di perangkat asli dinyatakan belum.
</selesai_jika>
```

### Prompt 3: Beranda

```text
<tugas>
Bangun layar Beranda (/beranda, L16) di web/src/pages/beranda. Ini layar pembuka ringkas bergaya kartu seperti gambar docs/referensi-beranda.jpg, bukan panel admin dan bukan CRUD: tidak ada tabel kelola data, tombol Tambah, Ubah, atau Hapus, dan tidak ada form; semua kartu hanya membaca dan membuka halaman asalnya saat diklik. Tidak ada endpoint khusus Beranda: pakai hook dari features/ yang juga dipakai layar lain (kunci cache sama), supaya angkanya identik dengan Screener, Pasar, dan Rekap. Ikuti penggantian di bawah dan jangan menyalin gambar persis; rasa yang dituju adalah layar pembuka aplikasi yang ramah dan tenang (sapaan, kartu angka besar, satu grafik area, daftar pendek), bukan konsol.

Bilah atas: AppShell dari Prompt 1 sudah menyediakan kolom cari, tombol Bantuan, dan tombol Kabar; isi dan sambungkan, jangan membuat bilah kedua. Kolom cari menerima nama lahan atau nomor segel. Bantuan tanpa titik merah. Kabar membuka laci berisi 10 kejadian terbaru dari reports/day.events; hanya di dalam aplikasi, bukan notifikasi HP. Di badan Beranda, judul layar berupa sapaan “Selamat siang, {nama}” (serif) dengan RoleBadge dan subjudul “Kondisi hutan dan pasar simulasi, {jam} WIB”.

Strip “Langkah berikutnya” (satu tombol besar) menurut peran:
  Komunitas: “Catat izin untuk Lahan {x}” bila izin belum ada, selain itu “Lihat bagian hasil saya”.
  Pengelola: “Lihat pasar Lahan A”; bila ada status Perlu perhatian, “Lihat alasan”.
  Penerima: “Buka laporan zona”.
  Auditor: “Tinjau {n} lahan”.

Baris 1, empat kartu KPI (angka memakai font serif):
  a. Unit terverifikasi: total ton dan 7 batang harian (MiniBars). Data screener.totals dan rows[].trend_7d. Klik ke /screener. Untuk Penerima: “Unit terpakai zona”.
  b. Status lahan: empat titik status dengan jumlah lahan (StatusBadge). Data screener.rows. Klik ke /peta.
  c. Bagian komunitas hari ini: Money dan selisih dari kemarin. Data reports/day totals dan prev_totals. Klik ke /rekap/harian.
  d. Dari data ke status: kartu sorotan bergradien hijau (forest-800 ke forest-700), detik dan Sparkline. Data /metrics. Klik ke /indikator.
Baris 2:
  e. Pendapatan simulasi (lebar 6 kolom): AreaChart dengan PeriodTabs Harian, Mingguan, Bulanan dari /reports/{periode}; dua chip melayang di atas grafik (Unit terjual, Pendapatan, masing-masing dengan selisih) dan chip Kondisi pasar. Klik grafik ke /rekap/:periode.
  f. Pembagian hasil (3 kolom): SplitRing dua segmen, Komunitas 60% dan Pengelola 40% (dari hasil setelah biaya), dengan rupiah pada label langsung; di bawahnya “Biaya sandbox 2%” dan “Parameter placeholder”. Data /market/{id} (hasil settle). Klik ke /pasar/:id.
  g. Kartu saya (3 kolom): komponen Mascot pose potret 72 px (slot dari Prompt 8; sementara placeholder), nama, RoleBadge, lahan atau zona tertaut, dan tiga angka sesuai peran. Komunitas: Lahan, Izin, Keberatan terbuka. Pengelola: Lahan, Terverifikasi, Perlu perhatian. Penerima: Zona, Unit terpakai, Transaksi. Auditor: Menunggu tinjau, Terkunci, Ditahan. Klik ke /akun.
Baris 3:
  h. Rantai segel (4 kolom): tiga entri buku catatan terbaru sebagai kartu kecil tersambung garis vertikal; tiap entri memuat HashSeal kecil, 8 karakter pertama hash dengan font Mono, dan status Terkunci (ada eas_uid) atau Menunggu; tombol “Periksa segel” ke /verifikasi/:id. Data: maksimal tiga baris screener.rows yang punya ledger_id, dan hash dari /verify/{id}. Bila jumlahnya kurang dari tiga, tampilkan yang ada. Jika kontrak belum punya daftar entri ledger berurutan, catat usulan GET /ledger?limit=3 untuk Revand di bagian konflik laporan; jangan mengarang entri.
  i. Transaksi simulasi terakhir (4 kolom): 4 baris dari /trades?limit=4 (“Lahan A ke Zona contoh A”, unit, Money, jam WIB, SimulasiBadge); tautan “Lihat semua” ke /langsung.
  j. Cek keaslian (4 kolom): kolom “Nomor segel” dan tombol “Periksa” ke /verifikasi/:id, HashSeal besar dari entri terakhir, dan satu kalimat “Ubah satu huruf, segelnya berubah total.”

HashSeal (components/domain): SVG yang menggambar cincin radial dari 32 byte hash SHA-256 (32 busur; panjang busur mengikuti nilai byte; warna seal-600 dengan tingkat kepekatan berbeda). Deterministik, tanpa acak. Ini hanya tampilan; keaslian tetap diputuskan oleh perbandingan hash. Jika waktu kurang, tampilkan hash saja.

Tata letak: 1280 px ke atas, 12 kolom (baris 1: 3+3+3+3; baris 2: 6+3+3; baris 3: 4+4+4). 768 sampai 1279 px: dua kolom. 360 sampai 767 px: satu kolom, dan kartu KPI menjadi 2×2.
Setiap kartu punya keadaan sendiri: kerangka saat memuat, pesan saat kosong, dan pesan dengan tombol “Coba lagi” saat gagal. Satu kartu gagal tidak boleh mengosongkan Beranda.
</tugas>

<gerak>
Pakai komponen dari Prompt 2; jangan menulis durasi atau easing sendiri.
- Muat awal: kartu masuk berurutan (Reveal, maksimal 6 blok, jeda 40 ms), hanya saat halaman pertama dimuat. Memuat ulang data, mengganti tab periode, atau gagal lalu coba lagi tidak memicu animasi masuk.
- Kartu yang bisa diklik memakai Pressable bervarian kartu (naik 2 px saat hover di perangkat berhover, mengecil 0,985 saat ditekan, panah kecil di pojok bergeser).
- PeriodTabs pada kartu Pendapatan simulasi memakai Segmented (pil bergeser); grafik tergambar sekali; pergantian tab mengubah bentuk grafik 400 ms.
- LiveNumber untuk Bagian komunitas hari ini dan Detik data ke status; baris baru di Transaksi simulasi terakhir masuk dari atas dan disorot 1,2 detik.
- HashSeal pertama kali tampil: 32 busur muncul berurutan (sekitar 320 ms), sekali.
- Laci Kabar memakai Sheet (di HP bisa diseret ke bawah untuk menutup).
- Di HP, empat kartu KPI boleh berupa carousel dengan scroll-snap bila itu lebih nyaman daripada 2×2; pilih satu dan catat.
</gerak>

<selesai_jika>
- Beranda tampil untuk empat akun demo dengan isi dan langkah berikutnya yang berbeda sesuai peran.
- Mematikan satu endpoint di mock hanya menggagalkan satu kartu.
- Setiap kartu bisa diklik ke rute asalnya. Tidak ada tabel kelola data, tombol Tambah, Ubah, atau Hapus, maupun form di Beranda; tampilannya terasa seperti gambar referensi, bukan panel admin.
- Pil Simulasi terlihat, tidak ada kata terlarang, dan 360, 768, serta 1280 px bebas scroll horizontal.
</selesai_jika>
```

### Prompt 4: Screener pasar

```text
<tugas>
Bangun Screener pasar (/screener, L17) di web/src/pages/screener. Tujuannya: dalam lima detik pengguna tahu unit apa yang siap dijual, berapa nilainya, dan apa yang tertahan, lalu bisa membuka grafik lahan. Ini layar pantau, bukan bursa: tidak ada tombol beli, jual, atau tukar; tidak ada candlestick, buku order, nama token, daftar favorit, atau peringkat “paling naik”. Teks di layar, kode, dan nama berkas memakai “Screener”, bukan “DEX”.

Data: GET /screener. Bila kontrak belum memuatnya, buat mock/screener.json dengan bentuk ini dan tulis di laporan bahwa docs/contract.md perlu diperbarui:
  as_of, reference_price_idr, price_is_placeholder, totals{units_available, units_frozen, sold_today_units, market_state}, rows[]{parcel_id, name, status, consent, units_available, units_frozen, value_idr, sold_24h_units, last_sensor_at, sensor_source, sealed, ledger_id, eas_uid, trend_7d[]}

Susunan:
1. Strip denyut pasar: Harga referensi (berlabel placeholder), Unit tersedia, Unit beku, Terjual hari ini, dan chip Kondisi pasar. Nilai market_state datang dari server; jangan dihitung di FE.
2. Perubahan terbaru: baris chip yang bisa digeser (scroll-snap di HP), satu chip per kejadian status (misalnya “Lahan A: Perlu perhatian, 14:12”) dari screener atau reports/day.events; klik menuju /screener/:id.
3. Filter cepat berupa chip: Siap dijual (VERIFIED), Perlu perhatian (WARNING dan DISPUTE), Menunggu auditor (belum sealed), Semua; filter zona; semua kolom bisa diurutkan. Pilihan filter disimpan di URL (?preset=, ?zona=, ?urut=).
4. Tabel dengan kolom: Lahan (nama dan zona); Status (StatusBadge); Unit tersedia; Unit beku; Nilai tersedia (Money); Terjual 24 jam; Izin komunitas; Sensor terakhir (jam WIB dan SourceTag ESP atau Simulasi); Segel (Terkunci bila eas_uid ada, menuju /verifikasi/{ledger_id}; selain itu Menunggu); Tren 7 hari (Sparkline). Angka rata kanan dan tabular. Header menempel saat digulir. Di 768–1279 px kolom Lahan menempel di kiri dan sisanya bisa digeser; di bawah 768 px tabel menjadi satu kartu per lahan.
5. Klik baris menuju /screener/:id (Grafik lahan, L20; dibangun di Prompt 5, sementara halaman kerangka dari Prompt 1). Tidak ada drawer. Angka Nilai tersedia menuju /pasar/:id.
6. Kartu pembanding statis di bawah tabel, berlabel “Referensi, bukan harga hutan”: IDXCarbon Januari 2026 sekitar Rp40.000 per ton (hitungan tim; proyeknya mayoritas energi dan limbah), dan kredit REDD+ yurisdiksi US$6–12 per ton (EDF, 2024).
7. Tamu: strip hanya memuat Harga referensi, Unit tersedia, dan Kondisi pasar; kolom Nilai tersedia dan Terjual 24 jam diganti “Masuk untuk melihat” dengan tombol Masuk.
Keadaan: memuat (kerangka tabel); kosong (“Belum ada lahan yang cocok dengan filter ini”, pose mengintip, dan tombol “Hapus filter”); gagal (pesan dan tombol “Coba lagi”).
Segarkan data tiap 15 detik tanpa mengosongkan tabel, tampilkan “diperbarui {n} detik lalu”, dan sorot sebentar (1,2 detik) sel yang nilainya berubah.
</tugas>

<gerak>
- Chip filter memakai Pressable dan menyala dengan pegas; pergantian filter tidak memicu animasi masuk ulang, baris yang hilang atau muncul cukup berubah dengan pudar 160 ms.
- Baris tabel: hover berlatar leaf-300 transparan dan chevron masuk di perangkat berhover; ditekan latar lebih pekat; di HP kartu lahan mengecil 0,985 saat ditekan.
- Sparkline tergambar sekali saat muat awal, tidak saat data diperbarui.
- Perubahan angka karena penyegaran memakai LiveNumber dan sorot 1,2 detik, lalu hilang.
- Chip Perubahan terbaru bisa digeser dengan inersia (scroll-snap) di HP.
</gerak>

<selesai_jika>
- Empat akun demo dan mode Tamu menampilkan versi yang benar; Komunitas hanya melihat lahannya.
- Tidak ada kata atau kontrol bursa (cek mandiri nomor 3).
- Setiap klik pada tabel sampai ke rute yang dituju.
- Tes: filter dan urutan tersimpan di URL; pemuatan ulang mengembalikan tampilan yang sama.
</selesai_jika>
```

### Prompt 5: Grafik lahan

```text
<tugas>
Bangun Grafik lahan (/screener/:parcelId, L20) di web/src/pages/grafik-lahan. Baca bagian “Grafik lahan (/screener/:parcelId, L20)” di docs/brief-frontend.md; bila ada docs/referensi-terminal.*, pakai hanya sebagai acuan tata letak dan rasa (referensi itu mungkin gelap; di sini tema terang). Ini terminal grafik untuk satu lahan, tetapi layar pantau yang hanya membaca, bukan bursa: tanpa candlestick harga, buku order, indikator teknikal (RSI, MACD, dan sejenisnya), alat gambar, tombol beli, jual, atau tukar, nama token, dan daftar pemegang. Tulis “Grafik lahan” di layar, bukan “DEX”.

Data:
- GET /screener/{parcel_id}/series?range=24h|7d|30d|90d. Bentuknya ada di bagian Kontrak data brief. Bila docs/contract.md belum memuatnya, buat mock/series.{A,B}.{24h,7d,30d,90d}.json sesuai bentuk itu (Lahan A: status VERIFIED lalu WARNING pada skenario api dengan 100 unit beku; Lahan B: BLOCKED tanpa penjualan; 30 dan 90 hari memuat riwayat seed dengan seed_until) dan catat di laporan bahwa kontrak perlu diperbarui.
- GET /parcels/{id} untuk panel status (pakai ulang komponen panel L2), GET /trades?parcel_id= untuk tab Transaksi, dan stream GET /market/stream lewat lib/sse.ts yang menambah titik ke ujung kanan grafik (mock/stream.ts mengirim titik tiruan).

Susunan (1280 px ke atas, 12 kolom: 8 + 4):
1. Bilah judul: Kembali ke Screener (filter dan posisi gulir tetap), nama lahan, StatusBadge, SimulasiBadge, chip Kondisi pasar, “sensor terakhir n detik lalu” dengan SourceTag. Di bawahnya angka besar serif: Unit tersedia, selisih dari awal rentang (panah, angka, dan kata), dan Nilai tersedia (Money) dengan keterangan “harga referensi, placeholder”.
2. Grafik utama (components/charts/TerminalChart): bilah alat (ChartToolbar) berisi rentang waktu, metrik (Unit, Terjual, Pendapatan, Suhu, Tanah), jenis grafik (Area, Garis, Batang) dan sakelar “Rata-rata 7 hari”, semuanya memakai Segmented dan ikut URL (?rentang=24j|7h|30h|90h&metrik=unit|terjual|pendapatan|suhu|tanah&jenis=area|garis|batang&ma=1). Metrik Unit berisi dua seri (tersedia hijau, beku kuning tua). Suhu dan Tanah menampilkan garis ambang putus-putus berlabel “Ambang” dari thresholds di API; tanpa ambang dari API, jangan menggambar garis.
3. Crosshair dan pembacaan (ChartReadout) di pojok kiri atas grafik: waktu WIB, nilai tiap seri, dan status pada saat itu. Desktop: crosshair mengikuti pointer dan menempel ke titik terdekat. HP: tekan lama sekitar 250 ms lalu geser untuk menelusuri, lepas untuk kembali ke titik terbaru; gulir vertikal biasa tidak memicu penelusuran. Papan ketik: panah kiri dan kanan memindahkan crosshair, Home dan End ke ujung. Pembacaan diumumkan lewat aria-live polite yang diperlambat.
4. Di bawah grafik utama, waktu disinkronkan dengan crosshair: panel Unit terjual (batang) dan Jalur status (StatusStrip): pita berwarna sepanjang waktu, tiap segmen berikon di awalnya dan berkata (“Terverifikasi”, “Perlu perhatian”, dst.).
5. Penanda kejadian dari events[] (status, consent, seal, sensor_alert, scenario) sebagai ikon kecil di grafik; ketuk membuka kartu kecil (popover di desktop, Sheet di HP) berisi teks dan tautan “Periksa segel” (/verifikasi/{ledger_id}) atau “Lihat di peta” (/peta/:id). Penanda yang terlalu rapat digabung dengan angka.
6. Data langsung: titik baru ditambahkan tanpa mengubah rentang yang sedang dilihat; titik terakhir berdenyut (PulseDot, satu-satunya yang berdenyut di layar) dengan teks “Langsung”; bila pengguna menggeser jauh, tampilkan chip “Kembali ke terbaru”.
7. Rentang 30 dan 90 hari memuat riwayat seed: beri garis tegak putus-putus “Riwayat simulasi” di seed_until, dan SimulasiBadge di judul grafik.
8. Tombol “Lihat sebagai tabel” menampilkan titik yang sama sebagai tabel. Grafik punya role="img" dan aria-label berisi angka utamanya.
9. Kolom kanan (4 kolom) dengan tiga tab (Segmented): Ringkasan (panel status L2, alasan, sensor terakhir, izin; SplitRing pembagian hasil lahan ini; tombol Buka peta dan Buka pasar), Transaksi (20 baris terakhir lahan ini, baris baru disorot 1,2 detik, “Lihat semua” ke /langsung), Bukti (entri rantai segel lahan ini dengan HashSeal, hash pendek, Terkunci atau Menunggu, dan tombol “Periksa segel”). Di bawah grafik: daftar Kejadian pada rentang ini.
10. HP (360 px): satu kolom berurutan: bilah judul, angka besar, grafik utama setinggi sekitar 260 px (bilah alat berupa baris chip yang bisa digeser), panel Unit terjual, Jalur status, lalu tiga tab sebagai konten biasa. Sheet hanya untuk kartu penanda.
11. Tamu: hanya metrik Unit dan Jalur status; metrik lain dan tab Transaksi bertuliskan “Masuk untuk melihat”. Komunitas hanya lahannya dan Penerima hanya zonanya (server yang membatasi); lahan lain menampilkan halaman “Belum bisa dibuka”.
Keadaan: memuat (kerangka grafik berukuran tetap, tanpa loncatan); kosong (“Belum ada data untuk rentang ini”, pose mengintip, tombol “Pilih 30 hari”); gagal (pesan dan “Coba lagi”). Satu panel gagal tidak mengosongkan halaman. Satu seri maksimal 500 titik. Semua angka uang dan ma7_available dihitung server; FE tidak menghitung ulang.

Pustaka: gunakan lightweight-charts untuk grafik utama. Baca dokumentasi versi yang terpasang di node_modules sebelum menulis kode, karena API berbeda antar versi besar. Warna, font, dan ukuran huruf (14 px untuk sumbu) dibaca dari variabel CSS lewat getComputedStyle; tidak ada hex di kode. Bila versi itu mendukung beberapa panel dalam satu grafik, pakai itu; bila tidak, pakai grafik terpisah dengan rentang waktu dan crosshair yang disinkronkan. Penuhi syarat atribusi pustaka dan catat di docs/decisions.md. Bila ada kendala (ukuran bundel, gaya, atribusi), pakai Recharts dengan crosshair khusus dan jelaskan di laporan.
</tugas>

<gerak>
- Grafik tergambar sekali saat pertama dimuat (600 ms); mengganti rentang, metrik, atau jenis mengubah bentuk 400 ms, bukan menggambar ulang dari nol dan bukan memicu animasi masuk ulang.
- Crosshair berpindah mengikuti pointer dengan requestAnimationFrame dan menempel ke titik; seri yang disorot menebal dan seri lain menjadi 40%.
- Segmented di bilah alat dan tab kanan: pil bergeser 240 ms. Chip “Kembali ke terbaru” masuk dengan pudar dan geser kecil.
- Titik baru dari data langsung masuk di ujung kanan dengan pudar; hanya satu elemen berdenyut.
- Kartu penanda: popover pudar dan skala 0,96 ke 1 dalam 160 ms di desktop; Sheet yang bisa diseret di HP.
- Saat reduced motion: grafik langsung tampil penuh, pil berpindah seketika, tanpa denyut; crosshair tetap berfungsi.
</gerak>

<selesai_jika>
- Dengan mock, empat akun demo dan mode Tamu menampilkan versi yang benar; Komunitas dan Penerima tidak bisa membuka lahan di luar haknya.
- Semua metrik, rentang, dan jenis grafik bekerja; pilihan tersimpan di URL dan pemuatan ulang mengembalikan tampilan yang sama.
- Penelusuran dengan tekan lama bekerja di HP asli tanpa mengganggu gulir halaman; crosshair bisa digerakkan dengan papan ketik; tampilan tabel tersedia.
- Tanpa candlestick harga, buku order, indikator teknikal, tombol transaksi, kata DEX atau token; pil Simulasi terlihat; 360, 768, dan 1280 px tanpa scroll horizontal.
- Laporan menyebut pustaka yang dipakai, versinya, dan status atribusinya.
</selesai_jika>
```

### Prompt 6: Transaksi langsung

```text
<tugas>
Bangun Transaksi langsung (/langsung, L18) di web/src/pages/langsung.

Data: muatan awal dari GET /trades?limit=50, lalu stream lewat lib/sse.ts ke GET /market/stream (peristiwa trade, status, sensor). Bila stream putus, polling GET /trades?since= tiap 10 detik. Di mode mock, mock/stream.ts mengirim satu transaksi tiruan tiap 4 sampai 8 detik dan sesekali satu perubahan status. Semua uang adalah simulasi.

Susunan:
- Kiri (dua pertiga): umpan transaksi. Kolom: Jam (WIB), Lahan ke Zona, Unit, Harga, Total, Tag (SimulasiBadge; tambah “Skenario” bila source = scenario), Segel. Baris baru masuk dari atas dan disorot 1,2 detik (hormati reduced motion). Tombol “Jeda umpan”: saat dijeda, baris baru dihitung di “N baru” dan masuk setelah dilanjutkan. Baris yang punya ledger_id menuju /verifikasi/:id. Simpan paling banyak 200 baris di memori.
- Kanan (sepertiga): panel Kondisi pasar. Chip kondisi (market_state), batang unit tersedia dan beku (dua warna, label langsung), pendapatan hari ini, tiga kejadian status terbaru (misalnya “Lahan A: Perlu perhatian, 100 unit beku, 14:12”, klik ke /peta/:id), dan “sensor terakhir diterima n detik lalu”.
- Bawah: AreaChart pendapatan kumulatif hari ini per jam.
- Penanda sambungan di pojok umpan, berupa teks: “Langsung”, “Menyambung ulang…”, atau “Terputus, menyegarkan tiap 10 detik”.
- Komunitas hanya menerima lahannya dan Penerima hanya zonanya. Itu dari server; FE tidak menyaring.
- Kosong: “Belum ada transaksi hari ini.” Untuk Pengelola tambahkan tautan “Putar skenario api di halaman Pasar”.
- Aksesibilitas: umpan memakai aria-live polite dan hanya mengumumkan ringkasan tiap 10 detik, bukan tiap baris.
</tugas>

<gerak>
- Baris baru masuk dari atas dengan tinggi yang membuka halus dan disorot 1,2 detik. Bila pengguna menggulir ke bawah atau pointer sedang di atas daftar, jangan mendorong baris yang sedang dilihat: tampilkan chip “N baru” yang saat diketuk menggulir halus ke atas.
- Tombol “Jeda umpan” memakai Pressable dan berganti label tanpa loncatan lebar.
- Penanda sambungan: titik “Langsung” berdenyut pelan (satu-satunya yang berdenyut di layar); saat “Menyambung ulang…” titik berhenti berdenyut dan teksnya berganti; semua informasi tetap ada sebagai kata.
- Panel Kondisi pasar: batang unit tersedia dan beku berubah panjang dengan transform (bukan width); chip kondisi berganti pudar 240 ms; kejadian status baru masuk dengan pudar.
</gerak>

<selesai_jika>
- Di mode mock, baris baru muncul, bisa dijeda dan dilanjutkan, dan penanda sambungan berubah saat stream dimatikan.
- Tes: umpan tidak pernah lebih dari 200 baris; pesan stream rusak tidak membuat layar gagal.
- Tidak ada kata atau kontrol bursa; pil Simulasi terlihat.
</selesai_jika>
```

### Prompt 7: Rekap harian, mingguan, bulanan, tahunan

```text
<tugas>
Bangun Rekap (/rekap/:periode, L19) di web/src/pages/rekap. Ini rekap yang dibaca di layar, bukan laporan PDF: tidak ada tombol unduh.

Data: GET /reports/{periode}?tanggal=. Periode di API adalah day, week, month, year; di rute harian, mingguan, bulanan, tahunan (petakan di lib). Bentuk: periode, from, to, totals{trades, units_sold, gross, fee, community, manager, units_frozen}, prev_totals, buckets[]{label, ts, units, gross}, by_parcel[], by_zone[], events[]{ts, type, parcel_id, text}.

Susunan:
1. PeriodTabs Harian, Mingguan, Bulanan, Tahunan; panah Sebelumnya dan Berikutnya (Berikutnya nonaktif setelah periode ini); tombol “Hari ini”, “Minggu ini”, “Bulan ini”, atau “Tahun ini”; tanggal ada di URL (?tanggal=YYYY-MM-DD); minggu mulai Senin; WIB. Judul periode ditulis lengkap: “Kamis, 12 November 2026”, “9–15 November 2026”, “November 2026”, “2026”.
2. Enam angka dengan selisih terhadap prev_totals (panah dan persen, tidak hanya warna): Transaksi, Unit terjual, Pendapatan, Bagian komunitas, Bagian pengelola, Unit beku. Bila tidak ada pembanding, tulis “tidak ada pembanding”.
3. Grafik batang dari buckets: per jam (harian), per hari (mingguan dan bulanan), per bulan (tahunan). Satu seri (pendapatan); tooltip memuat unit dan rupiah.
4. Kejadian penting: daftar berjam dari events (perubahan status, izin dicabut, segel terkunci), tiap baris menuju /peta/:id atau /verifikasi/:id, dengan ikon dan kata per jenis kejadian.
5. Rincian: tabel kecil per lahan dan per zona (Unit, Pendapatan, Bagian komunitas).
6. Daftar lipat “Semua transaksi periode ini”: 50 baris dari /trades?from=&to=, dengan tombol “Muat lagi”.
Keadaan: memuat; kosong (“Belum ada transaksi pada periode ini.” dan tautan ke periode terakhir yang berisi); gagal.
Semua angka ringkasan berasal dari server; FE tidak menjumlah ulang transaksi. Rekap bulanan dan tahunan memakai riwayat simulasi dari skrip seed, jadi tampilkan tag Simulasi pada ringkasan.
</tugas>

<gerak>
- PeriodTabs memakai Segmented. Mengganti periode atau menekan panah Sebelumnya dan Berikutnya mengubah bentuk grafik batang 400 ms (batang berubah tinggi dengan transform) dan angka ringkasan berganti lewat LiveNumber; tidak ada animasi masuk ulang.
- Panah dan tombol “Hari ini” memakai Pressable; panah Berikutnya yang nonaktif tidak bereaksi pada hover.
- Daftar lipat “Semua transaksi periode ini” membuka dengan transform dan pudar, tanpa menganimasikan tinggi; “Muat lagi” menambah baris dengan pudar.
- Keadaan kosong memakai pose mengintip; tidak ada gerak tambahan.
</gerak>

<selesai_jika>
- Empat tab bekerja, panah periode tidak melewati hari ini, dan tautan dengan ?tanggal= membuka periode yang sama.
- Periode tanpa data menampilkan keadaan kosong yang berguna, bukan grafik datar.
- Tes: pemetaan periode (harian ke day, dan seterusnya) dan penentuan awal minggu hari Senin.
</selesai_jika>
```

### Prompt 8: slot maskot orang utan

```text
<tugas>
Siapkan slot maskot orang utan. Jangan menggambar maskot final.

1. components/mascot/Mascot.tsx dengan props pose (potret, duduk-menunjuk, menunjuk-peta, mengangguk, mengintip, berayun, memegang-papan, mencari), size, dan alt (kosong berarti dekoratif). Komponen memuat /maskot/<pose>.svg di kotak berukuran tetap (aspect-ratio) supaya tata letak tidak bergeser. Bila berkas tidak ada atau gagal dimuat, tampilkan placeholder netral: lingkaran leaf-300 dengan siluet daun, tanpa teks.
2. Pasang di tempat ini saja: avatar Kartu saya di Beranda (potret, 72 px, lingkaran); Halaman depan (duduk-menunjuk, 160 sampai 240 px di layar 768 px ke atas, 96 px di HP); tur 3 langkah dan Bantuan (menunjuk-peta, 120 px, langkah 1 dan 3); Receipt (mengangguk, 96 px); keadaan kosong Rekap dan Screener (mengintip, 120 px); layar memuat satu halaman penuh (berayun, 64 px, satu gerakan, mati saat reduced motion); pesan status Belum bisa dijual dan Ditahan (memegang-papan, 96 px); 404 (mencari, 160 px).
3. Aturan: tidak di Pasar, Zona, Tinjau, tabel, atau grafik. Maskot tidak memegang koin, token, atau uang; tidak ada logo atau nama instansi; tidak ada ucapan yang terdengar seperti dukungan. Oranye maskot hanya di ilustrasi; antarmuka tetap hijau dan biru.
4. Buat satu SVG sederhana untuk pose potret saja (bentuk datar, dua atau tiga warna, garis tinta) agar slot terlihat hidup, dengan komentar di berkas bahwa itu pengganti sementara.
5. Tulis public/maskot/README.md berisi daftar pose, ukuran, dan brief untuk desainer: orangutan tenang dan ramah, bukan lucu berlebihan; vektor datar, latar transparan, bulu oranye kemerahan, wajah krem, garis tinta #14261A; proporsi sama di semua pose; karakter asli yang tidak meniru yang sudah ada.
</tugas>

<gerak>
- Mascot tidak bergerak kecuali dua kasus: pose berayun (satu ayunan pelan, berhenti bila reduced motion) dan pose mengangguk pada resi (satu anggukan 240 ms, muncul setelah centang tergambar). Placeholder tidak bergerak.
- Pergantian dari placeholder ke gambar asli memakai pudar 160 ms di kotak berukuran tetap, tanpa loncatan.
</gerak>

<selesai_jika>
- Menghapus semua berkas di public/maskot/ tidak menggeser tata letak halaman mana pun; yang berubah hanya gambarnya menjadi placeholder.
- Maskot tidak muncul di layar yang dilarang.
- Tes: Mascot menampilkan placeholder saat berkas tidak ada.
</selesai_jika>
```

### Prompt 9: audit dan poles rasa gerak

```text
<tugas>
Audit dan poles rasa gerak di semua layar. Jangan menambah fitur. Baca bagian “Rasa dan gerak (micro-interaction)” di docs/brief-frontend.md.

1. Telusuri tiap rute, tiap peran, di 360, 768, dan 1280 px. Untuk tiap layar tulis tabel: interaksi yang sudah ada, yang kurang (hover, tekan, fokus, memuat, galat, sukses), dan yang berlebihan (lebih dari satu hal bergerak, lebih dari 360 ms, denyut di lebih dari satu elemen, animasi masuk yang menunda membaca).
2. Perbaiki yang kurang dan hapus yang berlebihan, semuanya lewat token dan komponen motion; jangan menulis durasi atau easing baru.
3. Jalankan cek:gerak, tes, dan build. Di Screener, Langsung, dan Grafik lahan, rekam 10 detik di DevTools Performance dengan CPU melambat 4 kali; catat long task di atas 50 ms yang muncul saat gerak dan perbaiki penyebabnya.
4. Uji reduced motion (tidak ada transform tersisa, informasi tetap lengkap) dan papan ketik (Tab, panah, Esc) di Segmented, Sheet, Tooltip, dan grafik.
5. Tulis docs/rasa-gerak.md: nilai token terakhir, daftar interaksi per layar, hal yang sengaja tidak dilakukan, dan hal yang belum diuji di perangkat asli.
</tugas>

<selesai_jika>
- Setiap layar punya umpan balik untuk hover, tekan, fokus, memuat, galat, dan sukses; tidak ada layar dengan lebih dari satu elemen yang berdenyut.
- cek:gerak, tes, dan build hijau; tidak ada pelanggaran aturan keras 11 dan 12.
- docs/rasa-gerak.md ada dan jujur tentang yang belum diuji di HP asli.
</selesai_jika>
```

## Sumber dan catatan yang belum diverifikasi

Semua angka uang, peran, dan layar L0–L14 di brief ini berasal dari Blueprint v5 (8 Nov). Yang saya buka sendiri pada 12 Nov hanyalah blueprint, gambar referensi, dan tiga halaman Fontsource; dua sumber harga karbon tidak bisa saya buka ulang dari sesi ini.

| Sumber | Dipakai untuk | Status |
| --- | --- | --- |
| Excboncp Blueprint System Modeling v5 (berkas terlampir) | Peran, matriks peran, kode layar, Bahasa di layar, aturan `settle`, angka Rp, jadwal | Dibaca 12 Nov, kecuali Risiko, Skenario demo, Setelah demo, dan jadwal fase finalis |
| Gambar referensi Beranda (dari Anda) | Tata letak dan rasa tampilan | Dilihat 12 Nov |
| [Kabar Bursa: perdagangan karbon Januari 2026](https://www.kabarbursa.com/carbon-trading/perdagangan-karbon-indonesia-januari-2026-turun-nilai-transaksi-rp47-miliar) | IDXCarbon sekitar Rp40.000 per ton (hitungan tim) | Dibuka oleh blueprint pada 8 Nov; tidak saya buka ulang |
| [EDF: harga kredit JREDD+](https://www.edf.org/media/average-prices-jurisdictional-redd-credits-reach-15-2028) | US$6–12 per ton (2024) | Dibuka oleh blueprint pada 8 Nov; tidak saya buka ulang |
| [Fontsource: Atkinson Hyperlegible Next](https://fontsource.org/fonts/atkinson-hyperlegible-next/install) | Font antarmuka | Dibuka 12 Nov: halaman ada, bertanda Variable, 7 bobot |
| [Fontsource: Atkinson Hyperlegible Mono](https://fontsource.org/fonts/atkinson-hyperlegible-mono/install) | Font hash dan nomor resi | Dibuka 12 Nov: halaman ada, bertanda Variable, 7 bobot |
| [Fontsource: Source Serif 4](https://fontsource.org/fonts/source-serif-4/install) | Font judul dan angka besar | Dibuka 12 Nov: halaman ada, bertanda Variable, 8 bobot |

### Belum diverifikasi

- Nama paket npm dan nama family CSS ketiga font tidak tampil pada hasil bacaan halaman Fontsource. Ambil dari tab Developer setup, jangan menebak.
- Dukungan angka tabular pada Atkinson Next dan angka lining pada Source Serif 4 belum diuji. Uji di kolom angka Screener dan Rekap.
- Kontras teks pada semua pasangan warna saya hitung ulang pada 12 Nov dan cocok. Jarak warna untuk buta warna (ΔE 18,8) pada dua warna grafik berasal dari sesi sebelumnya dan belum dijalankan ulang.
- Rp40.000 per ton adalah rata-rata unit IDXCarbon yang mayoritas energi dan limbah, bukan harga karbon hutan; layar harus selalu menulisnya sebagai placeholder.
- Kesepuluh prompt belum dijalankan di Claude Sonnet 5.5. Jalankan Prompt 1 dulu dan koreksi bila hasilnya melenceng.
- Prioritas R30–R33, urutan Kondisi pasar, dan bentuk empat endpoint baru adalah usulan; belum ada yang menyetujui di standup.
- Daftar entri ledger untuk kartu Rantai segel belum ada di kontrak. Untuk sementara kartu memakai `ledger_id` dari `/screener`; usulan `GET /ledger?limit=3` menunggu Revand.
- Framework FE (React, Vite, TypeScript) adalah asumsi sampai Malik memastikan.
- Nama maskot dan gambar finalnya belum ada.
- `lightweight-charts`: lisensi, syarat atribusi, API versi yang akan terpasang, dan dukungan beberapa panel dalam satu grafik tidak saya buka dari sesi ini. Prompt 5 menyuruh agen membaca dokumentasi paket yang terpasang; cadangannya Recharts.
- Paket `motion` (impor `motion/react`), dukungan `linear()` untuk easing pegas, View Transitions, dan opsi `viewTransition` di React Router adalah pengetahuan saya, belum dicek pada versi yang akan dipakai. Cek caniuse dan dokumentasi sebelum mengandalkannya; cadangannya ada di Prompt 2.
- Safari iOS tidak mendukung `navigator.vibrate` (dari ingatan, belum dicek ulang); karena itu getar hanya pelengkap di Android.
- Target sentuh 44 px mengikuti pedoman antarmuka Apple (dari ingatan, belum dibuka).
- Nilai token gerak dan kurva `--ease-ios` adalah usulan awal. Rasanya baru bisa dinilai di HP asli; tidak ada yang sudah diuji.
- Penelusuran grafik dengan tekan lama di HP belum diuji; di iOS tekan lama bisa memicu pilih teks atau menu bawaan, jadi grafik perlu `user-select: none` dan `touch-action` yang sesuai, dan hasilnya harus dicoba di perangkat.
- Warna grafik L20 memakai hex yang sudah ada di tabel warna; kontras 5,9:1 untuk `#7A5600` diambil dari tabel itu dan tidak saya hitung ulang pada 13 Nov. Batang `--leaf-300` hanya isian dan selalu berlabel.
- Bentuk `GET /screener/{parcel_id}/series`, batas 500 titik, dan batas data sensor untuk Tamu adalah usulan; belum ada yang menyetujui. Rentang 30 dan 90 hari bergantung pada skrip seed (keputusan 6).
- Pada 13 Nov saya hanya membaca dua berkas terlampir (brief 12 Nov dan bagian yang relevan dari blueprint v5); tidak ada sumber luar yang saya buka, dan tidak ada referensi DEX Screener atau TradingView yang saya lihat. Polanya diambil dari uraian Anda dan pengetahuan umum.

### Perbaikan pada versi 12 Nov

Penomoran prompt di daftar ini mengikuti versi 12 Nov: Prompt 2 di sana sekarang Prompt 3 (Beranda), dan Prompt 3 sekarang Prompt 4 (Screener).

- Pembuka menyebut enam prompt padahal ada tujuh (Prompt 0 sampai 6).
- Larangan kata “jual” di cek mandiri bentrok dengan label status blueprint (“Belum bisa dijual”, “Unit terjual”). Sekarang yang dilarang adalah tombol atau tautan aksi beli, jual, tukar.
- `nginx.conf` di kontainer `web` belum meneruskan `/api`, jadi alamat relatif `/api` gagal pada `docker compose up` lokal. Prompt 1 sekarang memintanya, ditambah proksi di `vite.config.ts` dan catatan buffering untuk stream.
- Kolom Segel di Screener menautkan ke `/verifikasi/:ledgerId`, tetapi kontrak belum punya `ledger_id`. Sudah ditambahkan di `/screener` dan Prompt 3; Prompt 2 memakainya untuk Rantai segel.
- Prioritas R30–R33 sebelumnya ambigu; sekarang tertulis per halaman.
- Prompt 0 kini juga menyuruh membaca bagian “Dapp ini apa?” karena Prompt 1 menyalin paragrafnya; Prompt 2 tidak lagi membuat bilah atas kedua di samping AppShell.
- Pembagian 60 persen dan 40 persen kini tertulis dihitung dari hasil setelah biaya 2%, sesuai fungsi `settle`.
- Nama “Dasbor” diganti menjadi Beranda (L16, `/beranda`) karena AI membacanya sebagai panel admin CRUD. Prompt 0 dan Prompt 2 kini menyebut tegas bahwa ini layar kartu yang hanya membaca. Beranda L0 di blueprint disebut Halaman depan supaya tidak bentrok.

### Pemeriksaan pada versi 13 Nov

Yang saya periksa dengan skrip pada berkas ini: pagar kode seimbang, tag `<tugas>`, `<gerak>`, dan `<selesai_jika>` berpasangan, penomoran Prompt 0 sampai 9 berurutan, tidak ada sisa “tujuh prompt”, “18 halaman”, atau “Prompt 6” untuk maskot, dan semua rujukan nomor prompt sudah menunjuk ke prompt yang benar. Yang tidak saya periksa: apakah prompt menghasilkan keluaran yang baik (belum dijalankan), dan apakah tabel warna dan kontras masih cocok (tidak dihitung ulang).

Perubahan yang membuat versi ini beda dari permintaan awal bila dibaca harfiah: Screener tidak dibuat sebagai “DEX” bergaya bursa dengan candlestick harga, tetapi sebagai terminal grafik berisi data proyek (alasannya di keputusan 10). Bila tim tetap ingin candle, satu-satunya yang masuk akal di sini adalah candle unit tersedia per interval, dan itu perlu keputusan tertulis karena bisa terbaca sebagai harga.
