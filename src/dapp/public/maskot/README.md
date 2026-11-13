# Brief Maskot Orangutan EXBON CP

Dokumen ini menjadi panduan desainer untuk seluruh pose slot maskot di antarmuka EXBON CP.

## Arahan Karakter & Gaya Visual

- **Karakter:** Orangutan kalem, ramah, dan dapat dipercaya (hindari gaya terlalu karikatural atau hiperaktif).
- **Teknik:** Vektor datar (flat vector), latar belakang transparan, proporsi kepala dan tubuh konsisten di seluruh pose.
- **Palet Wajib:**
  - Bulu: oranye kemerahan alami (`#C85A28`, bayangan `#A84418`)
  - Wajah & telinga: krem hangat (`#F3D9BC`)
  - Garis tinta (stroke): `#14261A` (sinkron dengan `--ink` antarmuka)
  - Aksesori botani (bila ada): hijau daun (`#8FCB97` / `#2E6B3F`)
- **Larangan Keras:** Tidak memegang koin, token, dompet, uang, ataupun menampilkan logo/nama instansi. Tidak menggunakan gaya 3D generik atau ucapan bernada promosi investasi. Oranye hanya muncul pada ilustrasi maskot, sementara UI tetap memakai hijau hutan dan biru segel.

## Daftar Pose & Ukuran Slot

| Pose (`pose`) | Lokasi Pemakaian | Ukuran Slot (`aspect-ratio: 1/1`) |
| --- | --- | --- |
| `potret` | Avatar Kartu saya di Dasbor (`/app`) | `72px` lingkaran |
| `duduk-menunjuk` | Beranda | `160–240px` desktop, `96px` mobile |
| `menunjuk-peta` | Bantuan & tur 3 langkah | `120px` |
| `mengangguk` | Konfirmasi bukti / receipt | `96px` |
| `mengintip` | Keadaan kosong Screener / Rekap | `120px` |
| `berayun` | Layar memuat satu halaman penuh (mati saat reduced-motion) | `64px` |
| `memegang-papan` | Status Belum bisa dijual / Ditahan | `96px` |
| `mencari` | Halaman 404 tidak ditemukan | `160px` |

