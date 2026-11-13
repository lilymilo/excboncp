import React, { Suspense } from "react";
import { LangsungView } from "@/components/pages/LangsungView";

export default function ActivityAliasPage() {
  return (
    <Suspense fallback={null}>
      <LangsungView />
    </Suspense>
  );
}
