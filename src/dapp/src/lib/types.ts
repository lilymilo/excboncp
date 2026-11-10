export type ParcelStatus = "VERIFIED" | "WARNING" | "DISPUTE" | "BLOCKED";

export type ConsentStatus = "granted" | "none" | "revoked";

export interface SensorTelemetry {
  deviceId: string;
  timestamp: string;
  tempC: number;
  humidityPct: number;
  flame: number; // 0: safe, 1: flame detected
  soilPct: number;
}

export interface SatelliteObservation {
  polygonId: string;
  date: string;
  ndviMean: number;
  sarVvDb: number;
}

export interface Parcel {
  id: string;
  name: string;
  location: string;
  areaHa: number;
  carbonUnits: number;
  status: ParcelStatus;
  statusLabel: string;
  consent: ConsentStatus;
  consentBy?: string;
  telemetry: SensorTelemetry;
  satellite: SatelliteObservation;
  digitalSeal: {
    hash: string;
    prevHash: string;
    easUid?: string;
    approvedBy?: string;
    timestamp: string;
  };
}

export interface EconomicSettleResult {
  unitsSold: number;
  pricePerUnitIdr: number;
  grossRevenueIdr: number;
  operationalFeeIdr: number; // 2%
  communityShareIdr: number; // 60% of net
  managerShareIdr: number; // 40% of net
}

