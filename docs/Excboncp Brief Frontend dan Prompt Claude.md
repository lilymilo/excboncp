# Excboncp: Brief Frontend dan Prompt Claude

Nov 12, 2026 · @mauones

Dokumen ini memberi tim FE tiga hal: daftar halaman beserta folder tempatnya, arah tampilan dasbor (hijau muda, putih, satu warna tambahan) berikut gambar referensinya, dan tujuh prompt (satu aturan tetap dan enam tugas) yang siap ditempel ke Claude Sonnet 5.5.

## Keputusan yang perlu disetujui tim

Delapan hal di bawah belum diputuskan blueprint atau bertabrakan dengannya; kalau tidak disepakati, FE akan menebak. Hari ini Kamis 12 Nov (Hari 4) dan freeze jatuh besok (Hari 5), jadi urutan kerja ada di baris 3.

| # | Hal | Kenapa jadi masalah | Usulan | Pemegang |
| --- | --- | --- | --- | --- |
| 1 | Nama halaman “DEX” | Blueprint melarang menyebut ini bursa karbon dan tidak ada token yang dijual; DEX berarti bursa terdesentralisasi | Tampilan mengikuti screener, tetapi di layar bernama “Screener pasar” dan berlabel simulasi. Tanpa tombol beli, jual, atau tukar | Malik, Revand |
| 2 | Layar awal setelah masuk | Diagram 8A dan 8B menetapkan L1 Peta sebagai layar awal | Tambah L16 Dasbor sebagai layar awal; Peta tetap di menu. Ubah HOME di 8A dan catat di `docs/decisions.md` | Malik |
| 3 | Empat halaman baru = kebutuhan baru | Aturan blueprint: fitur baru berarti satu R baru dan model diperbarui; freeze Hari 5 | R30 Dasbor dan R31 Screener (Should); R32 Transaksi langsung dan R33 Rekap (Could). Bangun dari mock dulu; kalau telat, potong Rekap, lalu Transaksi langsung, sebelum R18. R1–R14 dan R20–R24 tidak boleh terganggu | Semua, di standup |
| 4 | Siapa boleh melihat angka uang | Matriks peran: Tamu tidak melihat L4 dan pembagian uang | Tamu hanya melihat Screener ringkas (tanpa pendapatan dan pembagian). Transaksi langsung dan Rekap hanya setelah masuk. Komunitas hanya lahannya, Penerima hanya zonanya, dicek di server | Davin, Bagus |
| 5 | Endpoint baru | Setiap endpoint harus punya pemilik dan masuk `docs/contract.md` | Empat endpoint di bagian Kontrak data; Bagus menulis, Davin menyuplai status, Revand mencatat di kontrak | Revand |
| 6 | Riwayat untuk Rekap bulanan dan tahunan | Data demo hanya beberapa hari, jadi rekap tahunan akan kosong | Skrip seed membuat riwayat transaksi simulasi beberapa bulan, berlabel simulasi | Bagus |
| 7 | Ukuran huruf | Prinsip 8: minimal 16 px, sedangkan dasbor padat | Semua teks 16 px; satu pengecualian: angka pada sumbu grafik 14 px | Malik |
| 8 | Framework FE | Blueprint hanya menyebut `web` yang dibangun dan disajikan di port 80 | Asumsi: React, Vite, TypeScript, hasil build statis. Kalau Malik memakai yang lain, ubah satu baris di Prompt 0 | Malik |

## Peta halaman

Ada 18 halaman: 14 dari blueprint (L0–L14, tanpa L8 yang hanya tombol) dan 4 baru (L16–L19), ditambah satu halaman 404. L15 juga hanya tombol, di dalam L4.

| Kode | Rute | Layar | Boleh dibuka | Data |
| --- | --- | --- | --- | --- |
| L0 | `/` | Beranda (landing) | Semua | `GET /parcels` untuk peta kecil |
| L10 | `/daftar` | Daftar | Tamu | `POST /auth/register` |
| L11 | `/masuk` | Masuk | Tamu | `POST /auth/login` |
| L12 | `/bantuan` | Bantuan “Apa ini?” dan tur 3 langkah | Semua | statis |
| L14 | `/panduan-juri` | Panduan juri dan panitia | Semua | statis |
| L7 | `/verifikasi/:id` | Verifikasi publik | Semua | `GET /verify/{id}` |
| L9 | `/indikator` | Papan indikator | Semua | `GET /metrics` |
| L1 | `/peta` | Peta lahan | Semua | `GET /parcels` |
| L2 | `/peta/:parcelId` | Panel status lahan, memuat tombol keberatan (L8) | Semua (Tamu ringkas) | `GET /parcels/{id}` |
| L17 baru | `/screener` | Screener pasar | Semua (Tamu ringkas) | `GET /screener` |
| L16 baru | `/dasbor` | Dasbor | Setelah masuk | `GET /me`, `/screener`, `/reports/day`, `/trades`, `/metrics` |
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
| Pantau | Dasbor | – | ya | ya | ya | ya |
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

Navigasi utama berupa sidebar berlabel di layar 1024 px ke atas dan tab bawah di HP. Blueprint menyebut “menu atas”; ini penyesuaian kecil karena ikon tanpa kata membingungkan pengguna awam.

**Beranda (landing, L0)** terdiri dari: judul dan satu paragraf penjelasan yang sudah ditulis di blueprint; peta kecil tanpa interaksi (Lahan A hijau, Lahan B merah, masing-masing dengan chip status); tiga tombol (Lihat peta sebagai tombol utama, Masuk, Daftar); tautan ke Panduan juri; dan pita “Simulasi, testnet. Belum ada dukungan resmi dari pihak mana pun.” Tidak ada deretan tiga kartu fitur berikon, dan tidak ada angka besar bergradien. Beranda adalah satu-satunya tempat maskot tampil besar.

