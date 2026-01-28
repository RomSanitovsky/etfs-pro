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
export const PREMIUM_SYMBOL_LIMIT = 1000;
export const PREMIUM_PRICE_MONTHLY = 4;

export const PREMIUM_FEATURES = [
  "Unlimited symbols in watchlist",
  "Portfolio tracking with P&L analytics",
  "Advanced statistics & analytics",
  "Custom ATH threshold alerts",
  "Priority data refresh",
  "Export watchlist data",
  "Custom theme colors",
] as const;

export const FREE_FEATURES = [
  `Up to ${FREE_TIER_SYMBOL_LIMIT} symbols`,
  "Basic statistics",
  "Real-time price tracking",
] as const;
