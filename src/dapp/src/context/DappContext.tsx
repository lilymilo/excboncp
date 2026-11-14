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
    lastUpdate: "2026-11-13T10:05:00Z",
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
    lastUpdate: "2026-11-13T09:15:00Z",
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
  {
    id: "PARCEL-C",
    name: "Hutan Lindung Sentul Blok C",
    area: 145,
    carbonStock: 1980,
    verificationStatus: "verified",
    lastUpdate: "2026-11-13T09:48:00Z",
    community: "KTH Rimba Sentul",
    region: "Sentul, Bogor",
    eligibility: true,
    frozenUnits: 0,
    availableUnits: 198,
    ndvi: 0.81,
    sar: 0.62,
    sensors: ["S-004"],
    consentStatus: "granted",
    settlementEstimateIdr: 29700000,
  },
  {
    id: "PARCEL-D",
    name: "Sabuk Penyangga Industri Blok D",
    area: 110,
    carbonStock: 1420,
    verificationStatus: "dispute",
    lastUpdate: "2026-11-13T08:50:00Z",
    community: "Masyarakat Adat Ciptagelar",
    region: "Cijeruk, Bogor",
    eligibility: false,
    frozenUnits: 65,
    availableUnits: 0,
    ndvi: 0.69,
    sar: 0.68,
    sensors: ["S-005"],
    consentStatus: "none",
    settlementEstimateIdr: 0,
  },
  {
    id: "PARCEL-E",
    name: "Kawasan Energi Hijau Blok E",
    area: 175,
    carbonStock: 2680,
    verificationStatus: "verified",
    lastUpdate: "2026-11-13T10:02:00Z",
    community: "Koperasi Hijau Citeureup",
    region: "Citeureup, Bogor",
    eligibility: true,
    frozenUnits: 12,
    availableUnits: 165,
    ndvi: 0.76,
    sar: 0.66,
    sensors: ["S-006"],
    consentStatus: "granted",
    settlementEstimateIdr: 24750000,
  },
  {
    id: "PARCEL-F",
    name: "Koridor Hutan Kota Blok F",
    area: 132,
    carbonStock: 1840,
    verificationStatus: "verified",
    lastUpdate: "2026-11-13T10:08:00Z",
    community: "Forum Warga Sabuk Hijau Kota",
    region: "Cibinong, Bogor",
    eligibility: true,
    frozenUnits: 8,
    availableUnits: 128,
    ndvi: 0.79,
    sar: 0.64,
    sensors: ["S-007"],
    consentStatus: "granted",
    settlementEstimateIdr: 19200000,
  },
  {
    id: "PARCEL-G",
    name: "Kawasan Industri Hijau IKN Ring 2",
    area: 240,
    carbonStock: 3120,
    verificationStatus: "verified",
    lastUpdate: "2026-11-13T10:18:00Z",
    community: "Koperasi Warga Penajam",
    region: "Penajam Paser Utara, Kalimantan Timur",
    eligibility: true,
    frozenUnits: 18,
    availableUnits: 210,
    ndvi: 0.74,
    sar: 0.65,
    sensors: ["S-008"],
    consentStatus: "granted",
    settlementEstimateIdr: 31500000,
  },
  {
    id: "PARCEL-H",
    name: "Sabuk Dekarbonisasi KEK Sei Mangkei",
    area: 310,
    carbonStock: 4260,
    verificationStatus: "warning",
    lastUpdate: "2026-11-13T10:20:00Z",
    community: "Koperasi Bukit Hijau Simalungun",
    region: "Simalungun, Sumatera Utara",
    eligibility: true,
    frozenUnits: 46,
    availableUnits: 150,
    ndvi: 0.71,
    sar: 0.63,
    sensors: ["S-009"],
    consentStatus: "granted",
    settlementEstimateIdr: 22500000,
  },
  {
    id: "PARCEL-I",
    name: "Buffer Hijau Kawasan Industri Kendal",
    area: 185,
    carbonStock: 2380,
    verificationStatus: "verified",
    lastUpdate: "2026-11-13T10:22:00Z",
    community: "Paguyuban Tani Kendal",
    region: "Kendal, Jawa Tengah",
    eligibility: true,
    frozenUnits: 10,
    availableUnits: 160,
    ndvi: 0.73,
    sar: 0.66,
    sensors: ["S-010"],
    consentStatus: "granted",
    settlementEstimateIdr: 24000000,
  },
  {
    id: "PARCEL-J",
    name: "IKN Smart City — Sumbu Kebangsaan",
    area: 96,
    carbonStock: 1180,
    verificationStatus: "verified",
    lastUpdate: "2026-11-13T10:24:00Z",
    community: "Forum Warga Kota Nusantara",
    region: "Nusantara, Kalimantan Timur",
    eligibility: true,
    frozenUnits: 0,
    availableUnits: 118,
    ndvi: 0.8,
    sar: 0.67,
    sensors: ["S-011"],
    consentStatus: "granted",
    settlementEstimateIdr: 17700000,
  },
  {
    id: "PARCEL-K",
    name: "TOD Balikpapan — Kanopi Hijau",
    area: 70,
    carbonStock: 940,
    verificationStatus: "verified",
    lastUpdate: "2026-11-13T10:26:00Z",
    community: "Komunitas Hijau Balikpapan",
    region: "Balikpapan, Kalimantan Timur",
    eligibility: true,
    frozenUnits: 6,
    availableUnits: 94,
    ndvi: 0.77,
    sar: 0.64,
    sensors: ["S-012"],
    consentStatus: "granted",
    settlementEstimateIdr: 14100000,
  },
  {
    id: "PARCEL-L",
    name: "Hutan Kota IKN Ring 1",
    area: 128,
    carbonStock: 1620,
    verificationStatus: "warning",
    lastUpdate: "2026-11-13T10:28:00Z",
    community: "Forum Warga Kota Nusantara",
    region: "Nusantara, Kalimantan Timur",
    eligibility: true,
    frozenUnits: 22,
    availableUnits: 100,
    ndvi: 0.72,
    sar: 0.62,
    sensors: ["S-013"],
    consentStatus: "granted",
    settlementEstimateIdr: 15000000,
  },
];

