"use client";

import type { AssetFilter as AssetFilterType } from "@/lib/types";

interface AssetFilterProps {
  value: AssetFilterType;
  onChange: (value: AssetFilterType) => void;
  counts: {
    all: number;
    etf: number;
    stock: number;
    crypto: number;
    materials: number;
  };
}

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  icon: React.ReactNode;
}

function FilterButton({ active, onClick, label, count, icon }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex items-center gap-2 px-4 py-2 rounded-lg
        font-medium text-sm transition-all duration-200
        ${active
          ? "bg-gradient-to-r from-nebula/20 to-cosmic/20 text-cosmic border border-cosmic/40 shadow-lg shadow-cosmic/10"
          : "bg-surface/50 text-muted border border-[var(--theme-card-border)] hover:border-subtle hover:text-foreground"
        }
      `}
    >
      {/* Active indicator glow */}
      {active && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-nebula/5 to-cosmic/5 animate-pulse" />
      )}
      
      <span className={`relative ${active ? "text-cosmic" : "text-subtle"}`}>
        {icon}
      </span>
      
      <span className="relative">{label}</span>
      
      {/* Count badge */}
      <span className={`
        relative ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono
        ${active
          ? "bg-cosmic/20 text-cosmic"
          : "bg-surface-alt/50 text-subtle"
        }
      `}>
        {count}
      </span>
    </button>
  );
}

export function AssetFilter({ value, onChange, counts }: AssetFilterProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Label */}
      <span className="text-[10px] font-mono tracking-widest text-subtle uppercase mr-2 hidden sm:block">
        Filter
      </span>
      
      {/* Filter buttons */}
      <div className="flex gap-2">
        <FilterButton
          active={value === "all"}
          onClick={() => onChange("all")}
          label="All"
          count={counts.all}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          }
        />
        
        <FilterButton
          active={value === "etf"}
          onClick={() => onChange("etf")}
          label="ETFs"
          count={counts.etf}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />
        
        <FilterButton
          active={value === "stock"}
          onClick={() => onChange("stock")}
          label="Stocks"
          count={counts.stock}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          }
        />

        <FilterButton
          active={value === "crypto"}
          onClick={() => onChange("crypto")}
          label="Crypto"
          count={counts.crypto}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <FilterButton
          active={value === "materials"}
          onClick={() => onChange("materials")}
          label="Materials"
          count={counts.materials}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
      </div>
    </div>
  );
}
