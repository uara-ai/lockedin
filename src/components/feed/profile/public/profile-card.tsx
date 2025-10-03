"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  Flame,
  MessageCircle,
  UserPlus,
  UserMinus,
  Loader2,
} from "lucide-react";
import type { UserProfile } from "@/app/data/profile";
import {
  IconBrandGithubFilled,
  IconBrandX,
  IconCircleDashedCheck,
  IconPencil,
  IconRosetteDiscountCheck,
} from "@tabler/icons-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { useState, useTransition, useEffect, useCallback } from "react";
import { toggleFollow, checkFollowStatus } from "@/app/data/follows";
import { toast } from "sonner";
import { TextRoll } from "@/components/ui/text-roll";

interface ProfileCardProps {
  profile: UserProfile;
  className?: string;
  isPublic?: boolean;
  initialIsFollowing?: boolean;
  initialFollowersCount?: number;
}

export function ProfileCard({
  profile,
  className,
  isPublic = false,
  initialIsFollowing = false,
  initialFollowersCount,
}: ProfileCardProps) {
  const formatNumber = useCallback((num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }, []);

  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(
    initialFollowersCount ?? profile.followers_count
  );
  const [isPending, startTransition] = useTransition();
  const [shouldAnimateCount, setShouldAnimateCount] = useState(false);
  const [displayCount, setDisplayCount] = useState(
    formatNumber(initialFollowersCount ?? profile.followers_count)
  );
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Effect to check current follow status on mount and profile change
  useEffect(() => {
    const checkCurrentFollowStatus = async () => {
      if (!isPublic || !profile.id) return;

      setIsCheckingStatus(true);
      try {
        const result = await checkFollowStatus(profile.id);
        if (result.success && result.data) {
          setIsFollowing(result.data.isFollowing);
        } else if (
          result.error === "You must be logged in to perform this action"
        ) {
          // User is not authenticated, don't show follow button as enabled
          setIsFollowing(false);
        }
      } catch (error) {
        console.error("Error checking follow status:", error);
        // Keep the initial state if check fails
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkCurrentFollowStatus();
  }, [profile.id, isPublic]);

  // Effect to animate followers count when it changes
  useEffect(() => {
    const newFormattedCount = formatNumber(followersCount);
    if (newFormattedCount !== displayCount) {
      setShouldAnimateCount(true);
      // Update display count after a brief delay to allow animation
      const timer = setTimeout(() => {
        setDisplayCount(newFormattedCount);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [followersCount, displayCount, formatNumber]);

  const handleFollowToggle = () => {
    if (!isPublic || isCheckingStatus) return;

    // Store previous state for rollback on error
    const previousFollowState = isFollowing;
    const previousFollowersCount = followersCount;

    startTransition(async () => {
      try {
        const result = await toggleFollow(profile.id);

        if (result.success && result.data) {
          setIsFollowing(result.data.isFollowing);
          setFollowersCount(result.data.followersCount);

          toast.success(
            result.data.isFollowing
              ? `You are now following ${profile.name || profile.username}`
              : `You unfollowed ${profile.name || profile.username}`
          );
        } else {
          // Rollback on error
          setIsFollowing(previousFollowState);
          setFollowersCount(previousFollowersCount);
          toast.error(result.error || "Failed to update follow status");
        }
      } catch (error) {
        console.error("Follow toggle error:", error);
        // Rollback on error
        setIsFollowing(previousFollowState);
        setFollowersCount(previousFollowersCount);
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  const formatJoinDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Avatar */}
      <div className="mb-4 flex items-center gap-2">
        <Avatar className="size-20 border-4 border-background sm:size-24">
          <AvatarImage
            src={profile.avatar || undefined}
            alt={profile.name || "User"}
          />
          <AvatarFallback>
            {profile.name
              ? profile.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
              : "U"}
          </AvatarFallback>
        </Avatar>
        {/* Name and Username */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">
              {profile.name || "Unknown User"}
            </h1>
            {profile.verified ? (
              <Tooltip>
                <TooltipTrigger>
                  <IconRosetteDiscountCheck className="size-5 fill-blue-500 text-white" />
                </TooltipTrigger>
                <TooltipContent>Verified</TooltipContent>
              </Tooltip>
            ) : (
              !isPublic && (
                <Tooltip>
                  <TooltipTrigger>
                    <Link href="/profile/verify">
                      <IconCircleDashedCheck className="size-5 text-muted-foreground" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Get verified</TooltipContent>
                </Tooltip>
              )
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            @{profile.username || "username"}
          </p>
        </div>
        {/* Action Buttons */}
        <div className="flex justify-end ml-auto gap-2">
          {isPublic && (
            <>
              <Button
                size="sm"
                variant={isFollowing ? "outline" : "default"}
                className="rounded-full min-w-[80px]"
                onClick={handleFollowToggle}
                disabled={isPending || isCheckingStatus}
              >
                {isPending || isCheckingStatus ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isFollowing ? (
                  <>
                    <UserMinus className="size-4 mr-1" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="size-4 mr-1" />
                    Follow
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div>
        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-foreground mb-3 leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Profile Details - Mobile First Design */}
        <div className="mb-4 space-y-3">
          {/* First Row: Location, Website, Streak */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {profile.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="size-4 shrink-0" />
                <span className="truncate max-w-[150px] sm:max-w-none">
                  {profile.location}
                </span>
              </div>
            )}
            {profile.website && (
              <div className="flex items-center gap-1.5">
                <LinkIcon className="size-4 shrink-0" />
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline truncate max-w-[120px] sm:max-w-none"
                >
                  {profile.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
            {profile.currentStreak > 0 && (
              <div className="flex items-center gap-1.5">
                <Flame className="size-4 text-orange-500 fill-orange-500 shrink-0" />
                <span className="whitespace-nowrap">
                  {profile.currentStreak} day streak
                </span>
              </div>
            )}
          </div>

          {/* Second Row: Social Links and Join Date */}
          <div className="flex items-center justify-between">
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {profile.githubUsername && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={`https://github.com/${profile.githubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <IconBrandGithubFilled className="size-4" />
                      <span className="text-xs hidden sm:inline">
                        @{profile.githubUsername}
                      </span>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>GitHub: @{profile.githubUsername}</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {profile.xUsername && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={`https://x.com/${profile.xUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <IconBrandX className="size-4" />
                      <span className="text-xs hidden sm:inline">
                        @{profile.xUsername}
                      </span>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>X (Twitter): @{profile.xUsername}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Join Date */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="size-4 shrink-0" />
              <span className="whitespace-nowrap">
                Joined {formatJoinDate(profile.joinedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Stats - Mobile Responsive */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-foreground">
              {formatNumber(profile.following_count)}
            </span>
            <span className="text-muted-foreground">Following</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-foreground">
              {shouldAnimateCount ? (
                <TextRoll
                  duration={0.3}
                  className="inline-block"
                  onAnimationComplete={() => setShouldAnimateCount(false)}
                >
                  {displayCount}
                </TextRoll>
              ) : (
                displayCount
              )}
            </span>
            <span className="text-muted-foreground">Followers</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-foreground">
              {formatNumber(profile.posts_count)}
            </span>
            <span className="text-muted-foreground">Posts</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cursor rules applied correctly.
