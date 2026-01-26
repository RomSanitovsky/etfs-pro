// Financial term definitions for tooltips
export const DEFINITIONS = {
  // Dashboard table headers
  symbol: "The unique ticker symbol used to identify a publicly traded security on an exchange.",

  price: "The current market price of the security, updated in real-time during market hours.",

  dayChange: "The percentage change in price from the previous trading day's close. Green indicates a gain, red indicates a loss.",

  allTimeHigh: "The highest price this security has ever reached. This is split-adjusted to account for stock splits.",

  percentDown: "How far the current price is below the all-time high, expressed as a percentage. Lower values mean the price is closer to its peak.",

  percentToATH: "The percentage gain needed for the current price to reach the all-time high. This shows the upside potential to return to peak levels.",

  expenseRatio: "The annual fee charged by ETFs and mutual funds, expressed as a percentage of assets. Lower expense ratios mean more of your investment stays invested.",

  dividendYield: "The annual dividend payment divided by the stock price, shown as a percentage. This represents the income return on your investment.",

  // Stock detail page stats
  marketCap: "The total market value of a company's outstanding shares. Calculated by multiplying the stock price by the number of shares outstanding.",

  peRatio: "Price-to-Earnings ratio measures how much investors pay for each dollar of earnings. A higher P/E may indicate growth expectations or overvaluation.",

  forwardPE: "P/E ratio based on estimated future earnings. Compares current price to projected earnings over the next 12 months.",

  volume: "The number of shares traded during the current session. Higher volume often indicates stronger price movements and liquidity.",

  avgVolume: "The average daily trading volume over a specified period. Helps identify if current trading activity is unusual.",

  beta: "Measures volatility relative to the market. A beta of 1 means the stock moves with the market. Above 1 is more volatile, below 1 is less volatile.",

  fiftyTwoWeekLow: "The lowest trading price over the past 52 weeks. Useful for understanding the stock's recent price range.",

  fiftyTwoWeekHigh: "The highest trading price over the past 52 weeks. Helps assess how close the stock is to recent peaks.",

  fiftyDayMA: "The average closing price over the last 50 trading days. A common short-term trend indicator used by technical analysts.",

  twoHundredDayMA: "The average closing price over the last 200 trading days. A key long-term trend indicator. Prices above suggest an uptrend.",

  dayRange: "The price range between today's low and high. Shows intraday volatility and trading activity.",

  previousClose: "The final trading price from the previous session. Used to calculate today's price change.",

  fiftyTwoWeekRange: "A visual representation of where the current price sits within its 52-week trading range.",

  athAnalysis: "Analysis comparing the current price to the all-time high, showing both how far the price has fallen and what gain is needed to recover.",

  // Market state
  marketState: "Indicates whether the market is currently open for regular trading, in pre-market, after-hours, or closed.",

  // Asset types
  etf: "Exchange-Traded Fund - A basket of securities that trades like a stock. ETFs offer diversification and typically have lower fees than mutual funds.",

  stock: "Common stock representing ownership in a company. Stockholders may receive dividends and have voting rights.",

  crypto: "Cryptocurrency - A digital asset that uses cryptography for security. Trades 24/7 on various exchanges.",
} as const;

export type DefinitionKey = keyof typeof DEFINITIONS;
