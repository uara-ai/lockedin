import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  // If the user isn't signed in, they will be automatically redirected to AuthKit
  const { user } = await withAuth({ ensureSignedIn: true });

  if (!user) {
    redirect("/login");
  }

  return <div>Profile</div>;
}
