import { notFound } from "next/navigation";
import { fetchDetailedQuote, fetchChartData, fetchAllTimeHigh } from "@/lib/yahoo-finance";
import { StockDetailView } from "@/components/stock/StockDetailView";
import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import Link from "next/link";
import type { StockDetailData } from "@/lib/types";
import type { Metadata } from "next";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ symbol: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { symbol } = await params;
  return {
    title: `${symbol.toUpperCase()} - Stock Details | ETFs Pro`,
    description: `View detailed price chart, statistics, and ATH analysis for ${symbol.toUpperCase()}`,
  };
}

async function getStockData(symbol: string): Promise<StockDetailData | null> {
  try {
    const [quote, chartData, athData] = await Promise.all([
      fetchDetailedQuote(symbol.toUpperCase()),
      fetchChartData(symbol.toUpperCase(), "1M"),
      fetchAllTimeHigh(symbol.toUpperCase()),
    ]);

    if (!quote) {
      return null;
    }

    return {
      quote,
      chartData,
      allTimeHigh: athData.allTimeHigh,
      athDate: athData.athDate.toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    return null;
  }
}

export default async function StockPage({ params }: PageProps) {
  const { symbol } = await params;
  const stockData = await getStockData(symbol);

  if (!stockData) {
    notFound();
  }

  return (
    <div className="min-h-screen relative">
      <StarField />
      <Header />

      <main className="relative z-10 container mx-auto px-4 py-8 pt-16 md:pt-8 max-w-6xl">
        <StockDetailView initialData={stockData} />

        {/* Legal Disclaimer */}
        <div className="mt-16 pt-8 border-t border-slate-800">
          <p className="text-xs text-slate-500 text-center max-w-3xl mx-auto leading-relaxed">
            <span className="font-semibold text-slate-400">Disclaimer:</span> The
            information provided on this website is for informational purposes
            only and does not constitute financial, investment, or trading
            advice. Price data, all-time high calculations, and other market
            information may be delayed, inaccurate, or incomplete. Use of this
            service is at your own risk.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-subtle mt-4">
            <Link href="/about" className="hover:text-cosmic transition-colors">About Us</Link>
            <span aria-hidden="true">&middot;</span>
            <Link href="/contact" className="hover:text-cosmic transition-colors">Contact Us</Link>
          </div>
          <p className="text-xs text-subtle text-center mt-2">
            &copy; {new Date().getFullYear()} ETFs Pro. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}
