import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tinjau Bukti Auditor",
  description:
    "Antrean peninjauan sensor, satelit, izin warga, dan rantai hash untuk pengesahan oleh Auditor MRV.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

