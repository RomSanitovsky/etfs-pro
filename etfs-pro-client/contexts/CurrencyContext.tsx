"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { CashCurrency } from "@/lib/types";
import { CASH_CURRENCIES } from "@/lib/constants";

interface CurrencyContextValue {
  displayCurrency: CashCurrency;
  setDisplayCurrency: (currency: CashCurrency) => void;
  exchangeRates: Record<string, number>;
  setExchangeRates: (rates: Record<string, number>) => void;
  convertFromUSD: (amountUSD: number) => number;
  formatInDisplayCurrency: (amountUSD: number, options?: FormatOptions) => string;
  currencySymbol: string;
  currencyName: string;
}

interface FormatOptions {
  showSign?: boolean;
  compact?: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const STORAGE_KEY = "portfolio-display-currency";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [displayCurrency, setDisplayCurrencyState] = useState<CashCurrency>("USD");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({ USD: 1 });

  // Load saved currency preference
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && CASH_CURRENCIES.some((c) => c.code === saved)) {
      setDisplayCurrencyState(saved as CashCurrency);
    }
  }, []);

  const setDisplayCurrency = useCallback((currency: CashCurrency) => {
    setDisplayCurrencyState(currency);
    localStorage.setItem(STORAGE_KEY, currency);
  }, []);

  // Convert USD amount to display currency
  const convertFromUSD = useCallback(
    (amountUSD: number): number => {
      if (displayCurrency === "USD") return amountUSD;
      const rate = exchangeRates[displayCurrency];
      if (!rate) return amountUSD;
      // Rate is USD->currency, so we divide (rates are stored as how much 1 unit of currency is in USD)
      return amountUSD / rate;
    },
    [displayCurrency, exchangeRates]
  );

  // Get currency symbol
  const currencyInfo = CASH_CURRENCIES.find((c) => c.code === displayCurrency);
  const currencySymbol = currencyInfo?.symbol ?? "$";
  const currencyName = currencyInfo?.name ?? "US Dollar";

  // Format amount in display currency
  const formatInDisplayCurrency = useCallback(
    (amountUSD: number, options: FormatOptions = {}): string => {
      const { showSign = false, compact = false } = options;
      const converted = convertFromUSD(amountUSD);
      const absValue = Math.abs(converted);

      let formatted: string;

      if (compact && absValue >= 1_000_000) {
        formatted = `${(converted / 1_000_000).toFixed(2)}M`;
      } else if (compact && absValue >= 1_000) {
        formatted = `${(converted / 1_000).toFixed(1)}K`;
      } else {
        formatted = new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(absValue);
      }

      const sign = showSign && converted > 0 ? "+" : converted < 0 ? "-" : "";

      // Handle different currency symbol positions
      if (displayCurrency === "CHF") {
        return `${sign}${currencySymbol} ${formatted}`;
      }

      return `${sign}${currencySymbol}${formatted}`;
    },
    [convertFromUSD, currencySymbol, displayCurrency]
  );

  return (
    <CurrencyContext.Provider
      value={{
        displayCurrency,
        setDisplayCurrency,
        exchangeRates,
        setExchangeRates,
        convertFromUSD,
        formatInDisplayCurrency,
        currencySymbol,
        currencyName,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
