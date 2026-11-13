import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verifikasi Segel & Rantai Hash",
  description:
    "Pemeriksaan publik keaslian hash SHA-256 dan penguncian EAS Base Sepolia testnet.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

