"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import type { PortfolioHoldingWithMetrics } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";

interface PortfolioPieChartProps {
  holdings: PortfolioHoldingWithMetrics[];
}

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

function CustomLegend({
  payload,
}: {
  payload?: Array<{ value: string; color: string }>;
}) {
  if (!payload?.length) return null;

  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-4">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-muted">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function PortfolioPieChart({ holdings }: PortfolioPieChartProps) {
  const chartData = useMemo(() => {
    if (!holdings.length) return [];
    return holdings
      .filter((h) => h.currentValue > 0)
      .sort((a, b) => b.currentValue - a.currentValue)
      .map((h) => ({
        symbol: h.symbol,
        name: h.name || h.symbol,
        value: h.currentValue,
        allocation: h.allocationPercent,
      }));
  }, [holdings]);

  if (!chartData.length) return null;

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

        {/* Chart */}
        <div className="relative z-10 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="30%"
                outerRadius="75%"
                paddingAngle={2}
                dataKey="value"
                nameKey="symbol"
                label={renderCustomLabel}
                labelLine={false}
                stroke="none"
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    style={{ filter: "drop-shadow(0 0 6px rgba(139,92,246,0.3))" }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
