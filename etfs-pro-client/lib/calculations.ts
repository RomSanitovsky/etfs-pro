import type { StockData, QuoteData, AssetType } from "./types";

// Common cryptocurrency symbols that trade with -USD suffix
const CRYPTO_SYMBOLS = new Set([
  "BTC-USD", "ETH-USD", "BNB-USD", "XRP-USD", "ADA-USD", "DOGE-USD",
  "SOL-USD", "DOT-USD", "MATIC-USD", "SHIB-USD", "AVAX-USD", "LINK-USD",
  "LTC-USD", "UNI-USD", "ATOM-USD", "XLM-USD", "ALGO-USD", "VET-USD",
  "FIL-USD", "AAVE-USD", "EOS-USD", "XTZ-USD", "THETA-USD", "XMR-USD",
]);

// Common materials/commodities futures symbols (Yahoo Finance format)
const MATERIALS_SYMBOLS = new Set([
  "GC=F",   // Gold
  "SI=F",   // Silver
  "CL=F",   // Crude Oil (WTI)
  "BZ=F",   // Brent Crude Oil
  "NG=F",   // Natural Gas
  "HG=F",   // Copper
  "PL=F",   // Platinum
  "PA=F",   // Palladium
  "ZC=F",   // Corn
  "ZW=F",   // Wheat
  "ZS=F",   // Soybeans
]);

function isCryptoSymbol(symbol: string): boolean {
  // Check if it's in our known crypto list or ends with -USD (common pattern)
  return CRYPTO_SYMBOLS.has(symbol.toUpperCase()) ||
         (symbol.endsWith("-USD") && !symbol.includes("."));
}

function isMaterialsSymbol(symbol: string): boolean {
  // Check if it's in our known materials list or ends with =F (futures pattern)
  return MATERIALS_SYMBOLS.has(symbol.toUpperCase()) ||
         symbol.endsWith("=F");
}

export function calculatePercentDown(
  currentPrice: number,
  allTimeHigh: number
): number {
  if (allTimeHigh === 0) return 0;
  return ((allTimeHigh - currentPrice) / allTimeHigh) * 100;
}

export function calculatePercentToATH(
  currentPrice: number,
  allTimeHigh: number
): number {
  if (currentPrice === 0) return 0;
  return ((allTimeHigh - currentPrice) / currentPrice) * 100;
}

export function isNearATH(percentDown: number, threshold: number): boolean {
  return percentDown >= 0 && percentDown <= threshold;
}

export function buildStockData(
  quote: QuoteData,
  allTimeHigh: number,
  athDate: Date,
  threshold: number
): StockData {
  // If current price exceeds recorded ATH, we have a new ATH
  const effectiveATH = Math.max(allTimeHigh, quote.regularMarketPrice);
  const effectiveATHDate = quote.regularMarketPrice >= allTimeHigh ? new Date() : athDate;
  
  const percentDown = calculatePercentDown(quote.regularMarketPrice, effectiveATH);
  const percentToATH = calculatePercentToATH(quote.regularMarketPrice, effectiveATH);

  return {
    symbol: quote.symbol,
    name: quote.shortName || quote.symbol,
    currentPrice: quote.regularMarketPrice,
    allTimeHigh: effectiveATH,
    athDate: effectiveATHDate.toISOString(), // Convert to string for JSON serialization
    percentDown,
    percentToATH,
    isNearATH: isNearATH(percentDown, threshold),
    currency: quote.currency || "USD",
    // Pass through the new fields from quote (all fetched in single API call)
    dailyChangePercent: quote.dailyChangePercent,
    dividendYield: quote.dividendYield,
    expenseRatio: quote.expenseRatio,
    // Determine asset type: crypto first, then ETFs (have expense ratios), else stocks
    assetType: determineAssetType(quote.symbol, quote.expenseRatio),
  };
}

function determineAssetType(symbol: string, expenseRatio: number | null): AssetType {
  if (isCryptoSymbol(symbol)) {
    return "crypto";
  }
  if (isMaterialsSymbol(symbol)) {
    return "materials";
  }
  if (expenseRatio !== null) {
    return "etf";
  }
  return "stock";
}

export function formatCurrency(value: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}
