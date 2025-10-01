// portal/route.ts
import { CustomerPortal } from "@polar-sh/nextjs";
import { NextRequest } from "next/server";

// Validate environment variables
if (!process.env.POLAR_ACCESS_TOKEN) {
  throw new Error("POLAR_ACCESS_TOKEN environment variable is required");
}

export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN || "",
  getCustomerId: (req: NextRequest) => Promise.resolve(""), // Function to resolve a Polar Customer ID
  server: process.env.NODE_ENV === "production" ? "production" : "sandbox",
});
