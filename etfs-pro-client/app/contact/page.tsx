import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | ETFs Pro",
  description:
    "Get in touch with the ETFs Pro team for questions, feedback, or support.",
};

export default function ContactPage() {
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
              Contact
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Contact Us
          </h1>
          <p className="text-muted max-w-lg mx-auto">
            Have a question or feedback? We&apos;d love to hear from you.
          </p>
        </div>

        {/* Contact card */}
        <div className="glass-card p-6 md:p-8 max-w-xl mx-auto text-center">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Email Us
          </h2>
          <p className="text-sm text-muted leading-relaxed mb-6">
            For questions, bug reports, or general feedback, reach out to us at:
          </p>
          <a
            href="mailto:support@etfspro.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cosmic/10 border border-cosmic/20 text-cosmic font-medium hover:bg-cosmic/20 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            support@etfspro.com
          </a>
          <p className="text-xs text-subtle mt-6 leading-relaxed">
            We aim to respond to all inquiries within a few business days.
          </p>
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
