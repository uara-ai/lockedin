"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  GitHubContribution,
  getGitHubErrorMessage,
} from "@/app/data/github-contribution";
import {
  IconBrandGithub,
  IconAlertCircle,
  IconLoader2,
  IconCode,
  IconTrendingUp,
  IconFlame,
} from "@tabler/icons-react";
import {
  ContributionGraph,
  ContributionData,
} from "@/components/smoothui/ui/ContributionGraph";

// Contribution chart variations
export type ContributionVariant = "github" | "commits" | "activity" | "streak";

interface ContributionChartProps {
  contributions?: GitHubContribution[];
  loading?: boolean;
  error?: string | null;
  className?: string;
  variant?: ContributionVariant;
  title?: string;
  year?: number;
}

// Variation configurations
const VARIANT_CONFIG = {
  github: {
    title: "GitHub Activity",
    icon: IconBrandGithub,
    colors: [
      "bg-gray-100 dark:bg-gray-800", // Level 0 - No contributions
      "bg-green-100 dark:bg-green-800", // Level 1 - Light activity
      "bg-green-300 dark:bg-green-600", // Level 2 - Medium activity
      "bg-green-500 dark:bg-green-400", // Level 3 - High activity
      "bg-green-700 dark:bg-green-300", // Level 4 - Max activity
    ] as string[],
    accentColor: "text-green-600 dark:text-green-400",
    hoverRing: "hover:ring-green-500/50",
  },
  commits: {
    title: "Code Commits",
    icon: IconCode,
    colors: [
      "bg-gray-100 dark:bg-gray-800", // Level 0 - No contributions
      "bg-blue-100 dark:bg-blue-800", // Level 1 - Light activity
      "bg-blue-300 dark:bg-blue-600", // Level 2 - Medium activity
      "bg-blue-500 dark:bg-blue-400", // Level 3 - High activity
      "bg-blue-700 dark:bg-blue-300", // Level 4 - Max activity
    ] as string[],
    accentColor: "text-blue-600 dark:text-blue-400",
    hoverRing: "hover:ring-blue-500/50",
  },
  activity: {
    title: "Development Activity",
    icon: IconTrendingUp,
    colors: [
      "bg-gray-100 dark:bg-gray-800", // Level 0 - No contributions
      "bg-purple-100 dark:bg-purple-800", // Level 1 - Light activity
      "bg-purple-300 dark:bg-purple-600", // Level 2 - Medium activity
      "bg-purple-500 dark:bg-purple-400", // Level 3 - High activity
      "bg-purple-700 dark:bg-purple-300", // Level 4 - Max activity
    ] as string[],
    accentColor: "text-purple-600 dark:text-purple-400",
    hoverRing: "hover:ring-purple-500/50",
  },
  streak: {
    title: "Contribution Streak",
    icon: IconFlame,
    colors: [
      "bg-gray-100 dark:bg-gray-800", // Level 0 - No contributions
      "bg-orange-100 dark:bg-orange-800", // Level 1 - Light activity
      "bg-orange-300 dark:bg-orange-600", // Level 2 - Medium activity
      "bg-orange-500 dark:bg-orange-400", // Level 3 - High activity
      "bg-orange-700 dark:bg-orange-300", // Level 4 - Max activity
    ] as string[],
    accentColor: "text-orange-600 dark:text-orange-400",
    hoverRing: "hover:ring-orange-500/50",
  },
};

