"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { PremiumBadge } from "@/components/premium/PremiumBadge";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

// Spaceman Avatar SVG Component
function SpacemanAvatar({ size = 36 }: { size?: number }) {
  return (
    <div
      className="rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border-2 border-cyan-500/30"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: size * 0.75, height: size * 0.75 }}
      >
        {/* Helmet */}
        <circle cx="32" cy="28" r="18" fill="url(#helmet-gradient)" stroke="#06b6d4" strokeWidth="2"/>
        {/* Visor */}
        <ellipse cx="32" cy="30" rx="12" ry="10" fill="url(#visor-gradient)"/>
        {/* Visor reflection */}
        <ellipse cx="28" cy="27" rx="4" ry="3" fill="rgba(255,255,255,0.3)"/>
        {/* Body/Suit */}
        <path d="M20 46 C20 40, 24 38, 32 38 C40 38, 44 40, 44 46 L44 52 C44 54, 42 56, 40 56 L24 56 C22 56, 20 54, 20 52 Z" fill="url(#suit-gradient)" stroke="#7c3aed" strokeWidth="1.5"/>
        {/* Suit details */}
        <circle cx="32" cy="45" r="3" fill="#06b6d4"/>
        <rect x="29" y="50" width="6" height="4" rx="1" fill="#06b6d4"/>
        {/* Antenna */}
        <line x1="32" y1="10" x2="32" y2="6" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="32" cy="5" r="2" fill="#fbbf24"/>
        {/* Stars around */}
        <circle cx="10" cy="15" r="1" fill="#fbbf24"/>
        <circle cx="54" cy="20" r="1" fill="#fbbf24"/>
        <circle cx="8" cy="45" r="0.8" fill="#06b6d4"/>
        <circle cx="56" cy="42" r="0.8" fill="#06b6d4"/>
        {/* Gradients */}
        <defs>
          <linearGradient id="helmet-gradient" x1="14" y1="10" x2="50" y2="46">
            <stop offset="0%" stopColor="#1e293b"/>
            <stop offset="100%" stopColor="#0f172a"/>
          </linearGradient>
          <linearGradient id="visor-gradient" x1="20" y1="20" x2="44" y2="40">
            <stop offset="0%" stopColor="#7c3aed"/>
            <stop offset="50%" stopColor="#06b6d4"/>
            <stop offset="100%" stopColor="#7c3aed"/>
          </linearGradient>
          <linearGradient id="suit-gradient" x1="20" y1="38" x2="44" y2="56">
            <stop offset="0%" stopColor="#1e293b"/>
            <stop offset="100%" stopColor="#0f172a"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export function Header() {
  const { user, loading, signOut } = useAuth();
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

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  return (
    <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
      {loading ? (
        <div className="w-10 h-10 rounded-full bg-slate-700/50 animate-pulse" />
      ) : !user ? (
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold
                     bg-gradient-to-r from-cyan-500/20 to-purple-500/20
                     text-cyan-400 hover:text-white
                     border border-cyan-400/40 hover:border-cyan-400
                     rounded-full backdrop-blur-sm
                     transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Sign In
        </Link>
      ) : (
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-full
                       bg-slate-800/80 backdrop-blur-sm border border-slate-700/50
                       hover:border-cyan-400/50 transition-all duration-300
                       hover:shadow-lg hover:shadow-cyan-500/10"
          >
            <SpacemanAvatar size={40} />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-white truncate max-w-[140px]">
                {user.displayName || "Space Explorer"}
              </p>
              <p className="text-xs text-slate-400">
                {user.isPremium ? "Premium" : "Free Plan"}
              </p>
            </div>
            {user.isPremium && <PremiumBadge size="sm" />}
            <svg
              className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <div
              className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-700/50
                          bg-slate-900/95 backdrop-blur-md shadow-2xl overflow-hidden"
            >
              {/* User info header */}
              <div className="px-5 py-5 bg-gradient-to-r from-purple-900/40 to-cyan-900/40 border-b border-slate-700/50">
                <div className="flex items-center gap-4">
                  <SpacemanAvatar size={56} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white truncate text-lg">
                        {user.displayName || "Space Explorer"}
                      </p>
                      {user.isPremium && <PremiumBadge size="sm" />}
                    </div>
                    <p className="text-sm text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Subscription status - clickable link to subscription page */}
              <Link
                href="/subscription"
                onClick={() => setIsOpen(false)}
                className="block px-5 py-4 border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Current Plan</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        user.isPremium
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-slate-700/50 text-slate-300 border border-slate-600"
                      }`}
                    >
                      {user.isPremium ? "Premium" : "Free"}
                    </span>
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>

              {/* Portfolio Link */}
              <div className="px-3 pt-3">
                <Link
                  href={user.isPremium ? "/portfolio" : "/subscription"}
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl
                             text-sm text-slate-300 hover:text-white
                             hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50
                             transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Portfolio
                  </div>
                  {!user.isPremium && (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Premium
                    </span>
                  )}
                </Link>
              </div>

              {/* Theme Switcher */}
              <div className="px-3 pt-1 border-t border-slate-700/50 mt-2">
                <div className="px-1 py-2">
                  <ThemeSwitcher />
                </div>
              </div>

              {/* Actions */}
              <div className="p-3">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                             text-sm text-slate-300 hover:text-white
                             hover:bg-red-500/10 hover:border-red-500/30 border border-transparent
                             transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
