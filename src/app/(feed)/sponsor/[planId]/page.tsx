import { SponsorPage } from "@/components/feed/sponsor";
import { getSponsorPlan } from "@/lib/sponsor-plans";
import { notFound } from "next/navigation";

interface SponsorPlanPageProps {
  params: {
    planId: string;
  };
}

export default function SponsorPlanPage({ params }: SponsorPlanPageProps) {
  const plan = getSponsorPlan(params.planId);

  if (!plan) {
    notFound();
  }

  return <SponsorPage plan={plan} />;
}

export async function generateStaticParams() {
  const plans = ["monthly", "lifetime", "annual"];
  return plans.map((planId) => ({
    planId,
  }));
}
