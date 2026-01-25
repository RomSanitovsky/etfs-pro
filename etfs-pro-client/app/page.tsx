import { fetchQuotes, fetchAllTimeHighsBatch } from "@/lib/yahoo-finance";
import { buildStockData } from "@/lib/calculations";
import { DEFAULT_SYMBOLS, DEFAULT_ATH_THRESHOLD } from "@/lib/constants";
import { WatchlistTable } from "@/components/WatchlistTable";
import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import { SubscriptionSection } from "@/components/subscription/SubscriptionSection";
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

export default async function Home() {
  const initialData = await getInitialStockData();

  return (
    <div className="min-h-screen relative">
      <StarField />
      <Header />

      <main className="relative z-10 container mx-auto px-4 py-8 pt-16 md:pt-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-12">
          {/* Futuristic Title */}
          <div className="relative inline-block">
            {/* Glow backdrop */}
            <div className="absolute inset-0 blur-3xl opacity-30 bg-gradient-to-r from-purple-600 via-cyan-500 to-purple-600 animate-pulse" />
            
            {/* Decorative lines */}
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-px bg-gradient-to-r from-transparent via-cyan-400 to-cyan-400 hidden md:block" />
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-6 h-px bg-gradient-to-l from-transparent via-cyan-400 to-cyan-400 hidden md:block" />
            
            {/* Main title */}
            <h1 className="relative text-4xl md:text-6xl font-black tracking-tight mb-1">
              <span className="hero-title">
                ETFs
              </span>
              <span className="hero-title-accent mx-2">
                PRO
              </span>
              <span className="hero-title">
                Tracker
              </span>
            </h1>
            
            {/* Subtitle bar */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-purple-500" />
              <span className="text-sm font-mono tracking-[0.3em] text-cyan-400/80 uppercase">
                Real-Time Market Intelligence
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-purple-500" />
            </div>
          </div>
          
          <p className="text-slate-400 text-base mt-6 max-w-md mx-auto">
            Track your investments against all-time highs with precision analytics
          </p>
        </header>

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
      </main>
    </div>
  );
}
