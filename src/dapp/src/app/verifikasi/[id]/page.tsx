import React, { Suspense } from "react";
import { VerifikasiView } from "@/components/pages/VerifikasiView";

export default function VerifikasiDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={null}>
      <VerifikasiView initialQueryId={decodeURIComponent(params.id)} />
    </Suspense>
  );
}

