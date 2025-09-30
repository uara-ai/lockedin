"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  GitHubContribution,
  getGitHubErrorMessage,
} from "@/app/data/github-contribution";
import {
  IconBrandGithub,
  IconAlertCircle,
  IconLoader2,
} from "@tabler/icons-react";

interface ContributionChartProps {
  contributions?: GitHubContribution[];
  loading?: boolean;
  error?: string | null;
  className?: string;
}

interface QuarterData {
  quarter: string;
  period: string;
  totalContributions: number;
  activeDays: number;
  averagePerDay: number;
  level: number; // 0-4 based on activity
}

interface MonthData {
  month: string;
  totalContributions: number;
  activeDays: number;
  level: number;
}

export function ContributionChart({
  contributions = [],
  loading = false,
  error = null,
  className,
}: ContributionChartProps) {
  const [viewMode, setViewMode] = useState<"quarterly" | "monthly">(
    "quarterly"
  );

  // Loading state
  if (loading) {
    return (
      <div className={cn("w-full space-y-4", className)}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-medium text-foreground flex items-center gap-1">
              <IconBrandGithub className="w-4 h-4" />
              GitHub Activity
            </h3>
            <p className="text-xs text-muted-foreground">Loading...</p>
          </div>
        </div>
        <div className="bg-transparent border rounded-lg p-8 flex items-center justify-center">
          <div className="text-center space-y-2">
            <IconLoader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Fetching GitHub data...
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
            <h3 className="text-base font-medium text-foreground flex items-center gap-1">
              <IconBrandGithub className="w-4 h-4" />
              GitHub Activity
            </h3>
            <p className="text-xs text-muted-foreground">Error loading data</p>
          </div>
        </div>
        <div className="bg-transparent border rounded-lg p-8">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center">
              <IconAlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-foreground">
              Unable to Load GitHub Data
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {getGitHubErrorMessage(error)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Process contributions into quarterly data
  const processQuarterlyData = (): QuarterData[] => {
    const currentYear = new Date().getFullYear();
    const quarters = [
      { q: "Q1", months: [0, 1, 2], period: `Jan - Mar ${currentYear}` },
      { q: "Q2", months: [3, 4, 5], period: `Apr - Jun ${currentYear}` },
      { q: "Q3", months: [6, 7, 8], period: `Jul - Sep ${currentYear}` },
      { q: "Q4", months: [9, 10, 11], period: `Oct - Dec ${currentYear}` },
    ];

    return quarters.map(({ q, months, period }) => {
      const quarterContribs = contributions.filter((contrib) => {
        const date = new Date(contrib.date);
        return (
          date.getFullYear() === currentYear && months.includes(date.getMonth())
        );
      });

      const totalContributions = quarterContribs.reduce(
        (sum, c) => sum + c.count,
        0
      );
      const activeDays = quarterContribs.filter((c) => c.count > 0).length;
      const averagePerDay =
        activeDays > 0 ? totalContributions / activeDays : 0;

      // Calculate activity level based on total contributions
      let level = 0;
      if (totalContributions >= 300) level = 4;
      else if (totalContributions >= 200) level = 3;
      else if (totalContributions >= 100) level = 2;
      else if (totalContributions >= 50) level = 1;

      return {
        quarter: q,
        period,
        totalContributions,
        activeDays,
        averagePerDay: Math.round(averagePerDay * 10) / 10,
        level,
      };
    });
  };

  // Process contributions into monthly data
  const processMonthlyData = (): MonthData[] => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const currentYear = new Date().getFullYear();

    return months.map((month, index) => {
      const monthContribs = contributions.filter((contrib) => {
        const date = new Date(contrib.date);
        return date.getFullYear() === currentYear && date.getMonth() === index;
      });

      const totalContributions = monthContribs.reduce(
        (sum, c) => sum + c.count,
        0
      );
      const activeDays = monthContribs.filter((c) => c.count > 0).length;

      // Calculate level based on contributions
      let level = 0;
      if (totalContributions >= 100) level = 4;
      else if (totalContributions >= 60) level = 3;
      else if (totalContributions >= 30) level = 2;
      else if (totalContributions >= 10) level = 1;

      return {
        month,
        totalContributions,
        activeDays,
        level,
      };
    });
  };

  // Get color based on activity level
  const getActivityColor = (level: number): string => {
    switch (level) {
      case 0:
        return "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800";
      case 1:
        return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900";
      case 2:
        return "bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-800";
      case 3:
        return "bg-green-200 dark:bg-green-800 border-green-400 dark:border-green-700";
      case 4:
        return "bg-green-300 dark:bg-green-700 border-green-500 dark:border-green-600";
      default:
        return "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800";
    }
  };

  const getActivityTextColor = (level: number): string => {
    return "text-gray-900 dark:text-gray-100";
  };

  const quarterlyData = processQuarterlyData();
  const monthlyData = processMonthlyData();
  const totalContributions = contributions.reduce((sum, c) => sum + c.count, 0);
  const totalActiveDays = contributions.filter((c) => c.count > 0).length;

  console.log("📊 Chart data:", {
    totalContributions,
    totalActiveDays,
    quarterlyData,
    viewMode,
  });

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-medium text-foreground flex items-center gap-1">
            <IconBrandGithub className="w-4 h-4" />
            GitHub Activity
          </h3>
          <p className="text-xs text-muted-foreground">
            <span className="text-primary">
              {totalContributions.toLocaleString()}
            </span>{" "}
            contributions
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
          <button
            onClick={() => setViewMode("quarterly")}
            className={cn(
              "px-2 py-1 rounded-sm text-xs font-medium transition-all",
              viewMode === "quarterly"
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Quarterly
          </button>
          <button
            onClick={() => setViewMode("monthly")}
            className={cn(
              "px-2 py-1 rounded-sm text-xs font-medium transition-all",
              viewMode === "monthly"
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Chart Content */}
      <div className="bg-transparent border rounded-lg p-4">
        {viewMode === "quarterly" ? (
          /* Quarterly View */
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quarterlyData.map((quarter) => (
              <div
                key={quarter.quarter}
                className={cn(
                  "relative group p-4 rounded-lg border transition-all hover:shadow-md",
                  getActivityColor(quarter.level)
                )}
              >
                <div className="space-y-3">
                  {/* Quarter Header */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-foreground">
                      {quarter.quarter}
                    </div>
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        quarter.level >= 3
                          ? "bg-green-500"
                          : quarter.level >= 1
                          ? "bg-green-300"
                          : "bg-gray-300"
                      )}
                    />
                  </div>

                  {/* Main Metric */}
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {quarter.totalContributions.toLocaleString()}
                    </div>
                    <div className="text-xs text-primary">contributions</div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-primary">Activity</span>
                      <span className="text-primary font-medium">
                        {quarter.activeDays}/90 days
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className={cn(
                          "h-1.5 rounded-full transition-all",
                          quarter.level >= 3
                            ? "bg-green-500"
                            : quarter.level >= 1
                            ? "bg-green-300"
                            : "bg-gray-400"
                        )}
                        style={{
                          width: `${Math.min(
                            (quarter.activeDays / 90) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Average */}
                  <div className="text-xs text-primary">
                    {quarter.averagePerDay} avg/day
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Monthly View */
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {monthlyData.map((month) => (
              <div
                key={month.month}
                className={cn(
                  "relative group p-3 rounded-lg border text-center transition-all hover:shadow-sm",
                  getActivityColor(month.level)
                )}
              >
                <div className="space-y-2">
                  {/* Month Header */}
                  <div className="flex items-center justify-center">
                    <div className="text-xs font-semibold text-foreground">
                      {month.month}
                    </div>
                  </div>

                  {/* Main Metric */}
                  <div>
                    <div className="text-xl font-bold text-foreground">
                      {month.totalContributions}
                    </div>
                    <div className="text-[10px] text-primary">
                      contributions
                    </div>
                  </div>

                  {/* Mini Progress Indicator */}
                  <div className="flex justify-center">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-1 h-1 rounded-full",
                            i < month.level
                              ? "bg-green-500"
                              : "bg-gray-300 dark:bg-gray-600"
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Active Days */}
                  <div className="text-[10px] text-primary">
                    {month.activeDays} days
                  </div>
                </div>

                {/* Level Indicator */}
                <div className="absolute top-1 right-1">
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      month.level >= 3
                        ? "bg-green-500"
                        : month.level >= 1
                        ? "bg-green-300"
                        : "bg-gray-300"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Activity Legend */}
        <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t">
          <span className="text-xs text-muted-foreground">Less</span>
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn(
                  "w-3 h-3 rounded-sm border",
                  getActivityColor(level)
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">More</span>
        </div>
      </div>
    </div>
  );
}

// Cursor rules applied correctly.
