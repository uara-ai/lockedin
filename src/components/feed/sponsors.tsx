"use client";

import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Plus, Heart, Crown, Star, Zap, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { FaviconImage } from "@/components/ui/favicon-image";
import { SponsorsLoading } from "./sponsors-loading";

interface Sponsor {
  id: string;
  name: string;
  logo: string;
  logoUrl?: string;
  tier: string;
  url: string;
  planType: string;
  customBadge?: string;
  startupId?: string;
  startupSlug?: string;
  startupName?: string;
  startupWebsite?: string;
  startupLogo?: string;
  startupTagline?: string;
}

// Sponsor Logo Component with favicon support
const SponsorLogo = ({
  startupWebsite,
  startupLogo,
  fallbackText,
  name,
}: {
  startupWebsite?: string;
  startupLogo?: string;
  fallbackText: string;
  name: string;
}) => {
  // Use startup website for favicon if available, otherwise fallback to startup logo
  const logoSource = startupWebsite || startupLogo;

  if (!logoSource) {
    return <span className="text-xs font-medium">{fallbackText}</span>;
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      {startupWebsite ? (
        <FaviconImage
          url={startupWebsite}
          alt={`${name} favicon`}
          size={33}
          className="w-full h-full object-contain p-1"
          fallbackText={fallbackText}
        />
      ) : (
        <Image
          src={startupLogo!}
          alt={`${name} logo`}
          className="w-full h-full object-contain p-1"
          width={33}
          height={33}
          onError={() => {}}
          loading="lazy"
        />
      )}
    </div>
  );
};

// Get tier-specific styling
const getTierStyling = (planType: string) => {
  switch (planType) {
    case "LIFETIME":
      return "border-border hover:border-primary shadow-primary/20";
    case "MONTHLY":
      return "border-border hover:border-primary shadow-primary/20";
    case "ANNUAL":
      return "border-border hover:border-primary shadow-primary/20";
    default:
      return "border-border hover:border-primary shadow-primary/20";
  }
};

export function Sponsors() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const response = await fetch("/api/sponsors");
        if (response.ok) {
          const data = await response.json();
          setSponsors(data.sponsors || []);
        }
      } catch (error) {
        console.error("Failed to fetch sponsors:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSponsors();
  }, []);

  const hasSponsors = sponsors.length > 0;

  const copyCouponCode = async () => {
    try {
      await navigator.clipboard.writeText("EARLY50");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy coupon code:", err);
    }
  };

  return (
    <SidebarGroup className="px-0">
      <SidebarGroupContent>
        <div className="group/sponsors p-3 [--cell-size:--spacing(8)] space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Sponsors</h2>

            {/* Early Adopter Coupon Badge */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyCouponCode}
                  className={cn(
                    "h-6 px-2 text-xs font-mono bg-gradient-to-r from-orange-500/10 to-red-500/10",
                    "border-orange-500/30 hover:border-orange-500/50 hover:bg-orange-500/20",
                    "transition-all duration-200 hover:scale-105",
                    copied && "border-green-500/50 bg-green-500/10"
                  )}
                >
                  <div className="flex items-center gap-1">
                    {copied ? (
                      <>
                        <Check className="size-2.5 text-green-500" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-2.5" />
                        <span className="font-semibold">EARLY50</span>
                      </>
                    )}
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-center">
                  <span className="font-semibold">Early Adopter Discount</span>
                  <br />
                  <span className="text-xs text-muted-foreground">
                    Click to copy 50% off code
                  </span>
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          {isLoading ? (
            <SponsorsLoading />
          ) : hasSponsors ? (
            /* Grid container with similar structure to calendar */
            <div className="grid grid-cols-7 gap-2">
              {sponsors.slice(0, 13).map((sponsor) => {
                // Use startup data if available, otherwise fallback to sponsor data
                const displayName = sponsor.startupName || sponsor.name;
                const displayWebsite = sponsor.startupWebsite || sponsor.url;
                const fallbackText = displayName.substring(0, 2).toUpperCase();

                return (
                  <Tooltip key={sponsor.id}>
                    <TooltipTrigger asChild>
                      <Link
                        href={
                          sponsor.startupSlug
                            ? `/startups/${sponsor.startupSlug}`
                            : displayWebsite
                        }
                        target={sponsor.startupSlug ? "_self" : "_blank"}
                        rel={sponsor.startupSlug ? "" : "noopener noreferrer"}
                        className={cn(
                          "relative w-full h-full p-0 text-center group/sponsor aspect-square select-none",
                          "flex items-center justify-center rounded-md text-xs font-medium overflow-hidden",
                          "border-2 bg-background text-foreground transition-all duration-200",
                          "hover:bg-muted hover:shadow-md cursor-pointer",
                          "w-[33px] min-w-[--cell-size]", // Same width as calendar cells
                          getTierStyling(sponsor.planType)
                        )}
                      >
                        <div className="relative w-full h-full flex items-center justify-center">
                          <SponsorLogo
                            startupWebsite={sponsor.startupWebsite}
                            startupLogo={sponsor.startupLogo}
                            fallbackText={fallbackText}
                            name={displayName}
                          />
                        </div>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-center">
                        <p className="font-medium">{displayName}</p>
                        {sponsor.startupTagline && (
                          <p className="text-xs text-muted-foreground mb-1">
                            {sponsor.startupTagline}
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}

              {/* Add sponsor button or view more button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  {sponsors.length > 13 ? (
                    <div
                      className={cn(
                        "relative w-full h-full p-0 aspect-square select-none",
                        "flex items-center justify-center rounded-md border-dashed",
                        "border-2 border-muted-foreground/30 bg-background text-muted-foreground",
                        "hover:bg-muted hover:border-muted-foreground/50 transition-colors",
                        "w-[33px] min-w-[--cell-size] text-xs font-medium cursor-pointer"
                      )}
                    >
                      +{sponsors.length - 13}
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="icon"
                      className={cn(
                        "relative w-full h-full p-0 aspect-square select-none",
                        "flex items-center justify-center rounded-md border-dashed",
                        "border-2 border-muted-foreground/30 bg-background text-muted-foreground",
                        "hover:bg-muted hover:border-muted-foreground/50 transition-colors",
                        "w-[33px] min-w-[--cell-size]"
                      )}
                      asChild
                    >
                      <Link href="/sponsor">
                        <Plus className="h-3 w-3" />
                      </Link>
                    </Button>
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {sponsors.length > 13
                      ? "View all sponsors"
                      : "Become a sponsor"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            /* Null state */
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-md border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <Heart className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  No sponsors yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Partner with us to support the project
                </p>
              </div>
              <Button variant="outline" size="sm" className="text-xs" asChild>
                <Link href="/sponsor">
                  <Heart className="h-3 w-3 mr-1" />
                  Become a Sponsor
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
