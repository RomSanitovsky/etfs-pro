export const DEFAULT_SYMBOLS = [
  "VOO",
  "QQQ",
  "XLP",
  "XLK",
  "XLY",
  "AAPL",
  "NVDA",
  "MSFT",
];

export const DEFAULT_ATH_THRESHOLD = 1; // 1% - stocks within this % of ATH get badge

export const ATH_CACHE_DURATION_DAYS = 7;

export const STORAGE_KEYS = {
  WATCHLIST: "etfs-pro-watchlist",
  ATH_CACHE: "etfs-pro-ath-cache",
  ATH_THRESHOLD: "etfs-pro-ath-threshold",
} as const;
