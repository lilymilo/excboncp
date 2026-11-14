"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import {
  PRICE_PER_TON,
  calculateSettlement,
  useDapp,
  type ConsentRecord,
  type ConsentStatus,
  type ParcelItem,
  type Transaction as TransactionRecord,
  type VerificationRecord,
} from "@/context/DappContext";

export interface ExtendedVerificationRecord extends VerificationRecord {
  approved_by: string;
}

export interface DashboardActivityEvent {
  id: string;
  category: "market" | "verification" | "consent" | "sensor";
  title: string;
  description: string;
  parcelId?: string;
  timestamp: string;
  refHash?: string;
  tone: "green" | "lavender" | "warning" | "error";
}

interface StoredOverrides {
  orders: TransactionRecord[];
  consumedUnitsByParcel: Record<string, number>;
  consentOverrides: Record<string, ConsentRecord>;
  verificationReviewOverrides: Record<
    string,
    { decision: "verified" | "flagged"; reviewer: string; note: string; reviewedAt: string }
  >;
  extraEvents: DashboardActivityEvent[];
}

const STORAGE_KEY = "excboncp_dashboard_sim_v1";

const EMPTY_OVERRIDES: StoredOverrides = {
  orders: [],
  consumedUnitsByParcel: {},
  consentOverrides: {},
  verificationReviewOverrides: {},
  extraEvents: [],
};

let cachedState: StoredOverrides = EMPTY_OVERRIDES;
let hydrated = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((cb) => cb());
}

function saveState(next: StoredOverrides) {
  cachedState = next;
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors in sandbox browsers
    }
  }
  notify();
}

