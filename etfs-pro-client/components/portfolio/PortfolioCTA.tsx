"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export function PortfolioCTA() {
  const { user, loading } = useAuth();

  if (loading || !user?.isPremium) return null;

  return (
    <div className="mb-8">
      <Link
        href="/portfolio"
        className="group relative block w-full overflow-hidden rounded-2xl border border-nebula/30
                   bg-gradient-to-br from-nebula/40 via-surface/60 to-cosmic/40
                   hover:border-nebula/50 transition-all duration-500"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-nebula/10 via-transparent to-cosmic/10
                        group-hover:from-nebula/20 group-hover:to-cosmic/20 transition-all duration-500" />

        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-8 sm:py-10">
          {/* Left content */}
          <div className="flex items-center gap-5 text-center sm:text-left">
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-nebula to-cosmic
                            flex items-center justify-center shadow-lg shadow-nebula/25
                            group-hover:shadow-nebula/40 transition-shadow duration-500">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
                My Portfolio
              </h3>
              <p className="text-muted text-sm sm:text-base">
                Track your holdings, monitor P&L, and view dividend income
              </p>
            </div>
          </div>

          {/* Right CTA */}
          <div className="flex-shrink-0 flex items-center gap-3 px-6 py-3 rounded-xl
                          bg-gradient-to-r from-nebula to-cosmic text-white font-semibold text-lg
                          shadow-lg shadow-nebula/25
                          group-hover:shadow-nebula/40 group-hover:brightness-110
                          transition-all duration-500">
            View Portfolio
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </Link>
    </div>
  );
}
