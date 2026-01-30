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
    const results = await yahooFinance.search(query, {
      quotesCount: 8,
      newsCount: 0,
    });

    const suggestions = (results.quotes || [])
      .filter((quote) => quote.symbol && quote.quoteType !== "OPTION")
      .map((quote) => ({
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
