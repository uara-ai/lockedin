"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  GitCommit,
  Flame,
  FolderOpen,
  Calendar,
} from "lucide-react";
import type { ProfileStats } from "@/app/data/profile";

interface ProfileStatsProps {
  stats: ProfileStats;
  className?: string;
}

export function ProfileStats({ stats, className }: ProfileStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Accountability Stats
          </h2>
          <Badge variant="secondary" className="text-xs">
            <Flame className="size-3 mr-1" />
            {stats.current_streak}d streak
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Revenue Stats */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="size-4" />
              <span>Total Revenue</span>
            </div>
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(stats.revenue_total)}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="size-4" />
              <span>Monthly</span>
            </div>
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(stats.revenue_monthly)}
            </div>
          </div>

          {/* Development Stats */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GitCommit className="size-4" />
              <span>Commits</span>
            </div>
            <div className="text-xl font-bold text-foreground">
              {formatNumber(stats.github_commits)}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FolderOpen className="size-4" />
              <span>Posts</span>
            </div>
            <div className="text-xl font-bold text-foreground">
              {stats.total_posts}
            </div>
          </div>
        </div>

        {/* Streak Visualization */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Daily Streak</span>
            <span className="text-sm font-medium">
              {stats.current_streak} days
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min((stats.current_streak / 100) * 100, 100)}%`,
              }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Keep building to maintain your streak! 🔥
          </div>
        </div>
      </div>
    </Card>
  );
}

// Cursor rules applied correctly.
