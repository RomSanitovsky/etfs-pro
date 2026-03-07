"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();

  // Highlight current page section
  const getCurrentSection = () => {
    if (pathname === "/dashboard") return "dashboard-watchlist";
    if (pathname === "/portfolio") return "portfolio";
    if (pathname?.startsWith("/stock/")) return "stock-detail";
    if (pathname === "/subscription") return "subscription-plans";
    return null;
  };

  const currentSection = getCurrentSection();

  return (
    <aside className="fixed left-4 top-24 z-40 hidden xl:block">
      <nav className="w-44 glass-card p-3 space-y-0.5">
        {DOCS_SECTIONS.map((section) => {
          const isActive = section.id === currentSection;

          return (
            <Link
              key={section.id}
              href={`/docs#${section.id}`}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "text-cosmic bg-cosmic/10 font-medium border-l-2 border-cosmic"
                  : "text-muted hover:text-foreground hover:bg-surface/50 border-l-2 border-transparent"
              }`}
            >
              {section.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
