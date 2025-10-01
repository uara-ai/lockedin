import { SponsorPage } from "@/components/feed/sponsor";
import { getSponsorPlan } from "@/lib/sponsor-plans";

export default function SponsorPageRoute() {
  // Get the monthly plan by default
  const plan = getSponsorPlan("monthly");

  if (!plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Plan not found</h1>
          <p className="text-muted-foreground">
            The requested sponsor plan is not available.
          </p>
        </div>
      </div>
    );
  }

  return <SponsorPage plan={plan} />;
}
