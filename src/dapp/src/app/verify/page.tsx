import React, { Suspense } from "react";
import { VerifikasiView } from "@/components/pages/VerifikasiView";

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifikasiView />
    </Suspense>
  );
}
