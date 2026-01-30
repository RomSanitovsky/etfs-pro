"use client";

interface SettingsPanelProps {
  threshold: number;
  onThresholdChange: (threshold: number) => void;
}

export function SettingsPanel({
  threshold,
  onThresholdChange,
}: SettingsPanelProps) {
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                 bg-gold/8 border border-gold/20"
      title="Show ATH badge when stock is within this % of all-time high"
    >
      <span className="text-gold text-xs leading-none">★</span>
      <span className="text-[11px] text-muted font-medium tracking-wide">ATH</span>
      <input
        type="number"
        value={threshold}
        onChange={(e) => onThresholdChange(Number(e.target.value))}
        min={0}
        max={10}
        step={0.5}
        className="w-10 text-center text-xs font-mono bg-transparent
                   border-b border-gold/30 text-gold outline-none
                   focus:border-gold/60 transition-colors
                   [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <span className="text-[11px] text-gold/50">%</span>
    </div>
  );
}