## Struktur folder web/

Satu layar punya satu folder di `pages/`, logika data ada di `features/`, dan komponen yang dipakai banyak layar ada di `components/`. Dengan begitu fitur baru tidak perlu menyentuh layar lain.

```text
web/
├── CLAUDE.md                 aturan tetap untuk Claude (Prompt 0)
├── Dockerfile                build statis, disajikan nginx di port 80
├── nginx.conf
├── index.html
├── vite.config.ts
├── package.json
├── .env.example              VITE_USE_MOCK, VITE_API_BASE=/api
├── public/
│   ├── favicon.svg
│   └── maskot/               SVG per pose (slot disiapkan, aset menyusul)
├── mock/                     JSON berbentuk persis docs/contract.md
│   ├── me.*.json             satu per peran (4 akun demo)
│   ├── parcels.json, parcel.A.json, parcel.B.json
│   ├── market.A.json, market.A.api.json
│   ├── screener.json, trades.json
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
    │   ├── beranda/  daftar/  masuk/  bantuan/  panduan-juri/
    │   ├── verifikasi/  indikator/  tidak-ditemukan/
    │   ├── dasbor/  peta/  izin/  screener/  langsung/  rekap/
    │   └── pasar/  zona/  tinjau/  akun/
    ├── features/             api.ts dan hooks.ts per domain
    │   └── auth/  parcels/  market/  trades/  reports/  ledger/
    ├── components/
    │   ├── ui/               Button, Chip, Card, Tabs, Table, Drawer, Tooltip,
    │   │                     EmptyState, ErrorState, Skeleton
    │   ├── domain/           StatusBadge, SimulasiBadge, Money, Unit, SourceTag,
    │   │                     RoleBadge, PeriodTabs, HashSeal, Receipt
    │   ├── charts/           Sparkline, MiniBars, AreaChart, SplitRing
    │   └── mascot/           Mascot.tsx
    ├── lib/                  api, format, time, copy, roles, sse, hash
    ├── styles/               tokens.css, base.css, fonts.ts
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
| Tes | Di samping filenya; tiap layar menguji empat keadaan: memuat, kosong, berhasil, gagal |

## Arah desain

Latar hijau muda, kartu putih, dan satu aksen biru yang hanya muncul pada hal yang berkaitan dengan bukti, jadi biru selalu berarti “ini bisa diperiksa”. Gambar referensi tim ada tepat di bawah paragraf ini; simpan sebagai `docs/referensi-dasbor.jpg`. Ia hanya acuan rasa dan tata letak, jangan disalin persis.

&#91;image: Gambar referensi dasbor: sapaan dan kolom cari di atas, rel ikon di kiri, empat kartu ringkasan, grafik Balance, pengukur 80 persen, kartu profil, tumpukan kartu kredit, daftar transfer, dan kartu keamanan\]

*Gambar referensi tim. Nama, angka, dan teks contoh di dalamnya tidak dipakai; bagian “Dasbor” menjelaskan tiap kartu diganti apa.*

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
- Garis 1 px `--line` dan hampir tanpa bayangan; bayangan halus hanya untuk drawer dan menu melayang.
- Jarak kelipatan 4 px; antar kartu 20 px; isi kartu 20 sampai 24 px.
- Ikon: Phosphor, bobot regular, 20 px, satu set saja.
- Gerak hanya tiga: baris transaksi baru (disorot 1,2 detik), drawer dan tab saat dibuka, dan grafik tergambar sekali saat pertama dimuat. Semua mati bila pengguna memilih *reduced motion*. Tidak ada angka yang menghitung naik dari nol dan tidak ada animasi masuk di tiap kartu.
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

## Dasbor: kartu contoh diganti apa

Dasbor (L16) adalah ringkasan: tiap kartu mengambil data dari halaman asalnya dan membuka halaman itu saat diklik. Satu tombol besar per peran (“Langkah berikutnya”) menjaga prinsip blueprint satu layar, satu tujuan, satu tombol utama.

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
- Tiap kartu punya keadaan memuat (kerangka kartu, bukan spinner satu halaman), kosong (misalnya “Belum ada transaksi hari ini”), dan gagal (pesan dan tombol “Coba lagi”). Satu kartu gagal tidak boleh mengosongkan dasbor.

## Tiga halaman baru

Screener, Transaksi langsung, dan Rekap memakai data yang sama dengan Dasbor, Peta, dan Pasar, jadi angka tidak bisa berbeda antar halaman. Semuanya berlabel “Simulasi, testnet”.

### Screener pasar (`/screener`, L17)

Tujuannya: dalam lima detik orang tahu unit apa yang siap dijual, berapa nilainya, dan apa yang sedang tertahan. Pola tampilannya meniru screener, tanpa fitur bursa.

- **Strip denyut pasar** di atas: Harga referensi (placeholder Rp40.000 per ton), Unit tersedia, Unit beku, Terjual hari ini, dan chip Kondisi pasar.
- **Filter cepat**: Siap dijual, Perlu perhatian, Menunggu auditor, Semua; filter zona; semua kolom bisa diurutkan.
- **Kolom tabel**: Lahan, Status, Unit tersedia, Unit beku, Nilai tersedia (Rp), Terjual 24 jam, Izin komunitas, Sensor terakhir (jam dan sumber ESP atau Simulasi), Segel (Terkunci atau Menunggu), Tren 7 hari.
- **Klik baris** membuka drawer berisi panel status lahan (L2) dengan tombol Buka peta dan Buka pasar.
- **Pembanding statis** di bawah tabel, berlabel referensi dan bukan harga hutan: IDXCarbon Januari 2026 sekitar Rp40.000 per ton (hitungan tim; proyeknya mayoritas energi dan limbah) dari [Kabar Bursa](https://www.kabarbursa.com/carbon-trading/perdagangan-karbon-indonesia-januari-2026-turun-nilai-transaksi-rp47-miliar), dan kredit REDD+ yurisdiksi US$6–12 per ton (2024) dari [EDF](https://www.edf.org/media/average-prices-jurisdictional-redd-credits-reach-15-2028).
- **HP**: tabel menjadi satu kartu per lahan.
- **Tamu** hanya melihat strip (harga referensi, unit tersedia, kondisi pasar) dan tabel tanpa kolom rupiah dan terjual; selnya bertuliskan “Masuk untuk melihat”.
- **Tidak ada**: tombol beli, jual, atau tukar; grafik candlestick; buku order; nama token; peringkat “paling naik”.

Kondisi pasar dihitung di server dengan kode, bukan AI. Urutan ini usulan; Davin memastikannya cocok dengan Model 5.

| Urut | Jika | Chip |
| --- | --- | --- |
| 1 | Tidak ada unit VERIFIED | Tidak ada unit dijual |
| 2 | Ada lahan DISPUTE | Sebagian ditahan |
| 3 | Ada lahan WARNING | Ada unit beku |
| 4 | Selain itu | Normal |

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

Empat endpoint baru cukup untuk Dasbor dan tiga halaman baru; sisanya memakai endpoint yang sudah ada di blueprint (`/parcels`, `/parcels/{id}`, `/market/{id}`, `/metrics`, `/verify/{id}`, `/me`). Bentuk di bawah adalah usulan; Revand memasukkannya ke `docs/contract.md` dan menyamakan nama kolom dengan tabel `trade`.

| Endpoint | Dipakai | Isi minimal | Pemilik |
| --- | --- | --- | --- |
| `GET /screener` | L17, L16 | `as_of`, `reference_price_idr`, `price_is_placeholder` (selalu true), `totals` (`units_available`, `units_frozen`, `sold_today_units`, `market_state`), `rows[]` (`parcel_id`, `name`, `status`, `consent`, `units_available`, `units_frozen`, `value_idr`, `sold_24h_units`, `last_sensor_at`, `sensor_source`, `sealed`, `ledger_id`, `eas_uid`, `trend_7d[]`) | Bagus; Davin menyuplai status |
| `GET /trades` dengan `since`, `from`, `to`, `parcel_id`, `zone_id`, `limit` | L18, L19, L16 | `[{trade_id, ts, parcel_id, zone_id, units, price_idr, gross, fee, community, manager, source, ledger_id}]`; `source` berisi `simulator`, `scenario`, atau `seed` | Bagus |
| `GET /market/stream` (SSE) | L18, L16 | Peristiwa `trade`, `status`, dan `sensor`; isi `trade` sama dengan satu elemen `/trades` | Bagus |
| `GET /reports/{periode}?tanggal=` | L19, L16 | `periode` (`day`, `week`, `month`, `year`), `from`, `to`, `totals` (`trades`, `units_sold`, `gross`, `fee`, `community`, `manager`, `units_frozen`), `prev_totals`, `buckets[]` (`label`, `ts`, `units`, `gross`), `by_parcel[]`, `by_zone[]`, `events[]` (`ts`, `type`, `parcel_id`, `text`) | Bagus; Davin menyuplai peristiwa status |

`rows[].ledger_id` saya tambahkan di sini karena kolom Segel di Screener menautkan ke `/verifikasi/:ledgerId`; isinya kosong bila lahan belum terkunci.

Aturan untuk semuanya: peran dibatasi di server (Komunitas hanya lahannya, Penerima hanya zonanya, Tamu hanya `/screener` versi ringkas tanpa kolom uang); angka uang berasal dari fungsi `settle` (R7) dan FE tidak menghitung ulang; `market_state` dihitung server.

### Supaya terasa satu sistem

1. **Satu sumber data.** Dasbor tidak punya endpoint sendiri. Ia memakai hook yang sama dengan halaman lain (kunci cache TanStack Query yang sama), jadi angka di Dasbor dan Screener tidak bisa berbeda.
2. **Setiap angka bisa diklik ke asalnya**, seperti pada tabel di bawah.
3. **Satu set komponen**: StatusBadge, Money, Unit, SimulasiBadge, SourceTag, dan HashSeal dipakai di semua halaman.
4. **Filter ikut URL** (`?zona=`, `?preset=`, `?tanggal=`), sehingga tautan bisa dibagikan dan tombol Kembali tetap bekerja.
5. **Satu pintu waktu dan format** (`lib/time.ts`, `lib/format.ts`): WIB dan format Indonesia di mana pun.
6. **Mock berbentuk kontrak** dengan satu saklar `VITE_USE_MOCK`, sehingga tidak ada yang menunggu API.

| Dari | Klik | Ke |
| --- | --- | --- |
| Screener, baris lahan | Baris | Drawer panel lahan, berisi tautan ke `/peta/:id` |
| Screener, kolom Nilai tersedia | Angka | `/pasar/:id` |
| Screener atau Langsung, segel Terkunci | Segel | `/verifikasi/:ledgerId` |
| Dasbor, chip Kondisi pasar | Chip | `/screener?preset=perhatian` |
| Dasbor, Pendapatan simulasi | Grafik | `/rekap/:periode` |
| Dasbor, Transaksi terakhir | “Lihat semua” | `/langsung` |
| Rekap, kejadian penting | Baris | `/peta/:id` atau `/verifikasi/:id` |
| Langsung, kejadian status | Baris | `/peta/:id` |
| Peta, panel lahan | “Lihat di pasar” | `/pasar/:id` |

## Maskot orang utan

Siapkan slot maskot sekarang dan isi gambarnya nanti: tata letak tidak bergeser saat aset datang, dan tidak ada halaman yang bergantung padanya.

| Tempat | Pose | Ukuran | Catatan |
| --- | --- | --- | --- |
| Kartu saya (Dasbor) | `potret` | 72 px, lingkaran | Menggantikan foto profil contoh |
| Beranda (L0) | `duduk-menunjuk`: duduk di dahan, menunjuk ke peta | 160–240 px | Satu-satunya tempat besar |
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

Slot teknis yang disiapkan di Prompt 6:

- Komponen `<Mascot pose="potret" size={72} />` memuat `/maskot/<pose>.svg` dari `public/maskot/`.
- Kalau berkasnya belum ada, tampil placeholder netral (lingkaran hijau muda dengan siluet daun) di kotak berukuran tetap, jadi tata letak sama sebelum dan sesudah aset datang.
- Gambar dekoratif memakai `alt=""`; hanya Beranda dan tur yang diberi teks alternatif singkat.

Claude bisa membuat SVG kasar sebagai pengganti sementara, tetapi untuk maskot final pakai desainer atau alat gambar lalu simpan SVG-nya di `public/maskot/`. Menjaga satu gaya yang konsisten di delapan pose adalah bagian yang paling sulit bagi model.

Brief untuk desainer atau alat gambar: orangutan yang tenang dan ramah, bukan lucu berlebihan; ilustrasi vektor datar, latar transparan, bulu oranye kemerahan, wajah krem, garis tinta hijau gelap; proporsi yang sama di kedelapan pose; tidak memegang uang; tidak meniru karakter yang sudah ada.

## Prompt untuk Claude Sonnet 5.5

Tujuh prompt: Prompt 0 berisi aturan tetap, lalu enam tugas yang dijalankan berurutan. Pemisahan ini disengaja: satu prompt raksasa membuat model menyusutkan detail, sedangkan aturan yang disimpan di `web/CLAUDE.md` terbaca ulang di setiap sesi.

1. Taruh blueprint di `docs/blueprint.md` dan gambar referensi (yang sama dengan di bagian Arah desain) di `docs/referensi-dasbor.jpg`.
2. Simpan Prompt 0 sebagai `web/CLAUDE.md`. Claude Code membacanya otomatis, jadi prompt 1 sampai 6 bisa pendek.
3. Jalankan Prompt 1 sampai 6 berurutan, satu sesi dan satu Pull Request per prompt (aturan kerja blueprint).
4. Sebelum menerima hasil, minta laporan “Cek mandiri” ditempel di PR, lalu buka halamannya di 360, 768, dan 1280 px.

Kenapa model akan mengerti: tiap prompt menyebut peran, konteks, aturan keras, larangan, dan kriteria selesai. Prompt 0 juga menyuruh Claude merangkum pemahamannya dan mendaftar konflik sebelum menulis kode, sehingga salah paham ketahuan di menit pertama. Prompt ini belum saya jalankan; coba Prompt 1 dulu dan koreksi bila hasilnya melenceng.

### Prompt 0: aturan tetap (simpan sebagai `web/CLAUDE.md`)

```text
<peran>
Kamu engineer frontend senior sekaligus desainer produk untuk Excboncp. Kamu bekerja di folder web/. Kamu membangun langsung, bukan menawarkan rencana, dan menulis kode yang bisa dijalankan tim kecil dalam waktu sempit.
</peran>

