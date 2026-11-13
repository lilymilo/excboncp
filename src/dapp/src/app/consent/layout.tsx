import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Persetujuan Komunitas",
  description: "Rekam jejak persetujuan warga adat untuk setiap parcel yang dipantau.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
