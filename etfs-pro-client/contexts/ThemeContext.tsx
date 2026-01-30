"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { ThemeMode, themes, DEFAULT_THEME } from "@/lib/themes";
import { updateUserDocument } from "@/lib/firebase/firestore";

const THEME_STORAGE_KEY = "etfs-pro-theme";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  showStars: boolean;
  canChangeTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function applyTheme(theme: ThemeMode) {
  const config = themes[theme];
  const root = document.documentElement;

  // Apply CSS variables
  root.style.setProperty("--theme-background", config.colors.background);
  root.style.setProperty("--theme-background-secondary", config.colors.backgroundSecondary);
  root.style.setProperty("--theme-background-tertiary", config.colors.backgroundTertiary);
  root.style.setProperty("--theme-card-bg", config.colors.cardBg);
  root.style.setProperty("--theme-card-border", config.colors.cardBorder);
  root.style.setProperty("--theme-text-primary", config.colors.textPrimary);
  root.style.setProperty("--theme-text-secondary", config.colors.textSecondary);
  root.style.setProperty("--theme-text-muted", config.colors.textMuted);
  root.style.setProperty("--theme-accent", config.colors.accent);
  root.style.setProperty("--theme-accent-secondary", config.colors.accentSecondary);
  root.style.setProperty("--theme-gain", config.colors.gain);
  root.style.setProperty("--theme-loss", config.colors.loss);
  root.style.setProperty("--theme-gold", config.colors.gold);
  root.style.setProperty("--theme-glow-primary", config.colors.glowPrimary);
  root.style.setProperty("--theme-glow-secondary", config.colors.glowSecondary);

  // Set data attribute for theme-specific CSS
  root.setAttribute("data-theme", theme);

  // Update body classes for Tailwind
  root.classList.remove("theme-space", "theme-dark", "theme-light");
  root.classList.add(`theme-${theme}`);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [theme, setThemeState] = useState<ThemeMode>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  const isPremium = user?.isPremium ?? false;
  const canChangeTheme = isPremium;
  const resolvedRef = useRef(false);

  // Resolve theme from user profile (Firebase) or localStorage fallback
  useEffect(() => {
    setMounted(true);

    if (authLoading) return;

    // Only resolve from Firebase/localStorage once on initial load
    if (!resolvedRef.current) {
      const userTheme = user?.theme;
      const localTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      const savedTheme = userTheme ?? localTheme;
      const resolvedTheme = savedTheme && themes[savedTheme] ? savedTheme : DEFAULT_THEME;

      if (!isPremium && resolvedTheme !== "space") {
        setThemeState("space");
        applyTheme("space");
      } else {
        setThemeState(resolvedTheme);
        applyTheme(resolvedTheme);
        localStorage.setItem(THEME_STORAGE_KEY, resolvedTheme);
      }

      resolvedRef.current = true;
      return;
    }

    // After initial resolution, only enforce premium restriction
    if (!isPremium) {
      setThemeState("space");
      applyTheme("space");
    }
  }, [user, isPremium, authLoading]);

  const setTheme = useCallback(
    (newTheme: ThemeMode) => {
      // Only allow theme change for premium users
      if (!canChangeTheme && newTheme !== "space") {
        return;
      }

      setThemeState(newTheme);
      applyTheme(newTheme);
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);

      // Persist to Firebase for logged-in users
      if (user?.uid) {
        updateUserDocument(user.uid, { theme: newTheme }).catch((err) =>
          console.error("Failed to save theme preference:", err)
        );
      }
    },
    [canChangeTheme, user]
  );

  const showStars = themes[theme].showStars;

  // Prevent flash of wrong theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, showStars, canChangeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
