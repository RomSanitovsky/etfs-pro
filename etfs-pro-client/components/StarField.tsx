"use client";

import { memo } from "react";
import { useTheme } from "@/contexts/ThemeContext";

// Pure CSS starfield - optimized for scroll performance
// Uses static layers with radial gradients - no animations during scroll
export const StarField = memo(function StarField() {
  const { showStars } = useTheme();

  // Don't render stars for non-space themes
  if (!showStars) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      style={{
        contain: 'strict',
        willChange: 'auto',
      }}
    >
      {/* Layer 1: Small distant stars - static */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          contain: 'strict',
          background: `
            radial-gradient(1px 1px at 10% 10%, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 20% 40%, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 30% 20%, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 40% 60%, rgba(255,255,255,0.6), transparent),
            radial-gradient(1px 1px at 50% 30%, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 60% 80%, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 70% 50%, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 80% 15%, rgba(255,255,255,0.6), transparent),
            radial-gradient(1px 1px at 90% 70%, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 15% 85%, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 25% 55%, rgba(255,255,255,0.6), transparent),
            radial-gradient(1px 1px at 35% 75%, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 45% 25%, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 55% 95%, rgba(255,255,255,0.6), transparent),
            radial-gradient(1px 1px at 65% 35%, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 75% 65%, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 85% 45%, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 95% 5%, rgba(255,255,255,0.6), transparent),
            radial-gradient(1px 1px at 5% 50%, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 12% 72%, rgba(255,255,255,0.8), transparent)
          `,
        }}
      />
      {/* Layer 2: Medium stars - static (removed animation) */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          contain: 'strict',
          background: `
            radial-gradient(1.5px 1.5px at 5% 15%, rgba(255,255,255,0.9), transparent),
            radial-gradient(1.5px 1.5px at 22% 62%, rgba(255,255,255,0.8), transparent),
            radial-gradient(1.5px 1.5px at 38% 8%, rgba(255,255,255,0.9), transparent),
            radial-gradient(1.5px 1.5px at 52% 88%, rgba(255,255,255,0.8), transparent),
            radial-gradient(1.5px 1.5px at 68% 32%, rgba(255,255,255,0.9), transparent),
            radial-gradient(1.5px 1.5px at 82% 78%, rgba(255,255,255,0.8), transparent),
            radial-gradient(1.5px 1.5px at 92% 48%, rgba(255,255,255,0.9), transparent),
            radial-gradient(1.5px 1.5px at 18% 38%, rgba(255,255,255,0.8), transparent),
            radial-gradient(1.5px 1.5px at 72% 12%, rgba(255,255,255,0.9), transparent),
            radial-gradient(1.5px 1.5px at 48% 58%, rgba(255,255,255,0.8), transparent)
          `,
        }}
      />
      {/* Layer 3: Bright accent stars - static */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          contain: 'strict',
          background: `
            radial-gradient(2px 2px at 8% 28%, rgba(147, 197, 253, 0.9), transparent),
            radial-gradient(2px 2px at 42% 72%, rgba(196, 181, 253, 0.9), transparent),
            radial-gradient(2px 2px at 78% 18%, rgba(147, 197, 253, 0.9), transparent),
            radial-gradient(2px 2px at 28% 92%, rgba(196, 181, 253, 0.9), transparent),
            radial-gradient(2px 2px at 88% 52%, rgba(147, 197, 253, 0.9), transparent)
          `,
        }}
      />
    </div>
  );
});
