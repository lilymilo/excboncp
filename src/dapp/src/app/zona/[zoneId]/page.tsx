import React, { Suspense } from "react";
import { ZonaView } from "@/components/pages/ZonaView";

export default function ZonaDetailPage({ params }: { params: { zoneId: string } }) {
  return (
    <Suspense fallback={null}>
      <ZonaView initialZoneId={decodeURIComponent(params.zoneId)} />
    </Suspense>
  );
}

