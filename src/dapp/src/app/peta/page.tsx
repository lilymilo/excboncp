import React, { Suspense } from "react";
import { PetaView } from "@/components/pages/PetaView";

export default function PetaIndexPage() {
  return (
    <Suspense fallback={null}>
      <PetaView />
    </Suspense>
  );
}

