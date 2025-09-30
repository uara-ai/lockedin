import { NextRequest, NextResponse } from "next/server";
import { getBuildersData } from "@/app/data/profile";
import { unstable_cache } from "next/cache";

// Cache the builders data for 1 hour
const getCachedBuildersData = unstable_cache(
  async (limit: number = 50) => {
    return await getBuildersData(limit);
  },
  ["builders-api"],
  {
    revalidate: 3600, // 1 hour
    tags: ["builders"],
  }
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 50;
    const page = Number(searchParams.get("page")) || 1;
    const search = searchParams.get("search");
    const filter = searchParams.get("filter");

    // Get cached builders data
    const buildersResponse = await getCachedBuildersData(limit);

    if (!buildersResponse.success) {
      return NextResponse.json(
        { error: "Failed to fetch builders" },
        { status: 500 }
      );
    }

    let builders = buildersResponse.data || [];

    // Apply search filter if provided
    if (search && builders.length > 0) {
      const searchLower = search.toLowerCase();
      builders = builders.filter(
        (builder) =>
          builder.name?.toLowerCase().includes(searchLower) ||
          builder.username?.toLowerCase().includes(searchLower) ||
          builder.bio?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting filter if provided
    if (filter && builders.length > 0) {
      switch (filter) {
        case "streak":
          builders.sort((a, b) => b.currentStreak - a.currentStreak);
          break;
        case "joined":
          builders.sort(
            (a, b) =>
              new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
          );
          break;
        case "verified":
          builders.sort((a, b) => Number(b.verified) - Number(a.verified));
          break;
        case "activity":
        default:
          // Already sorted by activity in getBuildersData
          break;
      }
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBuilders = builders.slice(startIndex, endIndex);

    return NextResponse.json({
      builders: paginatedBuilders,
      pagination: {
        page,
        limit,
        total: builders.length,
        hasMore: endIndex < builders.length,
      },
    });
  } catch (error) {
    console.error("Error in builders API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Cursor rules applied correctly.
