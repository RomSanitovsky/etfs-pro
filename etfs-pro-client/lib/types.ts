export type AssetType = "etf" | "stock";

export interface StockData {
  symbol: string;
  name: string;
  currentPrice: number;
  allTimeHigh: number;
  athDate: string; // ISO date string (JSON serializes Date to string)
  percentDown: number; // (ATH - current) / ATH * 100
  percentToATH: number; // (ATH - current) / current * 100
  isNearATH: boolean; // percentDown <= threshold
  currency: string;
  dailyChangePercent: number | null; // Daily price change %
  dividendYield: number | null; // Annual dividend yield %
  expenseRatio: number | null; // Expense ratio % (ETFs only)
  assetType: AssetType; // "etf" if has expense ratio, "stock" otherwise
}

export type AssetFilter = "all" | "etf" | "stock";

export interface QuoteData {
  symbol: string;
  shortName: string;
  regularMarketPrice: number;
  currency: string;
  dailyChangePercent: number | null;
  dividendYield: number | null;
  expenseRatio: number | null;
}

export interface ATHCache {
  [symbol: string]: {
    allTimeHigh: number;
    athDate: string;
    cachedAt: string;
  };
}

export type SortField =
  | "symbol"
  | "name"
  | "currentPrice"
  | "allTimeHigh"
  | "percentDown"
  | "percentToATH"
  | "dailyChangePercent"
  | "dividendYield"
  | "expenseRatio";

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}
