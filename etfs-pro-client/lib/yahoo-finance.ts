import YahooFinance from "yahoo-finance2";
import type { QuoteData, TimeRange, ChartDataPoint, DetailedQuoteData } from "./types";

// Create instance for v3.x API
const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

// Simple delay function
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock data for fallback when API fails
const MOCK_DATA: Record<string, { price: number; ath: number; athDate: string; name: string }> = {
  VOO: { price: 548.23, ath: 563.95, athDate: "2025-01-10", name: "Vanguard S&P 500 ETF" },
  QQQ: { price: 525.67, ath: 542.81, athDate: "2024-12-16", name: "Invesco QQQ Trust" },
  XLP: { price: 81.45, ath: 83.22, athDate: "2025-01-08", name: "Consumer Staples Select Sector" },
  XLK: { price: 228.90, ath: 240.76, athDate: "2024-12-16", name: "Technology Select Sector" },
  XLY: { price: 212.34, ath: 225.48, athDate: "2024-11-29", name: "Consumer Discretionary Select" },
  AAPL: { price: 229.87, ath: 260.10, athDate: "2024-12-26", name: "Apple Inc." },
  NVDA: { price: 136.24, ath: 152.89, athDate: "2025-01-06", name: "NVIDIA Corporation" },
  MSFT: { price: 425.22, ath: 468.35, athDate: "2024-07-05", name: "Microsoft Corporation" },
};

// Retry wrapper
async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 2,
  delayMs: number = 500
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < retries - 1) {
        await delay(delayMs * (i + 1));
      }
    }
  }

  throw lastError;
}

export async function fetchQuotes(symbols: string[]): Promise<QuoteData[]> {
  if (symbols.length === 0) return [];

  try {
    const results = await withRetry(() => yahooFinance.quote(symbols));
    const quotes = Array.isArray(results) ? results : [results];

    return quotes.map((quote) => {
      // Extract fields - use type assertion for fields not in base types
      const q = quote as typeof quote & {
        dividendYield?: number;
        netExpenseRatio?: number;
      };
      
      return {
        symbol: q.symbol,
        shortName: q.shortName || q.longName || q.symbol,
        regularMarketPrice: q.regularMarketPrice || 0,
        currency: q.currency || "USD",
        // All three new fields come from the same quote() call - no extra API calls!
        dailyChangePercent: q.regularMarketChangePercent ?? null,
        dividendYield: q.dividendYield ?? null,
        expenseRatio: q.netExpenseRatio ?? null,
      };
    });
  } catch (error) {
    console.error("Error fetching quotes, using mock data:", error);
    // Fallback to mock data
    return symbols.map((symbol) => {
      const mock = MOCK_DATA[symbol];
      return {
        symbol,
        shortName: mock?.name || symbol,
        regularMarketPrice: mock?.price || 100,
        currency: "USD",
        dailyChangePercent: null,
        dividendYield: null,
        expenseRatio: null,
      };
    });
  }
}

export async function fetchAllTimeHigh(
  symbol: string
): Promise<{ allTimeHigh: number; athDate: Date }> {
  try {
    const result = await withRetry(() =>
      yahooFinance.chart(symbol, {
        period1: "1970-01-01",
        interval: "1wk",
      })
    );

    if (!result.quotes || result.quotes.length === 0) {
      throw new Error(`No historical data for ${symbol}`);
    }

    // Goal: Find absolute intraday high, split-adjusted but NOT dividend-adjusted
    // 
    // Problem: Yahoo's 'high' field can have unadjusted pre-split prices mixed in
    // Solution: Apply split adjustment factor (adjclose/close) to normalize high prices
    // This captures split adjustments while keeping dividend effects minimal
    //
    // The key insight: For split-adjusted prices that ignore dividends, we can use:
    // adjustedHigh = high * (quote.adjclose / quote.close)
    // This applies the same split+dividend adjustment ratio to high as was applied to close
    // Dividend effects are typically <1% per year, so this is close to split-only adjustment
    
    const quotes = result.quotes;
    let maxHigh = 0;
    let maxHighDate = new Date();
    
    // Calculate average high/close ratio from recent quotes (post-split data)
    // This helps detect when historical data has pre-split prices mixed in
    let recentRatioSum = 0;
    let recentRatioCount = 0;
    const recentQuotesCount = Math.min(10, quotes.length);
    for (let i = quotes.length - recentQuotesCount; i < quotes.length; i++) {
      const q = quotes[i];
      if (q.high && q.close && q.close > 0) {
        recentRatioSum += q.high / q.close;
        recentRatioCount++;
      }
    }
    const avgRecentRatio = recentRatioCount > 0 ? recentRatioSum / recentRatioCount : 1.02;
    
    for (const quote of quotes) {
      if (!quote.high || !quote.close || !quote.adjclose) continue;
      
      // Detect data inconsistency: if high/close ratio is abnormally high (>2x normal),
      // it likely means high is pre-split while close is post-split
      // This happens when Yahoo Finance's data is inconsistent around split dates
      const highCloseRatio = quote.high / quote.close;
      const isLikelySplitInconsistency = highCloseRatio > avgRecentRatio * 2;
      
      let adjustedHigh: number;
      
      if (isLikelySplitInconsistency) {
        // Data inconsistency detected: high is pre-split, close is post-split
        // Calculate the split ratio from the ratio difference and apply it
        const inferredSplitRatio = highCloseRatio / avgRecentRatio;
        adjustedHigh = quote.high / inferredSplitRatio;
      } else {
        // Normal case: apply split adjustment using adjclose/close ratio
        // This gives split-adjusted high (with minimal dividend effect)
        // For most stocks, dividend adjustments are <1% per year, so this is effectively split-only
        adjustedHigh = quote.high * (quote.adjclose / quote.close);
      }
      
      if (adjustedHigh > maxHigh) {
        maxHigh = adjustedHigh;
        maxHighDate = quote.date;
      }
    }

    return {
      allTimeHigh: maxHigh,
      athDate: maxHighDate,
    };
  } catch (error) {
    console.error(`Error fetching ATH for ${symbol}, using mock:`, error);
    // Fallback to mock data
    const mock = MOCK_DATA[symbol];
    return {
      allTimeHigh: mock?.ath || 100,
      athDate: mock?.athDate ? new Date(mock.athDate) : new Date(),
    };
  }
}

