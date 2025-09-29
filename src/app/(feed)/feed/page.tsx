import { getAllPublicUsers, getPublicUsersCount } from "@/app/data/profile";
import { ProfileCard } from "@/components/feed/profile/public/profile-card";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Loading component for profile cards
function ProfileCardSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

// Loading grid for multiple skeletons
function FeedSkeleton() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Skeleton className="h-8 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
      <div className="flex flex-col w-full gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-full border rounded-lg">
            <ProfileCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}

async function FeedContent() {
  // Fetch public users and total count
  const [usersResponse, countResponse] = await Promise.all([
    getAllPublicUsers(50), // Get first 50 users
    getPublicUsersCount(),
  ]);

  if (!usersResponse.success || !usersResponse.data) {
    return (
      <div className="text-center py-12">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            No Builders Found
          </h2>
          <p className="text-muted-foreground">
            Be the first to join the LockedIn community!
          </p>
        </div>
      </div>
    );
  }

  const users = usersResponse.data;
  const totalUsers = countResponse.success
    ? countResponse.data!.count
    : users.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">LockedIn People</h1>
        <p className="text-muted-foreground">
          <span className="font-bold text-orange-500">{totalUsers}</span> people
          sharing their journey on LockedIn
        </p>
      </div>

      {/* Users Flex Layout */}
      <div className="flex flex-col w-full gap-6">
        {users.map((user) => (
          <div key={user.id} className="w-full border-b p-4">
            <ProfileCard profile={user} isPublic={true} className="w-full" />
          </div>
        ))}
      </div>

      {/* Load More Message */}
      {users.length >= 50 && totalUsers > 50 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Showing {users.length} of {totalUsers} builders
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            More builders coming soon! 🚀
          </p>
        </div>
      )}
    </div>
  );
}

export default function FeedPage() {
  return (
    <div className="w-full px-4 py-4">
      <Suspense fallback={<FeedSkeleton />}>
        <FeedContent />
      </Suspense>
    </div>
  );
}
