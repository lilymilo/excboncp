import { Parcel } from "./types";

export const MOCK_PARCELS: Parcel[] = [
  {
    id: "lahan-a",
    name: "Lahan A — Hutan Adat Long Isun",
    location: "Mahakam Ulu, Kalimantan Timur",
    areaHa: 600,
    carbonUnits: 600,
    status: "VERIFIED",
    statusLabel: "Terverifikasi",
    consent: "granted",
    consentBy: "Lembaga Adat Long Isun",
    telemetry: {
      deviceId: "esp-01",
      timestamp: "2026-11-09T14:30:00Z",
      tempC: 31.4,
      humidityPct: 68.2,
      flame: 0,
      soilPct: 57,
    },
    satellite: {
      polygonId: "lahan-a",
      date: "2026-11-08",
      ndviMean: 0.78,
      sarVvDb: -12.4,
    },
    digitalSeal: {
      hash: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
      prevHash: "0000000000000000000000000000000000000000000000000000000000000000",
      easUid: "0x892a4bc0319fde8721cba10243e8910fedca321045baef129034871234abcd01",
      approvedBy: "auditor-01@verra-registry.org",
      timestamp: "2026-11-09T15:00:00Z",
    },
  },
  {
    id: "lahan-b",
    name: "Lahan B — Blok Penyangga Hutan Lindung",
    location: "Kutai Barat, Kalimantan Timur",
    areaHa: 450,
    carbonUnits: 450,
    status: "BLOCKED",
    statusLabel: "Menunggu Izin Warga",
    consent: "none",
    telemetry: {
      deviceId: "esp-02",
      timestamp: "2026-11-09T14:31:00Z",
      tempC: 33.1,
      humidityPct: 62.0,
      flame: 0,
      soilPct: 48,
    },
    satellite: {
      polygonId: "lahan-b",
      date: "2026-11-08",
      ndviMean: 0.72,
      sarVvDb: -13.1,
    },
    digitalSeal: {
      hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      prevHash: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
      timestamp: "2026-11-09T14:31:00Z",
    },
  },
];

