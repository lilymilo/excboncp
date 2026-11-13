import React, { Suspense } from "react";
import { TinjauView } from "@/components/pages/TinjauView";

export default function ApprovePage() {
  return (
    <Suspense fallback={null}>
      <TinjauView />
    </Suspense>
  );
}