<konteks>
Excboncp = CbonCP + simulasi pasar. Hutan yang buktinya terverifikasi (satelit, sensor ESP, izin komunitas, auditor) “dijual” di sandbox testnet tanpa uang sungguhan; hasilnya dibagi ke pengelola dan komunitas. Ini web app responsif (mulai 360 px), bukan app native, tanpa wallet. Peran pengguna: Tamu, Komunitas, Pengelola, Penerima (zona), Auditor.
Tiga kalimat pegangan: “Kami membangun bukti dulu, baru nilai.” “Kode memutuskan, AI menjelaskan, manusia menyetujui.” “Semua simulasi di testnet; belum ada dukungan resmi dari pihak mana pun.”
Sumber kebenaran: docs/blueprint.md dan docs/contract.md. Dari blueprint baca hanya bagian “Dapp ini apa?”, Model 8, “Bahasa di layar”, “Siapa melihat layar apa”, dan “Aturan ekonomi simulasi”; jangan membaca seluruh berkas. Gambar docs/referensi-dasbor.jpg hanya acuan rasa dan tata letak; jangan menyalinnya persis.
Stack (asumsi tim): React, Vite, TypeScript, React Router, TanStack Query, Recharts (gayanya ditimpa token), @phosphor-icons/react, Vitest dan Testing Library. Hasil build statis disajikan nginx di port 80; API lewat alamat relatif /api.
</konteks>

