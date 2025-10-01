"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { type StartupWithDetails, getMyStartups } from "@/app/data/startups";
import { FaviconImage } from "@/components/ui/favicon-image";
import {
  IconStar,
  IconUsers,
  IconRocket,
  IconTarget,
  IconTax,
} from "@tabler/icons-react";
import { toast } from "sonner";
import Link from "next/link";

interface SponsorStartupPickerProps {
  onStartupSelect: (startupId: string) => void;
  selectedStartupId?: string;
}

export function SponsorStartupPicker({
  onStartupSelect,
  selectedStartupId,
}: SponsorStartupPickerProps) {
  const [startups, setStartups] = useState<StartupWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        const response = await getMyStartups();
        if (response.success && response.data) {
          setStartups(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch startups:", error);
        toast.error("Failed to load startups");
      } finally {
        setLoading(false);
      }
    };

    fetchStartups();
  }, []);

  const formatCurrency = (amount: number | null) => {
    if (!amount) return null;
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  const formatNumber = (num: number | null) => {
    if (!num) return null;
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="text-center mb-6">
          <Skeleton className="h-6 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>

        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                {/* Icon Skeleton */}
                <Skeleton className="w-8 h-8 rounded-md flex-shrink-0" />

                {/* Content Skeleton */}
                <div className="flex-1 min-w-0 space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>

                {/* Selection Indicator Skeleton */}
                <Skeleton className="w-4 h-4 rounded-full flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (startups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">No Startups Found</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <IconStar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Create a startup first
            </h3>
            <p className="text-muted-foreground mb-4">
              You need to add a startup to your profile before you can sponsor
              it.
            </p>
            <Button asChild>
              <Link href="/profile/edit">Add Startup</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-2">Become a Sponsor</h2>
        <p className="text-sm text-muted-foreground">
          Showcase your startup in our sidebar and get featured placement to
          reach more builders, makers, and founders.
        </p>
      </div>

      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        {startups.map((startup) => (
          <div
            key={startup.id}
            onClick={() => onStartupSelect(startup.id)}
            className={cn(
              "group/startup p-3 rounded-lg transition-all duration-200 cursor-pointer",
              "border border-transparent hover:border-border hover:bg-muted/30",
              selectedStartupId === startup.id
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border"
            )}
          >
            <div className="flex items-center gap-3">
              {/* Logo/Favicon */}
              <div className="relative flex-shrink-0">
                <div
                  className={cn(
                    "w-8 h-8 rounded-md border overflow-hidden",
                    "bg-background transition-all duration-200",
                    startup.isFeatured
                      ? "border-orange-500/50 shadow-orange-500/20"
                      : "border-border"
                  )}
                >
                  {startup.website ? (
                    <FaviconImage
                      url={startup.website}
                      alt={`${startup.name} favicon`}
                      size={32}
                      className="w-full h-full object-contain p-0.5"
                      fallbackText={startup.name.substring(0, 2).toUpperCase()}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-medium">
                      {startup.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                {startup.isFeatured && (
                  <div className="absolute -top-0.5 -right-0.5">
                    <IconStar className="h-2.5 w-2.5 fill-orange-500 text-orange-500" />
                  </div>
                )}
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground truncate">
                  {startup.name}
                </h3>
                {startup.tagline && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {startup.tagline}
                  </p>
                )}
              </div>

              {/* Selection Indicator */}
              <div className="flex-shrink-0">
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2 transition-all duration-200",
                    selectedStartupId === startup.id
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/30"
                  )}
                >
                  {selectedStartupId === startup.id && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
