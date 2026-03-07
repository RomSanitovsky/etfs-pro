"use client";

import { useState, useMemo } from "react";
import type { PortfolioHoldingWithMetrics, CashHoldingWithMetrics, CashCurrency, GroupedCashHolding } from "@/lib/types";
import { PortfolioRow } from "./PortfolioRow";
import { PortfolioMobileCard } from "./PortfolioMobileCard";
import { MobileSortSelect } from "../MobileSortSelect";
import { getCurrencyName, getCurrencySymbol } from "@/lib/constants";
import { useCurrency } from "@/contexts/CurrencyContext";

interface PortfolioTableProps {
  holdings: PortfolioHoldingWithMetrics[];
  cashHoldings?: CashHoldingWithMetrics[];
  onEditTransaction: (symbol: string, transactionId: string) => void;
  onDeleteTransaction: (symbol: string, transactionId: string) => void;
  onDeleteHolding: (symbol: string) => void;
  onEditCash?: (cash: CashHoldingWithMetrics) => void;
  onDeleteCash?: (id: string) => void;
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
      className={`px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors ${
        align === "right" ? "text-right" : "text-left"
      }`}
      onClick={() => onSort(field)}
    >
      <div className={`flex items-center gap-1 ${align === "right" ? "justify-end" : ""}`}>
        {label}
        <svg
          className={`w-3 h-3 transition-transform ${
            isActive ? "text-cosmic" : "text-subtle"
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

// Group cash holdings by currency
function groupCashByCurrency(cashHoldings: CashHoldingWithMetrics[]): GroupedCashHolding[] {
  const groups: Record<CashCurrency, CashHoldingWithMetrics[]> = {} as Record<CashCurrency, CashHoldingWithMetrics[]>;

  for (const cash of cashHoldings) {
    if (!groups[cash.currency]) {
      groups[cash.currency] = [];
    }
    groups[cash.currency].push(cash);
  }

  return Object.entries(groups).map(([currency, entries]) => ({
    currency: currency as CashCurrency,
    entries: entries.sort((a, b) => b.valueInUSD - a.valueInUSD),
    totalBalance: entries.reduce((sum, e) => sum + e.balance, 0),
    totalValueInUSD: entries.reduce((sum, e) => sum + e.valueInUSD, 0),
    allocationPercent: entries.reduce((sum, e) => sum + e.allocationPercent, 0),
  })).sort((a, b) => b.totalValueInUSD - a.totalValueInUSD);
}

export function PortfolioTable({
  holdings,
  cashHoldings = [],
  onEditTransaction,
  onDeleteTransaction,
  onDeleteHolding,
  onEditCash,
  onDeleteCash,
  isLoading,
}: PortfolioTableProps) {
  const { formatInDisplayCurrency, displayCurrency } = useCurrency();
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "currentValue",
    direction: "desc",
  });
  const [expandedCurrencies, setExpandedCurrencies] = useState<Set<CashCurrency>>(new Set());

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

  const groupedCash = useMemo(() => groupCashByCurrency(cashHoldings), [cashHoldings]);

  const handleSort = (field: SortField) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const toggleCurrencyExpanded = (currency: CashCurrency) => {
    setExpandedCurrencies((prev) => {
      const next = new Set(prev);
      if (next.has(currency)) {
        next.delete(currency);
      } else {
        next.add(currency);
      }
      return next;
    });
  };

  return (
    <div className="glass-card p-6">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--theme-card-border)]">
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
                <td colSpan={9} className="px-4 py-8 text-center text-subtle">
                  {isLoading ? "Loading portfolio..." : "No holdings yet"}
                </td>
              </tr>
            ) : (
              sortedHoldings.map((holding) => (
                <PortfolioRow
                  key={holding.symbol}
                  holding={holding}
                  onEditTransaction={onEditTransaction}
                  onDeleteTransaction={onDeleteTransaction}
                  onDeleteHolding={onDeleteHolding}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        <MobileSortSelect
          options={[
            { field: "symbol", label: "Symbol" },
            { field: "totalShares", label: "Shares" },
            { field: "averageCost", label: "Avg Cost" },
            { field: "currentPrice", label: "Price" },
            { field: "currentValue", label: "Value" },
            { field: "unrealizedPnL", label: "P&L" },
            { field: "allocationPercent", label: "Allocation" },
          ]}
          currentField={sortConfig.field}
          currentDirection={sortConfig.direction}
          onSort={(field) => handleSort(field as SortField)}
          onToggleDirection={() =>
            setSortConfig((prev) => ({
              ...prev,
              direction: prev.direction === "asc" ? "desc" : "asc",
            }))
          }
        />
        {sortedHoldings.length === 0 ? (
          <div className="py-8 text-center text-subtle">
            {isLoading ? "Loading portfolio..." : "No holdings yet"}
          </div>
        ) : (
          sortedHoldings.map((holding) => (
            <PortfolioMobileCard
              key={holding.symbol}
              holding={holding}
              onEditTransaction={onEditTransaction}
              onDeleteTransaction={onDeleteTransaction}
              onDeleteHolding={onDeleteHolding}
            />
          ))
        )}
      </div>

      {/* Cash Holdings Section */}
      {groupedCash.length > 0 && (
        <div className="mt-6 pt-6 border-t border-[var(--theme-card-border)]">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-gain" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Cash Holdings
          </h3>

          {/* Desktop Cash Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--theme-card-border)]">
                  <th className="w-10"></th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider text-left">Currency</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider text-right">Balance</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider text-right">Value ({displayCurrency})</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider text-right">Rate</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider text-right">Allocation</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {groupedCash.map((group) => {
                  const isExpanded = expandedCurrencies.has(group.currency);
                  const hasMultiple = group.entries.length > 1;
                  const firstEntry = group.entries[0];

                  return (
                    <>
                      {/* Currency group row */}
                      <tr
                        key={group.currency}
                        className={`border-b border-[var(--theme-card-border)]/50 hover:bg-surface/30 transition-colors ${hasMultiple ? "cursor-pointer" : ""}`}
                        onClick={() => hasMultiple && toggleCurrencyExpanded(group.currency)}
                      >
                        <td className="px-2 py-4 text-center">
                          {hasMultiple && (
                            <svg
                              className={`w-4 h-4 text-muted transition-transform ${isExpanded ? "rotate-90" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-gain/20 flex items-center justify-center text-gain font-bold text-sm">
                              {getCurrencySymbol(group.currency)}
                            </span>
                            <div>
                              <span className="font-mono font-semibold text-foreground">{group.currency}</span>
                              <p className="text-xs text-muted">
                                {!hasMultiple && firstEntry.notes ? (
                                  <span>{firstEntry.notes}</span>
                                ) : (
                                  <>
                                    {getCurrencyName(group.currency)}
                                    {hasMultiple && <span className="ml-1 text-cosmic">({group.entries.length} entries)</span>}
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right font-mono text-foreground">
                          {getCurrencySymbol(group.currency)}{group.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-4 text-right font-mono font-semibold text-foreground">
                          {formatInDisplayCurrency(group.totalValueInUSD)}
                        </td>
                        <td className="px-4 py-4 text-right font-mono text-muted text-sm">
                          {firstEntry.exchangeRate.toFixed(4)}
                        </td>
                        <td className="px-4 py-4 text-right font-mono text-foreground">
                          {group.allocationPercent.toFixed(2)}%
                        </td>
                        <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          {!hasMultiple && (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => onEditCash?.(firstEntry)}
                                className="p-1.5 rounded hover:bg-surface/50 text-muted hover:text-foreground transition-colors"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => onDeleteCash?.(firstEntry.id)}
                                className="p-1.5 rounded hover:bg-loss/20 text-muted hover:text-loss transition-colors"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>

                      {/* Expanded entries */}
                      {isExpanded && group.entries.map((entry) => (
                        <tr
                          key={entry.id}
                          className="border-b border-[var(--theme-card-border)]/30 bg-surface/20 hover:bg-surface/40 transition-colors"
                        >
                          <td className="px-2 py-3"></td>
                          <td className="px-4 py-3 pl-16">
                            <span className="text-sm text-muted">
                              {entry.notes || "Cash entry"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-foreground/80 text-sm">
                            {getCurrencySymbol(entry.currency)}{entry.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-foreground/80 text-sm">
                            {formatInDisplayCurrency(entry.valueInUSD)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-muted text-xs">
                            —
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-foreground/80 text-sm">
                            {entry.allocationPercent.toFixed(2)}%
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => onEditCash?.(entry)}
                                className="p-1.5 rounded hover:bg-surface/50 text-muted hover:text-foreground transition-colors"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => onDeleteCash?.(entry.id)}
                                className="p-1.5 rounded hover:bg-loss/20 text-muted hover:text-loss transition-colors"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cash Cards */}
          <div className="md:hidden space-y-3">
            {groupedCash.map((group) => {
              const isExpanded = expandedCurrencies.has(group.currency);
              const hasMultiple = group.entries.length > 1;
              const firstEntry = group.entries[0];

              return (
                <div key={group.currency} className="rounded-lg bg-surface/30 border border-[var(--theme-card-border)] overflow-hidden">
                  {/* Group header */}
                  <div
                    className={`p-4 ${hasMultiple ? "cursor-pointer" : ""}`}
                    onClick={() => hasMultiple && toggleCurrencyExpanded(group.currency)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {hasMultiple && (
                          <svg
                            className={`w-4 h-4 text-muted transition-transform ${isExpanded ? "rotate-90" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                        <span className="w-8 h-8 rounded-full bg-gain/20 flex items-center justify-center text-gain font-bold text-sm">
                          {getCurrencySymbol(group.currency)}
                        </span>
                        <div>
                          <span className="font-mono font-semibold text-foreground">{group.currency}</span>
                          <p className="text-xs text-muted">
                            {!hasMultiple && firstEntry.notes ? (
                              <span>{firstEntry.notes}</span>
                            ) : (
                              <>
                                {getCurrencyName(group.currency)}
                                {hasMultiple && <span className="ml-1 text-cosmic">({group.entries.length})</span>}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      {!hasMultiple && (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onEditCash?.(firstEntry)}
                            className="p-1.5 rounded hover:bg-surface/50 text-muted hover:text-foreground transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => onDeleteCash?.(firstEntry.id)}
                            className="p-1.5 rounded hover:bg-loss/20 text-muted hover:text-loss transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted">Balance</span>
                        <p className="font-mono text-foreground">
                          {getCurrencySymbol(group.currency)}{group.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-muted">Value ({displayCurrency})</span>
                        <p className="font-mono font-semibold text-foreground">{formatInDisplayCurrency(group.totalValueInUSD)}</p>
                      </div>
                      <div>
                        <span className="text-muted">Rate</span>
                        <p className="font-mono text-muted">{firstEntry.exchangeRate.toFixed(4)}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-muted">Allocation</span>
                        <p className="font-mono text-foreground">{group.allocationPercent.toFixed(2)}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded entries */}
                  {isExpanded && (
                    <div className="border-t border-[var(--theme-card-border)]/50">
                      {group.entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="p-3 pl-8 border-b border-[var(--theme-card-border)]/30 last:border-b-0 bg-surface/10"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted">{entry.notes || "Cash entry"}</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => onEditCash?.(entry)}
                                className="p-1 rounded hover:bg-surface/50 text-muted hover:text-foreground transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => onDeleteCash?.(entry.id)}
                                className="p-1 rounded hover:bg-loss/20 text-muted hover:text-loss transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="font-mono text-foreground/80">
                              {getCurrencySymbol(entry.currency)}{entry.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                            <span className="font-mono text-foreground/80">
                              {formatInDisplayCurrency(entry.valueInUSD)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
