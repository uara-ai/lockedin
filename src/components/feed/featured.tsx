"use client";

import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus, User, Loader2, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import Link from "next/link";
import { IconRosetteDiscountCheck } from "@tabler/icons-react";

// Mock featured profiles data - this would come from your database
const mockFeaturedProfiles = [
  {
    id: "1",
    username: "fed",
    name: "Fed",
    avatar:
      "https://workoscdn.com/images/v1/a5Go7UVlxaWPLKqqIj41r6x1sS7it0mQlm2dAJuYNxI",
    verified: true,
    revenue: 0,
    bio: "Building the future of web development",
  },
];

interface FeaturedProfile {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  verified: boolean;
  revenue: number;
  bio: string;
}

// Get profile tier styling based on performance metrics
const getProfileTierStyling = (profile: FeaturedProfile) => {
  const score = profile.revenue / 10000; // Simple scoring algorithm

  if (score >= 100) {
    return "border-yellow-500/50 hover:border-yellow-500 shadow-yellow-500/20 hover:shadow-md";
  } else if (score >= 50) {
    return "border-purple-500/50 hover:border-purple-500 shadow-purple-500/20 hover:shadow-md";
  } else if (score >= 25) {
    return "border-blue-500/50 hover:border-blue-500 shadow-blue-500/20 hover:shadow-md";
  }
  return "border-border hover:border-muted-foreground/50";
};

export function Featured() {
  const [profiles, setProfiles] = useState<FeaturedProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProfiles = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // In a real app, this would be an API call to your backend
        setProfiles(mockFeaturedProfiles);
      } catch (err) {
        setError("Failed to fetch featured profiles");
        console.error("Error fetching featured profiles:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProfiles();
  }, []);

  const hasProfiles = profiles.length > 0;

  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  if (isLoading) {
    return (
      <SidebarGroup className="px-0">
        <SidebarGroupContent>
          <div className="group/featured p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500 fill-current" />
              <h2 className="text-sm font-semibold text-foreground">
                Featured
              </h2>
            </div>
            <div className="flex items-center justify-center p-6 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (error || !hasProfiles) {
    return (
      <SidebarGroup className="px-0">
        <SidebarGroupContent>
          <div className="group/featured p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500 fill-current" />
              <h2 className="text-sm font-semibold text-foreground">
                Featured
              </h2>
            </div>
            {/* Null state */}
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {error
                    ? "Failed to load profiles"
                    : "No featured builders yet"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {error
                    ? "Check your connection and try again"
                    : "Build consistently to get featured"}
                </p>
              </div>
              <Button variant="outline" size="sm" className="text-xs" asChild>
                <Link href="/featured/apply">
                  <Flame className="h-3 w-3 mr-1" />
                  Be Featured
                </Link>
              </Button>
            </div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup className="px-0">
      <SidebarGroupContent>
        <div className="group/featured p-3 space-y-3">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500 fill-current" />
            <h2 className="text-sm font-semibold text-foreground">Featured</h2>
          </div>

          {/* Mini cards layout - 1 profile stacked */}
          <div className="space-y-2">
            {profiles.slice(0, 1).map((profile) => (
              <Link
                key={profile.id}
                href={`/${profile.username}`}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-all duration-200",
                  "hover:bg-muted/50 cursor-pointer group/profile",
                  "border border-transparent hover:border-border"
                )}
              >
                <div className="relative">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg border-2 overflow-hidden",
                      "bg-background transition-all duration-200",
                      getProfileTierStyling(profile)
                    )}
                  >
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-medium">
                        {getInitials(profile.name)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-foreground truncate">
                      {profile.name}
                    </span>
                    {profile.verified && (
                      <IconRosetteDiscountCheck className="h-3 w-3 fill-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">@{profile.username}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-medium text-green-600">
                    {formatCurrency(profile.revenue)}
                  </div>
                  <div className="text-xs text-muted-foreground">revenue</div>
                </div>
              </Link>
            ))}

            {/* Be Featured Button - Always visible */}
            <Link
              href="/featured/apply"
              className={cn(
                "flex items-center justify-center gap-2 p-2 rounded-lg",
                "border-2 border-dashed border-orange-500/30",
                "hover:border-orange-500/50 hover:bg-orange-50/30 dark:hover:bg-orange-950/30",
                "text-sm text-orange-600 dark:text-orange-400 transition-all duration-200",
                "font-medium"
              )}
            >
              <Flame className="h-4 w-4" />
              <span>Be Featured</span>
            </Link>

            {/* View More Button - Only show if more than 1 profile */}
            {profiles.length > 1 && (
              <Link
                href="/featured"
                className={cn(
                  "flex items-center justify-center gap-2 p-2 rounded-lg",
                  "border-2 border-dashed border-muted-foreground/30",
                  "hover:border-muted-foreground/50 hover:bg-muted/30",
                  "text-sm text-muted-foreground transition-all duration-200"
                )}
              >
                <Plus className="h-4 w-4" />
                <span>View {profiles.length - 1} more builders</span>
              </Link>
            )}
          </div>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

// Cursor rules applied correctly.
