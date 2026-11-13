import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio Karbon",
  description: "Kepemilikan unit karbon terverifikasi, alokasi hasil 60/40, dan bukti attestation.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

