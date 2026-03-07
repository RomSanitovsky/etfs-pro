"use client";

import { memo, useMemo } from "react";
import { useTheme } from "@/contexts/ThemeContext";

// Generate random star positions for dense starfield
function generateStars(count: number, seed: number = 1): string {
  const stars: string[] = [];
  // Simple seeded random for consistent positions
  const random = (i: number) => {
    const x = Math.sin(seed * 9999 + i * 7919) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < count; i++) {
    const x = random(i) * 100;
    const y = random(i + 1000) * 100;
    const opacity = 0.5 + random(i + 2000) * 0.5; // Brighter: 0.5-1.0 instead of 0.3-1.0
    const size = 0.5 + random(i + 3000) * 0.5;
    stars.push(`radial-gradient(${size}px ${size}px at ${x.toFixed(2)}% ${y.toFixed(2)}%, rgba(255,255,255,${opacity.toFixed(2)}), transparent)`);
  }
  return stars.join(',\n');
}

// Pure CSS starfield - optimized for scroll performance
// Uses static layers with radial gradients - no animations during scroll
export const StarField = memo(function StarField() {
  const { showStars } = useTheme();

  // Generate dense starfield layers (memoized)
  const distantStars = useMemo(() => generateStars(300, 1), []);
  const midStars = useMemo(() => generateStars(150, 2), []);
  const nearStars = useMemo(() => generateStars(80, 3), []);

  // Don't render stars for non-space themes
  if (!showStars) {
    return null;
  }

  return (
    <>
      {/* CSS for twinkling animation */}
      <style jsx global>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes twinkle-slow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes twinkle-fast {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes subtle-drift {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes nebula-pulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.25; }
        }
      `}</style>

      <div
        className="fixed inset-0 overflow-hidden pointer-events-none z-0"
        style={{
          contain: 'strict',
          willChange: 'auto',
        }}
      >
        {/* Subtle nebula glow in corners */}
        <div
          className="absolute inset-0"
          style={{
            contain: 'strict',
            background: `
              radial-gradient(ellipse 80% 50% at 0% 0%, rgba(99, 102, 241, 0.08), transparent 50%),
              radial-gradient(ellipse 60% 40% at 100% 100%, rgba(139, 92, 246, 0.06), transparent 50%),
              radial-gradient(ellipse 50% 30% at 80% 20%, rgba(59, 130, 246, 0.04), transparent 40%)
            `,
            animation: 'nebula-pulse 15s ease-in-out infinite',
          }}
        />

        {/* Layer 0: Super tiny distant stars - dense field */}
        <div
          className="absolute inset-0"
          style={{
            contain: 'strict',
            opacity: 0.85,
            background: distantStars,
          }}
        />

        {/* Layer 1: Small distant stars - static */}
        <div
          className="absolute inset-0"
          style={{
            contain: 'strict',
            opacity: 0.75,
            background: midStars,
          }}
        />

        {/* Layer 2: Medium stars with subtle twinkle */}
        <div
          className="absolute inset-0"
          style={{
            contain: 'strict',
            opacity: 0.9,
            background: nearStars,
            animation: 'twinkle-slow 8s ease-in-out infinite',
          }}
        />

        {/* Layer 3: Bright twinkling stars */}
        <div
          className="absolute inset-0"
          style={{
            contain: 'strict',
            background: `
              radial-gradient(1.5px 1.5px at 5% 15%, rgba(255,255,255,0.95), transparent),
              radial-gradient(1.5px 1.5px at 22% 62%, rgba(255,255,255,0.9), transparent),
              radial-gradient(1.5px 1.5px at 38% 8%, rgba(255,255,255,0.95), transparent),
              radial-gradient(1.5px 1.5px at 52% 88%, rgba(255,255,255,0.9), transparent),
              radial-gradient(1.5px 1.5px at 68% 32%, rgba(255,255,255,0.95), transparent),
              radial-gradient(1.5px 1.5px at 82% 78%, rgba(255,255,255,0.9), transparent),
              radial-gradient(1.5px 1.5px at 92% 48%, rgba(255,255,255,0.95), transparent),
              radial-gradient(1.5px 1.5px at 18% 38%, rgba(255,255,255,0.9), transparent),
              radial-gradient(1.5px 1.5px at 72% 12%, rgba(255,255,255,0.95), transparent),
              radial-gradient(1.5px 1.5px at 48% 58%, rgba(255,255,255,0.9), transparent),
              radial-gradient(1.5px 1.5px at 33% 44%, rgba(255,255,255,0.85), transparent),
              radial-gradient(1.5px 1.5px at 87% 22%, rgba(255,255,255,0.9), transparent),
              radial-gradient(1.5px 1.5px at 14% 76%, rgba(255,255,255,0.85), transparent),
              radial-gradient(1.5px 1.5px at 61% 4%, rgba(255,255,255,0.9), transparent),
              radial-gradient(1.5px 1.5px at 95% 66%, rgba(255,255,255,0.85), transparent)
            `,
            animation: 'twinkle 4s ease-in-out infinite',
          }}
        />

        {/* Layer 4: Colored accent stars (blue/purple tints) */}
        <div
          className="absolute inset-0"
          style={{
            contain: 'strict',
            background: `
              radial-gradient(2px 2px at 8% 28%, rgba(147, 197, 253, 0.95), transparent),
              radial-gradient(2px 2px at 42% 72%, rgba(196, 181, 253, 0.95), transparent),
              radial-gradient(2px 2px at 78% 18%, rgba(147, 197, 253, 0.95), transparent),
              radial-gradient(2px 2px at 28% 92%, rgba(196, 181, 253, 0.95), transparent),
              radial-gradient(2px 2px at 88% 52%, rgba(147, 197, 253, 0.95), transparent),
              radial-gradient(2px 2px at 15% 5%, rgba(253, 224, 147, 0.8), transparent),
              radial-gradient(2px 2px at 55% 35%, rgba(196, 181, 253, 0.9), transparent),
              radial-gradient(2px 2px at 95% 85%, rgba(147, 197, 253, 0.85), transparent),
              radial-gradient(1.5px 1.5px at 3% 65%, rgba(253, 186, 147, 0.7), transparent),
              radial-gradient(1.5px 1.5px at 75% 95%, rgba(147, 253, 220, 0.6), transparent)
            `,
            animation: 'twinkle-fast 3s ease-in-out infinite',
          }}
        />

        {/* Layer 5: Bright star with glow effect */}
        <div
          className="absolute inset-0"
          style={{
            contain: 'strict',
            background: `
              radial-gradient(4px 4px at 25% 15%, rgba(255,255,255,1), rgba(147, 197, 253, 0.5) 2px, transparent 4px),
              radial-gradient(3px 3px at 75% 45%, rgba(255,255,255,1), rgba(196, 181, 253, 0.5) 2px, transparent 3px),
              radial-gradient(3px 3px at 45% 85%, rgba(255,255,255,1), rgba(147, 197, 253, 0.5) 2px, transparent 3px),
              radial-gradient(2.5px 2.5px at 90% 10%, rgba(255,255,255,0.95), rgba(253, 224, 147, 0.4) 2px, transparent 3px),
              radial-gradient(2.5px 2.5px at 10% 90%, rgba(255,255,255,0.95), rgba(196, 181, 253, 0.4) 2px, transparent 3px)
            `,
            animation: 'twinkle-slow 6s ease-in-out infinite',
          }}
        />

        {/* Shooting star trail (subtle) */}
        <div
          className="absolute"
          style={{
            top: '20%',
            left: '60%',
            width: '80px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), rgba(255,255,255,0.1))',
            transform: 'rotate(-35deg)',
            opacity: 0.4,
            animation: 'subtle-drift 20s ease-in-out infinite',
          }}
        />
      </div>
    </>
  );
});
