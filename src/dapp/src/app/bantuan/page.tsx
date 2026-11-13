import React, { Suspense } from "react";
import { BantuanView } from "@/components/pages/BantuanView";

export default function BantuanPage() {
  return (
    <Suspense fallback={null}>
      <BantuanView />
    </Suspense>
  );
}

