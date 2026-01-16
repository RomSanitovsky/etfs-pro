"use client";

import type { SortField, SortDirection } from "@/lib/types";

interface SortableHeaderProps {
  field: SortField;
  label: string;
  currentSort: { field: SortField; direction: SortDirection };
  onSort: (field: SortField) => void;
  align?: "left" | "right";
}

export function SortableHeader({
  field,
  label,
  currentSort,
  onSort,
  align = "left",
}: SortableHeaderProps) {
  const isActive = currentSort.field === field;

  return (
    <th
      className={`sort-header px-4 py-3 font-semibold text-sm ${
        align === "right" ? "text-right" : "text-left"
      } ${isActive ? "text-cyan-400" : "text-slate-400"}`}
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive && (
          <span className="text-xs">
            {currentSort.direction === "asc" ? "▲" : "▼"}
          </span>
        )}
      </span>
    </th>
  );
}
