import { memo } from "react";

// Pure CSS starfield - no JS, no state, maximum performance
// Uses CSS layers with radial gradients for stars
export const StarField = memo(function StarField() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Layer 1: Small distant stars */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: `
            radial-gradient(1px 1px at 10% 10%, white, transparent),
            radial-gradient(1px 1px at 20% 40%, white, transparent),
            radial-gradient(1px 1px at 30% 20%, white, transparent),
            radial-gradient(1px 1px at 40% 60%, white, transparent),
            radial-gradient(1px 1px at 50% 30%, white, transparent),
            radial-gradient(1px 1px at 60% 80%, white, transparent),
            radial-gradient(1px 1px at 70% 50%, white, transparent),
            radial-gradient(1px 1px at 80% 15%, white, transparent),
            radial-gradient(1px 1px at 90% 70%, white, transparent),
            radial-gradient(1px 1px at 15% 85%, white, transparent),
            radial-gradient(1px 1px at 25% 55%, white, transparent),
            radial-gradient(1px 1px at 35% 75%, white, transparent),
            radial-gradient(1px 1px at 45% 25%, white, transparent),
            radial-gradient(1px 1px at 55% 95%, white, transparent),
            radial-gradient(1px 1px at 65% 35%, white, transparent),
            radial-gradient(1px 1px at 75% 65%, white, transparent),
            radial-gradient(1px 1px at 85% 45%, white, transparent),
            radial-gradient(1px 1px at 95% 5%, white, transparent),
            radial-gradient(1px 1px at 5% 50%, white, transparent),
            radial-gradient(1px 1px at 12% 72%, white, transparent)
          `,
        }}
      />
      {/* Layer 2: Medium stars with twinkle animation */}
      <div
        className="absolute inset-0 opacity-50 animate-pulse"
        style={{
          animationDuration: '4s',
          background: `
            radial-gradient(1.5px 1.5px at 5% 15%, rgba(255,255,255,0.8), transparent),
            radial-gradient(1.5px 1.5px at 22% 62%, rgba(255,255,255,0.8), transparent),
            radial-gradient(1.5px 1.5px at 38% 8%, rgba(255,255,255,0.8), transparent),
            radial-gradient(1.5px 1.5px at 52% 88%, rgba(255,255,255,0.8), transparent),
            radial-gradient(1.5px 1.5px at 68% 32%, rgba(255,255,255,0.8), transparent),
            radial-gradient(1.5px 1.5px at 82% 78%, rgba(255,255,255,0.8), transparent),
            radial-gradient(1.5px 1.5px at 92% 48%, rgba(255,255,255,0.8), transparent),
            radial-gradient(1.5px 1.5px at 18% 38%, rgba(255,255,255,0.8), transparent),
            radial-gradient(1.5px 1.5px at 72% 12%, rgba(255,255,255,0.8), transparent),
            radial-gradient(1.5px 1.5px at 48% 58%, rgba(255,255,255,0.8), transparent)
          `,
        }}
      />
      {/* Layer 3: Bright accent stars */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          animationDuration: '3s',
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
