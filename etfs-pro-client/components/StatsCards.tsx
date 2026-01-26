"use client";

import { useMemo } from "react";
import type { StockData } from "@/lib/types";

interface StatsCardsProps {
  stocks: StockData[];
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  valueColor?: "default" | "red" | "green";
}

function StatCard({ title, value, subtitle, icon, valueColor = "default" }: StatCardProps) {
  const valueColorClass =
    valueColor === "red" ? "text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]" :
    valueColor === "green" ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" :
    "text-white";

  return (
    <div className="group relative rounded-xl p-4 transition-all duration-300 hover:scale-[1.03] overflow-hidden">
      {/* Outer glow on hover */}
      <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-cyan-500/40 via-purple-500/40 to-cyan-500/40 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500" />

      {/* Gradient border - stronger cyan/purple */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/50 via-purple-600/30 to-cyan-400/50 p-[1px]">
        <div className="absolute inset-[1px] rounded-xl bg-[#0a0b0f]/95" />
      </div>

      {/* Inner gradient overlay */}
      <div className="absolute inset-[1px] rounded-xl bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10" />

      {/* Animated shine effect on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header with icon */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold tracking-wide bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent uppercase">
            {title}
          </span>
          <div className="text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]">
            {icon}
          </div>
        </div>

        {/* Main value - fixed height for alignment */}
        <div className={`text-2xl font-bold ${valueColorClass} font-mono tracking-tight h-8 flex items-center`}>
          {value}
        </div>

        {/* Subtitle */}
        <div className="text-sm text-slate-400 truncate mt-1">
          {subtitle}
        </div>
      </div>
    </div>
  );
}

export function StatsCards({ stocks }: StatsCardsProps) {
  const stats = useMemo(() => {
    if (stocks.length === 0) {
      return null;
    }

    // Deepest Discount - furthest from ATH (highest percentDown)
    const deepestDiscount = stocks.reduce((max, stock) =>
      stock.percentDown > max.percentDown ? stock : max
    , stocks[0]);

    // Closest to ATH - find the stock with the smallest percentDown that's not exactly at ATH
    // This shows the absolute closest, regardless of threshold (since "At All-Time High" already shows those)
    const notExactlyAtATH = stocks.filter(s => s.percentDown > 0);
    const closestToATH = notExactlyAtATH.length > 0
      ? notExactlyAtATH.reduce((min, stock) =>
          stock.percentDown < min.percentDown ? stock : min
        , notExactlyAtATH[0])
      : null;

    // At/Near ATH count - stocks that are at or near their all-time high (within threshold)
    const atATHCount = stocks.filter(s => s.isNearATH || s.percentDown === 0).length;

    // Best daily performer
    const withDailyChange = stocks.filter(s => s.dailyChangePercent !== null);
    const topPerformer = withDailyChange.length > 0
      ? withDailyChange.reduce((max, stock) =>
          (stock.dailyChangePercent ?? -Infinity) > (max.dailyChangePercent ?? -Infinity) ? stock : max
        , withDailyChange[0])
      : null;

    // Worst daily performer
    const worstPerformer = withDailyChange.length > 0
      ? withDailyChange.reduce((min, stock) =>
          (stock.dailyChangePercent ?? Infinity) < (min.dailyChangePercent ?? Infinity) ? stock : min
        , withDailyChange[0])
      : null;

    // Average distance from ATH
    const avgPercentDown = stocks.reduce((sum, s) => sum + s.percentDown, 0) / stocks.length;

    return {
      deepestDiscount,
      closestToATH,
      atATHCount,
      topPerformer,
      worstPerformer,
      avgPercentDown,
      totalStocks: stocks.length,
    };
  }, [stocks]);

  if (!stats) {
    return null;
  }

  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        <span className="text-xs font-semibold tracking-widest bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent uppercase">
          Market Insights
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Deepest Discount */}
        <StatCard
          title="Deepest Discount"
          value={`-${stats.deepestDiscount.percentDown.toFixed(1)}%`}
          subtitle={stats.deepestDiscount.symbol}
          valueColor="red"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          }
        />

        {/* Closest to ATH */}
        {stats.closestToATH && (
          <StatCard
            title="Nearest Peak"
            value={`-${stats.closestToATH.percentDown.toFixed(1)}%`}
            subtitle={stats.closestToATH.symbol}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            }
          />
        )}

        {/* At ATH */}
        <StatCard
          title="At All-Time High"
          value={stats.atATHCount.toString()}
          subtitle={stats.atATHCount === 1 ? "asset" : "assets"}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
        />

        {/* Top Performer */}
        {stats.topPerformer && stats.topPerformer.dailyChangePercent !== null && (
          <StatCard
            title="Top Performer"
            value={`${stats.topPerformer.dailyChangePercent >= 0 ? '+' : ''}${stats.topPerformer.dailyChangePercent.toFixed(2)}%`}
            subtitle={stats.topPerformer.symbol}
            valueColor={stats.topPerformer.dailyChangePercent >= 0 ? "green" : "red"}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
        )}

        {/* Avg Distance from ATH */}
        <StatCard
          title="Avg from Peak"
          value={`-${stats.avgPercentDown.toFixed(1)}%`}
          subtitle={`across ${stats.totalStocks} assets`}
          valueColor="red"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
      </div>
    </div>
  );
}
