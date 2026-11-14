import type { Metadata, Viewport } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { DappProvider } from "@/context/DappContext";

export const metadata: Metadata = {
  title: {
    default: "ExcbonCP | Verifikasi Kondisi Hutan & Terminal ReFi Karbon",
    template: "%s · ExcbonCP",
  },
  description:
    "Memantau kondisi hutan melalui citra satelit, sensor lapangan, dan persetujuan warga adat. Tersegel secara digital di Base Sepolia EAS dan terbuka untuk siapa saja.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0B0D0C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="min-h-screen bg-[#EEF5EC] font-sans text-[#14261A] antialiased selection:bg-[#2E6B3F]/20 selection:text-[#14261A]">
        <DappProvider>{children}</DappProvider>
      </body>
    </html>
  );
}
