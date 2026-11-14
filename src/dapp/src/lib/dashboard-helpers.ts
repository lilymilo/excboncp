export type DashboardRole = "community" | "manager" | "recipient" | "auditor" | "guest";
export type ParcelVerificationStatus = "verified" | "pending" | "blocked" | "warning" | "dispute";
export type ParcelConsentStatus = "granted" | "revoked" | "none";
export type CanonicalStatus = "VERIFIED" | "WARNING" | "DISPUTE" | "BLOCKED";
export type ReportPeriod = "Harian" | "Mingguan" | "Bulanan";

export interface MinimalParcel {
  id: string;
  name: string;
  verificationStatus: ParcelVerificationStatus;
  consentStatus: ParcelConsentStatus;
}

export interface MinimalTransaction {
  volume_tco2e: number;
  gross_amount_idr: number;
}

export interface MarketSeriesPoint {
  label: string;
  units: number;
  grossIdr: number;
  timestamp?: string;
}

export interface NextActionBanner {
  label: string;
  description: string;
  href: string;
  tone: "primary" | "attention";
}

const REFERENCE_PRICE_PER_TON_IDR = 150_000;

export function toCanonicalStatus(raw: ParcelVerificationStatus): CanonicalStatus {
  if (raw === "verified") return "VERIFIED";
  if (raw === "warning") return "WARNING";
  if (raw === "dispute") return "DISPUTE";
  return "BLOCKED";
}

export function formatWibTime(isoString?: string): string {
  if (!isoString) return "12:00 WIB";
  try {
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return "12:00 WIB";
    const formatted = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
    return `${formatted.replace(".", ":")} WIB`;
  } catch {
    return "12:00 WIB";
  }
}

export function formatWibDateTime(isoString?: string): string {
  if (!isoString) return "12:00 WIB";
  try {
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return "12:00 WIB";
    const datePart = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
    return `${datePart}, ${formatWibTime(isoString)}`;
  } catch {
    return "12:00 WIB";
  }
}

export function getGreetingWib(date = new Date()): { greeting: string; clockWib: string } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "12");
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  const clockWib = `${String(hour).padStart(2, "0")}:${minute} WIB`;

  if (hour >= 4 && hour < 11) return { greeting: "Selamat pagi", clockWib };
  if (hour >= 11 && hour < 15) return { greeting: "Selamat siang", clockWib };
  if (hour >= 15 && hour < 19) return { greeting: "Selamat sore", clockWib };
  return { greeting: "Selamat malam", clockWib };
}

export function computeRoleNextAction(
  role: DashboardRole,
  parcels: MinimalParcel[]
): NextActionBanner {
  const warningParcel = parcels.find(
    (p) =>
      p.verificationStatus === "warning" ||
      p.verificationStatus === "blocked" ||
      p.verificationStatus === "dispute"
  );
  const parcelMissingConsent = parcels.find((p) => p.consentStatus !== "granted");
  const reviewCount = parcels.filter(
    (p) => p.verificationStatus === "pending" || p.verificationStatus === "warning"
  ).length;

  if (role === "community") {
    if (parcelMissingConsent) {
      return {
        label: `Catat izin untuk ${parcelMissingConsent.name}`,
        description:
          "Hak persetujuan warga diperlukan sebelum unit karbon lahan dapat dibuka untuk simulasi.",
        href: `/consent?parcel=${encodeURIComponent(parcelMissingConsent.id)}`,
        tone: "attention",
      };
    }
    return {
      label: "Lihat bagian hasil saya",
      description:
        "Izin komunitas Anda tercatat aktif. Pantau alokasi 60% bagian komunitas dari transaksi simulasi.",
      href: "/portfolio",
      tone: "primary",
    };
  }

  if (role === "manager") {
    if (warningParcel) {
      return {
        label: `Lihat alasan (${warningParcel.id})`,
        description: `${warningParcel.name} berstatus perlu perhatian. Periksa telemetri sensor dan ringkasan AI.`,
        href: `/map?parcel=${encodeURIComponent(warningParcel.id)}`,
        tone: "attention",
      };
    }
    return {
      label: "Buka screener pasar",
      description: "Pantau ketersediaan unit terverifikasi dan estimasi pembagian hasil simulasi.",
      href: "/screener",
      tone: "primary",
    };
  }

  if (role === "recipient") {
    return {
      label: "Buka laporan zona",
      description:
        "Periksa laporan penggunaan unit terverifikasi per zona penerima dan alokasi simulasi.",
      href: "/portfolio",
      tone: "primary",
    };
  }

  if (role === "auditor") {
    return {
      label: `Tinjau ${Math.max(reviewCount, 1)} lahan`,
      description:
        "Cocokkan bukti satelit NDVI, telemetri sensor lapangan, dan izin warga sebelum mengunci segel.",
      href: "/approve",
      tone: "attention",
    };
  }

  return {
    label: "Periksa segel keaslian bukti",
    description:
      "Mode tamu hanya dapat membaca peta hutan dan memeriksa keaslian segel buku catatan.",
    href: "/verify",
    tone: "primary",
  };
}

