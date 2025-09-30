import { ActionResponse } from "./types/action-response";

export interface GitHubContribution {
  date: string;
  count: number;
  level: number; // 0-4 intensity level
}

export interface GitHubContributionData {
  contributions: GitHubContribution[];
  totalContributions: number;
}

export interface GitHubContributionState {
  data: GitHubContributionData | null;
  loading: boolean;
  error: string | null;
}

interface CachedContributionData {
  data: GitHubContributionData;
  timestamp: number;
  username: string;
}

// In-memory cache for GitHub contributions
const contributionCache = new Map<string, CachedContributionData>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Check if cached data is still valid (less than 1 hour old)
 */
function isCacheValid(cachedData: CachedContributionData): boolean {
  const now = Date.now();
  return now - cachedData.timestamp < CACHE_DURATION;
}

/**
 * Get cached data if available and valid
 */
function getCachedData(username: string): GitHubContributionData | null {
  const cached = contributionCache.get(username);
  if (cached && isCacheValid(cached)) {
    console.log("🔄 Using cached GitHub data for:", username);
    return cached.data;
  }
  return null;
}

/**
 * Cache the GitHub contribution data
 */
function setCachedData(username: string, data: GitHubContributionData): void {
  contributionCache.set(username, {
    data,
    timestamp: Date.now(),
    username,
  });
  console.log("💾 Cached GitHub data for:", username);
}

/**
 * Fetch GitHub contribution data for a user
 * Returns last 365 days of contribution data
 * Cached for 1 hour to improve performance
 */
export async function fetchGitHubContributions(
  username: string
): Promise<ActionResponse<GitHubContributionData>> {
  try {
    if (!username) {
      return {
        success: false,
        error: "INVALID_INPUT",
      };
    }

    // Check cache first
    const cachedData = getCachedData(username);
    if (cachedData) {
      return {
        success: true,
        data: cachedData,
      };
    }

    const githubToken = process.env.GITHUB_TOKEN;

    // If no token, return error
    if (!githubToken) {
      console.log("❌ No GitHub token configured");
      return {
        success: false,
        error: "GITHUB_TOKEN_MISSING",
      };
    }

    // GitHub GraphQL query for last year of contributions
    const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                  contributionLevel
                }
              }
            }
          }
        }
      }
    `;

    console.log("🔍 Fetching GitHub data for:", username);

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${githubToken}`,
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
    });

    if (!response.ok) {
      console.error(
        "❌ GitHub API error:",
        response.status,
        response.statusText
      );
      return {
        success: false,
        error: "GITHUB_API_ERROR",
      };
    }

    const data = await response.json();

    if (data.errors || !data.data?.user) {
      console.error("❌ GitHub user not found or API errors:", data.errors);
      return {
        success: false,
        error: "GITHUB_USER_NOT_FOUND",
      };
    }

    // Parse GitHub response
    const calendar =
      data.data.user.contributionsCollection.contributionCalendar;
    const contributions: GitHubContribution[] = [];

    calendar.weeks.forEach((week: any) => {
      week.contributionDays.forEach((day: any) => {
        contributions.push({
          date: day.date,
          count: day.contributionCount,
          level: day.contributionLevel,
        });
      });
    });

    const githubData = {
      contributions,
      totalContributions: calendar.totalContributions,
    };

    console.log("✅ GitHub data fetched:", {
      totalContributions: calendar.totalContributions,
      daysWithData: contributions.length,
      sampleData: contributions.slice(0, 3),
    });

    // Cache the successful response
    setCachedData(username, githubData);

    return {
      success: true,
      data: githubData,
    };
  } catch (error) {
    console.error("❌ GitHub fetch error:", error);
    return {
      success: false,
      error: "GITHUB_FETCH_ERROR",
    };
  }
}

/**
 * Get user-friendly error message based on error type
 */
export function getGitHubErrorMessage(error: string): string {
  switch (error) {
    case "GITHUB_TOKEN_MISSING":
      return "GitHub integration is not configured. Please contact support.";
    case "GITHUB_API_ERROR":
      return "Unable to fetch GitHub data. GitHub API is currently unavailable.";
    case "GITHUB_USER_NOT_FOUND":
      return "GitHub username not found. Please check your GitHub username in settings.";
    case "GITHUB_FETCH_ERROR":
      return "Failed to fetch GitHub data. Please try again later.";
    default:
      return "Unable to load GitHub data at this time.";
  }
}

// Cursor rules applied correctly.
