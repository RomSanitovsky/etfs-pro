"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { AddTransactionInput } from "@/lib/types";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: AddTransactionInput) => Promise<void>;
  prefilledSymbol?: string;
}

export function AddTransactionModal({
  isOpen,
  onClose,
  onSubmit,
  prefilledSymbol = "",
}: AddTransactionModalProps) {
  const [symbol, setSymbol] = useState(prefilledSymbol);
  const [shares, setShares] = useState("");
  const [pricePerShare, setPricePerShare] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const symbolInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSymbol(prefilledSymbol);
      setShares("");
      setPricePerShare("");
      setPurchaseDate(new Date().toISOString().split("T")[0]);
      setNotes("");
      setError(null);
      // Focus symbol input if not prefilled
      if (!prefilledSymbol) {
        symbolInputRef.current?.focus();
      }
    }
  }, [isOpen, prefilledSymbol]);

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
      setError(err instanceof Error ? err.message : "Failed to add transaction");
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
        className="w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl border border-slate-700/50 bg-slate-900/95 backdrop-blur-md shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="shrink-0 px-6 py-4 bg-gradient-to-r from-purple-900/40 to-cyan-900/40 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Add Transaction</h2>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white"
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
            <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Symbol */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Symbol
            </label>
            <input
              ref={symbolInputRef}
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="AAPL, VOO, BTC-USD..."
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50
                         text-white placeholder-slate-500 font-mono
                         focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50
                         transition-colors"
              disabled={!!prefilledSymbol}
            />
          </div>

          {/* Shares and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Shares
              </label>
              <input
                type="number"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="0"
                step="any"
                min="0"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50
                           text-white placeholder-slate-500 font-mono
                           focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50
                           transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Price per Share
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="number"
                  value={pricePerShare}
                  onChange={(e) => setPricePerShare(e.target.value)}
                  placeholder="0.00"
                  step="any"
                  min="0"
                  className="w-full pl-8 pr-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50
                             text-white placeholder-slate-500 font-mono
                             focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50
                             transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Total */}
          {shares && pricePerShare && (
            <div className="px-4 py-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Total Cost</span>
                <span className="font-mono font-semibold text-white">
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
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Purchase Date
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50
                         text-white
                         focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50
                         transition-colors"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Notes <span className="text-slate-500">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this purchase..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50
                         text-white placeholder-slate-500 resize-none
                         focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50
                         transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-600 text-slate-300
                         hover:bg-slate-800 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500
                         text-white font-semibold
                         hover:from-cyan-400 hover:to-purple-400
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-300"
            >
              {isSubmitting ? "Adding..." : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
