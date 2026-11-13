import React, { Suspense } from "react";
import { TinjauView } from "@/components/pages/TinjauView";

export default function TinjauPage() {
  return (
    <Suspense fallback={null}>
      <TinjauView />
    </Suspense>
  );
}

