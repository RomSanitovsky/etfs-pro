"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import { DEFINITIONS } from "@/lib/definitions";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "getting-started", label: "Getting Started" },
  { id: "dashboard-watchlist", label: "Dashboard & Watchlist" },
  { id: "stock-detail", label: "Stock Detail Page" },
  { id: "portfolio", label: "Portfolio" },
  { id: "subscription-plans", label: "Subscription Plans" },
  { id: "glossary", label: "Financial Glossary" },
  { id: "data-sources", label: "Data Sources & Accuracy" },
  { id: "legal-disclaimer", label: "Legal Disclaimer" },
] as const;

// Glossary terms organized alphabetically
const GLOSSARY_TERMS: { term: string; definition: string }[] = [
  { term: "All-Time High (ATH)", definition: "The highest price a security has ever reached. ETFs Pro tracks split-adjusted ATH values from available historical data." },
  { term: "Allocation", definition: "The percentage of your total portfolio value that a particular holding represents. Helps assess diversification." },
  { term: "Average Volume", definition: DEFINITIONS.avgVolume },
  { term: "Beta", definition: DEFINITIONS.beta },
  { term: "Cost Basis", definition: "The total amount paid for an investment, including the purchase price and any fees. Used to calculate profit or loss when selling." },
  { term: "Cryptocurrency", definition: DEFINITIONS.crypto },
  { term: "Day Change", definition: DEFINITIONS.dayChange },
  { term: "Day Range", definition: DEFINITIONS.dayRange },
  { term: "Dividend Yield", definition: DEFINITIONS.dividendYield },
  { term: "ETF (Exchange-Traded Fund)", definition: DEFINITIONS.etf },
  { term: "Expense Ratio", definition: DEFINITIONS.expenseRatio },
  { term: "50-Day Moving Average", definition: DEFINITIONS.fiftyDayMA },
  { term: "52-Week High", definition: DEFINITIONS.fiftyTwoWeekHigh },
  { term: "52-Week Low", definition: DEFINITIONS.fiftyTwoWeekLow },
  { term: "Forward P/E", definition: DEFINITIONS.forwardPE },
  { term: "Market Cap", definition: DEFINITIONS.marketCap },
  { term: "Market State", definition: DEFINITIONS.marketState },
  { term: "P/E Ratio", definition: DEFINITIONS.peRatio },
  { term: "Percent Down from ATH", definition: DEFINITIONS.percentDown },
  { term: "Percent to ATH", definition: DEFINITIONS.percentToATH },
  { term: "Previous Close", definition: DEFINITIONS.previousClose },
  { term: "Stock", definition: DEFINITIONS.stock },
  { term: "200-Day Moving Average", definition: DEFINITIONS.twoHundredDayMA },
  { term: "Unrealized P&L", definition: "The profit or loss on a holding that has not yet been sold. Calculated as the difference between the current market value and the cost basis." },
  { term: "Volume", definition: DEFINITIONS.volume },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [tocOpen, setTocOpen] = useState(false);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  const setRef = useCallback((id: string) => (el: HTMLElement | null) => {
    if (el) sectionRefs.current.set(id, el);
    else sectionRefs.current.delete(id);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    for (const el of sectionRefs.current.values()) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setTocOpen(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <StarField />
      <Header />

      <main className="relative z-10 container mx-auto px-4 py-8 pt-20 md:pt-16 max-w-6xl">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Page header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cosmic/10 border border-cosmic/20 mb-4">
            <span className="text-xs font-medium text-cosmic tracking-wide uppercase">
              Documentation
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            ETFs Pro Documentation
          </h1>
          <p className="text-muted max-w-lg mx-auto">
            Everything you need to know about using ETFs Pro
          </p>
        </div>

        {/* Mobile TOC toggle */}
        <div className="md:hidden mb-6">
          <button
            onClick={() => setTocOpen(!tocOpen)}
            className="w-full glass-card p-4 flex items-center justify-between text-sm font-medium text-foreground"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-cosmic" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Table of Contents
            </span>
            <svg
              className={`w-4 h-4 text-muted transition-transform ${tocOpen ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {tocOpen && (
            <div className="glass-card mt-2 p-3">
              <nav className="space-y-1">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === s.id
                        ? "text-cosmic bg-cosmic/10 font-medium"
                        : "text-muted hover:text-foreground hover:bg-surface/50"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>

        {/* Layout: sidebar + content */}
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-56 shrink-0">
            <div className="sticky top-8">
              <nav className="glass-card p-4 space-y-1">
                <p className="text-xs font-medium text-subtle uppercase tracking-wider mb-3 px-3">
                  Contents
                </p>
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === s.id
                        ? "text-cosmic bg-cosmic/10 font-medium border-l-2 border-cosmic"
                        : "text-muted hover:text-foreground hover:bg-surface/50 border-l-2 border-transparent"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Overview */}
            <section id="overview" ref={setRef("overview")} className="glass-card p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Overview</h2>
              <p className="text-sm text-muted leading-relaxed mb-4">
                ETFs Pro is a real-time financial tracking platform designed to give investors clear, actionable insight into their watchlist and portfolio. The app focuses on all-time high (ATH) analytics, helping you understand where your investments stand relative to their historical peaks.
              </p>
              <p className="text-sm text-muted leading-relaxed mb-4">
                Whether you&apos;re monitoring ETFs, stocks, or crypto, ETFs Pro provides the data you need to make informed decisions &mdash; without the noise.
              </p>
              <h3 className="text-lg font-semibold text-foreground mb-3">Key Features</h3>
              <ul className="space-y-2 text-sm text-muted">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cosmic mt-1.5 shrink-0" />
                  Real-time price tracking and all-time high analytics
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cosmic mt-1.5 shrink-0" />
                  Customizable watchlist with filtering and sorting
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cosmic mt-1.5 shrink-0" />
                  Detailed stock/ETF pages with charts and key metrics
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cosmic mt-1.5 shrink-0" />
                  Portfolio tracking with P&amp;L, allocation, and dividends (Premium)
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cosmic mt-1.5 shrink-0" />
                  Clean, space-themed interface with light and dark modes
                </li>
              </ul>
            </section>

            {/* Getting Started */}
            <section id="getting-started" ref={setRef("getting-started")} className="glass-card p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Getting Started</h2>

              <h3 className="text-lg font-semibold text-foreground mb-3">Creating an Account</h3>
              <p className="text-sm text-muted leading-relaxed mb-4">
                Sign up with your Google account for a seamless login experience. Click the <strong className="text-foreground">Sign In</strong> button in the top-right corner to get started. No separate username or password required.
              </p>

              <h3 className="text-lg font-semibold text-foreground mb-3">Navigating the Dashboard</h3>
              <p className="text-sm text-muted leading-relaxed mb-4">
                Once signed in, you&apos;ll land on the main dashboard where your watchlist is displayed. From here you can:
              </p>
              <ul className="space-y-2 text-sm text-muted mb-4">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-nebula mt-1.5 shrink-0" />
                  View real-time prices and ATH metrics for all tracked symbols
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-nebula mt-1.5 shrink-0" />
                  Add or remove symbols from your watchlist
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-nebula mt-1.5 shrink-0" />
                  Click any symbol to view its detailed page
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-nebula mt-1.5 shrink-0" />
                  Access your Portfolio, Subscription, and Theme settings from the user menu
                </li>
              </ul>
            </section>

            {/* Dashboard & Watchlist */}
            <section id="dashboard-watchlist" ref={setRef("dashboard-watchlist")} className="glass-card p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Dashboard &amp; Watchlist</h2>

              <h3 className="text-lg font-semibold text-foreground mb-3">Your Watchlist</h3>
              <p className="text-sm text-muted leading-relaxed mb-4">
                The watchlist is the centerpiece of ETFs Pro. It displays a table of symbols you&apos;re tracking with columns for price, day change, all-time high, percent down from ATH, percent needed to reach ATH, expense ratio, and dividend yield.
              </p>

              <h3 className="text-lg font-semibold text-foreground mb-3">Adding &amp; Removing Symbols</h3>
              <p className="text-sm text-muted leading-relaxed mb-4">
                Use the search bar above the watchlist to find and add new symbols. To remove a symbol, click the remove button on its row. Your watchlist is saved to your account and syncs across devices.
              </p>

              <h3 className="text-lg font-semibold text-foreground mb-3">Stats Cards</h3>
              <p className="text-sm text-muted leading-relaxed mb-4">
                Above the watchlist table, summary stats cards highlight key insights from your tracked symbols:
              </p>
              <ul className="space-y-2 text-sm text-muted mb-4">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cosmic mt-1.5 shrink-0" />
                  <strong className="text-foreground">Deepest Discount</strong> &mdash; The symbol furthest below its ATH
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cosmic mt-1.5 shrink-0" />
                  <strong className="text-foreground">Nearest Peak</strong> &mdash; The symbol closest to its ATH
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cosmic mt-1.5 shrink-0" />
                  <strong className="text-foreground">At ATH</strong> &mdash; Number of symbols currently at or near their all-time high
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cosmic mt-1.5 shrink-0" />
                  <strong className="text-foreground">Top Performer</strong> &mdash; The symbol with the best day change
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cosmic mt-1.5 shrink-0" />
                  <strong className="text-foreground">Avg from Peak</strong> &mdash; The average distance from ATH across all symbols
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mb-3">Filtering &amp; Sorting</h3>
              <p className="text-sm text-muted leading-relaxed mb-4">
                Filter your watchlist by asset type (ETF, Stock, Crypto, Materials) using the filter chips. Click any column header to sort ascending or descending. Combine filters and sorting to find exactly what you&apos;re looking for.
              </p>

              <h3 className="text-lg font-semibold text-foreground mb-3">ATH Badge &amp; Threshold</h3>
              <p className="text-sm text-muted leading-relaxed">
                Symbols within your configured ATH threshold display a gold star badge. The default threshold is 1% &mdash; meaning any symbol within 1% of its all-time high will show the badge. You can adjust this threshold in the watchlist settings.
              </p>
            </section>

            {/* Stock Detail Page */}
            <section id="stock-detail" ref={setRef("stock-detail")} className="glass-card p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Stock Detail Page</h2>
              <p className="text-sm text-muted leading-relaxed mb-4">
                Click any symbol in your watchlist to open its detail page. This page provides a comprehensive view of the security&apos;s data.
              </p>

              <h3 className="text-lg font-semibold text-foreground mb-3">Price Chart</h3>
              <p className="text-sm text-muted leading-relaxed mb-4">
                An interactive price chart shows historical performance. Toggle between time ranges: <strong className="text-foreground">1D</strong> (one day), <strong className="text-foreground">1W</strong> (one week), <strong className="text-foreground">1M</strong> (one month), <strong className="text-foreground">1Y</strong> (one year), and <strong className="text-foreground">5Y</strong> (five years).
              </p>

              <h3 className="text-lg font-semibold text-foreground mb-3">Market State Indicator</h3>
              <p className="text-sm text-muted leading-relaxed mb-4">
                A badge at the top shows the current market state &mdash; Regular (open), Pre-Market, Post-Market (after hours), or Closed. This helps you understand whether the displayed price is from live trading or extended hours.
              </p>

              <h3 className="text-lg font-semibold text-foreground mb-3">Key Metrics</h3>
              <p className="text-sm text-muted leading-relaxed mb-4">
                The detail page displays a range of fundamental and technical metrics:
              </p>
              <ul className="space-y-2 text-sm text-muted mb-4">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-nebula mt-1.5 shrink-0" />
                  Market Cap, P/E Ratio, Forward P/E
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-nebula mt-1.5 shrink-0" />
                  Volume and Average Volume
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-nebula mt-1.5 shrink-0" />
                  Beta, 52-Week Range, Day Range
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-nebula mt-1.5 shrink-0" />
                  50-Day and 200-Day Moving Averages
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-nebula mt-1.5 shrink-0" />
                  Expense Ratio and Dividend Yield (for ETFs)
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mb-3">ATH Analysis</h3>
              <p className="text-sm text-muted leading-relaxed">
                A dedicated ATH analysis section shows the all-time high price, the date it was reached, how far the current price is from that peak, and the percentage gain needed to return to the ATH. Hover or tap any metric label for a tooltip with its definition.
              </p>
            </section>

            {/* Portfolio */}
            <section id="portfolio" ref={setRef("portfolio")} className="glass-card p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Portfolio
                <span className="ml-2 inline-flex px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-gold/20 text-gold border border-gold/30 align-middle">
                  Premium
                </span>
              </h2>
              <p className="text-sm text-muted leading-relaxed mb-4">
                The Portfolio feature is available to Premium subscribers. It lets you track your actual holdings, including purchase history, profit/loss, and allocation.
              </p>

              <h3 className="text-lg font-semibold text-foreground mb-3">Overview &amp; Summary</h3>
              <p className="text-sm text-muted leading-relaxed mb-4">
                The portfolio overview displays summary cards with your total portfolio value, total gain/loss, day change, and expected annual dividends.
              </p>

              <h3 className="text-lg font-semibold text-foreground mb-3">Adding Transactions</h3>
              <p className="text-sm text-muted leading-relaxed mb-4">
                Add buy transactions by entering the symbol, number of shares, price per share, and date. Each transaction is saved to your account.
              </p>

              <h3 className="text-lg font-semibold text-foreground mb-3">Editing &amp; Deleting</h3>
              <p className="text-sm text-muted leading-relaxed mb-4">
                Edit any transaction to correct mistakes, or delete it entirely. Changes are reflected immediately in your portfolio summary and metrics.
              </p>

              <h3 className="text-lg font-semibold text-foreground mb-3">Holdings Table</h3>
              <p className="text-sm text-muted leading-relaxed mb-4">
                Your holdings are displayed in a table showing each symbol&apos;s current value, cost basis, shares held, average cost, unrealized P&amp;L (both dollar amount and percentage), and allocation percentage.
              </p>

              <h3 className="text-lg font-semibold text-foreground mb-3">Allocation Chart</h3>
              <p className="text-sm text-muted leading-relaxed mb-4">
                A pie chart visualizes your portfolio allocation, making it easy to see how concentrated or diversified your holdings are at a glance.
              </p>

              <h3 className="text-lg font-semibold text-foreground mb-3">Expected Annual Dividends</h3>
              <p className="text-sm text-muted leading-relaxed">
                Based on the dividend yields of your holdings and the number of shares you own, the portfolio calculates your expected annual dividend income. This is an estimate based on trailing dividend data and may vary.
              </p>
            </section>

            {/* Subscription Plans */}
            <section id="subscription-plans" ref={setRef("subscription-plans")} className="glass-card p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Subscription Plans</h2>

              <h3 className="text-lg font-semibold text-foreground mb-3">Free Tier</h3>
              <p className="text-sm text-muted leading-relaxed mb-2">
                All users get access to core features at no cost:
              </p>
              <ul className="space-y-2 text-sm text-muted mb-4">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cosmic mt-1.5 shrink-0" />
                  Full watchlist with real-time prices and ATH analytics
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cosmic mt-1.5 shrink-0" />
                  Detailed stock/ETF pages with charts and metrics
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cosmic mt-1.5 shrink-0" />
                  Stats cards and filtering/sorting
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cosmic mt-1.5 shrink-0" />
                  Theme customization (light/dark modes)
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mb-3">Premium Tier &mdash; $9.99/month</h3>
              <p className="text-sm text-muted leading-relaxed mb-2">
                Unlock the full ETFs Pro experience:
              </p>
              <ul className="space-y-2 text-sm text-muted mb-4">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                  Everything in Free, plus:
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                  Full portfolio tracking with transaction management
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                  P&amp;L analytics and allocation charts
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                  Expected annual dividend calculations
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mb-3">Managing Your Subscription</h3>
              <p className="text-sm text-muted leading-relaxed">
                Upgrade or manage your subscription from the user menu. Click your avatar in the top-right corner, then select your current plan to visit the Subscription page. Payments are processed securely through Stripe. You can cancel anytime &mdash; your Premium access will remain active until the end of your billing period.
              </p>
            </section>

            {/* Financial Glossary */}
            <section id="glossary" ref={setRef("glossary")} className="glass-card p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Financial Glossary</h2>
              <p className="text-sm text-muted leading-relaxed mb-6">
                Definitions for financial terms and metrics used throughout ETFs Pro. Hover or tap any metric label in the app for an inline tooltip.
              </p>
              <dl className="space-y-4">
                {GLOSSARY_TERMS.map((item) => (
                  <div key={item.term}>
                    <dt className="text-sm font-semibold text-foreground">{item.term}</dt>
                    <dd className="text-sm text-muted leading-relaxed mt-1">{item.definition}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Data Sources & Accuracy */}
            <section id="data-sources" ref={setRef("data-sources")} className="glass-card p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Data Sources &amp; Accuracy</h2>

              <h3 className="text-lg font-semibold text-foreground mb-3">Third-Party Data</h3>
              <p className="text-sm text-muted leading-relaxed mb-4">
                All market data displayed in ETFs Pro is sourced from third-party financial data providers. We aggregate and present this data in a user-friendly format but do not generate or independently verify raw market data.
              </p>

              <h3 className="text-lg font-semibold text-foreground mb-3">Pricing Delays</h3>
              <p className="text-sm text-muted leading-relaxed mb-4">
                Prices may be delayed depending on the data source and market conditions. While we strive to show near-real-time data, displayed prices should not be treated as live quotes for trading decisions. Always verify prices with your broker before executing trades.
              </p>

              <h3 className="text-lg font-semibold text-foreground mb-3">ATH Calculations</h3>
              <p className="text-sm text-muted leading-relaxed mb-4">
                All-time high values are calculated from available historical data, which may not cover the complete trading history of every security. ATH values are split-adjusted where applicable. Intraday peaks that were not captured at daily close may not be reflected.
              </p>

              <h3 className="text-lg font-semibold text-foreground mb-3">Caching &amp; Refresh</h3>
              <p className="text-sm text-muted leading-relaxed">
                Market data is cached and refreshed periodically to ensure responsiveness. The dashboard automatically revalidates data at regular intervals. If you notice stale data, refreshing the page will fetch the latest available information.
              </p>
            </section>

            {/* Legal Disclaimer */}
            <section id="legal-disclaimer" ref={setRef("legal-disclaimer")} className="glass-card p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Legal Disclaimer</h2>

              <div className="border border-loss/20 bg-loss/5 rounded-xl p-5 mb-4">
                <p className="text-sm text-muted leading-relaxed">
                  <strong className="text-foreground">Not Financial Advice.</strong> The information provided on ETFs Pro is for informational and educational purposes only. Nothing on this platform constitutes financial, investment, or trading advice. Always conduct your own research and consult with a qualified financial advisor before making investment decisions.
                </p>
              </div>

              <div className="border border-[var(--theme-card-border)] bg-surface/30 rounded-xl p-5 mb-4">
                <p className="text-sm text-muted leading-relaxed">
                  <strong className="text-foreground">Not a Registered Adviser.</strong> ETFs Pro is not a registered investment adviser, broker-dealer, or financial institution. We do not provide personalized investment recommendations or manage assets on behalf of users.
                </p>
              </div>

              <div className="border border-[var(--theme-card-border)] bg-surface/30 rounded-xl p-5 mb-4">
                <p className="text-sm text-muted leading-relaxed">
                  <strong className="text-foreground">Use at Your Own Risk.</strong> You are solely responsible for your own investment decisions. We make no representations or warranties regarding the accuracy, completeness, or timeliness of any data displayed. Market data may be delayed, inaccurate, or incomplete.
                </p>
              </div>

              <div className="border border-[var(--theme-card-border)] bg-surface/30 rounded-xl p-5">
                <p className="text-sm text-muted leading-relaxed">
                  <strong className="text-foreground">Past Performance Disclaimer.</strong> Past performance is not indicative of future results. Historical data, including all-time highs and price charts, reflects past market conditions and should not be used as a guarantee of future performance.
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-[var(--theme-card-border)]">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-subtle">
            <Link href="/about" className="hover:text-cosmic transition-colors">
              About Us
            </Link>
            <span aria-hidden="true">&middot;</span>
            <Link href="/contact" className="hover:text-cosmic transition-colors">
              Contact Us
            </Link>
            <span aria-hidden="true">&middot;</span>
            <Link href="/docs" className="hover:text-cosmic transition-colors">
              Docs
            </Link>
          </div>
          <p className="text-xs text-subtle text-center mt-2">
            &copy; {new Date().getFullYear()} ETFs Pro. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}
