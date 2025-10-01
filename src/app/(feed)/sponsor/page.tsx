"use client";

import { useState } from "react";
import { SponsorPlanSelector } from "@/components/feed/sponsor/sponsor-plan-selector";
import { SponsorStartupPicker } from "@/components/feed/sponsor/sponsor-startup-picker";

export default function SponsorPageRoute() {
  const [selectedStartupId, setSelectedStartupId] = useState<
    string | undefined
  >();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Startup Selection */}
          <SponsorStartupPicker
            onStartupSelect={setSelectedStartupId}
            selectedStartupId={selectedStartupId}
          />

          {/* Pricing Plans */}
          <SponsorPlanSelector
            showAllPlans={true}
            selectedStartupId={selectedStartupId}
          />
        </div>
      </div>
    </div>
  );
}
