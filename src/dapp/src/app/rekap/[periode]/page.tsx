import React, { Suspense } from "react";
import { RekapView } from "@/components/pages/RekapView";

export default function RekapPeriodPage({ params }: { params: { periode: string } }) {
  return (
    <Suspense fallback={null}>
      <RekapView initialPeriod={decodeURIComponent(params.periode)} />
    </Suspense>
  );
}

