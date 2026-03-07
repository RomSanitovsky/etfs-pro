"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { CashCurrency } from "@/lib/types";
import { CASH_CURRENCIES, getCurrencySymbol } from "@/lib/constants";

export interface EditingCash {
  id: string;
  currency: CashCurrency;
  balance: number;
  notes?: string;
}

interface AddCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (currency: CashCurrency, balance: number, notes?: string) => Promise<void>;
  onUpdate?: (id: string, balance: number, notes?: string) => Promise<void>;
  editingCash?: EditingCash | null;
}

export function AddCashModal({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  editingCash,
}: AddCashModalProps) {
  const isEditMode = !!editingCash;
  const [currency, setCurrency] = useState<CashCurrency>("USD");
  const [balance, setBalance] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editingCash) {
        setCurrency(editingCash.currency);
        setBalance(String(editingCash.balance));
        setNotes(editingCash.notes || "");
      } else {
        setCurrency("USD");
        setBalance("");
        setNotes("");
      }
      setError(null);
    }
  }, [isOpen, editingCash]);

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
    if (!balance || parseFloat(balance) < 0) {
      setError("Balance must be 0 or greater");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && onUpdate) {
        await onUpdate(editingCash.id, parseFloat(balance), notes.trim() || undefined);
      } else {
        await onSubmit(currency, parseFloat(balance), notes.trim() || undefined);
      }
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEditMode
          ? "Failed to update cash"
          : "Failed to add cash"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currencyInfo = CASH_CURRENCIES.find((c) => c.code === currency);

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
            <h2 className="text-lg font-semibold text-foreground">
              {isEditMode ? "Edit Cash Entry" : "Add Cash"}
            </h2>
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

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CashCurrency)}
              disabled={isEditMode}
              className="w-full px-4 py-2.5 rounded-lg bg-surface-alt/50 border border-[var(--theme-card-border)]
                         text-foreground
                         focus:outline-none focus:ring-2 focus:ring-cosmic/50 focus:border-cosmic/50
                         transition-colors disabled:opacity-60"
            >
              {CASH_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Balance */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">
              Balance
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle">
                {currencyInfo?.symbol || getCurrencySymbol(currency)}
              </span>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0.00"
                step="any"
                min="0"
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-alt/50 border border-[var(--theme-card-border)]
                           text-foreground placeholder-subtle font-mono
                           focus:outline-none focus:ring-2 focus:ring-cosmic/50 focus:border-cosmic/50
                           transition-colors"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">
              Notes <span className="text-subtle">(optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Savings account, Brokerage cash..."
              className="w-full px-4 py-2.5 rounded-lg bg-surface-alt/50 border border-[var(--theme-card-border)]
                         text-foreground placeholder-subtle
                         focus:outline-none focus:ring-2 focus:ring-cosmic/50 focus:border-cosmic/50
                         transition-colors"
            />
          </div>

          {/* Info text */}
          <p className="text-xs text-muted">
            You can add multiple entries of the same currency (e.g., different accounts).
          </p>

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
                ? isEditMode
                  ? "Saving..."
                  : "Adding..."
                : isEditMode
                ? "Save Changes"
                : "Add Cash"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
