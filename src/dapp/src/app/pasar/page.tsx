import React, { Suspense } from "react";
import { PasarView } from "@/components/pages/PasarView";

export default function PasarIndexPage() {
  return (
    <Suspense fallback={null}>
      <PasarView />
    </Suspense>
  );
}

