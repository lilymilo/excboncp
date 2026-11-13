import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carbon Screener & Risk Terminal",
  description:
    "Simulasi settlement karbon berbasis status verifikasi, skor risiko, dan persetujuan komunitas.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
