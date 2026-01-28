"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/hooks/usePortfolio";
import {
  PortfolioSummaryCards,
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

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <StarField />
        <div className="w-8 h-8 border-2 border-slate-600 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    router.push("/login");
    return null;
  }

  // Redirect non-premium users to subscription page
  if (!user.isPremium) {
    router.push("/subscription");
    return null;
  }

  return (
    <div className="min-h-screen relative">
      <StarField />
      <Header />

      <main className="relative z-10 container mx-auto px-4 py-8 pt-16 md:pt-8 max-w-6xl">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-3">
              <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs font-medium text-amber-400 tracking-wide uppercase">Premium Feature</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              My Portfolio
            </h1>
            <p className="text-slate-400">
              Track your investments and monitor P&L performance
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh button */}
            <button
              onClick={refreshPrices}
              disabled={isLoading}
              className="p-2.5 rounded-lg border border-slate-700 hover:bg-slate-800 hover:border-slate-600
                         transition-colors disabled:opacity-50"
              title="Refresh prices"
            >
              <svg
                className={`w-5 h-5 text-slate-400 ${isLoading ? "animate-spin" : ""}`}
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
                         bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold
                         hover:from-cyan-400 hover:to-purple-400
                         shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30
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
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
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
        <div className="mt-8 text-xs text-slate-500 text-center">
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
