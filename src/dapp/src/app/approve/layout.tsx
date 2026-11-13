import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Approval Auditor",
  description: "Antrean tinjauan auditor atas parcel yang menunggu keputusan verifikasi.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
