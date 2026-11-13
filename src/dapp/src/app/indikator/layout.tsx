import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Indikator Sistem & Sensor",
  description:
    "Kesehatan node sensor lapangan, ambang indeks kanopi NDVI 0,70, dan kecepatan pemrosesan data.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

