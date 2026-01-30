import { NextResponse } from "next/server";
import { fetchDetailedQuote, fetchChartData, fetchAllTimeHigh } from "@/lib/yahoo-finance";
import type { TimeRange, StockDetailData } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const { searchParams } = new URL(request.url);
  const range = (searchParams.get("range") as TimeRange) || "1M";

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  try {
    // Fetch quote, chart data, and ATH in parallel
    const [quote, chartData, athData] = await Promise.all([
      fetchDetailedQuote(symbol.toUpperCase()),
      fetchChartData(symbol.toUpperCase(), range),
      fetchAllTimeHigh(symbol.toUpperCase()),
    ]);

    if (!quote) {
      return NextResponse.json(
        { error: `No data found for symbol: ${symbol}` },
        { status: 404 }
      );
    }

    const data: StockDetailData = {
      quote,
      chartData,
      allTimeHigh: athData.allTimeHigh,
      athDate: athData.athDate.toISOString(),
    };

    return NextResponse.json({ data });
  } catch (error) {
    console.error(`API Error for ${symbol}:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch data" },
      { status: 500 }
    );
  }
}
