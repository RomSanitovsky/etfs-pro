"use client";

import Image from "next/image";

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
      <Image
        src="/logo.svg"
        width={icon}
        height={icon}
        alt="Portfolift"
        className="flex-shrink-0"
      />

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
    <Image
      src="/logo.svg"
      width={size}
      height={size}
      alt="Portfolift"
    />
  );
}
