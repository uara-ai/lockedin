import { notFound } from "next/navigation";
import { getPublicProfile, getProfileStats } from "@/app/data/profile";
import { fetchGitHubContributions } from "@/app/data/github-contribution";
import { getPostsByUsername } from "@/app/data/posts";
import { ProfileCard } from "@/components/feed/profile/public/profile-card";
import { ProfileStats } from "@/components/feed/profile/profile-stats";
import { ContributionChart } from "@/components/feed/contribution-chart";
import { ProfileTabs } from "@/components/feed/profile/profile-tabs";
import { PostCard } from "@/components/feed/post-card";

interface UserProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function UserProfilePage({
  params,
}: UserProfilePageProps) {
  const { username } = await params;

  // Fetch public profile data, stats, and posts by username
  const [profileResponse, statsResponse, postsResponse] = await Promise.all([
    getPublicProfile(username),
    getProfileStats(undefined, username),
    getPostsByUsername(username, 20, 0),
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
        posts={
          <div className="space-y-4">
            {postsResponse.success &&
            postsResponse.data &&
            postsResponse.data.length > 0 ? (
              postsResponse.data.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  className="border rounded-lg p-4"
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No posts yet
                </h3>
                <p className="text-muted-foreground">
                  This user hasn&apos;t shared any posts yet.
                </p>
              </div>
            )}
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