<aturan_keras>
1. Setiap layar yang menampilkan uang atau pasar (Dasbor, Screener, Langsung, Rekap, Pasar, Zona, Tinjau) memuat pil “Simulasi, testnet”. Parameter tanpa sumber berlabel “placeholder”.
2. Jangan menulis kata bursa, exchange, DEX, token, atau dompet di teks layar. Jangan ada tombol atau tautan aksi beli, jual, atau tukar. Label status yang dipakai blueprint (“Belum bisa dijual”, “Siap dijual”, “Unit terjual”) tetap boleh. Jangan menyebut Danantara, OJK, BEI, atau komunitas mana pun sebagai pendukung atau pembeli. Zona hanya “Zona contoh A (KEK)” dan “Zona contoh B (kota hijau)”.
3. Status selalu warna + ikon + kata. Istilah teknis diganti kata awam persis seperti tabel “Bahasa di layar” di blueprint; semua teks itu tinggal di src/lib/copy.ts.
4. Teks minimal 16 px (satu pengecualian: angka sumbu grafik 14 px). Kontras teks minimal 4,5:1. Fokus keyboard selalu terlihat.
5. Warna status, status lahan, dan semua angka uang berasal dari API atau mock; jangan ditulis di kode. FE tidak menghitung ulang uang.
6. Peran dicek di server. FE hanya menyembunyikan menu; jangan menyaring data rahasia di sisi klien.
7. Tiap layar punya empat keadaan: memuat, kosong, berhasil, gagal. Pesan gagal menjelaskan apa yang terjadi dan apa yang bisa dilakukan, tanpa kode galat. Tidak ada jalan buntu: selalu ada Kembali, Bantuan, dan Keluar.
8. Satu layar, satu tujuan, satu tombol utama yang besar.
9. Data pribadi hanya nama, email, kata sandi, peran.
10. Mock berbentuk persis docs/contract.md, dengan satu saklar VITE_USE_MOCK.
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
Bentuk: kartu bergaris 1 px line tanpa bayangan; bayangan halus hanya untuk drawer dan menu melayang; jarak kelipatan 4 px, antar kartu 20 px. Ikon Phosphor regular 20 px.
Gerak hanya tiga: baris transaksi baru (sorot 1,2 detik), drawer dan tab saat dibuka, grafik tergambar sekali. Hormati prefers-reduced-motion. Tidak ada angka menghitung naik, tidak ada animasi masuk per kartu.
Grafik: maksimal dua seri, label langsung ditambah legenda, grid tipis, tooltip saat hover dan fokus, dan aria-label berisi angka utamanya.
</desain>

