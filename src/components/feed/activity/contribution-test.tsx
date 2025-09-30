"use client";

import React from "react";
import { ContributionChart } from "./contribution-chart";
import { GitHubContribution } from "@/app/data/github-contribution";

// Test component to verify color visibility across all levels
export function ContributionTest() {
  // Generate test data with all activity levels
  const testData: GitHubContribution[] = generateTestData();

  return (
    <div className="space-y-8 p-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">
          GitHub Contribution Chart - Color Test
        </h2>
        <p className="text-muted-foreground">
          This chart should show all 5 contribution levels clearly visible in
          both light and dark modes.
        </p>
      </div>

      {/* GitHub Variation Test */}
      <ContributionChart
        contributions={testData}
        variant="github"
        className="w-full"
      />

      {/* Color Legend Test */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3">Color Level Test</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Level 0:</span>
          <div className="w-4 h-4 rounded-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600" />
          <span className="text-xs text-muted-foreground">Level 1:</span>
          <div className="w-4 h-4 rounded-sm bg-green-100 dark:bg-green-800 border border-gray-300 dark:border-gray-600" />
          <span className="text-xs text-muted-foreground">Level 2:</span>
          <div className="w-4 h-4 rounded-sm bg-green-300 dark:bg-green-600 border border-gray-300 dark:border-gray-600" />
          <span className="text-xs text-muted-foreground">Level 3:</span>
          <div className="w-4 h-4 rounded-sm bg-green-500 dark:bg-green-400 border border-gray-300 dark:border-gray-600" />
          <span className="text-xs text-muted-foreground">Level 4:</span>
          <div className="w-4 h-4 rounded-sm bg-green-700 dark:bg-green-300 border border-gray-300 dark:border-gray-600" />
        </div>
      </div>
    </div>
  );
}

// Generate test data with all activity levels represented
function generateTestData(): GitHubContribution[] {
  const contributions: GitHubContribution[] = [];
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    // Create a pattern that ensures all levels are represented
    let count = 0;
    let level = 0;

    const dayOfYear = i % 365;
    const pattern = dayOfYear % 5; // Cycle through levels 0-4

    switch (pattern) {
      case 0:
        count = 0;
        level = 0;
        break;
      case 1:
        count = Math.floor(Math.random() * 3) + 1; // 1-3 contributions
        level = 1;
        break;
      case 2:
        count = Math.floor(Math.random() * 4) + 4; // 4-7 contributions
        level = 2;
        break;
      case 3:
        count = Math.floor(Math.random() * 4) + 8; // 8-11 contributions
        level = 3;
        break;
      case 4:
        count = Math.floor(Math.random() * 5) + 12; // 12-16 contributions
        level = 4;
        break;
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
