import { Suspense } from "react";
import { getBuildersData } from "@/app/data/profile";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  IconBrandGithub,
  IconBrandX,
  IconCornerRightUp,
  IconWorld,
} from "@tabler/icons-react";
import { UsernameMenu } from "@/components/feed";

// This page fetches all builders with daily revalidation
export const revalidate = 3600; // 1 hour

export default async function BuildersPageContent() {
  const limit = 50; // Show more builders on the dedicated page

  // Fetch builders data with efficient caching
  const buildersResponse = await getBuildersData(limit);

  if (!buildersResponse.success) {
    return <BuildersErrorState />;
  }

  const builders = buildersResponse.data;

  return (
    <div className="min-h-screen bg-background max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  All Builders
                </h1>
                <p className="text-muted-foreground">
                  Meet the builders, makers, and founders shipping on Commodo
                </p>
              </div>

              <div className="flex items-center gap-2 sm:mr-20">
                <span className="text-sm text-muted-foreground">
                  <span className="text-primary text-lg font-bold">
                    {builders?.length}
                  </span>{" "}
                  builders joined
                </span>
                <div className="flex flex-col items-center gap-2">
                  <IconCornerRightUp className="size-8 text-primary hidden md:block" />
                  <Link
                    href="/login"
                    className="text-primary font-semibold sm:hidden"
                  >
                    Join now
                  </Link>
                </div>
              </div>
            </div>

            {/* Search Component */}
            <div className="flex justify-center max-w-md mx-auto w-full">
              <UsernameMenu />
            </div>
          </div>
        </div>
      </div>

      {/* Builders Grid */}
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<BuildersLoadingState />}>
          <BuildersGrid builders={builders || []} />
        </Suspense>
      </div>
    </div>
  );
}

// Builders grid component
function BuildersGrid({ builders }: { builders: any[] }) {
  if (builders.length === 0) {
    return <BuildersEmptyState />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {builders.map((builder) => (
        <BuilderCard key={builder.id} builder={builder} />
      ))}
    </div>
  );
}

// Individual builder card component
function BuilderCard({ builder }: { builder: any }) {
  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getActivityStatus = (lastActivity: Date | null) => {
    if (!lastActivity) return { status: "inactive", color: "bg-gray-400" };

    const now = new Date();
    const lastActivityDate = new Date(lastActivity);
    const hoursSinceActivity =
      (now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60);

    if (hoursSinceActivity < 24) {
      return { status: "active", color: "bg-green-500" };
    } else if (hoursSinceActivity < 72) {
      return { status: "recent", color: "bg-yellow-500" };
    } else {
      return { status: "away", color: "bg-gray-400" };
    }
  };

  const activityStatus = getActivityStatus(builder.lastActivityDate);

  return (
    <Link
      href={`/${builder.username}`}
      className={cn(
        "group block p-6 rounded-lg border transition-all duration-200",
        "hover:border-muted-foreground/50 hover:shadow-md",
        "bg-card text-card-foreground"
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <div className="relative">
          <div
            className={cn(
              "w-12 h-12 rounded-lg border-2 overflow-hidden",
              "bg-background transition-all duration-200",
              builder.verified
                ? "border-blue-500/50 group-hover:border-blue-500"
                : "border-border group-hover:border-muted-foreground/50"
            )}
          >
            {builder.avatar ? (
              <Image
                src={builder.avatar}
                alt={builder.name || builder.username || "Builder"}
                className="w-full h-full object-cover"
                width={48}
                height={48}
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
              activityStatus.color
            )}
          />
        </div>

        {/* Name and username */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h3 className="font-semibold text-foreground truncate">
              {builder.name || builder.username}
            </h3>
            {builder.verified && (
              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                <svg
                  className="w-2.5 h-2.5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">@{builder.username}</p>
        </div>
      </div>

      {/* Bio */}
      {builder.bio && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
          {builder.bio}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4 text-center">
        <div>
          <div className="text-lg font-semibold text-foreground">
            {builder.currentStreak || 0}
          </div>
          <div className="text-xs text-muted-foreground">Streak</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-foreground">
            {formatNumber(builder.posts_count)}
          </div>
          <div className="text-xs text-muted-foreground">Posts</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-foreground">
            {formatNumber(builder.followers_count)}
          </div>
          <div className="text-xs text-muted-foreground">Followers</div>
        </div>
      </div>

      {/* Social links */}
      {(builder.githubUsername || builder.xUsername || builder.website) && (
        <div className="flex items-center gap-3 pt-3 border-t">
          {builder.githubUsername && (
            <div className="text-xs text-muted-foreground">
              <IconBrandGithub className="size-4" />
            </div>
          )}
          {builder.xUsername && (
            <div className="text-xs text-muted-foreground">
              <IconBrandX className="size-4" />
            </div>
          )}
          {builder.website && (
            <div className="text-xs text-muted-foreground">
              <IconWorld className="size-4" />
            </div>
          )}
        </div>
      )}
    </Link>
  );
}

// Loading state
function BuildersLoadingState() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="p-6 rounded-lg border bg-card animate-pulse">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-muted rounded" />
            <div className="h-3 bg-muted rounded w-5/6" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="text-center">
                <div className="h-5 bg-muted rounded mb-1" />
                <div className="h-3 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Empty state
function BuildersEmptyState() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
        <Users className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No builders found</h3>
      <p className="text-muted-foreground mb-6">
        Be the first to join the Commodo community
      </p>
      <Button asChild>
        <Link href="/apply">
          <Users className="h-4 w-4 mr-2" />
          Join Now
        </Link>
      </Button>
    </div>
  );
}

// Error state
function BuildersErrorState() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
        <Users className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Failed to load builders</h3>
      <p className="text-muted-foreground mb-6">
        Something went wrong. Please try again later.
      </p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Try Again
      </Button>
    </div>
  );
}

// Cursor rules applied correctly.
