"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { AddTransactionInput, PortfolioTransaction } from "@/lib/types";

export interface EditingTransaction {
  symbol: string;
  transaction: PortfolioTransaction;
}

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: AddTransactionInput) => Promise<void>;
  prefilledSymbol?: string;
  editingTransaction?: EditingTransaction | null;
}

export function AddTransactionModal({
  isOpen,
  onClose,
  onSubmit,
  prefilledSymbol = "",
  editingTransaction,
}: AddTransactionModalProps) {
  const isEditMode = !!editingTransaction;
  const [symbol, setSymbol] = useState(prefilledSymbol);
  const [shares, setShares] = useState("");
  const [pricePerShare, setPricePerShare] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const symbolInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens (or pre-fill in edit mode)
  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        const tx = editingTransaction.transaction;
        setSymbol(editingTransaction.symbol);
        setShares(String(tx.shares));
        setPricePerShare(String(tx.pricePerShare));
        setPurchaseDate(tx.purchaseDate);
        setNotes(tx.notes ?? "");
      } else {
        setSymbol(prefilledSymbol);
        setShares("");
        setPricePerShare("");
        setPurchaseDate(new Date().toISOString().split("T")[0]);
        setNotes("");
      }
      setError(null);
      // Focus symbol input if not prefilled and not editing
      if (!prefilledSymbol && !editingTransaction) {
        symbolInputRef.current?.focus();
      }
    }
  }, [isOpen, prefilledSymbol, editingTransaction]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!symbol.trim()) {
      setError("Symbol is required");
      return;
    }
    if (!shares || parseFloat(shares) <= 0) {
      setError("Shares must be greater than 0");
      return;
    }
    if (!pricePerShare || parseFloat(pricePerShare) <= 0) {
      setError("Price per share must be greater than 0");
      return;
    }
    if (!purchaseDate) {
      setError("Purchase date is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        symbol: symbol.toUpperCase().trim(),
        shares: parseFloat(shares),
        pricePerShare: parseFloat(pricePerShare),
        purchaseDate,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : isEditMode ? "Failed to save changes" : "Failed to add transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl border border-[var(--theme-card-border)] bg-surface/95 backdrop-blur-md shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="shrink-0 px-6 py-4 bg-gradient-to-r from-nebula/40 to-cosmic/40 border-b border-[var(--theme-card-border)]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">{isEditMode ? "Edit Transaction" : "Add Transaction"}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-surface/50 transition-colors text-muted hover:text-foreground"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-loss/20 text-loss text-sm">
              {error}
            </div>
          )}

          {/* Symbol */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">
              Symbol
            </label>
            <input
              ref={symbolInputRef}
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="AAPL, VOO, BTC-USD..."
              className="w-full px-4 py-2.5 rounded-lg bg-surface-alt/50 border border-[var(--theme-card-border)]
                         text-foreground placeholder-subtle font-mono
                         focus:outline-none focus:ring-2 focus:ring-cosmic/50 focus:border-cosmic/50
                         transition-colors"
              disabled={!!prefilledSymbol || isEditMode}
            />
          </div>

          {/* Shares and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                Shares
              </label>
              <input
                type="number"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="0"
                step="any"
                min="0"
                className="w-full px-4 py-2.5 rounded-lg bg-surface-alt/50 border border-[var(--theme-card-border)]
                           text-foreground placeholder-subtle font-mono
                           focus:outline-none focus:ring-2 focus:ring-cosmic/50 focus:border-cosmic/50
                           transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                Price per Share
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle">$</span>
                <input
                  type="number"
                  value={pricePerShare}
                  onChange={(e) => setPricePerShare(e.target.value)}
                  placeholder="0.00"
                  step="any"
                  min="0"
                  className="w-full pl-8 pr-4 py-2.5 rounded-lg bg-surface-alt/50 border border-[var(--theme-card-border)]
                             text-foreground placeholder-subtle font-mono
                             focus:outline-none focus:ring-2 focus:ring-cosmic/50 focus:border-cosmic/50
                             transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Total */}
          {shares && pricePerShare && (
            <div className="px-4 py-3 rounded-lg bg-surface/30 border border-[var(--theme-card-border)]">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Total Cost</span>
                <span className="font-mono font-semibold text-foreground">
                  ${(parseFloat(shares) * parseFloat(pricePerShare)).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          )}

          {/* Purchase Date */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">
              Purchase Date
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2.5 rounded-lg bg-surface-alt/50 border border-[var(--theme-card-border)]
                         text-foreground
                         focus:outline-none focus:ring-2 focus:ring-cosmic/50 focus:border-cosmic/50
                         transition-colors"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">
              Notes <span className="text-subtle">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this purchase..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg bg-surface-alt/50 border border-[var(--theme-card-border)]
                         text-foreground placeholder-subtle resize-none
                         focus:outline-none focus:ring-2 focus:ring-cosmic/50 focus:border-cosmic/50
                         transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--theme-card-border)] text-foreground/80
                         hover:bg-surface hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cosmic to-nebula
                         text-white font-semibold
                         hover:brightness-110
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-300"
            >
              {isSubmitting
                ? (isEditMode ? "Saving..." : "Adding...")
                : (isEditMode ? "Save Changes" : "Add Transaction")}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
