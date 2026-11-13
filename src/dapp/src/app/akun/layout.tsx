import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Akun & Peran Sesi",
  description:
    "Informasi akun aktif, cakupan lahan dan zona, pergantian peran uji coba, serta keluar sesi dengan konfirmasi.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

