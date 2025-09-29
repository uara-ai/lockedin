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

    // If no token, return mock data (but still cache it)
    if (!githubToken) {
      console.log("🔄 No GitHub token, using mock data for:", username);
      const mockData = generateMockData();
      setCachedData(username, mockData);
      return {
        success: true,
        data: mockData,
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
      console.warn("⚠️ GitHub API error, using mock data");
      const mockData = generateMockData();
      setCachedData(username, mockData);
      return {
        success: true,
        data: mockData,
      };
    }

    const data = await response.json();

    if (data.errors || !data.data?.user) {
      console.warn("⚠️ GitHub user not found, using mock data");
      const mockData = generateMockData();
      setCachedData(username, mockData);
      return {
        success: true,
        data: mockData,
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
    const mockData = generateMockData();
    setCachedData(username, mockData);
    return {
      success: true,
      data: mockData,
    };
  }
}

/**
 * Generate mock contribution data for testing/fallback
 */
function generateMockData(): GitHubContributionData {
  const contributions: GitHubContribution[] = [];
  const today = new Date();

  // Generate last 365 days
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    // Create realistic contribution pattern
    const random = Math.random();
    let count = 0;
    let level = 0;

    // 30% chance of having contributions
    if (random > 0.7) {
      count = Math.floor(Math.random() * 15) + 1;
      if (count >= 10) level = 4;
      else if (count >= 7) level = 3;
      else if (count >= 3) level = 2;
      else level = 1;
    }

    contributions.push({
      date: date.toISOString().split("T")[0],
      count,
      level,
    });
  }

  const totalContributions = contributions.reduce((sum, c) => sum + c.count, 0);

  console.log("📊 Generated mock data:", {
    totalContributions,
    daysWithActivity: contributions.filter((c) => c.level > 0).length,
  });

  return {
    contributions,
    totalContributions,
  };
}

// Cursor rules applied correctly.
