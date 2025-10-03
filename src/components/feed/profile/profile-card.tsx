import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin, Link as LinkIcon, Calendar, Flame } from "lucide-react";
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

interface ProfileCardProps {
  profile: UserProfile;
  className?: string;
}

export function ProfileCard({ profile, className }: ProfileCardProps) {
  const formatJoinDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
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
              <Tooltip>
                <TooltipTrigger>
                  <Link href="/profile/verify">
                    <IconCircleDashedCheck className="size-5 text-muted-foreground" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Get verified</TooltipContent>
              </Tooltip>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            @{profile.username || "username"}
          </p>
        </div>
        {/* Action Button */}
        <div className="flex justify-end ml-auto">
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile/edit" className="flex items-center gap-1">
              <IconPencil className="size-4" />
              Edit Profile
            </Link>
          </Button>
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

        {/* Profile Details */}
        <div className="space-y-2 mb-4 text-sm text-muted-foreground flex items-center gap-2">
          {profile.location && (
            <div className="flex items-center gap-2">
              <MapPin className="size-4" />
              <span>{profile.location}</span>
            </div>
          )}
          {profile.website && (
            <div className="flex items-center gap-2">
              <LinkIcon className="size-4" />
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
          {profile.currentStreak > 0 && (
            <div className="flex items-center gap-2">
              <Flame className="size-4 text-orange-500 fill-orange-500" />
              <span>{profile.currentStreak}d</span>
            </div>
          )}
          {/* Social Links */}
          {(profile.githubUsername || profile.xUsername) && (
            <div className="flex gap-3">
              {profile.githubUsername && (
                <a
                  href={`https://github.com/${profile.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <IconBrandGithubFilled className="size-4" />
                </a>
              )}
              {profile.xUsername && (
                <a
                  href={`https://x.com/${profile.xUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <IconBrandX className="size-4" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-foreground">
              {formatNumber(profile.following_count)}
            </span>
            <span className="text-muted-foreground">Following</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-foreground">
              {formatNumber(profile.followers_count)}
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
