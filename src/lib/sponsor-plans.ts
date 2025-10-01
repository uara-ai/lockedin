export interface SponsorPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: string;
  trialDays: number;
  polarProductId: string;
  features: string[];
  color: string;
  icon: string;
}

export const SPONSOR_PLANS: Record<string, SponsorPlan> = {
  monthly: {
    id: "monthly",
    name: "Startup Sponsor",
    description: "Showcase your startup in our sidebar",
    price: 9,
    currency: "USD",
    type: "monthly",
    trialDays: 0,
    polarProductId:
      process.env.NODE_ENV === "development"
        ? "c053485a-5989-4dfb-8ffe-878b70b67d99"
        : "prod_123_production", // TODO: Add product ID
    features: [
      "Featured placement in sidebar",
      "Direct link to your startup",
      "Custom sponsor badge",
      "Cancel anytime",
    ],
    color: "bg-blue-500",
    icon: "Star",
  },
  lifetime: {
    id: "lifetime",
    name: "Lifetime Sponsor",
    description: "One-time payment, lifetime benefits",
    price: 299,
    currency: "USD",
    type: "lifetime",
    trialDays: 0,
    polarProductId:
      process.env.NODE_ENV === "development"
        ? "c053485a-5989-4dfb-8ffe-878b70b67d99"
        : "prod_123_production", // TODO: Add product ID
    features: [
      "Featured placement in sidebar",
      "Priority in sponsor grid",
      "Custom sponsor badge",
      "Lifetime access",
      "Direct link to your startup",
    ],
    color: "bg-purple-500",
    icon: "Crown",
  },
  annual: {
    id: "annual",
    name: "Annual Sponsor",
    description: "Yearly recurring with 2 months free",
    price: 90,
    currency: "USD",
    type: "annual",
    trialDays: 0,
    polarProductId:
      process.env.NODE_ENV === "development"
        ? "c053485a-5989-4dfb-8ffe-878b70b67d99"
        : "prod_123_production", // TODO: Add product ID
    features: [
      "Featured placement in sidebar",
      "Priority in sponsor grid",
      "Custom sponsor badge",
      "2 months free vs monthly",
      "Direct link to your startup",
    ],
    color: "bg-green-500",
    icon: "Zap",
  },
};

export function getSponsorPlan(planId: string): SponsorPlan | null {
  return SPONSOR_PLANS[planId] || null;
}

export function getAllSponsorPlans(): SponsorPlan[] {
  return Object.values(SPONSOR_PLANS);
}
