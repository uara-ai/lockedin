import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { getUserProfile, getProfileStats } from "@/app/data/profile";
import { ProfileCard } from "@/components/feed/profile/profile-card";
import { ProfileStats } from "@/components/feed/profile/profile-stats";

export default async function ProfilePage() {
  // If the user isn't signed in, they will be automatically redirected to AuthKit
  const { user } = await withAuth({ ensureSignedIn: true });

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile and stats (optimized for PWA)
  const [profileResponse, statsResponse] = await Promise.all([
    getUserProfile(), // Uses authenticated user by default
    getProfileStats(), // Uses authenticated user by default
  ]);

  if (!profileResponse.success || !profileResponse.data) {
    // If profile doesn't exist, redirect to profile creation
    redirect("/profile/edit?create=true");
  }

  return (
    <div className="w-full flex flex-col gap-6 p-4">
      {/* Profile Card */}
      <ProfileCard profile={profileResponse.data} className="w-full" />

      {/* Stats Card 
      {statsResponse.success && statsResponse.data && (
        <ProfileStats className="w-full max-w-md" />
      )}*/}
    </div>
  );
}
