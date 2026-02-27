"use client";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { icon: 24, text: "text-lg" },
  md: { icon: 32, text: "text-xl" },
  lg: { icon: 40, text: "text-2xl" },
  xl: { icon: 56, text: "text-4xl" },
};

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const { icon, text } = sizeMap[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon - Upward arrow with chart bars representing "lift" */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Background circle with gradient */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--theme-accent)" />
            <stop offset="100%" stopColor="var(--theme-accent-secondary)" />
          </linearGradient>
          <linearGradient id="arrowGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f0f0f0" />
          </linearGradient>
        </defs>

        {/* Main circle background */}
        <circle cx="24" cy="24" r="22" fill="url(#logoGradient)" />

        {/* Chart bars representing portfolio growth */}
        <rect x="11" y="28" width="5" height="8" rx="1" fill="rgba(255,255,255,0.4)" />
        <rect x="18" y="24" width="5" height="12" rx="1" fill="rgba(255,255,255,0.6)" />
        <rect x="25" y="19" width="5" height="17" rx="1" fill="rgba(255,255,255,0.8)" />

        {/* Upward arrow - the "lift" */}
        <path
          d="M32 26 L36 14 L40 14 L36 26 L38 26 L34 32 L30 26 Z"
          fill="url(#arrowGradient)"
          transform="translate(-2, 0)"
        />
      </svg>

      {/* Text */}
      {showText && (
        <span className={`font-bold tracking-tight ${text}`}>
          <span className="text-foreground">Portfo</span>
          <span className="bg-gradient-to-r from-nebula to-cosmic bg-clip-text text-transparent">lift</span>
        </span>
      )}
    </div>
  );
}

// Simplified icon-only version for favicon/small spaces
export function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoIconGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22" fill="url(#logoIconGradient)" />
      <rect x="11" y="28" width="5" height="8" rx="1" fill="rgba(255,255,255,0.4)" />
      <rect x="18" y="24" width="5" height="12" rx="1" fill="rgba(255,255,255,0.6)" />
      <rect x="25" y="19" width="5" height="17" rx="1" fill="rgba(255,255,255,0.8)" />
      <path
        d="M32 26 L36 14 L40 14 L36 26 L38 26 L34 32 L30 26 Z"
        fill="white"
        transform="translate(-2, 0)"
      />
    </svg>
  );
}
