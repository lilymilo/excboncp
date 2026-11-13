"use client";

import React from "react";
import { AppShell } from "@/components/dapp/AppShell";
import { DashboardOverview } from "@/components/dapp/DashboardOverview";

export default function AppDashboardPage() {
  return (
    <AppShell>
      <DashboardOverview />
    </AppShell>
  );
}
