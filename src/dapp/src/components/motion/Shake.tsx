"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ShakeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Flip the value to retrigger the animation. */
  trigger: unknown;
}

/** Restarts the shake keyframe whenever `trigger` changes. Used for rejected actions. */
export function Shake({ children, className, trigger, ...rest }: ShakeProps) {
  const [active, setActive] = React.useState(false);
  const firstRun = React.useRef(true);

  React.useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setActive(false);
    const start = requestAnimationFrame(() => setActive(true));
    const stop = window.setTimeout(() => setActive(false), 320);
    return () => {
      cancelAnimationFrame(start);
      window.clearTimeout(stop);
    };
  }, [trigger]);

  return (
    <div className={cn(active && "xbm-shake", className)} {...rest}>
      {children}
    </div>
  );
}
