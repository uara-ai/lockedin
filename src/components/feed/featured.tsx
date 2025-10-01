"use client";

import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus, User, Loader2, Users, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { IconRosetteDiscountCheck } from "@tabler/icons-react";
import Image from "next/image";
import { getAllPublicUsers, getPublicUsersCount } from "@/app/data/profile";
import type { UserProfile } from "@/app/data/profile";
import { FeaturedLoading } from "./featured-loading";

// Get profile tier styling based on performance metrics
const getProfileTierStyling = (profile: UserProfile) => {
  const score = (profile.currentStreak || 0) * 10; // Use streak as scoring metric

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
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const observerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const USERS_PER_PAGE = 10;

  const fetchUsers = useCallback(
    async (pageOffset: number, append: boolean = false) => {
      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
          setError(null);
        }

        const response = await getAllPublicUsers(USERS_PER_PAGE, pageOffset);
        if (response.success && response.data) {
          const newUsers = response.data;

          if (append) {
            setProfiles((prev) => [...prev, ...newUsers]);
          } else {
            setProfiles(newUsers);
          }

          // Check if we have more users to load
          setHasMore(newUsers.length === USERS_PER_PAGE);
          setOffset(pageOffset + USERS_PER_PAGE);
        } else {
          throw new Error(response.error || "Failed to fetch users");
        }
      } catch (err) {
        setError("Failed to fetch users");
        console.error("Error fetching users:", err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [USERS_PER_PAGE]
  );

  // Fetch total count
  const fetchTotalCount = useCallback(async () => {
    try {
      const response = await getPublicUsersCount();
      if (response.success && response.data) {
        setTotalCount(response.data.count);
      }
    } catch (err) {
      console.error("Error fetching total count:", err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchUsers(0, false);
    fetchTotalCount();
  }, [fetchUsers, fetchTotalCount]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoadingMore &&
          !isLoading
        ) {
          fetchUsers(offset, true);
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current);
      }
    };
  }, [hasMore, isLoadingMore, isLoading, offset, fetchUsers]);

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

  // Format streak count
  const formatStreak = (streak: number | null) => {
    if (!streak || streak === 0) return "0";
    if (streak >= 100) return `${streak}`;
    if (streak >= 10) return `${streak}`;
    return `${streak}`;
  };

  if (isLoading) {
    return <FeaturedLoading />;
  }

  if (error || !hasProfiles) {
    return (
      <SidebarGroup className="px-0">
        <SidebarGroupContent>
          <div className="group/featured p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <h2 className="text-sm font-semibold text-foreground">
                  Founders
                </h2>
              </div>
              {totalCount !== null && (
                <span className="text-xs text-orange-500">
                  {totalCount} total
                </span>
              )}
            </div>
            {/* Null state */}
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {error ? "Failed to load founders" : "No founders yet"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {error
                    ? "Check your connection and try again"
                    : "Be the first to join the community"}
                </p>
              </div>
              <Button variant="outline" size="sm" className="text-xs" asChild>
                <Link href="/feed/new">
                  <Plus className="h-3 w-3 mr-1" />
                  Join Now
                </Link>
              </Button>
            </div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup className="px-0 h-full scrollbar-hide">
      <SidebarGroupContent>
        <div className="group/featured p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <h2 className="text-sm font-semibold text-foreground">
                Founders
              </h2>
            </div>
            {totalCount !== null && (
              <span className="text-xs text-orange-500">
                {totalCount} total
              </span>
            )}
          </div>

          {/* Mini cards layout - show all profiles with infinite scroll */}
          <div className="space-y-2 overflow-y-auto">
            {profiles.map((profile) => (
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
                      <Image
                        src={profile.avatar}
                        alt={profile.name || ""}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        width={33}
                        height={33}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-medium">
                        {getInitials(profile.name || "")}
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
                  <div className="text-xs font-medium text-blue-600">
                    {formatStreak(profile.currentStreak)}
                  </div>
                  <div className="text-xs text-muted-foreground">streak</div>
                </div>
              </Link>
            ))}

            {/* Loading indicator for infinite scroll */}
            {isLoadingMore && (
              <div
                ref={loadingRef}
                className="flex items-center justify-center p-4"
              >
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-xs text-muted-foreground">
                  Loading more founders...
                </span>
              </div>
            )}

            {/* End of list indicator */}
            {!hasMore && profiles.length > 0 && (
              <div className="flex items-center justify-center p-2">
                <span className="text-xs text-muted-foreground">
                  All founders loaded
                </span>
              </div>
            )}

            {/* Join Now Button - Always visible */}
            <Link
              href="/feed/new"
              className={cn(
                "flex items-center justify-center gap-2 p-2 rounded-lg",
                "border-2 border-dashed border-orange-500/30",
                "hover:border-orange-500/50 hover:bg-orange-50/30 dark:hover:bg-orange-950/30",
                "text-sm text-orange-600 dark:text-orange-400 transition-all duration-200",
                "font-medium"
              )}
            >
              <Plus className="h-4 w-4" />
              <span>Join Now</span>
            </Link>
          </div>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

// Cursor rules applied correctly.