export const DEMO_SENSORS: SensorData[] = [
  {
    sensor_id: "S-001", parcel_id: "PARCEL-A", type: "DHT22",
    temperature: 27.4, humidity: 76, soil_moisture: 58,
    co2e_tonPerDay: 0.023, timestamp: "2026-11-13T10:14:00Z",
    anomaly: false, flameDetected: false,
  },
  {
    sensor_id: "S-002", parcel_id: "PARCEL-A", type: "DHT22",
    temperature: 28.1, humidity: 74, soil_moisture: 55,
    co2e_tonPerDay: 0.021, timestamp: "2026-11-13T10:15:00Z",
    anomaly: false, flameDetected: false,
  },
  {
    sensor_id: "S-003", parcel_id: "PARCEL-B", type: "DHT22+KY026",
    temperature: 43.2, humidity: 42, soil_moisture: 22,
    co2e_tonPerDay: 0.045, timestamp: "2026-11-13T09:15:00Z",
    anomaly: true, flameDetected: true,
  },
  {
    sensor_id: "S-004", parcel_id: "PARCEL-C", type: "DHT22",
    temperature: 26.2, humidity: 81, soil_moisture: 64,
    co2e_tonPerDay: 0.026, timestamp: "2026-11-13T10:12:00Z",
    anomaly: false, flameDetected: false,
  },
  {
    sensor_id: "S-005", parcel_id: "PARCEL-D", type: "DHT22+Soil",
    temperature: 29.8, humidity: 68, soil_moisture: 44,
    co2e_tonPerDay: 0.019, timestamp: "2026-11-13T09:55:00Z",
    anomaly: true, flameDetected: false,
  },
  {
    sensor_id: "S-006", parcel_id: "PARCEL-E", type: "DHT22",
    temperature: 27.9, humidity: 73, soil_moisture: 57,
    co2e_tonPerDay: 0.024, timestamp: "2026-11-13T10:11:00Z",
    anomaly: false, flameDetected: false,
  },
  {
    sensor_id: "S-007", parcel_id: "PARCEL-F", type: "DHT22",
    temperature: 26.8, humidity: 78, soil_moisture: 61,
    co2e_tonPerDay: 0.022, timestamp: "2026-11-13T10:13:00Z",
    anomaly: false, flameDetected: false,
  },
  {
    sensor_id: "S-008", parcel_id: "PARCEL-G", type: "DHT22+Soil",
    temperature: 28.4, humidity: 71, soil_moisture: 52,
    co2e_tonPerDay: 0.026, timestamp: "2026-11-13T10:18:00Z",
    anomaly: false, flameDetected: false,
  },
  {
    sensor_id: "S-009", parcel_id: "PARCEL-H", type: "DHT22+Soil",
    temperature: 30.1, humidity: 66, soil_moisture: 41,
    co2e_tonPerDay: 0.031, timestamp: "2026-11-13T10:20:00Z",
    anomaly: true, flameDetected: false,
  },
  {
    sensor_id: "S-010", parcel_id: "PARCEL-I", type: "DHT22",
    temperature: 27.6, humidity: 74, soil_moisture: 56,
    co2e_tonPerDay: 0.022, timestamp: "2026-11-13T10:22:00Z",
    anomaly: false, flameDetected: false,
  },
  {
    sensor_id: "S-011", parcel_id: "PARCEL-J", type: "DHT22",
    temperature: 26.9, humidity: 77, soil_moisture: 59,
    co2e_tonPerDay: 0.02, timestamp: "2026-11-13T10:24:00Z",
    anomaly: false, flameDetected: false,
  },
  {
    sensor_id: "S-012", parcel_id: "PARCEL-K", type: "DHT22",
    temperature: 27.2, humidity: 75, soil_moisture: 57,
    co2e_tonPerDay: 0.021, timestamp: "2026-11-13T10:26:00Z",
    anomaly: false, flameDetected: false,
  },
  {
    sensor_id: "S-013", parcel_id: "PARCEL-L", type: "DHT22+KY026",
    temperature: 29.2, humidity: 69, soil_moisture: 45,
    co2e_tonPerDay: 0.028, timestamp: "2026-11-13T10:28:00Z",
    anomaly: true, flameDetected: false,
  },
];

