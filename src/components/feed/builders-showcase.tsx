"use client";

import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Plus,
  User,
  Loader2,
  Users,
  Calendar,
  Flame,
  Award,
  GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  IconRosetteDiscountCheck,
  IconBrandGithub,
  IconBrandX,
} from "@tabler/icons-react";
import Image from "next/image";
import { UserProfile } from "@/app/data/profile";

interface BuildersShowcaseProps {
  initialData?: UserProfile[];
  className?: string;
}

export function BuildersShowcase({
  initialData = [],
  className,
}: BuildersShowcaseProps) {
  const [builders, setBuilders] = useState<UserProfile[]>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData.length);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData.length > 0) {
      setBuilders(initialData);
      setIsLoading(false);
      return;
    }

    const fetchBuilders = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // In a real app, this would be an API call to your backend
        const response = await fetch("/api/builders");
        if (!response.ok) throw new Error("Failed to fetch builders");

        const data = await response.json();
        setBuilders(data);
      } catch (err) {
        setError("Failed to fetch builders");
        console.error("Error fetching builders:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuilders();
  }, [initialData]);

  const hasBuilders = builders.length > 0;

  // Generate initials from name
  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format numbers
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Format join date
  const formatJoinDate = (date: Date) => {
    const now = new Date();
    const joinDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Joined today";
    if (diffDays < 30) return `${diffDays}d ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}yr ago`;
  };

  // Get activity status
  const getActivityStatus = (
    lastActivity: Date | null,
    currentStreak: number
  ) => {
    if (!lastActivity) return { status: "inactive", color: "text-gray-400" };

    const now = new Date();
    const lastActivityDate = new Date(lastActivity);
    const hoursSinceActivity =
      (now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60);

    if (hoursSinceActivity < 24) {
      return { status: "active", color: "text-green-500" };
    } else if (hoursSinceActivity < 72) {
      return { status: "recent", color: "text-yellow-500" };
    } else {
      return { status: "away", color: "text-gray-400" };
    }
  };

  if (isLoading) {
    return (
      <SidebarGroup className={cn("px-0", className)}>
        <SidebarGroupContent>
          <div className="group/builders p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-foreground">
                All Builders
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

  if (error || !hasBuilders) {
    return (
      <SidebarGroup className={cn("px-0", className)}>
        <SidebarGroupContent>
          <div className="group/builders p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-foreground">
                All Builders
              </h2>
            </div>
            {/* Null state */}
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {error ? "Failed to load builders" : "No builders yet"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {error
                    ? "Check your connection and try again"
                    : "Be the first to join"}
                </p>
              </div>
              <Button variant="outline" size="sm" className="text-xs" asChild>
                <Link href="/apply">
                  <Users className="h-3 w-3 mr-1" />
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
    <SidebarGroup className={cn("px-0", className)}>
      <SidebarGroupContent>
        <div className="group/builders p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-foreground">
                All Builders
              </h2>
            </div>
            <span className="text-xs text-muted-foreground">
              {builders.length} builder{builders.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Builder cards layout */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {builders.map((builder) => {
              const activityStatus = getActivityStatus(
                builder.lastActivityDate,
                builder.currentStreak
              );

              return (
                <Link
                  key={builder.id}
                  href={`/${builder.username}`}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg transition-all duration-200",
                    "hover:bg-muted/50 cursor-pointer group/builder",
                    "border border-transparent hover:border-border"
                  )}
                >
                  {/* Avatar with activity indicator */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg border-2 overflow-hidden",
                        "bg-background transition-all duration-200",
                        builder.verified
                          ? "border-blue-500/50 hover:border-blue-500"
                          : "border-border hover:border-muted-foreground/50"
                      )}
                    >
                      {builder.avatar ? (
                        <Image
                          src={builder.avatar}
                          alt={builder.name || builder.username || "Builder"}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          width={40}
                          height={40}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-medium">
                          {getInitials(builder.name)}
                        </div>
                      )}
                    </div>

                    {/* Activity indicator */}
                    <div
                      className={cn(
                        "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background",
                        activityStatus.status === "active"
                          ? "bg-green-500"
                          : activityStatus.status === "recent"
                          ? "bg-yellow-500"
                          : "bg-gray-400"
                      )}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    {/* Header */}
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-foreground truncate">
                        {builder.name || builder.username}
                      </span>
                      {builder.verified && (
                        <IconRosetteDiscountCheck className="h-3 w-3 fill-blue-500 flex-shrink-0" />
                      )}
                    </div>

                    {/* Username and join date */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="truncate">@{builder.username}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatJoinDate(builder.joinedAt)}
                      </span>
                    </div>

                    {/* Bio */}
                    {builder.bio && (
                      <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                        {builder.bio}
                      </p>
                    )}

                    {/* Stats row */}
                    <div className="flex items-center gap-3 text-xs">
                      {/* Streak */}
                      {builder.currentStreak > 0 && (
                        <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                          <Flame className="h-3 w-3" />
                          <span className="font-medium">
                            {builder.currentStreak}
                          </span>
                        </div>
                      )}

                      {/* Posts */}
                      {builder.posts_count > 0 && (
                        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          <GitBranch className="h-3 w-3" />
                          <span className="font-medium">
                            {formatNumber(builder.posts_count)}
                          </span>
                        </div>
                      )}

                      {/* Followers */}
                      {builder.followers_count > 0 && (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <Users className="h-3 w-3" />
                          <span className="font-medium">
                            {formatNumber(builder.followers_count)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Social links */}
                    {(builder.githubUsername || builder.xUsername) && (
                      <div className="flex items-center gap-2">
                        {builder.githubUsername && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <IconBrandGithub className="h-3 w-3" />
                            <span className="truncate max-w-20">
                              {builder.githubUsername}
                            </span>
                          </div>
                        )}
                        {builder.xUsername && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <IconBrandX className="h-3 w-3" />
                            <span className="truncate max-w-20">
                              {builder.xUsername}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Join CTA */}
          <Link
            href="/apply"
            className={cn(
              "flex items-center justify-center gap-2 p-3 rounded-lg",
              "border-2 border-dashed border-blue-500/30",
              "hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-950/30",
              "text-sm text-blue-600 dark:text-blue-400 transition-all duration-200",
              "font-medium"
            )}
          >
            <Users className="h-4 w-4" />
            <span>Join the Community</span>
          </Link>

          {/* View More Button */}
          {builders.length >= 10 && (
            <Link
              href="/builders"
              className={cn(
                "flex items-center justify-center gap-2 p-2 rounded-lg",
                "border-2 border-dashed border-muted-foreground/30",
                "hover:border-muted-foreground/50 hover:bg-muted/30",
                "text-sm text-muted-foreground transition-all duration-200"
              )}
            >
              <Plus className="h-4 w-4" />
              <span>View All Builders</span>
            </Link>
          )}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

// Cursor rules applied correctly.
