import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./settings-client";

interface SubscriptionData {
  id: string;
  planType: string;
  status: string;
  customBadge?: string;
  createdAt: string;
  startup?: {
    name: string;
    slug: string;
  };
}

export default async function SettingsPage() {
  // If the user isn't signed in, they will be automatically redirected to AuthKit
  const { user } = await withAuth({ ensureSignedIn: true });

  if (!user) {
    redirect("/login");
  }

  // Fetch user's sponsor subscriptions
  let subscriptions: SubscriptionData[] = [];
  try {
    const userSubscriptions = await prisma.sponsorSubscription.findMany({
      where: {
        user: {
          email: user.email,
        },
      },
      include: {
        startup: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    subscriptions = userSubscriptions.map((sub) => ({
      id: sub.id,
      planType: sub.planType,
      status: sub.status,
      customBadge: sub.customBadge || undefined,
      createdAt: sub.createdAt.toISOString(),
      startup: sub.startup
        ? {
            name: sub.startup.name,
            slug: sub.startup.slug,
          }
        : undefined,
    }));
  } catch (error) {
    console.error("Failed to fetch subscriptions:", error);
  }

  return <SettingsClient user={user} subscriptions={subscriptions} />;
}
