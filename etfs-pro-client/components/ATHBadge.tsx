"use client";

export function ATHBadge({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <span className="ath-badge inline-flex items-center gap-0.5 px-1.5 rounded-full bg-gold/15 text-gold text-[10px] font-semibold border border-gold/30">
        <span className="text-[10px] leading-none">★</span>
        ATH
      </span>
    );
  }

  return (
    <span className="ath-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/20 text-gold text-xs font-semibold">
      <span className="text-sm">★</span>
      ATH
    </span>
  );
}
