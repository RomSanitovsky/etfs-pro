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
          ? "bg-gradient-to-br from-purple-900/50 to-cyan-900/30 border-2 border-purple-500/60 shadow-xl shadow-purple-500/10"
          : "bg-slate-800/40 border border-slate-700/50"
      } ${isPremium ? "hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/20 scale-[1.02]" : "hover:border-slate-600"}`}
    >
      {/* Badge */}
      {isPremium ? (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span
            className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full
                       bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg"
          >
            Recommended
          </span>
        </div>
      ) : (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span
            className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full
                       bg-slate-700 text-slate-300 border border-slate-600"
          >
            Starter
          </span>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8 pt-4">
        <h3 className={`text-2xl font-bold mb-4 ${isPremium ? "text-white" : "text-slate-200"}`}>
          {title}
        </h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-lg text-slate-400">$</span>
          <span className={`text-5xl font-black ${isPremium ? "text-white" : "text-slate-200"}`}>
            {price !== null ? price : "0"}
          </span>
          <span className="text-slate-400 ml-1">/month</span>
        </div>
        {!isPremium && (
          <p className="text-slate-500 text-sm mt-2">Forever free</p>
        )}
        {isPremium && (
          <p className="text-cyan-400 text-sm mt-2">Unlock all features</p>
        )}
      </div>

      {/* Divider */}
      <div className={`h-px mb-6 ${isPremium ? "bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" : "bg-slate-700/50"}`} />

      {/* Features list */}
      <ul className="space-y-4 mb-8 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
              isPremium ? "bg-cyan-500/20" : "bg-slate-700"
            }`}>
              <svg
                className={`w-3 h-3 ${isPremium ? "text-cyan-400" : "text-slate-400"}`}
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
            <span className={`text-sm ${isPremium ? "text-slate-200" : "text-slate-400"}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* Action button */}
      {isCurrentPlan ? (
        <div className="py-3 px-4 rounded-xl font-semibold text-center bg-slate-700/50 text-slate-400 border border-slate-600">
          Current Plan
        </div>
      ) : onAction && actionLabel ? (
        <button
          onClick={onAction}
          disabled={actionDisabled}
          className={`w-full py-3.5 px-4 rounded-xl font-semibold transition-all duration-200 ${
            isPremium
              ? "bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/25 hover:-translate-y-0.5"
              : "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600"
          } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
