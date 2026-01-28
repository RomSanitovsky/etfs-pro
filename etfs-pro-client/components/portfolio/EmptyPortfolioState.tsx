"use client";

interface EmptyPortfolioStateProps {
  onAddTransaction: () => void;
}

export function EmptyPortfolioState({ onAddTransaction }: EmptyPortfolioStateProps) {
  return (
    <div className="glass-card p-8 text-center">
      {/* Icon */}
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
        <svg className="w-10 h-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-white mb-2">
        Start Building Your Portfolio
      </h2>

      {/* Description */}
      <p className="text-slate-400 mb-6 max-w-md mx-auto">
        Track your investments, monitor P&L, and analyze your portfolio performance.
        Add your first holding to get started.
      </p>

      {/* CTA Button */}
      <button
        onClick={onAddTransaction}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                   bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold
                   hover:from-cyan-400 hover:to-purple-400
                   shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30
                   transition-all duration-300"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add First Holding
      </button>

      {/* Features */}
      <div className="mt-8 pt-8 border-t border-slate-700/50 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4">
          <div className="text-cyan-400 mb-2">
            <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-white">P&L Tracking</h3>
          <p className="text-xs text-slate-500 mt-1">Real-time profit/loss for each holding</p>
        </div>
        <div className="p-4">
          <div className="text-purple-400 mb-2">
            <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-white">Allocation View</h3>
          <p className="text-xs text-slate-500 mt-1">See how your portfolio is distributed</p>
        </div>
        <div className="p-4">
          <div className="text-amber-400 mb-2">
            <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-white">Transaction History</h3>
          <p className="text-xs text-slate-500 mt-1">Track all your purchases</p>
        </div>
      </div>
    </div>
  );
}
