# Panduan Demo EXBON CP

Panduan ini dipakai untuk merekam video demo juri dan untuk uji mandiri tanpa presentasi.
Durasi target 4 sampai 6 menit. Semua fitur di bawah memakai data demo yang sudah tersedia.

## Sebelum merekam

1. Nyalakan layanan:
   ```bash
   docker compose up -d
   cd src/dapp && npm run dev
   ```
2. Pastikan API dan halaman utama merespons:
   ```bash
   curl -s http://localhost:8000/health
   curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/app
   ```
3. Siapkan dua tab browser:
   - Tab 1: `http://localhost:3000/app`
   - Tab 2: `http://localhost:3000/peta`
4. Siapkan satu terminal untuk telemetri MQTT.
5. Rekam pada 1440x900 atau 1920x1080, zoom browser 100%, kursor terlihat.
   Hindari merekam notifikasi pribadi atau tab lain.

## Alur rekaman

### 0:00 sampai 0:35, Dashboard

Buka `/app`.

- Tunjukkan hero, KPI utama, dan peta ringkas.
- Sebutkan bahwa data yang tampil adalah simulasi MRV, bukan klaim serapan karbon dunia nyata.
- Klik kartu lahan atau tombol Cek Keaslian untuk menunjukkan jalur cepat ke detail.

Narasi singkat:
> Dashboard ini merangkum lahan, sensor, status verifikasi, dan nilai ekonomi dalam satu layar.
> Semua angka demo bisa ditelusuri ke peta dan rantai segel.

### 0:35 sampai 1:50, Peta dan wilayah

Buka `/peta`.

- Klik `Uji wilayah`.
- Pilih `IKN & Kaltim`. Peta akan fit ke empat lahan Kalimantan Timur.
- Ganti layer dari `Peta OSM` ke `Citra Satelit`.
- Klik poligon `PARCEL-G` atau tombol lahan di bawah peta. Panel kanan menampilkan detail.
- Buka lagi `Uji wilayah`, lalu tunjukkan mode kustom:
  - Isi latitude `-6.5995`, longitude `106.7985`, radius `2`, tekan `Terapkan`.
  - Peta menampilkan boundary lingkaran dan mode lahan demo disembunyikan.
  - Klik `Kembali ke Bogor` untuk kembali.
- Opsional, unggah `src/dapp/public/data/bogor-forest.geojson` lewat `Unggah GeoJSON`.
  File ini berisi Polygon dan dipakai untuk menguji boundary sendiri.

Narasi singkat:
> Juri bisa menguji peta di wilayah lain tanpa mengubah data. Preset menyiapkan Bogor, IKN,
> Sumatera, dan Jawa Tengah. Mode kustom menerima koordinat, radius, atau GeoJSON.

### 1:50 sampai 2:50, Verifikasi hash

Buka `/verifikasi/1253`.

- Tunjukkan panduan tiga langkah.
- Perhatikan dua nilai: `Hash tersimpan` dan `Hash hitung ulang SHA-256`. Keduanya harus sama.
- Tunjukkan label `Hash cocok · EAS simulasi` dan badge `Demo lokal`.
- Klik `Ubah satu nilai contoh`. Juri tidak perlu memahami JSON untuk mencoba perubahan.
- Opsional: di editor JSON, ubah satu huruf atau satu digit `co2e_t`.
- Hash hitung ulang langsung berubah dan status menjadi tidak cocok.
- Klik `Kembalikan ke data asli`.
- Buka `Daftar Blok Rantai Segel`, pindah halaman, lalu pilih blok lain.
- Jelaskan bahwa EAS masih simulasi. Jangan menyebut attestation sudah on-chain.

Narasi singkat:
> Verifikasi menghitung ulang SHA-256 di browser. Satu karakter yang berubah langsung
> memutus kecocokan. EAS adalah lapisan berikutnya, dan saat ini masih ditandai simulasi.

### 2:50 sampai 4:00, Telemetri tanpa ESP32

Jalankan di terminal:
```bash
.venv/bin/python scripts/publish-demo-telemetry.py --scenario normal --count 3 --interval 4
```

Lalu buka `/indikator`.

- Tunjukkan strip `Telemetri simulator`; skrip demo tidak mewakili perangkat fisik.
- Tunjukkan kartu sensor dan pagination.
- Ulangi dengan skenario peringatan:
  ```bash
  .venv/bin/python scripts/publish-demo-telemetry.py --scenario heat --count 1
  ```
