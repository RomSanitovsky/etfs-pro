"use client";

import Link from "next/link";
import type { StockData } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import { ATHBadge } from "./ATHBadge";

interface WatchlistMobileCardProps {
  stock: StockData;
  onRemove: (symbol: string) => void;
  onAddToPortfolio?: (symbol: string) => void;
  isPremium?: boolean;
}

export function WatchlistMobileCard({
  stock,
  onRemove,
  onAddToPortfolio,
  isPremium,
}: WatchlistMobileCardProps) {
  const formattedAthDate = new Date(stock.athDate).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  const dailyChangeColor =
    stock.dailyChangePercent !== null
      ? stock.dailyChangePercent >= 0
        ? "text-gain"
        : "text-loss"
      : "text-subtle";
  const dailyChangeValue =
    stock.dailyChangePercent !== null
      ? `${stock.dailyChangePercent >= 0 ? "+" : ""}${stock.dailyChangePercent.toFixed(2)}%`
      : "\u2014";

  return (
    <div className="rounded-xl border border-[var(--theme-card-border)] bg-surface/30 p-4 space-y-3">
      {/* Header: Symbol + ATH badge (left), Price + Day % (right) */}
      <div className="flex items-start justify-between">
        <Link href={`/stock/${stock.symbol}`} className="group">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-foreground group-hover:text-cosmic transition-colors">
              {stock.symbol}
            </span>
            {stock.isNearATH && <ATHBadge />}
          </div>
          <span className="text-xs text-subtle group-hover:text-muted transition-colors">
            {stock.name}
          </span>
        </Link>
        <div className="text-right">
          <span className="font-mono font-semibold text-foreground">
            {formatCurrency(stock.currentPrice, stock.currency)}
          </span>
          <span className={`text-xs font-mono block ${dailyChangeColor}`}>
            {dailyChangeValue}
          </span>
        </div>
      </div>

      {/* Middle grid: All-Time High | % Down | % to ATH */}
      <div className="grid grid-cols-3 gap-3 py-2 border-t border-b border-[var(--theme-card-border)]">
        <div>
          <span className="text-[10px] text-muted uppercase block">All-Time High</span>
          <span className="text-sm font-mono text-foreground">
            {formatCurrency(stock.allTimeHigh, stock.currency)}
          </span>
          <span className="text-[10px] text-subtle block">{formattedAthDate}</span>
        </div>
        <div className="text-center">
          <span className="text-[10px] text-muted uppercase block">% Down</span>
          <span
            className={`text-sm font-mono ${
              stock.percentDown <= 0 ? "text-gain" : "text-loss"
            }`}
          >
            -{stock.percentDown.toFixed(2)}%
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-muted uppercase block">% to ATH</span>
          <span
            className={`text-sm font-mono ${
              stock.percentToATH <= 0 ? "text-gain" : "text-gold"
            }`}
          >
            +{stock.percentToATH.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Footer: Expense + Yield (left), actions (right) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-muted">Expense </span>
            <span className="font-mono text-foreground/80">
              {stock.expenseRatio !== null ? `${stock.expenseRatio.toFixed(2)}%` : "\u2014"}
            </span>
          </div>
          <div>
            <span className="text-muted">Yield </span>
            <span
              className={`font-mono ${
                stock.dividendYield && stock.dividendYield > 0 ? "text-foreground" : "text-subtle"
              }`}
            >
              {stock.dividendYield !== null ? `${stock.dividendYield.toFixed(2)}%` : "\u2014"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isPremium && onAddToPortfolio && (
            <button
              onClick={() => onAddToPortfolio(stock.symbol)}
              className="p-1.5 rounded-lg bg-cosmic/10 border border-cosmic/30
                         hover:bg-cosmic/25 hover:border-cosmic/50
                         transition-all duration-200 text-cosmic"
              title="Add to portfolio"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
          <button
            onClick={() => onRemove(stock.symbol)}
            className="p-1 rounded hover:bg-loss/20 transition-colors text-subtle hover:text-loss"
            title="Remove from watchlist"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
