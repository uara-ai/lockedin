import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { getUserProfile, getProfileStats } from "@/app/data/profile";
import { fetchGitHubContributions } from "@/app/data/github-contribution";
import { getPostsByUser } from "@/app/data/posts";
import { ProfileCard } from "@/components/feed/profile/profile-card";
import { ContributionChart } from "@/components/feed/contribution-chart";
import { ProfileTabs } from "@/components/feed/profile/profile-tabs";
import { PostCard } from "@/components/feed/post-card";

export default async function ProfilePage() {
  // If the user isn't signed in, they will be automatically redirected to AuthKit
  const { user } = await withAuth({ ensureSignedIn: true });

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile, stats, and posts
  const [profileResponse, statsResponse, postsResponse] = await Promise.all([
    getUserProfile(),
    getProfileStats(),
    getPostsByUser(user.id, 20, 0),
  ]);

  if (!profileResponse.success || !profileResponse.data) {
    // If profile doesn't exist, redirect to profile creation
    redirect("/profile/edit?create=true");
  }

  // Fetch GitHub contributions if user has GitHub username
  let githubContributions = null;
  let githubError = null;
  let githubLoading = false;

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
      {/* Profile Card */}
      <ProfileCard profile={profileResponse.data} className="w-full" />

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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No posts yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Share your first post to get started on your builder journey!
                </p>
              </div>
            )}
          </div>
        }
        stats={
          <div className="space-y-4">
            {/* GitHub Contribution Chart */}
            {profileResponse.data.githubUsername ? (
              <ContributionChart
                contributions={githubContributions || []}
                loading={githubLoading}
                error={githubError}
                className="w-full"
              />
            ) : (
              <div className="bg-card border rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">No GitHub Data</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your GitHub account to see contribution statistics
                </p>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
                  Connect GitHub
                </button>
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}

// Cursor rules applied correctly.
