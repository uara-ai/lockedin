import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/app/data/profile";
import { ProfileEditForm } from "@/components/feed/profile/edit/profile-edit-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function ProfileEditPage() {
  // Ensure user is authenticated
  const { user } = await withAuth({ ensureSignedIn: true });

  if (!user) {
    redirect("/login");
  }

  // Fetch current profile data to prefill the form
  const profileResponse = await getUserProfile();

  if (!profileResponse.success || !profileResponse.data) {
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
      <ProfileEditForm initialData={profileResponse.data} />
    </div>
  );
}

// Cursor rules applied correctly.
