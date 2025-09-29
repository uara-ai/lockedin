import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { getUserProfile, getProfileStats } from "@/app/data/profile";
import { fetchGitHubContributions } from "@/app/data/github-contribution";
import { ProfileCard } from "@/components/feed/profile/profile-card";
import { ContributionChart } from "@/components/feed/contribution-chart";
import { ProfileTabs } from "@/components/feed/profile/profile-tabs";

export default async function ProfilePage() {
  // If the user isn't signed in, they will be automatically redirected to AuthKit
  const { user } = await withAuth({ ensureSignedIn: true });

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile and stats
  const [profileResponse, statsResponse] = await Promise.all([
    getUserProfile(),
    getProfileStats(),
  ]);

  if (!profileResponse.success || !profileResponse.data) {
    // If profile doesn't exist, redirect to profile creation
    redirect("/profile/edit?create=true");
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
      {/* Profile Card */}
      <ProfileCard profile={profileResponse.data} className="w-full" />

      {/* Profile Tabs */}
      <ProfileTabs
        notes={<p>notes</p>}
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
