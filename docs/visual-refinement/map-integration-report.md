# EXBON CP — Laporan Integrasi Peta Nyata (Leaflet + OpenStreetMap)

Dokumen ini merangkum implementasi peta kehutanan interaktif pada `/peta`, `/peta/[parcelId]`, dan `/map` menggunakan library `leaflet` dengan basemap OpenStreetMap terang serta lapisan batas poligon GeoJSON lokal.

---

## 1. Sumber Peta Dasar & Konfigurasi Basemap

- **Implementasi utama:** [CarbonMap.tsx](file:///c:/excboncp/src/dapp/src/components/dapp/CarbonMap.tsx#L23-L39)
- **Basemap default:** OpenStreetMap Standard terang (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`) dengan atribusi wajib `© OpenStreetMap contributors`. Pemilihan peta jalan terang menjaga keselarasan dengan palet *Soft Botanical Intelligence* (`#EEF5EC` / `#FFFFFF`) dan kontras poligon kehutanan.
- **Basemap sekunder (switcher):** Citra satelit Esri World Imagery (`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`) dengan atribusi `Citra © Esri, Maxar · Batas © OpenStreetMap contributors`.
- **Kontrol peta:**
  - Switcher lapisan peta (`Peta OSM` / `Citra Satelit`) di kiri atas.
  - Tombol `Sesuaikan batas` (*Fit bounds*) untuk menengahkan ulang seluruh poligon lahan dari GeoJSON secara otomatis.
  - Kontrol zoom Leaflet ditempatkan di sudut `bottomright`.

---

## 2. Lapisan Data Lahan & Sensor Lapangan

- **Poligon batas lahan:** Dimuat langsung dari [bogor-forest.geojson](file:///c:/excboncp/src/dapp/public/data/bogor-forest.geojson) untuk area proyek Bogor (`[-6.5884..-6.6086, 106.7792..106.8174]`).
- **Pemetaan gaya visual berdasarkan 4 status kanonik ([CarbonMap.tsx](file:///c:/excboncp/src/dapp/src/components/dapp/CarbonMap.tsx#L11-L19)):**
  - `VERIFIED`: garis tepi `#17692F`, isian `#8FCB97` (hijau terverifikasi).
  - `WARNING`: garis tepi `#7A5600`, isian `#F5C451` (perlu perhatian).
  - `DISPUTE`: garis tepi `#9A4400`, isian `#F49A5E`, garis putus-putus `dashArray: "6 4"` (keberatan warga).
  - `BLOCKED`: garis tepi `#B3261E`, isian `#ED8A84`, garis putus-putus `dashArray: "5 4"` (ditahan sistem).
- **Marker sensor custom:** Menggunakan `L.divIcon` berbasis elemen lingkaran bertepi tegas (`28×28px`) sehingga tidak bergantung pada file PNG marker bawaan Leaflet yang sering gagal dimuat saat bundling. Warna pin mencerminkan kondisi sensor (normal `#1F5A94`, anomali `#9A4400`, api terdeteksi `#B3261E`) disertai tooltip ringkas suhu, kelembapan udara, kelembapan tanah, dan laju `tCO2e/hari`.

---

## 3. Penanganan Layout, Z-Index & Mode Gagal (*Fallback*)

- **Kestabilan dimensi & resize:** `CarbonMap` menggunakan `ResizeObserver` pada kontainer peta ([CarbonMap.tsx](file:///c:/excboncp/src/dapp/src/components/dapp/CarbonMap.tsx#L223-L230)) yang memanggil `map.invalidateSize({ animate: false })` secara otomatis saat sidebar bergeser, laci detail lahan dibuka/ditutup, atau ukuran layar berpindah antara desktop dan mobile.
- **Batas stacking CSS (`z-index`):** Kontainer peta membungkus dirinya dalam `relative isolate z-[1]` agar lapisan kontrol Leaflet tidak pernah menutupi header aplikasi, dropdown pencarian global, maupun laci navigasi/inspeksi lahan (`z-50`). Styling popup/tooltip terang didefinisikan terisolasi di [dashboard-botanical.css](file:///c:/excboncp/src/dapp/src/components/dapp/dashboard-botanical.css).
- **Degradasi anggun jika data/tile bermasalah:**
  - Jika GeoJSON lahan gagal dimuat (`forceError` atau jaringan gagal), peta dasar OpenStreetMap tetap terpasang dan banner peringatan ditampilkan dengan pesan eksplisit: `"Peta dasar tersedia, tetapi data lahan belum dapat dimuat."` disertai tombol `Coba lagi` ([CarbonMap.tsx](file:///c:/excboncp/src/dapp/src/components/dapp/CarbonMap.tsx#L362-L383)).
  - Jika tile basemap mengalami kegagalan berulang (`errorCount >= 4`), indikator degradasi tile aktif tanpa merusak daftar lahan maupun panel detail di sisi kanan.

