// portal/route.ts
import { CustomerPortal } from "@polar-sh/nextjs";
import { NextRequest } from "next/server";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { prisma } from "@/lib/prisma";

// Validate environment variables
if (!process.env.POLAR_ACCESS_TOKEN) {
  throw new Error("POLAR_ACCESS_TOKEN environment variable is required");
}

// Create a wrapper function that handles authentication
async function handleCustomerPortal(req: NextRequest) {
  try {
    // Get authenticated user
    const { user } = await withAuth({ ensureSignedIn: true });

    if (!user?.email) {
      return new Response("Authentication required", { status: 401 });
    }

    // Find user in database with their sponsor subscriptions
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: {
        id: true,
        email: true,
        sponsorSubscriptions: {
          select: {
            polarCustomerId: true,
            status: true,
          },
          where: {
            status: "ACTIVE",
          },
          take: 1,
        },
      },
    });

    if (!dbUser) {
      return new Response("User not found", { status: 404 });
    }

    // Get the Polar customer ID from the user's active subscription
    const polarCustomerId = dbUser.sponsorSubscriptions[0]?.polarCustomerId;

    if (!polarCustomerId) {
      // Redirect to sponsor page instead of showing an error
      return Response.redirect(new URL("/sponsor", req.url));
    }

    // Create CustomerPortal with the actual Polar customer ID
    const portal = CustomerPortal({
      accessToken: process.env.POLAR_ACCESS_TOKEN || "",
      getCustomerId: () => Promise.resolve(polarCustomerId),
      server: process.env.NODE_ENV === "production" ? "production" : "sandbox",
    });

    return portal(req);
  } catch (error) {
    console.error("Error in customer portal:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

export const GET = handleCustomerPortal;
