"use server";

import type { ActionResponse } from "@/app/data/types/action-response";
import { appErrors } from "@/app/data/types/errors";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

export interface FollowUser {
  id: string;
  username: string | null;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  verified: boolean;
  currentStreak: number;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
}

/**
 * Follow or unfollow a user
 */
export async function toggleFollow(
  targetUserId: string
): Promise<ActionResponse<{ isFollowing: boolean; followersCount: number }>> {
  try {
    const { user: authUser } = await withAuth({ ensureSignedIn: true });

    // Can't follow yourself
    if (authUser.id === targetUserId) {
      return {
        success: false,
        error: "You cannot follow yourself",
      };
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true },
    });

    if (!targetUser) {
      return {
        success: false,
        error: appErrors.NOT_FOUND,
      };
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: authUser.id,
          followingId: targetUserId,
        },
      },
    });

    let isFollowing: boolean;

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: { id: existingFollow.id },
      });
      isFollowing = false;
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId: authUser.id,
          followingId: targetUserId,
        },
      });
      isFollowing = true;
    }

    // Get updated followers count
    const followersCount = await prisma.follow.count({
      where: { followingId: targetUserId },
    });

    // Revalidate relevant paths
    revalidateTag(`user-${targetUserId}`);
    revalidateTag(`user-${authUser.id}`);
    revalidatePath("/feed");
    revalidatePath("/profile");

    return {
      success: true,
      data: { isFollowing, followersCount },
    };
  } catch (error) {
    console.error("Error toggling follow:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Get followers of a user
 */
export async function getFollowers(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<ActionResponse<FollowUser[]>> {
  try {
    let currentUserId: string | null = null;

    // Get current user if authenticated (to check follow status)
    try {
      const { user: authUser } = await withAuth();
      currentUserId = authUser?.id || null;
    } catch {
      // Not authenticated
    }

    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            bio: true,
            verified: true,
            currentStreak: true,
            _count: {
              select: {
                followers: true,
                following: true,
              },
            },
            ...(currentUserId && {
              followers: {
                where: {
                  followerId: currentUserId,
                },
                select: {
                  id: true,
                },
              },
            }),
          },
        },
      },
      orderBy: {
        id: "desc", // Most recent followers first
      },
      take: limit,
      skip: offset,
    });

    const followUsers: FollowUser[] = followers.map((follow) => ({
      id: follow.follower.id,
      username: follow.follower.username,
      name: follow.follower.name,
      avatar: follow.follower.avatar,
      bio: follow.follower.bio,
      verified: follow.follower.verified,
      currentStreak: follow.follower.currentStreak,
      followersCount: follow.follower._count.followers,
      followingCount: follow.follower._count.following,
      isFollowing: currentUserId
        ? (follow.follower as any).followers?.length > 0
        : undefined,
    }));

    return {
      success: true,
      data: followUsers,
    };
  } catch (error) {
    console.error("Error fetching followers:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Get users that a user is following
 */
export async function getFollowing(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<ActionResponse<FollowUser[]>> {
  try {
    let currentUserId: string | null = null;

    // Get current user if authenticated (to check follow status)
    try {
      const { user: authUser } = await withAuth();
      currentUserId = authUser?.id || null;
    } catch {
      // Not authenticated
    }

    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            bio: true,
            verified: true,
            currentStreak: true,
            _count: {
              select: {
                followers: true,
                following: true,
              },
            },
            ...(currentUserId && {
              followers: {
                where: {
                  followerId: currentUserId,
                },
                select: {
                  id: true,
                },
              },
            }),
          },
        },
      },
      orderBy: {
        id: "desc", // Most recently followed first
      },
      take: limit,
      skip: offset,
    });

    const followUsers: FollowUser[] = following.map((follow) => ({
      id: follow.following.id,
      username: follow.following.username,
      name: follow.following.name,
      avatar: follow.following.avatar,
      bio: follow.following.bio,
      verified: follow.following.verified,
      currentStreak: follow.following.currentStreak,
      followersCount: follow.following._count.followers,
      followingCount: follow.following._count.following,
      isFollowing: currentUserId
        ? (follow.following as any).followers?.length > 0
        : undefined,
    }));

    return {
      success: true,
      data: followUsers,
    };
  } catch (error) {
    console.error("Error fetching following:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Get suggested users to follow
 * Based on mutual connections and activity
 */
export async function getSuggestedUsers(
  limit: number = 10
): Promise<ActionResponse<FollowUser[]>> {
  try {
    const { user: authUser } = await withAuth({ ensureSignedIn: true });

    // Get users that the current user is not following
    // Prioritize verified users and those with high activity
    const suggestedUsers = await prisma.user.findMany({
      where: {
        AND: [
          // Not the current user
          { id: { not: authUser.id } },
          // Not already following
          {
            followers: {
              none: {
                followerId: authUser.id,
              },
            },
          },
          // Has username (active users)
          { username: { not: null } },
          // Public profile
          { isPublic: true },
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        bio: true,
        verified: true,
        currentStreak: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
      orderBy: [
        { verified: "desc" }, // Verified users first
        { currentStreak: "desc" }, // High streak users
        { createdAt: "desc" }, // Recent users
      ],
      take: limit * 2, // Get more to filter better suggestions
    });

    // Score users based on activity and mutual connections
    const scoredUsers = await Promise.all(
      suggestedUsers.map(async (user) => {
        // Get mutual followers count
        const mutualFollowers = await prisma.follow.count({
          where: {
            followingId: user.id,
            follower: {
              followers: {
                some: {
                  followerId: authUser.id,
                },
              },
            },
          },
        });

        // Calculate activity score
        const activityScore =
          user._count.posts * 2 + // Posts weight: 2
          user._count.followers * 1 + // Followers weight: 1
          user.currentStreak * 3 + // Streak weight: 3
          (user.verified ? 50 : 0) + // Verified bonus: 50
          mutualFollowers * 10; // Mutual followers weight: 10

        return {
          ...user,
          activityScore,
          mutualFollowers,
        };
      })
    );

    // Sort by activity score and take top results
    const topSuggestions = scoredUsers
      .sort((a, b) => b.activityScore - a.activityScore)
      .slice(0, limit);

    const followUsers: FollowUser[] = topSuggestions.map((user) => ({
      id: user.id,
      username: user.username,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      verified: user.verified,
      currentStreak: user.currentStreak,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      isFollowing: false, // These are users not being followed
    }));

    return {
      success: true,
      data: followUsers,
    };
  } catch (error) {
    console.error("Error fetching suggested users:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Check if current user is following a specific user
 */
export async function checkFollowStatus(
  targetUserId: string
): Promise<ActionResponse<{ isFollowing: boolean }>> {
  try {
    const { user: authUser } = await withAuth({ ensureSignedIn: true });

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: authUser.id,
          followingId: targetUserId,
        },
      },
    });

    return {
      success: true,
      data: { isFollowing: !!existingFollow },
    };
  } catch (error) {
    console.error("Error checking follow status:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Get follow statistics for a user
 */
export async function getFollowStats(userId: string): Promise<
  ActionResponse<{
    followersCount: number;
    followingCount: number;
    mutualFollowsCount: number;
  }>
> {
  try {
    let currentUserId: string | null = null;

    // Get current user if authenticated (for mutual follows)
    try {
      const { user: authUser } = await withAuth();
      currentUserId = authUser?.id || null;
    } catch {
      // Not authenticated
    }

    // Get followers and following counts
    const [followersCount, followingCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.follow.count({ where: { followerId: userId } }),
    ]);

    let mutualFollowsCount = 0;

    // Calculate mutual follows if user is authenticated
    if (currentUserId && currentUserId !== userId) {
      mutualFollowsCount = await prisma.follow.count({
        where: {
          followerId: userId,
          following: {
            followers: {
              some: {
                followerId: currentUserId,
              },
            },
          },
        },
      });
    }

    return {
      success: true,
      data: {
        followersCount,
        followingCount,
        mutualFollowsCount,
      },
    };
  } catch (error) {
    console.error("Error fetching follow stats:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Get mutual followers between current user and target user
 */
export async function getMutualFollowers(
  targetUserId: string,
  limit: number = 10
): Promise<ActionResponse<FollowUser[]>> {
  try {
    const { user: authUser } = await withAuth({ ensureSignedIn: true });

    if (authUser.id === targetUserId) {
      return {
        success: true,
        data: [],
      };
    }

    // Find users who follow both current user and target user
    const mutualFollowers = await prisma.user.findMany({
      where: {
        AND: [
          // Follows current user
          {
            following: {
              some: {
                followingId: authUser.id,
              },
            },
          },
          // Follows target user
          {
            following: {
              some: {
                followingId: targetUserId,
              },
            },
          },
          // Not current user or target user
          {
            id: {
              notIn: [authUser.id, targetUserId],
            },
          },
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        bio: true,
        verified: true,
        currentStreak: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
      take: limit,
    });

    const followUsers: FollowUser[] = mutualFollowers.map((user) => ({
      id: user.id,
      username: user.username,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      verified: user.verified,
      currentStreak: user.currentStreak,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      isFollowing: true, // These are mutual followers
    }));

    return {
      success: true,
      data: followUsers,
    };
  } catch (error) {
    console.error("Error fetching mutual followers:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

// Cursor rules applied correctly.
