import React, { Suspense } from "react";
import { ScreenerView } from "@/components/pages/ScreenerView";

export default function ScreenerPage() {
  return (
    <Suspense fallback={null}>
      <ScreenerView />
    </Suspense>
  );
}

