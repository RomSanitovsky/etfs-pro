"use client";

import { useState } from "react";
import Link from "next/link";

const DOCS_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "getting-started", label: "Getting Started" },
  { id: "dashboard-watchlist", label: "Dashboard & Watchlist" },
  { id: "stock-detail", label: "Stock Detail Page" },
  { id: "portfolio", label: "Portfolio" },
  { id: "subscription-plans", label: "Subscription Plans" },
  { id: "glossary", label: "Financial Glossary" },
  { id: "data-sources", label: "Data Sources & Accuracy" },
  { id: "legal-disclaimer", label: "Legal Disclaimer" },
];

export function DocsSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-10 h-10 rounded-r-lg
                   bg-surface/90 backdrop-blur-sm border border-l-0 border-[var(--theme-card-border)]
                   text-muted hover:text-cosmic hover:bg-surface transition-all duration-200
                   ${isOpen ? "rounded-tr-none" : ""}`}
        title="Documentation"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </button>

      {/* Expanded panel */}
      <div
        className={`absolute left-0 top-0 transform transition-all duration-300 ease-out origin-left
                   ${isOpen ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0 pointer-events-none"}`}
      >
        <div className="w-56 bg-surface/95 backdrop-blur-md border border-l-0 border-[var(--theme-card-border)] rounded-r-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[var(--theme-card-border)] bg-gradient-to-r from-cosmic/10 to-nebula/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cosmic uppercase tracking-wider">
                Documentation
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-surface/50 text-muted hover:text-foreground transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-2 max-h-[60vh] overflow-y-auto">
            {DOCS_SECTIONS.map((section) => (
              <Link
                key={section.id}
                href={`/docs#${section.id}`}
                className="block px-3 py-2 rounded-lg text-sm text-muted
                         hover:text-foreground hover:bg-surface/50
                         transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {section.label}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-[var(--theme-card-border)]">
            <Link
              href="/docs"
              className="flex items-center gap-2 text-xs text-cosmic hover:text-cosmic/80 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span>View Full Docs</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
