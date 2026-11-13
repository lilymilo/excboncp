import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transaksi Langsung Simulasi",
  description: "Umpan langsung catatan transaksi simulasi, kondisi pasar, dan pembaruan sensor lapangan.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

