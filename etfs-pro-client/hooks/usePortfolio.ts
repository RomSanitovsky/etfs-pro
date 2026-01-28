"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type {
  PortfolioHolding,
  PortfolioHoldingWithMetrics,
  PortfolioSummary,
  AddTransactionInput,
  QuoteData,
} from "@/lib/types";
import {
  getPortfolioHoldings,
  addPortfolioTransaction,
  deletePortfolioTransaction,
  deletePortfolioHolding,
  subscribeToPortfolio,
} from "@/lib/firebase/firestore";

interface UsePortfolioReturn {
  holdings: PortfolioHoldingWithMetrics[];
  summary: PortfolioSummary | null;
  isLoading: boolean;
  error: string | null;
  addTransaction: (input: AddTransactionInput) => Promise<void>;
  deleteTransaction: (symbol: string, transactionId: string) => Promise<void>;
  deleteHolding: (symbol: string) => Promise<void>;
  refreshPrices: () => Promise<void>;
}

export function usePortfolio(): UsePortfolioReturn {
  const { user } = useAuth();
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [prices, setPrices] = useState<Record<string, QuoteData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current prices for all holdings
  const fetchPrices = useCallback(async (symbols: string[]) => {
    if (symbols.length === 0) {
      setPrices({});
      return;
    }

    try {
      const response = await fetch(`/api/quotes?symbols=${symbols.join(",")}`);
      if (!response.ok) {
        throw new Error("Failed to fetch prices");
      }

      const { data } = await response.json();
      const priceMap: Record<string, QuoteData> = {};
      for (const quote of data as QuoteData[]) {
        priceMap[quote.symbol] = quote;
      }
      setPrices(priceMap);
    } catch (err) {
      console.error("Failed to fetch prices:", err);
    }
  }, []);

  // Subscribe to portfolio changes
  useEffect(() => {
    if (!user) {
      setHoldings([]);
      setPrices({});
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Initial fetch
    getPortfolioHoldings(user.uid)
      .then((data) => {
        setHoldings(data);
        const symbols = data.map((h) => h.symbol);
        return fetchPrices(symbols);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load portfolio");
      })
      .finally(() => {
        setIsLoading(false);
      });

    // Real-time subscription
    const unsubscribe = subscribeToPortfolio(
      user.uid,
      (data) => {
        setHoldings(data);
        const symbols = data.map((h) => h.symbol);
        fetchPrices(symbols);
      },
      (err) => {
        setError(err.message);
      }
    );

    return () => unsubscribe();
  }, [user, fetchPrices]);

  // Calculate holdings with metrics (memoized to avoid recalculating on every render)
  const holdingsWithMetrics: PortfolioHoldingWithMetrics[] = useMemo(() => {
    const enriched = holdings.map((holding) => {
      const quote = prices[holding.symbol];
      const currentPrice = quote?.regularMarketPrice ?? 0;
      const totalCost = holding.totalShares * holding.averageCost;
      const currentValue = holding.totalShares * currentPrice;
      const unrealizedPnL = currentValue - totalCost;
      const unrealizedPnLPercent = totalCost > 0 ? (unrealizedPnL / totalCost) * 100 : 0;
      const dividendYield = quote?.dividendYield ?? null;
      const expectedAnnualDividend = dividendYield !== null && currentValue > 0
        ? (currentValue * dividendYield) / 100
        : 0;

      return {
        ...holding,
        currentPrice,
        totalCost,
        currentValue,
        unrealizedPnL,
        unrealizedPnLPercent,
        allocationPercent: 0,
        name: quote?.shortName,
        dividendYield,
        expectedAnnualDividend,
      };
    });

    const totalValue = enriched.reduce((sum, h) => sum + h.currentValue, 0);
    return enriched.map((h) => ({
      ...h,
      allocationPercent: totalValue > 0 ? (h.currentValue / totalValue) * 100 : 0,
    }));
  }, [holdings, prices]);

  // Calculate summary (memoized)
  const summary: PortfolioSummary | null = useMemo(() => {
    if (holdingsWithMetrics.length === 0) return null;

    const totalValue = holdingsWithMetrics.reduce((sum, h) => sum + h.currentValue, 0);
    const totalCost = holdingsWithMetrics.reduce((sum, h) => sum + h.totalCost, 0);
    const totalPnL = holdingsWithMetrics.reduce((sum, h) => sum + h.unrealizedPnL, 0);
    const totalExpectedAnnualDividend = holdingsWithMetrics.reduce(
      (sum, h) => sum + h.expectedAnnualDividend, 0
    );

    return {
      totalValue,
      totalCost,
      totalPnL,
      totalPnLPercent: totalCost > 0 ? (totalPnL / totalCost) * 100 : 0,
      holdingsCount: holdingsWithMetrics.length,
      topGainer: holdingsWithMetrics.reduce(
        (best, h) =>
          h.unrealizedPnLPercent > (best?.pnlPercent ?? -Infinity)
            ? { symbol: h.symbol, pnlPercent: h.unrealizedPnLPercent }
            : best,
        null as { symbol: string; pnlPercent: number } | null
      ),
      topLoser: holdingsWithMetrics.reduce(
        (worst, h) =>
          h.unrealizedPnLPercent < (worst?.pnlPercent ?? Infinity)
            ? { symbol: h.symbol, pnlPercent: h.unrealizedPnLPercent }
            : worst,
        null as { symbol: string; pnlPercent: number } | null
      ),
      expectedAnnualDividend: totalExpectedAnnualDividend,
      portfolioDividendYield: totalValue > 0
        ? (totalExpectedAnnualDividend / totalValue) * 100
        : 0,
    };
  }, [holdingsWithMetrics]);

  const addTransaction = useCallback(
    async (input: AddTransactionInput) => {
      if (!user) {
        setError("Must be logged in to add transactions");
        return;
      }

      if (!user.isPremium) {
        setError("Portfolio tracking requires a premium subscription");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await addPortfolioTransaction(user.uid, input);
        // Subscription will update the holdings
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add transaction");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const deleteTransaction = useCallback(
    async (symbol: string, transactionId: string) => {
      if (!user) {
        setError("Must be logged in to delete transactions");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await deletePortfolioTransaction(user.uid, symbol, transactionId);
        // Subscription will update the holdings
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete transaction");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const deleteHolding = useCallback(
    async (symbol: string) => {
      if (!user) {
        setError("Must be logged in to delete holdings");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await deletePortfolioHolding(user.uid, symbol);
        // Subscription will update the holdings
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete holding");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const refreshPrices = useCallback(async () => {
    const symbols = holdings.map((h) => h.symbol);
    await fetchPrices(symbols);
  }, [holdings, fetchPrices]);

  return {
    holdings: holdingsWithMetrics,
    summary,
    isLoading,
    error,
    addTransaction,
    deleteTransaction,
    deleteHolding,
    refreshPrices,
  };
}
