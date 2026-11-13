import type { VerificationRecord } from "@/context/DappContext";

export type CheckState = "ok" | "warn" | "info";

export interface IntegrityCheck {
  id: string;
  label: string;
  state: CheckState;
  detail: string;
}

const HEX64 = /^[0-9a-f]{64}$/i;
const HEX_TX = /^0x[0-9a-f]{64}$/i;

/**
 * Pemeriksaan lokal atas satu record verifikasi. Tidak memanggil chain —
 * hanya memvalidasi bentuk hash dan tautan prev_hash terhadap record lain
 * yang tersedia di dataset demo.
 */
export function runIntegrityChecks(
  record: VerificationRecord,
  all: VerificationRecord[]
): IntegrityCheck[] {
  const checks: IntegrityCheck[] = [
    {
      id: "hash-format",
      label: "Format block hash",
      state: HEX64.test(record.hash) ? "ok" : "warn",
      detail:
        record.hash.length === 64
          ? "64 karakter heksadesimal."
          : `Panjang ${record.hash.length} karakter, seharusnya 64.`,
    },
    {
      id: "prev-format",
      label: "Format prev_hash",
      state: HEX64.test(record.prev_hash) ? "ok" : "warn",
      detail:
        record.prev_hash.length === 64
          ? "64 karakter heksadesimal."
          : `Panjang ${record.prev_hash.length} karakter, seharusnya 64.`,
    },
    {
      id: "hash-diff",
      label: "Hash tidak menunjuk dirinya sendiri",
      state: record.hash !== record.prev_hash ? "ok" : "warn",
      detail:
        record.hash !== record.prev_hash
          ? "Nilai hash dan prev_hash berbeda."
          : "Hash identik dengan prev_hash.",
    },
    {
      id: "tamper-flag",
      label: "Penanda integritas",
      state: record.tampered ? "warn" : "ok",
      detail: record.tampered
        ? "Record ditandai tampered oleh sistem pemantau."
        : "Tidak ada penanda tampered.",
    },
    {
      id: "reasons",
      label: "Alasan penolakan",
      state: record.reasons.length === 0 ? "ok" : "warn",
      detail:
        record.reasons.length === 0
          ? "Tidak ada alasan penolakan tercatat."
          : record.reasons.join("; "),
    },
    {
      id: "eas-uid",
      label: "Format EAS UID",
      state: HEX_TX.test(record.eas_uid) ? "ok" : "warn",
      detail: HEX_TX.test(record.eas_uid)
        ? "0x diikuti 64 karakter heksadesimal."
        : "UID tidak sesuai format attestation 32 byte.",
    },
    {
      id: "tx-hash",
      label: "Format hash transaksi",
      state: HEX_TX.test(record.tx_hash) ? "ok" : "warn",
      detail: HEX_TX.test(record.tx_hash)
        ? "0x diikuti 64 karakter heksadesimal."
        : "Hash transaksi tidak sesuai format 32 byte.",
    },
  ];

  const previous = all.find((item) => item.block_index === record.block_index - 1);
  if (previous) {
    checks.push({
      id: "prev-link",
      label: `Tautan ke blok #${previous.block_index}`,
      state: record.prev_hash === previous.hash ? "ok" : "warn",
      detail:
        record.prev_hash === previous.hash
          ? "prev_hash cocok dengan block hash blok sebelumnya."
          : "prev_hash tidak cocok dengan block hash blok sebelumnya.",
    });
  } else if (record.block_index > 1) {
    checks.push({
      id: "prev-link",
      label: `Tautan ke blok #${record.block_index - 1}`,
      state: "info",
      detail: "Blok sebelumnya tidak ada di dataset demo, jadi tautan tidak bisa dibuktikan dari sini.",
    });
  }

  return checks;
}

export function summarizeChecks(checks: IntegrityCheck[]) {
  return {
    ok: checks.filter((item) => item.state === "ok").length,
    warn: checks.filter((item) => item.state === "warn").length,
    info: checks.filter((item) => item.state === "info").length,
  };
}
