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
    ? stock.dailyChangePercent >= 0 ? "text-green-400" : "text-red-400"
    : "text-slate-500";
  const dailyChangeValue = stock.dailyChangePercent !== null
    ? `${stock.dailyChangePercent >= 0 ? "+" : ""}${stock.dailyChangePercent.toFixed(2)}%`
    : "—";

  return (
    <tr className="stock-row border-b border-slate-800/50">
      <td className="px-4 py-4">
        <Link
          href={`/stock/${stock.symbol}`}
          className="group block"
        >
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-white group-hover:text-cyan-400 transition-colors">
              {stock.symbol}
            </span>
          </div>
          <span className="text-xs text-slate-500 block group-hover:text-slate-400 transition-colors">
            {stock.name}
          </span>
        </Link>
      </td>
      <td className="px-4 py-4 text-right font-mono">
        {formatCurrency(stock.currentPrice, stock.currency)}
      </td>
      {/* Daily Change */}
      <td className="px-4 py-4 text-right">
        <span className={`font-mono ${dailyChangeColor}`}>
          {dailyChangeValue}
        </span>
      </td>
      <td className="px-4 py-4 text-right">
        <span className="font-mono">
          {formatCurrency(stock.allTimeHigh, stock.currency)}
        </span>
        <span className="text-xs text-slate-500 block">{formattedAthDate}</span>
      </td>
      <td className="px-4 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {stock.isNearATH && <ATHBadge />}
          <span
            className={`font-mono ${
              stock.percentDown <= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            -{stock.percentDown.toFixed(2)}%
          </span>
        </div>
      </td>
      <td className="px-4 py-4 text-right">
        <span
          className={`font-mono ${
            stock.percentToATH <= 0 ? "text-green-400" : "text-amber-400"
          }`}
        >
          +{stock.percentToATH.toFixed(2)}%
        </span>
      </td>
      {/* Expense Ratio (ETFs only) */}
      <td className="px-4 py-4 text-right">
        <span className="font-mono text-slate-300">
          {stock.expenseRatio !== null ? `${stock.expenseRatio.toFixed(2)}%` : "—"}
        </span>
      </td>
      {/* Dividend Yield */}
      <td className="px-4 py-4 text-right">
        <span className={`font-mono ${stock.dividendYield && stock.dividendYield > 0 ? "text-white" : "text-slate-500"}`}>
          {stock.dividendYield !== null ? `${stock.dividendYield.toFixed(2)}%` : "—"}
        </span>
      </td>
      <td className="px-4 py-4 text-right">
        <div className="flex items-center justify-end gap-1">
          {isPremium && onAddToPortfolio && (
            <button
              onClick={() => onAddToPortfolio(stock.symbol)}
              className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30
                         hover:bg-cyan-500/25 hover:border-cyan-400/50
                         transition-all duration-200 text-cyan-400 hover:text-cyan-300
                         hover:shadow-[0_0_8px_rgba(34,211,238,0.15)]"
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
            className="p-1 rounded hover:bg-red-500/20 transition-colors text-slate-500 hover:text-red-400"
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
