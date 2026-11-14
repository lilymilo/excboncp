import { Building2, Factory, Trees, type LucideIcon } from "lucide-react";

export type EcosystemId = "hutan" | "industri" | "smart-city";

export interface EcosystemDefinition {
  id: EcosystemId;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  textColorVar: string;
  bgColorVar: string;
  borderColorVar: string;
}

export const ECOSYSTEMS: Record<EcosystemId, EcosystemDefinition> = {
  hutan: {
    id: "hutan",
    label: "Hutan & Lahan",
    shortLabel: "Hutan & Lahan",
    description: "Petak hutan adat, koridor lindung, dan kanopi penyerap karbon primer.",
    icon: Trees,
    textColorVar: "var(--leaf-primary)",
    bgColorVar: "var(--forest-deep)",
    borderColorVar: "var(--forest-line)",
  },
  industri: {
    id: "industri",
    label: "Industri",
    shortLabel: "Industri",
    description: "Sabuk penyangga emisi dan alokasi dekarbonisasi Kawasan Ekonomi Khusus.",
    icon: Factory,
    textColorVar: "var(--warning-text)",
    bgColorVar: "var(--warning-bg)",
    borderColorVar: "var(--warning-line)",
  },
  "smart-city": {
    id: "smart-city",
    label: "Smart City",
    shortLabel: "Smart City",
    description: "Ruang terbuka hijau perkotaan dan koridor penyerap panas mikro-iklim kota.",
    icon: Building2,
    textColorVar: "var(--seal-blue-text)",
    bgColorVar: "var(--seal-blue-bg)",
    borderColorVar: "var(--seal-blue-line)",
  },
};

export const ECOSYSTEM_LIST: EcosystemDefinition[] = [
  ECOSYSTEMS.hutan,
  ECOSYSTEMS.industri,
  ECOSYSTEMS["smart-city"],
];

// Placeholder frontend untuk memetakan parcel_id ke ecosystem_id sampai backend menyediakan klasifikasi ekosistem resmi.
export const PARCEL_ECOSYSTEM_MAP: Record<string, EcosystemId> = {
  "PARCEL-A": "hutan",
  "PARCEL-B": "hutan",
  "PARCEL-C": "hutan",
  "PARCEL-D": "industri",
  "PARCEL-E": "industri",
  "PARCEL-F": "smart-city",
  "PARCEL-G": "industri",
  "PARCEL-H": "industri",
  "PARCEL-I": "industri",
  "PARCEL-J": "smart-city",
  "PARCEL-K": "smart-city",
  "PARCEL-L": "smart-city",
};

export function resolveParcelEcosystem(parcelId: string): EcosystemId {
  const key = parcelId.trim().toUpperCase();
  return PARCEL_ECOSYSTEM_MAP[key] ?? "hutan";
}

export function isValidEcosystemId(value: string | null | undefined): value is EcosystemId {
  if (!value) return false;
  return value === "hutan" || value === "industri" || value === "smart-city";
}
