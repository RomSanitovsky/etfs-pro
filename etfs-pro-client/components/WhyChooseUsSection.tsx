"use client";

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    title: "All-Time High Tracking",
    description: "Instantly see how far your assets are from their peak. Know exactly when to buy the dip or take profits.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Real-Time Data",
    description: "Market data updates in real-time so you never miss a trading opportunity. Stay ahead of the market.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Smart Analytics",
    description: "Powerful statistics that show exactly what you need. Percentage down, gains needed to recover, and more.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: "Personalized Watchlist",
    description: "Build your own portfolio watchlist with the assets that matter most to you. Your investments, your way.",
    gradient: "from-rose-500 to-red-500",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: "Secure & Private",
    description: "Your data is encrypted and stored securely. We never share your portfolio information with third parties.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Works Everywhere",
    description: "Access your portfolio from any device. Desktop, tablet, or phone - your data syncs seamlessly.",
    gradient: "from-indigo-500 to-purple-500",
  },
];

const stats = [
  { value: "10K+", label: "Assets Tracked" },
  { value: "99.9%", label: "Uptime" },
  { value: "50ms", label: "Data Latency" },
  { value: "24/7", label: "Market Coverage" },
];

export function WhyChooseUsSection() {
  return (
    <section className="mt-24 mb-12">
      {/* Section header */}
      <div className="text-center mb-16">
        <span className="inline-block px-4 py-1.5 rounded-full bg-cosmic/10 border border-cosmic/20 text-cosmic text-sm font-medium mb-4">
          Why Portfolift?
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          The Smarter Way to Track{" "}
          <span className="bg-gradient-to-r from-nebula via-cosmic to-nebula bg-clip-text text-transparent">
            Your Investments
          </span>
        </h2>
        <p className="text-muted max-w-2xl mx-auto text-lg">
          Stop guessing where your portfolio stands. Get crystal-clear insights into your assets&apos; performance
          relative to their all-time highs.
        </p>
      </div>

      {/* Stats bar */}
      <div className="relative mb-16">
        <div className="absolute inset-0 bg-gradient-to-r from-nebula/10 via-cosmic/10 to-nebula/10 rounded-2xl blur-xl" />
        <div className="relative bg-surface/50 border border-[var(--theme-card-border)] rounded-2xl p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-cosmic to-nebula bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group relative rounded-2xl p-6 bg-surface/40 border border-[var(--theme-card-border)]
                       hover:border-muted/30 hover:bg-surface/60 transition-all duration-300
                       hover:-translate-y-1 hover:shadow-xl hover:shadow-nebula/5"
          >
            {/* Icon */}
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4
                            bg-gradient-to-br ${feature.gradient} bg-opacity-10
                            group-hover:scale-110 transition-transform duration-300`}>
              <div className="text-white">
                {feature.icon}
              </div>
            </div>

            {/* Content */}
            <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-cosmic transition-colors">
              {feature.title}
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              {feature.description}
            </p>

            {/* Hover glow effect */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0
                            group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 text-center">
        <div className="relative inline-block">
          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-nebula to-cosmic rounded-2xl blur-xl opacity-30" />

          {/* Card */}
          <div className="relative bg-gradient-to-br from-surface/80 to-background/80 border border-[var(--theme-card-border)]
                          rounded-2xl p-8 md:p-10 max-w-2xl">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Ready to Take Control?
            </h3>
            <p className="text-muted mb-6">
              Join thousands of investors who track their portfolios smarter, not harder.
              Start free today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-8 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-nebula to-cosmic
                           hover:from-nebula/80 hover:to-cosmic/80 text-white shadow-lg
                           hover:shadow-xl hover:shadow-nebula/25 hover:-translate-y-0.5
                           transition-all duration-200"
              >
                Get Started Free
              </a>
              <a
                href="#pricing"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-3.5 rounded-xl font-semibold bg-surface/50 hover:bg-surface
                           text-foreground border border-[var(--theme-card-border)] transition-all duration-200"
              >
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
