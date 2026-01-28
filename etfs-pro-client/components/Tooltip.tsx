"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";

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

  const tooltipWidth = 280;
  let left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
  const top = triggerRect.top - 8;

  // Keep tooltip within viewport
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
        maxWidth: tooltipWidth,
      }}
    >
      <div className="px-3 py-2 text-sm text-foreground bg-surface/95 backdrop-blur-sm border border-[var(--theme-card-border)] rounded-lg shadow-xl">
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

interface TooltipProps {
  content: string;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    if (buttonRef.current) {
      setTriggerRect(buttonRef.current.getBoundingClientRect());
    }
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {/* Info icon */}
      <button
        ref={buttonRef}
        className="ml-1 text-subtle hover:text-foreground transition-colors focus:outline-none"
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        aria-label="More information"
      >
        <svg
          className="w-3.5 h-3.5"
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

      {isVisible && <TooltipPortal content={content} triggerRect={triggerRect} />}
    </div>
  );
}

// Simpler inline tooltip for standalone use
interface InfoTooltipProps {
  content: string;
}

export function InfoTooltip({ content }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    if (buttonRef.current) {
      setTriggerRect(buttonRef.current.getBoundingClientRect());
    }
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        ref={buttonRef}
        className="text-subtle hover:text-foreground transition-colors focus:outline-none"
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        aria-label="More information"
      >
        <svg
          className="w-3.5 h-3.5"
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

      {isVisible && <TooltipPortal content={content} triggerRect={triggerRect} />}
    </span>
  );
}
