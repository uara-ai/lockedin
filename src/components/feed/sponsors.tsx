"use client";

import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Plus, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

// Sample sponsor data - you can replace this with actual data
const sponsors = [
  {
    id: 1,
    name: "LockedIn.bio",
    logo: "LI",
    logoUrl: "/icon.png", // Path to logo in public folder
    tier: "",
    url: "https://lockedin.bio",
  },
];

// Sponsor Logo Component with fallback
const SponsorLogo = ({
  logoUrl,
  fallbackText,
  name,
}: {
  logoUrl?: string;
  fallbackText: string;
  name: string;
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!logoUrl || imageError) {
    return <span className="text-xs font-medium">{fallbackText}</span>;
  }

  return (
    <>
      {!imageLoaded && (
        <span className="text-xs font-medium">{fallbackText}</span>
      )}
      <Image
        src={logoUrl}
        alt={`${name} logo`}
        className={cn(
          "w-full h-full object-contain p-1 transition-opacity",
          imageLoaded ? "opacity-100" : "opacity-0 absolute"
        )}
        width={33}
        height={33}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        loading="lazy"
      />
    </>
  );
};

// Get tier-specific styling
const getTierStyling = (tier: string) => {
  switch (tier) {
    case "Gold":
      return "border-yellow-500/50 hover:border-yellow-500 shadow-yellow-500/20";
    case "Silver":
      return "border-gray-400/50 hover:border-gray-400 shadow-gray-400/20";
    case "Bronze":
      return "border-amber-600/50 hover:border-amber-600 shadow-amber-600/20";
    default:
      return "border-border hover:border-muted-foreground/50";
  }
};

export function Sponsors() {
  const hasSponsors = sponsors.length > 0;

  return (
    <SidebarGroup className="px-0">
      <SidebarGroupContent>
        <div className="group/sponsors p-3 [--cell-size:--spacing(8)] space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Sponsors</h2>

          {hasSponsors ? (
            /* Grid container with similar structure to calendar */
            <div className="grid grid-cols-7 gap-2">
              {sponsors.slice(0, 13).map((sponsor) => (
                <Tooltip key={sponsor.id}>
                  <TooltipTrigger asChild>
                    <Link
                      href={sponsor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "relative w-full h-full p-0 text-center group/sponsor aspect-square select-none",
                        "flex items-center justify-center rounded-md text-xs font-medium overflow-hidden",
                        "border-2 bg-background text-foreground transition-all duration-200",
                        "hover:bg-muted hover:shadow-md cursor-pointer",
                        "w-[33px] min-w-[--cell-size]", // Same width as calendar cells
                        getTierStyling(sponsor.tier)
                      )}
                    >
                      <SponsorLogo
                        logoUrl={sponsor.logoUrl}
                        fallbackText={sponsor.logo}
                        name={sponsor.name}
                      />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-center">
                      <p className="font-medium">{sponsor.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {sponsor.tier} Sponsor
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}

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
                      <Link href="mailto:sponsors@lockedin.com">
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
                <Link href="mailto:sponsors@lockedin.com">
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
