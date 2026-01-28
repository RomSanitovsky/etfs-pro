"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/hooks/usePortfolio";
import {
  PortfolioSummaryCards,
  PortfolioPieChart,
  PortfolioTable,
  AddTransactionModal,
  EmptyPortfolioState,
} from "@/components/portfolio";

export default function PortfolioPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    holdings,
    summary,
    isLoading,
    error,
    addTransaction,
    deleteTransaction,
    deleteHolding,
    refreshPrices,
  } = usePortfolio();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Redirect unauthenticated or non-premium users
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
    } else if (!user.isPremium) {
      router.push("/subscription");
    }
  }, [user, authLoading, router]);

  // Loading state or redirecting
  if (authLoading || !user || !user.isPremium) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <StarField />
        <div className="w-8 h-8 border-2 border-[var(--theme-card-border)] border-t-cosmic rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <StarField />
      <Header />

      <main className="relative z-10 container mx-auto px-4 py-8 pt-16 md:pt-8 max-w-6xl">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 mb-3">
              <svg className="w-3 h-3 text-gold" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs font-medium text-gold tracking-wide uppercase">Premium Feature</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              My Portfolio
            </h1>
            <p className="text-muted">
              Track your investments and monitor P&L performance
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh button */}
            <button
              onClick={refreshPrices}
              disabled={isLoading}
              className="p-2.5 rounded-lg border border-[var(--theme-card-border)] hover:bg-surface
                         transition-colors disabled:opacity-50"
              title="Refresh prices"
            >
              <svg
                className={`w-5 h-5 text-muted ${isLoading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>

            {/* Add transaction button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg
                         bg-gradient-to-r from-cosmic to-nebula text-white font-semibold
                         hover:from-cosmic hover:to-nebula hover:brightness-110
                         shadow-lg shadow-cosmic/20 hover:shadow-cosmic/30
                         transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Transaction
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-loss/20 text-loss border border-loss/30">
            {error}
          </div>
        )}

        {/* Main content */}
        {holdings.length === 0 && !isLoading ? (
          <EmptyPortfolioState onAddTransaction={() => setIsModalOpen(true)} />
        ) : (
          <>
            {/* Summary Cards */}
            {summary && <PortfolioSummaryCards summary={summary} />}

            {/* Allocation Pie Chart */}
            <PortfolioPieChart holdings={holdings} breakdownThreshold={5} />

            {/* Holdings Table */}
            <PortfolioTable
              holdings={holdings}
              onDeleteTransaction={deleteTransaction}
              onDeleteHolding={deleteHolding}
              isLoading={isLoading}
            />
          </>
        )}

        {/* Footer */}
        <div className="mt-8 text-xs text-subtle text-center">
          <p>Portfolio data is synced in real-time with your account.</p>
        </div>
      </main>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addTransaction}
      />
    </div>
  );
}
