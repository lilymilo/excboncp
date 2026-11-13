import React, { Suspense } from "react";
import { IzinView } from "@/components/pages/IzinView";

export default function IzinParcelPage({ params }: { params: { parcelId: string } }) {
  return (
    <Suspense fallback={null}>
      <IzinView initialParcelId={decodeURIComponent(params.parcelId)} />
    </Suspense>
  );
}

