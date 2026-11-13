import React, { Suspense } from "react";
import { IzinView } from "@/components/pages/IzinView";

export default function ConsentPage() {
  return (
    <Suspense fallback={null}>
      <IzinView />
    </Suspense>
  );
}
