"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Star, Crown, Zap } from "lucide-react";
import { getAllSponsorPlans, type SponsorPlan } from "@/lib/plans";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useState } from "react";
import { toast } from "sonner";

interface SponsorPlanSelectorProps {
  currentPlanId?: string;
  showAllPlans?: boolean;
  selectedStartupId?: string;
}

const iconMap = {
  Star,
  Crown,
  Zap,
};

export function SponsorPlanSelector({
  currentPlanId,
  showAllPlans = false,
  selectedStartupId,
}: SponsorPlanSelectorProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const plans = showAllPlans
    ? getAllSponsorPlans()
    : getAllSponsorPlans().slice(0, 1);

  const handleCheckout = async (plan: SponsorPlan) => {
    if (!selectedStartupId) {
      toast.error("Please select a startup to feature");
      return;
    }

    setLoading((prev) => ({ ...prev, [plan.id]: true }));

    try {
      const checkoutUrl = `/api/checkout?products=${
        plan.polarProductId
      }&customerEmail=${encodeURIComponent(
        user?.email || ""
      )}&metadata=${encodeURIComponent(
        JSON.stringify({
          planType: plan.type,
          planId: plan.id,
          startupId: selectedStartupId,
        })
      )}`;
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Error redirecting to checkout:", error);
      toast.error("Failed to start checkout");
    } finally {
      setLoading((prev) => ({ ...prev, [plan.id]: false }));
    }
  };

  return (
    <div className="space-y-4">
      {!selectedStartupId && (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Select a startup first
          </h3>
          <p className="text-muted-foreground">
            Choose which startup you&apos;d like to sponsor to see pricing plans
          </p>
        </div>
      )}

      {selectedStartupId && (
        <div className="grid gap-3 md:grid-cols-3">
          {plans.map((plan) => {
            const Icon = iconMap[plan.icon as keyof typeof iconMap] || Star;
            const isCurrent = currentPlanId === plan.id;
            const isLifetime = plan.id === "lifetime";

            return (
              <Card
                key={plan.id}
                className={cn(
                  "group/plan p-3 rounded-lg transition-all duration-200 cursor-pointer",
                  "border border-transparent hover:border-border hover:bg-muted/30",
                  isCurrent && "ring-2 ring-primary",
                  isLifetime && "ring-2 ring-orange-500 shadow-lg"
                )}
              >
                <div>
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-md flex items-center justify-center text-white flex-shrink-0",
                          plan.color
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className={cn(
                              "text-sm font-semibold text-foreground truncate",
                              isLifetime &&
                                "underline decoration-orange-500 decoration-2 underline-offset-2"
                            )}
                          >
                            {plan.name}
                          </h3>
                          {isLifetime && (
                            <Badge className="text-xs h-4 px-1.5 bg-orange-500 text-white">
                              Best
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {plan.description}
                        </p>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold">${plan.price}</span>
                      <span className="text-xs text-muted-foreground">
                        /
                        {plan.type === "lifetime"
                          ? "one-time"
                          : plan.type === "monthly"
                          ? "month"
                          : "year"}
                      </span>
                    </div>

                    {/* All Features */}
                    <div className="space-y-1">
                      {plan.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 text-xs text-muted-foreground"
                        >
                          <span className="text-green-500">•</span>
                          <span className="line-clamp-1">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Checkout Button */}
                    <Button
                      onClick={() => handleCheckout(plan)}
                      disabled={loading[plan.id] || !selectedStartupId}
                      className={cn(
                        "w-full h-8 text-xs font-semibold",
                        isLifetime
                          ? "bg-orange-500 hover:bg-orange-600 text-white"
                          : "bg-primary hover:bg-primary/90"
                      )}
                    >
                      {loading[plan.id]
                        ? "Processing..."
                        : isCurrent
                        ? "Current Plan"
                        : isLifetime
                        ? "Get Lifetime Access"
                        : "Start Sponsoring"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
