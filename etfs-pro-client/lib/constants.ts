export const DEFAULT_SYMBOLS = [
  "VOO",
  "QQQ",
  "XLP",
  "XLK",
  "XLY",
  "AAPL",
  "NVDA",
  "MSFT",
  "BTC-USD",
  "ETH-USD",
  "GC=F",   // Gold
  "SI=F",   // Silver
  "CL=F",   // Crude Oil
];

// Bump this version when adding new DEFAULT_SYMBOLS so existing users get them
export const DEFAULTS_VERSION = 2;

export const DEFAULT_ATH_THRESHOLD = 1; // 1% - stocks within this % of ATH get badge

export const ATH_CACHE_DURATION_DAYS = 7;

export const STORAGE_KEYS = {
  WATCHLIST: "etfs-pro-watchlist",
  ATH_CACHE: "etfs-pro-ath-cache",
  ATH_THRESHOLD: "etfs-pro-ath-threshold",
} as const;

// Subscription tier limits
export const FREE_TIER_SYMBOL_LIMIT = 15;
export const PREMIUM_SYMBOL_LIMIT = 150;
export const PREMIUM_PRICE_MONTHLY = 9.99;

export const PREMIUM_FEATURES = [
  "Up to 150 symbols in watchlist",
  "Portfolio tracking with P&L analytics",
  "Dividend calendar & income tracking",
  "Export to CSV (watchlist & portfolio)",
  "Advanced statistics & analytics",
  "Custom ATH threshold alerts",
  "Custom theme colors",
] as const;

export const FREE_FEATURES = [
  `Up to ${FREE_TIER_SYMBOL_LIMIT} symbols`,
  "Basic statistics",
  "Real-time price tracking",
] as const;

// Cash holdings
export const CASH_SYMBOL_PREFIX = "CASH-";

export const CASH_CURRENCIES = [
  { code: "USD" as const, name: "US Dollar", symbol: "$" },
  { code: "EUR" as const, name: "Euro", symbol: "€" },
  { code: "GBP" as const, name: "British Pound", symbol: "£" },
  { code: "JPY" as const, name: "Japanese Yen", symbol: "¥" },
  { code: "ILS" as const, name: "Israeli Shekel", symbol: "₪" },
  { code: "CHF" as const, name: "Swiss Franc", symbol: "CHF" },
  { code: "CAD" as const, name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD" as const, name: "Australian Dollar", symbol: "A$" },
] as const;

export function getCurrencySymbol(code: string): string {
  const currency = CASH_CURRENCIES.find((c) => c.code === code);
  return currency?.symbol ?? code;
}

export function getCurrencyName(code: string): string {
  const currency = CASH_CURRENCIES.find((c) => c.code === code);
  return currency?.name ?? code;
}