export const DEMO_AI: AIAssessment[] = [
  {
    parcel_id: "PARCEL-A",
    ai1_summary: "Vegetasi dalam kondisi baik. NDVI 0.78 menunjukkan tutupan kanopi yang sehat. Tidak ada anomali terdeteksi dari data sensor S-001 dan S-002.",
    ai2_anomaly: "normal",
    ai2_score: 0.12,
    evidence: ["S-001", "S-002", "NDVI-20261113"],
    timestamp: "2026-11-13T10:00:00Z",
    status: "passed",
  },
  {
    parcel_id: "PARCEL-B",
    ai1_summary: "Terdeteksi kondisi suhu tinggi dan sensor api aktif pada S-003. Suhu 43.2°C jauh di atas ambang normal. Kelembaban tanah turun ke 22%.",
    ai2_anomaly: "fire_risk",
    ai2_score: 0.87,
    evidence: ["S-003", "NDVI-20261113"],
    timestamp: "2026-11-13T09:20:00Z",
    status: "failed",
  },
  {
    parcel_id: "PARCEL-C",
    ai1_summary: "Tutupan kanopi rapat dengan NDVI 0.81 dan kelembaban tanah stabil 64% pada sensor S-004. Memenuhi syarat penuh pencatatan unit karbon.",
    ai2_anomaly: "normal",
    ai2_score: 0.09,
    evidence: ["S-004", "NDVI-20261113"],
    timestamp: "2026-11-13T09:50:00Z",
    status: "passed",
  },
  {
    parcel_id: "PARCEL-D",
    ai1_summary: "Terdapat catatan keberatan batas wilayah dari warga sekitar dan fluktuasi kelembaban tanah pada S-005. Unit ditahan sementara hingga musyawarah selesai.",
    ai2_anomaly: "boundary_review",
    ai2_score: 0.54,
    evidence: ["S-005", "CONSENT-004"],
    timestamp: "2026-11-13T08:55:00Z",
    status: "failed",
  },
  {
    parcel_id: "PARCEL-E",
    ai1_summary: "Sabuk penyangga emisi industri stabil dengan NDVI 0.76 dan pembacaan S-006 normal. Kuota siap dialokasikan ke koridor Kawasan Ekonomi Khusus.",
    ai2_anomaly: "normal",
    ai2_score: 0.14,
    evidence: ["S-006", "NDVI-20261113"],
    timestamp: "2026-11-13T10:01:00Z",
    status: "passed",
  },
  {
    parcel_id: "PARCEL-F",
    ai1_summary: "Koridor hutan kota menjaga suhu mikro-iklim 26.8°C dengan NDVI 0.79. Seluruh telemetri S-007 dan izin warga aktif.",
    ai2_anomaly: "normal",
    ai2_score: 0.11,
    evidence: ["S-007", "NDVI-20261113"],
    timestamp: "2026-11-13T10:06:00Z",
    status: "passed",
  },
  {
    parcel_id: "PARCEL-G",
    ai1_summary: "Sabuk industri hijau IKN Ring 2 stabil dengan NDVI 0.74 dan pembacaan S-008 normal. Alokasi karbon siap untuk koridor Kawasan Inti Pusat Pemerintahan.",
    ai2_anomaly: "normal",
    ai2_score: 0.13,
    evidence: ["S-008", "NDVI-20261113"],
    timestamp: "2026-11-13T10:18:00Z",
    status: "passed",
  },
  {
    parcel_id: "PARCEL-H",
    ai1_summary: "Suhu permukaan 30.1°C dan kelembaban tanah 41% pada S-009 menandakan tekanan panas di sabuk Sei Mangkei. Alokasi dibatasi sampai pembacaan kembali normal.",
    ai2_anomaly: "heat_stress",
    ai2_score: 0.61,
    evidence: ["S-009", "NDVI-20261113"],
    timestamp: "2026-11-13T10:21:00Z",
    status: "failed",
  },
  {
    parcel_id: "PARCEL-I",
    ai1_summary: "Buffer hijau Kawasan Industri Kendal sehat dengan NDVI 0.73 dan S-010 normal. Serapan karbon konsisten pada koridor pabrik sisi utara.",
    ai2_anomaly: "normal",
    ai2_score: 0.12,
    evidence: ["S-010", "NDVI-20261113"],
    timestamp: "2026-11-13T10:22:00Z",
    status: "passed",
  },
  {
    parcel_id: "PARCEL-J",
    ai1_summary: "Koridor Sumbu Kebangsaan IKN mencatat NDVI 0.8 dan suhu mikro 26.9°C. Kanopi kota menyerap panas dengan baik sepanjang jalur pejalan kaki.",
    ai2_anomaly: "normal",
    ai2_score: 0.08,
    evidence: ["S-011", "NDVI-20261113"],
    timestamp: "2026-11-13T10:24:00Z",
    status: "passed",
  },
  {
    parcel_id: "PARCEL-K",
    ai1_summary: "Kanopi TOD Balikpapan stabil dengan NDVI 0.77. Telemetri S-012 normal dan cocok untuk penghijauan simpul transportasi.",
    ai2_anomaly: "normal",
    ai2_score: 0.1,
    evidence: ["S-012", "NDVI-20261113"],
    timestamp: "2026-11-13T10:26:00Z",
    status: "passed",
  },
  {
    parcel_id: "PARCEL-L",
    ai1_summary: "Kelembaban tanah Hutan Kota IKN Ring 1 turun ke 45% pada S-013 dan NDVI 0.72. Perlu penyiraman terjadwal sebelum status kembali hijau.",
    ai2_anomaly: "dry_soil",
    ai2_score: 0.58,
    evidence: ["S-013", "NDVI-20261113"],
    timestamp: "2026-11-13T10:28:00Z",
    status: "failed",
  },
];

