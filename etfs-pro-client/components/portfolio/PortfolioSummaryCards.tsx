"use client";

import type { PortfolioSummary } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";

interface PortfolioSummaryCardsProps {
  summary: PortfolioSummary;
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  valueColor?: "default" | "red" | "green";
}

function StatCard({ title, value, subtitle, icon, valueColor = "default" }: StatCardProps) {
  const valueColorClass =
    valueColor === "red" ? "text-loss drop-shadow-[0_0_10px_var(--theme-loss)]" :
    valueColor === "green" ? "text-gain drop-shadow-[0_0_10px_var(--theme-gain)]" :
    "text-foreground";

  return (
    <div className="group relative rounded-xl p-4 transition-all duration-300 hover:scale-[1.03] overflow-hidden">
      {/* Outer glow on hover */}
      <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-cosmic/40 via-nebula/40 to-cosmic/40 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500" />

      {/* Gradient border */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cosmic/50 via-nebula/30 to-cosmic/50 p-[1px]">
        <div className="absolute inset-[1px] rounded-xl bg-background/95" />
      </div>

      {/* Inner gradient overlay */}
      <div className="absolute inset-[1px] rounded-xl bg-gradient-to-br from-cosmic/10 via-transparent to-nebula/10" />

      {/* Animated shine effect on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-cosmic/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold tracking-wide bg-gradient-to-r from-cosmic to-cosmic bg-clip-text text-transparent uppercase">
            {title}
          </span>
          <div className="text-cosmic group-hover:text-cosmic transition-colors duration-300 drop-shadow-[0_0_6px_var(--theme-accent-secondary)]">
            {icon}
          </div>
        </div>

        <div className={`text-2xl font-bold ${valueColorClass} font-mono tracking-tight h-8 flex items-center`}>
          {value}
        </div>

        {subtitle && (
          <div className="text-sm text-muted truncate mt-1">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

export function PortfolioSummaryCards({ summary }: PortfolioSummaryCardsProps) {
  const pnlColor = summary.totalPnL >= 0 ? "green" : "red";
  const pnlSign = summary.totalPnL >= 0 ? "+" : "";

  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cosmic/50 to-transparent" />
        <span className="text-xs font-semibold tracking-widest bg-gradient-to-r from-cosmic via-nebula to-cosmic bg-clip-text text-transparent uppercase">
          Portfolio Overview
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cosmic/50 to-transparent" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Value */}
        <StatCard
          title="Total Value"
          value={formatCurrency(summary.totalValue)}
          subtitle={`${summary.holdingsCount} holdings`}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        {/* Total Cost */}
        <StatCard
          title="Total Cost"
          value={formatCurrency(summary.totalCost)}
          subtitle="invested"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
        />

        {/* Total P&L */}
        <StatCard
          title="Unrealized P&L"
          value={`${pnlSign}${formatCurrency(Math.abs(summary.totalPnL))}`}
          subtitle={`${pnlSign}${summary.totalPnLPercent.toFixed(2)}%`}
          valueColor={pnlColor}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />

        {/* Annual Dividend */}
        <StatCard
          title="Annual Dividend"
          value={formatCurrency(summary.expectedAnnualDividend)}
          subtitle={`${summary.portfolioDividendYield.toFixed(2)}% yield`}
          valueColor="green"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />

        {/* Top Gainer */}
        {summary.topGainer && (
          <StatCard
            title="Top Gainer"
            value={`${summary.topGainer.pnlPercent >= 0 ? "+" : ""}${summary.topGainer.pnlPercent.toFixed(2)}%`}
            subtitle={summary.topGainer.symbol}
            valueColor="green"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            }
          />
        )}

        {/* Top Loser */}
        {summary.topLoser && (
          <StatCard
            title="Top Loser"
            value={`${summary.topLoser.pnlPercent >= 0 ? "+" : ""}${summary.topLoser.pnlPercent.toFixed(2)}%`}
            subtitle={summary.topLoser.symbol}
            valueColor="red"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            }
          />
        )}
      </div>
    </div>
  );
}
