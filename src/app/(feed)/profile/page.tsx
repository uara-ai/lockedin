import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { getUserProfile, getProfileStats } from "@/app/data/profile";
import { fetchGitHubContributions } from "@/app/data/github-contribution";
import { ProfileCard } from "@/components/feed/profile/profile-card";
import { ProfileStats } from "@/components/feed/profile/profile-stats";
import { ContributionChart } from "@/components/feed/contribution-chart";

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

      {/* GitHub Contribution Chart */}
      {profileResponse.data.githubUsername && githubContributions && (
        <ContributionChart
          contributions={githubContributions}
          className="w-full"
        />
      )}

      {/* Stats Card - commented out for now
      {statsResponse.success && statsResponse.data && (
        <ProfileStats className="w-full max-w-md" />
      )}*/}
    </div>
  );
}

// Cursor rules applied correctly.
