import { StoryChapter } from "./types";

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 1,
    key: "earth",
    badge: "01 / 06 • PERSPEKTIF GLOBAL",
    title: "Bumi Kita, Paru-paru yang Rentan",
    subtitle:
      "Dari antariksa yang tenang, keseimbangan iklim dunia bergantung pada sabuk hijau zamrud khatulistiwa.",
    narrative:
      "Di tengah krisis iklim global, biosfer membutuhkan bukti integritas nyata, bukan estimasi di atas kertas. Hutan hujan tropis menyerap miliaran ton karbon dioksida setiap tahun, menjadi paru-paru utama penyangga kehidupan bumi.",
    image: "/landing-story/01-earth.jpg",
    cameraInfo: "Orbit Rendah Bumi • LEO 400 KM",
    telemetry: [
      { label: "Status Biosfer", value: "Penyerap Karbon Utama", status: "normal" },
      { label: "CO2e Atmosfer", value: "421.4 ppm", status: "warning" },
      { label: "Target Emisi", value: "Net Zero Verifiable", status: "verified" },
    ],
  },
  {
    id: 2,
    key: "clouds",
    badge: "02 / 06 • PENETRASI ATMOSFER",
    title: "Menembus Selimut Khatulistiwa",
    subtitle:
      "Meluncur melintasi formasi awan troposfer menuju sabuk kepulauan terbasah di dunia.",
    narrative:
      "Awan konvektif khatulistiwa mengalirkan siklus hidrologi raksasa. Menghubungkan uap samudra dengan kesejukan jutaan hektar hutan lindung yang menjaga kestabilan iklim mikro dan pola cuaca benua.",
    image: "/landing-story/02-clouds.jpg",
    cameraInfo: "Lapisan Troposfer • Alt 10.500 M",
    telemetry: [
      { label: "Curah Hujan Tropis", value: "3.200 mm / thn", status: "normal" },
      { label: "Kelembapan Udara", value: "84.2%", status: "verified" },
      { label: "Lapisan Udara", value: "Troposfer Lembap", status: "normal" },
    ],
  },
  {
    id: 3,
    key: "indonesia",
    badge: "03 / 06 • NUSANTARA",
    title: "Benteng Karbon Terbesar Dunia",
    subtitle:
      "Gugusan 17.000 pulau dengan 120+ juta hektar hutan hujan dan lahan gambut tropis.",
    narrative:
      "Indonesia memegang peranan krusial bagi masa depan iklim global. Di tanah ini, gambut tropis dan pepohonan purba menyimpan cadangan karbon terrestrial terdalam, menjadi benteng pertahanan ekologis tak ternilai.",
    image: "/landing-story/03-indonesia.jpg",
    cameraInfo: "Koordinat Nusantara • 0.7893° S, 113.9213° E",
    hotspots: [
      {
        id: "sumatra",
        x: "24%",
        y: "48%",
        title: "Sumatra — Lahan Gambut",
        subtitle: "Cadangan karbon bawah tanah terdalam yang memerlukan pemantauan ketat.",
        icon: "trees",
        color: "#64c975",
      },
      {
        id: "kalimantan",
        x: "47%",
        y: "42%",
        title: "Kalimantan — Hutan Hujan Primer",
        subtitle: "Habitat orangutan dan kanopi purba penyerap 2.1 Gt CO2e.",
        icon: "trees",
        color: "#AEDA2D",
      },
      {
        id: "papua",
        x: "82%",
        y: "56%",
        title: "Papua — Taman Nasional Lorentz",
        subtitle: "Bentang alam hutan tropis perawan terluas di Asia Pasifik.",
        icon: "trees",
        color: "#38bdf8",
      },
    ],
    telemetry: [
      { label: "Luas Tutupan Hutan", value: "120.3 Juta Ha", status: "verified" },
      { label: "Estimasi Stok Karbon", value: "~28.1 Gt CO2e", status: "verified" },
      { label: "Kawasan Konservasi", value: "Terpetakan Poligon", status: "normal" },
    ],
  },
  {
    id: 4,
    key: "canopy",
    badge: "04 / 06 • KANOPI RIMBA",
    title: "Menyelam ke Dalam Jantung Rimba",
    subtitle:
      "Tajuk pepohonan purba setinggi 50 meter yang melindungi biomassa dan keanekaragaman hayati.",
    narrative:
      "Menembus atap hijau kanopi rimba Kalimantan dan Sumatra. Di bawah kerapatan daun dan jalinan dahan purba, triliunan sel vegetasi bekerja tanpa henti mengubah karbon dioksida menjadi biomassa kayu yang kokoh.",
    image: "/landing-story/04-canopy.jpg",
    cameraInfo: "Kerapatan Tajuk Kanopi • Alt 45 M",
    telemetry: [
      { label: "NDVI Satelit", value: "0.82 (Vegetasi Lebat)", status: "verified" },
      { label: "Kerapatan Kanopi", value: "91.4%", status: "verified" },
      { label: "Indeks Biomassa", value: "Tinggi & Aktif", status: "normal" },
    ],
  },
  {
    id: 5,
    key: "orangutan",
    badge: "05 / 06 • SIMBIOSIS SATWA & IOT",
    title: "Harmoni Satwa & Pengawasan Kriptografis",
    subtitle:
      "Satwa endemik hidup terlindungi berdampingan dengan sensor IoT edge node ExcbonCP.",
    narrative:
      "Di batang pohon habitat orangutan, terpasang modul IoT mandiri berdaya surya. Membaca suhu, deteksi api multi-level, dan kelembapan tanah secara real-time, lalu mengunci setiap bukti telemetri ke hash chain SHA-256 dan segel digital EAS.",
    image: "/landing-story/05-orangutan-iot.jpg",
    cameraInfo: "Ground Habitat • Node Telemetri Pohon #01",
    hotspots: [
      {
        id: "orangutan-spot",
        x: "50%",
        y: "45%",
        title: "Orangutan Kalimantan (Pongo pygmaeus)",
        subtitle: "Satwa endemik payung yang kelestariannya mencerminkan kesehatan ekosistem rimba.",
        icon: "heart",
        color: "#f97316",
      },
      {
        id: "iot-node-spot",
        x: "68%",
        y: "60%",
        title: "IoT Sensor Node #01",
        subtitle: "Sensor suhu, deteksi api KY-026, kelembapan tanah, dan segel tamper-evident SHA-256.",
        icon: "cpu",
        color: "#AEDA2D",
      },
    ],
    telemetry: [
      { label: "Sensor Api KY-026", value: "Normal (Aman)", status: "verified" },
      { label: "Suhu & Tanah", value: "26.5°C • 64.2%", status: "normal" },
      { label: "Segel Kriptografis", value: "SHA-256 Terkunci", status: "verified" },
    ],
  },
  {
    id: 6,
    key: "panorama",
    badge: "06 / 06 • MASA DEPAN INTEGRITAS",
    title: "Wujudkan Integritas Karbon Bersama ExcbonCP",
    subtitle:
      "Menghubungkan fakta fisik hutan lindung dengan pasar karbon desentralisasi yang adil dan terbuka.",
    narrative:
      "ExcbonCP menyatukan data sensor di pepohonan, citra satelit, dan konsensus persetujuan masyarakat adat 70% ke dalam buku catatan publik Base Sepolia. Tidak ada manipulasi dan tidak ada klaim kosong, melainkan integritas verifikasi murni.",
    image: "/landing-story/06-panorama-cta.jpg",
    cameraInfo: "Cakrawala Rimba Tropis • Pagi Hari Terlindungi",
    telemetry: [
      { label: "Konsensus Warga", value: "70% FPIC Terpenuhi", status: "verified" },
      { label: "Likuiditas Pasar", value: "Otomatis & Terbuka", status: "verified" },
      { label: "Status Ledger", value: "Tamper-Evident", status: "verified" },
    ],
    cta: {
      primaryText: "Bergabung dengan Kami di ExcbonCP",
      primaryHref: "/market",
      secondaryText: "Jelajahi Peta Poligon & IoT",
      secondaryHref: "/map",
    },
  },
];
