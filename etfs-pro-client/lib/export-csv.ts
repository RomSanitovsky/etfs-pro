import type { StockData, PortfolioHoldingWithMetrics, PortfolioSummary, CashHoldingWithMetrics } from "./types";
import { getCurrencyName, getCurrencySymbol } from "./constants";

/**
 * Escapes a CSV field value to handle commas, quotes, and newlines
 */
function escapeCSVField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // If the field contains comma, quote, or newline, wrap in quotes and escape existing quotes
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Formats a number for CSV display
 */
function formatNumber(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined) return "-";
  return value.toFixed(decimals);
}

/**
 * Formats a currency value for CSV display
 */
function formatCurrency(value: number | null | undefined, currency = "USD"): string {
  if (value === null || value === undefined) return "-";
  return `${currency} ${value.toFixed(2)}`;
}

/**
 * Formats a percentage for CSV display
 */
function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

/**
 * Gets current date in a filename-friendly format
 */
function getDateString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0]; // YYYY-MM-DD
}

/**
 * Triggers a CSV file download in the browser
 */
function downloadCSV(content: string, filename: string): void {
  const BOM = "\uFEFF"; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export watchlist data to CSV
 */
export function exportWatchlistToCSV(stocks: StockData[]): void {
  if (stocks.length === 0) return;

  const headers = [
    "Symbol",
    "Name",
    "Asset Type",
    "Current Price",
    "Currency",
    "Daily Change %",
    "All-Time High",
    "ATH Date",
    "% Down from ATH",
    "% to Reach ATH",
    "Near ATH",
    "Dividend Yield %",
    "Expense Ratio %",
  ];

  const rows = stocks.map((stock) => [
    escapeCSVField(stock.symbol),
    escapeCSVField(stock.name),
    escapeCSVField(stock.assetType.toUpperCase()),
    formatNumber(stock.currentPrice),
    escapeCSVField(stock.currency),
    formatPercent(stock.dailyChangePercent),
    formatNumber(stock.allTimeHigh),
    escapeCSVField(stock.athDate ? new Date(stock.athDate).toLocaleDateString() : "-"),
    formatPercent(-stock.percentDown),
    formatPercent(stock.percentToATH),
    stock.isNearATH ? "Yes" : "No",
    stock.dividendYield ? formatNumber(stock.dividendYield) + "%" : "-",
    stock.expenseRatio ? formatNumber(stock.expenseRatio) + "%" : "-",
  ]);

  // Add summary section at the top
  const totalStocks = stocks.length;
  const nearATHCount = stocks.filter((s) => s.isNearATH).length;
  const avgPercentDown = stocks.reduce((sum, s) => sum + s.percentDown, 0) / totalStocks;
  const etfCount = stocks.filter((s) => s.assetType === "etf").length;
  const stockCount = stocks.filter((s) => s.assetType === "stock").length;
  const cryptoCount = stocks.filter((s) => s.assetType === "crypto").length;

  const summarySection = [
    ["PORTFOLIFT WATCHLIST EXPORT"],
    [`Generated: ${new Date().toLocaleString()}`],
    [""],
    ["SUMMARY"],
    [`Total Assets: ${totalStocks}`],
    [`ETFs: ${etfCount} | Stocks: ${stockCount} | Crypto: ${cryptoCount}`],
    [`Near All-Time High: ${nearATHCount}`],
    [`Average % Down from ATH: ${formatPercent(-avgPercentDown)}`],
    [""],
    ["WATCHLIST DATA"],
  ];

  const csvContent = [
    ...summarySection.map((row) => row.join(",")),
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const filename = `portfolift-watchlist-${getDateString()}.csv`;
  downloadCSV(csvContent, filename);
}

/**
 * Export portfolio data to CSV
 */
export function exportPortfolioToCSV(
  holdings: PortfolioHoldingWithMetrics[],
  summary: PortfolioSummary | null,
  cashHoldings: CashHoldingWithMetrics[] = []
): void {
  if (holdings.length === 0 && cashHoldings.length === 0) return;

  const headers = [
    "Symbol",
    "Name",
    "Shares",
    "Average Cost",
    "Current Price",
    "Total Cost",
    "Current Value",
    "Unrealized P&L",
    "P&L %",
    "Allocation %",
    "Dividend Yield %",
    "Expected Annual Dividend",
    "# Transactions",
  ];

  const rows = holdings.map((holding) => [
    escapeCSVField(holding.symbol),
    escapeCSVField(holding.name || "-"),
    formatNumber(holding.totalShares, 4),
    formatCurrency(holding.averageCost),
    formatCurrency(holding.currentPrice),
    formatCurrency(holding.totalCost),
    formatCurrency(holding.currentValue),
    formatCurrency(holding.unrealizedPnL),
    formatPercent(holding.unrealizedPnLPercent),
    formatNumber(holding.allocationPercent) + "%",
    holding.dividendYield ? formatNumber(holding.dividendYield) + "%" : "-",
    formatCurrency(holding.expectedAnnualDividend),
    String(holding.transactions.length),
  ]);

  // Build summary section
  const summarySection = [
    ["PORTFOLIFT PORTFOLIO EXPORT"],
    [`Generated: ${new Date().toLocaleString()}`],
    [""],
    ["PORTFOLIO SUMMARY"],
    [`Total Value: ${summary ? formatCurrency(summary.totalValue) : "-"}`],
    [`Total Cost: ${summary ? formatCurrency(summary.totalCost) : "-"}`],
    [`Total P&L: ${summary ? formatCurrency(summary.totalPnL) : "-"} (${summary ? formatPercent(summary.totalPnLPercent) : "-"})`],
    [`Holdings: ${summary?.holdingsCount || holdings.length}${cashHoldings.length > 0 ? ` + ${cashHoldings.length} cash` : ""}`],
    [`Expected Annual Dividends: ${summary ? formatCurrency(summary.expectedAnnualDividend) : "-"}`],
    [`Portfolio Yield: ${summary ? formatNumber(summary.portfolioDividendYield) + "%" : "-"}`],
    summary?.topGainer
      ? [`Top Gainer: ${summary.topGainer.symbol} (${formatPercent(summary.topGainer.pnlPercent)})`]
      : [],
    summary?.topLoser
      ? [`Top Loser: ${summary.topLoser.symbol} (${formatPercent(summary.topLoser.pnlPercent)})`]
      : [],
    [""],
    ["HOLDINGS"],
  ].filter((row) => row.length > 0);

  let csvContent = [
    ...summarySection.map((row) => row.join(",")),
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  // Add cash holdings section if present
  if (cashHoldings.length > 0) {
    const cashHeaders = ["Currency", "Name", "Balance", "Value (USD)", "Exchange Rate", "Allocation %"];
    const cashRows = cashHoldings.map((cash) => [
      escapeCSVField(cash.currency),
      escapeCSVField(getCurrencyName(cash.currency)),
      `${getCurrencySymbol(cash.currency)}${formatNumber(cash.balance)}`,
      formatCurrency(cash.valueInUSD),
      formatNumber(cash.exchangeRate, 4),
      formatNumber(cash.allocationPercent) + "%",
    ]);

    csvContent += "\n\nCASH HOLDINGS\n";
    csvContent += cashHeaders.join(",") + "\n";
    csvContent += cashRows.map((row) => row.join(",")).join("\n");
  }

  const filename = `portfolift-portfolio-${getDateString()}.csv`;
  downloadCSV(csvContent, filename);
}

/**
 * Export cash holdings to CSV
 */
export function exportPortfolioCashToCSV(cashHoldings: CashHoldingWithMetrics[]): void {
  if (cashHoldings.length === 0) return;

  const headers = [
    "Currency",
    "Name",
    "Symbol",
    "Balance",
    "Value (USD)",
    "Exchange Rate",
    "Allocation %",
  ];

  const rows = cashHoldings.map((cash) => [
    escapeCSVField(cash.currency),
    escapeCSVField(getCurrencyName(cash.currency)),
    escapeCSVField(getCurrencySymbol(cash.currency)),
    formatNumber(cash.balance, 2),
    formatCurrency(cash.valueInUSD),
    formatNumber(cash.exchangeRate, 4),
    formatNumber(cash.allocationPercent) + "%",
  ]);

  const totalValue = cashHoldings.reduce((sum, c) => sum + c.valueInUSD, 0);

  const summarySection = [
    ["PORTFOLIFT CASH HOLDINGS EXPORT"],
    [`Generated: ${new Date().toLocaleString()}`],
    [""],
    ["SUMMARY"],
    [`Total Cash Value (USD): ${formatCurrency(totalValue)}`],
    [`Number of Currencies: ${cashHoldings.length}`],
    [""],
    ["CASH HOLDINGS"],
  ];

  const csvContent = [
    ...summarySection.map((row) => row.join(",")),
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const filename = `portfolift-cash-${getDateString()}.csv`;
  downloadCSV(csvContent, filename);
}

/**
 * Export detailed portfolio with all transactions
 */
export function exportPortfolioDetailedToCSV(holdings: PortfolioHoldingWithMetrics[]): void {
  if (holdings.length === 0) return;

  const headers = [
    "Symbol",
    "Name",
    "Transaction Date",
    "Shares",
    "Price Per Share",
    "Total Cost",
    "Notes",
  ];

  const rows: string[][] = [];

  holdings.forEach((holding) => {
    holding.transactions.forEach((tx) => {
      rows.push([
        escapeCSVField(holding.symbol),
        escapeCSVField(holding.name || "-"),
        escapeCSVField(new Date(tx.purchaseDate).toLocaleDateString()),
        formatNumber(tx.shares, 4),
        formatCurrency(tx.pricePerShare),
        formatCurrency(tx.shares * tx.pricePerShare),
        escapeCSVField(tx.notes || ""),
      ]);
    });
  });

  const summarySection = [
    ["PORTFOLIFT TRANSACTION HISTORY"],
    [`Generated: ${new Date().toLocaleString()}`],
    [`Total Transactions: ${rows.length}`],
    [""],
    ["TRANSACTIONS"],
  ];

  const csvContent = [
    ...summarySection.map((row) => row.join(",")),
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const filename = `portfolift-transactions-${getDateString()}.csv`;
  downloadCSV(csvContent, filename);
}
