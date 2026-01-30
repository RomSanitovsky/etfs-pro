import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | ETFs Pro",
  description:
    "Learn about ETFs Pro — our vision, values, and commitment to transparent financial information.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen relative">
      <StarField />
      <Header />

      <main className="relative z-10 container mx-auto px-4 py-8 pt-16 md:pt-8 max-w-4xl">
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
              About
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            About ETFs Pro
          </h1>
          <p className="text-muted max-w-lg mx-auto">
            Clarity, transparency, and responsibility in financial information
          </p>
        </div>

        {/* Content sections */}
        <div className="space-y-8">
          {/* Our Vision */}
          <section className="glass-card p-6 md:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Our Vision
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              We believe every investor deserves access to clear, honest market
              data without noise or hidden agendas. ETFs Pro exists to put
              straightforward information in your hands — what an ETF costs
              today, where it stands relative to its all-time high, and how your
              portfolio is performing. No spin, no hype, just the numbers.
            </p>
          </section>

          {/* Our Responsibility */}
          <section className="glass-card p-6 md:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Our Responsibility
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Financial data carries weight. People make real decisions based on
              the numbers they see, and we take that seriously. We are committed
              to presenting information as accurately as we can, being upfront
              about the limitations of our data, and never positioning ourselves
              as a substitute for professional financial advice. We are an
              information tool — not an advisor.
            </p>
          </section>

          {/* Transparency */}
          <section className="glass-card p-6 md:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Transparency
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Market data is sourced from third-party financial data providers.
              Prices may be delayed and are not guaranteed to be real-time.
              All-time high values are calculated from available historical data
              and may not reflect intraday peaks. We will always be honest about
              what our data can and cannot tell you.
            </p>
          </section>

          {/* Legal Notice */}
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
