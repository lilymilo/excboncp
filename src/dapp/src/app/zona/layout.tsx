import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zona & Pembagian Hasil",
  description:
    "Detail zona proyek, cakupan lahan terverifikasi, dan catatan pembagian hasil simulasi 60/40.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

