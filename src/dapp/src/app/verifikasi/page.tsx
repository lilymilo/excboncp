import React, { Suspense } from "react";
import { VerifikasiView } from "@/components/pages/VerifikasiView";

export default function VerifikasiIndexPage() {
  return (
    <Suspense fallback={null}>
      <VerifikasiView />
    </Suspense>
  );
}

