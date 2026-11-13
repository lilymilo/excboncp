"use client";

import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type SheetSide = "center" | "right" | "bottom";

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: SheetSide;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  hideClose?: boolean;
}

/**
 * Focus-trapped overlay built on Radix Dialog so Esc, focus restore and
 * aria wiring come for free. Only the presentation is ours.
 */
export function Sheet({
  open,
  onOpenChange,
  side = "center",
  title,
  description,
  children,
  className,
  hideClose = false,
}: SheetProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="xbm-sheet-scrim" />
        <DialogPrimitive.Content
          className={cn("xbm-sheet-content", className)}
          data-side={side}
        >
          {side === "bottom" ? <div className="xbm-sheet-handle" aria-hidden="true" /> : null}
          <div className="mb-3 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <DialogPrimitive.Title className="text-base font-semibold text-[var(--ink)]">
                {title}
              </DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="mt-1 text-sm text-[var(--ink-muted)]">
                  {description}
                </DialogPrimitive.Description>
              ) : null}
            </div>
            {hideClose ? null : (
              <DialogPrimitive.Close
                className="xbm-pressable -mr-1 -mt-1 grid h-8 w-8 flex-none place-items-center rounded-full text-[var(--ink-muted)] hover:bg-[var(--surface-soft)]"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </DialogPrimitive.Close>
            )}
          </div>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
