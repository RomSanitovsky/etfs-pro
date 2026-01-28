"use client";

import { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Sector,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import type { PortfolioHoldingWithMetrics } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";

interface PortfolioPieChartProps {
  holdings: PortfolioHoldingWithMetrics[];
}

const THRESHOLD_OPTIONS = [0, 3, 5, 10, 15, 20];
const OTHERS_COLOR = "#64748b";

const COLORS = [
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ec4899", // pink
  "#6366f1", // indigo
  "#14b8a6", // teal
  "#f97316", // orange
  "#a78bfa", // light violet
  "#22d3ee", // light cyan
  "#34d399", // light emerald
  "#fbbf24", // light amber
  "#f472b6", // light pink
  "#818cf8", // light indigo
  "#2dd4bf", // light teal
  "#fb923c", // light orange
];

interface ChartDataItem {
  symbol: string;
  name: string;
  value: number;
  allocation: number;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartDataItem }>;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;

  return (
    <div className="rounded-lg border border-[var(--theme-card-border)] bg-background/95 backdrop-blur-sm p-3 shadow-xl">
      <p className="font-semibold text-foreground text-sm">{data.symbol}</p>
      {data.name && (
        <p className="text-xs text-muted mb-1">{data.name}</p>
      )}
      <p className="text-sm text-foreground font-mono">
        {formatCurrency(data.value)}
      </p>
      <p className="text-xs text-muted">
        {data.allocation.toFixed(2)}% of portfolio
      </p>
    </div>
  );
}

function renderCustomLabel(props: PieLabelRenderProps) {
  const data = props as PieLabelRenderProps & { symbol: string; allocation: number };
  const cx = Number(data.cx);
  const cy = Number(data.cy);
  const midAngle = Number(data.midAngle);
  const innerRadius = Number(data.innerRadius);
  const outerRadius = Number(data.outerRadius);
  const { symbol, allocation } = data;

  if (allocation < 4) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-semibold"
      style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
    >
      {symbol} {allocation.toFixed(0)}%
    </text>
  );
}

