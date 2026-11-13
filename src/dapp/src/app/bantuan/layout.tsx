import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bantuan & Panduan",
  description:
    "Panduan langkah demi langkah mengenai pemantauan hutan EXBON CP, peran pengguna, status lahan, dan verifikasi segel.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

