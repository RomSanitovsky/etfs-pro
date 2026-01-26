"use client";

import { useCallback } from "react";

export function Hero() {
  const scrollToContent = useCallback(() => {
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

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
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-8 hero-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-sm font-medium text-cyan-300 tracking-wide">
            Live Market Data • Updated Every Second
          </span>
        </div>

        {/* Main headline */}
        <h1 className="hero-fade-in hero-fade-in-delay-1">
          <span className="block text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-4">
            <span className="hero-title">Track Your</span>
          </span>
          <span className="block text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-4">
            <span className="hero-title-accent">ETF Performance</span>
          </span>
          <span className="block text-5xl md:text-7xl lg:text-8xl font-black tracking-tight">
            <span className="hero-title">Like a Pro</span>
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-8 text-lg md:text-xl lg:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed hero-fade-in hero-fade-in-delay-2">
          Monitor your investments against{" "}
          <span className="text-amber-400 font-semibold">all-time highs</span>,
          spot opportunities in real-time, and make{" "}
          <span className="text-cyan-400 font-semibold">data-driven decisions</span> with precision analytics.
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-12 hero-fade-in hero-fade-in-delay-3">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white hero-counter">10K+</div>
            <div className="text-sm text-slate-500 mt-1">Assets Tracked</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white hero-counter">50ms</div>
            <div className="text-sm text-slate-500 mt-1">Update Latency</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white hero-counter">99.9%</div>
            <div className="text-sm text-slate-500 mt-1">Uptime</div>
          </div>
        </div>

        {/* CTA button */}
        <div className="mt-12 hero-fade-in hero-fade-in-delay-4">
          <button
            onClick={scrollToContent}
            className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl font-semibold text-white text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(124,58,237,0.5)]"
          >
            <span className="relative z-10">Start Tracking Free</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0b0f] to-transparent pointer-events-none" />
    </section>
  );
}
