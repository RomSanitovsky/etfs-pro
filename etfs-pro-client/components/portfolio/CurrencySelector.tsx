"use client";

import { useState, useRef, useEffect } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CASH_CURRENCIES } from "@/lib/constants";
import type { CashCurrency } from "@/lib/types";

export function CurrencySelector() {
  const { displayCurrency, setDisplayCurrency, currencySymbol } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  const handleSelect = (currency: CashCurrency) => {
    setDisplayCurrency(currency);
    setIsOpen(false);
  };

  const currentCurrency = CASH_CURRENCIES.find((c) => c.code === displayCurrency);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2 px-3 py-2 rounded-lg
                   border border-[var(--theme-card-border)] bg-surface/50
                   hover:bg-surface hover:border-cosmic/50
                   transition-all duration-200"
        title="Change display currency"
      >
        {/* Currency Symbol Badge */}
        <div className="flex items-center justify-center w-7 h-7 rounded-full
                        bg-gradient-to-br from-cosmic/20 to-nebula/20
                        border border-cosmic/30 group-hover:border-cosmic/50
                        transition-colors">
          <span className="text-sm font-bold text-cosmic">{currencySymbol}</span>
        </div>

        {/* Currency Code */}
        <span className="text-sm font-medium text-foreground hidden sm:block">
          {displayCurrency}
        </span>

        {/* Dropdown Arrow */}
        <svg
          className={`w-4 h-4 text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Outer glow */}
          <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-cosmic/30 via-nebula/30 to-cosmic/30 blur-md opacity-60" />

          {/* Card */}
          <div className="relative rounded-xl border border-[var(--theme-card-border)] bg-background/98 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[var(--theme-card-border)] bg-gradient-to-r from-cosmic/10 via-transparent to-nebula/10">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-cosmic" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-semibold tracking-wide text-cosmic uppercase">
                  Display Currency
                </span>
              </div>
              <p className="text-xs text-muted mt-1">
                All values will be converted
              </p>
            </div>

            {/* Currency Options */}
            <div className="max-h-72 overflow-y-auto py-2">
              {CASH_CURRENCIES.map((currency) => {
                const isSelected = currency.code === displayCurrency;
                return (
                  <button
                    key={currency.code}
                    onClick={() => handleSelect(currency.code)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150
                      ${isSelected
                        ? "bg-cosmic/15 border-l-2 border-cosmic"
                        : "hover:bg-surface/80 border-l-2 border-transparent"
                      }`}
                  >
                    {/* Currency Symbol Circle */}
                    <div className={`flex items-center justify-center w-9 h-9 rounded-full
                      ${isSelected
                        ? "bg-gradient-to-br from-cosmic to-nebula text-white shadow-lg shadow-cosmic/30"
                        : "bg-surface border border-[var(--theme-card-border)] text-muted"
                      } transition-all duration-200`}
                    >
                      <span className="text-sm font-bold">{currency.symbol}</span>
                    </div>

                    {/* Currency Info */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${isSelected ? "text-cosmic" : "text-foreground"}`}>
                        {currency.code}
                      </div>
                      <div className="text-xs text-muted truncate">
                        {currency.name}
                      </div>
                    </div>

                    {/* Selected Checkmark */}
                    {isSelected && (
                      <svg className="w-5 h-5 text-cosmic shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer Note */}
            <div className="px-4 py-2.5 border-t border-[var(--theme-card-border)] bg-surface/30">
              <p className="text-[10px] text-subtle leading-relaxed">
                Rates update automatically. Conversions are approximate.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
