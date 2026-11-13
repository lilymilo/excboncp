import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Screener Lahan & Unit",
  description: "Pantau ketersediaan unit serapan karbon, nilai simulasi, dan status segel tiap lahan.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

