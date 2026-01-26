import { fetchQuotes, fetchAllTimeHighsBatch } from "@/lib/yahoo-finance";
import { buildStockData } from "@/lib/calculations";
import { DEFAULT_SYMBOLS, DEFAULT_ATH_THRESHOLD } from "@/lib/constants";
import { WatchlistTable } from "@/components/WatchlistTable";
import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import { SubscriptionSection } from "@/components/subscription/SubscriptionSection";
import { WhyChooseUsSection } from "@/components/WhyChooseUsSection";
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
            <span className="text-xs font-medium text-cyan-400 tracking-wide uppercase">Live Dashboard</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            <span className="hero-title">Your</span>
            <span className="hero-title-accent mx-2">ETF</span>
            <span className="hero-title">Watchlist</span>
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto">
            Real-time tracking with all-time high analytics and price alerts
          </p>
        </div>

        {/* Main content */}
        <WatchlistTable initialData={initialData} />

        {/* Legend */}
        <div className="mt-8 flex flex-wrap gap-6 justify-center text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
            <span>Near ATH</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400"></span>
            <span>% Down from ATH</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
            <span>% Needed to reach ATH</span>
          </div>
        </div>

        {/* Subscription Section */}
        <SubscriptionSection />

        {/* Why Choose Us Section */}
        <WhyChooseUsSection />
      </main>
    </div>
  );
}