export function ContributionChart({
  contributions = [],
  loading = false,
  error = null,
  className,
  variant = "github",
  title,
  year = new Date().getFullYear(),
}: ContributionChartProps) {
  // Get configuration for the selected variant
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  // Convert GitHub contributions to ContributionGraph format with normalized levels
  const contributionData: ContributionData[] = useMemo(() => {
    return contributions.map((contrib) => {
      // Normalize GitHub contribution level to our 0-4 scale
      let normalizedLevel = 0;
      if (contrib.count > 0) {
        if (contrib.count >= 20) normalizedLevel = 4;
        else if (contrib.count >= 10) normalizedLevel = 3;
        else if (contrib.count >= 5) normalizedLevel = 2;
        else normalizedLevel = 1;
      }

      return {
        date: contrib.date,
        count: contrib.count,
        level: normalizedLevel,
      };
    });
  }, [contributions]);

  // Debug logging to verify data mapping
  React.useEffect(() => {
    if (contributionData.length > 0) {
      const sampleData = contributionData.slice(0, 10);
      const levelDistribution = contributionData.reduce((acc, item) => {
        acc[item.level] = (acc[item.level] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      console.log(`🎨 ${variant} chart data:`, {
        totalDays: contributionData.length,
        sampleData: sampleData.map((d) => ({
          date: d.date,
          count: d.count,
          level: d.level,
        })),
        levelDistribution,
      });
    }
  }, [contributionData, variant]);

  // Calculate total contributions and stats
  const stats = useMemo(() => {
    const total = contributions.reduce((sum, c) => sum + c.count, 0);
    const activeDays = contributions.filter((c) => c.count > 0).length;
    const maxStreak = calculateMaxStreak(contributions);
    const currentStreak = calculateCurrentStreak(contributions);

    return {
      total,
      activeDays,
      maxStreak,
      currentStreak,
      averagePerDay:
        activeDays > 0 ? Math.round((total / activeDays) * 10) / 10 : 0,
    };
  }, [contributions]);

  // Loading state
  if (loading) {
    return (
      <div className={cn("w-full space-y-4", className)}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-medium text-foreground flex items-center gap-2">
              <Icon className="w-4 h-4" />
              {title || config.title}
            </h3>
            <p className="text-xs text-muted-foreground">Loading...</p>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-8 flex items-center justify-center">
          <div className="text-center space-y-2">
            <IconLoader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Fetching contribution data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("w-full space-y-4", className)}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-medium text-foreground flex items-center gap-2">
              <Icon className="w-4 h-4" />
              {title || config.title}
            </h3>
            <p className="text-xs text-muted-foreground">Error loading data</p>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-8">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center">
              <IconAlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-foreground">
              Unable to Load Data
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {variant === "github"
                ? getGitHubErrorMessage(error)
                : "Failed to load contribution data. Please try again later."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Header with Stats */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-base font-medium text-foreground flex items-center gap-2">
            <Icon className="w-4 h-4" />
            {title || config.title}
          </h3>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className={cn("font-semibold", config.accentColor)}>
              {stats.total.toLocaleString()}
            </span>
            <span>contributions in {year}</span>
            {stats.activeDays > 0 && (
              <>
                <span>•</span>
                <span>{stats.activeDays} active days</span>
              </>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3 text-xs">
          {variant === "streak" && stats.currentStreak > 0 && (
            <div className="text-center">
              <div className={cn("font-bold text-sm", config.accentColor)}>
                {stats.currentStreak}
              </div>
              <div className="text-muted-foreground">current</div>
            </div>
          )}
          {stats.maxStreak > 0 && (
            <div className="text-center">
              <div className={cn("font-bold text-sm", config.accentColor)}>
                {stats.maxStreak}
              </div>
              <div className="text-muted-foreground">max streak</div>
            </div>
          )}
          {stats.averagePerDay > 0 && (
            <div className="text-center">
              <div className={cn("font-bold text-sm", config.accentColor)}>
                {stats.averagePerDay}
              </div>
              <div className="text-muted-foreground">avg/day</div>
            </div>
          )}
        </div>
      </div>

      {/* Contribution Graph */}
      <div className="bg-card border rounded-lg p-6">
        <ContributionGraph
          data={contributionData}
          year={year}
          showLegend={true}
          showTooltips={true}
          colors={config.colors}
          hoverRing={config.hoverRing}
          className={cn("contribution-variant", `variant-${variant}`)}
        />
      </div>
    </div>
  );
}

// Helper functions for streak calculations
function calculateMaxStreak(contributions: GitHubContribution[]): number {
  if (contributions.length === 0) return 0;

  const sortedContribs = [...contributions]
    .filter((c) => c.count > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (sortedContribs.length === 0) return 0;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedContribs.length; i++) {
    const prevDate = new Date(sortedContribs[i - 1].date);
    const currentDate = new Date(sortedContribs[i].date);
    const dayDiff = Math.floor(
      (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (dayDiff === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

function calculateCurrentStreak(contributions: GitHubContribution[]): number {
  if (contributions.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sortedContribs = [...contributions]
    .filter((c) => c.count > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedContribs.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date(today);

  for (const contrib of sortedContribs) {
    const contribDate = new Date(contrib.date);
    contribDate.setHours(0, 0, 0, 0);

    const dayDiff = Math.floor(
      (currentDate.getTime() - contribDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (dayDiff === streak) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// Cursor rules applied correctly.
