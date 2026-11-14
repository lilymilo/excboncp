"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cx } from "@/components/dapp/phantom-ui";

type PageItem = number | "ellipsis";

function pageWindow(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: PageItem[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) items.push("ellipsis");
  for (let index = start; index <= end; index += 1) items.push(index);
  if (end < totalPages - 1) items.push("ellipsis");
  items.push(totalPages);

  return items;
}

interface PaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  label?: string;
  className?: string;
}

export function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  label = "Navigasi halaman",
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalPages <= 1) return null;

  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(totalItems, safePage * pageSize);
  const items = pageWindow(safePage, totalPages);

  const goTo = (next: number) => {
    const clamped = Math.min(Math.max(1, next), totalPages);
    if (clamped !== safePage) onPageChange(clamped);
  };

  return (
    <nav
      aria-label={label}
      className={cx(
        "flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-[var(--line-subtle)] pt-3",
        className
      )}
    >
      <p className="xb-numeric text-[12.5px] font-medium text-[var(--ink-muted)]">
        Menampilkan{" "}
        <span className="font-semibold text-[var(--ink)]">
          {start}–{end}
        </span>{" "}
        dari {totalItems}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => goTo(safePage - 1)}
          disabled={safePage === 1}
          aria-label="Halaman sebelumnya"
          className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] transition hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="hidden items-center gap-1 sm:flex">
          {items.map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                aria-hidden="true"
                className="px-1 text-[12.5px] font-semibold text-[var(--ink-dim)]"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => goTo(item)}
                aria-current={item === safePage ? "page" : undefined}
                aria-label={`Halaman ${item}`}
                className={cx(
                  "grid h-10 min-w-10 place-items-center rounded-full border px-2 text-[13px] font-semibold transition",
                  item === safePage
                    ? "border-[var(--forest-700)] bg-[var(--forest-700)] text-white shadow-sm"
                    : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-soft)]"
                )}
              >
                {item}
              </button>
            )
          )}
        </div>

        <span className="xb-numeric text-[12.5px] font-semibold text-[var(--ink-muted)] sm:hidden">
          Hal {safePage}/{totalPages}
        </span>

        <button
          type="button"
          onClick={() => goTo(safePage + 1)}
          disabled={safePage === totalPages}
          aria-label="Halaman berikutnya"
          className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] transition hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
