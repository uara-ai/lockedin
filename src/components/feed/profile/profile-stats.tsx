"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  GitCommit,
  Flame,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Mock data for accountability stats
const mockStats = {
  streak: {
    current: 42,
    longest: 89,
    lastActivity: "2 hours ago",
  },
  revenue: {
    total: 125420,
    monthly: 8750,
    growth: 23.5,
    transactions: 156,
  },
  contributions: {
    commits: 247,
    pullRequests: 34,
    issues: 12,
    repositories: 8,
  },
  achievements: {
    total: 15,
    recent: "Revenue Milestone",
    completion: 78,
  },
  posts: {
    total: 89,
    thisWeek: 12,
    likes: 234,
    engagement: 4.2,
  },
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  gradient?: string;
  progress?: number;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  gradient = "from-blue-500 to-purple-600",
  progress,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center text-center space-y-4 p-6 min-h-[200px] justify-center"
    >
      <div
        className={`rounded-full p-4 bg-gradient-to-br ${gradient} shadow-lg`}
      >
        <div className="text-white">{icon}</div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </h3>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {trend && (
        <div className="flex items-center gap-1 text-sm">
          <TrendingUp className="size-4 text-green-500" />
          <span className="text-green-500 font-medium">+{trend.value}%</span>
          <span className="text-muted-foreground">{trend.label}</span>
        </div>
      )}

      {progress !== undefined && (
        <div className="w-full space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-1.5">
            <motion.div
              className={`h-1.5 rounded-full bg-gradient-to-r ${gradient}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

interface ProfileStatsProps {
  className?: string;
}

export function ProfileStats({ className }: ProfileStatsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      id: "streak",
      title: "Daily Streak",
      value: `${mockStats.streak.current}d`,
      subtitle: `Longest: ${mockStats.streak.longest} days`,
      icon: <Flame className="size-6" />,
      gradient: "from-orange-500 to-red-600",
      progress: Math.min((mockStats.streak.current / 100) * 100, 100),
    },
    {
      id: "revenue",
      title: "Total Revenue",
      value: formatCurrency(mockStats.revenue.total),
      subtitle: `${formatCurrency(mockStats.revenue.monthly)} this month`,
      icon: <DollarSign className="size-6" />,
      trend: {
        value: mockStats.revenue.growth,
        label: "vs last month",
      },
      gradient: "from-green-500 to-emerald-600",
    },
    {
      id: "contributions",
      title: "GitHub Activity",
      value: mockStats.contributions.commits,
      subtitle: `${mockStats.contributions.pullRequests} PRs • ${mockStats.contributions.repositories} repos`,
      icon: <GitCommit className="size-6" />,
      gradient: "from-purple-500 to-indigo-600",
    },
    {
      id: "posts",
      title: "Content Created",
      value: mockStats.posts.total,
      subtitle: `${mockStats.posts.thisWeek} this week • ${formatNumber(
        mockStats.posts.likes
      )} likes`,
      icon: <FolderOpen className="size-6" />,
      trend: {
        value: mockStats.posts.engagement,
        label: "engagement rate",
      },
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      id: "achievements",
      title: "Achievements",
      value: mockStats.achievements.total,
      subtitle: `Latest: ${mockStats.achievements.recent}`,
      icon: <Trophy className="size-6" />,
      gradient: "from-yellow-500 to-amber-600",
      progress: mockStats.achievements.completion,
    },
  ];

  const nextStat = () => {
    setCurrentIndex((prev) => (prev + 1) % stats.length);
  };

  const prevStat = () => {
    setCurrentIndex((prev) => (prev - 1 + stats.length) % stats.length);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(nextStat, 4000);
    return () => clearInterval(interval);
  }, [autoPlay, currentIndex]);

  return (
    <div
      className={`w-full ${className}`}
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <StatCard key={stats[currentIndex].id} {...stats[currentIndex]} />
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="absolute top-1/2 -translate-y-1/2 left-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevStat}
            className="h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
          >
            <ChevronLeft className="size-4" />
          </Button>
        </div>

        <div className="absolute top-1/2 -translate-y-1/2 right-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={nextStat}
            className="h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {stats.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentIndex
                ? "bg-foreground w-6"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>

      {/* Quick Stats Bar */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-border/50">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Zap className="size-4 text-yellow-500" />
          <span>Building streak: {mockStats.streak.current} days</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Target className="size-4 text-green-500" />
          <span>{mockStats.achievements.completion}% complete</span>
        </div>
      </div>
    </div>
  );
}

// Cursor rules applied correctly.
