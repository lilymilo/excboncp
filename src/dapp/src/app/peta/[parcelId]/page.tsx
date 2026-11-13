import React, { Suspense } from "react";
import { PetaView } from "@/components/pages/PetaView";

export default function PetaParcelPage({ params }: { params: { parcelId: string } }) {
  return (
    <Suspense fallback={null}>
      <PetaView initialParcelId={decodeURIComponent(params.parcelId)} />
    </Suspense>
  );
}

