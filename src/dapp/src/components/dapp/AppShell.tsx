"use client";

import React from "react";
import { BotanicalAppShell } from "./BotanicalAppShell";

/**
 * Satu-satunya shell untuk seluruh rute aplikasi.
 * Sebelumnya rute di luar /app memakai shell gelap tanpa sidebar sehingga lebar
 * kanvas dan navigasi berbeda antar halaman; sekarang semuanya lewat
 * BotanicalAppShell supaya kerangka, lebar, dan ritme halaman seragam.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return <BotanicalAppShell>{children}</BotanicalAppShell>;
}
