import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Peta Kanopi & Lahan",
  description:
    "Peta interaktif OpenStreetMap dengan batas poligon GeoJSON, status lahan, dan titik sensor lapangan.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

