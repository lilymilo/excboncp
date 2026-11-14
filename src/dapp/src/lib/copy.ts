import type { CanonicalStatus } from "./dashboard-helpers";
import type { UserRole } from "@/context/DappContext";

export type ReportPeriodKey = "harian" | "mingguan" | "bulanan" | "tahunan";
export type ApiReportPeriod = "day" | "week" | "month" | "year";

export const APP_SIMULATION_PILL = "Simulasi, testnet";
export const APP_SIMULATION_NOTE =
  "Seluruh nilai rupiah, unit kredit, dan catatan transaksi pada layar ini adalah data simulasi pada jaringan uji testnet, bukan nilai komersial resmi.";

export const PERIOD_ROUTE_TO_API: Record<ReportPeriodKey, ApiReportPeriod> = {
  harian: "day",
  mingguan: "week",
  bulanan: "month",
  tahunan: "year",
};

export const PERIOD_LABELS: Record<ReportPeriodKey, string> = {
  harian: "Harian",
  mingguan: "Mingguan",
  bulanan: "Bulanan",
  tahunan: "Tahunan",
};

export const STATUS_DISPLAY: Record<
  CanonicalStatus,
  {
    code: CanonicalStatus;
    label: string;
    shortLabel: string;
    marketLabel: string;
    description: string;
  }
> = {
  VERIFIED: {
    code: "VERIFIED",
    label: "Terverifikasi",
    shortLabel: "Siap",
    marketLabel: "Siap dijual",
    description: "Izin warga aktif, telemetri normal, dan indeks kanopi memenuhi ambang.",
  },
  WARNING: {
    code: "WARNING",
    label: "Perlu perhatian",
    shortLabel: "Peringatan",
    marketLabel: "Sebagian ditahan",
    description: "Ada indikator sensor atau kanopi di luar batas wajar. Sebagian unit ditahan.",
  },
  DISPUTE: {
    code: "DISPUTE",
    label: "Keberatan warga",
    shortLabel: "Keberatan",
    marketLabel: "Unit dibekukan",
    description: "Sedang dalam penyelesaian keberatan komunitas. Unit dibekukan sementara.",
  },
  BLOCKED: {
    code: "BLOCKED",
    label: "Ditahan sistem",
    shortLabel: "Ditahan",
    marketLabel: "Belum bisa dijual",
    description: "Izin warga belum aktif atau dicabut. Tidak ada unit yang terbuka ke pasar simulasi.",
  },
};

export const CONSENT_DISPLAY = {
  granted: {
    label: "Izin warga aktif",
    detail: "Perwakilan komunitas telah menyetujui pemantauan dan pembagian hasil.",
  },
  revoked: {
    label: "Izin warga dicabut",
    detail: "Komunitas menggunakan hak henti. Unit lahan otomatis dibekukan.",
  },
  none: {
    label: "Belum ada izin warga",
    detail: "Menunggu persetujuan tercatat dari komunitas pengelola lahan.",
  },
} as const;

export const ROLE_TITLES: Record<UserRole, { label: string; scopeSummary: string }> = {
  community: {
    label: "Komunitas Adat",
    scopeSummary: "Mengelola izin warga pada lahan yang tertaut dan memantau porsi 60%.",
  },
  manager: {
    label: "Pengelola Hutan",
    scopeSummary: "Memantau kondisi sensor, kanopi lahan, simulasi pasar, dan porsi operasi 40%.",
  },
  recipient: {
    label: "Penerima Zona",
    scopeSummary: "Memeriksa pemakaian unit terverifikasi serta catatan distribusi pada zona terkait.",
  },
  auditor: {
    label: "Auditor MRV",
    scopeSummary: "Meninjau bukti lapangan, kecocokan rantai hash, dan penguncian segel EAS.",
  },
  guest: {
    label: "Tamu Publik",
    scopeSummary: "Akses baca peta kehutanan, screener ringkas, indikator, dan verifikasi segel.",
  },
};

export const ROUTE_ACCESS_RULES: {
  prefix: string;
  label: string;
  allowedRoles: UserRole[] | "all" | "authenticated";
  reason: string;
}[] = [
  {
    prefix: "/zona",
    label: "Laporan Zona",
    allowedRoles: ["manager", "recipient", "auditor"],
    reason:
      "Ringkasan pemakaian zona hanya dibuka untuk Pengelola Hutan, Penerima Zona, dan Auditor MRV.",
  },
  {
    prefix: "/izin",
    label: "Izin Warga",
    allowedRoles: ["community"],
    reason: "Halaman pengesahan dan hak veto FPIC hanya dapat diakses oleh akun Komunitas pemilik lahan.",
  },
  {
    prefix: "/consent",
    label: "Izin Warga",
    allowedRoles: ["community"],
    reason: "Halaman pengesahan dan hak veto FPIC hanya dapat diakses oleh akun Komunitas pemilik lahan.",
  },
  {
    prefix: "/tinjau",
    label: "Tinjau Auditor",
    allowedRoles: ["auditor"],
    reason: "Persetujuan segel bukti lapangan khusus diperuntukkan bagi akun dengan peran Auditor MRV.",
  },
  {
    prefix: "/approve",
    label: "Tinjau Auditor",
    allowedRoles: ["auditor"],
    reason: "Persetujuan segel bukti lapangan khusus diperuntukkan bagi akun dengan peran Auditor MRV.",
  },
  {
    prefix: "/audit",
    label: "Tinjau Auditor",
    allowedRoles: ["auditor"],
    reason: "Persetujuan segel bukti lapangan khusus diperuntukkan bagi akun dengan peran Auditor MRV.",
  },
];