export const DEMO_CONSENTS: ConsentRecord[] = [
  {
    parcel_id: "PARCEL-A", community: "Komunitas Adat Bogor",
    status: "granted", granted_by: "komunitas.a@demo.excboncp.test",
    timestamp: "2026-11-10T07:00:00Z", receipt_id: "CONSENT-001",
  },
  {
    parcel_id: "PARCEL-B", community: "Yayasan Hutan Lestari",
    status: "granted", granted_by: "komunitas.b@demo.excboncp.test",
    timestamp: "2026-11-11T09:00:00Z", receipt_id: "CONSENT-002",
  },
  {
    parcel_id: "PARCEL-C", community: "KTH Rimba Sentul",
    status: "granted", granted_by: "komunitas.a@demo.excboncp.test",
    timestamp: "2026-11-12T08:15:00Z", receipt_id: "CONSENT-003",
  },
  {
    parcel_id: "PARCEL-D", community: "Masyarakat Adat Ciptagelar",
    status: "none", granted_by: "komunitas.b@demo.excboncp.test",
    timestamp: "2026-11-12T14:20:00Z", receipt_id: "CONSENT-004",
  },
  {
    parcel_id: "PARCEL-E", community: "Koperasi Hijau Citeureup",
    status: "granted", granted_by: "komunitas.b@demo.excboncp.test",
    timestamp: "2026-11-12T16:00:00Z", receipt_id: "CONSENT-005",
  },
  {
    parcel_id: "PARCEL-F", community: "Forum Warga Sabuk Hijau Kota",
    status: "granted", granted_by: "komunitas.a@demo.excboncp.test",
    timestamp: "2026-11-12T17:30:00Z", receipt_id: "CONSENT-006",
  },
  {
    parcel_id: "PARCEL-G", community: "Koperasi Warga Penajam",
    status: "granted", granted_by: "komunitas.a@demo.excboncp.test",
    timestamp: "2026-11-13T06:10:00Z", receipt_id: "CONSENT-007",
  },
  {
    parcel_id: "PARCEL-H", community: "Koperasi Bukit Hijau Simalungun",
    status: "granted", granted_by: "komunitas.b@demo.excboncp.test",
    timestamp: "2026-11-13T06:25:00Z", receipt_id: "CONSENT-008",
  },
  {
    parcel_id: "PARCEL-I", community: "Paguyuban Tani Kendal",
    status: "granted", granted_by: "komunitas.a@demo.excboncp.test",
    timestamp: "2026-11-13T06:40:00Z", receipt_id: "CONSENT-009",
  },
  {
    parcel_id: "PARCEL-J", community: "Forum Warga Kota Nusantara",
    status: "granted", granted_by: "komunitas.a@demo.excboncp.test",
    timestamp: "2026-11-13T06:55:00Z", receipt_id: "CONSENT-010",
  },
  {
    parcel_id: "PARCEL-K", community: "Komunitas Hijau Balikpapan",
    status: "granted", granted_by: "komunitas.b@demo.excboncp.test",
    timestamp: "2026-11-13T07:10:00Z", receipt_id: "CONSENT-011",
  },
  {
    parcel_id: "PARCEL-L", community: "Forum Warga Kota Nusantara",
    status: "granted", granted_by: "komunitas.a@demo.excboncp.test",
    timestamp: "2026-11-13T07:25:00Z", receipt_id: "CONSENT-012",
  },
];

