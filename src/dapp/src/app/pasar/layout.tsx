import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pasar Simulasi Karbon",
  description:
    "Simulasi alokasi unit karbon pada jaringan uji coba dengan blokir otomatis bila izin dicabut atau lahan bermasalah.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

