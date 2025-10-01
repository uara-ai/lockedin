import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Star, Crown, Zap } from "lucide-react";
import { getAllSponsorPlans, type SponsorPlan } from "@/lib/plans";
import Link from "next/link";

interface SponsorPlanSelectorProps {
  currentPlanId?: string;
  showAllPlans?: boolean;
}

const iconMap = {
  Star,
  Crown,
  Zap,
};

export function SponsorPlanSelector({
  currentPlanId,
  showAllPlans = false,
}: SponsorPlanSelectorProps) {
  const plans = showAllPlans
    ? getAllSponsorPlans()
    : getAllSponsorPlans().slice(0, 1);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {plans.map((plan) => {
        const Icon = iconMap[plan.icon as keyof typeof iconMap] || Star;
        const isCurrent = currentPlanId === plan.id;

        return (
          <Card
            key={plan.id}
            className={cn(
              "relative transition-all duration-200 hover:shadow-lg",
              isCurrent && "ring-2 ring-primary"
            )}
          >
            <CardHeader className="text-center">
              <div
                className={cn(
                  "w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center text-white",
                  plan.color
                )}
              >
                <Icon className="w-6 h-6" />
              </div>

              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>

              <div className="mt-4">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">
                    /
                    {plan.type === "lifetime"
                      ? "one-time"
                      : plan.type === "monthly"
                      ? "month"
                      : "year"}
                  </span>
                </div>
                {plan.trialDays > 0 && (
                  <Badge className="mt-2 bg-green-100 text-green-800">
                    {plan.trialDays}-day free trial
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <ul className="space-y-2 text-sm">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-green-500">•</span>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <div className="p-6 pt-0">
              <Link
                href={`/sponsor/${plan.id}`}
                className={cn(
                  "block w-full text-center py-2 px-4 rounded-md transition-colors",
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {isCurrent ? "Current Plan" : "Choose Plan"}
              </Link>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
