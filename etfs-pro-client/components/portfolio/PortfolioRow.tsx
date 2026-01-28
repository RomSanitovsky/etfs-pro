"use client";

import { useState } from "react";
import Link from "next/link";
import type { PortfolioHoldingWithMetrics } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import { TransactionList } from "./TransactionList";

interface PortfolioRowProps {
  holding: PortfolioHoldingWithMetrics;
  onDeleteTransaction: (symbol: string, transactionId: string) => void;
  onDeleteHolding: (symbol: string) => void;
}

export function PortfolioRow({
  holding,
  onDeleteTransaction,
  onDeleteHolding,
}: PortfolioRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const pnlColor = holding.unrealizedPnL >= 0 ? "text-green-400" : "text-red-400";
  const pnlSign = holding.unrealizedPnL >= 0 ? "+" : "";

  return (
    <>
      <tr className="stock-row border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
        {/* Expand button */}
        <td className="px-2 py-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </td>

        {/* Symbol */}
        <td className="px-4 py-4">
          <Link href={`/stock/${holding.symbol}`} className="group block">
            <span className="font-mono font-bold text-white group-hover:text-cyan-400 transition-colors">
              {holding.symbol}
            </span>
            {holding.name && (
              <span className="text-xs text-slate-500 block group-hover:text-slate-400 transition-colors truncate max-w-[150px]">
                {holding.name}
              </span>
            )}
          </Link>
        </td>

        {/* Shares */}
        <td className="px-4 py-4 text-right font-mono text-white">
          {holding.totalShares.toLocaleString()}
        </td>

        {/* Avg Cost */}
        <td className="px-4 py-4 text-right font-mono text-slate-300">
          {formatCurrency(holding.averageCost)}
        </td>

        {/* Current Price */}
        <td className="px-4 py-4 text-right font-mono text-white">
          {formatCurrency(holding.currentPrice)}
        </td>

        {/* Current Value */}
        <td className="px-4 py-4 text-right font-mono text-white">
          {formatCurrency(holding.currentValue)}
        </td>

        {/* P&L */}
        <td className="px-4 py-4 text-right">
          <span className={`font-mono ${pnlColor}`}>
            {pnlSign}{formatCurrency(Math.abs(holding.unrealizedPnL))}
          </span>
          <span className={`text-xs block ${pnlColor}`}>
            {pnlSign}{holding.unrealizedPnLPercent.toFixed(2)}%
          </span>
        </td>

        {/* Allocation */}
        <td className="px-4 py-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                style={{ width: `${Math.min(holding.allocationPercent, 100)}%` }}
              />
            </div>
            <span className="font-mono text-slate-300 text-sm w-12 text-right">
              {holding.allocationPercent.toFixed(1)}%
            </span>
          </div>
        </td>

        {/* Actions */}
        <td className="px-4 py-4 text-right">
          <button
            onClick={() => onDeleteHolding(holding.symbol)}
            className="p-1 rounded hover:bg-red-500/20 transition-colors text-slate-500 hover:text-red-400"
            title="Delete holding"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </td>
      </tr>

      {/* Expanded transaction list */}
      {isExpanded && (
        <tr className="bg-slate-900/30">
          <td colSpan={9} className="px-4 py-4">
            <TransactionList
              transactions={holding.transactions}
              onDelete={(txId) => onDeleteTransaction(holding.symbol, txId)}
            />
          </td>
        </tr>
      )}
    </>
  );
}