export function PortfolioPieChart({ holdings }: PortfolioPieChartProps) {
  const [breakdownThreshold, setBreakdownThreshold] = useState(5);
  const holdingsDetails = useMemo(() => {
    return holdings
      .filter((h) => h.currentValue > 0)
      .sort((a, b) => b.currentValue - a.currentValue);
  }, [holdings]);

  // Split holdings into visible (above threshold) and others (below threshold)
  const { visibleHoldings, othersAggregate } = useMemo(() => {
    if (breakdownThreshold <= 0) return { visibleHoldings: holdingsDetails, othersAggregate: null };

    const visible = holdingsDetails.filter((h) => h.allocationPercent >= breakdownThreshold);
    const others = holdingsDetails.filter((h) => h.allocationPercent < breakdownThreshold);

    if (!others.length) return { visibleHoldings: visible, othersAggregate: null };

    const othersValue = others.reduce((s, h) => s + h.currentValue, 0);
    const othersAllocation = others.reduce((s, h) => s + h.allocationPercent, 0);
    const othersCost = others.reduce((s, h) => s + h.totalCost, 0);
    const othersPnLPercent = othersCost > 0 ? ((othersValue - othersCost) / othersCost) * 100 : 0;

    return {
      visibleHoldings: visible,
      othersAggregate: {
        count: others.length,
        currentValue: othersValue,
        allocationPercent: othersAllocation,
        unrealizedPnLPercent: othersPnLPercent,
      },
    };
  }, [holdingsDetails, breakdownThreshold]);

  // Build pie chart data: visible holdings + combined "Others" slice
  const { pieData, pieColors } = useMemo(() => {
    const visible = visibleHoldings.map((h, i) => ({
      symbol: h.symbol,
      name: h.name || h.symbol,
      value: h.currentValue,
      allocation: h.allocationPercent,
    }));
    const colors = visibleHoldings.map((_, i) => COLORS[i % COLORS.length]);

    if (othersAggregate) {
      visible.push({
        symbol: "Others",
        name: `${othersAggregate.count} holdings`,
        value: othersAggregate.currentValue,
        allocation: othersAggregate.allocationPercent,
      });
      colors.push(OTHERS_COLOR);
    }

    return { pieData: visible, pieColors: colors };
  }, [visibleHoldings, othersAggregate]);

  if (!pieData.length) return null;

  const totalValue = holdingsDetails.reduce((s, h) => s + h.currentValue, 0);

  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cosmic/50 to-transparent" />
        <span className="text-xs font-semibold tracking-widest bg-gradient-to-r from-cosmic via-nebula to-cosmic bg-clip-text text-transparent uppercase">
          Allocation
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cosmic/50 to-transparent" />
      </div>

      <div className="group relative rounded-xl p-6 transition-all duration-300 overflow-hidden">
        {/* Gradient border */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cosmic/50 via-nebula/30 to-cosmic/50 p-[1px]">
          <div className="absolute inset-[1px] rounded-xl bg-background/95" />
        </div>

        {/* Inner gradient overlay */}
        <div className="absolute inset-[1px] rounded-xl bg-gradient-to-br from-cosmic/10 via-transparent to-nebula/10" />

        {/* Content: chart + breakdown side by side */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6">
          {/* Pie chart */}
          <div className="w-full lg:w-1/2 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius="30%"
                  outerRadius="75%"
                  paddingAngle={0}
                  dataKey="value"
                  nameKey="symbol"
                  label={renderCustomLabel}
                  labelLine={false}
                  stroke="none"
                  activeShape={(props: React.ComponentProps<typeof Sector>) => <Sector {...props} />}
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={pieColors[index]}
                      style={{ filter: "drop-shadow(0 0 6px rgba(139,92,246,0.3))" }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Holdings breakdown */}
          <div className="w-full lg:w-1/2 space-y-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-subtle uppercase tracking-wider">
                Holdings Breakdown
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Min. allocation</span>
                <select
                  value={breakdownThreshold}
                  onChange={(e) => setBreakdownThreshold(Number(e.target.value))}
                  className="text-xs bg-surface/50 border border-[var(--theme-card-border)] rounded-md px-2 py-1 text-secondary outline-none focus:border-cosmic transition-colors cursor-pointer"
                >
                  {THRESHOLD_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t === 0 ? "Show all" : `≥ ${t}%`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {visibleHoldings.map((h, index) => {
              const pnlPositive = h.unrealizedPnLPercent >= 0;
              return (
                <div
                  key={h.symbol}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface/30 transition-colors"
                >
                  {/* Color dot */}
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />

                  {/* Symbol & name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{h.symbol}</span>
                      <span className="text-xs text-muted truncate">{h.name || h.symbol}</span>
                    </div>
                    {/* Allocation bar */}
                    <div className="mt-1 h-1 rounded-full bg-surface/50 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${h.allocationPercent}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                          opacity: 0.7,
                        }}
                      />
                    </div>
                  </div>

                  {/* Value & P&L */}
                  <div className="text-right shrink-0">
                    <div className="text-sm font-mono font-semibold text-foreground">
                      {formatCurrency(h.currentValue)}
                    </div>
                    <div
                      className={`text-xs font-mono ${
                        pnlPositive ? "text-gain" : "text-loss"
                      }`}
                    >
                      {pnlPositive ? "+" : ""}
                      {h.unrealizedPnLPercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Others row (combined below-threshold holdings) */}
            {othersAggregate && (
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface/30 transition-colors">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: OTHERS_COLOR }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">Others</span>
                    <span className="text-xs text-muted">{othersAggregate.count} holding{othersAggregate.count !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="mt-1 h-1 rounded-full bg-surface/50 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${othersAggregate.allocationPercent}%`,
                        backgroundColor: OTHERS_COLOR,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-mono font-semibold text-foreground">
                    {formatCurrency(othersAggregate.currentValue)}
                  </div>
                  <div
                    className={`text-xs font-mono ${
                      othersAggregate.unrealizedPnLPercent >= 0 ? "text-gain" : "text-loss"
                    }`}
                  >
                    {othersAggregate.unrealizedPnLPercent >= 0 ? "+" : ""}
                    {othersAggregate.unrealizedPnLPercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            )}

            {/* Total row */}
            <div className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-lg border-t border-[var(--theme-card-border)]">
              <span className="w-3 h-3 shrink-0" />
              <div className="flex-1">
                <span className="text-sm font-semibold text-muted">Total</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono font-bold text-foreground">
                  {formatCurrency(totalValue)}
                </div>
                <div className="text-xs text-muted">
                  {holdingsDetails.length} holding{holdingsDetails.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
