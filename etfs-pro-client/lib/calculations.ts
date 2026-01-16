import type { StockData, QuoteData } from "./types";

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
  // Only show "near ATH" when price is below ATH but within threshold
  // percentDown > 0 means price is below ATH
  // percentDown <= 0 means price is at or above ATH (not "near", it's AT)
  return percentDown > 0 && percentDown <= threshold;
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
    // Determine asset type: ETFs have expense ratios, stocks don't
    assetType: quote.expenseRatio !== null ? "etf" : "stock",
  };
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