export const DEMO_VERIFICATION: VerificationRecord[] = [
  {
    record_id: "VR-007",
    parcel_id: "PARCEL-L",
    block_index: 1253,
    hash: "9222100615365925b880eaccb97dfa856110d27a3fc9bd767803c1bc99e8615b",
    prev_hash: "67af78f91339f824f121b48cdb5e02d657b72f3cae4dec4849727e7ca0d5fa8a",
    timestamp: "2026-11-13T10:28:00Z",
    eas_uid: "0x97972ac6ffaefba33b44cfb0821b472cc7b0259562a3a41a98b778d9ae0f7d5b",
    tx_hash: "0xb928cbce7fe46ee8754cf0fc52587e7c8535e5455c97a588d3914d1179d163c1",
    tampered: false,
    reasons: [],
  },
  {
    record_id: "VR-008",
    parcel_id: "PARCEL-K",
    block_index: 1252,
    hash: "67af78f91339f824f121b48cdb5e02d657b72f3cae4dec4849727e7ca0d5fa8a",
    prev_hash: "6a5a8a881359cf2035193fe864699f9c81e4ee4768c4dbfeed31e401e64e26fb",
    timestamp: "2026-11-13T10:26:00Z",
    eas_uid: "0xa8823ba8c827ed956621d950b0229b704a3a2237c9c1e9e301665a64f13f34ce",
    tx_hash: "0xf2028980142ad9baf2c6ec733472742ed8de99726517a5fd211774ebabc7a966",
    tampered: false,
    reasons: [],
  },
  {
    record_id: "VR-009",
    parcel_id: "PARCEL-J",
    block_index: 1251,
    hash: "6a5a8a881359cf2035193fe864699f9c81e4ee4768c4dbfeed31e401e64e26fb",
    prev_hash: "2c584cfd7def52fc895edc5b8a0fea70211eceab208b2d485566fad301a1249c",
    timestamp: "2026-11-13T10:24:00Z",
    eas_uid: "0x4dd19e43246b07c338218864cc2ffdd196fe07bebd4a29fab0f9e8611f14ef83",
    tx_hash: "0x781b9f366feba08cfd10ef81eeb76547b7781b4c80c9d98af89b9d1383728175",
    tampered: false,
    reasons: [],
  },
  {
    record_id: "VR-010",
    parcel_id: "PARCEL-I",
    block_index: 1250,
    hash: "2c584cfd7def52fc895edc5b8a0fea70211eceab208b2d485566fad301a1249c",
    prev_hash: "9d0e48cfb4bfbfd93de008e70da1348687398e59b9f1144ee339ec52bbd8eb5c",
    timestamp: "2026-11-13T10:22:00Z",
    eas_uid: "0x801f5858f619792ee662fcfc7b510f3acc20b27baa6aed4a6c9a07815889e193",
    tx_hash: "0x5eca78610492198f7036be56ec40383d998c43f422ebc29f56639eab2e460e13",
    tampered: false,
    reasons: [],
  },
  {
    record_id: "VR-011",
    parcel_id: "PARCEL-H",
    block_index: 1249,
    hash: "9d0e48cfb4bfbfd93de008e70da1348687398e59b9f1144ee339ec52bbd8eb5c",
    prev_hash: "899c5399e870e9f81307722b13ae5c991fb80e47af027ae9353811a7401eb233",
    timestamp: "2026-11-13T10:20:00Z",
    eas_uid: "0xaef87c9efc7861ea136dae6246a46feb3983b3f28b9f871dadc73851481e0c20",
    tx_hash: "0x7b63fade16073ed79a51a82251f708f6f3fb93c6556ef7927be1985009540d37",
    tampered: false,
    reasons: [],
  },
  {
    record_id: "VR-012",
    parcel_id: "PARCEL-G",
    block_index: 1248,
    hash: "899c5399e870e9f81307722b13ae5c991fb80e47af027ae9353811a7401eb233",
    prev_hash: "b1c5e2f5d149df4a2075dc8e80c2cffd0f562b8126b9f23d05391c28b7e4cda4",
    timestamp: "2026-11-13T10:18:00Z",
    eas_uid: "0x6cc4a96b534e7d6e521a190f07a49a03b17ca9294aa5bae0994c944b54bd3d5d",
    tx_hash: "0x9eca908fb3e0c3963b1089d5b66fbb702121371d7b0a9c0ddc4823d8780da4b9",
    tampered: false,
    reasons: [],
  },
  {
    record_id: "VR-001",
    parcel_id: "PARCEL-A",
    block_index: 1247,
    hash: "b1c5e2f5d149df4a2075dc8e80c2cffd0f562b8126b9f23d05391c28b7e4cda4",
    prev_hash: "96e6dc168710b79d6fb86f666b2afbc2a9af09eba1c40a835de410e15dc2f797",
    timestamp: "2026-11-13T10:05:00Z",
    eas_uid: "0x7a8fc2d1e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
    tx_hash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    tampered: false,
    reasons: [],
  },
  {
    record_id: "VR-002",
    parcel_id: "PARCEL-C",
    block_index: 1246,
    hash: "96e6dc168710b79d6fb86f666b2afbc2a9af09eba1c40a835de410e15dc2f797",
    prev_hash: "00eeeac3fd736d485d8e8ae7e94255df03ab2366f9ca9a33b71c04506722f0c0",
    timestamp: "2026-11-13T10:00:00Z",
    eas_uid: "0x4e9bc2d1a3f5e7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7",
    tx_hash: "0x8f2e4d6c8a0b2d4f6e8a0c2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a",
    tampered: false,
    reasons: [],
  },
  {
    record_id: "VR-003",
    parcel_id: "PARCEL-B",
    block_index: 1245,
    hash: "00eeeac3fd736d485d8e8ae7e94255df03ab2366f9ca9a33b71c04506722f0c0",
    prev_hash: "f4e601e83e394dfa0c3d609215b1c5e648822a6bc3795651af33a8d095dcf625",
    timestamp: "2026-11-13T09:58:00Z",
    eas_uid: "0x9c3a8f12b4d6e8f0a2c4e6a8b0d2f4a6c8e0b2d4f6a8c0e2b4d6f8a0c2e4b6d8",
    tx_hash: "0x5d7f9a1b3c5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a",
    tampered: false,
    reasons: [],
  },
  {
    record_id: "VR-004",
    parcel_id: "PARCEL-A",
    block_index: 1244,
    hash: "f4e601e83e394dfa0c3d609215b1c5e648822a6bc3795651af33a8d095dcf625",
    prev_hash: "909d5fa752cd763b921b86303e00a3617b2c9d0376cb01d231c3d0cdaa6efa71",
    timestamp: "2026-11-13T09:55:00Z",
    eas_uid: "0x2f1d7a4eb6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0",
    tx_hash: "0x3a5c7e9f1b3d5f7a9c1e3a5b7d9f1b3c5e7a9c1d3f5b7d9e1a3c5e7f9b1d3f5a",
    tampered: false,
    reasons: [],
  },
  {
    record_id: "VR-005",
    parcel_id: "PARCEL-E",
    block_index: 1243,
    hash: "909d5fa752cd763b921b86303e00a3617b2c9d0376cb01d231c3d0cdaa6efa71",
    prev_hash: "7250ce1bf3cf874e95ecaca6bbaf9a8376f53a08c1efe4185bb7d72806dd46e0",
    timestamp: "2026-11-13T09:50:00Z",
    eas_uid: "0x6d4b2f8a1c3e5a7b9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9c1e3b5d7f9a1c3e5b",
    tx_hash: "0x7c9e1a3b5d7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b",
    tampered: false,
    reasons: [],
  },
  {
    record_id: "VR-006",
    parcel_id: "PARCEL-F",
    block_index: 1242,
    hash: "7250ce1bf3cf874e95ecaca6bbaf9a8376f53a08c1efe4185bb7d72806dd46e0",
    prev_hash: "8a2b6c0d4e8f2a6b0c4d8e2f6a0b4c8d2e6f0a4b8c2d6e0f4a8b2c6d0e4f8a2b",
    timestamp: "2026-11-13T09:40:00Z",
    eas_uid: "0x8b2d4f6a8c0e2a4b6d8f0a2c4e6b8d0f2a4c6e8b0d2f4a6c8e0b2d4f6a8c0e2d",
    tx_hash: "0x2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f",
    tampered: false,
    reasons: [],
  },
];

