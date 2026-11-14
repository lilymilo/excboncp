// Attestation EAS baru dianggap nyata setelah operator mengaktifkan mode live.
// Tanpa flag ini, UID demo tetap ditampilkan sebagai simulasi dan tidak ditautkan.
export const EAS_LIVE = process.env.NEXT_PUBLIC_EAS_LIVE === "true";

// Default ke Base Sepolia (testnet) tempat EAS ExcbonCP dikunci.
// Bisa dialihkan lewat env tanpa mengubah komponen.
const EAS_EXPLORER_BASE =
  process.env.NEXT_PUBLIC_EAS_EXPLORER?.trim().replace(/\/+$/, "") ||
  "https://base-sepolia.easscan.org/attestation/view";

const TX_EXPLORER_BASE =
  process.env.NEXT_PUBLIC_TX_EXPLORER?.trim().replace(/\/+$/, "") ||
  "https://sepolia.basescan.org/tx";

function normalizeHash(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
}

export function attestationExplorerUrl(uid?: string | null): string | null {
  const hash = normalizeHash(uid);
  return hash ? `${EAS_EXPLORER_BASE}/${hash}` : null;
}

export function txExplorerUrl(hash?: string | null): string | null {
  const normalized = normalizeHash(hash);
  return normalized ? `${TX_EXPLORER_BASE}/${normalized}` : null;
}
