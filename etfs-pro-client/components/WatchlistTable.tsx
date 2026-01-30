"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { StockData, SortField, SortConfig, AssetType } from "@/lib/types";
import { DEFAULT_ATH_THRESHOLD, STORAGE_KEYS } from "@/lib/constants";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import { SearchInput } from "./SearchInput";
import { AddSymbolForm } from "./AddSymbolForm";
import { SortableHeader } from "./SortableHeader";
import { StockRow } from "./StockRow";
import { SettingsPanel } from "./SettingsPanel";
import { StatsCards } from "./StatsCards";
import { AssetFilter } from "./AssetFilter";
import { DEFINITIONS } from "@/lib/definitions";
import { AddTransactionModal } from "./portfolio/AddTransactionModal";
import { usePortfolio } from "@/hooks/usePortfolio";
import { WatchlistMobileCard } from "./WatchlistMobileCard";
import { MobileSortSelect } from "./MobileSortSelect";

interface WatchlistTableProps {
  initialData: StockData[];
}

export function WatchlistTable({ initialData }: WatchlistTableProps) {
  const { symbolLimit, user } = useAuth();
  const {
    watchlist,
    addSymbol,
    removeSymbol,
    isLoading: isWatchlistLoading,
    error: watchlistError,
  } = useWatchlist();

  const [threshold, setThreshold] = useLocalStorage<number>(
    STORAGE_KEYS.ATH_THRESHOLD,
    DEFAULT_ATH_THRESHOLD
  );
  const [stocks, setStocks] = useState<StockData[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [assetFilter, setAssetFilter] = useState<Set<AssetType>>(new Set());
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "percentDown",
    direction: "asc",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");

  const { addTransaction } = usePortfolio();

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
    crypto: stocks.filter(s => s.assetType === "crypto").length,
    materials: stocks.filter(s => s.assetType === "materials").length,
  }), [stocks]);

  // Stocks filtered by asset type (used for stats and display)
  const assetFilteredStocks = useMemo(() => {
    if (assetFilter.size === 0) return stocks;
    return stocks.filter(stock => assetFilter.has(stock.assetType));
  }, [stocks, assetFilter]);

  // Sort and filter stocks
  const displayedStocks = useMemo(() => {
    let filtered = assetFilteredStocks;

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
  }, [assetFilteredStocks, searchQuery, sortConfig]);

  const handleSort = (field: SortField) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleRemoveSymbol = async (symbol: string) => {
    await removeSymbol(symbol);
    setStocks((prev) => prev.filter((s) => s.symbol !== symbol));
  };

  const handleRefresh = () => {
    fetchStocks(watchlist, threshold);
  };

  const handleAddToPortfolio = (symbol: string) => {
    setSelectedSymbol(symbol);
    setPortfolioModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <StatsCards stocks={assetFilteredStocks} />

      <div className="glass-card p-6">
        {/* Header with search and controls */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Top row: Search, Add, Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Filter watchlist..."
              />
            </div>
            <div className="flex-1">
              <AddSymbolForm
                onAdd={addSymbol}
                existingSymbols={watchlist}
                isLoading={isLoading || isWatchlistLoading}
                symbolLimit={symbolLimit}
                isLoggedIn={!!user}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center justify-center px-3 py-3 rounded-lg
                           bg-[var(--theme-background-tertiary)] border border-[var(--theme-card-border)]
                           hover:border-[var(--theme-accent)] transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <svg
                  className={`w-5 h-5 text-muted ${isLoading ? "animate-spin" : ""}`}
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
          <div className="flex items-center justify-between border-t border-[var(--theme-card-border)] pt-4">
            <AssetFilter
              value={assetFilter}
              onChange={setAssetFilter}
              counts={assetCounts}
            />
            <span className="text-xs text-subtle font-mono">
              {displayedStocks.length} of {stocks.length} shown
            </span>
          </div>
        </div>

      {/* Error message */}
      {(error || watchlistError) && (
        <div className="mb-4 p-3 rounded-lg bg-loss/20 text-loss text-sm">
          {error || watchlistError}
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-[14%]" />   {/* Symbol */}
            <col className="w-[10%]" />   {/* Price */}
            <col className="w-[9%]" />    {/* Day % */}
            <col className="w-[13%]" />   {/* All-Time High */}
            <col className="w-[10%]" />   {/* % Down */}
            <col className="w-[10%]" />   {/* % to ATH */}
            <col className="w-[9%]" />    {/* Expense */}
            <col className="w-[9%]" />    {/* Yield */}
            <col className="w-[16%]" />   {/* Actions */}
          </colgroup>
          <thead>
            <tr className="border-b border-[var(--theme-card-border)]">
              <SortableHeader
                field="symbol"
                label="Symbol"
                currentSort={sortConfig}
                onSort={handleSort}
                tooltip={DEFINITIONS.symbol}
              />
              <SortableHeader
                field="currentPrice"
                label="Price"
                currentSort={sortConfig}
                onSort={handleSort}
                align="right"
                tooltip={DEFINITIONS.price}
              />
              <SortableHeader
                field="dailyChangePercent"
                label="Day %"
                currentSort={sortConfig}
                onSort={handleSort}
                align="right"
                tooltip={DEFINITIONS.dayChange}
              />
              <SortableHeader
                field="allTimeHigh"
                label="All-Time High"
                currentSort={sortConfig}
                onSort={handleSort}
                align="right"
                tooltip={DEFINITIONS.allTimeHigh}
              />
              <SortableHeader
                field="percentDown"
                label="% Down"
                currentSort={sortConfig}
                onSort={handleSort}
                align="right"
                tooltip={DEFINITIONS.percentDown}
              />
              <SortableHeader
                field="percentToATH"
                label="% to ATH"
                currentSort={sortConfig}
                onSort={handleSort}
                align="right"
                tooltip={DEFINITIONS.percentToATH}
              />
              <SortableHeader
                field="expenseRatio"
                label="Expense"
                currentSort={sortConfig}
                onSort={handleSort}
                align="right"
                tooltip={DEFINITIONS.expenseRatio}
              />
              <SortableHeader
                field="dividendYield"
                label="Yield"
                currentSort={sortConfig}
                onSort={handleSort}
                align="right"
                tooltip={DEFINITIONS.dividendYield}
              />
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {displayedStocks.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-subtle">
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
                  onAddToPortfolio={handleAddToPortfolio}
                  isPremium={user?.isPremium}
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
            { field: "currentPrice", label: "Price" },
            { field: "dailyChangePercent", label: "Day %" },
            { field: "allTimeHigh", label: "All-Time High" },
            { field: "percentDown", label: "% Down" },
            { field: "percentToATH", label: "% to ATH" },
            { field: "expenseRatio", label: "Expense" },
            { field: "dividendYield", label: "Yield" },
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
        {displayedStocks.length === 0 ? (
          <div className="py-8 text-center text-subtle">
            {isLoading
              ? "Loading..."
              : searchQuery
              ? "No matching stocks found"
              : "No stocks in watchlist"}
          </div>
        ) : (
          displayedStocks.map((stock) => (
            <WatchlistMobileCard
              key={stock.symbol}
              stock={stock}
              onRemove={handleRemoveSymbol}
              onAddToPortfolio={handleAddToPortfolio}
              isPremium={user?.isPremium}
            />
          ))
        )}
      </div>

        {/* Footer */}
        <div className="mt-4 text-xs text-subtle text-right">
          <span>Data from Yahoo Finance</span>
        </div>
      </div>

      {/* Add to Portfolio Modal */}
      <AddTransactionModal
        isOpen={portfolioModalOpen}
        onClose={() => {
          setPortfolioModalOpen(false);
          setSelectedSymbol("");
        }}
        onSubmit={addTransaction}
        prefilledSymbol={selectedSymbol}
      />
    </div>
  );
}
