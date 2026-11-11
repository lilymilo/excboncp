import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verifikasi Ledger",
  description: "Pemeriksaan integritas rantai hash dan catatan verifikasi parcel.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