export const ZONES_CATALOG: Record<
  string,
  {
    id: string;
    name: string;
    kind: string;
    jurisdiction: string;
    description: string;
    center: [number, number];
  }
> = {
  "ZONE-DEMO-A": {
    id: "ZONE-DEMO-A",
    name: "Zona contoh A (KEK)",
    kind: "Kawasan Ekonomi Khusus (Simulasi)",
    jurisdiction: "Bogor, IKN & Koridor Industri Hijau",
    description:
      "Zona penerima unit serapan simulasi untuk mencatat distribusi manfaat ke kawasan industri percontohan.",
    center: [-6.595, 106.798],
  },
  "ZONE-DEMO-B": {
    id: "ZONE-DEMO-B",
    name: "Zona contoh B (kota hijau)",
    kind: "Koridor Kota Hijau (Simulasi)",
    jurisdiction: "Jabodetabek & Kota Hijau IKN",
    description:
      "Zona mitra percontohan kedua untuk pemantauan pemakaian unit karbon terverifikasi.",
    center: [-6.606, 106.814],
  },
};

export function normalizePeriodKey(raw?: string): ReportPeriodKey {
  const lower = (raw ?? "harian").toLowerCase();
  if (lower === "mingguan" || lower === "week") return "mingguan";
  if (lower === "bulanan" || lower === "month") return "bulanan";
  if (lower === "tahunan" || lower === "year") return "tahunan";
  return "harian";
}

export function getWibTodayIso(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const y = parts.find((p) => p.type === "year")?.value ?? "2026";
  const m = parts.find((p) => p.type === "month")?.value ?? "11";
  const d = parts.find((p) => p.type === "day")?.value ?? "12";
  return `${y}-${m}-${d}`;
}

export function getMondayOfWibWeek(isoDate: string): string {
  const safe = /^\d{4}-\d{2}-\d{2}$/.test(isoDate) ? isoDate : getWibTodayIso();
  const dt = new Date(`${safe}T12:00:00+07:00`);
  const weekday = (dt.getUTCDay() + 6) % 7; // Convert Sun=0 to Mon=0..Sun=6
  // Use Asia/Jakarta weekday explicitly
  const wibName = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    weekday: "short",
  }).format(dt);
  const dayOffsetMap: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };
  const offset = dayOffsetMap[wibName] ?? weekday;
  const mondayMs = dt.getTime() - offset * 86_400_000;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(mondayMs));
}

export function shiftPeriodDate(period: ReportPeriodKey, isoDate: string, delta: number): string {
  const safe = /^\d{4}-\d{2}-\d{2}$/.test(isoDate) ? isoDate : getWibTodayIso();
  const base = new Date(`${safe}T12:00:00+07:00`);
  if (period === "harian") {
    base.setUTCDate(base.getUTCDate() + delta);
  } else if (period === "mingguan") {
    base.setUTCDate(base.getUTCDate() + delta * 7);
  } else if (period === "bulanan") {
    base.setUTCMonth(base.getUTCMonth() + delta);
  } else {
    base.setUTCFullYear(base.getUTCFullYear() + delta);
  }
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(base);
}

export function formatPeriodHeading(period: ReportPeriodKey, isoDate: string): string {
  const safe = /^\d{4}-\d{2}-\d{2}$/.test(isoDate) ? isoDate : getWibTodayIso();
  const base = new Date(`${safe}T12:00:00+07:00`);
  if (period === "harian") {
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(base);
  }
  if (period === "mingguan") {
    const monStr = getMondayOfWibWeek(safe);
    const mon = new Date(`${monStr}T12:00:00+07:00`);
    const sun = new Date(mon.getTime() + 6 * 86_400_000);
    const startDay = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", day: "numeric" }).format(mon);
    const endFull = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(sun);
    const monMonth = mon.getUTCMonth();
    const sunMonth = sun.getUTCMonth();
    if (monMonth === sunMonth) {
      return `${startDay}-${endFull}`;
    }
    const startWithMonth = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "short",
    }).format(mon);
    return `${startWithMonth} - ${endFull}`;
  }
  if (period === "bulanan") {
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      month: "long",
      year: "numeric",
    }).format(base);
  }
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
  }).format(base);
}

export function isRouteAllowedForRole(pathname: string, role: UserRole): { allowed: boolean; reason?: string } {
  const clean = pathname.toLowerCase();
  for (const rule of ROUTE_ACCESS_RULES) {
    if (clean === rule.prefix || clean.startsWith(`${rule.prefix}/`)) {
      if (rule.allowedRoles === "all") return { allowed: true };
      if (rule.allowedRoles === "authenticated") {
        return role !== "guest" ? { allowed: true } : { allowed: false, reason: rule.reason };
      }
      if (!rule.allowedRoles.includes(role)) {
        return { allowed: false, reason: rule.reason };
      }
    }
  }
  return { allowed: true };
}

