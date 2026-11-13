"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type VerificationStatus = "verified" | "pending" | "blocked" | "warning" | "dispute";
export type UserRole = "community" | "manager" | "recipient" | "auditor" | "guest";
export type ConsentStatus = "granted" | "revoked" | "none";

export interface ParcelItem {
  id: string;
  name: string;
  area: number;
  carbonStock: number;
  verificationStatus: VerificationStatus;
  lastUpdate: string;
  community: string;
  region: string;
  eligibility: boolean;
  frozenUnits: number;
  availableUnits: number;
  ndvi?: number;
  sar?: number;
  sensors?: string[];
  consentStatus: ConsentStatus;
  settlementEstimateIdr: number;
}

export interface SensorData {
  sensor_id: string;
  parcel_id: string;
  type: string;
  temperature: number;
  humidity: number;
  soil_moisture: number;
  co2e_tonPerDay: number;
  timestamp: string;
  anomaly: boolean;
  flameDetected: boolean;
}

export interface AIAssessment {
  parcel_id: string;
  ai1_summary: string;
  ai2_anomaly: string;
  ai2_score: number;
  evidence: string[];
  timestamp: string;
  status: "passed" | "failed";
}

export interface ConsentRecord {
  parcel_id: string;
  community: string;
  status: ConsentStatus;
  granted_by: string;
  timestamp: string;
  receipt_id: string;
}

export interface VerificationRecord {
  record_id: string;
  parcel_id: string;
  block_index: number;
  hash: string;
  prev_hash: string;
  timestamp: string;
  eas_uid: string;
  tx_hash: string;
  tampered: boolean;
  reasons: string[];
}

export interface Transaction {
  tx_id: string;
  parcel_id: string;
  buyer_id: string;
  volume_tco2e: number;
  gross_amount_idr: number;
  community_allocation_idr: number;
  manager_allocation_idr: number;
  mrv_allocation_idr: number;
  timestamp: string;
  status: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Settlement {
  gross_idr: number;
  sandbox_fee_idr: number;
  net_idr: number;
  community_idr: number;
  operations_idr: number;
}

/* Settlement matches backend: 2% sandbox, then 60% community / 40% operations */
const SANDBOX_FEE = 0.02;
const COMMUNITY_RATE = 0.60;
const OPERATIONS_RATE = 0.40;
export const PRICE_PER_TON = 150_000;

export function calculateSettlement(grossIdr: number): Settlement {
  const sandboxFee = grossIdr * SANDBOX_FEE;
  const net = grossIdr - sandboxFee;
  return {
    gross_idr: grossIdr,
    sandbox_fee_idr: sandboxFee,
    net_idr: net,
    community_idr: net * COMMUNITY_RATE,
    operations_idr: net * OPERATIONS_RATE,
  };
}

const DEMO_USERS: Record<string, User & { password: string }> = {
  "komunitas.a@demo.excboncp.test": { id: "u1", email: "komunitas.a@demo.excboncp.test", name: "Sari Dewi", role: "community", password: "demo123" },
  "komunitas.b@demo.excboncp.test": { id: "u2", email: "komunitas.b@demo.excboncp.test", name: "Budi Santoso", role: "community", password: "demo123" },
  "pengelola.a@demo.excboncp.test": { id: "u3", email: "pengelola.a@demo.excboncp.test", name: "Ahmad Fauzi", role: "manager", password: "demo123" },
  "auditor@demo.excboncp.test":     { id: "u4", email: "auditor@demo.excboncp.test", name: "Dr. Hendra", role: "auditor", password: "demo123" },
  "penerima.a@demo.excboncp.test":  { id: "u5", email: "penerima.a@demo.excboncp.test", name: "PT. GreenCorp", role: "recipient", password: "demo123" },
};

export const GUEST_USER: User = {
  id: "guest",
  email: "publik@excboncp.test",
  name: "Tamu Publik",
  role: "guest",
};

const VALID_ROLES: UserRole[] = ["community", "manager", "recipient", "auditor", "guest"];

export function normalizeUserRole(rawRole: unknown, rawEmail?: unknown): UserRole {
  if (typeof rawRole === "string") {
    const lower = rawRole.toLowerCase().trim();
    if ((VALID_ROLES as string[]).includes(lower)) return lower as UserRole;
    if (lower.includes("komunitas") || lower.includes("warga") || lower === "member") return "community";
    if (lower.includes("pengelola") || lower.includes("hutan") || lower === "owner") return "manager";
    if (lower.includes("penerima") || lower.includes("pembeli") || lower.includes("creator") || lower.includes("industri")) return "recipient";
    if (lower.includes("auditor")) return "auditor";
    if (lower.includes("tamu") || lower.includes("publik")) return "guest";
  }
  if (typeof rawEmail === "string") {
    const matched = DEMO_USERS[rawEmail.toLowerCase().trim()];
    if (matched) return matched.role;
  }
  return "guest";
}

function sanitizeStoredUser(raw: unknown): User | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const email = typeof obj.email === "string" && obj.email.trim() ? obj.email.trim() : GUEST_USER.email;
  const matchedDemo = DEMO_USERS[email.toLowerCase()];
  const role = normalizeUserRole(obj.role, email);
  const name =
    typeof obj.name === "string" && obj.name.trim()
      ? obj.name.trim()
      : matchedDemo?.name ?? (email.split("@")[0] || GUEST_USER.name);
  const id = typeof obj.id === "string" && obj.id.trim() ? obj.id.trim() : matchedDemo?.id ?? "u-session";
  return { id, email, name, role };
}

