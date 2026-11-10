"use client";

import React, { type ComponentPropsWithoutRef, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface ShimmerButtonProps extends ComponentPropsWithoutRef<"button"> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(
  (
    {
      shimmerColor = "rgba(255, 255, 255, 0.45)",
      shimmerSize = "1.5px",
      shimmerDuration = "3.2s",
      borderRadius = "9999px",
      background = "#18191D",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background,
            borderRadius,
            background,
          } as CSSProperties
        }
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden border border-white/10 px-6 py-3 whitespace-nowrap text-white",
          "transform-gpu transition-all duration-300 ease-out hover:brightness-110 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
        ref={ref}
        {...props}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes magicui-shimmer-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `,
          }}
        />
        {/* Perimeter Shimmer Sweep */}
        <div
          className="pointer-events-none absolute inset-0 -z-20 overflow-hidden"
          style={{ borderRadius }}
        >
          <div
            className="absolute -inset-[100%]"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0 300deg, var(--shimmer-color) 340deg, transparent 360deg)",
              animation: "magicui-shimmer-spin var(--speed) linear infinite",
            }}
          />
        </div>

        {/* Inner Button Surface */}
        <div
          className="pointer-events-none absolute -z-10 transition-colors duration-200"
          style={{
            inset: shimmerSize,
            borderRadius,
            background,
          }}
        />

        {/* Subtle Top Specular Sheen */}
        <div
          className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),inset_0_-6px_12px_rgba(255,255,255,0.06)] group-hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.35),inset_0_-8px_14px_rgba(255,255,255,0.12)] transition-shadow duration-300"
          style={{ borderRadius }}
        />

        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      </button>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton";

