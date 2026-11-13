"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  axis?: "y" | "x" | "none";
  once?: boolean;
}

/** Scroll-triggered entrance. Opacity + transform only; skipped for reduced motion via CSS. */
export function Reveal({
  children,
  className,
  delay = 0,
  axis = "y",
  once = true,
  style,
  ...rest
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      className={cn("xbm-reveal", className)}
      data-visible={visible ? "true" : "false"}
      data-axis={axis}
      style={{ ...style, ["--reveal-delay" as string]: `${delay}ms` }}
      {...rest}
    >
      {children}
    </div>
  );
}
