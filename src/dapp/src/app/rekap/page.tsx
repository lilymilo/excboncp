import React, { Suspense } from "react";
import { RekapView } from "@/components/pages/RekapView";

export default function RekapIndexPage() {
  return (
    <Suspense fallback={null}>
      <RekapView initialPeriod="harian" />
    </Suspense>
  );
}