function hydrateFromStorage() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<StoredOverrides>;
    cachedState = {
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      consumedUnitsByParcel: parsed.consumedUnitsByParcel ?? {},
      consentOverrides: parsed.consentOverrides ?? {},
      verificationReviewOverrides: parsed.verificationReviewOverrides ?? {},
      extraEvents: Array.isArray(parsed.extraEvents) ? parsed.extraEvents : [],
    };
    notify();
  } catch {
    cachedState = EMPTY_OVERRIDES;
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot(): StoredOverrides {
  return cachedState;
}

function getServerSnapshot(): StoredOverrides {
  return EMPTY_OVERRIDES;
}

export function useDashboardState() {
  const dapp = useDapp();
  const overrides = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    hydrateFromStorage();
  }, []);

  const consentRecords = useMemo<ConsentRecord[]>(() => {
    const baseMap = new Map(dapp.consentRecords.map((item) => [item.parcel_id, item]));
    Object.values(overrides.consentOverrides).forEach((override) => {
      baseMap.set(override.parcel_id, override);
    });
    return dapp.parcels.map((parcel) => {
      const existing = baseMap.get(parcel.id);
      if (existing) return existing;
      return {
        parcel_id: parcel.id,
        community: parcel.community,
        status: "none",
        granted_by: "-",
        timestamp: parcel.lastUpdate,
        receipt_id: "",
      };
    });
  }, [dapp.consentRecords, dapp.parcels, overrides.consentOverrides]);

  const verificationRecords = useMemo<ExtendedVerificationRecord[]>(() => {
    return dapp.verificationRecords.map((record) => {
      const rev = overrides.verificationReviewOverrides[record.record_id];
      if (!rev) {
        return {
          ...record,
          approved_by: record.reasons.length === 0 && !record.tampered ? "Auditor MRV (Base Sepolia)" : "Menunggu Audit",
        };
      }
      if (rev.decision === "flagged") {
        return {
          ...record,
          reasons: record.reasons.length > 0 ? record.reasons : [rev.note || "Ditandai untuk tinjauan ulang"],
          approved_by: `${rev.reviewer} (Ditinjau)`,
        };
      }
      return {
        ...record,
        reasons: [],
        approved_by: rev.reviewer,
      };
    });
  }, [dapp.verificationRecords, overrides.verificationReviewOverrides]);

  const parcels = useMemo<ParcelItem[]>(() => {
    return dapp.parcels.map((parcel) => {
      const consumed = overrides.consumedUnitsByParcel[parcel.id] ?? 0;
      const consent = consentRecords.find((item) => item.parcel_id === parcel.id);
      const consentBlocked = consent ? consent.status !== "granted" : false;

      // Also check if auditor approved a non-verified parcel in sandbox review
      const parcelRecord = verificationRecords.find((item) => item.parcel_id === parcel.id);
      const review = parcelRecord
        ? overrides.verificationReviewOverrides[parcelRecord.record_id]
        : undefined;

      let nextStatus = parcel.verificationStatus;
      if (consentBlocked && parcel.verificationStatus === "verified") {
        nextStatus = "blocked";
      } else if (!consentBlocked && review?.decision === "verified" && parcel.verificationStatus !== "verified") {
        nextStatus = "verified";
      } else if (review?.decision === "flagged") {
        nextStatus = "warning";
      }

      const rawAvailable =
        nextStatus === "verified" && !consentBlocked
          ? Math.max(0, (parcel.availableUnits > 0 ? parcel.availableUnits : Math.floor(parcel.carbonStock * 0.1)) - consumed)
          : 0;

      const nextFrozen =
        nextStatus === "verified" && !consentBlocked
          ? parcel.frozenUnits
          : Math.max(parcel.frozenUnits, Math.floor(parcel.carbonStock * 0.1));

      return {
        ...parcel,
        verificationStatus: nextStatus,
        eligibility: nextStatus === "verified" && !consentBlocked && rawAvailable > 0,
        availableUnits: rawAvailable,
        frozenUnits: nextFrozen,
        settlementEstimateIdr: rawAvailable * PRICE_PER_TON,
      };
    });
  }, [consentRecords, dapp.parcels, overrides.consumedUnitsByParcel, overrides.verificationReviewOverrides, verificationRecords]);

  const transactions = useMemo<TransactionRecord[]>(() => {
    return [...overrides.orders, ...dapp.transactions];
  }, [dapp.transactions, overrides.orders]);

  const activities = useMemo<DashboardActivityEvent[]>(() => {
    const derived: DashboardActivityEvent[] = [];

    transactions.forEach((tx) => {
      derived.push({
        id: `tx-${tx.tx_id}`,
        category: "market",
        title: `Pembelian ${tx.volume_tco2e} tCO₂e · ${tx.parcel_id}`,
        description: `Settlement simulasi ke kas komunitas 60% & operasi 40% (fee sandbox 2%).`,
        parcelId: tx.parcel_id,
        timestamp: tx.timestamp,
        refHash: tx.tx_id,
        tone: "green",
      });
    });

    verificationRecords.forEach((rec) => {
      derived.push({
        id: `ver-${rec.record_id}`,
        category: "verification",
        title: `Blok Ledger #${rec.block_index} · ${rec.parcel_id}`,
        description:
          rec.reasons.length > 0
            ? `Peringatan: ${rec.reasons.join("; ")}`
            : "Rantai SHA-256 cocok; status attestation EAS mengikuti konfigurasi jaringan.",
        parcelId: rec.parcel_id,
        timestamp: rec.timestamp,
        refHash: rec.eas_uid || rec.hash,
        tone: rec.tampered || rec.reasons.length > 0 ? "warning" : "lavender",
      });
    });

    consentRecords.forEach((rec) => {
      derived.push({
        id: `consent-${rec.parcel_id}-${rec.timestamp}`,
        category: "consent",
        title:
          rec.status === "granted"
            ? `Izin FPIC Aktif · ${rec.parcel_id}`
            : rec.status === "revoked"
              ? `Izin FPIC Dicabut · ${rec.parcel_id}`
              : `Menunggu Izin Komunitas · ${rec.parcel_id}`,
        description:
          rec.status === "granted"
            ? `${rec.community} menyetujui perdagangan unit (tanda terima ${rec.receipt_id || "tercatat"}).`
            : `${rec.community} belum mengaktifkan persetujuan; unit parcel terkunci.`,
        parcelId: rec.parcel_id,
        timestamp: rec.timestamp,
        refHash: rec.receipt_id || undefined,
        tone: rec.status === "granted" ? "green" : "error",
      });
    });

    dapp.sensors
      .filter((s) => s.anomaly || s.flameDetected)
      .forEach((s) => {
        derived.push({
          id: `sensor-${s.sensor_id}-${s.timestamp}`,
          category: "sensor",
          title: `Anomali Sensor ${s.sensor_id} · ${s.parcel_id}`,
          description: s.flameDetected
            ? "Deteksi api aktif dari node IoT. Unit dibekukan otomatis."
            : `Suhu ${s.temperature.toFixed(1)}°C / kelembapan tanah ${s.soil_moisture}% di luar ambang normal.`,
          parcelId: s.parcel_id,
          timestamp: s.timestamp,
          tone: "warning",
        });
      });

    const combined = [...overrides.extraEvents, ...derived];
    return combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [consentRecords, dapp.sensors, overrides.extraEvents, transactions, verificationRecords]);

  const submitCarbonOrder = (
    parcelId: string,
    volume: number
  ): { ok: boolean; message: string; tx?: TransactionRecord } => {
    const parcel = parcels.find((item) => item.id === parcelId);
    const consent = consentRecords.find((item) => item.parcel_id === parcelId);
    if (!parcel) {
      return { ok: false, message: "Parcel tidak ditemukan." };
    }
    if (parcel.verificationStatus !== "verified" || !parcel.eligibility) {
      return {
        ok: false,
        message: `Parcel ${parcel.id} berstatus ${parcel.verificationStatus.toUpperCase()}. Hanya lahan TERVERIFIKASI yang bisa dibeli.`,
      };
    }
    if (consent?.status !== "granted") {
      return {
        ok: false,
        message: "Izin komunitas (FPIC) belum aktif. Order ditolak oleh aturan sistem.",
      };
    }
    if (!Number.isFinite(volume) || volume <= 0) {
      return { ok: false, message: "Masukkan jumlah unit tCO₂e lebih besar dari 0." };
    }
    if (volume > parcel.availableUnits) {
      return {
        ok: false,
        message: `Jumlah melebihi kuota tersedia (${parcel.availableUnits} tCO₂e).`,
      };
    }

    const gross = volume * PRICE_PER_TON;
    const settlement = calculateSettlement(gross);
    const now = new Date().toISOString();
    const tx: TransactionRecord = {
      tx_id: `SIM-${Date.now().toString(36).toUpperCase()}`,
      parcel_id: parcel.id,
      buyer_id: dapp.user?.email ?? "sim@excboncp.test",
      timestamp: now,
      volume_tco2e: volume,
      gross_amount_idr: settlement.gross_idr,
      mrv_allocation_idr: settlement.sandbox_fee_idr,
      community_allocation_idr: settlement.community_idr,
      manager_allocation_idr: settlement.operations_idr,
      status: "settled",
    };

    const next: StoredOverrides = {
      ...cachedState,
      orders: [tx, ...cachedState.orders],
      consumedUnitsByParcel: {
        ...cachedState.consumedUnitsByParcel,
        [parcel.id]: (cachedState.consumedUnitsByParcel[parcel.id] ?? 0) + volume,
      },
      extraEvents: [
        {
          id: `order-${tx.tx_id}`,
          category: "market",
          title: `Order Simulasi ${volume} tCO₂e Berhasil`,
          description: `Dibeli oleh ${dapp.user?.name ?? "Akun Demo"} · Net Rp ${new Intl.NumberFormat("id-ID").format(settlement.net_idr)}.`,
          parcelId: parcel.id,
          timestamp: now,
          refHash: tx.tx_id,
          tone: "green",
        },
        ...cachedState.extraEvents,
      ],
    };

    saveState(next);
    return { ok: true, message: "Order simulasi tercatat di ledger testnet.", tx };
  };

  const toggleConsentDecision = (
    parcelId: string,
    nextStatus: ConsentStatus
  ): { ok: boolean; message: string } => {
    if (dapp.user?.role !== "community") {
      return {
        ok: false,
        message: "Hanya akun peran Komunitas yang berhak memberi atau mencabut persetujuan warga.",
      };
    }
    const existing = consentRecords.find((item) => item.parcel_id === parcelId);
    const parcel = parcels.find((item) => item.id === parcelId);
    const now = new Date().toISOString();
    const record: ConsentRecord = {
      parcel_id: parcelId,
      community: existing?.community ?? parcel?.community ?? "Komunitas Hutan",
      status: nextStatus,
      granted_by: dapp.user.name,
      timestamp: now,
      receipt_id:
        nextStatus === "granted"
          ? existing?.receipt_id || `FPIC-${parcelId}-${Date.now().toString().slice(-4)}`
          : existing?.receipt_id || `REVOKE-${Date.now().toString().slice(-4)}`,
    };

    saveState({
      ...cachedState,
      consentOverrides: {
        ...cachedState.consentOverrides,
        [parcelId]: record,
      },
      extraEvents: [
        {
          id: `fpic-${parcelId}-${Date.now()}`,
          category: "consent",
          title:
            nextStatus === "granted"
              ? `Hak Persetujuan Diaktifkan · ${parcelId}`
              : `Hak Veto Digunakan · ${parcelId}`,
          description:
            nextStatus === "granted"
              ? `Izin warga tercatat atas nama ${record.community}.`
              : `Izin dicabut oleh ${dapp.user.name}. Perdagangan unit dibekukan.`,
          parcelId,
          timestamp: now,
          refHash: record.receipt_id,
          tone: nextStatus === "granted" ? "green" : "error",
        },
        ...cachedState.extraEvents,
      ],
    });

    return {
      ok: true,
      message:
        nextStatus === "granted"
          ? `Persetujuan ${parcelId} diaktifkan (${record.receipt_id}).`
          : `Hak veto aktif: ${parcelId} dibekukan dari pasar.`,
    };
  };

  const reviewVerification = (
    recordId: string,
    decision: "verified" | "flagged",
    note: string
  ): { ok: boolean; message: string } => {
    if (dapp.user?.role !== "auditor") {
      return { ok: false, message: "Hanya peran Auditor MRV yang dapat menerbitkan keputusan segel." };
    }
    const target = verificationRecords.find((item) => item.record_id === recordId);
    if (!target) return { ok: false, message: "Record tidak ditemukan." };
    const now = new Date().toISOString();

    saveState({
      ...cachedState,
      verificationReviewOverrides: {
        ...cachedState.verificationReviewOverrides,
        [recordId]: {
          decision,
          reviewer: dapp.user.name,
          note: note.trim(),
          reviewedAt: now,
        },
      },
      extraEvents: [
        {
          id: `audit-${recordId}-${Date.now()}`,
          category: "verification",
          title:
            decision === "verified"
              ? `Audit Disahkan · ${target.parcel_id}`
              : `Audit Ditahan · ${target.parcel_id}`,
          description:
            note.trim() ||
            (decision === "verified"
              ? `Auditor ${dapp.user.name} menyegel bukti blok #${target.block_index}.`
              : `Auditor ${dapp.user.name} meminta verifikasi tambahan.`),
          parcelId: target.parcel_id,
          timestamp: now,
          refHash: target.eas_uid || target.hash,
          tone: decision === "verified" ? "lavender" : "warning",
        },
        ...cachedState.extraEvents,
      ],
    });

    return {
      ok: true,
      message:
        decision === "verified"
          ? `Segel auditor #${target.block_index} (${target.parcel_id}) tercatat.`
          : `Record #${target.block_index} ditandai untuk pemeriksaan lanjutan.`,
    };
  };

  const resetSimulation = () => {
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
    saveState(EMPTY_OVERRIDES);
  };

  return {
    ...dapp,
    parcels,
    consentRecords,
    verificationRecords,
    transactions,
    activities,
    overrides,
    submitCarbonOrder,
    toggleConsentDecision,
    reviewVerification,
    resetSimulation,
  };
}
