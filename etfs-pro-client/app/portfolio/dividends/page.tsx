"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/hooks/usePortfolio";
import type { DividendInfo, PortfolioDividend } from "@/lib/types";

// Extended type with estimated flag
type ExtendedDividend = PortfolioDividend & { isEstimated: boolean };

// Calendar helpers
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function DividendCalendarPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { holdings } = usePortfolio();

  const [dividends, setDividends] = useState<PortfolioDividend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

  // Redirect non-premium users
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
    } else if (!user.isPremium) {
      router.push("/subscription");
    }
  }, [user, authLoading, router]);

  // Fetch dividend data for portfolio holdings
  useEffect(() => {
    async function fetchDividends() {
      if (holdings.length === 0) {
        setDividends([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const symbols = holdings.map((h) => h.symbol).join(",");
        const response = await fetch(`/api/dividends?symbols=${symbols}`);

        if (!response.ok) throw new Error("Failed to fetch dividends");

        const { data } = await response.json();

        // Merge dividend info with portfolio holdings
        const portfolioDividends: PortfolioDividend[] = data
          .map((div: DividendInfo) => {
            const holding = holdings.find((h) => h.symbol === div.symbol);
            if (!holding) return null;

            const expectedPayout = div.lastDividendValue
              ? holding.totalShares * div.lastDividendValue
              : 0;

            return {
              ...div,
              shares: holding.totalShares,
              expectedPayout,
            };
          })
          .filter(Boolean);

        setDividends(portfolioDividends);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    if (user?.isPremium && holdings.length > 0) {
      fetchDividends();
    } else {
      setIsLoading(false);
    }
  }, [holdings, user?.isPremium]);

  // Filter dividends with valid ex-dividend dates (upcoming or recent past)
  // Yahoo Finance returns the LAST ex-dividend date, so we also estimate the next one
  const upcomingDividends = useMemo((): ExtendedDividend[] => {
    const now = new Date();

    return dividends
      .filter((d) => d.exDividendDate)
      .map((d): ExtendedDividend => {
        const exDate = new Date(d.exDividendDate!);
        // If the ex-dividend date is in the past, estimate the next one (assume quarterly)
        if (exDate < now) {
          const nextExDate = new Date(exDate);
          // Add quarters until we get a future date
          while (nextExDate < now) {
            nextExDate.setMonth(nextExDate.getMonth() + 3);
          }
          return {
            ...d,
            exDividendDate: nextExDate.toISOString(),
            isEstimated: true,
          };
        }
        return { ...d, isEstimated: false };
      })
      .sort((a, b) =>
        new Date(a.exDividendDate!).getTime() - new Date(b.exDividendDate!).getTime()
      );
  }, [dividends]);

  // All dividend-paying stocks (even without announced dates)
  const allDividendStocks = useMemo(() => {
    return dividends
      .filter((d) => d.dividendYield && d.dividendYield > 0)
      .sort((a, b) => (b.dividendYield || 0) - (a.dividendYield || 0));
  }, [dividends]);

  // Get dividends for the selected month (using estimated dates)
  const monthDividends = useMemo(() => {
    return upcomingDividends.filter((d) => {
      if (!d.exDividendDate) return false;
      const date = new Date(d.exDividendDate);
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });
  }, [upcomingDividends, selectedMonth, selectedYear]);

  // Map dividends by day for calendar rendering
  const dividendsByDay = useMemo(() => {
    const map = new Map<number, ExtendedDividend[]>();
    monthDividends.forEach((d) => {
      const day = new Date(d.exDividendDate!).getDate();
      const existing = map.get(day) || [];
      map.set(day, [...existing, d]);
    });
    return map;
  }, [monthDividends]);

  // Calculate summary stats
  const summary = useMemo(() => {
    // Calculate expected quarterly income from all dividend stocks
    const quarterlyIncome = allDividendStocks.reduce((sum, d) => {
      if (d.dividendRate && d.shares) {
        return sum + (d.dividendRate * d.shares) / 4; // Quarterly estimate
      }
      return sum;
    }, 0);
    const payingStocks = dividends.filter((d) => d.dividendRate && d.dividendRate > 0).length;
    const avgYield = allDividendStocks.length > 0
      ? allDividendStocks.reduce((sum, d) => sum + (d.dividendYield || 0), 0) / allDividendStocks.length
      : 0;
    return { totalExpected: quarterlyIncome, payingStocks, avgYield };
  }, [dividends, allDividendStocks]);

  // Calendar grid
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
    const days: (number | null)[] = [];

    // Empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [selectedYear, selectedMonth]);

  const navigateMonth = (delta: number) => {
    let newMonth = selectedMonth + delta;
    let newYear = selectedYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  // Loading/auth check
  if (authLoading || !user || !user.isPremium) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <StarField />
        <div className="w-8 h-8 border-2 border-[var(--theme-card-border)] border-t-cosmic rounded-full animate-spin" />
      </div>
    );
  }

  const today = new Date();
  const isCurrentMonth = selectedMonth === today.getMonth() && selectedYear === today.getFullYear();

  return (
    <div className="min-h-screen relative">
      <StarField />
      <Header />

      <main className="relative z-10 container mx-auto px-4 py-8 pt-16 md:pt-8 max-w-6xl">
        {/* Back link */}
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Portfolio
        </Link>

        {/* Header */}
        <div className="relative rounded-xl p-6 mb-8 overflow-hidden">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gain/30 via-cosmic/20 to-nebula/30 p-[1px]">
            <div className="absolute inset-[1px] rounded-xl bg-background/95" />
          </div>
          <div className="absolute inset-[1px] rounded-xl bg-gradient-to-br from-gain/5 via-transparent to-nebula/5" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gain/10 border border-gain/20 mb-3">
              <svg className="w-3.5 h-3.5 text-gain" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium text-gain tracking-wide uppercase">Premium Feature</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Dividend Calendar
            </h1>
            <p className="text-muted">
              Track upcoming dividend payments from your portfolio holdings
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-loss/20 text-loss border border-loss/30">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Expected Income */}
          <div className="glass-card p-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-gain/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-gain/10">
                  <svg className="w-4 h-4 text-gain" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-subtle uppercase tracking-wider">Expected Income</span>
              </div>
              <p className="text-2xl font-bold text-gain">
                {isLoading ? "..." : formatCurrency(summary.totalExpected)}
              </p>
              <p className="text-xs text-muted mt-1">Est. quarterly income</p>
            </div>
          </div>

          {/* Dividend Stocks */}
          <div className="glass-card p-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cosmic/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-cosmic/10">
                  <svg className="w-4 h-4 text-cosmic" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-subtle uppercase tracking-wider">Paying Holdings</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {isLoading ? "..." : summary.payingStocks}
              </p>
              <p className="text-xs text-muted mt-1">Stocks with dividends</p>
            </div>
          </div>

          {/* Average Yield */}
          <div className="glass-card p-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-nebula/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-nebula/10">
                  <svg className="w-4 h-4 text-nebula" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-subtle uppercase tracking-wider">Avg Yield</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {isLoading ? "..." : `${summary.avgYield.toFixed(2)}%`}
              </p>
              <p className="text-xs text-muted mt-1">Portfolio dividend yield</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 rounded-lg hover:bg-surface transition-colors"
                >
                  <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="text-center">
                  <h2 className="text-xl font-bold text-foreground">
                    {MONTH_NAMES[selectedMonth]} {selectedYear}
                  </h2>
                  {!isCurrentMonth && (
                    <button
                      onClick={() => {
                        setSelectedMonth(today.getMonth());
                        setSelectedYear(today.getFullYear());
                      }}
                      className="text-xs text-cosmic hover:underline mt-1"
                    >
                      Go to today
                    </button>
                  )}
                </div>

                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 rounded-lg hover:bg-surface transition-colors"
                >
                  <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-subtle py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

                  const dayDividends = dividendsByDay.get(day) || [];
                  const isToday = isCurrentMonth && day === today.getDate();
                  const hasDividends = dayDividends.length > 0;

                  return (
                    <div
                      key={day}
                      className={`
                        aspect-square rounded-lg border transition-all duration-200
                        ${isToday
                          ? "border-cosmic bg-cosmic/10"
                          : hasDividends
                          ? "border-gain/50 bg-gain/5 hover:bg-gain/10"
                          : "border-transparent hover:border-[var(--theme-card-border)] hover:bg-surface/50"
                        }
                        ${hasDividends ? "cursor-pointer" : ""}
                        relative group
                      `}
                    >
                      <div className="absolute inset-0 p-1 flex flex-col">
                        <span
                          className={`text-xs font-medium ${
                            isToday ? "text-cosmic" : hasDividends ? "text-gain" : "text-muted"
                          }`}
                        >
                          {day}
                        </span>

                        {hasDividends && (
                          <div className="flex-1 flex flex-col justify-end gap-0.5 overflow-hidden">
                            {dayDividends.slice(0, 2).map((d) => (
                              <div
                                key={d.symbol}
                                className={`text-[10px] font-medium truncate rounded px-1 ${
                                  d.isEstimated
                                    ? "text-nebula bg-nebula/20"
                                    : "text-gain bg-gain/20"
                                }`}
                              >
                                {d.symbol}{d.isEstimated ? "~" : ""}
                              </div>
                            ))}
                            {dayDividends.length > 2 && (
                              <div className="text-[10px] text-muted">
                                +{dayDividends.length - 2} more
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Tooltip on hover */}
                      {hasDividends && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                          <div className="bg-[#0d1117] border border-[var(--theme-card-border)] rounded-lg p-3 shadow-xl min-w-[180px]">
                            <p className="text-xs font-semibold text-foreground mb-2">
                              Ex-Dividend Date {dayDividends.some(d => d.isEstimated) && <span className="text-nebula">(Est.)</span>}
                            </p>
                            {dayDividends.map((d) => (
                              <div key={d.symbol} className="flex justify-between text-xs mb-1">
                                <span className="text-muted">{d.symbol}{d.isEstimated ? " ~" : ""}</span>
                                <span className={`font-medium ${d.isEstimated ? "text-nebula" : "text-gain"}`}>
                                  {formatCurrency(d.expectedPayout)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-6 pt-4 border-t border-[var(--theme-card-border)]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-cosmic/30 border border-cosmic" />
                  <span className="text-xs text-muted">Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gain/30 border border-gain/50" />
                  <span className="text-xs text-muted">Ex-Dividend</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-nebula/30 border border-nebula/50" />
                  <span className="text-xs text-muted">Estimated ~</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dividend Holdings List */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gain/50 to-transparent" />
                <span className="text-xs font-semibold tracking-widest text-gain uppercase">
                  {upcomingDividends.length > 0 ? "Upcoming" : "Your Holdings"}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gain/50 to-transparent" />
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-[var(--theme-card-border)] border-t-cosmic rounded-full animate-spin" />
                </div>
              ) : allDividendStocks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-surface flex items-center justify-center">
                    <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted">No dividend stocks</p>
                  <p className="text-xs text-subtle mt-1">
                    Add dividend-paying stocks to your portfolio
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {/* Show upcoming dividends first if any */}
                  {upcomingDividends.length > 0 && (
                    <>
                      {upcomingDividends.map((dividend) => (
                        <div
                          key={dividend.symbol}
                          className={`p-3 rounded-lg transition-colors ${
                            dividend.isEstimated
                              ? "bg-nebula/10 border border-nebula/30 hover:border-nebula/50"
                              : "bg-gain/10 border border-gain/30 hover:border-gain/50"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-foreground">{dividend.symbol}</p>
                              <p className="text-xs text-muted truncate max-w-[140px]">{dividend.name}</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-bold ${dividend.isEstimated ? "text-nebula" : "text-gain"}`}>
                                {formatCurrency(dividend.expectedPayout)}
                              </p>
                              <p className="text-[10px] text-subtle">expected</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <div className={`flex items-center gap-1 ${dividend.isEstimated ? "text-nebula" : "text-gain"}`}>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>Ex: {formatDate(dividend.exDividendDate!)}{dividend.isEstimated ? " ~" : ""}</span>
                            </div>
                            {dividend.dividendYield && (
                              <span className="text-muted font-medium">
                                {dividend.dividendYield.toFixed(2)}%
                              </span>
                            )}
                          </div>
                          {dividend.isEstimated && (
                            <p className="text-[10px] text-nebula/70 mt-1 italic">
                              Estimated based on quarterly schedule
                            </p>
                          )}
                        </div>
                      ))}

                      {/* Divider if there are more stocks */}
                      {allDividendStocks.filter(d => !upcomingDividends.find(u => u.symbol === d.symbol)).length > 0 && (
                        <div className="flex items-center gap-2 py-2">
                          <div className="h-px flex-1 bg-[var(--theme-card-border)]" />
                          <span className="text-[10px] text-subtle uppercase">Other Holdings</span>
                          <div className="h-px flex-1 bg-[var(--theme-card-border)]" />
                        </div>
                      )}
                    </>
                  )}

                  {/* Show all other dividend stocks */}
                  {allDividendStocks
                    .filter(d => !upcomingDividends.find(u => u.symbol === d.symbol))
                    .map((dividend) => (
                      <div
                        key={dividend.symbol}
                        className="p-3 rounded-lg bg-surface/50 border border-[var(--theme-card-border)] hover:border-cosmic/30 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-foreground">{dividend.symbol}</p>
                            <p className="text-xs text-muted truncate max-w-[140px]">{dividend.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-cosmic">
                              {dividend.dividendYield?.toFixed(2)}%
                            </p>
                            <p className="text-[10px] text-subtle">yield</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted">
                          <span>{dividend.shares.toFixed(2)} shares</span>
                          {dividend.dividendRate && (
                            <span>{formatCurrency(dividend.dividendRate)}/yr</span>
                          )}
                        </div>

                        <div className="mt-2 pt-2 border-t border-[var(--theme-card-border)]">
                          <p className="text-[10px] text-subtle italic">
                            Ex-dividend date not yet announced
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-subtle max-w-2xl mx-auto">
            Dates marked with ~ are estimated based on quarterly dividend schedules.
            To receive a dividend, you must own the stock before the ex-dividend date.
            Actual payment dates may vary.
          </p>
        </div>
      </main>
    </div>
  );
}
