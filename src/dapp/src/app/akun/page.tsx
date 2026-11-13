import React, { Suspense } from "react";
import { AkunView } from "@/components/pages/AkunView";

export default function AkunPage() {
  return (
    <Suspense fallback={null}>
      <AkunView />
    </Suspense>
  );
}

