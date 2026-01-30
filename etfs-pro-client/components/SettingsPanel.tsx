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
      className="flex items-center gap-2 px-3 py-3.5 rounded-lg
                 bg-[var(--theme-background-tertiary)] border border-[var(--theme-card-border)]
                 transition-colors"
      title="Show ATH badge when stock is within this % of all-time high"
    >
      <span className="text-gold text-sm leading-none">★</span>
      <span className="text-xs text-muted font-medium whitespace-nowrap">ATH</span>
      <input
        type="number"
        value={threshold}
        onChange={(e) => onThresholdChange(Number(e.target.value))}
        min={0}
        max={10}
        step={0.5}
        className="w-8 text-center text-sm font-mono bg-transparent
                   border-b border-[var(--theme-card-border)] text-foreground outline-none
                   focus:border-[var(--theme-accent)] transition-colors
                   [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <span className="text-xs text-subtle">%</span>
    </div>
  );
}
