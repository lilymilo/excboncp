import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Peta Kanopi & Parcel",
  description:
    "Peta interaktif batas parcel hutan Bogor dengan status verifikasi dan titik sensor lapangan.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
