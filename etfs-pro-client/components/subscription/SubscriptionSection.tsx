"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { PricingCard } from "./PricingCard";
import {
  FREE_FEATURES,
  PREMIUM_FEATURES,
  PREMIUM_PRICE_MONTHLY,
} from "@/lib/constants";

export function SubscriptionSection() {
  const { user, createCheckoutSession, loading } = useAuth();
  const router = useRouter();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState<string | null>(null);

  const handleUpgrade = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setIsUpgrading(true);
    setUpgradeMessage(null);

    try {
      const url = await createCheckoutSession();
      window.location.href = url;
    } catch (error) {
      console.error("Checkout failed:", error);
      setUpgradeMessage("Failed to start checkout. Please try again.");
      setIsUpgrading(false);
    }
  };

  const isPremiumUser = user?.isPremium || false;

  return (
    <section className="mt-20 mb-12">
      {/* Section header */}
      <div className="text-center mb-14">
        <span className="inline-block px-4 py-1.5 rounded-full bg-nebula/10 border border-nebula/20 text-nebula text-sm font-medium mb-4">
          Pricing Plans
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Upgrade Your Trading Experience
        </h2>
        <p className="text-muted max-w-xl mx-auto text-lg">
          Choose the plan that fits your needs. Upgrade anytime to unlock premium features.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto px-4">
        <PricingCard
          title="Free"
          price={null}
          features={FREE_FEATURES}
          isCurrentPlan={!isPremiumUser && !!user}
          onAction={!user ? () => router.push("/login") : undefined}
          actionLabel={!user ? "Get Started" : undefined}
        />
        <PricingCard
          title="Premium"
          price={PREMIUM_PRICE_MONTHLY}
          features={PREMIUM_FEATURES}
          isPremium
          isCurrentPlan={isPremiumUser}
          onAction={handleUpgrade}
          actionLabel={
            loading
              ? "Loading..."
              : isUpgrading
              ? "Redirecting..."
              : !user
              ? "Sign In to Upgrade"
              : "Upgrade Now"
          }
          actionDisabled={loading || isUpgrading || isPremiumUser}
        />
      </div>

      {/* Upgrade message */}
      {upgradeMessage && (
        <div
          className={`mt-8 max-w-md mx-auto p-4 rounded-xl text-center text-sm ${
            upgradeMessage.includes("Failed")
              ? "bg-loss/20 text-loss border border-loss/30"
              : "bg-gain/20 text-gain border border-gain/30"
          }`}
        >
          {upgradeMessage}
        </div>
      )}
    </section>
  );
}
