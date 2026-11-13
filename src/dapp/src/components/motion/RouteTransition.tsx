"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface RouteTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Keys the wrapper on the current route so the entrance keyframe replays on
 * navigation without a full page reload. CSS-driven, so reduced motion is free.
 */
export function RouteTransition({ children, className }: RouteTransitionProps) {
  const pathname = usePathname();
  return (
    <div key={pathname} className={cn("xbm-route", className)}>
      {children}
    </div>
  );
}
