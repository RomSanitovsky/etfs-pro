"use client";

interface PricingCardProps {
  title: string;
  price: number | null;
  features: readonly string[];
  isCurrentPlan?: boolean;
  isPremium?: boolean;
  onAction?: () => void;
  actionLabel?: string;
  actionDisabled?: boolean;
}

export function PricingCard({
  title,
  price,
  features,
  isCurrentPlan,
  isPremium,
  onAction,
  actionLabel,
  actionDisabled,
}: PricingCardProps) {
  return (
    <div
      className={`relative rounded-2xl p-8 transition-all duration-300 flex flex-col ${
        isPremium
          ? "bg-gradient-to-br from-nebula/20 to-cosmic/10 border-2 border-nebula/60 shadow-xl shadow-nebula/10"
          : "bg-surface/40 border border-[var(--theme-card-border)]"
      } ${isPremium ? "hover:border-nebula/80 hover:shadow-2xl hover:shadow-nebula/20 scale-[1.02]" : "hover:border-muted/30"}`}
    >
      {/* Badge */}
      {isPremium ? (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span
            className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full
                       bg-gradient-to-r from-nebula to-cosmic text-white shadow-lg"
          >
            Recommended
          </span>
        </div>
      ) : (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span
            className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full
                       bg-surface text-muted border border-[var(--theme-card-border)]"
          >
            Starter
          </span>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8 pt-4">
        <h3 className={`text-2xl font-bold mb-4 ${isPremium ? "text-foreground" : "text-foreground"}`}>
          {title}
        </h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-lg text-muted">$</span>
          <span className={`text-5xl font-black ${isPremium ? "text-foreground" : "text-foreground"}`}>
            {price !== null ? price : "0"}
          </span>
          <span className="text-muted ml-1">/month</span>
        </div>
        {!isPremium && (
          <p className="text-subtle text-sm mt-2">Forever free</p>
        )}
        {isPremium && (
          <p className="text-cosmic text-sm mt-2">Unlock all features</p>
        )}
      </div>

      {/* Divider */}
      <div className={`h-px mb-6 ${isPremium ? "bg-gradient-to-r from-transparent via-nebula/50 to-transparent" : "bg-[var(--theme-card-border)]"}`} />

      {/* Features list */}
      <ul className="space-y-4 mb-8 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
              isPremium ? "bg-cosmic/20" : "bg-surface-alt"
            }`}>
              <svg
                className={`w-3 h-3 ${isPremium ? "text-cosmic" : "text-muted"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span className={`text-sm ${isPremium ? "text-foreground" : "text-muted"}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* Action button */}
      {isCurrentPlan ? (
        <div className="py-3 px-4 rounded-xl font-semibold text-center bg-surface/50 text-muted border border-[var(--theme-card-border)]">
          Current Plan
        </div>
      ) : onAction && actionLabel ? (
        <button
          onClick={onAction}
          disabled={actionDisabled}
          className={`w-full py-3.5 px-4 rounded-xl font-semibold transition-all duration-200 ${
            isPremium
              ? "bg-gradient-to-r from-nebula to-cosmic hover:from-nebula/80 hover:to-cosmic/80 text-white shadow-lg hover:shadow-xl hover:shadow-nebula/25 hover:-translate-y-0.5"
              : "bg-surface hover:bg-surface-alt text-foreground border border-[var(--theme-card-border)]"
          } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
