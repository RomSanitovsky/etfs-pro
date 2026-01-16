import { NextResponse } from "next/server";
import { fetchQuotes, fetchAllTimeHighsBatch } from "@/lib/yahoo-finance";
import { buildStockData } from "@/lib/calculations";
import { DEFAULT_ATH_THRESHOLD } from "@/lib/constants";
import type { StockData } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get("symbols");
  const threshold = Number(searchParams.get("threshold")) || DEFAULT_ATH_THRESHOLD;

  if (!symbolsParam) {
    return NextResponse.json({ error: "symbols parameter required" }, { status: 400 });
  }

  const symbols = symbolsParam.split(",").map((s) => s.trim().toUpperCase());

  try {
    // Fetch current quotes and ATH data in parallel
    const [quotes, athMap] = await Promise.all([
      fetchQuotes(symbols),
      fetchAllTimeHighsBatch(symbols),
    ]);

    const stockData: StockData[] = quotes.map((quote) => {
      const athData = athMap.get(quote.symbol) || {
        allTimeHigh: quote.regularMarketPrice,
        athDate: new Date(),
      };

      return buildStockData(quote, athData.allTimeHigh, athData.athDate, threshold);
    });

    return NextResponse.json({ data: stockData });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch data" },
      { status: 500 }
    );
  }
}
