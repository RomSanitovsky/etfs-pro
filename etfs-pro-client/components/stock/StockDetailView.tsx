"use client";

import { useState } from "react";
import Link from "next/link";
import type { StockDetailData, TimeRange, ChartDataPoint } from "@/lib/types";
import { TimeRangeSelector } from "./TimeRangeSelector";
import { PriceChart } from "./PriceChart";
import { StatsGrid } from "./StatsGrid";

interface StockDetailViewProps {
  initialData: StockDetailData;
}

function formatCurrency(value: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function StockDetailView({ initialData }: StockDetailViewProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>("1M");
  const [chartData, setChartData] = useState<ChartDataPoint[]>(
    initialData.chartData
  );
  const [loading, setLoading] = useState(false);

  const { quote, allTimeHigh, athDate } = initialData;

  const handleRangeChange = async (range: TimeRange) => {
    if (range === selectedRange) return;

    setSelectedRange(range);
    setLoading(true);

    try {
      const response = await fetch(
        `/api/stock/${quote.symbol}?range=${range}`
      );
      const result = await response.json();

      if (result.data?.chartData) {
        setChartData(result.data.chartData);
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  const priceChange = quote.regularMarketChange;
  const priceChangePercent = quote.regularMarketChangePercent;
  const isPositive = priceChange >= 0;

  // Market state indicator
  const getMarketStateIndicator = () => {
    switch (quote.marketState) {
      case "REGULAR":
        return { text: "Market Open", color: "bg-gain" };
      case "PRE":
        return { text: "Pre-Market", color: "bg-gold" };
      case "POST":
      case "POSTPOST":
        return { text: "After Hours", color: "bg-gold" };
      default:
        return { text: "Market Closed", color: "bg-subtle" };
    }
  };

  const marketState = getMarketStateIndicator();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg bg-surface hover:bg-surface-alt transition-colors"
          >
            <svg
              className="w-5 h-5 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {quote.symbol}
              </h1>
              <span className="px-2 py-0.5 text-xs font-medium bg-surface-alt text-foreground rounded">
                {quote.quoteType}
              </span>
            </div>
            <p className="text-muted">
              {quote.longName || quote.shortName}
            </p>
            <p className="text-xs text-subtle mt-0.5">{quote.exchange}</p>
          </div>
        </div>
      </div>

      {/* Price Display */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-4xl md:text-5xl font-bold font-mono text-foreground">
            {formatCurrency(quote.regularMarketPrice, quote.currency)}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span
              className={`text-lg font-mono ${
                isPositive ? "text-gain" : "text-loss"
              }`}
            >
              {isPositive ? "+" : ""}
              {formatCurrency(priceChange, quote.currency)} (
              {isPositive ? "+" : ""}
              {priceChangePercent.toFixed(2)}%)
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${marketState.color}`}
              />
              <span className="text-sm text-muted">{marketState.text}</span>
            </div>
          </div>
        </div>
        <TimeRangeSelector
          selected={selectedRange}
          onSelect={handleRangeChange}
          loading={loading}
        />
      </div>

      {/* Chart */}
      <div className="bg-background/50 rounded-lg p-4 border border-[var(--theme-card-border)]">
        <PriceChart data={chartData} range={selectedRange} loading={loading} />
      </div>

      {/* Stats */}
      <StatsGrid quote={quote} allTimeHigh={allTimeHigh} athDate={athDate} />
    </div>
  );
}
