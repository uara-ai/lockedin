import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/app/data/profile";
import { ProfileEditForm } from "@/components/feed/profile/edit/profile-edit-form";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileEditPageProps {
  searchParams: {
    create?: string;
  };
}

export default async function ProfileEditPage({
  searchParams,
}: ProfileEditPageProps) {
  // Ensure user is authenticated
  const { user } = await withAuth({ ensureSignedIn: true });

  if (!user) {
    redirect("/login");
  }

  const isCreating = searchParams.create === "true";

  // Fetch current profile data to prefill the form
  const profileResponse = await getUserProfile();

  // For creation mode, we still need basic user info even if profile doesn't exist
  if (!profileResponse.success || !profileResponse.data) {
    if (!isCreating) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Profile Not Found
            </h1>
            <p className="text-muted-foreground mb-4">
              Unable to load profile information.
            </p>
            <Button asChild>
              <Link href="/profile">Back to Profile</Link>
            </Button>
          </div>
        </div>
      );
    }

    // Create a minimal profile object for creation mode
    const emptyProfile = {
      id: user.id,
      email: user.email,
      username: null,
      name: user.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : null,
      bio: null,
      avatar: user.profilePictureUrl || null,
      website: null,
      location: null,
      joinedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: true,
      verified: false,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      githubUsername: null,
      githubSyncEnabled: true,
      xUsername: null,
      xSyncEnabled: true,
      followers_count: 0,
      following_count: 0,
      posts_count: 0,
    };

    return (
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <UserPlus className="size-4 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Complete Your Profile
            </h1>
            <p className="text-muted-foreground">
              Set up your LockedIn profile to get started
            </p>
          </div>
        </div>

        {/* Profile Creation Form */}
        <ProfileEditForm initialData={emptyProfile} isCreating={true} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href="/profile" className="flex items-center gap-2">
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
          <p className="text-muted-foreground">
            Update your profile information and settings
          </p>
        </div>
      </div>

      {/* Profile Edit Form */}
      <ProfileEditForm initialData={profileResponse.data} isCreating={false} />
    </div>
  );
}

// Cursor rules applied correctly.
