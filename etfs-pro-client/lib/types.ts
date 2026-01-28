export type AssetType = "etf" | "stock" | "crypto" | "materials";

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

export type AssetFilter = "all" | "etf" | "stock" | "crypto" | "materials";

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

// User and Auth types
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  isPremium: boolean;
  premiumExpiresAt: Date | null;
  watchlist: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export type SubscriptionTier = "free" | "premium";

// Chart and Stock Detail types
export type TimeRange = "1D" | "1W" | "1M" | "1Y" | "5Y";

export interface ChartDataPoint {
  timestamp: number;
  date: string;
  price: number;
}

export interface DetailedQuoteData {
  symbol: string;
  shortName: string;
  longName: string | null;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketOpen: number;
  regularMarketPreviousClose: number;
  regularMarketVolume: number;
  averageDailyVolume3Month: number | null;
  averageDailyVolume10Day: number | null;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  fiftyDayAverage: number | null;
  twoHundredDayAverage: number | null;
  marketCap: number | null;
  trailingPE: number | null;
  forwardPE: number | null;
  beta: number | null;
  epsTrailingTwelveMonths: number | null;
  priceToBook: number | null;
  dividendYield: number | null;
  netExpenseRatio: number | null;
  currency: string;
  exchange: string;
  exchangeTimezoneName: string;
  marketState: string;
  quoteType: string;
}

export interface StockDetailData {
  quote: DetailedQuoteData;
  chartData: ChartDataPoint[];
  allTimeHigh: number;
  athDate: string;
}

// Portfolio types
export interface PortfolioTransaction {
  id: string;
  shares: number;
  pricePerShare: number;
  purchaseDate: string; // ISO date string
  notes?: string;
  createdAt: string; // ISO date string
}

export interface PortfolioHolding {
  symbol: string;
  transactions: PortfolioTransaction[];
  totalShares: number;
  averageCost: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioHoldingWithMetrics extends PortfolioHolding {
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  allocationPercent: number;
  name?: string;
  dividendYield: number | null;
  expectedAnnualDividend: number; // currentValue * dividendYield / 100
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalPnL: number;
  totalPnLPercent: number;
  holdingsCount: number;
  topGainer: { symbol: string; pnlPercent: number } | null;
  topLoser: { symbol: string; pnlPercent: number } | null;
  expectedAnnualDividend: number; // Sum of all holdings' expected dividends
  portfolioDividendYield: number; // expectedAnnualDividend / totalValue * 100
}

export interface AddTransactionInput {
  symbol: string;
  shares: number;
  pricePerShare: number;
  purchaseDate: string;
  notes?: string;
}
