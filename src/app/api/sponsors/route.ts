import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Fetch active sponsor subscriptions with user and startup data
    const sponsorSubscriptions = await prisma.sponsorSubscription.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            website: true,
          },
        },
        startup: {
          select: {
            id: true,
            name: true,
            slug: true,
            website: true,
            logo: true,
            tagline: true,
          },
        },
      },
      orderBy: [{ priorityOrder: "asc" }, { createdAt: "desc" }],
    });

    // Transform data for the frontend
    const sponsors = sponsorSubscriptions.map((subscription) => {
      const user = subscription.user;
      const startup = subscription.startup;

      // Use startup data if available, otherwise use user data
      const displayName =
        startup?.name || user.name || user.username || "Anonymous";
      const website = startup?.website || user.website || "#";
      const logo = startup?.logo || user.avatar;

      return {
        id: subscription.id,
        name: displayName,
        logo: displayName.substring(0, 2).toUpperCase(),
        logoUrl: logo,
        tier: subscription.customBadge || `${subscription.planType} Sponsor`,
        url: website,
        planType: subscription.planType,
        customBadge: subscription.customBadge,
        // Startup-specific data
        startupId: startup?.id,
        startupSlug: startup?.slug,
        startupName: startup?.name,
        startupWebsite: startup?.website,
        startupLogo: startup?.logo,
        startupTagline: startup?.tagline,
      };
    });

    return NextResponse.json({
      sponsors,
      count: sponsors.length,
    });
  } catch (error) {
    console.error("Error fetching sponsors:", error);
    return NextResponse.json(
      { error: "Failed to fetch sponsors" },
      { status: 500 }
    );
  }
}
