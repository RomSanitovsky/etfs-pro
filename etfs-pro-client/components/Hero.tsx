"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";

export function Hero() {
  const { user, loading } = useAuth();
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 hero-grid opacity-20 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-6 hero-fade-in">
          <Logo size="xl" />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-nebula/10 border border-nebula/30 mb-8 hero-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gain opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gain"></span>
          </span>
          <span className="text-sm font-medium text-cosmic tracking-wide">
            Live Market Data • Real-Time Updates
          </span>
        </div>

        {/* Main headline */}
        <h1 className="hero-fade-in hero-fade-in-delay-1">
          <span className="block text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-4">
            <span className="hero-title">Lift Your Portfolio</span>
          </span>
          <span className="block text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-4">
            <span className="hero-title-accent">To New Heights</span>
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-8 text-lg md:text-xl lg:text-2xl text-muted max-w-2xl mx-auto leading-relaxed hero-fade-in hero-fade-in-delay-2">
          Track your investments against{" "}
          <span className="text-gold font-semibold">all-time highs</span>,
          spot opportunities in real-time, and make{" "}
          <span className="text-cosmic font-semibold">smarter decisions</span> with precision analytics.
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-12 hero-fade-in hero-fade-in-delay-3">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-foreground hero-counter">10K+</div>
            <div className="text-sm text-subtle mt-1">Assets Tracked</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-foreground hero-counter">50ms</div>
            <div className="text-sm text-subtle mt-1">Update Latency</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-foreground hero-counter">99.9%</div>
            <div className="text-sm text-subtle mt-1">Uptime</div>
          </div>
        </div>

        {/* CTA button */}
        <div className="mt-12 hero-fade-in hero-fade-in-delay-4">
          <Link
            href="/dashboard"
            className="group relative inline-block px-10 py-5 bg-gradient-to-r from-nebula to-cosmic rounded-xl font-semibold text-white text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_var(--theme-glow-primary)]"
          >
            <span className="relative z-10">
              {loading ? "Loading..." : user ? "View My Dashboard" : "Start Tracking Free"}
            </span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cosmic to-nebula opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