export const DEMO_TRANSACTIONS: Transaction[] = [
  {
    tx_id: "TX-009",
    parcel_id: "PARCEL-G",
    buyer_id: "u5",
    volume_tco2e: 14,
    gross_amount_idr: 2100000,
    community_allocation_idr: 1234800,
    manager_allocation_idr: 823200,
    mrv_allocation_idr: 42000,
    timestamp: "2026-11-13T09:40:00Z",
    status: "completed",
  },
  {
    tx_id: "TX-010",
    parcel_id: "PARCEL-H",
    buyer_id: "u3",
    volume_tco2e: 11,
    gross_amount_idr: 1650000,
    community_allocation_idr: 970200,
    manager_allocation_idr: 646800,
    mrv_allocation_idr: 33000,
    timestamp: "2026-11-13T09:40:00Z",
    status: "completed",
  },
  {
    tx_id: "TX-011",
    parcel_id: "PARCEL-I",
    buyer_id: "u5",
    volume_tco2e: 9,
    gross_amount_idr: 1350000,
    community_allocation_idr: 793800,
    manager_allocation_idr: 529200,
    mrv_allocation_idr: 27000,
    timestamp: "2026-11-13T09:40:00Z",
    status: "completed",
  },
  {
    tx_id: "TX-012",
    parcel_id: "PARCEL-J",
    buyer_id: "u3",
    volume_tco2e: 6,
    gross_amount_idr: 900000,
    community_allocation_idr: 529200,
    manager_allocation_idr: 352800,
    mrv_allocation_idr: 18000,
    timestamp: "2026-11-13T09:40:00Z",
    status: "completed",
  },
  {
    tx_id: "TX-013",
    parcel_id: "PARCEL-K",
    buyer_id: "u5",
    volume_tco2e: 5,
    gross_amount_idr: 750000,
    community_allocation_idr: 441000,
    manager_allocation_idr: 294000,
    mrv_allocation_idr: 15000,
    timestamp: "2026-11-13T09:40:00Z",
    status: "completed",
  },
  {
    tx_id: "TX-014",
    parcel_id: "PARCEL-L",
    buyer_id: "u3",
    volume_tco2e: 4,
    gross_amount_idr: 600000,
    community_allocation_idr: 352800,
    manager_allocation_idr: 235200,
    mrv_allocation_idr: 12000,
    timestamp: "2026-11-13T09:40:00Z",
    status: "completed",
  },
  {
    tx_id: "TX-001",
    parcel_id: "PARCEL-A",
    buyer_id: "u5",
    volume_tco2e: 10,
    gross_amount_idr: 1500000,
    community_allocation_idr: 882000,
    manager_allocation_idr: 588000,
    mrv_allocation_idr: 30000,
    timestamp: "2026-11-13T09:40:00Z",
    status: "completed",
  },
  {
    tx_id: "TX-002",
    parcel_id: "PARCEL-C",
    buyer_id: "u5",
    volume_tco2e: 8,
    gross_amount_idr: 1200000,
    community_allocation_idr: 705600,
    manager_allocation_idr: 470400,
    mrv_allocation_idr: 24000,
    timestamp: "2026-11-13T09:40:00Z",
    status: "completed",
  },
  {
    tx_id: "TX-003",
    parcel_id: "PARCEL-A",
    buyer_id: "u3",
    volume_tco2e: 5,
    gross_amount_idr: 750000,
    community_allocation_idr: 441000,
    manager_allocation_idr: 294000,
    mrv_allocation_idr: 15000,
    timestamp: "2026-11-13T09:40:00Z",
    status: "completed",
  },
  {
    tx_id: "TX-004",
    parcel_id: "PARCEL-C",
    buyer_id: "u5",
    volume_tco2e: 12,
    gross_amount_idr: 1800000,
    community_allocation_idr: 1058400,
    manager_allocation_idr: 705600,
    mrv_allocation_idr: 36000,
    timestamp: "2026-11-13T09:40:00Z",
    status: "completed",
  },
  {
    tx_id: "TX-005",
    parcel_id: "PARCEL-A",
    buyer_id: "u5",
    volume_tco2e: 6,
    gross_amount_idr: 900000,
    community_allocation_idr: 529200,
    manager_allocation_idr: 352800,
    mrv_allocation_idr: 18000,
    timestamp: "2026-11-13T09:40:00Z",
    status: "completed",
  },
  {
    tx_id: "TX-006",
    parcel_id: "PARCEL-C",
    buyer_id: "u3",
    volume_tco2e: 4,
    gross_amount_idr: 600000,
    community_allocation_idr: 352800,
    manager_allocation_idr: 235200,
    mrv_allocation_idr: 12000,
    timestamp: "2026-11-13T09:40:00Z",
    status: "completed",
  },
  {
    tx_id: "TX-007",
    parcel_id: "PARCEL-E",
    buyer_id: "u5",
    volume_tco2e: 9,
    gross_amount_idr: 1350000,
    community_allocation_idr: 793800,
    manager_allocation_idr: 529200,
    mrv_allocation_idr: 27000,
    timestamp: "2026-11-13T09:40:00Z",
    status: "completed",
  },
  {
    tx_id: "TX-008",
    parcel_id: "PARCEL-F",
    buyer_id: "u3",
    volume_tco2e: 7,
    gross_amount_idr: 1050000,
    community_allocation_idr: 617400,
    manager_allocation_idr: 411600,
    mrv_allocation_idr: 21000,
    timestamp: "2026-11-13T09:40:00Z",
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

const DEFAULT_DEMO_USER: User = {
  id: "u3",
  email: "pengelola.a@demo.excboncp.test",
  name: "Ahmad Fauzi",
  role: "manager",
};

export function DappProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(DEFAULT_DEMO_USER);
  const [isLoading, setIsLoading] = useState(false);
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

  useEffect(() => {
    const timer = setInterval(() => {
      const nowIso = new Date().toISOString();
      setSensors((prev) =>
        prev.map((s) => {
          if (s.flameDetected) return s;
          const nextTemp = Math.round(Math.max(22, Math.min(33, s.temperature + (Math.random() - 0.48) * 0.3)) * 10) / 10;
          const nextHum = Math.round(Math.max(54, Math.min(92, s.humidity + (Math.random() - 0.5) * 1.4)));
          const nextSoil = Math.round(Math.max(38, Math.min(82, s.soil_moisture + (Math.random() - 0.5) * 1.2)));
          const nextCo2e = Math.round(Math.max(0.012, Math.min(0.038, s.co2e_tonPerDay + (Math.random() - 0.5) * 0.002)) * 1000) / 1000;
          return {
            ...s,
            temperature: nextTemp,
            humidity: nextHum,
            soil_moisture: nextSoil,
            co2e_tonPerDay: nextCo2e,
            timestamp: nowIso,
          };
        })
      );
    }, 4000);
    return () => clearInterval(timer);
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
    setUser(GUEST_USER);
    localStorage.setItem("excboncp_user", JSON.stringify(GUEST_USER));
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
