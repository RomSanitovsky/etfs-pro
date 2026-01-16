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
  accentColor: "cyan" | "purple" | "amber" | "red" | "green";
  glowIntensity?: "low" | "medium" | "high";
}

function StatCard({ title, value, subtitle, icon, accentColor, glowIntensity = "medium" }: StatCardProps) {
  const colorClasses = {
    cyan: {
      text: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30",
      glow: "shadow-cyan-500/20",
      gradientFrom: "from-cyan-500/20",
      iconBg: "bg-cyan-500/20",
    },
    purple: {
      text: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      glow: "shadow-purple-500/20",
      gradientFrom: "from-purple-500/20",
      iconBg: "bg-purple-500/20",
    },
    amber: {
      text: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      glow: "shadow-amber-500/20",
      gradientFrom: "from-amber-500/20",
      iconBg: "bg-amber-500/20",
    },
    red: {
      text: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      glow: "shadow-red-500/20",
      gradientFrom: "from-red-500/20",
      iconBg: "bg-red-500/20",
    },
    green: {
      text: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      glow: "shadow-emerald-500/20",
      gradientFrom: "from-emerald-500/20",
      iconBg: "bg-emerald-500/20",
    },
  };

  const colors = colorClasses[accentColor];
  const glowShadow = glowIntensity === "high" 
    ? `shadow-lg ${colors.glow}` 
    : glowIntensity === "medium" 
    ? `shadow-md ${colors.glow}` 
    : "";

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border ${colors.border}
        bg-gradient-to-br ${colors.gradientFrom} to-transparent
        backdrop-blur-sm ${glowShadow}
        transition-all duration-300 hover:scale-[1.02] hover:border-opacity-60
        group
      `}
    >
      {/* Animated scan line */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className={`absolute h-px w-full ${colors.text} animate-scan-line`} style={{ background: `linear-gradient(90deg, transparent, currentColor, transparent)` }} />
      </div>
      
      {/* Corner accents */}
      <div className={`absolute top-0 left-0 w-3 h-3 border-t border-l ${colors.border} rounded-tl-xl`} />
      <div className={`absolute top-0 right-0 w-3 h-3 border-t border-r ${colors.border} rounded-tr-xl`} />
      <div className={`absolute bottom-0 left-0 w-3 h-3 border-b border-l ${colors.border} rounded-bl-xl`} />
      <div className={`absolute bottom-0 right-0 w-3 h-3 border-b border-r ${colors.border} rounded-br-xl`} />

      <div className="relative p-4">
        {/* Header with icon */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-mono tracking-widest text-slate-400 uppercase">
            {title}
          </span>
          <div className={`p-1.5 rounded-lg ${colors.iconBg}`}>
            {icon}
          </div>
        </div>

        {/* Main value */}
        <div className={`text-3xl font-bold ${colors.text} font-mono tracking-tight mb-1`}>
          {value}
        </div>

        {/* Subtitle */}
        <div className="text-sm text-slate-400 truncate">
          {subtitle}
        </div>

        {/* Bottom accent line */}
        <div className={`absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent ${colors.gradientFrom.replace('from-', 'via-')} to-transparent`} />
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
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        <span className="text-sm font-mono tracking-[0.3em] text-slate-400 uppercase">
          Market Insights
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Deepest Discount */}
        <StatCard
          title="Deepest Discount"
          value={`-${stats.deepestDiscount.percentDown.toFixed(1)}%`}
          subtitle={stats.deepestDiscount.symbol}
          accentColor="red"
          glowIntensity="medium"
          icon={
            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          }
        />

        {/* Closest to ATH */}
        {stats.closestToATH && (
          <StatCard
            title="Nearest Peak"
            value={`-${stats.closestToATH.percentDown.toFixed(1)}%`}
            subtitle={stats.closestToATH.symbol}
            accentColor="amber"
            glowIntensity="medium"
            icon={
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            }
          />
        )}

        {/* At ATH */}
        <StatCard
          title="At All-Time High"
          value={stats.atATHCount.toString()}
          subtitle={stats.atATHCount === 1 ? "asset" : "assets"}
          accentColor="cyan"
          glowIntensity="high"
          icon={
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
        />

        {/* Top Performer */}
        {stats.topPerformer && stats.topPerformer.dailyChangePercent !== null && (
          <StatCard
            title="Top Performer"
            value={`${stats.topPerformer.dailyChangePercent >= 0 ? '+' : ''}${stats.topPerformer.dailyChangePercent.toFixed(2)}%`}
            subtitle={stats.topPerformer.symbol}
            accentColor="green"
            glowIntensity="medium"
            icon={
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
        )}

        {/* Avg Distance from ATH */}
        <StatCard
          title="Avg from Peak"
          value={`-${stats.avgPercentDown.toFixed(1)}%`}
          subtitle={`across ${stats.totalStocks} assets`}
          accentColor="purple"
          glowIntensity="low"
          icon={
            <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
      </div>
    </div>
  );
}
