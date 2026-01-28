"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { DetailedQuoteData } from "@/lib/types";
import { DEFINITIONS } from "@/lib/definitions";

interface StatsGridProps {
  quote: DetailedQuoteData;
  allTimeHigh: number;
  athDate: string;
}

function formatNumber(value: number | null, decimals: number = 2): string {
  if (value === null || value === undefined) return "—";
  return value.toFixed(decimals);
}

function formatCurrency(value: number | null, currency: string = "USD"): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatLargeNumber(value: number | null): string {
  if (value === null || value === undefined) return "—";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return formatCurrency(value);
}

function formatVolume(value: number | null): string {
  if (value === null || value === undefined) return "—";
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toLocaleString();
}

function formatPercent(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(2)}%`;
}

interface TooltipPortalProps {
  content: string;
  triggerRect: DOMRect | null;
}

function TooltipPortal({ content, triggerRect }: TooltipPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !triggerRect) return null;

  const tooltipWidth = 256;
  let left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
  const top = triggerRect.top - 8;

  if (left < 8) left = 8;
  if (left + tooltipWidth > window.innerWidth - 8) {
    left = window.innerWidth - tooltipWidth - 8;
  }

  return createPortal(
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        transform: "translateY(-100%)",
      }}
    >
      <div className="px-3 py-2 text-sm text-foreground bg-surface/95 backdrop-blur-sm border border-[var(--theme-card-border)] rounded-lg shadow-xl w-64">
        <p className="leading-relaxed">{content}</p>
      </div>
      <div
        className="absolute w-0 h-0 border-[6px] border-t-[var(--theme-card-border)] border-x-transparent border-b-transparent"
        style={{
          left: `${triggerRect.left + triggerRect.width / 2 - left - 6}px`,
          top: "100%",
        }}
      />
    </div>,
    document.body
  );
}

interface InfoTooltipProps {
  content: string;
}

function InfoTooltip({ content }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    if (buttonRef.current) {
      setTriggerRect(buttonRef.current.getBoundingClientRect());
    }
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <span
      className="relative inline-flex items-center ml-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        ref={buttonRef}
        className="text-subtle hover:text-foreground transition-colors focus:outline-none"
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        aria-label="More information"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {isVisible && <TooltipPortal content={content} triggerRect={triggerRect} />}
    </span>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  tooltip?: string;
}

function StatCard({ label, value, subValue, tooltip }: StatCardProps) {
  return (
    <div className="bg-surface/50 rounded-lg p-4 border border-[var(--theme-card-border)]">
      <div className="flex items-center">
        <p className="text-xs text-muted uppercase tracking-wide">
          {label}
        </p>
        {tooltip && <InfoTooltip content={tooltip} />}
      </div>
      <p className="text-lg font-mono font-semibold text-foreground mt-1">{value}</p>
      {subValue && (
        <p className="text-xs text-subtle mt-0.5">{subValue}</p>
      )}
    </div>
  );
}

export function StatsGrid({ quote, allTimeHigh, athDate }: StatsGridProps) {
  const currentPrice = quote.regularMarketPrice;
  const percentFromATH =
    allTimeHigh > 0 ? ((allTimeHigh - currentPrice) / allTimeHigh) * 100 : 0;
  const percentToATH =
    currentPrice > 0 ? ((allTimeHigh - currentPrice) / currentPrice) * 100 : 0;

  const formattedAthDate = new Date(athDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // 52-week range progress
  const fiftyTwoWeekProgress =
    quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow > 0
      ? ((currentPrice - quote.fiftyTwoWeekLow) /
          (quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow)) *
        100
      : 50;

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Market Cap"
          value={formatLargeNumber(quote.marketCap)}
          tooltip={DEFINITIONS.marketCap}
        />
        <StatCard
          label="P/E Ratio"
          value={formatNumber(quote.trailingPE)}
          subValue={
            quote.forwardPE ? `Fwd: ${formatNumber(quote.forwardPE)}` : undefined
          }
          tooltip={DEFINITIONS.peRatio}
        />
        <StatCard
          label="Volume"
          value={formatVolume(quote.regularMarketVolume)}
          subValue={`Avg: ${formatVolume(quote.averageDailyVolume10Day)}`}
          tooltip={DEFINITIONS.volume}
        />
        <StatCard
          label="Beta"
          value={formatNumber(quote.beta)}
          tooltip={DEFINITIONS.beta}
        />

        <StatCard
          label="52W Low"
          value={formatCurrency(quote.fiftyTwoWeekLow, quote.currency)}
          tooltip={DEFINITIONS.fiftyTwoWeekLow}
        />
        <StatCard
          label="52W High"
          value={formatCurrency(quote.fiftyTwoWeekHigh, quote.currency)}
          tooltip={DEFINITIONS.fiftyTwoWeekHigh}
        />
        <StatCard
          label="50-Day MA"
          value={formatCurrency(quote.fiftyDayAverage, quote.currency)}
          tooltip={DEFINITIONS.fiftyDayMA}
        />
        <StatCard
          label="200-Day MA"
          value={formatCurrency(quote.twoHundredDayAverage, quote.currency)}
          tooltip={DEFINITIONS.twoHundredDayMA}
        />

        <StatCard
          label="Div Yield"
          value={formatPercent(quote.dividendYield)}
          tooltip={DEFINITIONS.dividendYield}
        />
        <StatCard
          label="Exp Ratio"
          value={formatPercent(quote.netExpenseRatio)}
          tooltip={DEFINITIONS.expenseRatio}
        />
        <StatCard
          label="Day Range"
          value={`${formatCurrency(quote.regularMarketDayLow, quote.currency).replace("$", "")} - ${formatCurrency(quote.regularMarketDayHigh, quote.currency).replace("$", "")}`}
          tooltip={DEFINITIONS.dayRange}
        />
        <StatCard
          label="Prev Close"
          value={formatCurrency(quote.regularMarketPreviousClose, quote.currency)}
          tooltip={DEFINITIONS.previousClose}
        />
      </div>

      {/* 52-Week Range Bar */}
      <div className="bg-surface/50 rounded-lg p-4 border border-[var(--theme-card-border)]">
        <div className="flex items-center mb-3">
          <p className="text-xs text-muted uppercase tracking-wide">
            52-Week Range
          </p>
          <InfoTooltip content={DEFINITIONS.fiftyTwoWeekRange} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-muted">
            {formatCurrency(quote.fiftyTwoWeekLow, quote.currency)}
          </span>
          <div className="flex-1 h-2 bg-surface-alt rounded-full relative">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-loss via-gold to-gain rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, fiftyTwoWeekProgress))}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-foreground rounded-full shadow border-2 border-background"
              style={{ left: `calc(${Math.min(100, Math.max(0, fiftyTwoWeekProgress))}% - 6px)` }}
            />
          </div>
          <span className="text-sm font-mono text-muted">
            {formatCurrency(quote.fiftyTwoWeekHigh, quote.currency)}
          </span>
        </div>
      </div>

      {/* ATH Analysis */}
      <div className="bg-surface/50 rounded-lg p-4 border border-[var(--theme-card-border)]">
        <div className="flex items-center mb-3">
          <p className="text-xs text-muted uppercase tracking-wide">
            All-Time High Analysis
          </p>
          <InfoTooltip content={DEFINITIONS.athAnalysis} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-subtle mb-1">All-Time High</p>
            <p className="text-lg font-mono font-semibold text-foreground">
              {formatCurrency(allTimeHigh, quote.currency)}
            </p>
            <p className="text-xs text-subtle">{formattedAthDate}</p>
          </div>
          <div>
            <p className="text-sm text-subtle mb-1">Current vs ATH</p>
            <p
              className={`text-lg font-mono font-semibold ${
                percentFromATH <= 0 ? "text-gain" : "text-loss"
              }`}
            >
              {percentFromATH <= 0 ? "At ATH" : `-${percentFromATH.toFixed(2)}%`}
            </p>
          </div>
          <div>
            <p className="text-sm text-subtle mb-1">Needed to reach ATH</p>
            <p
              className={`text-lg font-mono font-semibold ${
                percentToATH <= 0 ? "text-gain" : "text-gold"
              }`}
            >
              {percentToATH <= 0 ? "At ATH" : `+${percentToATH.toFixed(2)}%`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
