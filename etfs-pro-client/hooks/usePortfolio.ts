"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type {
  PortfolioHolding,
  PortfolioHoldingWithMetrics,
  PortfolioSummary,
  AddTransactionInput,
  EditTransactionInput,
  StockData,
  CashHolding,
  CashHoldingWithMetrics,
  CashCurrency,
} from "@/lib/types";
import {
  addPortfolioTransaction,
  editPortfolioTransaction,
  deletePortfolioTransaction,
  deletePortfolioHolding,
  subscribeToPortfolioWithCash,
  addOrUpdateCashHolding,
  deleteCashHolding as deleteCashHoldingFirestore,
  getCashHoldings,
} from "@/lib/firebase/firestore";

interface UsePortfolioReturn {
  holdings: PortfolioHoldingWithMetrics[];
  cashHoldings: CashHoldingWithMetrics[];
  summary: PortfolioSummary | null;
  isLoading: boolean;
  error: string | null;
  addTransaction: (input: AddTransactionInput) => Promise<void>;
  editTransaction: (input: EditTransactionInput) => Promise<void>;
  deleteTransaction: (symbol: string, transactionId: string) => Promise<void>;
  deleteHolding: (symbol: string) => Promise<void>;
  addCash: (currency: CashCurrency, balance: number) => Promise<void>;
  updateCash: (currency: CashCurrency, balance: number) => Promise<void>;
  deleteCash: (currency: CashCurrency) => Promise<void>;
  refreshPrices: () => Promise<void>;
}

