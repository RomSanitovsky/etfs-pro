"use client";

import Link from "next/link";
import type { StockData } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import { ATHBadge } from "./ATHBadge";

interface StockRowProps {
  stock: StockData;
  onRemove: (symbol: string) => void;
  onAddToPortfolio?: (symbol: string) => void;
  isPremium?: boolean;
}

export function StockRow({ stock, onRemove, onAddToPortfolio, isPremium }: StockRowProps) {
  const formattedAthDate = new Date(stock.athDate).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  // Format daily change with color
  const dailyChangeColor = stock.dailyChangePercent !== null
    ? stock.dailyChangePercent >= 0 ? "text-gain" : "text-loss"
    : "text-subtle";
  const dailyChangeValue = stock.dailyChangePercent !== null
    ? `${stock.dailyChangePercent >= 0 ? "+" : ""}${stock.dailyChangePercent.toFixed(2)}%`
    : "\u2014";

  return (
    <tr className="stock-row border-b border-[var(--theme-card-border)]">
      <td className="px-4 py-4 overflow-hidden">
        <Link
          href={`/stock/${stock.symbol}`}
          className="group block"
        >
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-foreground group-hover:text-cosmic transition-colors">
              {stock.symbol}
            </span>
          </div>
          <span className="text-xs text-subtle block group-hover:text-muted transition-colors truncate">
            {stock.name}
          </span>
        </Link>
      </td>
      <td className="px-4 py-4 text-right overflow-hidden font-mono">
        {formatCurrency(stock.currentPrice, stock.currency)}
      </td>
      {/* Daily Change */}
      <td className="px-4 py-4 text-right overflow-hidden">
        <span className={`font-mono ${dailyChangeColor}`}>
          {dailyChangeValue}
        </span>
      </td>
      <td className="px-4 py-4 text-right overflow-hidden">
        <span className="font-mono">
          {formatCurrency(stock.allTimeHigh, stock.currency)}
        </span>
        <span className="text-xs text-subtle block">{formattedAthDate}</span>
      </td>
      <td className="px-4 py-4 text-right overflow-hidden">
        <div className="flex flex-col items-end gap-0.5">
          {stock.isNearATH && <ATHBadge />}
          <span
            className={`font-mono ${
              stock.percentDown <= 0 ? "text-gain" : "text-loss"
            }`}
          >
            -{stock.percentDown.toFixed(2)}%
          </span>
        </div>
      </td>
      <td className="px-4 py-4 text-right overflow-hidden">
        <span
          className={`font-mono ${
            stock.percentToATH <= 0 ? "text-gain" : "text-gold"
          }`}
        >
          +{stock.percentToATH.toFixed(2)}%
        </span>
      </td>
      {/* Expense Ratio (ETFs only) */}
      <td className="px-4 py-4 text-right overflow-hidden">
        <span className="font-mono text-foreground/80">
          {stock.expenseRatio !== null ? `${stock.expenseRatio.toFixed(2)}%` : "\u2014"}
        </span>
      </td>
      {/* Dividend Yield */}
      <td className="px-4 py-4 text-right overflow-hidden">
        <span className={`font-mono ${stock.dividendYield && stock.dividendYield > 0 ? "text-foreground" : "text-subtle"}`}>
          {stock.dividendYield !== null ? `${stock.dividendYield.toFixed(2)}%` : "\u2014"}
        </span>
      </td>
      <td className="px-4 py-4 text-right overflow-hidden">
        <div className="flex items-center justify-end gap-1">
          {isPremium && onAddToPortfolio && (
            <button
              onClick={() => onAddToPortfolio(stock.symbol)}
              className="p-1.5 rounded-lg bg-cosmic/10 border border-cosmic/30
                         hover:bg-cosmic/25 hover:border-cosmic/50
                         transition-all duration-200 text-cosmic hover:text-cosmic
                         hover:shadow-[0_0_8px_var(--theme-glow-secondary)]"
              title="Add to portfolio"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          )}
          <button
            onClick={() => onRemove(stock.symbol)}
            className="p-1 rounded hover:bg-loss/20 transition-colors text-subtle hover:text-loss"
            title="Remove from watchlist"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}
