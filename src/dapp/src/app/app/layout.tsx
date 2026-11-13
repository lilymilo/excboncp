import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Operasional",
  description:
    "Ringkasan kondisi hutan, telemetri sensor lapangan, dan status verifikasi seluruh parcel.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
