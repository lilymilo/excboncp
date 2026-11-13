import React, { Suspense } from "react";
import { RekapView } from "@/components/pages/RekapView";

export default function PortfolioPage() {
  return (
    <Suspense fallback={null}>
      <RekapView initialPeriod="harian" />
    </Suspense>
  );
}
