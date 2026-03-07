import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    // Use validateResult: false to avoid schema validation errors
    // Yahoo Finance API sometimes returns data with slightly different formats
    const results = await yahooFinance.search(query, {
      quotesCount: 8,
      newsCount: 0,
    }, { validateResult: false }) as { quotes?: Record<string, unknown>[] };

    const suggestions = (results.quotes || [])
      .filter((quote: Record<string, unknown>) => quote.symbol && quote.quoteType !== "OPTION")
      .map((quote: Record<string, unknown>) => ({
        symbol: quote.symbol,
        name: quote.shortname || quote.longname || quote.symbol,
        type: quote.quoteType || "EQUITY",
        exchange: quote.exchange || "",
      }));

    return NextResponse.json({ results: suggestions });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ results: [] });
  }
}
