"use client";

import type { DetailedQuoteData } from "@/lib/types";

interface StatsGridProps {
  quote: DetailedQuoteData;
  allTimeHigh: number;
  athDate: string;
}

function formatNumber(value: number | null, decimals: number = 2): string {
  if (value === null || value === undefined) return "—";
  return value.toFixed(decimals);
}

function formatCurrency(value: number | null, currency: string = "USD"): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatLargeNumber(value: number | null): string {
  if (value === null || value === undefined) return "—";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return formatCurrency(value);
}

function formatVolume(value: number | null): string {
  if (value === null || value === undefined) return "—";
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toLocaleString();
}

function formatPercent(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(2)}%`;
}

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
}

function StatCard({ label, value, subValue }: StatCardProps) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-lg font-mono font-semibold text-white">{value}</p>
      {subValue && (
        <p className="text-xs text-slate-500 mt-0.5">{subValue}</p>
      )}
    </div>
  );
}

export function StatsGrid({ quote, allTimeHigh, athDate }: StatsGridProps) {
  const currentPrice = quote.regularMarketPrice;
  const percentFromATH =
    allTimeHigh > 0 ? ((allTimeHigh - currentPrice) / allTimeHigh) * 100 : 0;
  const percentToATH =
    currentPrice > 0 ? ((allTimeHigh - currentPrice) / currentPrice) * 100 : 0;

  const formattedAthDate = new Date(athDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // 52-week range progress
  const fiftyTwoWeekProgress =
    quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow > 0
      ? ((currentPrice - quote.fiftyTwoWeekLow) /
          (quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow)) *
        100
      : 50;

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Market Cap"
          value={formatLargeNumber(quote.marketCap)}
        />
        <StatCard
          label="P/E Ratio"
          value={formatNumber(quote.trailingPE)}
          subValue={
            quote.forwardPE ? `Fwd: ${formatNumber(quote.forwardPE)}` : undefined
          }
        />
        <StatCard
          label="Volume"
          value={formatVolume(quote.regularMarketVolume)}
          subValue={`Avg: ${formatVolume(quote.averageDailyVolume10Day)}`}
        />
        <StatCard label="Beta" value={formatNumber(quote.beta)} />

        <StatCard
          label="52W Low"
          value={formatCurrency(quote.fiftyTwoWeekLow, quote.currency)}
        />
        <StatCard
          label="52W High"
          value={formatCurrency(quote.fiftyTwoWeekHigh, quote.currency)}
        />
        <StatCard
          label="50-Day MA"
          value={formatCurrency(quote.fiftyDayAverage, quote.currency)}
        />
        <StatCard
          label="200-Day MA"
          value={formatCurrency(quote.twoHundredDayAverage, quote.currency)}
        />

        <StatCard
          label="Div Yield"
          value={formatPercent(quote.dividendYield)}
        />
        <StatCard
          label="Exp Ratio"
          value={formatPercent(quote.netExpenseRatio)}
        />
        <StatCard
          label="Day Range"
          value={`${formatCurrency(quote.regularMarketDayLow, quote.currency).replace("$", "")} - ${formatCurrency(quote.regularMarketDayHigh, quote.currency).replace("$", "")}`}
        />
        <StatCard
          label="Prev Close"
          value={formatCurrency(quote.regularMarketPreviousClose, quote.currency)}
        />
      </div>

      {/* 52-Week Range Bar */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
        <p className="text-xs text-slate-400 uppercase tracking-wide mb-3">
          52-Week Range
        </p>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-slate-400">
            {formatCurrency(quote.fiftyTwoWeekLow, quote.currency)}
          </span>
          <div className="flex-1 h-2 bg-slate-700 rounded-full relative">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, fiftyTwoWeekProgress))}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow border-2 border-slate-900"
              style={{ left: `calc(${Math.min(100, Math.max(0, fiftyTwoWeekProgress))}% - 6px)` }}
            />
          </div>
          <span className="text-sm font-mono text-slate-400">
            {formatCurrency(quote.fiftyTwoWeekHigh, quote.currency)}
          </span>
        </div>
      </div>

      {/* ATH Analysis */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
        <p className="text-xs text-slate-400 uppercase tracking-wide mb-3">
          All-Time High Analysis
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-slate-500 mb-1">All-Time High</p>
            <p className="text-lg font-mono font-semibold text-white">
              {formatCurrency(allTimeHigh, quote.currency)}
            </p>
            <p className="text-xs text-slate-500">{formattedAthDate}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Current vs ATH</p>
            <p
              className={`text-lg font-mono font-semibold ${
                percentFromATH <= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {percentFromATH <= 0 ? "At ATH" : `-${percentFromATH.toFixed(2)}%`}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Needed to reach ATH</p>
            <p
              className={`text-lg font-mono font-semibold ${
                percentToATH <= 0 ? "text-green-400" : "text-amber-400"
              }`}
            >
              {percentToATH <= 0 ? "At ATH" : `+${percentToATH.toFixed(2)}%`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
