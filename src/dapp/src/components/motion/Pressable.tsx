"use client";

import React from "react";
import { cn } from "@/lib/utils";

type PressableOwnProps = {
  children: React.ReactNode;
  className?: string;
};

type PressableAsButton = PressableOwnProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & {
    as?: "button";
  };

type PressableAsAnchor = PressableOwnProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className"> & {
    as: "a";
    href: string;
  };

export type PressableProps = PressableAsButton | PressableAsAnchor;

/**
 * Interaction shell for anything clickable. Owns the press scale and focus ring
 * so pages never hand-roll :active states.
 */
export function Pressable(props: PressableProps) {
  const { children, className, as = "button", ...rest } = props as PressableAsAnchor & {
    as?: "button" | "a";
  };
  const shared = cn("xbm-pressable", className);

  if (as === "a") {
    return (
      <a className={shared} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  return (
    <button className={shared} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
