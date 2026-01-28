"use client";

interface PremiumBadgeProps {
  size?: "sm" | "md";
}

export function PremiumBadge({ size = "sm" }: PremiumBadgeProps) {
  const sizeClasses = size === "sm"
    ? "px-1.5 py-0.5 text-[10px]"
    : "px-2 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center font-bold tracking-wide rounded
                  bg-gradient-to-r from-gold to-gold/80
                  text-background uppercase ${sizeClasses}`}
    >
      PRO
    </span>
  );
}
