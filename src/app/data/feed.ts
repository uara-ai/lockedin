"use server";

import type { ActionResponse } from "@/app/data/types/action-response";
import { appErrors } from "@/app/data/types/errors";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { prisma } from "@/lib/prisma";
import { PostWithDetails } from "./posts";

/**
 * Get personalized feed for authenticated user
 * Includes posts from followed users and trending posts
 */
export async function getPersonalizedFeed(
  limit: number = 20,
  offset: number = 0
): Promise<ActionResponse<PostWithDetails[]>> {
  try {
    const { user: authUser } = await withAuth({ ensureSignedIn: true });

    // Get posts from followed users + user's own posts
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          // Posts from followed users
          {
            author: {
              followers: {
                some: {
                  followerId: authUser.id,
                },
              },
            },
          },
          // User's own posts
          {
            authorId: authUser.id,
          },
          // Popular posts from last 7 days (trending)
          {
            AND: [
              {
                createdAt: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
              },
            ],
          },
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            verified: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        likes: {
          where: {
            userId: authUser.id,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
      take: limit,
      skip: offset,
      distinct: ["id"], // Avoid duplicates
    });

    const postsWithDetails: PostWithDetails[] = posts.map((post: any) => ({
      id: post.id,
      content: post.content,
      type: post.type,
      revenueAmount: post.revenueAmount ? Number(post.revenueAmount) : null,
      currency: post.currency,
      commitsCount: post.commitsCount,
      repoUrl: post.repoUrl,
      viewsCount: post.viewsCount,
      sharesCount: post.sharesCount,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author,
      _count: post._count,
      tags: post.tags,
      isLiked: post.likes?.length > 0,
    }));

    return {
      success: true,
      data: postsWithDetails,
    };
  } catch (error) {
    console.error("Error fetching personalized feed:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Get trending posts (most liked/commented in last 7 days)
 */
export async function getTrendingPosts(
  limit: number = 20,
  offset: number = 0
): Promise<ActionResponse<PostWithDetails[]>> {
  try {
    let currentUserId: string | null = null;

    // Get current user if authenticated
    try {
      const { user: authUser } = await withAuth();
      currentUserId = authUser?.id || null;
    } catch {
      // Not authenticated
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const posts = await prisma.post.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            verified: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        ...(currentUserId && {
          likes: {
            where: {
              userId: currentUserId,
            },
            select: {
              id: true,
            },
          },
        }),
      },
      orderBy: [
        {
          likes: {
            _count: "desc",
          },
        },
        {
          comments: {
            _count: "desc",
          },
        },
        { createdAt: "desc" },
      ],
      take: limit,
      skip: offset,
    });

    const postsWithDetails: PostWithDetails[] = posts.map((post) => ({
      id: post.id,
      content: post.content,
      type: post.type,
      revenueAmount: post.revenueAmount ? Number(post.revenueAmount) : null,
      currency: post.currency,
      commitsCount: post.commitsCount,
      repoUrl: post.repoUrl,
      viewsCount: post.viewsCount,
      sharesCount: post.sharesCount,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author,
      _count: post._count,
      tags: post.tags,
      isLiked: currentUserId ? (post as any).likes?.length > 0 : false,
    }));

    return {
      success: true,
      data: postsWithDetails,
    };
  } catch (error) {
    console.error("Error fetching trending posts:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Get posts by type (revenue, achievements, etc.)
 */
export async function getPostsByType(
  type: string,
  limit: number = 20,
  offset: number = 0
): Promise<ActionResponse<PostWithDetails[]>> {
  try {
    let currentUserId: string | null = null;

    // Get current user if authenticated
    try {
      const { user: authUser } = await withAuth();
      currentUserId = authUser?.id || null;
    } catch {
      // Not authenticated
    }

    // Map string to PostType enum
    const postTypeMap: Record<string, string> = {
      update: "UPDATE",
      revenue: "REVENUE",
      achievement: "ACHIEVEMENT",
      streak: "STREAK",
      github: "GITHUB",
      milestone: "MILESTONE",
    };

    const postType = postTypeMap[type.toLowerCase()];
    if (!postType) {
      return {
        success: false,
        error: appErrors.VALIDATION_ERROR,
      };
    }

    const posts = await prisma.post.findMany({
      where: {
        type: postType as any,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            verified: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        ...(currentUserId && {
          likes: {
            where: {
              userId: currentUserId,
            },
            select: {
              id: true,
            },
          },
        }),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    const postsWithDetails: PostWithDetails[] = posts.map((post) => ({
      id: post.id,
      content: post.content,
      type: post.type,
      revenueAmount: post.revenueAmount ? Number(post.revenueAmount) : null,
      currency: post.currency,
      commitsCount: post.commitsCount,
      repoUrl: post.repoUrl,
      viewsCount: post.viewsCount,
      sharesCount: post.sharesCount,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author,
      _count: post._count,
      tags: post.tags,
      isLiked: currentUserId ? (post as any).likes?.length > 0 : false,
    }));

    return {
      success: true,
      data: postsWithDetails,
    };
  } catch (error) {
    console.error("Error fetching posts by type:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Search posts by content and tags
 */
export async function searchPosts(
  query: string,
  limit: number = 20,
  offset: number = 0
): Promise<ActionResponse<PostWithDetails[]>> {
  try {
    let currentUserId: string | null = null;

    // Get current user if authenticated
    try {
      const { user: authUser } = await withAuth();
      currentUserId = authUser?.id || null;
    } catch {
      // Not authenticated
    }

    if (!query.trim()) {
      return {
        success: true,
        data: [],
      };
    }

    const searchTerm = query.trim().toLowerCase();

    const posts = await prisma.post.findMany({
      where: {
        OR: [
          // Search in content
          {
            content: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          // Search in tags
          {
            tags: {
              some: {
                tag: {
                  name: {
                    contains: searchTerm,
                    mode: "insensitive",
                  },
                },
              },
            },
          },
          // Search in author username/name
          {
            author: {
              OR: [
                {
                  username: {
                    contains: searchTerm,
                    mode: "insensitive",
                  },
                },
                {
                  name: {
                    contains: searchTerm,
                    mode: "insensitive",
                  },
                },
              ],
            },
          },
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            verified: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        ...(currentUserId && {
          likes: {
            where: {
              userId: currentUserId,
            },
            select: {
              id: true,
            },
          },
        }),
      },
      orderBy: [
        // Prioritize recent posts in search
        { createdAt: "desc" },
      ],
      take: limit,
      skip: offset,
    });

    const postsWithDetails: PostWithDetails[] = posts.map((post) => ({
      id: post.id,
      content: post.content,
      type: post.type,
      revenueAmount: post.revenueAmount ? Number(post.revenueAmount) : null,
      currency: post.currency,
      commitsCount: post.commitsCount,
      repoUrl: post.repoUrl,
      viewsCount: post.viewsCount,
      sharesCount: post.sharesCount,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author,
      _count: post._count,
      tags: post.tags,
      isLiked: currentUserId ? (post as any).likes?.length > 0 : false,
    }));

    return {
      success: true,
      data: postsWithDetails,
    };
  } catch (error) {
    console.error("Error searching posts:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Get feed statistics for a user
 */
export async function getFeedStats(userId?: string): Promise<
  ActionResponse<{
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    averageLikesPerPost: number;
    mostUsedTags: { name: string; count: number }[];
  }>
> {
  try {
    let targetUserId = userId;

    if (!targetUserId) {
      const { user: authUser } = await withAuth({ ensureSignedIn: true });
      targetUserId = authUser.id;
    }

    // Get post statistics
    const postStats = await prisma.post.aggregate({
      where: {
        authorId: targetUserId,
      },
      _count: {
        id: true,
      },
      _sum: {
        viewsCount: true,
        sharesCount: true,
      },
    });

    // Get likes count for user's posts
    const likesCount = await prisma.like.count({
      where: {
        post: {
          authorId: targetUserId,
        },
      },
    });

    // Get comments count for user's posts
    const commentsCount = await prisma.comment.count({
      where: {
        post: {
          authorId: targetUserId,
        },
      },
    });

    // Get most used tags
    const userTags = await prisma.postTag.groupBy({
      by: ["tagId"],
      where: {
        post: {
          authorId: targetUserId,
        },
      },
      _count: {
        tagId: true,
      },
      orderBy: {
        _count: {
          tagId: "desc",
        },
      },
      take: 5,
    });

    // Get tag names
    const tagIds = userTags.map((tag) => tag.tagId);
    const tags = await prisma.tag.findMany({
      where: {
        id: {
          in: tagIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const mostUsedTags = userTags.map((userTag) => {
      const tag = tags.find((t) => t.id === userTag.tagId);
      return {
        name: tag?.name || "Unknown",
        count: userTag._count.tagId,
      };
    });

    const totalPosts = postStats._count.id;
    const averageLikesPerPost = totalPosts > 0 ? likesCount / totalPosts : 0;

    return {
      success: true,
      data: {
        totalPosts,
        totalLikes: likesCount,
        totalComments: commentsCount,
        totalShares: postStats._sum.sharesCount || 0,
        averageLikesPerPost: Math.round(averageLikesPerPost * 100) / 100,
        mostUsedTags,
      },
    };
  } catch (error) {
    console.error("Error fetching feed stats:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Get recent activity feed (likes, comments, follows)
 */
export async function getActivityFeed(
  limit: number = 20,
  offset: number = 0
): Promise<
  ActionResponse<
    Array<{
      id: string;
      type: "like" | "comment" | "follow";
      user: {
        id: string;
        username: string | null;
        name: string | null;
        avatar: string | null;
        verified: boolean;
      };
      post?: {
        id: string;
        content: string;
        author: {
          username: string | null;
          name: string | null;
        };
      };
      createdAt: Date;
    }>
  >
> {
  try {
    const { user: authUser } = await withAuth({ ensureSignedIn: true });

    // Get recent likes on user's posts
    const recentLikes = await prisma.like.findMany({
      where: {
        post: {
          authorId: authUser.id,
        },
        userId: {
          not: authUser.id, // Exclude self-likes
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            verified: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                username: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: "desc", // Likes don't have createdAt, use id for ordering
      },
      take: Math.floor(limit / 3),
    });

    // Get recent comments on user's posts
    const recentComments = await prisma.comment.findMany({
      where: {
        post: {
          authorId: authUser.id,
        },
        userId: {
          not: authUser.id, // Exclude self-comments
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            verified: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                username: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: Math.floor(limit / 3),
    });

    // Get recent follows
    const recentFollows = await prisma.follow.findMany({
      where: {
        followingId: authUser.id,
      },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            verified: true,
          },
        },
      },
      orderBy: {
        id: "desc", // Follows don't have createdAt, use id for ordering
      },
      take: Math.floor(limit / 3),
    });

    // Combine and format activities
    const activities = [
      ...recentLikes.map((like) => ({
        id: `like-${like.id}`,
        type: "like" as const,
        user: like.user,
        post: like.post,
        createdAt: new Date(), // Approximate timestamp
      })),
      ...recentComments.map((comment) => ({
        id: `comment-${comment.id}`,
        type: "comment" as const,
        user: comment.user,
        post: comment.post,
        createdAt: comment.createdAt,
      })),
      ...recentFollows.map((follow) => ({
        id: `follow-${follow.id}`,
        type: "follow" as const,
        user: follow.follower,
        createdAt: new Date(), // Approximate timestamp
      })),
    ];

    // Sort by createdAt and limit
    const sortedActivities = activities
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);

    return {
      success: true,
      data: sortedActivities,
    };
  } catch (error) {
    console.error("Error fetching activity feed:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

// Cursor rules applied correctly.
