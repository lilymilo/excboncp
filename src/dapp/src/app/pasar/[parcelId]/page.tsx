import React, { Suspense } from "react";
import { PasarView } from "@/components/pages/PasarView";

export default function PasarParcelPage({ params }: { params: { parcelId: string } }) {
  return (
    <Suspense fallback={null}>
      <PasarView initialParcelId={decodeURIComponent(params.parcelId)} />
    </Suspense>
  );
}

