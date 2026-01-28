"use client";

import { useAuth } from "@/contexts/AuthContext";
import { SubscriptionSection } from "@/components/subscription/SubscriptionSection";
import { WhyChooseUsSection } from "@/components/WhyChooseUsSection";

export function DashboardMarketingSections() {
  const { user, loading } = useAuth();

  if (loading || user?.isPremium) return null;

  return (
    <>
      <SubscriptionSection />
      <WhyChooseUsSection />
    </>
  );
}