export function buildRevenueSeries(
  period: ReportPeriod,
  transactions: MinimalTransaction[]
): {
  points: MarketSeriesPoint[];
  unitsSold: number;
  grossIdr: number;
  deltaPct: number;
  marketState: string;
} {
  const liveUnits = transactions.reduce((sum, tx) => sum + tx.volume_tco2e, 0);
  const liveGross = transactions.reduce((sum, tx) => sum + tx.gross_amount_idr, 0);
  const extraUnits = Math.max(0, liveUnits - 10);
  const extraGross = Math.max(0, liveGross - 10 * REFERENCE_PRICE_PER_TON_IDR);

  if (period === "Harian") {
    const base: MarketSeriesPoint[] = [
      { label: "08:00", units: 2, grossIdr: 300_000 },
      { label: "10:00", units: 3, grossIdr: 450_000 },
      { label: "12:00", units: 5 + extraUnits, grossIdr: 750_000 + extraGross },
      { label: "14:00", units: 4, grossIdr: 600_000 },
      { label: "16:00", units: 6, grossIdr: 900_000 },
      { label: "18:00", units: 4, grossIdr: 600_000 },
    ];
    return {
      points: base,
      unitsSold: base.reduce((acc, p) => acc + p.units, 0),
      grossIdr: base.reduce((acc, p) => acc + p.grossIdr, 0),
      deltaPct: 12.4,
      marketState: extraUnits > 0 ? "Aktif simulasi" : "Normal",
    };
  }

  if (period === "Mingguan") {
    const base: MarketSeriesPoint[] = [
      { label: "Sen", units: 12, grossIdr: 1_800_000 },
      { label: "Sel", units: 18, grossIdr: 2_700_000 },
      { label: "Rab", units: 14, grossIdr: 2_100_000 },
      { label: "Kam", units: 22, grossIdr: 3_300_000 },
      { label: "Jum", units: 20 + extraUnits, grossIdr: 3_000_000 + extraGross },
      { label: "Sab", units: 16, grossIdr: 2_400_000 },
      { label: "Min", units: 10, grossIdr: 1_500_000 },
    ];
    return {
      points: base,
      unitsSold: base.reduce((acc, p) => acc + p.units, 0),
      grossIdr: base.reduce((acc, p) => acc + p.grossIdr, 0),
      deltaPct: 8.6,
      marketState: "Stabil",
    };
  }

  const base: MarketSeriesPoint[] = [
    { label: "Agu", units: 64, grossIdr: 9_600_000 },
    { label: "Sep", units: 78, grossIdr: 11_700_000 },
    { label: "Okt", units: 92, grossIdr: 13_800_000 },
    { label: "Nov", units: 112 + extraUnits, grossIdr: 16_800_000 + extraGross },
  ];
  return {
    points: base,
    unitsSold: base.reduce((acc, p) => acc + p.units, 0),
    grossIdr: base.reduce((acc, p) => acc + p.grossIdr, 0),
    deltaPct: 18.2,
    marketState: "Bertumbuh",
  };
}

export function parseHexBytes(hash?: string): number[] {
  const clean = (hash ?? "").replace(/^0x/i, "").replace(/[^0-9a-f]/gi, "").toLowerCase();
  const bytes: number[] = [];
  for (let i = 0; i < 32; i++) {
    const start = i * 2;
    if (start + 2 <= clean.length) {
      const parsed = Number.parseInt(clean.slice(start, start + 2), 16);
      bytes.push(Number.isFinite(parsed) ? parsed : 0);
    } else {
      bytes.push(0);
    }
  }
  return bytes;
}

