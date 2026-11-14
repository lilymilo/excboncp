"use client";

import React, { type ComponentPropsWithoutRef, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface ShimmerButtonProps extends ComponentPropsWithoutRef<"button"> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(
  (
    {
      shimmerColor = "rgba(255, 255, 255, 0.55)",
      shimmerSize = "1.5px",
      shimmerDuration = "2.8s",
      borderRadius = "var(--radius-pill)",
      background = "var(--color-accent)",
      loading = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        data-loading={loading ? "true" : undefined}
        aria-busy={loading || undefined}
        disabled={disabled || loading}
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
          "xbm-button xbm-button-primary group relative z-0 inline-flex min-h-[44px] cursor-pointer items-center justify-center overflow-hidden border border-white/15 px-6 py-2.5 whitespace-nowrap text-[var(--color-text-on-accent)] font-semibold shadow-[var(--shadow-button-rest)]",
          "transform-gpu disabled:cursor-not-allowed disabled:opacity-60",
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
          className="pointer-events-none absolute -z-10"
          style={{
            inset: shimmerSize,
            borderRadius,
            background,
          }}
        />

        {/* Subtle Top Specular Sheen */}
        <div
          className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),inset_0_-6px_12px_rgba(255,255,255,0.08)]"
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
