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

export interface ProfilePlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: string;
  trialDays: number;
  polarProductId: string;
  discount: number;
  discountCode: string;
  originalPrice: number;
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
        : "d9fb9a87-a44e-493b-9be6-130eca83ae99", // production code
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
    price: 199,
    currency: "USD",
    type: "lifetime",
    trialDays: 0,
    polarProductId:
      process.env.NODE_ENV === "development"
        ? "95c62088-bd93-4cb3-9bb9-4556240d0273"
        : "4207dcfa-3828-4c18-b270-a6acbf054d00", // Production code
    features: [
      "Featured placement in sidebar",
      "Priority in sponsor grid",
      "Custom sponsor badge",
      "Lifetime access",
      "Direct link to your startup",
    ],
    color: "bg-primary",
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
        ? "00ff744a-21b8-42df-af78-d1f8eb73f838"
        : "c77e5efc-b97b-49c1-a8fe-36270e3c9cd4", // Production code
    features: [
      "Featured placement in sidebar",
      "Priority in sponsor grid",
      "Custom sponsor badge",
      "2 months free vs monthly",
      "Direct link to your startup",
    ],
    color: "bg-indigo-500",
    icon: "Zap",
  },
};

export const PROFILE_PLANS: Record<string, ProfilePlan> = {
  launch: {
    id: "lifetime",
    name: "Launch deal",
    description: "Lifetime access to all features",
    price: 12,
    discount: 100,
    discountCode: "LAUNCH",
    originalPrice: 49,
    currency: "USD",
    type: "lifetime",
    trialDays: 0,
    polarProductId:
      process.env.NODE_ENV === "development"
        ? "419f5e94-56c2-4018-8146-685756981882"
        : "08129582-e05c-4724-9fca-0f678ff87b7b", // Production code
  },
};

export function getSponsorPlan(planId: string): SponsorPlan | null {
  return SPONSOR_PLANS[planId] || null;
}

export function getAllSponsorPlans(): SponsorPlan[] {
  return Object.values(SPONSOR_PLANS);
}
