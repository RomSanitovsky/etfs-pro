"use client";

interface SortOption {
  field: string;
  label: string;
}

interface MobileSortSelectProps {
  options: SortOption[];
  currentField: string;
  currentDirection: "asc" | "desc";
  onSort: (field: string) => void;
  onToggleDirection: () => void;
}

export function MobileSortSelect({
  options,
  currentField,
  currentDirection,
  onSort,
  onToggleDirection,
}: MobileSortSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-muted whitespace-nowrap">Sort by</label>
      <select
        value={currentField}
        onChange={(e) => onSort(e.target.value)}
        className="flex-1 text-sm bg-surface border border-[var(--theme-card-border)] rounded-lg px-3 py-2 text-foreground appearance-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.field} value={opt.field}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        onClick={onToggleDirection}
        className="p-2 rounded-lg bg-surface border border-[var(--theme-card-border)] text-muted hover:text-foreground transition-colors"
        title={currentDirection === "asc" ? "Ascending" : "Descending"}
      >
        <svg
          className={`w-4 h-4 transition-transform ${currentDirection === "desc" ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </div>
  );
}
