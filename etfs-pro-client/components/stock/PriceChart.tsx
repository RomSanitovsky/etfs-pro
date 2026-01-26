"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ChartDataPoint, TimeRange } from "@/lib/types";

interface PriceChartProps {
  data: ChartDataPoint[];
  range: TimeRange;
  loading?: boolean;
}

function formatDate(timestamp: number, range: TimeRange): string {
  const date = new Date(timestamp);

  switch (range) {
    case "1D":
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    case "1W":
      return date.toLocaleDateString("en-US", {
        weekday: "short",
      });
    case "1M":
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    case "1Y":
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
    case "5Y":
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
  }
}

function formatTooltipDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface TooltipPayload {
  value: number;
  payload: ChartDataPoint;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0];
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-white font-mono font-bold">
        ${data.value.toFixed(2)}
      </p>
      <p className="text-slate-400 text-xs">
        {formatTooltipDate(data.payload.timestamp)}
      </p>
    </div>
  );
}

export function PriceChart({ data, range, loading }: PriceChartProps) {
  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center bg-slate-900/50 rounded-lg">
        <div className="flex items-center gap-2 text-slate-400">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading chart...
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center bg-slate-900/50 rounded-lg">
        <p className="text-slate-500">No chart data available</p>
      </div>
    );
  }

  // Determine if price went up or down
  const firstPrice = data[0]?.price ?? 0;
  const lastPrice = data[data.length - 1]?.price ?? 0;
  const isPositive = lastPrice >= firstPrice;

  const strokeColor = isPositive ? "#22c55e" : "#ef4444";
  const fillColor = isPositive ? "#22c55e" : "#ef4444";

  // Calculate Y-axis domain with some padding
  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.1;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={fillColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={fillColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="timestamp"
            tickFormatter={(value) => formatDate(value, range)}
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            minTickGap={50}
          />
          <YAxis
            domain={[minPrice - padding, maxPrice + padding]}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke={strokeColor}
            strokeWidth={2}
            fill="url(#colorPrice)"
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
