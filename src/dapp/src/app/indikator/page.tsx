import React, { Suspense } from "react";
import { IndikatorView } from "@/components/pages/IndikatorView";

export default function IndikatorPage() {
  return (
    <Suspense fallback={null}>
      <IndikatorView />
    </Suspense>
  );
}

