export type ThemeMode = "space" | "dark" | "light";

export interface ThemeConfig {
  name: string;
  icon: string;
  description: string;
  colors: {
    // Backgrounds
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;
    // Card/Glass
    cardBg: string;
    cardBorder: string;
    // Text
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    // Accents
    accent: string;
    accentSecondary: string;
    // Status
    gain: string;
    loss: string;
    gold: string;
    // Effects
    glowPrimary: string;
    glowSecondary: string;
  };
  showStars: boolean;
}

export const themes: Record<ThemeMode, ThemeConfig> = {
  space: {
    name: "Space",
    icon: "stars",
    description: "Cosmic dark theme with animated stars",
    colors: {
      background: "#0a0b0f",
      backgroundSecondary: "#12141c",
      backgroundTertiary: "#0d0e14",
      cardBg: "rgba(18, 20, 28, 0.9)",
      cardBorder: "rgba(124, 58, 237, 0.2)",
      textPrimary: "#e2e8f0",
      textSecondary: "#94a3b8",
      textMuted: "#64748b",
      accent: "#7c3aed",
      accentSecondary: "#06b6d4",
      gain: "#22c55e",
      loss: "#ef4444",
      gold: "#fbbf24",
      glowPrimary: "rgba(124, 58, 237, 0.4)",
      glowSecondary: "rgba(6, 182, 212, 0.4)",
    },
    showStars: true,
  },
  dark: {
    name: "Dark",
    icon: "moon",
    description: "True black theme",
    colors: {
      background: "#000000",
      backgroundSecondary: "#0a0a0a",
      backgroundTertiary: "#0d0d0d",
      cardBg: "rgba(8, 8, 8, 0.95)",
      cardBorder: "rgba(38, 38, 38, 0.6)",
      textPrimary: "#fafafa",
      textSecondary: "#a1a1aa",
      textMuted: "#71717a",
      accent: "#3b82f6",
      accentSecondary: "#8b5cf6",
      gain: "#10b981",
      loss: "#f43f5e",
      gold: "#f59e0b",
      glowPrimary: "rgba(59, 130, 246, 0.25)",
      glowSecondary: "rgba(139, 92, 246, 0.25)",
    },
    showStars: false,
  },
  light: {
    name: "Light",
    icon: "sun",
    description: "Clean professional light theme",
    colors: {
      background: "#ffffff",
      backgroundSecondary: "#f8fafc",
      backgroundTertiary: "#f1f5f9",
      cardBg: "rgba(255, 255, 255, 0.95)",
      cardBorder: "rgba(226, 232, 240, 1)",
      textPrimary: "#0f172a",
      textSecondary: "#475569",
      textMuted: "#94a3b8",
      accent: "#2563eb",
      accentSecondary: "#7c3aed",
      gain: "#059669",
      loss: "#dc2626",
      gold: "#d97706",
      glowPrimary: "rgba(37, 99, 235, 0.2)",
      glowSecondary: "rgba(124, 58, 237, 0.2)",
    },
    showStars: false,
  },
};

export const DEFAULT_THEME: ThemeMode = "space";
