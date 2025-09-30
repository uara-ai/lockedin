"use client";

import React from "react";
import { ContributionChart } from "./contribution-chart";
import { GitHubContribution } from "@/app/data/github-contribution";

// Example component showing different variations
export function ContributionExamples() {
  // Mock data for demonstration
  const mockData: GitHubContribution[] = generateMockContributions();

  return (
    <div className="space-y-8">
      {/* GitHub Variation */}
      <ContributionChart
        contributions={mockData}
        variant="github"
        className="w-full"
      />

      {/* Commits Variation */}
      <ContributionChart
        contributions={mockData}
        variant="commits"
        title="Daily Commits"
        className="w-full"
      />

      {/* Activity Variation */}
      <ContributionChart
        contributions={mockData}
        variant="activity"
        className="w-full"
      />

      {/* Streak Variation */}
      <ContributionChart
        contributions={mockData}
        variant="streak"
        className="w-full"
      />
    </div>
  );
}

// Helper function to generate mock data
function generateMockContributions(): GitHubContribution[] {
  const contributions: GitHubContribution[] = [];
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const count = Math.random() > 0.7 ? Math.floor(Math.random() * 25) : 0;
    let level = 0;

    // Use same mapping as the main component
    if (count > 0) {
      if (count >= 20) level = 4;
      else if (count >= 10) level = 3;
      else if (count >= 5) level = 2;
      else level = 1;
    }

    contributions.push({
      date: date.toISOString().split("T")[0],
      count,
      level,
    });
  }

  return contributions;
}

// Cursor rules applied correctly.