export async function fetchAllTimeHighsBatch(
  symbols: string[]
): Promise<Map<string, { allTimeHigh: number; athDate: Date }>> {
  const results = new Map<string, { allTimeHigh: number; athDate: Date }>();

  // Fetch sequentially to avoid rate limiting
  for (const symbol of symbols) {
    const athData = await fetchAllTimeHigh(symbol);
    results.set(symbol, athData);
    await delay(50);
  }

  return results;
}

// Time range configuration for chart data
const TIME_RANGE_CONFIG: Record<TimeRange, { period1: string; interval: "1m" | "5m" | "1d" | "1wk" }> = {
  "1D": { period1: "1d", interval: "5m" },
  "1W": { period1: "1w", interval: "1d" },
  "1M": { period1: "1mo", interval: "1d" },
  "1Y": { period1: "1y", interval: "1d" },
  "5Y": { period1: "5y", interval: "1wk" },
};

export async function fetchChartData(
  symbol: string,
  range: TimeRange
): Promise<ChartDataPoint[]> {
  try {
    const config = TIME_RANGE_CONFIG[range];

    // Use period2 as now and calculate period1 based on range
    const now = new Date();
    let period1Date: Date;

    switch (range) {
      case "1D":
        period1Date = new Date(now);
        period1Date.setDate(period1Date.getDate() - 1);
        break;
      case "1W":
        period1Date = new Date(now);
        period1Date.setDate(period1Date.getDate() - 7);
        break;
      case "1M":
        period1Date = new Date(now);
        period1Date.setMonth(period1Date.getMonth() - 1);
        break;
      case "1Y":
        period1Date = new Date(now);
        period1Date.setFullYear(period1Date.getFullYear() - 1);
        break;
      case "5Y":
        period1Date = new Date(now);
        period1Date.setFullYear(period1Date.getFullYear() - 5);
        break;
    }

    const result = await withRetry(() =>
      yahooFinance.chart(symbol, {
        period1: period1Date,
        period2: now,
        interval: config.interval,
      })
    );

    if (!result.quotes || result.quotes.length === 0) {
      return [];
    }

    return result.quotes
      .filter((q) => q.close !== null && q.close !== undefined)
      .map((q) => ({
        timestamp: q.date.getTime(),
        date: q.date.toISOString(),
        price: q.close as number,
      }));
  } catch (error) {
    console.error(`Error fetching chart data for ${symbol}:`, error);
    return [];
  }
}

export async function fetchDetailedQuote(symbol: string): Promise<DetailedQuoteData | null> {
  try {
    const result = await withRetry(() => yahooFinance.quote(symbol));

    // Type assertion for extended fields
    const q = result as typeof result & {
      dividendYield?: number;
      netExpenseRatio?: number;
      beta?: number;
      epsTrailingTwelveMonths?: number;
      priceToBook?: number;
      forwardPE?: number;
    };

    return {
      symbol: q.symbol,
      shortName: q.shortName || q.symbol,
      longName: q.longName || null,
      regularMarketPrice: q.regularMarketPrice || 0,
      regularMarketChange: q.regularMarketChange || 0,
      regularMarketChangePercent: q.regularMarketChangePercent || 0,
      regularMarketDayHigh: q.regularMarketDayHigh || 0,
      regularMarketDayLow: q.regularMarketDayLow || 0,
      regularMarketOpen: q.regularMarketOpen || 0,
      regularMarketPreviousClose: q.regularMarketPreviousClose || 0,
      regularMarketVolume: q.regularMarketVolume || 0,
      averageDailyVolume3Month: q.averageDailyVolume3Month ?? null,
      averageDailyVolume10Day: q.averageDailyVolume10Day ?? null,
      fiftyTwoWeekHigh: q.fiftyTwoWeekHigh || 0,
      fiftyTwoWeekLow: q.fiftyTwoWeekLow || 0,
      fiftyDayAverage: q.fiftyDayAverage ?? null,
      twoHundredDayAverage: q.twoHundredDayAverage ?? null,
      marketCap: q.marketCap ?? null,
      trailingPE: q.trailingPE ?? null,
      forwardPE: q.forwardPE ?? null,
      beta: q.beta ?? null,
      epsTrailingTwelveMonths: q.epsTrailingTwelveMonths ?? null,
      priceToBook: q.priceToBook ?? null,
      dividendYield: q.dividendYield ?? null,
      netExpenseRatio: q.netExpenseRatio ?? null,
      currency: q.currency || "USD",
      exchange: q.fullExchangeName || q.exchange || "Unknown",
      exchangeTimezoneName: q.exchangeTimezoneName || "America/New_York",
      marketState: q.marketState || "CLOSED",
      quoteType: q.quoteType || "EQUITY",
    };
  } catch (error) {
    console.error(`Error fetching detailed quote for ${symbol}:`, error);
    return null;
  }
}
