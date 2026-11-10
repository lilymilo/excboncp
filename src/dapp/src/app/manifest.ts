import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ExcbonCP — Terminal Verifikasi Karbon",
    short_name: "ExcbonCP",
    description:
      "dMRV institusional untuk kondisi hutan: sensor lapangan, citra satelit, dan persetujuan warga dalam satu ledger.",
    start_url: "/app",
    display: "standalone",
    background_color: "#0B0D0C",
    theme_color: "#0B0D0C",
    lang: "id",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
