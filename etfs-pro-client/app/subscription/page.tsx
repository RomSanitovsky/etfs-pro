"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const { user, loading, createCheckoutSession, createPortalSession } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Handle Stripe redirect status params
  const handleStripeRedirect = useCallback(() => {
    const status = searchParams.get("status");
    if (!status) return;

    if (status === "success") {
      setMessage({ type: "success", text: "Payment successful! Activating your premium subscription..." });
    } else if (status === "cancelled") {
      setMessage({ type: "error", text: "Checkout was cancelled. No charges were made." });
    }

    // Clean up URL params
    router.replace("/subscription");
  }, [searchParams, router]);

  useEffect(() => {
    handleStripeRedirect();
  }, [handleStripeRedirect]);

  // Update success message once premium is confirmed (real-time listener handles this)
  useEffect(() => {
    if (user?.isPremium && message?.text.includes("Activating")) {
      setMessage({ type: "success", text: "Premium subscription activated! Enjoy unlimited symbols." });
    }
  }, [user?.isPremium, message?.text]);

  const handleUpgrade = async () => {
    setIsProcessing(true);
    setMessage(null);
    try {
      const url = await createCheckoutSession();
      window.location.href = url;
    } catch (error) {
      const text = error instanceof Error ? error.message : "Failed to start checkout. Please try again.";
      setMessage({ type: "error", text });
      setIsProcessing(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsProcessing(true);
    setMessage(null);
    try {
      const url = await createPortalSession();
      window.location.href = url;
    } catch (error) {
      const text = error instanceof Error ? error.message : "Failed to open subscription portal. Please try again.";
      setMessage({ type: "error", text });
      setIsProcessing(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <StarField />
        <div className="w-8 h-8 border-2 border-subtle border-t-cosmic rounded-full animate-spin" />
      </div>
    );
  }

  const isPremium = user?.isPremium || false;
  const cancelAtPeriodEnd = user?.cancelAtPeriodEnd || false;

  return (
    <div className="min-h-screen relative">
      <StarField />

      <main className="relative z-10 container mx-auto px-4 py-12 max-w-4xl">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Manage Subscription
          </h1>
          <p className="text-muted text-lg">
            View and manage your ETFs Pro subscription
          </p>
        </div>

        {/* Current Plan Card */}
        <div className="glass-card p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-sm text-subtle uppercase tracking-wider mb-2">Current Plan</p>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-foreground">
                  {isPremium ? "Premium" : "Free"}
                </h2>
                {isPremium && <PremiumBadge size="md" />}
              </div>
              <p className="text-muted mt-2">
                {isPremium
                  ? `You have access to ${PREMIUM_SYMBOL_LIMIT} symbols and all premium features.`
                  : `You can track up to ${FREE_TIER_SYMBOL_LIMIT} symbols with basic features.`}
              </p>
              {isPremium && cancelAtPeriodEnd && user.premiumExpiresAt && (
                <p className="text-gold mt-2 text-sm font-medium">
                  Your subscription ends on {user.premiumExpiresAt.toLocaleDateString()}.
                  You&apos;ll retain premium access until then.
                </p>
              )}
              {isPremium && user.subscriptionStatus === "past_due" && (
                <p className="text-loss mt-2 text-sm font-medium">
                  Payment issue detected. Please update your payment method to avoid losing access.
                </p>
              )}
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm text-subtle mb-1">Monthly Price</p>
              <p className="text-3xl font-bold text-foreground">
                ${isPremium ? PREMIUM_PRICE_MONTHLY : "0"}
                <span className="text-lg text-muted font-normal">/mo</span>
              </p>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-8 p-4 rounded-xl text-center ${
              message.type === "success"
                ? "bg-gain/20 text-gain border border-gain/30"
                : "bg-loss/20 text-loss border border-loss/30"
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
                ? "border-cosmic/50 bg-cosmic/5"
                : "border-[var(--theme-card-border)] bg-surface/30 opacity-75"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground">Free</h3>
              {!isPremium && (
                <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-cosmic/20 text-cosmic border border-cosmic/30">
                  Current
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-foreground mb-4">
              $0<span className="text-lg text-muted font-normal">/mo</span>
            </p>
            <ul className="space-y-3 mb-6">
              {FREE_FEATURES.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <svg className="w-4 h-4 text-subtle mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Premium Plan */}
          <div
            className={`rounded-2xl p-6 border-2 transition-all ${
              isPremium
                ? "border-gold/50 bg-gold/5"
                : "border-nebula/50 bg-nebula/5"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground">Premium</h3>
              {isPremium && (
                <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-gold/20 text-gold border border-gold/30">
                  Current
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-foreground mb-4">
              ${PREMIUM_PRICE_MONTHLY}<span className="text-lg text-muted font-normal">/mo</span>
            </p>
            <ul className="space-y-3 mb-6">
              {PREMIUM_FEATURES.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <svg className="w-4 h-4 text-nebula mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                           bg-gradient-to-r from-nebula to-cosmic
                           hover:from-nebula/80 hover:to-cosmic/80 text-white
                           shadow-lg hover:shadow-xl hover:shadow-nebula/25
                           transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Redirecting to checkout..." : "Upgrade to Premium"}
              </button>
            )}
            {isPremium && (
              <button
                onClick={handleManageSubscription}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl font-semibold
                           bg-surface hover:bg-surface-alt text-foreground
                           border border-[var(--theme-card-border)] transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Redirecting..." : "Manage Subscription"}
              </button>
            )}
          </div>
        </div>

        {/* Data Storage Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-subtle">
            Payments are securely processed by Stripe. Your subscription status is stored in Firebase Firestore.
          </p>
        </div>
      </main>
    </div>
  );
}