<hindari>
- Gradien ungu atau biru-ungu, glassmorphism, blob dekoratif, ikon 3D koin atau kripto.
- Deretan tiga kartu berikon dengan judul dan satu kalimat; susunan serba tengah.
- Emoji, ikon kilau AI, sapaan generik seperti “Selamat datang kembali”.
- Label berhuruf kapital semua, dan label kecil di atas setiap judul.
- Lorem ipsum atau nama contoh. Pakai angka blueprint: 600 unit, Rp24.000.000, Rp14.112.000, Rp9.408.000; skenario api 500 unit terjual dan 100 unit beku.
- Komponen generik yang tidak dipakai layar mana pun. Kalau ragu suatu hiasan perlu, hapus.
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
</cek_mandiri>
```

### Prompt 1: fondasi dan kerangka semua layar

```text
<tugas>
Siapkan fondasi web/ dan kerangka semua layar. Jika web/ sudah berisi kode, jangan menimpanya: baca dulu, pertahankan yang sudah jalan, sesuaikan strukturnya, dan laporkan bedanya. Belum ada isi layar kecuali Beranda; targetnya semua rute bisa dibuka dari menu sesuai peran dan memakai komponen dasar yang sama.

1. Proyek: React, Vite, TypeScript, React Router, TanStack Query, Recharts, @phosphor-icons/react, Vitest dan Testing Library. Susun folder persis begini:
   web/{Dockerfile, nginx.conf, index.html, .env.example, public/maskot/, mock/}
   web/src/app/{router.tsx, nav.ts, guards.tsx, AppShell.tsx, PublicLayout.tsx}
   web/src/pages/{beranda, daftar, masuk, bantuan, panduan-juri, verifikasi, indikator, dasbor, peta, izin, screener, langsung, rekap, pasar, zona, tinjau, akun, tidak-ditemukan}
   web/src/features/{auth, parcels, market, trades, reports, ledger} (api.ts dan hooks.ts)
   web/src/components/{ui, domain, charts, mascot}
   web/src/lib/{api, format, time, copy, roles, sse, hash}.ts
   web/src/styles/{tokens.css, base.css, fonts.ts}, web/src/types/contract.ts
   vite.config.ts meneruskan /api ke http://localhost:8000 (hapus awalan /api) untuk mode dev tanpa mock.
