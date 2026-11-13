import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit Trail",
  description: "Jejak audit lengkap untuk seluruh catatan verifikasi dan transaksi simulasi.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
