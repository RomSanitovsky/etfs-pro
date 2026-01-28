"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeMode, themes } from "@/lib/themes";

// Icons for each theme
function SpaceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

const themeIcons: Record<ThemeMode, React.FC<{ className?: string }>> = {
  space: SpaceIcon,
  dark: MoonIcon,
  light: SunIcon,
};

interface ThemeSwitcherProps {
  compact?: boolean;
}

export function ThemeSwitcher({ compact = false }: ThemeSwitcherProps) {
  const { theme, setTheme, canChangeTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const CurrentIcon = themeIcons[theme];
  const themeList: ThemeMode[] = ["space", "dark", "light"];

  if (compact) {
    // Compact version - just cycles through themes
    return (
      <button
        onClick={() => {
          if (!canChangeTheme) return;
          const currentIndex = themeList.indexOf(theme);
          const nextIndex = (currentIndex + 1) % themeList.length;
          setTheme(themeList[nextIndex]);
        }}
        disabled={!canChangeTheme}
        className={`p-2 rounded-lg transition-all duration-200 ${
          canChangeTheme
            ? "hover:bg-[var(--theme-glow-primary)] text-[var(--theme-text-secondary)] hover:text-[var(--theme-accent)]"
            : "opacity-50 cursor-not-allowed text-[var(--theme-text-muted)]"
        }`}
        title={canChangeTheme ? `Current: ${themes[theme].name}` : "Premium feature"}
      >
        <CurrentIcon className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
          canChangeTheme
            ? "hover:bg-[var(--theme-glow-primary)] border border-transparent hover:border-[var(--theme-card-border)]"
            : "opacity-60"
        }`}
        title={canChangeTheme ? "Change theme" : "Premium feature"}
      >
        <CurrentIcon className="w-5 h-5 text-[var(--theme-accent)]" />
        <span className="text-sm text-[var(--theme-text-secondary)]">{themes[theme].name}</span>
        {!canChangeTheme && <LockIcon className="w-3.5 h-3.5 text-[var(--theme-gold)]" />}
        <svg
          className={`w-4 h-4 text-[var(--theme-text-muted)] transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] backdrop-blur-md shadow-2xl overflow-hidden z-50">
          <div className="p-2">
            <p className="px-3 py-2 text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">
              Theme
              {!canChangeTheme && (
                <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded bg-[var(--theme-gold)]/20 text-[var(--theme-gold)]">
                  Premium
                </span>
              )}
            </p>
            {themeList.map((t) => {
              const Icon = themeIcons[t];
              const config = themes[t];
              const isActive = theme === t;
              const isLocked = !canChangeTheme && t !== "space";

              return (
                <button
                  key={t}
                  onClick={() => {
                    if (!isLocked) {
                      setTheme(t);
                      setIsOpen(false);
                    }
                  }}
                  disabled={isLocked}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-[var(--theme-accent)]/10 border border-[var(--theme-accent)]/30"
                      : isLocked
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-[var(--theme-glow-primary)] border border-transparent"
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg ${
                      isActive
                        ? "bg-[var(--theme-accent)]/20"
                        : "bg-[var(--theme-background-tertiary)]"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-[var(--theme-accent)]" : "text-[var(--theme-text-secondary)]"
                      }`}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <p
                      className={`text-sm font-medium ${
                        isActive ? "text-[var(--theme-accent)]" : "text-[var(--theme-text-primary)]"
                      }`}
                    >
                      {config.name}
                    </p>
                    <p className="text-xs text-[var(--theme-text-muted)]">{config.description}</p>
                  </div>
                  {isLocked && <LockIcon className="w-4 h-4 text-[var(--theme-gold)]" />}
                  {isActive && (
                    <svg
                      className="w-4 h-4 text-[var(--theme-accent)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
