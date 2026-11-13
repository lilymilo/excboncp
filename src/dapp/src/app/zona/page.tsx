import React, { Suspense } from "react";
import { ZonaView } from "@/components/pages/ZonaView";

export default function ZonaIndexPage() {
  return (
    <Suspense fallback={null}>
      <ZonaView />
    </Suspense>
  );
}

