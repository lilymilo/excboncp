import React, { Suspense } from "react";
import { LangsungView } from "@/components/pages/LangsungView";

export default function LangsungPage() {
  return (
    <Suspense fallback={null}>
      <LangsungView />
    </Suspense>
  );
}