2. Gaya: tokens.css (nilai di aturan desain), fonts.ts (tiga font, self-host), base.css (dasar 16 px, fokus 2 px seal-600 dengan offset 2 px, prefers-reduced-motion).
3. lib: api.ts (fetch ke /api dengan saklar VITE_USE_MOCK), format.ts (Intl id-ID: Rp24.000.000, 1.240 ton, 34,2%), time.ts (WIB, 24 jam), copy.ts (tabel Bahasa di layar dan label status), roles.ts, sse.ts (EventSource dengan cadangan polling 10 detik), hash.ts (sha256 di browser).
4. app: router.tsx berisi tabel rute di bawah; guards.tsx (RequireLogin, RequireRole; akses di luar peran menampilkan halaman “Belum bisa dibuka” berisi alasan dan tombol Kembali, bukan layar kosong); nav.ts memuat menu per peran; AppShell memuat sidebar berlabel di 1024 px ke atas, tab bawah di HP dengan lembar “Lainnya”, bilah atas (judul, cari, Bantuan, Kabar; kolom cari dan laci Kabar diisi di Prompt 2) dan pil “Simulasi, testnet” yang selalu terlihat.
5. components/ui: Button, Chip, Card, Tabs, Table (menjadi kartu di bawah 768 px), Drawer, Tooltip, EmptyState, ErrorState, Skeleton. components/domain: StatusBadge, SimulasiBadge, Money, Unit, SourceTag, RoleBadge, PeriodTabs, Receipt. Semuanya membaca token, tanpa hex di komponen.
6. mock/: JSON berbentuk persis kontrak. Lahan A (hijau, izin granted, 600 unit), Lahan B (merah, tanpa izin, BLOCKED), dan skenario api (WARNING, 500 unit terjual, 100 unit beku) dengan angka settle dari blueprint; empat akun demo (komunitas, pengelola, penerima, auditor).
7. Setiap rute berisi halaman kerangka: judul layar dan empat keadaan, yang bisa dipicu lewat ?state=memuat, kosong, atau gagal saat mode mock.
8. Dockerfile bertahap (build dengan node, sajikan dengan nginx di port 80). nginx.conf: fallback ke index.html untuk rute React; teruskan /api/ ke http://api:8000/ (awalan /api dihapus) dengan proxy_buffering off, supaya alamat relatif /api jalan di docker compose lokal (di server publik, Caddy yang meneruskannya).
9. Beranda (L0) dibangun lengkap: judul; satu paragraf penjelasan yang disalin dari bagian “Dapp ini apa?” di blueprint; peta kecil tanpa interaksi (Lahan A hijau dan Lahan B merah, masing-masing dengan StatusBadge); tombol Lihat peta (utama), Masuk, Daftar; tautan Panduan juri; dan pita “Simulasi, testnet. Belum ada dukungan resmi dari pihak mana pun.” Tanpa deretan tiga kartu fitur dan tanpa angka besar bergradien.
</tugas>

<rute>
Publik: / (L0 Beranda), /daftar (L10), /masuk (L11), /bantuan (L12), /panduan-juri (L14), /verifikasi/:id (L7), /indikator (L9), /peta (L1), /peta/:parcelId (L2), /screener (L17, Tamu ringkas).
Setelah masuk: /dasbor (L16), /langsung (L18), /rekap/:periode (L19; harian, mingguan, bulanan, tahunan), /pasar/:parcelId (L4), /akun (L13).
Peran tertentu: /zona/:zoneId (L5; Pengelola, Penerima, Auditor), /izin/:parcelId (L3; Komunitas), /tinjau (L6; Auditor).
Selain itu: halaman tidak ditemukan.
</rute>

<menu>
Pantau: Dasbor (sudah masuk), Peta (semua), Screener (semua; Tamu ringkas), Langsung (sudah masuk).
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

### Prompt 2: Dasbor

```text
<tugas>
Bangun layar Dasbor (/dasbor, L16) di web/src/pages/dasbor. Tidak ada endpoint khusus Dasbor: pakai hook dari features/ yang juga dipakai layar lain (kunci cache sama), supaya angkanya identik dengan Screener, Pasar, dan Rekap. Gambar docs/referensi-dasbor.jpg adalah acuan tata letak; ikuti penggantian di bawah, jangan menyalinnya.

Bilah atas: AppShell dari Prompt 1 sudah menyediakan kolom cari, tombol Bantuan, dan tombol Kabar; isi dan sambungkan, jangan membuat bilah kedua. Kolom cari menerima nama lahan atau nomor segel. Bantuan tanpa titik merah. Kabar membuka laci berisi 10 kejadian terbaru dari reports/day.events; hanya di dalam aplikasi, bukan notifikasi HP. Di badan Dasbor, judul layar berupa sapaan “Selamat siang, {nama}” (serif) dengan RoleBadge dan subjudul “Kondisi hutan dan pasar simulasi, {jam} WIB”.

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
  g. Kartu saya (3 kolom): komponen Mascot pose potret 72 px (slot dari Prompt 6; sementara placeholder), nama, RoleBadge, lahan atau zona tertaut, dan tiga angka sesuai peran. Komunitas: Lahan, Izin, Keberatan terbuka. Pengelola: Lahan, Terverifikasi, Perlu perhatian. Penerima: Zona, Unit terpakai, Transaksi. Auditor: Menunggu tinjau, Terkunci, Ditahan. Klik ke /akun.
Baris 3:
  h. Rantai segel (4 kolom): tiga entri buku catatan terbaru sebagai kartu kecil tersambung garis vertikal; tiap entri memuat HashSeal kecil, 8 karakter pertama hash dengan font Mono, dan status Terkunci (ada eas_uid) atau Menunggu; tombol “Periksa segel” ke /verifikasi/:id. Data: maksimal tiga baris screener.rows yang punya ledger_id, dan hash dari /verify/{id}. Bila jumlahnya kurang dari tiga, tampilkan yang ada. Jika kontrak belum punya daftar entri ledger berurutan, catat usulan GET /ledger?limit=3 untuk Revand di bagian konflik laporan; jangan mengarang entri.
  i. Transaksi simulasi terakhir (4 kolom): 4 baris dari /trades?limit=4 (“Lahan A ke Zona contoh A”, unit, Money, jam WIB, SimulasiBadge); tautan “Lihat semua” ke /langsung.
  j. Cek keaslian (4 kolom): kolom “Nomor segel” dan tombol “Periksa” ke /verifikasi/:id, HashSeal besar dari entri terakhir, dan satu kalimat “Ubah satu huruf, segelnya berubah total.”

HashSeal (components/domain): SVG yang menggambar cincin radial dari 32 byte hash SHA-256 (32 busur; panjang busur mengikuti nilai byte; warna seal-600 dengan tingkat kepekatan berbeda). Deterministik, tanpa acak. Ini hanya tampilan; keaslian tetap diputuskan oleh perbandingan hash. Jika waktu kurang, tampilkan hash saja.

Tata letak: 1280 px ke atas, 12 kolom (baris 1: 3+3+3+3; baris 2: 6+3+3; baris 3: 4+4+4). 768 sampai 1279 px: dua kolom. 360 sampai 767 px: satu kolom, dan kartu KPI menjadi 2×2.
Setiap kartu punya keadaan sendiri: kerangka saat memuat, pesan saat kosong, dan pesan dengan tombol “Coba lagi” saat gagal. Satu kartu gagal tidak boleh mengosongkan dasbor.
</tugas>

<selesai_jika>
- Dasbor tampil untuk empat akun demo dengan isi dan langkah berikutnya yang berbeda sesuai peran.
- Mematikan satu endpoint di mock hanya menggagalkan satu kartu.
- Setiap kartu bisa diklik ke rute asalnya.
- Pil Simulasi terlihat, tidak ada kata terlarang, dan 360, 768, serta 1280 px bebas scroll horizontal.
</selesai_jika>
```

