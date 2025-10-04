import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://commodo.io";

  // Static routes with their priorities and update frequencies
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/feed`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/featured`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/startups`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/apply`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  try {
    // Get all public users with usernames for dynamic profile routes
    const publicUsers = await prisma.user.findMany({
      where: {
        isPublic: true,
        username: {
          not: null,
        },
      },
      select: {
        username: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Generate user profile URLs
    const userRoutes: MetadataRoute.Sitemap = publicUsers.map((user) => ({
      url: `${baseUrl}/${user.username}`,
      lastModified: user.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));

    // Get all posts for individual post pages
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        updatedAt: true,
        author: {
          select: {
            isPublic: true,
          },
        },
      },
      where: {
        author: {
          isPublic: true,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Generate post URLs
    const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${baseUrl}/post/${post.id}`,
      lastModified: post.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));

    // Get all public startups for individual startup pages
    const startups = await prisma.startup.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
      where: {
        isPublic: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Generate startup URLs
    const startupRoutes: MetadataRoute.Sitemap = startups.map((startup) => ({
      url: `${baseUrl}/startups/${startup.slug}`,
      lastModified: startup.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));

    // Get all unique tags for potential tag pages (if you have them)
    const tags = await prisma.tag.findMany({
      select: {
        name: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
      where: {
        posts: {
          some: {
            post: {
              author: {
                isPublic: true,
              },
            },
          },
        },
      },
      orderBy: {
        posts: {
          _count: "desc",
        },
      },
    });

    // Generate tag URLs (if you implement tag pages in the future)
    const tagRoutes: MetadataRoute.Sitemap = tags.map((tag) => ({
      url: `${baseUrl}/tag/${encodeURIComponent(tag.name)}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));

    // Combine all routes
    return [
      ...staticRoutes,
      ...userRoutes,
      ...postRoutes,
      ...startupRoutes,
      // Uncomment when tag pages are implemented
      // ...tagRoutes,
    ];
  } catch (error) {
    console.error("Error generating sitemap:", error);

    // Return static routes as fallback
    return staticRoutes;
  }
}

// Cursor rules applied correctly.
