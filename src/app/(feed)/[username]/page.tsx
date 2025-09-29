import { notFound } from "next/navigation";
import { getPublicProfile, getProfileStats } from "@/app/data/profile";
import { fetchGitHubContributions } from "@/app/data/github-contribution";
import { ProfileCard } from "@/components/feed/profile/public/profile-card";
import { ProfileStats } from "@/components/feed/profile/profile-stats";
import { ContributionChart } from "@/components/feed/contribution-chart";
import { ProfileTabs } from "@/components/feed/profile/profile-tabs";

interface UserProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function UserProfilePage({
  params,
}: UserProfilePageProps) {
  const { username } = await params;

  // Fetch public profile data by username
  const [profileResponse, statsResponse] = await Promise.all([
    getPublicProfile(username),
    getProfileStats(undefined, username),
  ]);

  if (!profileResponse.success || !profileResponse.data) {
    notFound();
  }

  // Fetch GitHub contributions if user has GitHub username
  let githubContributions = null;
  if (profileResponse.data.githubUsername) {
    const githubResponse = await fetchGitHubContributions(
      profileResponse.data.githubUsername
    );
    if (githubResponse.success && githubResponse.data) {
      githubContributions = githubResponse.data.contributions;
    }
  }

  return (
    <div className="w-full flex flex-col gap-6 p-4">
      {/* Public Profile Card */}
      <ProfileCard
        profile={profileResponse.data}
        isPublic={true}
        className="w-full"
      />

      {/* Profile Tabs */}
      <ProfileTabs
        notes={
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">About</h3>
            <div className="bg-card border rounded-lg p-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Bio
                  </label>
                  <p className="text-sm">
                    {profileResponse.data.bio || "No bio added"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Location
                  </label>
                  <p className="text-sm">
                    {profileResponse.data.location || "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Website
                  </label>
                  <p className="text-sm">
                    {profileResponse.data.website || "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        }
        stats={
          <div className="space-y-4">
            {/* GitHub Contribution Chart */}
            {profileResponse.data.githubUsername && githubContributions ? (
              <ContributionChart
                contributions={githubContributions}
                className="w-full"
              />
            ) : (
              <div className="bg-card border rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">No GitHub Data</h3>
                <p className="text-sm text-muted-foreground">
                  This user hasn&apos;t connected their GitHub account
                </p>
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: UserProfilePageProps) {
  const { username } = await params;

  const profileResponse = await getPublicProfile(username);

  if (!profileResponse.success || !profileResponse.data) {
    return {
      title: "Profile Not Found | LockedIn",
    };
  }

  const profile = profileResponse.data;

  return {
    title: `${profile.name || profile.username} (@${
      profile.username
    }) | LockedIn`,
    description:
      profile.bio ||
      `Check out ${
        profile.name || profile.username
      }'s builder journey on LockedIn`,
    openGraph: {
      title: `${profile.name || profile.username} on LockedIn`,
      description:
        profile.bio ||
        `Building consistently with ${profile.currentStreak} day streak`,
      images: profile.avatar ? [profile.avatar] : [],
    },
    twitter: {
      card: "summary",
      title: `${profile.name || profile.username} on LockedIn`,
      description: profile.bio || `🔥 ${profile.currentStreak} day streak`,
      images: profile.avatar ? [profile.avatar] : [],
    },
  };
}

// Cursor rules applied correctly.
