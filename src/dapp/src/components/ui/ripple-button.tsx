"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { cn } from "@/lib/utils";

interface RippleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  rippleColor?: string;
  duration?: string;
  loading?: boolean;
}

type RippleItem = {
  x: number;
  y: number;
  size: number;
  key: number;
};

function ButtonRipple({
  ripple,
  duration,
  rippleColor,
  onDone,
}: {
  ripple: RippleItem;
  duration: string;
  rippleColor: string;
  onDone: (key: number) => void;
}) {
  useEffect(() => {
    const timeout = setTimeout(
      () => {
        onDone(ripple.key);
      },
      parseInt(duration, 10)
    );

    return () => {
      clearTimeout(timeout);
    };
  }, [duration, onDone, ripple.key]);

  return (
    <span
      className="pointer-events-none absolute rounded-full opacity-35"
      style={{
        width: `${ripple.size}px`,
        height: `${ripple.size}px`,
        top: `${ripple.y}px`,
        left: `${ripple.x}px`,
        backgroundColor: rippleColor,
        transform: "scale(0)",
        animation: `magicui-ripple ${duration} var(--ease-out) forwards`,
      }}
    />
  );
}

export const RippleButton = React.forwardRef<
  HTMLButtonElement,
  RippleButtonProps
>(
  (
    {
      className,
      children,
      rippleColor = "rgba(174, 218, 45, 0.35)",
      duration = "420ms",
      loading = false,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const [buttonRipples, setButtonRipples] = useState<Array<RippleItem>>([]);
    const nextKeyRef = useRef(0);

    const removeRipple = useCallback((key: number) => {
      setButtonRipples((prevRipples) =>
        prevRipples.filter((ripple) => ripple.key !== key)
      );
    }, []);

    const createRipple = (event: MouseEvent<HTMLButtonElement>) => {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.35;
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      nextKeyRef.current += 1;
      const newRipple = { x, y, size, key: nextKeyRef.current };
      setButtonRipples((prevRipples) => [...prevRipples, newRipple]);
    };

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      createRipple(event);
      onClick?.(event);
    };

    return (
      <button
        data-loading={loading ? "true" : undefined}
        aria-busy={loading || undefined}
        disabled={disabled || loading}
        className={cn(
          "xbm-button relative inline-flex min-h-[44px] cursor-pointer items-center justify-center overflow-hidden text-center disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
        onClick={handleClick}
        ref={ref}
        {...props}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `@keyframes magicui-ripple { to { transform: scale(2.4); opacity: 0; } }`,
          }}
        />
        <span className="relative z-10 flex items-center justify-center gap-2 w-full">
          {children}
        </span>
        <span className="pointer-events-none absolute inset-0">
          {buttonRipples.map((ripple) => (
            <ButtonRipple
              key={ripple.key}
              duration={duration}
              onDone={removeRipple}
              ripple={ripple}
              rippleColor={rippleColor}
            />
          ))}
        </span>
      </button>
    );
  }
);

RippleButton.displayName = "RippleButton";
