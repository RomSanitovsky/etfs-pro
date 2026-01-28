"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StarField } from "@/components/StarField";
import { useAuth } from "@/contexts/AuthContext";
import { PremiumBadge } from "@/components/premium/PremiumBadge";
import {
  FREE_FEATURES,
  PREMIUM_FEATURES,
  PREMIUM_PRICE_MONTHLY,
  FREE_TIER_SYMBOL_LIMIT,
  PREMIUM_SYMBOL_LIMIT,
} from "@/lib/constants";

export default function SubscriptionPage() {
  const router = useRouter();
  const { user, loading, upgradeToPremium, downgradeFromPremium } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleUpgrade = async () => {
    setIsProcessing(true);
    setMessage(null);
    try {
      await upgradeToPremium();
      setMessage({ type: "success", text: "Successfully upgraded to Premium! Enjoy unlimited symbols." });
    } catch {
      setMessage({ type: "error", text: "Failed to upgrade. Please try again." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDowngrade = async () => {
    setIsProcessing(true);
    setMessage(null);
    try {
      await downgradeFromPremium();
      setMessage({ type: "success", text: "Successfully downgraded to Free plan." });
    } catch {
      setMessage({ type: "error", text: "Failed to downgrade. Please try again." });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <StarField />
        <div className="w-8 h-8 border-2 border-slate-600 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  const isPremium = user?.isPremium || false;

  return (
    <div className="min-h-screen relative">
      <StarField />

      <main className="relative z-10 container mx-auto px-4 py-12 max-w-4xl">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Manage Subscription
          </h1>
          <p className="text-slate-400 text-lg">
            View and manage your ETFs Pro subscription
          </p>
        </div>

        {/* Current Plan Card */}
        <div className="glass-card p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-wider mb-2">Current Plan</p>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white">
                  {isPremium ? "Premium" : "Free"}
                </h2>
                {isPremium && <PremiumBadge size="md" />}
              </div>
              <p className="text-slate-400 mt-2">
                {isPremium
                  ? `You have access to ${PREMIUM_SYMBOL_LIMIT} symbols and all premium features.`
                  : `You can track up to ${FREE_TIER_SYMBOL_LIMIT} symbols with basic features.`}
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm text-slate-500 mb-1">Monthly Price</p>
              <p className="text-3xl font-bold text-white">
                ${isPremium ? PREMIUM_PRICE_MONTHLY : "0"}
                <span className="text-lg text-slate-400 font-normal">/mo</span>
              </p>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-8 p-4 rounded-xl text-center ${
              message.type === "success"
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Plan Comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Free Plan */}
          <div
            className={`rounded-2xl p-6 border-2 transition-all ${
              !isPremium
                ? "border-cyan-500/50 bg-cyan-500/5"
                : "border-slate-700 bg-slate-800/30 opacity-75"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Free</h3>
              {!isPremium && (
                <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  Current
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-white mb-4">
              $0<span className="text-lg text-slate-400 font-normal">/mo</span>
            </p>
            <ul className="space-y-3 mb-6">
              {FREE_FEATURES.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <svg className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            {isPremium && (
              <button
                onClick={handleDowngrade}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl font-semibold
                           bg-slate-700 hover:bg-slate-600 text-white
                           border border-slate-600 transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Processing..." : "Downgrade to Free"}
              </button>
            )}
          </div>

          {/* Premium Plan */}
          <div
            className={`rounded-2xl p-6 border-2 transition-all ${
              isPremium
                ? "border-amber-500/50 bg-amber-500/5"
                : "border-purple-500/50 bg-purple-500/5"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Premium</h3>
              {isPremium && (
                <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Current
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-white mb-4">
              ${PREMIUM_PRICE_MONTHLY}<span className="text-lg text-slate-400 font-normal">/mo</span>
            </p>
            <ul className="space-y-3 mb-6">
              {PREMIUM_FEATURES.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <svg className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            {!isPremium && (
              <button
                onClick={handleUpgrade}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl font-semibold
                           bg-gradient-to-r from-purple-500 to-cyan-500
                           hover:from-purple-400 hover:to-cyan-400 text-white
                           shadow-lg hover:shadow-xl hover:shadow-purple-500/25
                           transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Processing..." : "Upgrade to Premium"}
              </button>
            )}
          </div>
        </div>

        {/* Test Mode Notice */}
        <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700">
          <p className="text-sm text-slate-400">
            <span className="text-amber-400 font-semibold">Test Mode:</span> This is a demo subscription system.
            No actual payment is required. Click the buttons to simulate upgrading or downgrading.
          </p>
        </div>

        {/* Data Storage Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500">
            Your subscription status is stored securely in Firebase Firestore.
          </p>
        </div>
      </main>
    </div>
  );
}
