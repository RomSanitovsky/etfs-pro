"use client";

import { useState, useRef, useEffect } from "react";

interface ExportOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface ExportButtonProps {
  /** Single export action (no dropdown) */
  onExport?: () => void;
  /** Multiple export options (shows dropdown) */
  options?: ExportOption[];
  /** Button label */
  label?: string;
  /** Disable the button */
  disabled?: boolean;
  /** Compact mode for tight spaces */
  compact?: boolean;
  /** Show as locked (premium feature) */
  locked?: boolean;
  /** Callback when locked button is clicked */
  onLockedClick?: () => void;
}

export function ExportButton({
  onExport,
  options,
  label = "Export",
  disabled = false,
  compact = false,
  locked = false,
  onLockedClick,
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = (exportFn: () => void) => {
    exportFn();
    setIsOpen(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleClick = () => {
    if (locked) {
      onLockedClick?.();
      return;
    }
    if (options && options.length > 0) {
      setIsOpen(!isOpen);
    } else if (onExport) {
      handleExport(onExport);
    }
  };

  const hasOptions = options && options.length > 0;

  // Locked state - premium feature
  if (locked) {
    return (
      <button
        onClick={handleClick}
        className={`
          group relative inline-flex items-center gap-2 font-medium
          rounded-lg border transition-all duration-300
          ${compact ? "px-3 py-2 text-sm" : "px-4 py-2.5"}
          bg-gold/5 border-gold/30 text-gold/80
          hover:bg-gold/10 hover:border-gold/50 hover:text-gold
        `}
        title="Premium feature - Upgrade to export"
      >
        {/* Lock icon */}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>

        {/* Label */}
        {!compact && <span className="hidden sm:inline">Export</span>}

        {/* Premium badge */}
        <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-gold text-black">
          Pro
        </span>
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Button */}
      <button
        onClick={handleClick}
        disabled={disabled || showSuccess}
        className={`
          group relative inline-flex items-center gap-2 font-medium
          rounded-lg border transition-all duration-300
          ${compact ? "px-3 py-2 text-sm" : "px-4 py-2.5"}
          ${
            showSuccess
              ? "bg-gain/20 border-gain/50 text-gain"
              : "bg-surface/50 border-[var(--theme-card-border)] text-muted hover:text-foreground hover:border-cosmic/50 hover:bg-cosmic/10"
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        title={label}
      >
        {/* Icon */}
        <span className={`transition-transform duration-300 ${showSuccess ? "scale-110" : "group-hover:scale-110"}`}>
          {showSuccess ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          )}
        </span>

        {/* Label */}
        {!compact && (
          <span className="hidden sm:inline">
            {showSuccess ? "Exported!" : label}
          </span>
        )}

        {/* Dropdown arrow */}
        {hasOptions && !showSuccess && (
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}

        {/* Subtle glow effect on hover */}
        <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-cosmic/5 to-nebula/5 pointer-events-none" />
      </button>

      {/* Dropdown Menu */}
      {hasOptions && isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 rounded-xl overflow-hidden z-50
                     border border-[var(--theme-card-border)]
                     shadow-2xl shadow-black/60"
          style={{ backgroundColor: '#0a0c10' }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 border-b border-[var(--theme-card-border)]"
            style={{ backgroundColor: '#161b22' }}
          >
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Export Options</p>
          </div>

          {/* Options */}
          <div style={{ backgroundColor: '#0a0c10' }}>
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleExport(option.onClick)}
                className="w-full px-4 py-3 flex items-start gap-3 text-left
                           transition-colors duration-150 group/option"
                style={{ backgroundColor: '#0a0c10' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1c2128'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0a0c10'}
              >
                {/* Icon */}
                <span
                  className="flex-shrink-0 p-2 rounded-lg border border-[var(--theme-card-border)]
                             group-hover/option:border-cosmic/30
                             transition-colors duration-150"
                  style={{ backgroundColor: '#1c2128' }}
                >
                  {option.icon}
                </span>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover/option:text-cosmic transition-colors">
                    {option.label}
                  </p>
                  <p className="text-xs text-subtle mt-0.5 leading-relaxed">
                    {option.description}
                  </p>
                </div>

                {/* Arrow */}
                <svg
                  className="w-4 h-4 text-subtle group-hover/option:text-cosmic group-hover/option:translate-x-0.5 transition-all flex-shrink-0 mt-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div
            className="px-4 py-2 border-t border-[var(--theme-card-border)]"
            style={{ backgroundColor: '#161b22' }}
          >
            <p className="text-[10px] text-subtle text-center">
              Files open in Excel, Google Sheets, or Numbers
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Pre-built icons for export options
export const ExportIcons = {
  spreadsheet: (
    <svg className="w-4 h-4 text-gain" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
  ),
  document: (
    <svg className="w-4 h-4 text-cosmic" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  list: (
    <svg className="w-4 h-4 text-nebula" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  ),
};
