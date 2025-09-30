import { notFound } from "next/navigation";
import { getPublicProfile, getProfileStats } from "@/app/data/profile";
import { fetchGitHubContributions } from "@/app/data/github-contribution";
import { getPostsByUsername } from "@/app/data/posts";
import { getStartupsByUser } from "@/app/data/startups";
import { ProfileCard } from "@/components/feed/profile/public/profile-card";
import { ContributionSection } from "@/components/feed/activity/contribution-section";
import { ProfileTabs } from "@/components/feed/profile/profile-tabs";
import { PostCard } from "@/components/feed/post-card";
import { StartupsList } from "@/components/feed/startup/startups-list";

interface UserProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function UserProfilePage({
  params,
}: UserProfilePageProps) {
  const { username } = await params;

  // Fetch public profile data first
  const profileResponse = await getPublicProfile(username);

  if (!profileResponse.success || !profileResponse.data) {
    notFound();
  }

  // Then fetch other data in parallel using the user ID
  const [statsResponse, postsResponse, startupsResponse] = await Promise.all([
    getProfileStats(undefined, username),
    getPostsByUsername(username, 20, 0),
    getStartupsByUser(profileResponse.data.id),
  ]);

  // Fetch GitHub contributions if user has GitHub username
  let githubContributions = null;
  let githubError = null;
  const githubLoading = false;

  if (profileResponse.data.githubUsername) {
    const githubResponse = await fetchGitHubContributions(
      profileResponse.data.githubUsername
    );
    if (githubResponse.success && githubResponse.data) {
      githubContributions = githubResponse.data.contributions;
    } else {
      githubError = githubResponse.error || "UNKNOWN_ERROR";
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
          <ContributionSection
            contributions={githubContributions}
            loading={githubLoading}
            error={githubError}
            isPublic={true}
            showConnectPrompt={false}
          />
        }
        startups={
          <StartupsList
            initialStartups={
              startupsResponse.success ? startupsResponse.data || [] : []
            }
            isOwner={false}
          />
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
