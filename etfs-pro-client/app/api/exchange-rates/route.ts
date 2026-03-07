import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

// Currencies that need exchange rate lookup (USD is the base, so rate is 1)
const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "EURUSD=X",
  GBP: "GBPUSD=X",
  JPY: "JPYUSD=X",
  ILS: "ILSUSD=X",
  CHF: "CHFUSD=X",
  CAD: "CADUSD=X",
  AUD: "AUDUSD=X",
};

// Simple in-memory cache
let cachedRates: Record<string, number> | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

async function fetchExchangeRates(): Promise<Record<string, number>> {
  // Check cache
  const now = Date.now();
  if (cachedRates && now - cacheTimestamp < CACHE_DURATION) {
    return cachedRates;
  }

  const rates: Record<string, number> = { USD: 1 };

  const symbols = Object.values(CURRENCY_SYMBOLS);

  try {
    const results = await yahooFinance.quote(symbols);
    const quotes = Array.isArray(results) ? results : [results];

    for (const quote of quotes) {
      // Find which currency this symbol represents
      const entry = Object.entries(CURRENCY_SYMBOLS).find(
        ([, sym]) => sym === quote.symbol
      );
      if (entry) {
        const [currency] = entry;
        // regularMarketPrice gives us the exchange rate (e.g., 1 EUR = X USD)
        rates[currency] = quote.regularMarketPrice || 1;
      }
    }
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    // Return fallback rates if API fails
    return {
      USD: 1,
      EUR: 1.08,
      GBP: 1.27,
      JPY: 0.0067,
      ILS: 0.27,
      CHF: 1.12,
      CAD: 0.74,
      AUD: 0.65,
    };
  }

  // Update cache
  cachedRates = rates;
  cacheTimestamp = now;

  return rates;
}

export async function GET() {
  try {
    const rates = await fetchExchangeRates();
    return NextResponse.json({ rates });
  } catch (error) {
    console.error("Exchange rates API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch exchange rates" },
      { status: 500 }
    );
  }
}
