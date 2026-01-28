"use client";

import { useState, useMemo } from "react";
import type { PortfolioHoldingWithMetrics } from "@/lib/types";
import { PortfolioRow } from "./PortfolioRow";

interface PortfolioTableProps {
  holdings: PortfolioHoldingWithMetrics[];
  onDeleteTransaction: (symbol: string, transactionId: string) => void;
  onDeleteHolding: (symbol: string) => void;
  isLoading: boolean;
}

type SortField = "symbol" | "totalShares" | "averageCost" | "currentPrice" | "currentValue" | "unrealizedPnL" | "unrealizedPnLPercent" | "allocationPercent";
type SortDirection = "asc" | "desc";

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

function SortableHeader({
  field,
  label,
  currentSort,
  onSort,
  align = "left",
}: {
  field: SortField;
  label: string;
  currentSort: SortConfig;
  onSort: (field: SortField) => void;
  align?: "left" | "right";
}) {
  const isActive = currentSort.field === field;

  return (
    <th
      className={`px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors ${
        align === "right" ? "text-right" : "text-left"
      }`}
      onClick={() => onSort(field)}
    >
      <div className={`flex items-center gap-1 ${align === "right" ? "justify-end" : ""}`}>
        {label}
        <svg
          className={`w-3 h-3 transition-transform ${
            isActive ? "text-cyan-400" : "text-slate-600"
          } ${isActive && currentSort.direction === "desc" ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </div>
    </th>
  );
}

export function PortfolioTable({
  holdings,
  onDeleteTransaction,
  onDeleteHolding,
  isLoading,
}: PortfolioTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "currentValue",
    direction: "desc",
  });

  const sortedHoldings = useMemo(() => {
    return [...holdings].sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [holdings, sortConfig]);

  const handleSort = (field: SortField) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <div className="glass-card p-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="w-10"></th>
              <SortableHeader
                field="symbol"
                label="Symbol"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                field="totalShares"
                label="Shares"
                currentSort={sortConfig}
                onSort={handleSort}
                align="right"
              />
              <SortableHeader
                field="averageCost"
                label="Avg Cost"
                currentSort={sortConfig}
                onSort={handleSort}
                align="right"
              />
              <SortableHeader
                field="currentPrice"
                label="Price"
                currentSort={sortConfig}
                onSort={handleSort}
                align="right"
              />
              <SortableHeader
                field="currentValue"
                label="Value"
                currentSort={sortConfig}
                onSort={handleSort}
                align="right"
              />
              <SortableHeader
                field="unrealizedPnL"
                label="P&L"
                currentSort={sortConfig}
                onSort={handleSort}
                align="right"
              />
              <SortableHeader
                field="allocationPercent"
                label="Allocation"
                currentSort={sortConfig}
                onSort={handleSort}
                align="right"
              />
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {sortedHoldings.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                  {isLoading ? "Loading portfolio..." : "No holdings yet"}
                </td>
              </tr>
            ) : (
              sortedHoldings.map((holding) => (
                <PortfolioRow
                  key={holding.symbol}
                  holding={holding}
                  onDeleteTransaction={onDeleteTransaction}
                  onDeleteHolding={onDeleteHolding}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
