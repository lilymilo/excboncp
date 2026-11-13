import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rekap Laporan Harian, Mingguan, dan Bulanan",
  description:
    "Laporan ekspor CSV dan rekap pendapatan simulasi harian, mingguan, dan bulanan dalam WIB.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

