import React, { Suspense } from "react";
import { IzinView } from "@/components/pages/IzinView";

export default function IzinIndexPage() {
  return (
    <Suspense fallback={null}>
      <IzinView />
    </Suspense>
  );
}

