import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | ETFs Pro",
  description:
    "Learn about ETFs Pro — a free informational platform for tracking ETF prices, all-time highs, and portfolio performance.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen relative">
      <StarField />
      <Header />

      <main className="relative z-10 container mx-auto px-4 py-8 pt-16 md:pt-8 max-w-4xl">
        {/* Page header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cosmic/10 border border-cosmic/20 mb-4">
            <span className="text-xs font-medium text-cosmic tracking-wide uppercase">
              About
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            About ETFs Pro
          </h1>
          <p className="text-muted max-w-lg mx-auto">
            Your free companion for ETF tracking and all-time high analytics
          </p>
        </div>

        {/* Content sections */}
        <div className="space-y-8">
          {/* Who We Are */}
          <section className="glass-card p-6 md:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Who We Are
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              ETFs Pro is an informational platform built for investors who want
              a clear, real-time view of the ETF market. We provide price
              tracking, all-time high analytics, and portfolio monitoring tools
              so you can stay informed about the funds that matter to you.
            </p>
          </section>

          {/* What We Do */}
          <section className="glass-card p-6 md:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-3">
              What We Do
            </h2>
            <ul className="space-y-3 text-sm text-muted leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-cosmic shrink-0" />
                <span>
                  <span className="font-medium text-foreground">
                    Live Watchlist
                  </span>{" "}
                  — Track ETF prices, daily changes, and distance from all-time
                  highs in one dashboard.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-cosmic shrink-0" />
                <span>
                  <span className="font-medium text-foreground">
                    ATH Analytics
                  </span>{" "}
                  — See exactly how far each fund is from its record price and
                  what return is needed to get back.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-cosmic shrink-0" />
                <span>
                  <span className="font-medium text-foreground">
                    Portfolio Tracking
                  </span>{" "}
                  — Log your transactions and monitor profit & loss across all
                  your holdings.
                </span>
              </li>
            </ul>
          </section>

          {/* Our Data */}
          <section className="glass-card p-6 md:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Our Data
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Market data is sourced from third-party financial data providers.
              Prices may be delayed and are not guaranteed to be real-time.
              All-time high values are calculated from available historical data
              and may not reflect intraday peaks. We strive for accuracy but
              cannot guarantee that every data point is complete or current.
            </p>
          </section>

          {/* Legal / No Advice */}
          <section className="glass-card p-6 md:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Legal Notice
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              ETFs Pro is not a registered investment adviser, broker-dealer, or
              financial institution. Nothing on this website constitutes
              financial, investment, or trading advice. The information provided
              is for informational and educational purposes only. You are solely
              responsible for your own investment decisions and should consult a
              qualified financial professional before making any financial
              commitments. Past performance is not indicative of future results.
              Use of this service is at your own risk.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-[var(--theme-card-border)]">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-subtle">
            <Link href="/about" className="hover:text-cosmic transition-colors">
              About Us
            </Link>
            <span aria-hidden="true">&middot;</span>
            <Link
              href="/contact"
              className="hover:text-cosmic transition-colors"
            >
              Contact Us
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
