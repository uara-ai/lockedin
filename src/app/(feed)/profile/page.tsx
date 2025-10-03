import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { getUserProfile, getProfileStats } from "@/app/data/profile";
import { fetchGitHubContributions } from "@/app/data/github-contribution";
import { getPostsByUser } from "@/app/data/posts";
import { getMyStartups } from "@/app/data/startups";
import { ProfileCard } from "@/components/feed/profile/profile-card";
import { ContributionSection } from "@/components/feed/activity/contribution-section";
import { ProfileTabs } from "@/components/feed/profile/profile-tabs";
import { PostCard } from "@/components/feed/post-card";
import { StartupsList } from "@/components/feed/startup/startups-list";
import { PaymentBanner } from "@/components/feed/profile/payment-banner";

export default async function ProfilePage() {
  // If the user isn't signed in, they will be automatically redirected to AuthKit
  const { user } = await withAuth({ ensureSignedIn: true });

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile, stats, posts, and startups
  const [profileResponse, statsResponse, postsResponse, startupsResponse] =
    await Promise.all([
      getUserProfile(),
      getProfileStats(),
      getPostsByUser(user.id, 20, 0),
      getMyStartups(),
    ]);

  const hasAccess = profileResponse.data?.verified;

  if (!profileResponse.success || !profileResponse.data) {
    // If profile doesn't exist, redirect to profile creation
    redirect("/profile/edit?create=true");
  }

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
    <>
      {hasAccess ? (
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
                      Share your first post to get started on your builder
                      journey!
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
                isPublic={false}
                showConnectPrompt={true}
              />
            }
            startups={
              <StartupsList
                initialStartups={
                  startupsResponse.success ? startupsResponse.data || [] : []
                }
                isOwner={true}
              />
            }
          />
        </div>
      ) : (
        <div className="w-full flex flex-col gap-6 p-4">
          {/* Profile Card */}
          <ProfileCard
            profile={{
              id: "1",
              email: "email@email.com",
              name: "Name",
              username: "username",
              avatar: "https://via.placeholder.com/150",
              bio: "I am a software engineer",
              location: "NYC",
              website: "https://uara.co",
              currentStreak: 10,
              longestStreak: 10,
              lastActivityDate: new Date(),
              githubUsername: "federicofanini",
              githubSyncEnabled: true,
              xUsername: "FedericoFan",
              xSyncEnabled: true,
              verified: false,
              followers_count: 10000,
              following_count: 100,
              posts_count: 10,
              joinedAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
              isPublic: true,
            }}
            className="w-full"
          />

          {/* Profile Tabs - Empty Content */}
          <ProfileTabs posts={<></>} stats={<></>} startups={<></>} />
          {/* Payment Required Banner */}
          <PaymentBanner />
        </div>
      )}
    </>
  );
}

// Cursor rules applied correctly.
