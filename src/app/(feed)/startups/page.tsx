import { getAllStartups } from "@/app/data/startups";
import { StartupsList } from "@/components/feed/startup/startups-list";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Metadata } from "next";

export const revalidate = 60 * 60; // 1 hour

export const metadata: Metadata = {
  title: "Startups - LockedIn",
  description: "Discover startups building the future",
  openGraph: {
    title: "Startups - LockedIn",
    description: "Discover startups building the future",
    type: "website",
    images: [
      {
        url: `${
          process.env.NEXT_PUBLIC_APP_URL || "https://lockedin.bio"
        }/lockedin.png`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Startups - LockedIn",
    description: "Discover startups building the future",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://lockedin.bio"
  ),
  robots: {
    index: true,
    follow: true,
  },
};

// Loading skeleton for the page
function StartupsPageSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="mb-4">
        <div className="font-mono text-xs mb-1 text-orange-500">Startups</div>
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-3 border rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-48" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main startups page component
async function StartupsPageContent() {
  const startupsResponse = await getAllStartups(1, 50); // Load first 50 startups

  if (!startupsResponse.success || !startupsResponse.data) {
    return (
      <div className="w-full space-y-4">
        <div className="mb-4">
          <div className="font-mono text-xs mb-1 text-orange-500">Startups</div>
          <div className="text-center py-12">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                Unable to Load Startups
              </h2>
              <p className="text-muted-foreground">
                {startupsResponse.error ||
                  "Something went wrong loading the startups"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { startups, total } = startupsResponse.data;

  return (
    <div className="w-full space-y-4">
      <div className="mb-4">
        <div className="font-mono text-xs mb-1 text-orange-500">
          Startups ({total})
        </div>
        <div className="text-sm text-muted-foreground mb-4">
          Discover{" "}
          <span className="text-orange-500 font-semibold">{total}</span> public
          startups building the future
        </div>
      </div>

      <StartupsList
        initialStartups={startups}
        isOwner={false}
        showCreateButton={false}
      />
    </div>
  );
}

// Main page component with Suspense
export default function StartupsPage() {
  return (
    <Suspense fallback={<StartupsPageSkeleton />}>
      <StartupsPageContent />
    </Suspense>
  );
}

// Generate metadata for SEO
export async function generateMetadata() {
  const startupsResponse = await getAllStartups(1, 1); // Just get count
  const total =
    startupsResponse.success && startupsResponse.data
      ? startupsResponse.data.total
      : 0;

  return {
    title: `Startups - LockedIn`,
    description: `Discover ${total} public startups building the future. Explore innovative companies, founders, and their journey on LockedIn.`,
    openGraph: {
      title: `Startups - LockedIn`,
      description: `Discover ${total} public startups building the future. Explore innovative companies, founders, and their journey on LockedIn.`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Startups - LockedIn`,
      description: `Discover ${total} public startups building the future. Explore innovative companies, founders, and their journey on LockedIn.`,
    },
  };
}

// Cursor rules applied correctly.