export function usePortfolio(): UsePortfolioReturn {
  const { user } = useAuth();
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [cashHoldingsRaw, setCashHoldingsRaw] = useState<CashHolding[]>([]);
  const [prices, setPrices] = useState<Record<string, StockData>>({});
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({ USD: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch exchange rates
  const fetchExchangeRates = useCallback(async () => {
    try {
      const response = await fetch("/api/exchange-rates");
      if (!response.ok) {
        throw new Error("Failed to fetch exchange rates");
      }
      const { rates } = await response.json();
      setExchangeRates(rates);
    } catch (err) {
      console.error("Failed to fetch exchange rates:", err);
      // Keep existing rates on error
    }
  }, []);

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
      const priceMap: Record<string, StockData> = {};
      for (const quote of data as StockData[]) {
        priceMap[quote.symbol] = quote;
      }
      setPrices(priceMap);
    } catch (err) {
      console.error("Failed to fetch prices:", err);
    }
  }, []);

  // Subscribe to portfolio changes (holdings + cash)
  useEffect(() => {
    if (!user) {
      setHoldings([]);
      setCashHoldingsRaw([]);
      setPrices({});
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Fetch exchange rates initially
    fetchExchangeRates();

    // Initial fetch for cash holdings
    getCashHoldings(user.uid)
      .then((cash) => {
        setCashHoldingsRaw(cash);
      })
      .catch((err) => {
        console.error("Failed to load cash holdings:", err);
      });

    // Real-time subscription for both holdings and cash
    const unsubscribe = subscribeToPortfolioWithCash(
      user.uid,
      ({ holdings: holdingsData, cashHoldings: cashData }) => {
        setHoldings(holdingsData);
        setCashHoldingsRaw(cashData);
        const symbols = holdingsData.map((h) => h.symbol);
        fetchPrices(symbols);
        setIsLoading(false);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, fetchPrices, fetchExchangeRates]);

  // Calculate cash holdings with metrics (converted to USD)
  const cashHoldingsWithMetrics: CashHoldingWithMetrics[] = useMemo(() => {
    return cashHoldingsRaw.map((cash) => {
      const rate = exchangeRates[cash.currency] || 1;
      const valueInUSD = cash.balance * rate;

      return {
        ...cash,
        valueInUSD,
        exchangeRate: rate,
        allocationPercent: 0, // Will be calculated after we know total
      };
    });
  }, [cashHoldingsRaw, exchangeRates]);

  // Calculate total cash value in USD
  const totalCashValueUSD = useMemo(() => {
    return cashHoldingsWithMetrics.reduce((sum, c) => sum + c.valueInUSD, 0);
  }, [cashHoldingsWithMetrics]);

  // Calculate holdings with metrics (memoized to avoid recalculating on every render)
  const holdingsWithMetrics: PortfolioHoldingWithMetrics[] = useMemo(() => {
    const enriched = holdings.map((holding) => {
      const quote = prices[holding.symbol];
      const currentPrice = quote?.currentPrice ?? 0;
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
        name: quote?.name,
        dividendYield,
        expectedAnnualDividend,
      };
    });

    // Total includes both securities and cash
    const totalSecuritiesValue = enriched.reduce((sum, h) => sum + h.currentValue, 0);
    const totalPortfolioValue = totalSecuritiesValue + totalCashValueUSD;

    return enriched.map((h) => ({
      ...h,
      allocationPercent: totalPortfolioValue > 0 ? (h.currentValue / totalPortfolioValue) * 100 : 0,
    }));
  }, [holdings, prices, totalCashValueUSD]);

  // Update cash allocation percentages based on total portfolio value
  const cashHoldings: CashHoldingWithMetrics[] = useMemo(() => {
    const totalSecuritiesValue = holdingsWithMetrics.reduce((sum, h) => sum + h.currentValue, 0);
    const totalPortfolioValue = totalSecuritiesValue + totalCashValueUSD;

    return cashHoldingsWithMetrics.map((c) => ({
      ...c,
      allocationPercent: totalPortfolioValue > 0 ? (c.valueInUSD / totalPortfolioValue) * 100 : 0,
    }));
  }, [cashHoldingsWithMetrics, holdingsWithMetrics, totalCashValueUSD]);

  // Calculate summary (memoized) - includes cash in totals
  const summary: PortfolioSummary | null = useMemo(() => {
    if (holdingsWithMetrics.length === 0 && cashHoldings.length === 0) return null;

    const securitiesValue = holdingsWithMetrics.reduce((sum, h) => sum + h.currentValue, 0);
    const totalValue = securitiesValue + totalCashValueUSD;
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
  }, [holdingsWithMetrics, cashHoldings.length, totalCashValueUSD]);

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

  const editTransaction = useCallback(
    async (input: EditTransactionInput) => {
      if (!user) {
        setError("Must be logged in to edit transactions");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await editPortfolioTransaction(user.uid, input);
        // Subscription will update the holdings
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to edit transaction");
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
    await Promise.all([fetchPrices(symbols), fetchExchangeRates()]);
  }, [holdings, fetchPrices, fetchExchangeRates]);

  // Cash CRUD operations
  const addCash = useCallback(
    async (currency: CashCurrency, balance: number) => {
      if (!user) {
        setError("Must be logged in to add cash");
        return;
      }

      if (!user.isPremium) {
        setError("Portfolio tracking requires a premium subscription");
        return;
      }

      setError(null);

      try {
        await addOrUpdateCashHolding(user.uid, currency, balance);
        // Subscription will update the cash holdings
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add cash");
        throw err;
      }
    },
    [user]
  );

  const updateCash = useCallback(
    async (currency: CashCurrency, balance: number) => {
      if (!user) {
        setError("Must be logged in to update cash");
        return;
      }

      setError(null);

      try {
        await addOrUpdateCashHolding(user.uid, currency, balance);
        // Subscription will update the cash holdings
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update cash");
        throw err;
      }
    },
    [user]
  );

  const deleteCash = useCallback(
    async (currency: CashCurrency) => {
      if (!user) {
        setError("Must be logged in to delete cash");
        return;
      }

      setError(null);

      try {
        await deleteCashHoldingFirestore(user.uid, currency);
        // Subscription will update the cash holdings
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete cash");
        throw err;
      }
    },
    [user]
  );

  return {
    holdings: holdingsWithMetrics,
    cashHoldings,
    summary,
    isLoading,
    error,
    addTransaction,
    editTransaction,
    deleteTransaction,
    deleteHolding,
    addCash,
    updateCash,
    deleteCash,
    refreshPrices,
  };
}
