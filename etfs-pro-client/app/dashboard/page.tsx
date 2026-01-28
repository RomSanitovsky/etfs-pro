import { fetchQuotes, fetchAllTimeHighsBatch } from "@/lib/yahoo-finance";
import { buildStockData } from "@/lib/calculations";
import { DEFAULT_SYMBOLS, DEFAULT_ATH_THRESHOLD } from "@/lib/constants";
import { WatchlistTable } from "@/components/WatchlistTable";
import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import { PortfolioCTA } from "@/components/portfolio";
import { DashboardMarketingSections } from "@/components/DashboardMarketingSections";
import type { StockData } from "@/lib/types";

export const revalidate = 60;

async function getInitialStockData(): Promise<StockData[]> {
  try {
    const [quotes, athMap] = await Promise.all([
      fetchQuotes(DEFAULT_SYMBOLS),
      fetchAllTimeHighsBatch(DEFAULT_SYMBOLS),
    ]);

    return quotes.map((quote) => {
      const athData = athMap.get(quote.symbol) || {
        allTimeHigh: quote.regularMarketPrice,
        athDate: new Date(),
      };

      return buildStockData(
        quote,
        athData.allTimeHigh,
        athData.athDate,
        DEFAULT_ATH_THRESHOLD
      );
    });
  } catch (error) {
    console.error("Failed to fetch initial stock data:", error);
    return [];
  }
}

export default async function Dashboard() {
  const initialData = await getInitialStockData();

  return (
    <div className="min-h-screen relative">
      <StarField />
      <Header />

      <main className="relative z-10 container mx-auto px-4 py-8 pt-16 md:pt-8 max-w-6xl">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cosmic/10 border border-cosmic/20 mb-4">
            <span className="text-xs font-medium text-cosmic tracking-wide uppercase">Live Dashboard</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            <span className="hero-title">Your</span>
            <span className="hero-title-accent mx-2">ETF</span>
            <span className="hero-title">Watchlist</span>
          </h1>
          <p className="text-muted max-w-lg mx-auto">
            Real-time tracking with all-time high analytics and price alerts
          </p>
        </div>

        {/* Portfolio CTA for premium users */}
        <PortfolioCTA />

        {/* Main content */}
        <WatchlistTable initialData={initialData} />

        {/* Legend */}
        <div className="mt-8 flex flex-wrap gap-6 justify-center text-sm text-muted">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/20 text-gold text-xs font-semibold">
              <span className="text-sm">&#9733;</span>
              ATH
            </span>
            <span>Near ATH</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-loss"></span>
            <span>% Down from ATH</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gold"></span>
            <span>% Needed to reach ATH</span>
          </div>
        </div>

        {/* Marketing sections (hidden for premium users) */}
        <DashboardMarketingSections />

        {/* Legal Disclaimer */}
        <div className="mt-16 pt-8 border-t border-[var(--theme-card-border)]">
          <p className="text-xs text-subtle text-center max-w-3xl mx-auto leading-relaxed">
            <span className="font-semibold text-muted">Disclaimer:</span> The information provided on this website is for informational purposes only and does not constitute financial, investment, or trading advice. Price data, all-time high calculations, and other market information may be delayed, inaccurate, or incomplete. We make no representations or warranties regarding the accuracy, completeness, or timeliness of any data displayed. You are solely responsible for verifying all information before making any investment decisions. Past performance is not indicative of future results. Use of this service is at your own risk.
          </p>
        </div>
      </main>
    </div>
  );
}
