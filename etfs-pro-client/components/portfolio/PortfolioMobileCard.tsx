"use client";

import { useState } from "react";
import Link from "next/link";
import type { PortfolioHoldingWithMetrics } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import { TransactionList } from "./TransactionList";

interface PortfolioMobileCardProps {
  holding: PortfolioHoldingWithMetrics;
  onEditTransaction: (symbol: string, transactionId: string) => void;
  onDeleteTransaction: (symbol: string, transactionId: string) => void;
  onDeleteHolding: (symbol: string) => void;
}

export function PortfolioMobileCard({
  holding,
  onEditTransaction,
  onDeleteTransaction,
  onDeleteHolding,
}: PortfolioMobileCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const pnlColor = holding.unrealizedPnL >= 0 ? "text-gain" : "text-loss";
  const pnlSign = holding.unrealizedPnL >= 0 ? "+" : "";

  return (
    <div className="rounded-xl border border-[var(--theme-card-border)] bg-surface/30 p-4 space-y-3">
      {/* Header: Symbol + name (left), Value + P&L (right) */}
      <div className="flex items-start justify-between">
        <Link href={`/stock/${holding.symbol}`} className="group">
          <span className="font-mono font-bold text-foreground group-hover:text-cosmic transition-colors">
            {holding.symbol}
          </span>
          {holding.name && (
            <span className="text-xs text-subtle block group-hover:text-muted transition-colors">
              {holding.name}
            </span>
          )}
        </Link>
        <div className="text-right">
          <span className="font-mono font-semibold text-foreground">
            {formatCurrency(holding.currentValue)}
          </span>
          <div className={`text-xs font-mono ${pnlColor}`}>
            {pnlSign}{formatCurrency(Math.abs(holding.unrealizedPnL))} ({pnlSign}{holding.unrealizedPnLPercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* Middle grid: Shares | Avg Cost | Current Price */}
      <div className="grid grid-cols-3 gap-3 py-2 border-t border-b border-[var(--theme-card-border)]">
        <div>
          <span className="text-[10px] text-muted uppercase block">Shares</span>
          <span className="text-sm font-mono text-foreground">
            {holding.totalShares.toLocaleString()}
          </span>
        </div>
        <div className="text-center">
          <span className="text-[10px] text-muted uppercase block">Avg Cost</span>
          <span className="text-sm font-mono text-foreground/80">
            {formatCurrency(holding.averageCost)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-muted uppercase block">Price</span>
          <span className="text-sm font-mono text-foreground">
            {formatCurrency(holding.currentPrice)}
          </span>
        </div>
      </div>

      {/* Allocation bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-surface-alt rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cosmic to-nebula rounded-full"
            style={{ width: `${Math.min(holding.allocationPercent, 100)}%` }}
          />
        </div>
        <span className="font-mono text-foreground/80 text-xs w-12 text-right">
          {holding.allocationPercent.toFixed(1)}%
        </span>
      </div>

      {/* Footer: View Transactions toggle (left), delete button (right) */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-xs text-cosmic hover:text-cosmic/80 transition-colors"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {isExpanded ? "Hide" : "View"} Transactions ({holding.transactions.length})
        </button>
        <button
          onClick={() => onDeleteHolding(holding.symbol)}
          className="p-1 rounded hover:bg-loss/20 transition-colors text-subtle hover:text-loss"
          title="Delete holding"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Expanded transaction list */}
      {isExpanded && (
        <div className="pt-1">
          <TransactionList
            transactions={holding.transactions}
            onEdit={(txId) => onEditTransaction(holding.symbol, txId)}
            onDelete={(txId) => onDeleteTransaction(holding.symbol, txId)}
          />
        </div>
      )}
    </div>
  );
}