- Jika ingin menunjukkan asap:
  ```bash
  .venv/bin/python scripts/publish-demo-telemetry.py --scenario smoke --count 1
  ```
  Kembalikan ke normal setelah rekaman agar data demo tidak terus waspada.

Cek cepat API:
```bash
  curl "http://localhost:8000/api/sensor/readings?device_id=SIM-ESP32-DEMO-01&limit=1"
```

Narasi singkat:
> Generator lokal menerbitkan payload uji bertanda tangan ke MQTT. Server memverifikasi
> signature dan dashboard menandainya sebagai simulator, bukan ESP fisik.

### 4:00 sampai 5:00, Screener dan penutup

Buka `/screener?lahan=PARCEL-G`.

- Tunjukkan 12 aset: hutan, industri, dan smart city.
- Coba pencarian, filter ekosistem, dan urutan.
- Pindah halaman daftar untuk menunjukkan pagination.
- Buka detail `PARCEL-G`, lalu kembali ke `/bantuan`.
- Tunjukkan bagian `Uji sendiri dalam 5 menit` sebagai penutup.

Narasi singkat:
> Pasar ini adalah layar simulasi. Tidak ada pembelian atau penjualan nyata. Fokusnya
> memperlihatkan bagaimana unit terverifikasi dipisahkan manfaatnya untuk komunitas dan operasi.

## Checklist sebelum upload

- [ ] Tidak ada dead link ke explorer EAS atau transaksi.
- [ ] Label `EAS simulasi` terlihat saat verifikasi.
- [ ] Peta satelit tampil dan poligon bisa diklik.
- [ ] Minimal satu wilayah preset dan satu mode kustom diperlihatkan.
- [ ] Telemetri berlabel simulator muncul di `/indikator`; jangan menyebutnya data ESP fisik.
- [ ] Pagination terlihat di daftar yang panjang.
- [ ] Tidak ada data pribadi, token, atau kunci di layar.
- [ ] Resolusi dan audio konsisten.

## Jika ada masalah

| Gejala | Cek |
| --- | --- |
| Peta kosong atau abu-abu | Koneksi tile OSM/ArcGIS, lalu tekan Segarkan di halaman Peta |
| Poligon tidak muncul | `curl -I http://localhost:3000/data/bogor-forest.geojson` harus 200 |
| Telemetri simulator tidak muncul | Worker MQTT hidup, broker `broker.emqx.io:1883`, dan periksa device `SIM-ESP32-DEMO-01` |
| Verifikasi gagal cocok | Pastikan memakai halaman `/verifikasi/1253`, bukan blok server 1 atau 2 |
| Halaman panjang | Gunakan pagination di daftar lahan, blok, atau sensor |

## Catatan kejujuran

- Data lahan, pasar, dan sebagian besar sensor adalah data demo.
- Generator telemetri MQTT adalah simulator. Hanya perangkat yang benar-benar terhubung yang boleh disebut ESP32 fisik.
- Attestation EAS belum on-chain selama `EVM_SIMULATION_MODE=true` dan kredensial EVM belum valid.
- Jangan menampilkan tautan explorer untuk UID atau transaksi simulasi.
- Jika EAS nyata diaktifkan, tautan explorer hanya muncul saat `NEXT_PUBLIC_EAS_LIVE=true`.

## Apa yang diuji juri

- Browser saja: peta, pilihan wilayah, contoh verifikasi, tombol perubahan salinan, dan reset.
- Dengan clone repo dan layanan lokal: jalankan generator MQTT di atas tanpa ESP32.
  Pakai broker, topic, dan `SENSOR_SECRET` yang sama dengan worker. Jika secret dikustomisasi,
  ekspor sebagai environment variable sebelum menjalankan generator; jangan bagikan nilainya.
- Editor JSON hanya alat uji integritas salinan. Perubahan data aplikasi harus melalui formulir
  dan API sesuai hak akses; catatan tersegel yang dikoreksi memerlukan catatan baru.
- Explorer yang sesuai adalah Base Sepolia: `https://sepolia.basescan.org`, bukan Ethereum
  Sepolia. Dalam mode simulasi tidak ada transaksi yang disiarkan, sehingga explorer kosong.
  Flag frontend saja tidak membuat transaksi: bukti live memerlukan transaksi berhasil,
  receipt, dan UID attestation yang dapat diperiksa di jaringan tersebut.
