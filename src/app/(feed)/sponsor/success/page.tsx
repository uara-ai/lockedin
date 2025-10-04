"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ExternalLink, Star, Zap, Crown } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  IconCheck,
  IconCheckbox,
  IconChecks,
  IconHeart,
} from "@tabler/icons-react";

function SponsorSuccessContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [sponsorData, setSponsorData] = useState<any>(null);

  useEffect(() => {
    // Polar redirects with checkoutId and customer_session_token
    const checkoutId = searchParams.get("checkoutId");
    const customerSessionToken = searchParams.get("customer_session_token");

    if (checkoutId) {
      // For now, we'll assume monthly plan since that's what we're testing
      setSponsorData({
        planType: "monthly",
        planId: "monthly",
        status: "active",
        checkoutId,
      });
      setIsLoading(false);
      toast.success("Welcome to Commodo! 🎉");
    } else {
      setIsLoading(false);
      toast.error("Invalid payment confirmation");
    }
  }, [searchParams]);

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case "lifetime":
        return Crown;
      case "monthly":
        return Star;
      case "annual":
        return Zap;
      default:
        return Star;
    }
  };

  const getPlanName = (planType: string) => {
    switch (planType) {
      case "lifetime":
        return "Lifetime Sponsor";
      case "monthly":
        return "Startup Sponsor";
      case "annual":
        return "Annual Sponsor";
      default:
        return "Startup Sponsor";
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-6 p-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Processing your payment...</p>
        </div>
      </div>
    );
  }

  if (!sponsorData) {
    return (
      <div className="w-full flex flex-col gap-6 p-4">
        <div className="text-center py-12">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Payment Error
          </h2>
          <p className="text-muted-foreground mb-6">
            There was an issue processing your payment. Please contact support.
          </p>
          <Button asChild>
            <Link href="/sponsor">Try Again</Link>
          </Button>
        </div>
      </div>
    );
  }

  const Icon = getPlanIcon(sponsorData.planType);
  const planName = getPlanName(sponsorData.planType);

  return (
    <div className="w-full flex flex-col gap-6 p-4">
      {/* Success Header */}
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
          <IconCheck className="w-8 h-8 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Payment Successful!
        </h1>
        <p className="text-muted-foreground">
          Welcome to Commodo Sponsors! Your {planName.toLowerCase()} has
          started.
        </p>
      </div>

      {/* Plan Details */}
      <div className="group/plan p-4 rounded-lg border border-transparent hover:border-border hover:bg-muted/30 transition-all duration-200 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{planName}</h3>
            <p className="text-sm text-muted-foreground">
              You are now a sponsor!
            </p>
          </div>
          <Badge className="text-xs" variant="outline">
            Thank you!{" "}
            <IconHeart className="w-4 h-4 text-red-500 fill-current" />
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <IconChecks className="w-4 h-4 text-green-300" />
            <span className="text-muted-foreground">Featured in sidebar</span>
          </div>
          <div className="flex items-center gap-2">
            <IconChecks className="w-4 h-4 text-green-300" />
            <span className="text-muted-foreground">
              Priority in sponsor grid
            </span>
          </div>
          <div className="flex items-center gap-2">
            <IconChecks className="w-4 h-4 text-green-300" />
            <span className="text-muted-foreground">Custom sponsor badge</span>
          </div>
          <div className="flex items-center gap-2">
            <IconChecks className="w-4 h-4 text-green-300" />
            <span className="text-muted-foreground">
              Direct{" "}
              <Link
                href="https://ahrefs.com/seo/glossary/dofollow-link"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-mono bg-muted px-1 py-0.5 rounded text-xs"
              >
                do-follow
              </Link>{" "}
              link to your startup
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button asChild className="flex-1">
          <Link href="/feed">Go to Feed</Link>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href="/profile">View Profile</Link>
        </Button>
      </div>

      {/* Support */}
      <div className="text-center pt-4 border-t">
        <p className="text-xs text-muted-foreground mb-3">
          Need help? Contact{" "}
          <a
            href="https://x.com/locked_fed"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            @locked_fed
          </a>
        </p>
      </div>
    </div>
  );
}

export default function SponsorSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex flex-col gap-6 p-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <SponsorSuccessContent />
    </Suspense>
  );
}
