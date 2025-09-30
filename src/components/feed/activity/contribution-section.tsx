"use client";

import React from "react";
import { ContributionChart } from "./contribution-chart";
import { GitHubContribution } from "@/app/data/github-contribution";

interface ContributionSectionProps {
  contributions: GitHubContribution[] | null;
  loading?: boolean;
  error?: string | null;
  className?: string;
  showConnectPrompt?: boolean;
  isPublic?: boolean;
}

export function ContributionSection({
  contributions,
  loading = false,
  error = null,
  className = "",
  showConnectPrompt = true,
  isPublic = false,
}: ContributionSectionProps) {
  // If no GitHub data available
  if (!contributions && !loading) {
    return (
      <div className={`space-y-8 ${className}`}>
        <div className="bg-card border rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">No GitHub Data</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {isPublic
              ? "This user hasn't connected their GitHub account"
              : "Connect your GitHub account to see contribution statistics"}
          </p>
          {!isPublic && showConnectPrompt && (
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
              Connect GitHub
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* GitHub Variation */}
      <ContributionChart
        contributions={contributions || []}
        loading={loading}
        error={error}
        variant="github"
        className="w-full"
      />

      {/* Add revenues ?
      <ContributionChart
        contributions={contributions || []}
        loading={loading}
        error={error}
        variant="commits"
        title="Daily Commits"
        className="w-full"
      />*/}

      {/* Add health data ?\ 
      <ContributionChart
        contributions={contributions || []}
        loading={loading}
        error={error}
        variant="activity"
        className="w-full"
      />*/}

      {/* Add streak on socials ?
      <ContributionChart
        contributions={contributions || []}
        loading={loading}
        error={error}
        variant="streak"
        className="w-full"
      />*/}
    </div>
  );
}

// Cursor rules applied correctly.
