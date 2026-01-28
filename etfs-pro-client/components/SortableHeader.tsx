"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { SortField, SortDirection } from "@/lib/types";

interface SortableHeaderProps {
  field: SortField;
  label: string;
  currentSort: { field: SortField; direction: SortDirection };
  onSort: (field: SortField) => void;
  align?: "left" | "right";
  tooltip?: string;
}

interface TooltipPortalProps {
  content: string;
  triggerRect: DOMRect | null;
}

function TooltipPortal({ content, triggerRect }: TooltipPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !triggerRect) return null;

  const tooltipWidth = 256;
  let left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
  const top = triggerRect.top - 8;

  if (left < 8) left = 8;
  if (left + tooltipWidth > window.innerWidth - 8) {
    left = window.innerWidth - tooltipWidth - 8;
  }

  return createPortal(
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        transform: "translateY(-100%)",
      }}
    >
      <div className="px-3 py-2 text-sm font-normal text-foreground bg-surface/95 backdrop-blur-sm border border-[var(--theme-card-border)] rounded-lg shadow-xl text-left w-64">
        <p className="leading-relaxed">{content}</p>
      </div>
      <div
        className="absolute w-0 h-0 border-[6px] border-t-[var(--theme-card-border)] border-x-transparent border-b-transparent"
        style={{
          left: `${triggerRect.left + triggerRect.width / 2 - left - 6}px`,
          top: "100%",
        }}
      />
    </div>,
    document.body
  );
}

export function SortableHeader({
  field,
  label,
  currentSort,
  onSort,
  align = "left",
  tooltip,
}: SortableHeaderProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isActive = currentSort.field === field;

  const handleMouseEnter = () => {
    if (buttonRef.current) {
      setTriggerRect(buttonRef.current.getBoundingClientRect());
    }
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <th
      className={`sort-header px-4 py-3 font-semibold text-sm relative ${
        align === "right" ? "text-right" : "text-left"
      } ${isActive ? "text-cosmic" : "text-muted"}`}
      onClick={() => onSort(field)}
    >
      {/* Main label and sort indicator */}
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive && (
          <span className="text-xs">
            {currentSort.direction === "asc" ? "▲" : "▼"}
          </span>
        )}
      </span>

      {/* Info icon - absolutely positioned top-right */}
      {tooltip && (
        <span
          className="absolute top-1 right-1"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            ref={buttonRef}
            className="p-0.5 text-subtle hover:text-muted transition-colors focus:outline-none"
            onFocus={handleMouseEnter}
            onBlur={handleMouseLeave}
            aria-label={`Info about ${label}`}
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          {showTooltip && (
            <TooltipPortal content={tooltip} triggerRect={triggerRect} />
          )}
        </span>
      )}
    </th>
  );
}