export const DEMO_PARCELS: ParcelItem[] = [
  {
    id: "PARCEL-A",
    name: "Hutan Bogor Blok A",
    area: 150,
    carbonStock: 2340,
    verificationStatus: "verified",
    lastUpdate: "2024-01-15T10:05:00Z",
    community: "Komunitas Adat Bogor",
    region: "Bogor, Jawa Barat",
    eligibility: true,
    frozenUnits: 0,
    availableUnits: 234,
    ndvi: 0.78,
    sar: 0.65,
    sensors: ["S-001", "S-002"],
    consentStatus: "granted",
    settlementEstimateIdr: 35100000,
  },
  {
    id: "PARCEL-B",
    name: "Hutan Bogor Blok B",
    area: 220,
    carbonStock: 3120,
    verificationStatus: "warning",
    lastUpdate: "2024-01-15T09:15:00Z",
    community: "Yayasan Hutan Lestari",
    region: "Bogor, Jawa Barat",
    eligibility: false,
    frozenUnits: 100,
    availableUnits: 0,
    ndvi: 0.62,
    sar: 0.71,
    sensors: ["S-003"],
    consentStatus: "granted",
    settlementEstimateIdr: 0,
  },
];

export const DEMO_SENSORS: SensorData[] = [
  {
    sensor_id: "S-001", parcel_id: "PARCEL-A", type: "DHT22",
    temperature: 27.4, humidity: 76, soil_moisture: 58,
    co2e_tonPerDay: 0.023, timestamp: "2024-01-15T08:30:00Z",
    anomaly: false, flameDetected: false,
  },
  {
    sensor_id: "S-002", parcel_id: "PARCEL-A", type: "DHT22",
    temperature: 28.1, humidity: 74, soil_moisture: 55,
    co2e_tonPerDay: 0.021, timestamp: "2024-01-15T08:35:00Z",
    anomaly: false, flameDetected: false,
  },
  {
    sensor_id: "S-003", parcel_id: "PARCEL-B", type: "DHT22+KY026",
    temperature: 43.2, humidity: 42, soil_moisture: 22,
    co2e_tonPerDay: 0.045, timestamp: "2024-01-15T09:15:00Z",
    anomaly: true, flameDetected: true,
  },
];

export const DEMO_AI: AIAssessment[] = [
  {
    parcel_id: "PARCEL-A",
    ai1_summary: "Vegetasi dalam kondisi baik. NDVI 0.78 menunjukkan tutupan kanopi yang sehat. Tidak ada anomali terdeteksi dari data sensor S-001 dan S-002.",
    ai2_anomaly: "normal",
    ai2_score: 0.12,
    evidence: ["S-001", "S-002", "NDVI-20240115"],
    timestamp: "2024-01-15T10:00:00Z",
    status: "passed",
  },
  {
    parcel_id: "PARCEL-B",
    ai1_summary: "Terdeteksi kondisi suhu tinggi dan sensor api aktif pada S-003. Suhu 43.2°C jauh di atas ambang normal. Kelembaban tanah turun ke 22%.",
    ai2_anomaly: "fire_risk",
    ai2_score: 0.87,
    evidence: ["S-003", "NDVI-20240115"],
    timestamp: "2024-01-15T09:20:00Z",
    status: "failed",
  },
];

