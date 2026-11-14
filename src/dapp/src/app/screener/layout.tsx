import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pasar Karbon — Screener Ekosistem",
  description:
    "Screener pasar karbon lintas ekosistem: jatah tersedia, market cap simulasi, dan segel audit per lahan.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