### Prompt 3: Screener pasar

```text
<tugas>
Bangun Screener pasar (/screener, L17) di web/src/pages/screener. Tujuannya: dalam lima detik pengguna tahu unit apa yang siap dijual, berapa nilainya, dan apa yang tertahan. Ini layar pantau, bukan bursa: tidak ada tombol beli, jual, atau tukar; tidak ada candlestick, buku order, nama token, atau peringkat “paling naik”.

Data: GET /screener. Bila kontrak belum memuatnya, buat mock/screener.json dengan bentuk ini dan tulis di laporan bahwa docs/contract.md perlu diperbarui:
  as_of, reference_price_idr, price_is_placeholder, totals{units_available, units_frozen, sold_today_units, market_state}, rows[]{parcel_id, name, status, consent, units_available, units_frozen, value_idr, sold_24h_units, last_sensor_at, sensor_source, sealed, ledger_id, eas_uid, trend_7d[]}

Susunan:
1. Strip denyut pasar: Harga referensi (berlabel placeholder), Unit tersedia, Unit beku, Terjual hari ini, dan chip Kondisi pasar. Nilai market_state datang dari server; jangan dihitung di FE.
2. Filter cepat berupa chip: Siap dijual (VERIFIED), Perlu perhatian (WARNING dan DISPUTE), Menunggu auditor (belum sealed), Semua; filter zona; semua kolom bisa diurutkan. Pilihan filter disimpan di URL (?preset=, ?zona=, ?urut=).
3. Tabel dengan kolom: Lahan; Status (StatusBadge); Unit tersedia; Unit beku; Nilai tersedia (Money); Terjual 24 jam; Izin komunitas; Sensor terakhir (jam WIB dan SourceTag ESP atau Simulasi); Segel (Terkunci bila eas_uid ada, menuju /verifikasi/{ledger_id}; selain itu Menunggu); Tren 7 hari (Sparkline). Angka rata kanan dan tabular. Di bawah 768 px tabel menjadi satu kartu per lahan.
4. Klik baris membuka Drawer berisi panel status lahan yang sama dengan L2 (pakai ulang komponennya), dengan tombol Buka peta (/peta/:id) dan Buka pasar (/pasar/:id). Angka Nilai tersedia menuju /pasar/:id.
5. Kartu pembanding statis di bawah tabel, berlabel “Referensi, bukan harga hutan”: IDXCarbon Januari 2026 sekitar Rp40.000 per ton (hitungan tim; proyeknya mayoritas energi dan limbah), dan kredit REDD+ yurisdiksi US$6–12 per ton (EDF, 2024).
6. Tamu: strip hanya memuat Harga referensi, Unit tersedia, dan Kondisi pasar; kolom Nilai tersedia dan Terjual 24 jam diganti “Masuk untuk melihat” dengan tombol Masuk.
Keadaan: memuat (kerangka tabel); kosong (“Belum ada lahan yang cocok dengan filter ini” dan tombol “Hapus filter”); gagal (pesan dan tombol “Coba lagi”).
Segarkan data tiap 15 detik tanpa mengosongkan tabel, dan tampilkan “diperbarui {n} detik lalu”.
</tugas>

<selesai_jika>
- Empat akun demo dan mode Tamu menampilkan versi yang benar; Komunitas hanya melihat lahannya.
- Tidak ada kata atau kontrol bursa (cek mandiri nomor 3).
- Setiap klik pada tabel sampai ke rute yang dituju.
- Tes: filter dan urutan tersimpan di URL; pemuatan ulang mengembalikan tampilan yang sama.
</selesai_jika>
```

### Prompt 4: Transaksi langsung

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

<selesai_jika>
- Di mode mock, baris baru muncul, bisa dijeda dan dilanjutkan, dan penanda sambungan berubah saat stream dimatikan.
- Tes: umpan tidak pernah lebih dari 200 baris; pesan stream rusak tidak membuat layar gagal.
- Tidak ada kata atau kontrol bursa; pil Simulasi terlihat.
</selesai_jika>
```

### Prompt 5: Rekap harian, mingguan, bulanan, tahunan

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

<selesai_jika>
- Empat tab bekerja, panah periode tidak melewati hari ini, dan tautan dengan ?tanggal= membuka periode yang sama.
- Periode tanpa data menampilkan keadaan kosong yang berguna, bukan grafik datar.
- Tes: pemetaan periode (harian ke day, dan seterusnya) dan penentuan awal minggu hari Senin.
</selesai_jika>
```

