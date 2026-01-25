"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { StockData, SortField, SortConfig, AssetFilter as AssetFilterType } from "@/lib/types";
import { DEFAULT_SYMBOLS, DEFAULT_ATH_THRESHOLD, STORAGE_KEYS } from "@/lib/constants";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/contexts/AuthContext";
import { SearchInput } from "./SearchInput";
import { AddSymbolForm } from "./AddSymbolForm";
import { SortableHeader } from "./SortableHeader";
import { StockRow } from "./StockRow";
import { SettingsPanel } from "./SettingsPanel";
import { StatsCards } from "./StatsCards";
import { AssetFilter } from "./AssetFilter";

interface WatchlistTableProps {
  initialData: StockData[];
}

export function WatchlistTable({ initialData }: WatchlistTableProps) {
  const { symbolLimit } = useAuth();
  const [watchlist, setWatchlist] = useLocalStorage<string[]>(
    STORAGE_KEYS.WATCHLIST,
    DEFAULT_SYMBOLS
  );
  const [threshold, setThreshold] = useLocalStorage<number>(
    STORAGE_KEYS.ATH_THRESHOLD,
    DEFAULT_ATH_THRESHOLD
  );
  const [stocks, setStocks] = useState<StockData[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [assetFilter, setAssetFilter] = useState<AssetFilterType>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "percentDown",
    direction: "asc",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data for current watchlist
  const fetchStocks = useCallback(async (symbols: string[], currentThreshold: number) => {
    if (symbols.length === 0) {
      setStocks([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/quotes?symbols=${symbols.join(",")}&threshold=${currentThreshold}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch stock data");
      }

      const { data } = await response.json();
      setStocks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refetch when watchlist or threshold changes
  useEffect(() => {
    // Only fetch if watchlist differs from initial data symbols
    const initialSymbols = initialData.map((s) => s.symbol).sort().join(",");
    const currentSymbols = watchlist.slice().sort().join(",");

    if (initialSymbols !== currentSymbols || threshold !== DEFAULT_ATH_THRESHOLD) {
      fetchStocks(watchlist, threshold);
    }
  }, [watchlist, threshold, fetchStocks, initialData]);

  // Update stocks' isNearATH when threshold changes
  useEffect(() => {
    setStocks((prevStocks) =>
      prevStocks.map((stock) => ({
        ...stock,
        isNearATH: stock.percentDown > 0 && stock.percentDown <= threshold,
      }))
    );
  }, [threshold]);

  // Calculate asset counts for filter
  const assetCounts = useMemo(() => ({
    all: stocks.length,
    etf: stocks.filter(s => s.assetType === "etf").length,
    stock: stocks.filter(s => s.assetType === "stock").length,
  }), [stocks]);

  // Sort and filter stocks
  const displayedStocks = useMemo(() => {
    let filtered = stocks;

    // Filter by asset type
    if (assetFilter !== "all") {
      filtered = filtered.filter(stock => stock.assetType === assetFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(query) ||
          stock.name.toLowerCase().includes(query)
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
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

    return sorted;
  }, [stocks, searchQuery, assetFilter, sortConfig]);

  const handleSort = (field: SortField) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleAddSymbol = async (symbol: string) => {
    setWatchlist((prev) => [...prev, symbol]);
  };

  const handleRemoveSymbol = (symbol: string) => {
    setWatchlist((prev) => prev.filter((s) => s !== symbol));
    setStocks((prev) => prev.filter((s) => s.symbol !== symbol));
  };

  const handleRefresh = () => {
    fetchStocks(watchlist, threshold);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <StatsCards stocks={stocks} />

      <div className="glass-card p-6">
        {/* Header with search and controls */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Top row: Search, Add, Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search symbols or names..."
              />
            </div>
            <div className="flex-1">
              <AddSymbolForm
                onAdd={handleAddSymbol}
                existingSymbols={watchlist}
                isLoading={isLoading}
                symbolLimit={symbolLimit}
              />
            </div>
            <div className="flex items-start gap-2">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <svg
                  className={`w-5 h-5 text-slate-400 ${isLoading ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              <SettingsPanel threshold={threshold} onThresholdChange={setThreshold} />
            </div>
          </div>

          {/* Filter row */}
          <div className="flex items-center justify-between border-t border-slate-700/50 pt-4">
            <AssetFilter
              value={assetFilter}
              onChange={setAssetFilter}
              counts={assetCounts}
            />
            <span className="text-xs text-slate-500 font-mono">
              {displayedStocks.length} of {stocks.length} shown
            </span>
          </div>
        </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <SortableHeader
                field="symbol"
                label="Symbol"
                currentSort={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                field="currentPrice"
                label="Price"
                currentSort={sortConfig}
                onSort={handleSort}
                align="right"
              />
              <SortableHeader
                field="dailyChangePercent"
                label="Day %"
                currentSort={sortConfig}
                onSort={handleSort}
                align="right"
              />
              <SortableHeader
                field="allTimeHigh"
                label="All-Time High"
                currentSort={sortConfig}
                onSort={handleSort}
                align="right"
              />
              <SortableHeader
                field="percentDown"
                label="% Down"
                currentSort={sortConfig}
                onSort={handleSort}
                align="right"
              />
              <SortableHeader
                field="percentToATH"
                label="% to ATH"
                currentSort={sortConfig}
                onSort={handleSort}
                align="right"
              />
              <SortableHeader
                field="expenseRatio"
                label="Expense"
                currentSort={sortConfig}
                onSort={handleSort}
                align="right"
              />
              <SortableHeader
                field="dividendYield"
                label="Yield"
                currentSort={sortConfig}
                onSort={handleSort}
                align="right"
              />
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {displayedStocks.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                  {isLoading
                    ? "Loading..."
                    : searchQuery
                    ? "No matching stocks found"
                    : "No stocks in watchlist"}
                </td>
              </tr>
            ) : (
              displayedStocks.map((stock) => (
                <StockRow
                  key={stock.symbol}
                  stock={stock}
                  onRemove={handleRemoveSymbol}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

        {/* Footer */}
        <div className="mt-4 text-xs text-slate-500 text-right">
          <span>Data from Yahoo Finance</span>
        </div>
      </div>
    </div>
  );
}
