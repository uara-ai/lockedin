"use server";

import type { ActionResponse } from "@/actions/types/action-response";
import { appErrors } from "@/actions/types/errors";

export interface GitHubContributor {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: string;
  company?: string;
  tier?: string; // Added for tier-based styling
}

export async function getGitHubContributors(): Promise<
  ActionResponse<GitHubContributor[]>
> {
  try {
    const response = await fetch(
      "https://api.github.com/repos/uara-ai/lockedin/contributors",
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "lockedin-app",
          ...(process.env.GITHUB_TOKEN && {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
          }),
        },
        next: {
          revalidate: 3600, // Cache for 1 hour
        },
      }
    );

    if (!response.ok) {
      console.error("GitHub API error:", response.status, response.statusText);
      return {
        success: false,
        error: appErrors.UNEXPECTED_ERROR,
      };
    }

    const contributors: GitHubContributor[] = await response.json();

    // Filter out bots and sort by contributions
    const filteredContributors = contributors
      .filter((contributor) => contributor.type !== "Bot")
      .sort((a, b) => b.contributions - a.contributions);

    // Add tier information based on contributions
    const contributorsWithTiers = filteredContributors.map((contributor) => {
      let tier = "Bronze";
      if (contributor.contributions >= 50) {
        tier = "Gold";
      } else if (contributor.contributions >= 10) {
        tier = "Silver";
      }

      return {
        ...contributor,
        tier,
      };
    });

    return {
      success: true,
      data: contributorsWithTiers,
    };
  } catch (error) {
    console.error("Error fetching GitHub contributors:", error);
    return {
      success: false,
      error: appErrors.UNEXPECTED_ERROR,
    };
  }
}
