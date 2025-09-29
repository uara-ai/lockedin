import { notFound } from "next/navigation";
import { getPublicProfile, getProfileStats } from "@/app/data/profile";
import { fetchGitHubContributions } from "@/app/data/github-contribution";
import { ProfileCard } from "@/components/feed/profile/public/profile-card";
import { ProfileStats } from "@/components/feed/profile/profile-stats";
import { ContributionChart } from "@/components/feed/contribution-chart";

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
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto">
        <div className="flex flex-col gap-6">
          {/* Public Profile Card */}
          <div className="lg:col-span-1">
            <ProfileCard profile={profileResponse.data} isPublic={true} />
          </div>

          {/* GitHub Contribution Chart */}
          {profileResponse.data.githubUsername && githubContributions && (
            <ContributionChart
              contributions={githubContributions}
              className="w-full"
            />
          )}
        </div>
      </div>
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
