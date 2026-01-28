"use client";

import type { PortfolioTransaction } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";

interface TransactionListProps {
  transactions: PortfolioTransaction[];
  onDelete: (transactionId: string) => void;
}

export function TransactionList({ transactions, onDelete }: TransactionListProps) {
  // Sort transactions by purchase date, newest first
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
  );

  return (
    <div className="bg-background/50 rounded-lg p-4 border border-[var(--theme-card-border)]">
      <h4 className="text-sm font-semibold text-foreground/80 mb-3">Purchase History</h4>
      <div className="space-y-2">
        {sortedTransactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface/50 hover:bg-surface transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted">
                  {new Date(tx.purchaseDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="font-mono text-foreground">
                  {tx.shares.toLocaleString()} shares
                </span>
                <span className="text-muted">@</span>
                <span className="font-mono text-cosmic">
                  {formatCurrency(tx.pricePerShare)}
                </span>
                <span className="text-subtle">=</span>
                <span className="font-mono text-foreground/80">
                  {formatCurrency(tx.shares * tx.pricePerShare)}
                </span>
                {tx.notes && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-nebula/15 border border-nebula/30 text-xs text-cosmic truncate max-w-[200px]">
                    {tx.notes}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => onDelete(tx.id)}
              className="ml-4 p-1.5 rounded hover:bg-loss/20 transition-colors text-subtle hover:text-loss"
              title="Delete transaction"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
