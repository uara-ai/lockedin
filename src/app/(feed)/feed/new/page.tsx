import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/app/data/profile";
import { NewPostClient } from "./new-post-client";

export default async function NewPostPage() {
  // Ensure user is authenticated
  const { user } = await withAuth({ ensureSignedIn: true });

  if (!user) {
    redirect("/login");
  }

  // Check if user has set their username
  const profileResponse = await getUserProfile();

  if (
    !profileResponse.success ||
    !profileResponse.data ||
    !profileResponse.data.username
  ) {
    // Redirect to profile edit if username is not set
    redirect("/profile/edit?create=true");
  }

  return <NewPostClient />;
}