### Prompt 6: slot maskot orang utan

```text
<tugas>
Siapkan slot maskot orang utan. Jangan menggambar maskot final.

1. components/mascot/Mascot.tsx dengan props pose (potret, duduk-menunjuk, menunjuk-peta, mengangguk, mengintip, berayun, memegang-papan, mencari), size, dan alt (kosong berarti dekoratif). Komponen memuat /maskot/<pose>.svg di kotak berukuran tetap (aspect-ratio) supaya tata letak tidak bergeser. Bila berkas tidak ada atau gagal dimuat, tampilkan placeholder netral: lingkaran leaf-300 dengan siluet daun, tanpa teks.
2. Pasang di tempat ini saja: avatar Kartu saya di Dasbor (potret, 72 px, lingkaran); Beranda (duduk-menunjuk, 160 sampai 240 px di layar 768 px ke atas, 96 px di HP); tur 3 langkah dan Bantuan (menunjuk-peta, 120 px, langkah 1 dan 3); Receipt (mengangguk, 96 px); keadaan kosong Rekap dan Screener (mengintip, 120 px); layar memuat satu halaman penuh (berayun, 64 px, satu gerakan, mati saat reduced motion); pesan status Belum bisa dijual dan Ditahan (memegang-papan, 96 px); 404 (mencari, 160 px).
3. Aturan: tidak di Pasar, Zona, Tinjau, tabel, atau grafik. Maskot tidak memegang koin, token, atau uang; tidak ada logo atau nama instansi; tidak ada ucapan yang terdengar seperti dukungan. Oranye maskot hanya di ilustrasi; antarmuka tetap hijau dan biru.
4. Buat satu SVG sederhana untuk pose potret saja (bentuk datar, dua atau tiga warna, garis tinta) agar slot terlihat hidup, dengan komentar di berkas bahwa itu pengganti sementara.
5. Tulis public/maskot/README.md berisi daftar pose, ukuran, dan brief untuk desainer: orangutan tenang dan ramah, bukan lucu berlebihan; vektor datar, latar transparan, bulu oranye kemerahan, wajah krem, garis tinta #14261A; proporsi sama di semua pose; karakter asli yang tidak meniru yang sudah ada.
</tugas>

<selesai_jika>
- Menghapus semua berkas di public/maskot/ tidak menggeser tata letak halaman mana pun; yang berubah hanya gambarnya menjadi placeholder.
- Maskot tidak muncul di layar yang dilarang.
- Tes: Mascot menampilkan placeholder saat berkas tidak ada.
</selesai_jika>
```

## Sumber dan catatan yang belum diverifikasi

Semua angka uang, peran, dan layar L0–L14 di brief ini berasal dari Blueprint v5 (8 Nov). Yang saya buka sendiri pada 12 Nov hanyalah blueprint, gambar referensi, dan tiga halaman Fontsource; dua sumber harga karbon tidak bisa saya buka ulang dari sesi ini.

| Sumber | Dipakai untuk | Status |
| --- | --- | --- |
| Excboncp Blueprint System Modeling v5 (berkas terlampir) | Peran, matriks peran, kode layar, Bahasa di layar, aturan `settle`, angka Rp, jadwal | Dibaca 12 Nov, kecuali Risiko, Skenario demo, Setelah demo, dan jadwal fase finalis |
| Gambar referensi dasbor (dari Anda) | Tata letak dan rasa tampilan | Dilihat 12 Nov |
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
- Ketujuh prompt belum dijalankan di Claude Sonnet 5.5. Jalankan Prompt 1 dulu dan koreksi bila hasilnya melenceng.
- Prioritas R30–R33, urutan Kondisi pasar, dan bentuk empat endpoint baru adalah usulan; belum ada yang menyetujui di standup.
- Daftar entri ledger untuk kartu Rantai segel belum ada di kontrak. Untuk sementara kartu memakai `ledger_id` dari `/screener`; usulan `GET /ledger?limit=3` menunggu Revand.
- Framework FE (React, Vite, TypeScript) adalah asumsi sampai Malik memastikan.
- Nama maskot dan gambar finalnya belum ada.

### Yang saya perbaiki pada pemeriksaan akhir

- Pembuka menyebut enam prompt padahal ada tujuh (Prompt 0 sampai 6).
- Larangan kata “jual” di cek mandiri bentrok dengan label status blueprint (“Belum bisa dijual”, “Unit terjual”). Sekarang yang dilarang adalah tombol atau tautan aksi beli, jual, tukar.
- `nginx.conf` di kontainer `web` belum meneruskan `/api`, jadi alamat relatif `/api` gagal pada `docker compose up` lokal. Prompt 1 sekarang memintanya, ditambah proksi di `vite.config.ts` dan catatan buffering untuk stream.
- Kolom Segel di Screener menautkan ke `/verifikasi/:ledgerId`, tetapi kontrak belum punya `ledger_id`. Sudah ditambahkan di `/screener` dan Prompt 3; Prompt 2 memakainya untuk Rantai segel.
- Prioritas R30–R33 sebelumnya ambigu; sekarang tertulis per halaman.
- Prompt 0 kini juga menyuruh membaca bagian “Dapp ini apa?” karena Prompt 1 menyalin paragrafnya; Prompt 2 tidak lagi membuat bilah atas kedua di samping AppShell.
- Pembagian 60 persen dan 40 persen kini tertulis dihitung dari hasil setelah biaya 2%, sesuai fungsi `settle`.