export const DEMO_CONSENTS: ConsentRecord[] = [
  {
    parcel_id: "PARCEL-A", community: "Komunitas Adat Bogor",
    status: "granted", granted_by: "komunitas.a@demo.excboncp.test",
    timestamp: "2024-01-10T07:00:00Z", receipt_id: "CONSENT-001",
  },
  {
    parcel_id: "PARCEL-B", community: "Yayasan Hutan Lestari",
    status: "granted", granted_by: "komunitas.b@demo.excboncp.test",
    timestamp: "2024-01-12T09:00:00Z", receipt_id: "CONSENT-002",
  },
];

export const DEMO_VERIFICATION: VerificationRecord[] = [
  {
    record_id: "VR-001",
    parcel_id: "PARCEL-A",
    block_index: 1247,
    hash: "a4b9c2d1e8f3a7b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4",
    prev_hash: "9f3e7a1b5c8d2e6f0a4b8c2d6e0f4a8b2c6d0e4f8a2b6c0d4e8f2a6b0c4d8e2f",
    timestamp: "2024-01-15T10:05:00Z",
    eas_uid: "0x7a8fc2d1e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
    tx_hash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    tampered: false,
    reasons: [],
  },
];

export const DEMO_TRANSACTIONS: Transaction[] = [
  {
    tx_id: "TX-001",
    parcel_id: "PARCEL-A",
    buyer_id: "u5",
    volume_tco2e: 10,
    gross_amount_idr: 1500000,
    community_allocation_idr: 882000,
    manager_allocation_idr: 588000,
    mrv_allocation_idr: 30000,
    timestamp: "2024-01-15T11:00:00Z",
    status: "completed",
  },
];

interface DappContextType {
  user: User | null;
  parcels: ParcelItem[];
  sensors: SensorData[];
  aiAssessments: AIAssessment[];
  consentRecords: ConsentRecord[];
  verificationRecords: VerificationRecord[];
  transactions: Transaction[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => void;
  isLoading: boolean;
  updateParcel: (id: string, patch: Partial<ParcelItem>) => void;
  updateSensors: (parcelId: string, patch: Partial<SensorData>) => void;
}

const DappContext = createContext<DappContextType | null>(null);

const ROLE_TO_DEMO_EMAIL: Record<UserRole, string | null> = {
  community: "komunitas.a@demo.excboncp.test",
  manager: "pengelola.a@demo.excboncp.test",
  recipient: "penerima.a@demo.excboncp.test",
  auditor: "auditor@demo.excboncp.test",
  guest: null,
};

export function DappProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [parcels, setParcels] = useState<ParcelItem[]>(DEMO_PARCELS);
  const [sensors, setSensors] = useState<SensorData[]>(DEMO_SENSORS);

  useEffect(() => {
    const stored = localStorage.getItem("excboncp_user");
    if (stored) {
      try {
        const sanitized = sanitizeStoredUser(JSON.parse(stored));
        if (sanitized) {
          setUser(sanitized);
          localStorage.setItem("excboncp_user", JSON.stringify(sanitized));
        } else {
          localStorage.removeItem("excboncp_user");
        }
      } catch {
        localStorage.removeItem("excboncp_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const demo = DEMO_USERS[email.toLowerCase()];
    if (demo && demo.password === password) {
      const { password: _, ...u } = demo;
      setUser(u);
      localStorage.setItem("excboncp_user", JSON.stringify(u));
      return true;
    }
    return false;
  };

  const switchDemoRole = (role: UserRole) => {
    const targetEmail = ROLE_TO_DEMO_EMAIL[role];
    if (!targetEmail) {
      setUser(GUEST_USER);
      localStorage.setItem("excboncp_user", JSON.stringify(GUEST_USER));
      return;
    }
    const demo = DEMO_USERS[targetEmail];
    if (demo) {
      const { password: _, ...u } = demo;
      setUser(u);
      localStorage.setItem("excboncp_user", JSON.stringify(u));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("excboncp_user");
  };

  const updateParcel = (id: string, patch: Partial<ParcelItem>) => {
    setParcels((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const updateSensors = (parcelId: string, patch: Partial<SensorData>) => {
    setSensors((prev) =>
      prev.map((s) => (s.parcel_id === parcelId ? { ...s, ...patch } : s))
    );
  };

  return (
    <DappContext.Provider value={{
      user, parcels, sensors,
      aiAssessments: DEMO_AI,
      consentRecords: DEMO_CONSENTS,
      verificationRecords: DEMO_VERIFICATION,
      transactions: DEMO_TRANSACTIONS,
      login, logout, switchDemoRole, isLoading,
      updateParcel, updateSensors,
    }}>
      {children}
    </DappContext.Provider>
  );
}

export function useDapp() {
  const ctx = useContext(DappContext);
  if (!ctx) throw new Error("useDapp must be used within DappProvider");
  return ctx;
}
