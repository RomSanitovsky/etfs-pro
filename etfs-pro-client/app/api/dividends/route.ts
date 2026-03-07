import { NextRequest, NextResponse } from "next/server";
import { fetchDividendInfo } from "@/lib/yahoo-finance";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbolsParam = searchParams.get("symbols");

  if (!symbolsParam) {
    return NextResponse.json(
      { error: "Missing symbols parameter" },
      { status: 400 }
    );
  }

  const symbols = symbolsParam
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  if (symbols.length === 0) {
    return NextResponse.json(
      { error: "No valid symbols provided" },
      { status: 400 }
    );
  }

  try {
    const dividendData = await fetchDividendInfo(symbols);
    return NextResponse.json({ data: dividendData });
  } catch (error) {
    console.error("Error fetching dividend data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dividend data" },
      { status: 500 }
    );
  }
}
