import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activity Log",
  description: "Linimasa kronologis order karbon, attestation EAS, persetujuan FPIC, dan alert sensor IoT.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

