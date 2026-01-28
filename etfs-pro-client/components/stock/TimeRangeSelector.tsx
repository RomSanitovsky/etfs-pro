"use client";

import type { TimeRange } from "@/lib/types";

const TIME_RANGES: TimeRange[] = ["1D", "1W", "1M", "1Y", "5Y"];

interface TimeRangeSelectorProps {
  selected: TimeRange;
  onSelect: (range: TimeRange) => void;
  loading?: boolean;
}

export function TimeRangeSelector({
  selected,
  onSelect,
  loading,
}: TimeRangeSelectorProps) {
  return (
    <div className="flex gap-1">
      {TIME_RANGES.map((range) => (
        <button
          key={range}
          onClick={() => onSelect(range)}
          disabled={loading}
          className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
            selected === range
              ? "bg-cosmic text-white"
              : "bg-surface text-muted hover:bg-surface-alt hover:text-foreground"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {range}
        </button>
      ))}
    </div>
  );
}
