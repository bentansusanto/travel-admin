"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight
} from "@tabler/icons-react";
import React, { useMemo } from "react";

export interface TablePaginationProps {
  /** Current active page (1-indexed) */
  currentPage: number;
  /** Number of items per page */
  pageSize: number;
  /** Total count of items matching the filter */
  totalItems: number;
  /** Callback when page is changed (returns 1-indexed page number) */
  onPageChange: (page: number) => void;
  /** Callback when page size is changed */
  onPageSizeChange?: (pageSize: number) => void;
  /** Available page size choices (defaults to [5, 10, 20, 50]) */
  pageSizeOptions?: number[];
  /** Label for the item type being paginated (e.g. "packages", "orders", "permissions", "users") */
  itemName?: string;
  /** Custom outer container className */
  className?: string;
}

export function TablePagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  itemName = "entries",
  className
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  // Generate pagination buttons with smart ellipsis
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (safeCurrentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }
    if (safeCurrentPage >= totalPages - 2) {
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, "...", totalPages];
  }, [safeCurrentPage, totalPages]);

  if (totalItems <= 0) return null;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 border-t border-slate-100 bg-slate-50/50",
        className
      )}>
      {/* Left: Entries Info */}
      <div className="text-xs text-slate-500">
        Showing <strong className="text-slate-900 font-semibold">{totalItems === 0 ? 0 : startIndex + 1}</strong> to{" "}
        <strong className="text-slate-900 font-semibold">{endIndex}</strong> of{" "}
        <strong className="text-slate-900 font-semibold">{totalItems}</strong> {itemName}
      </div>

      {/* Right: Rows per page & Navigation Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                onPageSizeChange(Number(val));
                onPageChange(1);
              }}>
              <SelectTrigger className="h-8 w-16 text-xs bg-white border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((opt) => (
                  <SelectItem key={opt} value={String(opt)} className="text-xs">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-1">
          {/* First Page */}
          <Button
            variant="outline"
            size="icon"
            className="size-8 text-slate-600 bg-white hover:bg-slate-100 disabled:opacity-40"
            onClick={() => onPageChange(1)}
            disabled={safeCurrentPage <= 1}
            title="First Page">
            <IconChevronsLeft className="size-4" />
          </Button>

          {/* Prev Page */}
          <Button
            variant="outline"
            size="icon"
            className="size-8 text-slate-600 bg-white hover:bg-slate-100 disabled:opacity-40"
            onClick={() => onPageChange(Math.max(1, safeCurrentPage - 1))}
            disabled={safeCurrentPage <= 1}
            title="Previous Page">
            <IconChevronLeft className="size-4" />
          </Button>

          {/* Number Buttons */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((page, index) => {
              if (page === "...") {
                return (
                  <span key={`ellipsis-${index}`} className="px-1.5 text-xs text-slate-400 select-none">
                    ...
                  </span>
                );
              }
              const isCurrent = page === safeCurrentPage;
              return (
                <Button
                  key={`page-${page}`}
                  variant={isCurrent ? "default" : "outline"}
                  size="icon"
                  className={cn(
                    "size-8 text-xs font-semibold transition-colors",
                    isCurrent
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs border-blue-600"
                      : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
                  )}
                  onClick={() => onPageChange(Number(page))}>
                  {page}
                </Button>
              );
            })}
          </div>

          {/* Next Page */}
          <Button
            variant="outline"
            size="icon"
            className="size-8 text-slate-600 bg-white hover:bg-slate-100 disabled:opacity-40"
            onClick={() => onPageChange(Math.min(totalPages, safeCurrentPage + 1))}
            disabled={safeCurrentPage >= totalPages}
            title="Next Page">
            <IconChevronRight className="size-4" />
          </Button>

          {/* Last Page */}
          <Button
            variant="outline"
            size="icon"
            className="size-8 text-slate-600 bg-white hover:bg-slate-100 disabled:opacity-40"
            onClick={() => onPageChange(totalPages)}
            disabled={safeCurrentPage >= totalPages}
            title="Last Page">
            <IconChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
