"use client";

import { useState, useEffect } from "react";
import { getMyStartups, type StartupWithDetails } from "@/app/data/startups";
import { SponsorHeader } from "@/components/sponsor/sponsor-header";
import { SponsorStartupSelector } from "@/components/sponsor/sponsor-startup-selector";
import { SponsorPlanCard } from "@/components/sponsor/sponsor-plan-card";
import { SponsorLoadingState } from "@/components/sponsor/sponsor-loading-state";
import { SponsorEmptyState } from "@/components/sponsor/sponsor-empty-state";
import { useAuth } from "@workos-inc/authkit-nextjs/components";

interface SponsorPageProps {
  plan: {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    type: string;
    trialDays: number;
    polarProductId: string;
  };
}

export function SponsorPage({ plan }: SponsorPageProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [startups, setStartups] = useState<StartupWithDetails[]>([]);
  const [selectedStartup, setSelectedStartup] = useState<string | null>(null);
  const [loadingStartups, setLoadingStartups] = useState(true);

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        const response = await getMyStartups();
        if (response.success && response.data) {
          setStartups(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch startups:", error);
      } finally {
        setLoadingStartups(false);
      }
    };

    fetchStartups();
  }, []);

  const handleStartTrial = async () => {
    if (!selectedStartup) return;

    setIsLoading(true);

    try {
      // Redirect to Polar checkout
      const checkoutUrl = `/api/checkout?products=${
        plan.polarProductId
      }&customerEmail=${encodeURIComponent(
        user?.email || ""
      )}&metadata=${encodeURIComponent(
        JSON.stringify({
          planType: plan.type,
          planId: plan.id,
          startupId: selectedStartup,
        })
      )}`;
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Error redirecting to checkout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingStartups) {
    return <SponsorLoadingState />;
  }

  if (startups.length === 0) {
    return <SponsorEmptyState />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <SponsorHeader plan={plan} />

          <SponsorStartupSelector
            startups={startups}
            selectedStartup={selectedStartup}
            onSelectStartup={setSelectedStartup}
          />

          <SponsorPlanCard
            plan={plan}
            selectedStartup={selectedStartup}
            isLoading={isLoading}
            onStartTrial={handleStartTrial}
          />
        </div>
      </div>
    </div>
  );
}
